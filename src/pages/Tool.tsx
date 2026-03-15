import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
  MessageSquare, 
  Search, 
  Loader2, 
  AlertCircle, 
  Video,
  BarChart3,
  Trophy,
  Heart
} from 'lucide-react';
import { motion } from 'framer-motion';
import { CommentTable, Comment } from '../components/CommentTable';
import { GiveawayPicker } from '../components/GiveawayPicker';
import { SentimentSummary } from '../components/SentimentSummary';
import { ExportButton } from '../components/ExportButton';

interface VideoInfo {
  title: string;
  commentCount: string;
  thumbnail: string;
}

export const Tool: React.FC = () => {
  const [searchParams] = useSearchParams();
  const videoId = searchParams.get('v');
  
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'comments' | 'giveaway' | 'analysis'>('comments');
  const [isDonating, setIsDonating] = useState(false);
  const [donationError, setDonationError] = useState('');

  useEffect(() => {
    if (!videoId) return;

    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [infoRes, commentsRes] = await Promise.all([
          axios.get(`/api/video-info?videoId=${videoId}`),
          axios.get(`/api/comments?videoId=${videoId}`)
        ]);

        setVideoInfo(infoRes.data);
        setComments(commentsRes.data.comments);
      } catch (err: any) {
        const msg = err.response?.data?.error || 'Failed to fetch data. Please try again.';
        if (msg.includes('YOUTUBE_API_KEY is missing')) {
          setError('YouTube API Key is missing. Please add "YOUTUBE_API_KEY" to your secrets in the AI Studio panel.');
        } else if (msg.includes('unregistered callers')) {
          setError('Invalid YouTube API Key. Please check your "YOUTUBE_API_KEY" in the secrets panel.');
        } else {
          setError(msg);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [videoId]);

  const handleSupport = async () => {
    setIsDonating(true);
    setDonationError('');
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 10 }), // Default $10 support
      });

      const data = await response.json();
      if (data.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (err: any) {
      console.error('Support error:', err);
      setDonationError(err.message || 'Something went wrong.');
    } finally {
      setIsDonating(false);
    }
  };

  const filteredComments = useMemo(() => {
    if (!searchTerm) return comments;
    return comments.filter(c => 
      c.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [comments, searchTerm]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
        <p className="text-gray-500 font-medium animate-pulse">Fetching YouTube comments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto mt-20 p-8 bg-red-50 rounded-3xl border border-red-100 text-center">
        <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-gray-900 mb-2">Oops! Something went wrong</h2>
        <p className="text-red-600 font-medium mb-8">{error}</p>
        <Link to="/" className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-all">
          <ArrowLeft className="w-5 h-5" /> Try Another Video
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-red-600 transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to Search
      </Link>

      {/* Video Info Header */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 mb-12 flex flex-col md:flex-row gap-8 items-center">
        <div className="w-full md:w-64 aspect-video rounded-2xl overflow-hidden shadow-lg border border-gray-100 flex-shrink-0">
          <img 
            src={videoInfo?.thumbnail} 
            alt={videoInfo?.title} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-red-600 mb-2">
            <Video className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-widest">Video Analysis</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-4 line-clamp-2">{videoInfo?.title}</h1>
          <div className="flex flex-wrap justify-center md:justify-start gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Total Comments</p>
                <p className="text-lg font-black text-gray-900">{parseInt(videoInfo?.commentCount || '0').toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Fetched</p>
                <p className="text-lg font-black text-gray-900">{comments.length.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 flex flex-col gap-3">
          <ExportButton comments={comments} videoTitle={videoInfo?.title || 'youtube_comments'} />
          <button
            onClick={handleSupport}
            disabled={isDonating}
            className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-black transition-all shadow-sm disabled:opacity-50"
          >
            {isDonating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Heart className="w-4 h-4 text-red-500 fill-current" />
            )}
            Support Us
          </button>
          {donationError && (
            <p className="text-[10px] font-bold text-red-600 text-center max-w-[150px] leading-tight mt-1">{donationError}</p>
          )}
        </div>
      </div>

      {/* Tool Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 p-1.5 bg-slate-100 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('comments')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'comments' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <MessageSquare className="w-4 h-4" /> Comments
        </button>
        <button 
          onClick={() => setActiveTab('giveaway')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'giveaway' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Trophy className="w-4 h-4" /> Giveaway Picker
        </button>
        <button 
          onClick={() => setActiveTab('analysis')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'analysis' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <BarChart3 className="w-4 h-4" /> Sentiment Analysis
        </button>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'comments' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search comments or users..."
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                Showing {filteredComments.length} of {comments.length} comments
              </p>
            </div>
            <CommentTable comments={filteredComments} videoId={videoId!} />
          </div>
        )}

        {activeTab === 'giveaway' && (
          <div className="max-w-4xl mx-auto">
            <GiveawayPicker comments={comments} videoId={videoId!} />
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="max-w-4xl mx-auto">
            <SentimentSummary comments={comments} />
          </div>
        )}
      </motion.div>
    </div>
  );
};
