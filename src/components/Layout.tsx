import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Youtube, Heart, Settings } from 'lucide-react';
import { db, auth, doc, onSnapshot } from '../firebase';

export const Navbar: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAdmin(user?.email === "yashpatel9090@gmail.com");
    });
    return () => unsubscribe();
  }, []);

  return (
    <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-red-600 p-1.5 rounded-lg group-hover:bg-red-700 transition-colors">
              <Youtube className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">
              YTComment<span className="text-red-600">Exporter</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors">Home</Link>
            <Link to="/blog" className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors">Blog</Link>
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors">Features</a>
            {isAdmin && (
              <Link to="/admin" className="flex items-center gap-1.5 text-sm font-bold text-gray-400 hover:text-red-600 transition-colors">
                <Settings className="w-4 h-4" /> Admin
              </Link>
            )}
            <Link to="/" className="flex items-center gap-1.5 text-sm font-bold text-red-600 hover:text-red-700 transition-colors">
              <Heart className="w-4 h-4 fill-current" /> Donate
            </Link>
            <Link to="/" className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-red-700 transition-all shadow-sm hover:shadow-md">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export const Footer: React.FC = () => {
  const [settings, setSettings] = useState({
    siteName: 'YTComment Exporter',
    footerText: '© 2026 YTComment Exporter. All rights reserved.'
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'global'), (doc) => {
      if (doc.exists()) {
        const data = doc.data() as any;
        // Ensure we don't show the old name if it's still in the DB
        const sanitizedData = {
          ...data,
          siteName: data.siteName === 'Charity Hope' ? 'YTComment Exporter' : data.siteName,
          footerText: data.footerText?.replace('Charity Hope', 'YTComment Exporter').replace('2024', '2026') || data.footerText
        };
        setSettings(sanitizedData);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <footer className="bg-white border-t border-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-red-600 p-1 rounded">
                <Youtube className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">{settings.siteName}</span>
            </div>
            <p className="text-gray-500 max-w-sm">
              The ultimate tool for YouTube creators to manage, analyze, and export their community's voice.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/" className="hover:text-red-600">Home</Link></li>
              <li><Link to="/blog" className="hover:text-red-600">Blog</Link></li>
              <li><a href="#features" className="hover:text-red-600">Features</a></li>
              <li><Link to="/" className="hover:text-red-600">Tool</Link></li>
              <li><Link to="/admin" className="text-gray-300 hover:text-red-600">Admin</Link></li>
              <li><Link to="/" className="text-red-600 font-bold flex items-center gap-1.5 hover:text-red-700">
                <Heart className="w-3.5 h-3.5 fill-current" /> Donate Now
              </Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-red-600">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-red-600">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            {settings.footerText}
          </p>
        </div>
      </div>
    </footer>
  );
};
