'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, MapPin, Clock, CheckCircle, AlertCircle, FileText, Send } from 'lucide-react';

interface FieldEntry {
  id: string;
  type: 'photo' | 'note' | 'measurement' | 'issue';
  timestamp: Date;
  location?: string;
  content: string;
  status: 'pending' | 'uploaded' | 'processed';
}

export default function FieldGeniusPage() {
  const [activeTab, setActiveTab] = useState<'capture' | 'log' | 'sync'>('capture');
  const [entries, setEntries] = useState<FieldEntry[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);

  const quickActions = [
    {
      id: 'photo',
      label: 'Take Photo',
      icon: <Camera className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500',
      action: 'photo'
    },
    {
      id: 'note',
      label: 'Voice Note',
      icon: <FileText className="w-6 h-6" />,
      color: 'from-green-500 to-teal-500',
      action: 'note'
    },
    {
      id: 'issue',
      label: 'Report Issue',
      icon: <AlertCircle className="w-6 h-6" />,
      color: 'from-red-500 to-orange-500',
      action: 'issue'
    },
    {
      id: 'upload',
      label: 'Upload Files',
      icon: <Upload className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500',
      action: 'upload'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Mobile-First Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">
              Field<span className="text-blue-400">Genius</span>
            </h1>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <MapPin className="w-4 h-4" />
              <span>GPS Active</span>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex mt-4 bg-black/20 rounded-xl p-1">
            {[
              { key: 'capture', label: 'Capture', icon: <Camera className="w-4 h-4" /> },
              { key: 'log', label: 'Log', icon: <FileText className="w-4 h-4" /> },
              { key: 'sync', label: 'Sync', icon: <Send className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Capture Tab */}
        {activeTab === 'capture' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <motion.button
                  key={action.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative overflow-hidden rounded-2xl p-6 text-left"
                  style={{
                    background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                  }}
                >
                  <div className={`bg-gradient-to-r ${action.color} absolute inset-0 opacity-90`} />
                  <div className="relative z-10">
                    <div className="text-white mb-3">
                      {action.icon}
                    </div>
                    <h3 className="text-white font-semibold text-lg">
                      {action.label}
                    </h3>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* AI Assistant Card */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">AI Field Assistant</h3>
              <div className="space-y-4">
                <div className="bg-black/20 rounded-xl p-4">
                  <textarea
                    placeholder="Describe what you're seeing or ask for guidance..."
                    className="w-full bg-transparent text-white placeholder-slate-400 resize-none border-none outline-none"
                    rows={3}
                  />
                </div>
                <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all">
                  Get AI Insights
                </button>
              </div>
            </div>

            {/* Weather & Conditions */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-slate-300">Time</span>
                </div>
                <p className="text-white font-semibold">2:45 PM</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-slate-300">Weather</span>
                </div>
                <p className="text-white font-semibold">Clear, 72°F</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Log Tab */}
        {activeTab === 'log' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {entries.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No entries yet</h3>
                <p className="text-slate-400">Start capturing to see your field log</p>
              </div>
            ) : (
              entries.map((entry) => (
                <div key={entry.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        entry.type === 'photo' ? 'bg-blue-500/20 text-blue-400' :
                        entry.type === 'note' ? 'bg-green-500/20 text-green-400' :
                        entry.type === 'issue' ? 'bg-red-500/20 text-red-400' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>
                        {entry.type === 'photo' ? <Camera className="w-4 h-4" /> :
                         entry.type === 'note' ? <FileText className="w-4 h-4" /> :
                         entry.type === 'issue' ? <AlertCircle className="w-4 h-4" /> :
                         <Upload className="w-4 h-4" />}
                      </div>
                      <span className="text-white font-medium capitalize">{entry.type}</span>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${
                      entry.status === 'processed' ? 'bg-green-400' :
                      entry.status === 'uploaded' ? 'bg-yellow-400' :
                      'bg-slate-400'
                    }`} />
                  </div>
                  <p className="text-slate-300 text-sm mb-2">{entry.content}</p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{entry.timestamp.toLocaleTimeString()}</span>
                    {entry.location && <span>{entry.location}</span>}
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* Sync Tab */}
        {activeTab === 'sync' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Sync Status</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Photos pending</span>
                  <span className="text-white font-semibold">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Notes pending</span>
                  <span className="text-white font-semibold">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Last sync</span>
                  <span className="text-slate-400 text-sm">Just now</span>
                </div>
              </div>

              <button className="w-full mt-6 bg-gradient-to-r from-green-500 to-teal-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5" />
                All Synced
              </button>
            </div>

            {/* Offline Mode */}
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                <div>
                  <h4 className="text-yellow-300 font-semibold">Online Mode</h4>
                  <p className="text-yellow-200/80 text-sm">Real-time sync active</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}