import React from 'react';
import { Download } from 'lucide-react';
import { Comment } from './CommentTable';

interface ExportButtonProps {
  comments: Comment[];
  videoTitle: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ comments, videoTitle }) => {
  const exportToCSV = () => {
    if (comments.length === 0) return;

    const headers = ['Username', 'Comment', 'Likes', 'Published Date', 'Sentiment'];
    const rows = comments.map(c => [
      `"${c.username.replace(/"/g, '""')}"`,
      `"${c.comment.replace(/"/g, '""')}"`,
      c.likes,
      c.publishedAt,
      c.sentiment
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `comments-${videoTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button 
      onClick={exportToCSV}
      disabled={comments.length === 0}
      className="inline-flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-lg text-sm font-bold border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm disabled:opacity-50"
    >
      <Download className="w-4 h-4" />
      Export CSV
    </button>
  );
};
