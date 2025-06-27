Sprint 08 — Claude Tools Integration
Objective
Integrate Claude's advanced AI capabilities as intelligent tools throughout the platform, providing context-aware assistance, document generation, technical analysis, and protective decision support.
File Targets

lib/ai/claude-tools.ts (create)
components/ai/ClaudeAssistant.tsx (create)
components/ai/DocumentGenerator.tsx (create)
components/ai/TechnicalAnalyzer.tsx (create)
app/api/claude/[tool]/route.ts (create)
types/claude-tools.ts (create)
lib/ai/prompt-templates.ts (create)

Step-by-Step Instructions
1. Define Claude Tools Types
typescript// types/claude-tools.ts
export interface ClaudeTool {
  id: string;
  name: string;
  description: string;
  category: 'analysis' | 'generation' | 'validation' | 'protection';
  requiredContext: string[];
  outputFormat: 'text' | 'structured' | 'document' | 'checklist';
}

export interface ClaudeContext {
  projectType?: string;
  roofSystem?: RoofSystem;
  userData?: UserProfile;
  historicalData?: any[];
  regulations?: BuildingCode[];
  marketConditions?: MarketData;
}

export interface ClaudeResponse {
  toolId: string;
  status: 'success' | 'warning' | 'error';
  content: any;
  confidence: number;
  reasoning?: string;
  recommendations?: string[];
  protectiveAlerts?: Alert[];
}

export interface Alert {
  severity: 'info' | 'warning' | 'critical';
  category: 'cost' | 'safety' | 'compliance' | 'performance';
  message: string;
  preventiveAction?: string;
}

export const CLAUDE_TOOLS: ClaudeTool[] = [
  {
    id: 'estimate-validator',
    name: 'Estimate Validation & Protection',
    description: 'Analyzes estimates for completeness, accuracy, and hidden risks',
    category: 'protection',
    requiredContext: ['projectType', 'roofSystem', 'regulations'],
    outputFormat: 'structured'
  },
  {
    id: 'spec-generator',
    name: 'Technical Specification Generator',
    description: 'Creates detailed, code-compliant specifications',
    category: 'generation',
    requiredContext: ['projectType', 'roofSystem', 'regulations'],
    outputFormat: 'document'
  },
  {
    id: 'risk-analyzer',
    name: 'Project Risk Analyzer',
    description: 'Identifies and quantifies project risks with mitigation strategies',
    category: 'analysis',
    requiredContext: ['projectType', 'historicalData', 'marketConditions'],
    outputFormat: 'structured'
  },
  {
    id: 'decision-support',
    name: 'Decision Support System',
    description: 'Provides data-driven recommendations for critical decisions',
    category: 'protection',
    requiredContext: ['projectType', 'userData', 'historicalData'],
    outputFormat: 'structured'
  }
];
2. Create Claude Tools Core Library
typescript// lib/ai/claude-tools.ts
import Anthropic from '@anthropic-ai/sdk';
import { ClaudeTool, ClaudeContext, ClaudeResponse } from '@/types/claude-tools';
import { getPromptTemplate } from './prompt-templates';

