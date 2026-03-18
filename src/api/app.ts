import express from "express";
import { google } from "googleapis";
import Sentiment from "sentiment";
import dotenv from "dotenv";
import Stripe from "stripe";

dotenv.config();

export const app = express();
const sentiment = new Sentiment();

const stripe = (() => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (key.startsWith('pk_')) {
    console.error("CRITICAL: STRIPE_SECRET_KEY starts with 'pk_'. You are using a Publishable Key where a Secret Key (sk_) is required.");
    return null;
  }
  return new Stripe(key);
})();

const getYoutubeClient = () => {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error("YOUTUBE_API_KEY is missing. Please add it to your environment variables.");
  }
  return google.youtube({
    version: "v3",
    auth: apiKey,
  });
};

app.use(express.json());

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", environment: process.env.NETLIFY ? "netlify" : "local" });
});

app.get("/api/video-info", async (req, res) => {
  const { videoId } = req.query;

  if (!videoId || typeof videoId !== "string") {
    return res.status(400).json({ error: "Video ID is required" });
  }

  try {
    const youtube = getYoutubeClient();
    const response = await youtube.videos.list({
      part: ["snippet", "statistics"],
      id: [videoId],
    });

    const video = response.data.items?.[0];
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    res.json({
      title: video.snippet?.title,
      commentCount: video.statistics?.commentCount,
      thumbnail: video.snippet?.thumbnails?.high?.url,
    });
  } catch (error: any) {
    console.error("YouTube API Error:", error);
    if (error.errors?.[0]?.reason === "quotaExceeded") {
      return res.status(429).json({ error: "YouTube API limit reached. Try again later." });
    }
    res.status(500).json({ error: error.message || "Failed to fetch video info" });
  }
});

app.get("/api/comments", async (req, res) => {
  const { videoId, maxResults = "500" } = req.query;

  if (!videoId || typeof videoId !== "string") {
    return res.status(400).json({ error: "Video ID is required" });
  }

  try {
    const youtube = getYoutubeClient();
    let allComments: any[] = [];
    let nextPageToken: string | undefined | null = undefined;
    const limit = parseInt(maxResults as string) || 500;

    let pagesFetched = 0;
    const maxPages = Math.ceil(limit / 100);

    do {
      const response: any = await youtube.commentThreads.list({
        part: ["snippet"],
        videoId: videoId,
        maxResults: 100,
        pageToken: nextPageToken || undefined,
        order: "relevance",
      });

      const items = response.data.items || [];
      const formattedComments = items.map((item: any) => {
        const snippet = item.snippet.topLevelComment.snippet;
        const text = snippet.textDisplay;
        const analysis = sentiment.analyze(text);
        
        let sentimentLabel = "neutral";
        if (analysis.score > 0) sentimentLabel = "positive";
        else if (analysis.score < 0) sentimentLabel = "negative";

        return {
          id: item.id,
          username: snippet.authorDisplayName,
          comment: text,
          likes: snippet.likeCount,
          publishedAt: snippet.publishedAt,
          sentiment: sentimentLabel,
          profileImageUrl: snippet.authorProfileImageUrl,
        };
      });

      allComments = [...allComments, ...formattedComments];
      nextPageToken = response.data.nextPageToken;
      pagesFetched++;
    } while (nextPageToken && pagesFetched < maxPages);

    res.json({ comments: allComments.slice(0, limit) });
  } catch (error: any) {
    console.error("YouTube API Error:", error);
    if (error.errors?.[0]?.reason === "commentsDisabled") {
      return res.status(403).json({ error: "Comments are disabled for this video." });
    }
    if (error.errors?.[0]?.reason === "quotaExceeded") {
      return res.status(429).json({ error: "YouTube API limit reached. Try again later." });
    }
    res.status(500).json({ error: error.message || "Failed to fetch comments" });
  }
});

app.post("/api/create-checkout-session", async (req, res) => {
  const { amount } = req.body;

  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    const errorMsg = key?.startsWith('pk_') 
      ? "CRITICAL: You put a Publishable Key (pk_) in the STRIPE_SECRET_KEY field. Please use a Secret Key (sk_) instead."
      : "Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment variables.";
    return res.status(500).json({ error: errorMsg });
  }

  if (!amount || isNaN(amount) || amount < 1) {
    return res.status(400).json({ error: "Minimum donation is $1." });
  }

  try {
    const origin = req.headers.origin || req.headers.referer || process.env.APP_URL || 'http://localhost:3000';
    // Remove trailing slash if present
    const baseUrl = origin.replace(/\/$/, '');

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Donation to YTComment Exporter",
              description: "Thank you for supporting our mission!",
            },
            unit_amount: Math.round(amount * 100), // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/?success=true`,
      cancel_url: `${baseUrl}/?canceled=true`,
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe Error:", error);
    res.status(500).json({ error: error.message || "Failed to create checkout session" });
  }
});
