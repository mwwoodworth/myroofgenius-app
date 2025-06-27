# MyRoofGenius AI Copilot - Complete Implementation Package

## Why This Matters

Commercial roofing projects fail when critical information gets buried in 500-page specifications. Your field teams miss exclusions. Estimators overlook alternates. Project managers discover conflicts too late. This AI Copilot prevents those failures by transforming static documents into protective intelligence.

## What This Protects and Enables

**Protects you from:**
- Missing critical exclusions that trigger change orders
- Overlooking warranty requirements that void coverage
- Misreading specifications that compromise margins
- Discovering coordination issues after mobilization

**Enables you to:**
- Query project documents in natural language
- Surface risks before they become problems
- Compare bids intelligently with specification awareness
- Give every team member expert-level document analysis

## Implementation Architecture

```
/ai-copilot
├── frontend/
│   ├── components/
│   │   ├── CopilotInterface.tsx
│   │   ├── DocumentUploader.tsx
│   │   ├── QueryInterface.tsx
│   │   ├── RiskDashboard.tsx
│   │   ├── InsightCards.tsx
│   │   └── PersonaSelector.tsx
│   ├── hooks/
│   │   ├── useRAGQuery.ts
│   │   ├── useDocumentAnalysis.ts
│   │   └── useRiskScoring.ts
│   ├── lib/
│   │   ├── api-client.ts
│   │   ├── document-processor.ts
│   │   └── risk-analyzer.ts
│   └── pages/
│       └── copilot.tsx
├── backend/
│   ├── api/
│   │   ├── rag-query.ts
│   │   ├── document-upload.ts
│   │   ├── risk-analysis.ts
│   │   └── insight-generation.ts
│   ├── prompts/
│   │   ├── rag-templates.ts
│   │   ├── risk-scoring.ts
│   │   └── persona-prompts.ts
│   └── data/
│       └── seed-data.ts
└── config/
    ├── security.ts
    └── deployment.md
```

## Frontend Components

### 1. Main Copilot Interface (CopilotInterface.tsx)

```tsx
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, TrendingUp, FileText, Users } from 'lucide-react';
import DocumentUploader from './DocumentUploader';
import QueryInterface from './QueryInterface';
import RiskDashboard from './RiskDashboard';
import InsightCards from './InsightCards';
import PersonaSelector from './PersonaSelector';

interface Project {
  id: string;
  name: string;
  value: number;
  documents: Document[];
  riskScore: number;
  insights: Insight[];
}

interface Document {
  id: string;
  name: string;
  type: 'specification' | 'drawing' | 'bid' | 'contract' | 'rfi';
  uploadedAt: Date;
  status: 'processing' | 'indexed' | 'error';
  metadata?: {
    pageCount?: number;
    extractedEntities?: string[];
  };
}

interface Insight {
  id: string;
  type: 'risk' | 'opportunity' | 'conflict' | 'clarification';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  documentReferences: string[];
  suggestedAction?: string;
  potentialImpact?: {
    cost?: number;
    schedule?: number;
  };
}

export default function CopilotInterface() {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [persona, setPersona] = useState<'estimator' | 'pm' | 'field' | 'owner'>('estimator');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleDocumentUpload = useCallback(async (files: File[]) => {
    setIsAnalyzing(true);
    // Document processing logic here
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('documents', file));
      formData.append('projectId', activeProject?.id || 'new');
      formData.append('persona', persona);

      const response = await fetch('/api/copilot/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'X-Persona': persona,
        }
      });

      const result = await response.json();
      setDocuments(prev => [...prev, ...result.documents]);
      setInsights(prev => [...prev, ...result.insights]);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [activeProject, persona]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header with Persona Selector */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-slate-900" />
              <div>
                <h1 className="text-xl font-semibold text-slate-900">
                  AI Field Intelligence
                </h1>
                <p className="text-sm text-slate-600">
                  {activeProject?.name || 'Select a project'}
                </p>
              </div>
            </div>
            
            <PersonaSelector 
              currentPersona={persona} 
              onPersonaChange={setPersona}
            />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Document Upload & Query */}
          <div className="lg:col-span-2 space-y-6">
            {/* Document Upload Zone */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border border-slate-200 p-6"
            >
              <h2 className="text-lg font-medium text-slate-900 mb-4">
                Project Documents
              </h2>
              <DocumentUploader 
                onUpload={handleDocumentUpload}
                isProcessing={isAnalyzing}
                existingDocuments={documents}
              />
            </motion.div>

            {/* Query Interface */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-slate-200 p-6"
            >
              <QueryInterface 
                projectId={activeProject?.id}
                persona={persona}
                documents={documents}
              />
            </motion.div>
          </div>

          {/* Right Column - Insights & Risk Dashboard */}
          <div className="space-y-6">
            {/* Risk Score Overview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg shadow-sm border border-slate-200 p-6"
            >
              <RiskDashboard 
                project={activeProject}
                insights={insights}
                persona={persona}
              />
            </motion.div>

            {/* Critical Insights */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <InsightCards 
                insights={insights.filter(i => i.severity === 'critical')}
                title="Critical Findings"
                emptyMessage="No critical issues detected"
              />
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
```

### 2. Document Uploader Component (DocumentUploader.tsx)