export class ClaudeToolsManager {
  private anthropic: Anthropic;
  private systemPrompt: string;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY!,
    });

    this.systemPrompt = `You are a protective AI system for commercial roofing professionals. 
    Your purpose is to prevent costly mistakes, ensure compliance, and provide decision support 
    that protects both the professional and their clients. Always:
    
    1. Identify potential risks or issues before they become problems
    2. Provide specific, actionable recommendations
    3. Reference relevant codes, standards, or best practices
    4. Quantify impacts when possible (cost, time, risk)
    5. Maintain a protective, supportive tone
    
    You have deep expertise in commercial roofing systems, building codes, 
    estimation practices, and project management.`;
  }

  async executeTool(
    toolId: string, 
    context: ClaudeContext
  ): Promise<ClaudeResponse> {
    const tool = CLAUDE_TOOLS.find(t => t.id === toolId);
    if (!tool) {
      throw new Error(`Unknown tool: ${toolId}`);
    }

    // Validate required context
    const missingContext = tool.requiredContext.filter(
      req => !context[req as keyof ClaudeContext]
    );
    
    if (missingContext.length > 0) {
      return {
        toolId,
        status: 'error',
        content: null,
        confidence: 0,
        reasoning: `Missing required context: ${missingContext.join(', ')}`
      };
    }

    try {
      const prompt = getPromptTemplate(toolId, context);
      
      const message = await this.anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 4000,
        temperature: 0.3,
        system: this.systemPrompt,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const response = this.parseResponse(message.content[0].text, tool);
      
      return {
        toolId,
        status: 'success',
        ...response
      };
    } catch (error) {
      console.error('Claude tool execution error:', error);
      return {
        toolId,
        status: 'error',
        content: null,
        confidence: 0,
        reasoning: 'Failed to execute AI analysis'
      };
    }
  }

  private parseResponse(text: string, tool: ClaudeTool): Partial<ClaudeResponse> {
    // Parse based on output format
    switch (tool.outputFormat) {
      case 'structured':
        return this.parseStructuredResponse(text);
      case 'document':
        return this.parseDocumentResponse(text);
      case 'checklist':
        return this.parseChecklistResponse(text);
      default:
        return { content: text, confidence: 0.8 };
    }
  }

  private parseStructuredResponse(text: string): Partial<ClaudeResponse> {
    // Extract JSON from response
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      try {
        const data = JSON.parse(jsonMatch[1]);
        return {
          content: data,
          confidence: data.confidence || 0.85,
          reasoning: data.reasoning,
          recommendations: data.recommendations,
          protectiveAlerts: data.alerts
        };
      } catch (e) {
        console.error('Failed to parse structured response:', e);
      }
    }
    
    return { content: text, confidence: 0.7 };
  }

  private parseDocumentResponse(text: string): Partial<ClaudeResponse> {
    // Extract sections and format as document
    const sections = text.split(/^#+\s+/m).filter(Boolean);
    const document = {
      title: sections[0]?.trim() || 'Generated Document',
      sections: sections.slice(1).map(section => {
        const [heading, ...content] = section.split('\n');
        return {
          heading: heading.trim(),
          content: content.join('\n').trim()
        };
      })
    };
    
    return {
      content: document,
      confidence: 0.9
    };
  }

  private parseChecklistResponse(text: string): Partial<ClaudeResponse> {
    const lines = text.split('\n');
    const checklist = lines
      .filter(line => line.match(/^[\-\*]\s+/))
      .map(line => {
        const checked = line.includes('[x]');
        const text = line.replace(/^[\-\*]\s+|\[.\]\s+/g, '').trim();
        return { checked, text };
      });
    
    return {
      content: checklist,
      confidence: 0.85
    };
  }

  async validateEstimate(estimate: any, context: ClaudeContext): Promise<ClaudeResponse> {
    return this.executeTool('estimate-validator', {
      ...context,
      estimate
    });
  }

  async generateSpecification(requirements: any, context: ClaudeContext): Promise<ClaudeResponse> {
    return this.executeTool('spec-generator', {
      ...context,
      requirements
    });
  }

  async analyzeRisks(project: any, context: ClaudeContext): Promise<ClaudeResponse> {
    return this.executeTool('risk-analyzer', {
      ...context,
      project
    });
  }

  async getDecisionSupport(decision: any, context: ClaudeContext): Promise<ClaudeResponse> {
    return this.executeTool('decision-support', {
      ...context,
      decision
    });
  }
}
3. Create Claude Assistant Component
tsx// components/ai/ClaudeAssistant.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Shield, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import GlassPanel from '@/components/ui/GlassPanel';
import { ClaudeToolsManager } from '@/lib/ai/claude-tools';
import { ClaudeResponse, Alert } from '@/types/claude-tools';

interface ClaudeAssistantProps {
  context: any;
  toolId?: string;
  autoAnalyze?: boolean;
  onAnalysisComplete?: (response: ClaudeResponse) => void;
}

