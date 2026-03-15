import React from 'react';
import { ExternalLink, ThumbsUp, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

export interface Comment {
  id: string;
  username: string;
  comment: string;
  likes: number;
  publishedAt: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  profileImageUrl: string;
}

interface CommentTableProps {
  comments: Comment[];
  videoId: string;
}

export const CommentTable: React.FC<CommentTableProps> = ({ comments, videoId }) => {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'negative': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-gray-200">
            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Comment</th>
            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Stats</th>
            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Sentiment</th>
            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {comments.map((comment, index) => (
            <motion.tr 
              key={comment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.05, 1) }}
              className="hover:bg-slate-50/50 transition-colors"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <img 
                    src={comment.profileImageUrl} 
                    alt={comment.username} 
                    className="w-8 h-8 rounded-full border border-gray-100"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-sm font-medium text-gray-900">{comment.username}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm text-gray-600 max-w-md line-clamp-2 hover:line-clamp-none transition-all cursor-default" dangerouslySetInnerHTML={{ __html: comment.comment }} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{comment.likes.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(comment.publishedAt)}</span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getSentimentColor(comment.sentiment)}`}>
                  {comment.sentiment}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <a 
                  href={`https://www.youtube.com/watch?v=${videoId}&lc=${comment.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
                >
                  Visit <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
      {comments.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-gray-400 font-medium italic">No comments found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};
