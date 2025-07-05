import { NextRequest, NextResponse } from 'next/server';
import { chat } from '../../lib/llm';

export async function POST(req: NextRequest) {
  try {
    const { name, description } = await req.json();
    if (!name || !description) {
      return NextResponse.json({ error: 'missing data' }, { status: 400 });
    }
    const prompt = `Provide a concise, persuasive summary for a roofing product named "${name}". Base it on: ${description}`;
    const summary = await chat([{ role: 'user', content: prompt }]);
    return NextResponse.json({ summary });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Operation failed';
    console.error(`[ProductSummary] ${message}`);
    return NextResponse.json({ summary: '' });
  }
}
