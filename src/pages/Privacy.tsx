import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

export const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 text-red-600 mb-6">
            <Shield className="w-8 h-8" />
            <h1 className="text-4xl font-black tracking-tight text-gray-900">Privacy Policy</h1>
          </div>
          
          <p className="text-lg text-gray-600 mb-12 leading-relaxed">
            Last updated: March 14, 2026. Your privacy is critically important to us. 
            At YTComment Exporter, we have a few fundamental principles:
          </p>

          <div className="space-y-12">
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
                  <Eye className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Information We Collect</h2>
              </div>
              <div className="prose prose-red max-w-none text-gray-600 leading-relaxed">
                <p>
                  We do not collect any personal information from our users unless they voluntarily provide it. 
                  When you use our YouTube Comment Export tool, we process the video URL you provide to fetch comments 
                  via the official YouTube Data API.
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li><strong>Usage Data:</strong> We may collect non-identifying information such as browser type, language preference, and the date and time of each visitor request to better understand how visitors use our website.</li>
                  <li><strong>Donation Information:</strong> If you choose to donate, payments are processed securely via Stripe. We do not store your credit card information on our servers.</li>
                </ul>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">How We Use Information</h2>
              </div>
              <div className="prose prose-red max-w-none text-gray-600 leading-relaxed">
                <p>
                  The information we process is used solely to provide the services you request:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li>To fetch and display YouTube comments for your analysis.</li>
                  <li>To generate CSV exports of comment data.</li>
                  <li>To facilitate random winner selection for giveaways.</li>
                  <li>To improve our website and user experience.</li>
                </ul>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Third-Party Services</h2>
              </div>
              <div className="prose prose-red max-w-none text-gray-600 leading-relaxed">
                <p>
                  Our service integrates with third-party platforms:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li><strong>YouTube API:</strong> By using our tool, you are agreeing to be bound by the <a href="https://www.youtube.com/t/terms" className="text-red-600 hover:underline">YouTube Terms of Service</a> and <a href="http://www.google.com/policies/privacy" className="text-red-600 hover:underline">Google Privacy Policy</a>.</li>
                  <li><strong>Stripe:</strong> Used for processing donations. Their privacy policy can be found on their website.</li>
                  <li><strong>Google AdSense:</strong> We use AdSense to display advertisements. Google uses cookies to serve ads based on a user's prior visits to our website or other websites.</li>
                </ul>
              </div>
            </section>

            <section className="pt-8 border-t border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-600">
                If you have any questions about this Privacy Policy, please contact us at privacy@ytcommentexporter.com.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
