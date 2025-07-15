import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeContext {
  persona?: 'estimator' | 'owner' | 'architect' | 'contractor';
  projectData?: any;
  userHistory?: ClaudeMessage[];
}

export async function generateClaudeResponse(
  message: string,
  context: ClaudeContext = {}
): Promise<string> {
  try {
    const systemPrompt = buildSystemPrompt(context);
    
    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1000,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        ...(context.userHistory || []),
        { role: 'user', content: message }
      ],
    });

    return response.content[0].type === 'text' 
      ? response.content[0].text 
      : 'I apologize, but I could not generate a response.';
  } catch (error) {
    console.error('Claude API error:', error);
    throw new Error('Failed to generate AI response');
  }
}

export async function streamClaudeResponse(
  message: string,
  context: ClaudeContext = {}
) {
  try {
    const systemPrompt = buildSystemPrompt(context);
    
    const stream = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229', // Faster for streaming
      max_tokens: 1000,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        ...(context.userHistory || []),
        { role: 'user', content: message }
      ],
      stream: true,
    });

    return stream;
  } catch (error) {
    console.error('Claude streaming error:', error);
    throw new Error('Failed to stream AI response');
  }
}

function buildSystemPrompt(context: ClaudeContext): string {
  const basePrompt = `You are MyRoofGenius AI Assistant, an expert in roofing estimation, materials, and project management. 
You provide accurate, helpful advice while being conversational and approachable.`;

  const personaPrompts = {
    estimator: `You're speaking to a roofing estimator. Focus on accuracy, measurements, material calculations, and cost optimization. Be technical but clear.`,
    owner: `You're speaking to a building owner. Focus on ROI, maintenance, warranties, and long-term value. Avoid overly technical jargon.`,
    architect: `You're speaking to an architect. Focus on design compatibility, aesthetic options, and technical specifications. Reference building codes when relevant.`,
    contractor: `You're speaking to a contractor. Focus on installation methods, crew efficiency, and practical field considerations. Be direct and actionable.`,
  };

  let prompt = basePrompt;
  
  if (context.persona) {
    prompt += `\n\n${personaPrompts[context.persona]}`;
  }

  if (context.projectData) {
    prompt += `\n\nCurrent project context: ${JSON.stringify(context.projectData)}`;
  }

  return prompt;
}

// Dynamic onboarding personalization
export async function generateOnboardingContent(persona: string, step: number) {
  const prompts = {
    estimator: {
      1: "Generate a welcoming message for a roofing estimator starting their journey with MyRoofGenius. Focus on accuracy and efficiency benefits.",
      2: "Create a brief tutorial on importing existing estimates into MyRoofGenius for an estimator.",
      3: "Write an encouraging message about AI-assisted estimation accuracy for an estimator completing onboarding.",
    },
    owner: {
      1: "Generate a welcoming message for a building owner using MyRoofGenius. Focus on cost savings and peace of mind.",
      2: "Create a simple guide on understanding roof reports for a building owner.",
      3: "Write a message about long-term roof maintenance benefits for an owner completing onboarding.",
    },
    architect: {
      1: "Generate a welcoming message for an architect using MyRoofGenius. Focus on design integration and compliance.",
      2: "Create a guide on using MyRoofGenius for design specifications for an architect.",
      3: "Write about collaboration features for an architect completing onboarding.",
    },
    contractor: {
      1: "Generate a welcoming message for a contractor using MyRoofGenius. Focus on crew efficiency and job management.",
      2: "Create a practical guide on field app features for a contractor.",
      3: "Write about time-saving benefits for a contractor completing onboarding.",
    },
  };

  const prompt = prompts[persona]?.[step] || "Generate helpful onboarding content.";
  
  return generateClaudeResponse(prompt, { persona: persona as any });
}

// RAG implementation placeholder
export async function retrieveRelevantDocuments(query: string) {
  // TODO: Implement vector search with embeddings
  // For now, return mock relevant docs
  return [
    {
      title: "Roofing Materials Guide",
      content: "Common roofing materials include asphalt shingles, metal, tile...",
      relevance: 0.9
    }
  ];
}