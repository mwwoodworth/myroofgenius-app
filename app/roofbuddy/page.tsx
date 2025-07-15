'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wrench, Camera, FileText, Zap, AlertTriangle, Calculator } from 'lucide-react';

interface CopilotTool {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  endpoint: string;
  category: 'assessment' | 'estimation' | 'documentation';
}

const copilotTools: CopilotTool[] = [
  {
    id: 'roof-type-identifier',
    title: 'Roof Type Identifier',
    description: 'Upload photos and let AI identify roof type, materials, and potential issues instantly.',
    icon: <Camera className="w-6 h-6" />,
    color: 'blue',
    gradient: 'from-blue-500 to-purple-600',
    endpoint: '/api/copilot/identify-roof',
    category: 'assessment'
  },
  {
    id: 'leak-estimator',
    title: 'Leak Damage Estimator',
    description: 'AI-powered leak assessment with repair cost estimates and priority recommendations.',
    icon: <AlertTriangle className="w-6 h-6" />,
    color: 'red',
    gradient: 'from-red-500 to-orange-600',
    endpoint: '/api/copilot/estimate-leak',
    category: 'estimation'
  },
  {
    id: 'itb-intake',
    title: 'ITB Intake Assistant',
    description: 'Streamlined invitation to bid processing with automated proposal generation.',
    icon: <FileText className="w-6 h-6" />,
    color: 'green',
    gradient: 'from-green-500 to-teal-600',
    endpoint: '/api/copilot/process-itb',
    category: 'documentation'
  },
  {
    id: 'material-calculator',
    title: 'Smart Material Calculator',
    description: 'Calculate exact materials needed based on roof dimensions and selected systems.',
    icon: <Calculator className="w-6 h-6" />,
    color: 'indigo',
    gradient: 'from-indigo-500 to-blue-600',
    endpoint: '/api/copilot/calculate-materials',
    category: 'estimation'
  },
  {
    id: 'repair-prioritizer',
    title: 'Repair Priority Engine',
    description: 'AI prioritizes repairs by urgency, cost, and weather impact for optimal planning.',
    icon: <Zap className="w-6 h-6" />,
    color: 'yellow',
    gradient: 'from-yellow-500 to-orange-600',
    endpoint: '/api/copilot/prioritize-repairs',
    category: 'assessment'
  },
  {
    id: 'warranty-analyzer',
    title: 'Warranty Coverage Analyzer',
    description: 'Instantly determine warranty coverage and claim procedures for any roofing system.',
    icon: <Wrench className="w-6 h-6" />,
    color: 'purple',
    gradient: 'from-purple-500 to-pink-600',
    endpoint: '/api/copilot/analyze-warranty',
    category: 'documentation'
  }
];

const categories = {
  assessment: 'Roof Assessment',
  estimation: 'Cost Estimation', 
  documentation: 'Documentation'
};

export default function RoofBuddyPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTool, setSelectedTool] = useState<CopilotTool | null>(null);

  const filteredTools = selectedCategory === 'all' 
    ? copilotTools 
    : copilotTools.filter(tool => tool.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Roof<span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Buddy</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Your AI-powered roofing copilot. Upload photos, ask questions, get instant expert insights.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-6 py-3 rounded-full font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            All Tools
          </button>
          {Object.entries(categories).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                selectedCategory === key
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              {label}
            </button>
          ))}
        </motion.div>

        {/* Copilot Tools Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredTools.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedTool(tool)}
              className="group cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-8 hover:bg-white/10 transition-all duration-300">
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${tool.gradient} mb-6`}>
                  {tool.icon}
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-300 transition-colors">
                  {tool.title}
                </h3>
                <p className="text-slate-300 text-lg leading-relaxed">
                  {tool.description}
                </p>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* AI Prompt Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16"
        >
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Ask RoofBuddy Anything
            </h2>
            <div className="relative">
              <textarea
                placeholder="Describe your roofing question or upload photos for AI analysis..."
                className="w-full h-32 bg-black/20 border border-white/20 rounded-xl p-4 text-white placeholder-slate-400 resize-none focus:outline-none focus:border-blue-400 transition-colors"
              />
              <button className="absolute bottom-4 right-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all">
                Analyze
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}