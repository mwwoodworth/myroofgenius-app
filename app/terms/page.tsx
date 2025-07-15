import { FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Terms of <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Service</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              AI-powered roofing platform terms and conditions
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          <div className="prose prose-invert max-w-none">
            <div className="flex items-center gap-3 mb-8">
              <FileText className="w-8 h-8 text-blue-400" />
              <div>
                <h2 className="text-2xl font-bold text-white mb-0">Terms of Service</h2>
                <p className="text-slate-400 text-sm">Last updated: January 15, 2024</p>
              </div>
            </div>

            <div className="space-y-8 text-slate-300">
              <section>
                <h3 className="text-xl font-bold text-white mb-4">1. Acceptance of Terms</h3>
                <p>By accessing and using MyRoofGenius, you accept and agree to be bound by the terms and provision of this agreement.</p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-white mb-4">2. AI Services</h3>
                <p>Our AI-powered analysis tools provide estimates and recommendations based on machine learning algorithms. While highly accurate, results should be verified by qualified professionals for critical decisions.</p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-white mb-4">3. User Responsibilities</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Provide accurate information for AI analysis</li>
                  <li>Use the platform in compliance with applicable laws</li>
                  <li>Maintain confidentiality of account credentials</li>
                  <li>Report any suspected misuse or security issues</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-bold text-white mb-4">4. Intellectual Property</h3>
                <p>All AI models, algorithms, and platform content remain the intellectual property of MyRoofGenius. Users retain rights to their uploaded content and generated reports.</p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-white mb-4">5. Limitation of Liability</h3>
                <p>MyRoofGenius provides AI-assisted analysis tools. Final decisions regarding roofing projects remain the responsibility of qualified professionals and property owners.</p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}