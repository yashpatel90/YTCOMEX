import React from 'react';
import { motion } from 'framer-motion';
import { Scale, AlertCircle, CheckCircle2, Info } from 'lucide-react';

export const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 text-red-600 mb-6">
            <Scale className="w-8 h-8" />
            <h1 className="text-4xl font-black tracking-tight text-gray-900">Terms of Service</h1>
          </div>
          
          <p className="text-lg text-gray-600 mb-12 leading-relaxed">
            By accessing the website at YTComment Exporter, you are agreeing to be bound by these terms of service, 
            all applicable laws and regulations, and agree that you are responsible for compliance with any 
            applicable local laws.
          </p>

          <div className="space-y-12">
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">1. Use License</h2>
              </div>
              <div className="prose prose-red max-w-none text-gray-600 leading-relaxed">
                <p>
                  Permission is granted to temporarily use the tools on YTComment Exporter's website for personal, 
                  non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, 
                  and under this license you may not:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li>Modify or copy the materials;</li>
                  <li>Use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
                  <li>Attempt to decompile or reverse engineer any software contained on the website;</li>
                  <li>Remove any copyright or other proprietary notations from the materials; or</li>
                  <li>Transfer the materials to another person or "mirror" the materials on any other server.</li>
                </ul>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">2. Disclaimer</h2>
              </div>
              <div className="prose prose-red max-w-none text-gray-600 leading-relaxed">
                <p>
                  The materials on YTComment Exporter's website are provided on an 'as is' basis. 
                  YTComment Exporter makes no warranties, expressed or implied, and hereby disclaims and negates 
                  all other warranties including, without limitation, implied warranties or conditions of 
                  merchantability, fitness for a particular purpose, or non-infringement of intellectual property 
                  or other violation of rights.
                </p>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
                  <Info className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">3. Limitations</h2>
              </div>
              <div className="prose prose-red max-w-none text-gray-600 leading-relaxed">
                <p>
                  In no event shall YTComment Exporter or its suppliers be liable for any damages (including, 
                  without limitation, damages for loss of data or profit, or due to business interruption) 
                  arising out of the use or inability to use the materials on YTComment Exporter's website, 
                  even if YTComment Exporter or a YTComment Exporter authorized representative has been notified 
                  orally or in writing of the possibility of such damage.
                </p>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
                  <Scale className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">4. Governing Law</h2>
              </div>
              <div className="prose prose-red max-w-none text-gray-600 leading-relaxed">
                <p>
                  These terms and conditions are governed by and construed in accordance with the laws of 
                  the jurisdiction in which the website operator resides and you irrevocably submit to the 
                  exclusive jurisdiction of the courts in that State or location.
                </p>
              </div>
            </section>

            <section className="pt-8 border-t border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">YouTube Compliance</h2>
              <p className="text-gray-600 mb-4">
                This service uses the YouTube Data API. By using this service, you agree to be bound by the 
                YouTube Terms of Service, which can be found at: 
                <a href="https://www.youtube.com/t/terms" className="text-red-600 hover:underline ml-1">
                  https://www.youtube.com/t/terms
                </a>.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
