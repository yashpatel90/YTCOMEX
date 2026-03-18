import React, { useState } from 'react';
import { Trophy, Users, Filter, RefreshCw, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { Comment } from './CommentTable';

interface GiveawayPickerProps {
  comments: Comment[];
  videoId: string;
}

export const GiveawayPicker: React.FC<GiveawayPickerProps> = ({ comments, videoId }) => {
  const [minLikes, setMinLikes] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [removeDuplicates, setRemoveDuplicates] = useState(true);
  const [winner, setWinner] = useState<Comment | null>(null);
  const [isPicking, setIsPicking] = useState(false);

  const pickWinner = () => {
    setIsPicking(true);
    setWinner(null);

    setTimeout(() => {
      let filtered = [...comments];

      if (minLikes > 0) {
        filtered = filtered.filter(c => c.likes >= minLikes);
      }

      if (keyword) {
        filtered = filtered.filter(c => c.comment.toLowerCase().includes(keyword.toLowerCase()));
      }

      if (removeDuplicates) {
        const seen = new Set();
        filtered = filtered.filter(c => {
          if (seen.has(c.username)) return false;
          seen.add(c.username);
          return true;
        });
      }

      if (filtered.length > 0) {
        const randomIndex = Math.floor(Math.random() * filtered.length);
        const picked = filtered[randomIndex];
        setWinner(picked);
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#dc2626', '#ffffff', '#000000']
        });
      } else {
        alert("No comments match your giveaway criteria!");
      }
      setIsPicking(false);
    }, 1500);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-slate-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-red-600" />
          <h3 className="font-bold text-gray-900">Giveaway Comment Picker</h3>
        </div>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Random Selection</span>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
              <Filter className="w-3 h-3" /> Min Likes
            </label>
            <input 
              type="number" 
              value={minLikes}
              onChange={(e) => setMinLikes(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
              <Filter className="w-3 h-3" /> Keyword Filter
            </label>
            <input 
              type="text" 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
              placeholder="e.g. giveaway"
            />
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input 
                  type="checkbox" 
                  checked={removeDuplicates}
                  onChange={(e) => setRemoveDuplicates(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors flex items-center gap-1.5">
                <Users className="w-4 h-4" /> Remove Duplicates
              </span>
            </label>
          </div>
        </div>

        <button 
          onClick={pickWinner}
          disabled={isPicking || comments.length === 0}
          className="w-full bg-red-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-3"
        >
          {isPicking ? (
            <>
              <RefreshCw className="w-6 h-6 animate-spin" />
              Picking Winner...
            </>
          ) : (
            <>
              <Trophy className="w-6 h-6" />
              Pick Random Winner
            </>
          )}
        </button>

        <AnimatePresence>
          {winner && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="mt-8 p-6 rounded-2xl bg-red-50 border-2 border-red-100 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Trophy className="w-24 h-24 text-red-600 rotate-12" />
              </div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                <img 
                  src={winner.profileImageUrl} 
                  alt={winner.username} 
                  className="w-20 h-20 rounded-full border-4 border-white shadow-md"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 text-center md:text-left">
                  <h4 className="text-2xl font-black text-gray-900 mb-1">{winner.username}</h4>
                  <p className="text-gray-600 italic mb-4" dangerouslySetInnerHTML={{ __html: winner.comment }} />
                  <div className="flex flex-wrap justify-center md:justify-start gap-4">
                    <a 
                      href={`https://www.youtube.com/watch?v=${videoId}&lc=${winner.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-white text-red-600 px-4 py-2 rounded-lg text-sm font-bold border border-red-100 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                    >
                      View Comment <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
