"use client";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Camera, 
  Calculator, 
  FileText, 
  ArrowRight, 
  Sparkles, 
  Brain,
  Upload,
  MessageSquare
} from "lucide-react";

export default function HomeClient() {
  const [promptInput, setPromptInput] = useState('');
  const roofSystems = [
    {
      id: 'inspection',
      title: 'AI Roof Inspector',
      description: 'Upload photos, get instant professional analysis with 94% accuracy',
      icon: <Camera className="w-8 h-8" />,
      gradient: 'from-blue-500 to-cyan-500',
      href: '/roofbuddy'
    },
    {
      id: 'calculator',
      title: 'Smart Cost Calculator',
      description: 'AI-powered material estimates with real-time pricing',
      icon: <Calculator className="w-8 h-8" />,
      gradient: 'from-green-500 to-emerald-500',
      href: '/roofbuddy'
    },
    {
      id: 'field',
      title: 'Field Genius Mobile',
      description: 'Photo documentation with GPS tracking and instant sync',
      icon: <Upload className="w-8 h-8" />,
      gradient: 'from-purple-500 to-pink-500',
      href: '/fieldgenius'
    },
    {
      id: 'marketplace',
      title: 'AI Document Shop',
      description: 'Claude-generated templates, contracts, and checklists',
      icon: <FileText className="w-8 h-8" />,
      gradient: 'from-orange-500 to-red-500',
      href: '/marketplace'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 animate-pulse" />
      
      {/* Hero Section */}
      <div className="relative z-10">
        <div className="container mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-5xl mx-auto"
          >
            {/* Trust Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-8"
            >
              <Brain className="w-5 h-5 text-blue-400" />
              <span className="text-white font-medium">Powered by Claude AI</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-6xl md:text-8xl font-black text-white mb-6 leading-tight"
            >
              The Future of
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Roofing Intelligence
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              AI-powered analysis, instant cost estimates, and professional documentation.
              <br />
              <span className="text-blue-300">Your roofing copilot has arrived.</span>
            </motion.p>

            {/* AI Prompt Input */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="max-w-2xl mx-auto mb-16"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-75" />
                <div className="relative bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="w-6 h-6 text-blue-400" />
                    <h3 className="text-white font-semibold text-lg">Ask RoofGenius AI</h3>
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Describe your roof or upload photos for instant AI analysis..."
                      value={promptInput}
                      onChange={(e) => setPromptInput(e.target.value)}
                      className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-colors"
                    />
                    <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Analyze
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Roof Systems Grid */}
      <div className="relative z-10 container mx-auto px-6 pb-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Choose Your AI <span className="text-blue-400">Copilot</span>
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Each tool is powered by advanced AI to deliver professional-grade results in seconds
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {roofSystems.map((system, index) => (
            <motion.div
              key={system.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="group cursor-pointer"
            >
              <Link href={system.href} className="block">
                <div className="relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 p-8 hover:bg-white/10 transition-all duration-300 h-full">
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${system.gradient} mb-6 text-white`}>
                    {system.icon}
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-300 transition-colors">
                    {system.title}
                  </h3>
                  <p className="text-slate-300 text-lg leading-relaxed mb-6">
                    {system.description}
                  </p>

                  {/* CTA */}
                  <div className="flex items-center text-blue-400 font-medium group-hover:text-blue-300 transition-colors">
                    <span>Try now</span>
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>

                  {/* Hover Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${system.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-3xl`} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-400 mb-2">94%</div>
            <div className="text-slate-300">AI Accuracy Rate</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-400 mb-2">12,847</div>
            <div className="text-slate-300">Roofs Analyzed</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-400 mb-2">2.3s</div>
            <div className="text-slate-300">Average Response</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
