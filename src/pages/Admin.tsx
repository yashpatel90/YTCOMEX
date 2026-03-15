import React, { useState, useEffect } from 'react';
import { db, auth, storage, collection, doc, setDoc, updateDoc, deleteDoc, query, orderBy, onSnapshot, Timestamp, OperationType, handleFirestoreError, signInWithPopup, googleProvider, signOut, User, ref, uploadBytes, uploadBytesResumable, getDownloadURL } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Plus, Edit2, Trash2, Save, X, LayoutDashboard, FileText, Settings, LogOut, LogIn, CheckCircle2, AlertCircle, Eye, EyeOff, Image as ImageIcon, Loader2, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  author: string;
  published: boolean;
  createdAt: any;
}

const ADMIN_EMAIL = "yashpatel9090@gmail.com";

export const Admin: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [currentPost, setCurrentPost] = useState<Partial<BlogPost>>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    coverImage: '',
    author: '',
    published: false
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'settings'>('posts');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const [siteSettings, setSiteSettings] = useState({
    siteName: 'YTComment Exporter',
    siteDescription: 'The ultimate tool for YouTube creators to manage, analyze, and export their community\'s voice.',
    contactEmail: 'support@ytcommentexporter.com',
    footerText: '© 2026 YTComment Exporter. All rights reserved.'
  });
  const [privateSettings, setPrivateSettings] = useState({
    imgbbApiKey: ''
  });

  useEffect(() => {
    let unsubscribePosts: (() => void) | undefined;
    let unsubscribeSettings: (() => void) | undefined;
    let unsubscribePrivateSettings: (() => void) | undefined;

    const unsubscribeAuth = auth.onAuthStateChanged((u) => {
      setUser(u);
      
      // Cleanup previous subscriptions
      if (unsubscribePosts) {
        unsubscribePosts();
        unsubscribePosts = undefined;
      }
      if (unsubscribeSettings) {
        unsubscribeSettings();
        unsubscribeSettings = undefined;
      }
      if (unsubscribePrivateSettings) {
        unsubscribePrivateSettings();
        unsubscribePrivateSettings = undefined;
      }

      if (u && u.email === ADMIN_EMAIL) {
        const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
        unsubscribePosts = onSnapshot(q, (snapshot) => {
          const blogPosts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as BlogPost[];
          setPosts(blogPosts);
          setLoading(false);
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, 'blogs');
          setLoading(false);
        });

        const settingsRef = doc(db, 'settings', 'global');
        unsubscribeSettings = onSnapshot(settingsRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data() as any;
            // Sanitize old data if it exists in DB
            const sanitizedData = {
              ...data,
              siteName: data.siteName === 'Charity Hope' ? 'YTComment Exporter' : data.siteName,
              footerText: data.footerText?.replace('Charity Hope', 'YTComment Exporter').replace('2024', '2026') || data.footerText,
              contactEmail: data.contactEmail === 'contact@charityhope.org' ? 'support@ytcommentexporter.com' : data.contactEmail,
              siteDescription: data.siteDescription === 'Making the world a better place.' ? 'The ultimate tool for YouTube creators to manage, analyze, and export their community\'s voice.' : data.siteDescription
            };
            setSiteSettings(sanitizedData);
          }
        }, (error) => {
          console.error("Error fetching global settings:", error);
        });

        const privateSettingsRef = doc(db, 'settings', 'private');
        unsubscribePrivateSettings = onSnapshot(privateSettingsRef, (doc) => {
          if (doc.exists()) {
            setPrivateSettings(doc.data() as any);
          }
        }, (error) => {
          console.error("Error fetching private settings:", error);
        });
      } else {
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribePosts) unsubscribePosts();
      if (unsubscribeSettings) unsubscribeSettings();
      if (unsubscribePrivateSettings) unsubscribePrivateSettings();
    };
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = () => signOut(auth);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPost.title || !currentPost.slug || !currentPost.content) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    try {
      const postData = {
        ...currentPost,
        updatedAt: Timestamp.now(),
        author: currentPost.author || user?.displayName || 'Admin'
      };

      if (currentPost.id) {
        await updateDoc(doc(db, 'blogs', currentPost.id), postData);
        setMessage({ type: 'success', text: 'Post updated successfully!' });
      } else {
        const newDocRef = doc(collection(db, 'blogs'));
        await setDoc(newDocRef, {
          ...postData,
          createdAt: Timestamp.now(),
          published: currentPost.published || false
        });
        setMessage({ type: 'success', text: 'Post created successfully!' });
      }
      setIsEditing(false);
      setCurrentPost({ title: '', slug: '', content: '', excerpt: '', coverImage: '', author: '', published: false });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'blogs');
      setMessage({ type: 'error', text: 'Failed to save post.' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'blogs', id));
      setMessage({ type: 'success', text: 'Post deleted successfully!' });
      setDeleteConfirmId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `blogs/${id}`);
      setMessage({ type: 'error', text: 'Failed to delete post.' });
    }
  };

  const startEdit = (post: BlogPost) => {
    setCurrentPost(post);
    setIsEditing(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'content' | 'cover' = 'content') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit to 10MB
    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File is too large. Please upload an image smaller than 10MB.' });
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setShowTroubleshooting(false);

    // If ImgBB API key is provided, use it as a free alternative
    if (privateSettings.imgbbApiKey) {
      try {
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${privateSettings.imgbbApiKey}`, {
          method: 'POST',
          body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
          const url = data.data.url;
          if (target === 'content') {
            setCurrentPost(prev => ({
              ...prev,
              content: (prev.content || '') + `\n\n![Image](${url})\n\n`
            }));
            setMessage({ type: 'success', text: 'Image uploaded to ImgBB and added to content!' });
          } else {
            setCurrentPost(prev => ({
              ...prev,
              coverImage: url
            }));
            setMessage({ type: 'success', text: 'Cover image uploaded to ImgBB!' });
          }
        } else {
          throw new Error(data.error?.message || 'ImgBB upload failed');
        }
      } catch (error: any) {
        console.error("ImgBB Upload failed", error);
        setMessage({ type: 'error', text: `ImgBB Upload failed: ${error.message}` });
      } finally {
        setUploading(false);
        setUploadProgress(0);
        if (e.target) e.target.value = '';
      }
      return;
    }

    // Fallback to Firebase Storage
    const timeoutId = setTimeout(() => {
      if (uploading && uploadProgress === 0) {
        setShowTroubleshooting(true);
      }
    }, 10000);
    
    try {
      const storageRef = ref(storage, `blog-images/${Date.now()}-${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setUploadProgress(progress);
          if (progress > 0) setShowTroubleshooting(false);
        }, 
        (error) => {
          clearTimeout(timeoutId);
          console.error("Upload failed with error:", error);
          let errorMsg = `Upload failed: ${error.message}`;
          
          if (error.code === 'storage/unauthorized') {
            errorMsg = "Permission denied. Please ensure Firebase Storage rules allow uploads and you are logged in as an admin.";
          } else if (error.code === 'storage/retry-limit-exceeded') {
            errorMsg = "Upload timed out. This often happens due to CORS issues or Storage not being enabled.";
            setShowTroubleshooting(true);
          }
          
          setMessage({ type: 'error', text: errorMsg });
          setUploading(false);
          setUploadProgress(0);
        }, 
        async () => {
          clearTimeout(timeoutId);
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            if (target === 'content') {
              setCurrentPost(prev => ({
                ...prev,
                content: (prev.content || '') + `\n\n![Image](${url})\n\n`
              }));
              setMessage({ type: 'success', text: 'Image uploaded and added to content!' });
            } else {
              setCurrentPost(prev => ({
                ...prev,
                coverImage: url
              }));
              setMessage({ type: 'success', text: 'Cover image uploaded!' });
            }
          } catch (urlError: any) {
            console.error("Failed to get download URL", urlError);
            setMessage({ type: 'error', text: `Upload succeeded but failed to get link: ${urlError.message}` });
          } finally {
            setUploading(false);
            setUploadProgress(0);
            if (e.target) e.target.value = '';
          }
        }
      );
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error("Upload setup failed", error);
      setMessage({ type: 'error', text: `Failed to start upload: ${error.message}` });
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'settings', 'global'), siteSettings);
      await setDoc(doc(db, 'settings', 'private'), privateSettings);
      setMessage({ type: 'success', text: 'Settings updated successfully!' });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings');
      setMessage({ type: 'error', text: 'Failed to save settings.' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100">
          <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <LayoutDashboard className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Admin Access</h1>
          <p className="text-gray-500 mb-8">Please sign in with your admin account to manage blog posts.</p>
          <button
            onClick={handleLogin}
            className="w-full bg-red-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
          >
            <LogIn className="w-5 h-5" /> Sign in with Google
          </button>
          {user && user.email !== ADMIN_EMAIL && (
            <p className="mt-4 text-red-600 text-sm font-bold">Access Denied: {user.email} is not an admin.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-red-600 p-1 rounded">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-black text-gray-900">Admin Panel</span>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Blog Management</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('posts')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'posts' ? 'bg-red-50 text-red-600' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <FileText className="w-5 h-5" /> Posts
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'settings' ? 'bg-red-50 text-red-600' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Settings className="w-5 h-5" /> Settings
          </button>
        </nav>
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-4 py-3 mb-4">
            <img src={user.photoURL || ''} className="w-8 h-8 rounded-full" alt="" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{user.displayName}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-bold transition-all"
          >
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Nav */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-50 flex justify-around p-2">
        <button 
          onClick={() => setActiveTab('posts')}
          className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'posts' ? 'text-red-600' : 'text-gray-400'}`}
        >
          <FileText className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase">Posts</span>
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'settings' ? 'text-red-600' : 'text-gray-400'}`}
        >
          <Settings className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase">Settings</span>
        </button>
        <button 
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 p-2 text-gray-400"
        >
          <LogOut className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase">Exit</span>
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          {activeTab === 'posts' ? (
            <>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                  <h1 className="text-3xl font-black text-gray-900">Blog Posts</h1>
                  <p className="text-gray-500">Manage your website's articles and insights.</p>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => {
                      setCurrentPost({ title: '', slug: '', content: '', excerpt: '', coverImage: '', author: user.displayName || '', published: false });
                      setIsEditing(true);
                    }}
                    className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                  >
                    <Plus className="w-5 h-5" /> Create New Post
                  </button>
                )}
              </div>

              <AnimatePresence>
                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`mb-6 p-4 rounded-xl flex flex-col gap-3 font-bold ${
                      message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                      {message.text}
                      <button onClick={() => setMessage(null)} className="ml-auto opacity-50 hover:opacity-100"><X className="w-4 h-4" /></button>
                    </div>
                    {showTroubleshooting && message.type === 'error' && (
                      <div className="mt-2 p-4 bg-white/50 rounded-lg text-sm font-normal text-red-800 space-y-2">
                        <p className="font-bold">Troubleshooting 0% Upload:</p>
                        <p>This is usually caused by Firebase CORS restrictions. To fix this instantly:</p>
                        <button 
                          type="button"
                          onClick={() => {
                            setMessage(null);
                            setActiveTab('settings');
                          }}
                          className="text-red-600 font-bold hover:underline flex items-center gap-1"
                        >
                          Go to Settings and add an ImgBB API Key <ArrowRight className="w-3 h-3" />
                        </button>
                        <ul className="list-disc pl-5 space-y-1 text-xs opacity-70">
                          <li>Ensure <strong>Firebase Storage</strong> is enabled in your console.</li>
                          <li>Check if <strong>CORS</strong> is configured for your bucket.</li>
                        </ul>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {isEditing ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
                >
                  <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-xl font-black text-gray-900">{currentPost.id ? 'Edit Post' : 'New Post'}</h2>
                    <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
                  </div>
                  <form onSubmit={handleSave} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Title *</label>
                        <input
                          type="text"
                          required
                          value={currentPost.title}
                          onChange={(e) => setCurrentPost({ ...currentPost, title: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                          placeholder="Enter post title"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Slug *</label>
                        <input
                          type="text"
                          required
                          value={currentPost.slug}
                          onChange={(e) => setCurrentPost({ ...currentPost, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                          placeholder="post-url-slug"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Cover Image URL</label>
                          <label className="flex items-center gap-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-all text-xs font-bold text-gray-600">
                            {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ImageIcon className="w-3 h-3" />}
                            {uploading ? `Uploading (${uploadProgress}%)` : 'Upload'}
                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'cover')} className="hidden" disabled={uploading} />
                          </label>
                        </div>
                        <div className="relative group">
                          <input
                            type="text"
                            value={currentPost.coverImage}
                            onChange={(e) => setCurrentPost({ ...currentPost, coverImage: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                            placeholder="https://..."
                          />
                          {currentPost.coverImage && (
                            <div className="mt-2 relative aspect-video rounded-xl overflow-hidden border border-gray-100">
                              <img 
                                src={currentPost.coverImage} 
                                alt="Cover preview" 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Author</label>
                        <input
                          type="text"
                          value={currentPost.author}
                          onChange={(e) => setCurrentPost({ ...currentPost, author: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                          placeholder="Author Name"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Excerpt</label>
                      <textarea
                        rows={2}
                        value={currentPost.excerpt}
                        onChange={(e) => setCurrentPost({ ...currentPost, excerpt: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                        placeholder="Short summary for the card view"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Content (Markdown) *</label>
                        <div className="flex gap-2">
                          <label className="flex items-center gap-2 px-3 py-1 bg-red-50 hover:bg-red-100 rounded-lg cursor-pointer transition-all text-[10px] font-bold text-red-600">
                            {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ImageIcon className="w-3 h-3" />}
                            {uploading ? `Uploading (${uploadProgress}%)` : 'Insert Image'}
                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'content')} className="hidden" disabled={uploading} />
                          </label>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <textarea
                          rows={15}
                          required
                          value={currentPost.content}
                          onChange={(e) => setCurrentPost({ ...currentPost, content: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none font-mono text-sm transition-all"
                          placeholder="# Your blog content here..."
                        />
                        <div className="w-full px-6 py-4 rounded-xl border border-gray-100 bg-gray-50/50 overflow-auto max-h-[400px]">
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-200 pb-2">Live Preview</div>
                          <div className="prose prose-sm prose-red max-w-none">
                            <div className="markdown-body">
                              <ReactMarkdown
                                components={{
                                  img: ({ node, ...props }) => (
                                    <img
                                      {...props}
                                      className="rounded-xl shadow-md my-4 w-full"
                                      referrerPolicy="no-referrer"
                                    />
                                  ),
                                }}
                              >
                                {currentPost.content || ''}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={currentPost.published}
                            onChange={(e) => setCurrentPost({ ...currentPost, published: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </div>
                        <span className="text-sm font-bold text-gray-700">Publish immediately</span>
                      </label>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                      >
                        <Save className="w-5 h-5" /> {currentPost.id ? 'Update Post' : 'Save Post'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 border-b border-gray-100">
                          <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Post</th>
                          <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                          <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Date</th>
                          <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {posts.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-6 py-20 text-center text-gray-400 font-medium">
                              No posts yet. Start by creating your first article!
                            </td>
                          </tr>
                        ) : (
                          posts.map((post) => (
                            <tr key={post.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                    <img src={post.coverImage || `https://picsum.photos/seed/${post.id}/100/100`} className="w-full h-full object-cover" alt="" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-gray-900 line-clamp-1">{post.title}</p>
                                    <p className="text-xs text-gray-400">/{post.slug}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                {post.published ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold">
                                    <Eye className="w-3 h-3" /> Published
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">
                                    <EyeOff className="w-3 h-3" /> Draft
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {post.createdAt?.toDate ? format(post.createdAt.toDate(), 'MMM dd, yyyy') : 'Recently'}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => startEdit(post)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirmId(post.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl"
            >
              <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900">Site Settings</h1>
                <p className="text-gray-500">Configure global website information and preferences.</p>
              </div>

              <AnimatePresence>
                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`mb-6 p-4 rounded-xl flex flex-col gap-3 font-bold ${
                      message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                      {message.text}
                      <button onClick={() => setMessage(null)} className="ml-auto opacity-50 hover:opacity-100"><X className="w-4 h-4" /></button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <form onSubmit={handleSaveSettings} className="p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Site Name</label>
                    <input
                      type="text"
                      value={siteSettings.siteName}
                      onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Site Description</label>
                    <textarea
                      rows={3}
                      value={siteSettings.siteDescription}
                      onChange={(e) => setSiteSettings({ ...siteSettings, siteDescription: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Contact Email</label>
                    <input
                      type="email"
                      value={siteSettings.contactEmail}
                      onChange={(e) => setSiteSettings({ ...siteSettings, contactEmail: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Footer Text</label>
                    <input
                      type="text"
                      value={siteSettings.footerText}
                      onChange={(e) => setSiteSettings({ ...siteSettings, footerText: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Free Image Hosting (ImgBB API Key)</label>
                      <a href="https://api.imgbb.com/" target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-red-600 hover:underline">Get Free Key</a>
                    </div>
                    <input
                      type="password"
                      value={privateSettings.imgbbApiKey}
                      onChange={(e) => setPrivateSettings({ ...privateSettings, imgbbApiKey: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                      placeholder="Paste your ImgBB API Key here"
                    />
                    <p className="text-[10px] text-gray-400 italic">If provided, images will be uploaded to ImgBB for free instead of Firebase Storage.</p>
                  </div>
                  <div className="pt-6 border-t border-gray-100">
                    <button
                      type="submit"
                      className="w-full bg-red-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                    >
                      <Save className="w-5 h-5" /> Save Global Settings
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-gray-100"
            >
              <div className="bg-red-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 text-center mb-2">Delete Post?</h3>
              <p className="text-gray-500 text-center mb-8">This action cannot be undone. Are you sure you want to remove this article?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="flex-1 px-6 py-3 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
