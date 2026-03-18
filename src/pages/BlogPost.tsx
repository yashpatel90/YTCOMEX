import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db, collection, query, where, getDocs, OperationType, handleFirestoreError } from '../firebase';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { AdSenseUnit } from '../components/AdSenseUnit';
import { ArrowLeft, Calendar, User, Share2, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: any;
  coverImage: string;
}

export const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const q = query(collection(db, 'blogs'), where('slug', '==', slug), where('published', '==', true));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          setPost({ id: doc.id, ...doc.data() } as BlogPost);
        } else {
          setError('Post not found');
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `blogs/${slug}`);
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-xl mx-auto mt-20 p-8 text-center">
        <h2 className="text-2xl font-black text-gray-900 mb-4">{error || 'Post not found'}</h2>
        <Link to="/blog" className="text-red-600 font-bold flex items-center justify-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header */}
      <div className="relative h-[60vh] min-h-[400px] w-full">
        <img
          src={post.coverImage || `https://picsum.photos/seed/${post.id}/1920/1080`}
          alt={post.title}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
          <div className="max-w-4xl mx-auto">
            <Link to="/blog" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6 font-bold text-sm uppercase tracking-widest">
              <ArrowLeft className="w-4 h-4" /> Back to Blog
            </Link>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight"
            >
              {post.title}
            </motion.h1>
            <div className="flex flex-wrap items-center gap-6 text-white/80 font-bold text-sm uppercase tracking-widest">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-red-500" />
                {post.createdAt?.toDate ? format(post.createdAt.toDate(), 'MMMM dd, yyyy') : 'Recently'}
              </span>
              <span className="flex items-center gap-2">
                <User className="w-4 h-4 text-red-500" />
                {post.author}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          <article className="flex-1 prose prose-lg prose-red max-w-none">
            <div className="markdown-body">
              <ReactMarkdown
                components={{
                  img: ({ node, ...props }) => (
                    <img
                      {...props}
                      className="rounded-2xl shadow-lg my-8 w-full"
                      referrerPolicy="no-referrer"
                    />
                  ),
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>
          </article>

          {/* Sidebar / AdSpace */}
          <aside className="lg:w-80 space-y-8">
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 sticky top-24">
              <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Share this post</h4>
              <div className="flex gap-4 mb-8">
                <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-red-600 hover:border-red-200 transition-all">
                  <Share2 className="w-4 h-4" />
                </button>
                <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-red-600 hover:border-red-200 transition-all">
                  <Heart className="w-4 h-4" />
                </button>
              </div>

              <div className="pt-8 border-t border-gray-200">
                <p className="text-xs font-bold text-slate-300 uppercase tracking-[0.2em] mb-4">Advertisement</p>
                <AdSenseUnit slot="1122334455" format="rectangle" />
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Bottom AdSpace */}
      <div className="max-w-4xl mx-auto px-4 pb-20">
        <AdSenseUnit slot="5544332211" />
      </div>
    </div>
  );
};