```tsx
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';

interface DocumentUploaderProps {
  onUpload: (files: File[]) => Promise<void>;
  isProcessing: boolean;
  existingDocuments: any[];
  maxFileSize?: number; // in MB
  acceptedFormats?: string[];
}

export default function DocumentUploader({
  onUpload,
  isProcessing,
  existingDocuments = [],
  maxFileSize = 50,
  acceptedFormats = ['.pdf', '.xlsx', '.xls', '.docx', '.jpg', '.png', '.dwg']
}: DocumentUploaderProps) {
  const [uploadQueue, setUploadQueue] = useState<File[]>([]);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(rejection => {
        if (rejection.file.size > maxFileSize * 1024 * 1024) {
          return `${rejection.file.name} exceeds ${maxFileSize}MB limit`;
        }
        return `${rejection.file.name} is not a supported format`;
      });
      setUploadErrors(errors);
      setTimeout(() => setUploadErrors([]), 5000);
    }

    // Process accepted files
    if (acceptedFiles.length > 0) {
      setUploadQueue(acceptedFiles);
      await onUpload(acceptedFiles);
      setUploadQueue([]);
    }
  }, [onUpload, maxFileSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFormats.reduce((acc, format) => {
      // Map file extensions to MIME types
      const mimeMap: Record<string, string[]> = {
        '.pdf': ['application/pdf'],
        '.xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        '.xls': ['application/vnd.ms-excel'],
        '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        '.jpg': ['image/jpeg'],
        '.png': ['image/png'],
        '.dwg': ['application/acad', 'image/vnd.dwg']
      };
      if (mimeMap[format]) {
        mimeMap[format].forEach(mime => {
          acc[mime] = [format];
        });
      }
      return acc;
    }, {} as Record<string, string[]>),
    maxSize: maxFileSize * 1024 * 1024,
    multiple: true
  });

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200 ease-in-out
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-slate-300 hover:border-slate-400 bg-white'
          }
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} disabled={isProcessing} />
        
        <div className="space-y-3">
          {isProcessing ? (
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto" />
          ) : (
            <Upload className="h-12 w-12 text-slate-400 mx-auto" />
          )}
          
          <div>
            <p className="text-base font-medium text-slate-900">
              {isDragActive ? 'Drop files here' : 'Drop files or click to browse'}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Supports: Specs (PDF), Drawings (DWG/PDF), Bids (Excel), Images
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Max {maxFileSize}MB per file
            </p>
          </div>
        </div>
      </div>

      {/* Error Messages */}
      <AnimatePresence>
        {uploadErrors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-3"
          >
            {uploadErrors.map((error, index) => (
              <div key={index} className="flex items-center text-sm text-red-700">
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                {error}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Queue */}
      {uploadQueue.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            Processing {uploadQueue.length} file{uploadQueue.length > 1 ? 's' : ''}
          </h4>
          <div className="space-y-2">
            {uploadQueue.map((file, index) => (
              <div key={index} className="flex items-center text-sm text-blue-700">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {file.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Existing Documents */}
      {existingDocuments.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-700">
            Indexed Documents ({existingDocuments.length})
          </h4>
          <div className="space-y-1">
            {existingDocuments.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-2 bg-slate-50 rounded-md"
              >
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-slate-500" />
                  <span className="text-sm text-slate-700">{doc.name}</span>
                  <span className="text-xs text-slate-500">
                    ({doc.metadata?.pageCount || '?'} pages)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {doc.status === 'indexed' && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {doc.status === 'processing' && (
                    <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                  )}
                  {doc.status === 'error' && (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

### 3. Query Interface Component (QueryInterface.tsx)

```tsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Paperclip, Zap, Shield, AlertTriangle } from 'lucide-react';
import { useRAGQuery } from '../hooks/useRAGQuery';

interface QueryInterfaceProps {
  projectId?: string;
  persona: string;
  documents: any[];
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  references?: DocumentReference[];
  insights?: QueryInsight[];
}

interface DocumentReference {
  documentId: string;
  documentName: string;
  pageNumber?: number;
  excerpt?: string;
  confidence: number;
}

interface QueryInsight {
  type: 'risk' | 'opportunity' | 'clarification';
  content: string;
  severity?: 'high' | 'medium' | 'low';
}

