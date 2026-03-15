import React from 'react';
import { PieChart, TrendingUp, Smile, Frown, Meh } from 'lucide-react';
import { Comment } from './CommentTable';

interface SentimentSummaryProps {
  comments: Comment[];
}

export const SentimentSummary: React.FC<SentimentSummaryProps> = ({ comments }) => {
  const total = comments.length;
  if (total === 0) return null;

  const positive = comments.filter(c => c.sentiment === 'positive').length;
  const negative = comments.filter(c => c.sentiment === 'negative').length;
  const neutral = comments.filter(c => c.sentiment === 'neutral').length;

  const posPercent = Math.round((positive / total) * 100);
  const negPercent = Math.round((negative / total) * 100);
  const neuPercent = Math.round((neutral / total) * 100);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <PieChart className="w-5 h-5 text-red-600" />
        <h3 className="font-bold text-gray-900">Sentiment Analysis</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex flex-col items-center text-center">
          <Smile className="w-8 h-8 text-emerald-600 mb-2" />
          <span className="text-2xl font-black text-emerald-700">{posPercent}%</span>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Positive</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
          <Meh className="w-8 h-8 text-slate-400 mb-2" />
          <span className="text-2xl font-black text-slate-700">{neuPercent}%</span>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Neutral</span>
        </div>
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 flex flex-col items-center text-center">
          <Frown className="w-8 h-8 text-rose-600 mb-2" />
          <span className="text-2xl font-black text-rose-700">{negPercent}%</span>
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Negative</span>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-50">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4" /> Overall Mood
          </span>
          <span className={`text-sm font-bold ${posPercent > negPercent ? 'text-emerald-600' : 'text-rose-600'}`}>
            {posPercent > negPercent ? 'Mostly Positive' : 'Needs Attention'}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden flex">
          <div style={{ width: `${posPercent}%` }} className="h-full bg-emerald-500" />
          <div style={{ width: `${neuPercent}%` }} className="h-full bg-slate-300" />
          <div style={{ width: `${negPercent}%` }} className="h-full bg-rose-500" />
        </div>
      </div>
    </div>
  );
};
