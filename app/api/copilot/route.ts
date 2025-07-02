import { NextRequest, NextResponse } from 'next/server';
import { chatStream, ChatMessage } from '../../lib/llm';
import { logCopilotInteraction } from '../../../src/services/copilotLogger';

const sessions: Record<string, ChatMessage[]> = {};

export async function POST(req: NextRequest) {
  const { message, sessionId, userId } = await req.json();
  if (!message) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }

  const sid = sessionId || crypto.randomUUID();
  sessions[sid] = sessions[sid] || [];
  sessions[sid].push({ role: 'user', content: message });
  // Fire and forget logging of the user message
  logCopilotInteraction({
    session_id: sid,
    user_id: userId,
    role: 'user',
    message,
  }).catch(() => {});

  let responseText = '';
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      await chatStream(sessions[sid], (chunk) => {
        responseText += chunk;
        controller.enqueue(encoder.encode(chunk));
      });
      controller.close();
      sessions[sid].push({ role: 'assistant', content: responseText });
      // Log assistant response
      logCopilotInteraction({
        session_id: sid,
        user_id: userId,
        role: 'assistant',
        message: responseText,
      }).catch(() => {});
    }
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Session-Id': sid }
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sid = searchParams.get('sessionId');
  const history = (sid && sessions[sid]) || [];
  return NextResponse.json({ history });
}