export default function QueryInterface({ projectId, persona, documents }: QueryInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { executeQuery } = useRAGQuery();

  // Persona-specific quick actions
  const quickActions = {
    estimator: [
      "What are the critical exclusions in this bid?",
      "Identify all alternate pricing options",
      "Show warranty requirements and durations",
      "Find all owner-supplied materials"
    ],
    pm: [
      "What's the project schedule and milestones?",
      "List all submittal requirements",
      "Show safety requirements and protocols",
      "Identify coordination dependencies"
    ],
    field: [
      "What are today's installation specs?",
      "Show flashing details for parapets",
      "List required inspections and hold points",
      "Find membrane attachment requirements"
    ],
    owner: [
      "Summarize warranty coverage",
      "What maintenance is required?",
      "Show system life expectancy",
      "Identify cost optimization opportunities"
    ]
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await executeQuery({
        query: input,
        projectId,
        persona,
        documentIds: documents.map(d => d.id)
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.answer,
        timestamp: new Date(),
        references: response.references,
        insights: response.insights
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Query failed:', error);
      // Handle error appropriately
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-slate-900">
          Ask About This Project
        </h3>
        <div className="flex items-center space-x-2 text-sm text-slate-600">
          <Shield className="h-4 w-4" />
          <span>{documents.length} documents indexed</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-4 flex flex-wrap gap-2">
        {quickActions[persona as keyof typeof quickActions]?.slice(0, 2).map((action, index) => (
          <button
            key={index}
            onClick={() => handleQuickAction(action)}
            className="inline-flex items-center px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 
                     text-slate-700 rounded-full transition-colors"
          >
            <Zap className="h-3 w-3 mr-1" />
            {action}
          </button>
        ))}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">
              Ask questions about specifications, drawings, or bids.
              I'll search across all project documents.
            </p>
          </div>
        )}

        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                
                {/* Document References */}
                {message.references && message.references.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <p className="text-xs font-medium mb-2 text-slate-600">
                      Sources:
                    </p>
                    <div className="space-y-1">
                      {message.references.map((ref, index) => (
                        <div key={index} className="flex items-start space-x-2 text-xs">
                          <Paperclip className="h-3 w-3 mt-0.5 text-slate-500" />
                          <div>
                            <span className="font-medium">{ref.documentName}</span>
                            {ref.pageNumber && (
                              <span className="text-slate-500"> (p. {ref.pageNumber})</span>
                            )}
                            {ref.excerpt && (
                              <p className="text-slate-600 mt-1 italic">"{ref.excerpt}"</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Insights */}
                {message.insights && message.insights.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.insights.map((insight, index) => (
                      <div
                        key={index}
                        className={`
                          flex items-start space-x-2 p-2 rounded text-xs
                          ${insight.type === 'risk' 
                            ? 'bg-red-100 text-red-800' 
                            : insight.type === 'opportunity'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                          }
                        `}
                      >
                        <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{insight.content}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-slate-100 rounded-lg p-4 flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin text-slate-600" />
              <span className="text-sm text-slate-600">Searching documents...</span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about specs, warranties, exclusions..."
          className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none 
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </form>
    </div>
  );
}
```

### 4. Risk Dashboard Component (RiskDashboard.tsx)

```tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, TrendingUp, DollarSign, Clock, CheckCircle } from 'lucide-react';

interface RiskDashboardProps {
  project: any;
  insights: any[];
  persona: string;
}

export default function RiskDashboard({ project, insights, persona }: RiskDashboardProps) {
  // Calculate risk metrics
  const riskScore = project?.riskScore || calculateRiskScore(insights);
  const criticalCount = insights.filter(i => i.severity === 'critical').length;
  const highCount = insights.filter(i => i.severity === 'high').length;
  const opportunities = insights.filter(i => i.type === 'opportunity').length;

  // Persona-specific metrics
  const personaMetrics = {
    estimator: {
      title: 'Bid Risk Score',
      metrics: [
        { label: 'Margin Risk', value: '12%', trend: 'down' },
        { label: 'Scope Gaps', value: '3', trend: 'up' },
        { label: 'Exclusions', value: '7', trend: 'neutral' }
      ]
    },
    pm: {
      title: 'Project Risk Score',
      metrics: [
        { label: 'Schedule Risk', value: 'Medium', trend: 'up' },
        { label: 'RFIs Predicted', value: '12-15', trend: 'up' },
        { label: 'Coordination Issues', value: '4', trend: 'neutral' }
      ]
    },
    field: {
      title: 'Field Risk Score',
      metrics: [
        { label: 'Safety Concerns', value: '2', trend: 'down' },
        { label: 'Access Issues', value: '1', trend: 'neutral' },
        { label: 'Material Conflicts', value: '3', trend: 'up' }
      ]
    },
    owner: {
      title: 'Investment Risk Score',
      metrics: [
        { label: 'Budget Risk', value: 'Low', trend: 'neutral' },
        { label: 'Quality Concerns', value: '0', trend: 'neutral' },
        { label: 'Warranty Gaps', value: '1', trend: 'down' }
      ]
    }
  };

  const currentMetrics = personaMetrics[persona as keyof typeof personaMetrics];

  return (
    <div className="space-y-4">
      {/* Overall Risk Score */}
      <div className="text-center">
        <h3 className="text-sm font-medium text-slate-600 mb-2">
          {currentMetrics.title}
        </h3>
        <div className="relative inline-flex items-center justify-center">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="#e2e8f0"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke={riskScore > 70 ? '#ef4444' : riskScore > 40 ? '#f59e0b' : '#10b981'}
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${(riskScore / 100) * 352} 352`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div>
              <p className="text-3xl font-bold text-slate-900">{riskScore}</p>
              <p className="text-xs text-slate-600">out of 100</p>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Breakdown */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className="flex items-center justify-center w-10 h-10 mx-auto mb-1 
                        bg-red-100 text-red-600 rounded-full">
            <span className="text-sm font-bold">{criticalCount}</span>
          </div>
          <p className="text-xs text-slate-600">Critical</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center w-10 h-10 mx-auto mb-1 
                        bg-orange-100 text-orange-600 rounded-full">
            <span className="text-sm font-bold">{highCount}</span>
          </div>
          <p className="text-xs text-slate-600">High</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center w-10 h-10 mx-auto mb-1 
                        bg-green-100 text-green-600 rounded-full">
            <span className="text-sm font-bold">{opportunities}</span>
          </div>
          <p className="text-xs text-slate-600">Opportunities</p>
        </div>
      </div>

      {/* Persona-Specific Metrics */}
      <div className="space-y-3 pt-4 border-t border-slate-200">
        {currentMetrics.metrics.map((metric, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm text-slate-600">{metric.label}</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-slate-900">{metric.value}</span>
              {metric.trend === 'up' && (
                <TrendingUp className="h-3 w-3 text-red-500" />
              )}
              {metric.trend === 'down' && (
                <TrendingUp className="h-3 w-3 text-green-500 transform rotate-180" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="pt-4 border-t border-slate-200">
        <button className="w-full px-4 py-2 bg-slate-900 text-white text-sm font-medium 
                         rounded-lg hover:bg-slate-800 transition-colors">
          Generate Risk Report
        </button>
      </div>
    </div>
  );
}

function calculateRiskScore(insights: any[]): number {
  // Simplified risk calculation
  const criticalCount = insights.filter(i => i.severity === 'critical').length;
  const highCount = insights.filter(i => i.severity === 'high').length;
  const mediumCount = insights.filter(i => i.severity === 'medium').length;
  
  const score = Math.min(100, (criticalCount * 20) + (highCount * 10) + (mediumCount * 5));
  return score;
}
```

### 5. Insight Cards Component (InsightCards.tsx)

```tsx
import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, HelpCircle, FileText, ChevronRight } from 'lucide-react';

interface InsightCardsProps {
  insights: any[];
  title: string;
  emptyMessage: string;
}

export default function InsightCards({ insights, title, emptyMessage }: InsightCardsProps) {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'risk':
        return <AlertTriangle className="h-5 w-5" />;
      case 'opportunity':
        return <TrendingUp className="h-5 w-5" />;
      case 'conflict':
        return <FileText className="h-5 w-5" />;
      default:
        return <HelpCircle className="h-5 w-5" />;
    }
  };

  const getInsightColor = (type: string, severity: string) => {
    if (type === 'opportunity') return 'green';
    if (severity === 'critical') return 'red';
    if (severity === 'high') return 'orange';
    return 'blue';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-medium text-slate-900 mb-4">{title}</h3>
      
      {insights.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-8">{emptyMessage}</p>
      ) : (
        <div className="space-y-3">
          {insights.map((insight) => {
            const color = getInsightColor(insight.type, insight.severity);
            
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`
                  p-4 rounded-lg border cursor-pointer
                  transition-all duration-200 hover:shadow-md
                  ${color === 'red' 
                    ? 'bg-red-50 border-red-200 hover:border-red-300' 
                    : color === 'orange'
                    ? 'bg-orange-50 border-orange-200 hover:border-orange-300'
                    : color === 'green'
                    ? 'bg-green-50 border-green-200 hover:border-green-300'
                    : 'bg-blue-50 border-blue-200 hover:border-blue-300'
                  }
                `}
              >
                <div className="flex items-start space-x-3">
                  <div className={`
                    flex-shrink-0 p-2 rounded-full
                    ${color === 'red' 
                      ? 'bg-red-100 text-red-600' 
                      : color === 'orange'
                      ? 'bg-orange-100 text-orange-600'
                      : color === 'green'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-blue-100 text-blue-600'
                    }
                  `}>
                    {getInsightIcon(insight.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-slate-900">
                      {insight.title}
                    </h4>
                    <p className="text-sm text-slate-600 mt-1">
                      {insight.description}
                    </p>
                    
                    {insight.suggestedAction && (
                      <div className="mt-2 flex items-center text-xs font-medium text-slate-700">
                        <span>Action: {insight.suggestedAction}</span>
                      </div>
                    )}
                    
                    {insight.potentialImpact && (
                      <div className="mt-2 flex items-center space-x-4 text-xs text-slate-600">
                        {insight.potentialImpact.cost && (
                          <span>Cost impact: ${insight.potentialImpact.cost.toLocaleString()}</span>
                        )}
                        {insight.potentialImpact.schedule && (
                          <span>Schedule impact: {insight.potentialImpact.schedule} days</span>
                        )}
                      </div>
                    )}
                    
                    {insight.documentReferences && insight.documentReferences.length > 0 && (
                      <div className="mt-2 flex items-center text-xs text-slate-500">
                        <FileText className="h-3 w-3 mr-1" />
                        <span>Found in {insight.documentReferences.length} document(s)</span>
                      </div>
                    )}
                  </div>
                  
                  <ChevronRight className="h-5 w-5 text-slate-400 flex-shrink-0" />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

### 6. Persona Selector Component (PersonaSelector.tsx)

```tsx
import React from 'react';
import { motion } from 'framer-motion';
import { HardHat, Briefcase, Wrench, Building } from 'lucide-react';

interface PersonaSelectorProps {
  currentPersona: string;
  onPersonaChange: (persona: 'estimator' | 'pm' | 'field' | 'owner') => void;
}

export default function PersonaSelector({ currentPersona, onPersonaChange }: PersonaSelectorProps) {
  const personas = [
    {
      id: 'estimator',
      label: 'Estimator',
      icon: Briefcase,
      description: 'Bid analysis & cost optimization'
    },
    {
      id: 'pm',
      label: 'Project Manager',
      icon: HardHat,
      description: 'Schedule & coordination'
    },
    {
      id: 'field',
      label: 'Field Team',
      icon: Wrench,
      description: 'Installation & inspection'
    },
    {
      id: 'owner',
      label: 'Owner',
      icon: Building,
      description: 'Investment & maintenance'
    }
  ];

  return (
    <div className="flex items-center space-x-2">
      {personas.map((persona) => {
        const Icon = persona.icon;
        const isActive = currentPersona === persona.id;
        
        return (
          <motion.button
            key={persona.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onPersonaChange(persona.id as any)}
            className={`
              relative px-4 py-2 rounded-lg font-medium text-sm
              transition-all duration-200 group
              ${isActive 
                ? 'bg-slate-900 text-white' 
                : 'bg-white text-slate-600 hover:bg-slate-100'
              }
            `}
          >
            <div className="flex items-center space-x-2">
              <Icon className="h-4 w-4" />
              <span>{persona.label}</span>
            </div>
            
            {/* Tooltip */}
            <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 
                          opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none
                          bg-slate-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
              {persona.description}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
```

## Backend API Contracts

### 1. Document Upload API (api/document-upload.ts)

```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { processDocument } from '../../lib/document-processor';
import { generateInsights } from '../../lib/insight-generator';

export const config = {
  api: {
    bodyParser: false,
  },
};

interface UploadResponse {
  documents: ProcessedDocument[];
  insights: Insight[];
  processingTime: number;
}

interface ProcessedDocument {
  id: string;
  name: string;
  type: string;
  status: 'processing' | 'indexed' | 'error';
  metadata?: {
    pageCount?: number;
    extractedEntities?: string[];
  };
}

interface Insight {
  id: string;
  type: 'risk' | 'opportunity' | 'conflict' | 'clarification';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  documentReferences: string[];
  suggestedAction?: string;
  potentialImpact?: {
    cost?: number;
    schedule?: number;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const startTime = Date.now();
  
  try {
    // Parse multipart form data
    const form = formidable({ multiples: true });
    const [fields, files] = await form.parse(req);
    
    const projectId = fields.projectId?.[0];
    const persona = fields.persona?.[0] || 'estimator';
    
    // Process each uploaded document
    const processedDocs: ProcessedDocument[] = [];
    const fileArray = Array.isArray(files.documents) ? files.documents : [files.documents];
    
    for (const file of fileArray) {
      if (!file) continue;
      
      try {
        const processed = await processDocument(file, {
          projectId,
          extractText: true,
          generateEmbeddings: true,
          extractEntities: true
        });
        
        processedDocs.push(processed);
      } catch (error) {
        console.error('Document processing error:', error);
        processedDocs.push({
          id: crypto.randomUUID(),
          name: file.originalFilename || 'unknown',
          type: file.mimetype || 'unknown',
          status: 'error'
        });
      }
    }
    
    // Generate insights based on uploaded documents
    const insights = await generateInsights(processedDocs, persona);
    
    const response: UploadResponse = {
      documents: processedDocs,
      insights,
      processingTime: Date.now() - startTime
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Upload handler error:', error);
    res.status(500).json({ error: 'Failed to process upload' });
  }
}
```

### 2. RAG Query API (api/rag-query.ts)

```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { executeRAGQuery } from '../../lib/rag-engine';
import { rateLimit } from '../../lib/rate-limit';

interface QueryRequest {
  query: string;
  projectId: string;
  persona: string;
  documentIds: string[];
  contextWindow?: number;
  maxResults?: number;
}

interface QueryResponse {
  answer: string;
  references: DocumentReference[];
  insights: QueryInsight[];
  confidence: number;
  processingTime: number;
}

interface DocumentReference {
  documentId: string;
  documentName: string;
  pageNumber?: number;
  excerpt?: string;
  confidence: number;
}

interface QueryInsight {
  type: 'risk' | 'opportunity' | 'clarification';
  content: string;
  severity?: 'high' | 'medium' | 'low';
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Apply rate limiting
  try {
    await rateLimit(req, res);
  } catch {
    return res.status(429).json({ error: 'Too many requests' });
  }

  const startTime = Date.now();
  
  try {
    const {
      query,
      projectId,
      persona,
      documentIds,
      contextWindow = 2000,
      maxResults = 5
    } = req.body as QueryRequest;

    // Validate input
    if (!query || !projectId || !persona || !documentIds?.length) {
      return res.status(400).json({ 
        error: 'Missing required fields' 
      });
    }

    // Execute RAG query
    const result = await executeRAGQuery({
      query,
      projectId,
      persona,
      documentIds,
      contextWindow,
      maxResults
    });

    const response: QueryResponse = {
      ...result,
      processingTime: Date.now() - startTime
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('RAG query error:', error);
    res.status(500).json({ 
      error: 'Failed to process query',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
```

### 3. Risk Analysis API (api/risk-analysis.ts)

```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { analyzeProjectRisk } from '../../lib/risk-analyzer';

interface RiskAnalysisRequest {
  projectId: string;
  documentIds: string[];
  analysisType: 'comprehensive' | 'quick' | 'focused';
  focusAreas?: string[];
}

interface RiskAnalysisResponse {
  overallScore: number;
  categoryScores: {
    financial: number;
    schedule: number;
    technical: number;
    contractual: number;
    safety: number;
  };
  criticalFindings: RiskFinding[];
  opportunities: Opportunity[];
  recommendations: Recommendation[];
  analysisDepth: string;
  confidence: number;
}

interface RiskFinding {
  id: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  evidence: {
    documentId: string;
    excerpt: string;
    pageNumber?: number;
  }[];
  potentialImpact: {
    cost?: { min: number; max: number; };
    schedule?: { days: number; confidence: number; };
  };
  mitigation?: string;
}

interface Opportunity {
  id: string;
  type: 'cost_savings' | 'schedule_improvement' | 'value_engineering';
  title: string;
  description: string;
  potentialValue: {
    amount?: number;
    percentage?: number;
    timeframe?: string;
  };
  implementation: string;
}

interface Recommendation {
  priority: 'immediate' | 'high' | 'medium' | 'low';
  action: string;
  rationale: string;
  relatedFindings: string[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      projectId,
      documentIds,
      analysisType = 'comprehensive',
      focusAreas = []
    } = req.body as RiskAnalysisRequest;

    if (!projectId || !documentIds?.length) {
      return res.status(400).json({ 
        error: 'Missing required fields' 
      });
    }

    const analysis = await analyzeProjectRisk({
      projectId,
      documentIds,
      analysisType,
      focusAreas
    });

    res.status(200).json(analysis);
  } catch (error) {
    console.error('Risk analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze risk',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
```

## Prompt Templates

### 1. RAG Query Prompts (prompts/rag-templates.ts)

```typescript
export const RAG_PROMPTS = {
  estimator: {
    system: `You are an expert commercial roofing estimator assistant. 
    You help identify costs, risks, and opportunities in project documents.
    Focus on: exclusions, alternates, warranty requirements, material specifications, 
    and anything that could impact project margin.
    Always cite specific document sections and page numbers.`,
    
    queryTemplate: (query: string, context: string) => `
      Based on the following project documents, answer this estimator's question:
      
      Question: ${query}
      
      Document Context:
      ${context}
      
      Provide a clear, actionable answer that:
      1. Directly addresses the question
      2. Cites specific document sections with page numbers
      3. Highlights any cost implications or risks
      4. Suggests follow-up items if relevant
      
      Format your response for an experienced estimator who needs quick, accurate information.
    `
  },
  
  pm: {
    system: `You are a project management assistant for commercial roofing.
    Focus on: schedules, milestones, submittal requirements, coordination items,
    safety protocols, and quality control procedures.
    Always provide actionable information with specific references.`,
    
    queryTemplate: (query: string, context: string) => `
      Based on the project documents, answer this project manager's question:
      
      Question: ${query}
      
      Document Context:
      ${context}
      
      Provide a response that:
      1. Addresses scheduling and coordination aspects
      2. Identifies dependencies and critical path items
      3. References specific submittal or inspection requirements
      4. Highlights any risks to project timeline
      
      Format for a PM who needs to coordinate multiple stakeholders.
    `
  },
  
  field: {
    system: `You are a field installation expert for commercial roofing.
    Focus on: installation specifications, detail drawings, material handling,
    safety requirements, and inspection points.
    Provide clear, step-by-step guidance when relevant.`,
    
    queryTemplate: (query: string, context: string) => `
      Based on the project specifications, answer this field question:
      
      Question: ${query}
      
      Document Context:
      ${context}
      
      Provide a response that:
      1. Gives clear installation guidance
      2. References specific detail drawings or specifications
      3. Highlights critical quality control points
      4. Notes any special tools or conditions required
      
      Format for field personnel who need immediate, practical answers.
    `
  },
  
  owner: {
    system: `You are a building owner's representative assistant.
    Focus on: warranty coverage, maintenance requirements, system longevity,
    cost optimization opportunities, and long-term value.
    Explain technical concepts in business terms.`,
    
    queryTemplate: (query: string, context: string) => `
      Based on the project documents, answer this building owner's question:
      
      Question: ${query}
      
      Document Context:
      ${context}
      
      Provide a response that:
      1. Explains in non-technical terms when appropriate
      2. Focuses on long-term value and ROI
      3. Highlights warranty and maintenance implications
      4. Identifies opportunities for cost optimization
      
      Format for a building owner making investment decisions.
    `
  }
};
```

### 2. Risk Scoring Prompts (prompts/risk-scoring.ts)

```typescript
export const RISK_SCORING_PROMPTS = {
  comprehensiveAnalysis: {
    system: `You are a senior risk analyst specializing in commercial roofing projects.
    Analyze project documents to identify risks, opportunities, and critical issues.
    Score risks based on probability and impact.
    Consider: contractual risks, technical challenges, schedule risks, cost exposure, 
    safety concerns, and quality issues.`,
    
    analysisTemplate: (documents: string) => `
      Analyze these commercial roofing project documents for comprehensive risk assessment:
      
      Documents:
      ${documents}
      
      Provide a structured risk analysis including:
      
      1. CRITICAL RISKS (could derail project):
         - Title and description
         - Probability (1-5) and Impact (1-5)
         - Evidence from documents (with references)
         - Recommended mitigation
      
      2. HIGH PRIORITY RISKS (significant impact):
         - Same structure as above
      
      3. OPPORTUNITIES (cost savings or improvements):
         - Description and potential value
         - Implementation approach
         - Required actions
      
      4. CONTRACTUAL CONCERNS:
         - Ambiguous terms
         - Missing specifications
         - Conflicting requirements
      
      5. TECHNICAL CHALLENGES:
         - Complex details or transitions
         - Unusual specifications
         - Potential field issues
      
      6. OVERALL RISK SCORE (0-100):
         - Weighted calculation explanation
         - Confidence level in assessment
      
      Format as structured JSON for system processing.
    `
  },
  
  bidAnalysis: {
    system: `You are a commercial roofing bid analyst.
    Compare bids to identify discrepancies, missing items, and negotiation opportunities.
    Focus on finding margin protection opportunities and hidden costs.`,
    
    bidComparisonTemplate: (bids: string, specs: string) => `
      Compare these roofing bids against project specifications:
      
      Bids:
      ${bids}
      
      Specifications:
      ${specs}
      
      Analyze and identify:
      
      1. SCOPE GAPS:
         - Items in specs but missing from bids
         - Inconsistent interpretations
         - Potential change order risks
      
      2. PRICING ANOMALIES:
         - Significant variations between bidders
         - Unusually low/high line items
         - Missing cost components
      
      3. NEGOTIATION OPPORTUNITIES:
         - Alternate proposals with value
         - Combinable bid elements
         - Value engineering possibilities
      
      4. RED FLAGS:
         - Concerning exclusions
         - Unrealistic timelines
         - Missing qualifications
      
      Provide specific recommendations for bid leveling and negotiation.
    `
  }
};
```

## Sample Seed Data

### 1. Example Projects (data/seed-data.ts)

```typescript
export const SAMPLE_PROJECTS = [
  {
    id: 'proj_001',
    name: 'Denver Tech Center - Building A Reroof',
    value: 2500000,
    type: 'commercial',
    squareFootage: 85000,
    roofingSystem: 'TPO Mechanically Attached',
    status: 'bidding',
    documents: [
      {
        id: 'doc_001',
        name: 'DTC-Building-A-Specifications.pdf',
        type: 'specification',
        uploadedAt: new Date('2024-01-15'),
        status: 'indexed',
        metadata: {
          pageCount: 145,
          extractedEntities: ['TPO', '60-mil', 'Carlisle', 'R-30', 'warranty']
        }
      },
      {
        id: 'doc_002',
        name: 'Roofing-Details-DTC-A.pdf',
        type: 'drawing',
        uploadedAt: new Date('2024-01-15'),
        status: 'indexed',
        metadata: {
          pageCount: 22,
          extractedEntities: ['parapet', 'scupper', 'expansion joint', 'RTU curb']
        }
      }
    ],
    sampleQueries: [
      {
        persona: 'estimator',
        queries: [
          "What warranty is required for this project?",
          "Are there any alternates specified?",
          "What are the moisture testing requirements?",
          "List all owner-supplied materials"
        ]
      },
      {
        persona: 'field',
        queries: [
          "What's the required fastening pattern for field sheets?",
          "Show me the parapet flashing details",
          "What are the primer requirements for TPO?",
          "Where are the tie-in locations?"
        ]
      }
    ]
  }
];

export const SAMPLE_INSIGHTS = [
  {
    id: 'insight_001',
    type: 'risk',
    severity: 'critical',
    title: 'Missing Structural Deck Evaluation',
    description: 'Specifications require new roofing over existing deck, but no structural evaluation report is included. Steel deck gauge and condition unknown.',
    documentReferences: ['doc_001:p.23', 'doc_001:p.45'],
    suggestedAction: 'Request structural evaluation or add contingency for deck replacement',
    potentialImpact: {
      cost: 150000,
      schedule: 10
    }
  },
  {
    id: 'insight_002',
    type: 'opportunity',
    severity: 'medium',
    title: 'Alternate Insulation Value Engineering',
    description: 'Specification allows polyiso or stone wool. Current pricing favors polyiso by approximately 18% with equivalent R-value.',
    documentReferences: ['doc_001:p.67'],
    suggestedAction: 'Propose polyiso alternate for cost savings',
    potentialImpact: {
      cost: -85000
    }
  },
  {
    id: 'insight_003',
    type: 'risk',
    severity: 'high',
    title: 'Aggressive Milestone Schedule',
    description: 'Phase 1 completion requires 45,000 SF in 3 weeks. Typical crew production is 12,000 SF/week.',
    documentReferences: ['doc_001:p.12', 'doc_002:p.3'],
    suggestedAction: 'Negotiate extended Phase 1 timeline or plan for multiple crews',
    potentialImpact: {
      cost: 35000,
      schedule: 7
    }
  }
];

export const SAMPLE_BID_DATA = {
  project: 'DTC Building A',
  bids: [
    {
      contractor: 'Alpine Roofing',
      total: 2450000,
      breakdown: {
        tearOff: 180000,
        insulation: 420000,
        membrane: 680000,
        flashings: 320000,
        walkwayPads: 45000,
        warranty: 85000,
        generalConditions: 185000,
        overhead: 245000,
        profit: 290000
      },
      exclusions: [
        'Structural deck repairs',
        'Asbestos abatement',
        'After-hours work',
        'Winter conditions'
      ],
      alternates: {
        'Stone wool insulation': 125000,
        'PVC membrane': 85000,
        '20-year NDL warranty': 45000
      }
    },
    {
      contractor: 'Summit Commercial Roofing',
      total: 2380000,
      breakdown: {
        tearOff: 165000,
        insulation: 395000,
        membrane: 690000,
        flashings: 285000,
        walkwayPads: 'Included',
        warranty: 120000,
        generalConditions: 210000,
        overhead: 238000,
        profit: 277000
      },
      exclusions: [
        'Rock ballast removal',
        'Structural modifications',
        'Premium time work',
        'Temporary roofing'
      ],
      alternates: {
        'Tapered insulation system': 95000,
        'Fluid-applied flashings': 65000
      }
    }
  ]
};
```

## Security & Edge Cases

### 1. Security Configuration (config/security.ts)

```typescript
export const SECURITY_CONFIG = {
  // API Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    message: 'Too many requests from this IP'
  },
  
  // File Upload Restrictions
  upload: {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedMimeTypes: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'application/acad',
      'image/vnd.dwg'
    ],
    maxFilesPerUpload: 10,
    scanForMalware: true
  },
  
  // Authentication & Authorization
  auth: {
    sessionTimeout: 8 * 60 * 60 * 1000, // 8 hours
    requireMFA: false, // Set true for production
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    jwtSecret: process.env.JWT_SECRET || 'development-secret'
  },
  
  // Data Encryption
  encryption: {
    algorithm: 'aes-256-gcm',
    keyDerivation: 'pbkdf2',
    iterations: 100000
  },
  
  // Content Security
  contentSecurity: {
    maxQueryLength: 1000,
    maxContextWindow: 8000,
    sanitizeUserInput: true,
    preventPromptInjection: true
  },
  
  // Audit Logging
  audit: {
    logAllQueries: true,
    logFileAccess: true,
    retentionDays: 90
  }
};

// Input Sanitization
export function sanitizeInput(input: string): string {
  // Remove potential prompt injection attempts
  const cleaned = input
    .replace(/(\[INST\]|\[\/INST\]|<\|im_start\|>|<\|im_end\|>)/gi, '')
    .replace(/^(system:|user:|assistant:)/gmi, '')
    .trim();
  
  // Limit length
  return cleaned.substring(0, SECURITY_CONFIG.contentSecurity.maxQueryLength);
}

// File Type Validation
export function validateFileType(file: File): boolean {
  return SECURITY_CONFIG.upload.allowedMimeTypes.includes(file.type);
}

// API Key Validation
export function validateAPIKey(key: string): boolean {
  // In production, check against database or external service
  const validKeys = process.env.VALID_API_KEYS?.split(',') || [];
  return validKeys.includes(key);
}
```

### 2. Edge Case Handling

```typescript
// Document Processing Edge Cases
export const EDGE_CASE_HANDLERS = {
  // Handle corrupted PDFs
  corruptedPDF: async (file: File): Promise<ProcessingResult> => {
    try {
      // Attempt repair with pdf-lib
      const repairedPDF = await attemptPDFRepair(file);
      return { status: 'repaired', file: repairedPDF };
    } catch {
      // Fall back to OCR if available
      return { status: 'requires_ocr', file };
    }
  },
  
  // Handle oversized files
  oversizedFile: async (file: File): Promise<ProcessingResult> => {
    // Split into chunks for processing
    const chunks = await splitFileIntoChunks(file, 25 * 1024 * 1024);
    return { status: 'chunked', chunks };
  },
  
  // Handle missing embeddings
  missingEmbeddings: async (document: Document): Promise<void> => {
    // Queue for background embedding generation
    await queueEmbeddingGeneration(document.id);
  },
  
  // Handle API failures
  apiFailure: async (error: Error, retryCount: number): Promise<boolean> => {
    if (retryCount < 3) {
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
      return true; // Retry
    }
    // Log to error tracking service
    await logError(error, 'API_FAILURE');
    return false; // Don't retry
  },
  
  // Handle context window overflow
  contextOverflow: async (context: string, limit: number): Promise<string> => {
    // Use sliding window approach
    const relevantChunks = await extractMostRelevantChunks(context, limit);
    return relevantChunks.join('\n\n...\n\n');
  }
};

// Fallback Responses
export const FALLBACK_RESPONSES = {
  documentProcessingError: "I'm having trouble reading that document. Please try uploading it again or contact support if the issue persists.",
  
  queryError: "I couldn't process your question. Try rephrasing it or breaking it into smaller parts.",
  
  noRelevantContent: "I couldn't find specific information about that in the uploaded documents. Try asking about specific sections or topics covered in the specifications.",
  
  systemOverload: "The system is experiencing high demand. Your request has been queued and will process shortly.",
  
  insufficientContext: "I need more information to answer accurately. Please upload additional project documents or provide more specific details."
};
```

## Step-by-Step Implementation Guide

### Phase 1: Environment Setup (Week 1)

1. **Initialize Next.js Project**
   ```bash
   npx create-next-app@latest ai-copilot --typescript --tailwind --app
   cd ai-copilot
   npm install framer-motion lucide-react react-dropzone
   npm install openai langchain @pinecone-database/pinecone
   npm install formidable pdf-parse xlsx
   ```

2. **Configure Environment Variables**
   ```env
   OPENAI_API_KEY=sk-...
   PINECONE_API_KEY=...
   PINECONE_INDEX=roofgenius-docs
   DATABASE_URL=postgresql://...
   REDIS_URL=redis://...
   JWT_SECRET=...
   ```

3. **Set Up Database**
   - Install Prisma: `npm install prisma @prisma/client`
   - Create schema with projects, documents, embeddings tables
   - Run migrations: `npx prisma migrate dev`

### Phase 2: Document Processing (Week 2)

1. **Implement Document Upload**
   - Create multipart form handler
   - Add file type validation
   - Set up S3 storage for originals

2. **Build Processing Pipeline**
   - PDF text extraction
   - Excel/Word parsing
   - Image OCR (if needed)

3. **Generate Embeddings**
   - Chunk documents intelligently
   - Create OpenAI embeddings
   - Store in Pinecone with metadata

### Phase 3: RAG Implementation (Week 3)

1. **Set Up Vector Search**
   - Configure Pinecone index
   - Implement similarity search
   - Add metadata filtering

2. **Create Query Engine**
   - Build persona-specific prompts
   - Implement context window management
   - Add source attribution

3. **Develop Response Pipeline**
   - Extract document references
   - Generate insights
   - Calculate confidence scores

### Phase 4: Risk Analysis (Week 4)

1. **Build Analysis Engine**
   - Create comprehensive prompts
   - Implement structured output parsing
   - Add scoring algorithms

2. **Develop Insight Generation**
   - Pattern recognition for risks
   - Opportunity identification
   - Action recommendation engine

### Phase 5: Frontend Integration (Week 5)

1. **Create React Components**
   - Build all UI components
   - Add Framer Motion animations
   - Implement responsive design

2. **Connect to APIs**
   - Set up API client
   - Add error handling
   - Implement loading states

3. **Add Real-time Features**
   - WebSocket for live updates
   - Progress tracking
   - Notification system

### Phase 6: Testing & Optimization (Week 6)

1. **Performance Testing**
   - Load test with large documents
   - Optimize query performance
   - Add caching layer

2. **Security Hardening**
   - Implement rate limiting
   - Add input sanitization
   - Set up audit logging

### Phase 7: Deployment (Week 7)

1. **Production Setup**
   - Configure Docker containers
   - Set up CI/CD pipeline
   - Deploy to cloud provider

2. **Monitoring**
   - Add application monitoring
   - Set up error tracking
   - Configure performance alerts

### Phase 8: Team Training (Week 8)

1. **Documentation**
   - API documentation
   - User guides
   - Video tutorials

2. **Pilot Program**
   - Select beta users
   - Gather feedback
   - Iterate on UX

## What to Watch For

### Post-Deployment Monitoring

**Performance Metrics**
- Query response time < 3 seconds
- Document processing < 30 seconds per 100 pages
- 99.9% uptime target
- Support 50+ concurrent users

**Common Issues**
- Large PDF handling (> 500 pages)
- Complex Excel formulas
- Handwritten drawings
- Network latency for remote teams

**Scaling Considerations**
- Vector index partitioning at 1M+ documents
- Query caching for common questions
- CDN for document delivery
- Read replicas for database

This AI Copilot transforms how your teams interact with project documentation, providing protective intelligence that prevents costly mistakes while surfacing hidden opportunities. The system scales with your business and adapts to user feedback, creating lasting competitive advantage in the field.