export default function ClaudeAssistant({
  context,
  toolId = 'decision-support',
  autoAnalyze = false,
  onAnalysisComplete
}: ClaudeAssistantProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [response, setResponse] = useState<ClaudeResponse | null>(null);
  const [selectedTool, setSelectedTool] = useState(toolId);

  useEffect(() => {
    if (autoAnalyze && context) {
      runAnalysis();
    }
  }, [context, autoAnalyze]);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setResponse(null);

    try {
      const manager = new ClaudeToolsManager();
      const result = await manager.executeTool(selectedTool, context);
      setResponse(result);
      onAnalysisComplete?.(result);
    } catch (error) {
      console.error('Claude analysis error:', error);
      setResponse({
        toolId: selectedTool,
        status: 'error',
        content: null,
        confidence: 0,
        reasoning: 'Analysis failed. Please try again.'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getAlertIcon = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Shield className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <GlassPanel className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-500" />
          Claude AI Assistant
        </h3>
        <div className="flex items-center gap-2">
          <select
            value={selectedTool}
            onChange={(e) => setSelectedTool(e.target.value)}
            className="glass-input px-3 py-1 rounded-lg text-sm"
          >
            <option value="estimate-validator">Estimate Validator</option>
            <option value="spec-generator">Spec Generator</option>
            <option value="risk-analyzer">Risk Analyzer</option>
            <option value="decision-support">Decision Support</option>
          </select>
          <button
            onClick={runAnalysis}
            disabled={isAnalyzing}
            className="glass-button-primary px-4 py-2 rounded-lg flex items-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4" />
                Analyze
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Results */}
      <AnimatePresence mode="wait">
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="glass-panel-loading h-32 rounded-lg" />
            <p className="text-center text-gray-400">
              Claude is analyzing your {selectedTool.replace('-', ' ')}...
            </p>
          </motion.div>
        )}

        {response && !isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Confidence Indicator */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Analysis Confidence</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-white/10 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full"
                    style={{ width: `${response.confidence * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium">
                  {Math.round(response.confidence * 100)}%
                </span>
              </div>
            </div>

            {/* Protective Alerts */}
            {response.protectiveAlerts && response.protectiveAlerts.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Protective Alerts
                </h4>
                {response.protectiveAlerts.map((alert, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="glass-panel p-4 rounded-lg"
                  >
                    <div className="flex items-start gap-3">
                      {getAlertIcon(alert.severity)}
                      <div className="flex-1">
                        <p className="font-medium">{alert.message}</p>
                        {alert.preventiveAction && (
                          <p className="text-sm text-gray-400 mt-1">
                            Action: {alert.preventiveAction}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Recommendations */}
            {response.recommendations && response.recommendations.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Recommendations
                </h4>
                <ul className="space-y-2">
                  {response.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Main Content */}
            {response.content && (
              <div className="glass-panel p-6 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm">
                  {typeof response.content === 'string' 
                    ? response.content 
                    : JSON.stringify(response.content, null, 2)}
                </pre>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </GlassPanel>
  );
}
4. Create Prompt Templates
typescript// lib/ai/prompt-templates.ts
import { ClaudeContext } from '@/types/claude-tools';

export function getPromptTemplate(toolId: string, context: ClaudeContext): string {
  switch (toolId) {
    case 'estimate-validator':
      return getEstimateValidationPrompt(context);
    case 'spec-generator':
      return getSpecGeneratorPrompt(context);
    case 'risk-analyzer':
      return getRiskAnalyzerPrompt(context);
    case 'decision-support':
      return getDecisionSupportPrompt(context);
    default:
      throw new Error(`No prompt template for tool: ${toolId}`);
  }
}

function getEstimateValidationPrompt(context: ClaudeContext): string {
  return `Analyze this commercial roofing estimate for completeness, accuracy, and hidden risks.

Project Context:
- Type: ${context.projectType}
- Roof System: ${JSON.stringify(context.roofSystem, null, 2)}
- Location: ${context.location || 'Not specified'}
- Building Codes: ${JSON.stringify(context.regulations, null, 2)}

Estimate to Validate:
${JSON.stringify(context.estimate, null, 2)}

Perform a comprehensive analysis and return a JSON response with this structure:
\`\`\`json
{
  "confidence": 0.0-1.0,
  "overall_assessment": "complete|incomplete|concerning",
  "missing_items": [
    {
      "category": "materials|labor|equipment|other",
      "item": "description",
      "estimated_cost": number,
      "impact": "low|medium|high"
    }
  ],
  "pricing_analysis": {
    "total_variance": "percentage from market rates",
    "concerning_items": ["items priced unusually"],
    "market_comparison": "below|at|above market"
  },
  "compliance_issues": [
    {
      "code": "code reference",
      "issue": "description",
      "required_action": "what needs to be done"
    }
  ],
  "alerts": [
    {
      "severity": "info|warning|critical",
      "category": "cost|safety|compliance|performance",
      "message": "clear description",
      "preventiveAction": "specific action to take"
    }
  ],
  "recommendations": [
    "specific, actionable recommendations"
  ],
  "reasoning": "detailed explanation of the analysis"
}
\`\`\`

Focus on protecting the user from:
1. Missing cost items that could blow the budget
2. Non-compliance with local codes
3. Unrealistic pricing (too low or too high)
4. Scope creep vulnerabilities
5. Weather/seasonal considerations
6. Hidden warranty or maintenance costs`;
}

function getSpecGeneratorPrompt(context: ClaudeContext): string {
  return `Generate a detailed, code-compliant technical specification for this commercial roofing project.

Project Requirements:
${JSON.stringify(context.requirements, null, 2)}

Context:
- Project Type: ${context.projectType}
- Roof System: ${JSON.stringify(context.roofSystem, null, 2)}
- Building Codes: ${JSON.stringify(context.regulations, null, 2)}
- Climate Zone: ${context.climateZone || 'Not specified'}

Create a comprehensive specification document that:
1. Meets all applicable building codes
2. Specifies exact materials with ASTM standards
3. Details installation procedures and quality standards
4. Includes testing and inspection requirements
5. Addresses warranty requirements
6. Considers local climate and conditions

Format the response as a structured document with clear sections:
- Executive Summary
- Scope of Work
- Materials Specifications
- Installation Procedures
- Quality Assurance
- Testing Requirements
- Warranty Provisions
- Special Conditions

Ensure the specification protects both the contractor and building owner.`;
}

function getRiskAnalyzerPrompt(context: ClaudeContext): string {
  return `Analyze project risks and provide mitigation strategies.

Project Details:
${JSON.stringify(context.project, null, 2)}

Historical Data:
${JSON.stringify(context.historicalData, null, 2)}

Market Conditions:
${JSON.stringify(context.marketConditions, null, 2)}

Identify and quantify all project risks, returning a JSON response:
\`\`\`json
{
  "confidence": 0.0-1.0,
  "risk_score": 0-100,
  "risks": [
    {
      "category": "financial|schedule|technical|regulatory|weather|market",
      "description": "clear risk description",
      "probability": 0.0-1.0,
      "impact": "low|medium|high|critical",
      "cost_impact": number,
      "schedule_impact": "days",
      "mitigation_strategy": "specific actions",
      "early_warning_signs": ["what to watch for"]
    }
  ],
  "contingency_recommendations": {
    "cost_contingency": "percentage",
    "schedule_buffer": "days",
    "rationale": "explanation"
  },
  "alerts": [
    {
      "severity": "info|warning|critical",
      "category": "risk category",
      "message": "clear alert",
      "preventiveAction": "immediate action needed"
    }
  ],
  "recommendations": ["prioritized risk management actions"],
  "reasoning": "detailed risk analysis explanation"
}
\`\`\``;
}

function getDecisionSupportPrompt(context: ClaudeContext): string {
  return `Provide data-driven decision support for this situation.

Decision Context:
${JSON.stringify(context.decision, null, 2)}

User Profile:
${JSON.stringify(context.userData, null, 2)}

Historical Data:
${JSON.stringify(context.historicalData, null, 2)}

Analyze the situation and provide protective decision support:
\`\`\`json
{
  "confidence": 0.0-1.0,
  "recommended_action": "clear recommendation",
  "alternatives": [
    {
      "option": "description",
      "pros": ["benefits"],
      "cons": ["drawbacks"],
      "success_probability": 0.0-1.0,
      "estimated_outcome": "description"
    }
  ],
  "decision_factors": [
    {
      "factor": "key consideration",
      "weight": "high|medium|low",
      "current_state": "description",
      "optimal_state": "description"
    }
  ],
  "alerts": [
    {
      "severity": "info|warning|critical",
      "category": "relevant category",
      "message": "protective alert",
      "preventiveAction": "specific action"
    }
  ],
  "recommendations": ["prioritized action items"],
  "reasoning": "detailed explanation of recommendation"
}
\`\`\`

Focus on protecting the user's:
1. Financial interests
2. Professional reputation
3. Legal/regulatory compliance
4. Time and resources
5. Long-term success`;
}
5. Create API Routes
typescript// app/api/claude/[tool]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ClaudeToolsManager } from '@/lib/ai/claude-tools';
import { ClaudeContext } from '@/types/claude-tools';

export async function POST(
  request: NextRequest,
  { params }: { params: { tool: string } }
) {
  try {
    const context: ClaudeContext = await request.json();
    const manager = new ClaudeToolsManager();
    
    const response = await manager.executeTool(params.tool, context);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Claude API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
Commit Message
feat(ai): integrated Claude AI tools for intelligent validation, generation, and protective decision support
QA/Acceptance Checklist

 Claude tools accessible from all major workflows
 Estimate validator catches missing items and compliance issues
 Spec generator creates complete, code-compliant documents
 Risk analyzer provides quantified risk assessments
 Decision support offers clear, protective recommendations
 All responses include confidence scores and reasoning
 Protective alerts display prominently with glassmorphic styling
 Tool selection works seamlessly in the UI

AI Execution Block
Codex/Operator Instructions:

Install Anthropic SDK: npm install @anthropic-ai/sdk
Set CLAUDE_API_KEY in .env.local
Test each tool with sample data for all project types
Verify JSON parsing handles all response formats
Ensure error handling covers API limits and failures
Test protective alerts display correctly in UI
Deploy with proper API key security

Advanced/Optional Enhancements

Add voice interface for Claude interactions
Implement learning from user feedback
Create custom tools for specific verticals
Add multi-language support for international projects
Build collaborative AI sessions for team decisions