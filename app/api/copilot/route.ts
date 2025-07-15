import { NextRequest } from 'next/server';
import { streamClaudeResponse, ClaudeContext } from '../../../lib/claude';

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId, context } = await req.json();
    
    // Build context from request
    const claudeContext: ClaudeContext = {
      persona: context?.persona,
      projectData: context?.projectData,
      userHistory: context?.history || [],
    };

    // Get streaming response from Claude
    const stream = await streamClaudeResponse(message, claudeContext);
    
    // Convert Anthropic stream to web stream
    const encoder = new TextEncoder();
    const webStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              controller.enqueue(encoder.encode(chunk.delta.text));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });

    return new Response(webStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Session-Id': sessionId || crypto.randomUUID(),
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });
  } catch (error) {
    console.error('Copilot API error:', error);
    
    // Fallback response if Claude API fails
    return new Response(
      JSON.stringify({ 
        error: 'AI service temporarily unavailable', 
        fallback: true 
      }), 
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId');
  
  // TODO: Implement session history retrieval from database
  return Response.json({ 
    sessionId, 
    history: [] 
  });
}
