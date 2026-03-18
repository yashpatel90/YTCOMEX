/**
 * Extracts the video ID from various YouTube URL formats.
 * Supported formats:
 * - https://www.youtube.com/watch?v=VIDEOID
 * - https://youtube.com/watch?v=VIDEOID
 * - https://youtu.be/VIDEOID
 * - https://m.youtube.com/watch?v=VIDEOID
 */
export const extractVideoId = (url: string): string | null => {
  if (!url) return null;

  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = url.match(regex);

  return match ? match[1] : null;
};
