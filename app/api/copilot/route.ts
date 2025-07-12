import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { message } = await req.json();
  const reply = `Genius AI says: ${message || 'Hello! How can I help you with your roof today?'} `;
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for (const char of reply) {
        controller.enqueue(encoder.encode(char));
        await new Promise(r => setTimeout(r, 50));
      }
      controller.close();
    }
  });
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Session-Id': crypto.randomUUID(),
    }
  });
}
