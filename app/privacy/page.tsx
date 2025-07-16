import { Shield, Lock, Eye } from 'lucide-react';
import { constructMetadata } from '../lib/metadata';

export const metadata = constructMetadata({
  title: 'Privacy Policy | MyRoofGenius - Data Protection & AI Transparency',
  description: 'Learn how MyRoofGenius protects your data with enterprise-grade security. Our privacy policy covers AI data usage, encryption standards, and your data rights.',
  keywords: ['myroofgenius privacy', 'roofing software privacy policy', 'AI data protection', 'contractor data security', 'GDPR compliance roofing'],
});

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Privacy <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Policy</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              How we protect and handle your data with AI transparency
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="w-8 h-8 text-green-400" />
            <div>
              <h2 className="text-2xl font-bold text-white mb-0">Privacy Policy</h2>
              <p className="text-slate-400 text-sm">Last updated: January 15, 2024</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-black/20 rounded-xl p-6">
              <Lock className="w-8 h-8 text-blue-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-3">Data Encryption</h3>
              <p className="text-slate-300 text-sm">All data transmitted and stored using AES-256 encryption standards.</p>
            </div>
            <div className="bg-black/20 rounded-xl p-6">
              <Eye className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-3">AI Transparency</h3>
              <p className="text-slate-300 text-sm">Clear visibility into how AI processes your roofing data.</p>
            </div>
          </div>

          <div className="space-y-8 text-slate-300">
            <section>
              <h3 className="text-xl font-bold text-white mb-4">Information We Collect</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Roof photos and property information for AI analysis</li>
                <li>Account details and contact information</li>
                <li>Usage analytics to improve AI accuracy</li>
                <li>Payment information (processed securely via Stripe)</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-bold text-white mb-4">How We Use AI</h3>
              <p>Your roofing data trains our AI models to provide better analysis for all users. Personal identifying information is anonymized before use in machine learning processes.</p>
            </section>

            <section>
              <h3 className="text-xl font-bold text-white mb-4">Data Retention</h3>
              <p>Property analysis data is retained for 7 years for AI improvement and user access. Account data is deleted within 30 days of account closure upon request.</p>
            </section>

            <section>
              <h3 className="text-xl font-bold text-white mb-4">Your Rights</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Access your data and AI analysis history</li>
                <li>Request data deletion (right to be forgotten)</li>
                <li>Opt-out of AI model training</li>
                <li>Export your data in machine-readable format</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-bold text-white mb-4">Contact Us</h3>
              <p>For privacy concerns or data requests, contact our Data Protection Officer at privacy@myroofgenius.com or use our contact form.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}