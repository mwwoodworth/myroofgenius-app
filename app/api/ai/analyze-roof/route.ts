import { NextRequest, NextResponse } from 'next/server';
import { chat } from '../../../lib/llm';

interface AnalysisResult {
  squareFeet: number
  damage: string
  confidence: number
  bbox?: [number, number, number, number]
}

async function fetchSatelliteImage(address: string): Promise<File> {
  const token = process.env.MAPBOX_TOKEN;
  if (!token) throw new Error('MAPBOX_TOKEN not set');
  const geoRes = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${token}`,
  );
  const geo = await geoRes.json();
  if (!geo.features?.length) throw new Error('address not found');
  const [lon, lat] = geo.features[0].center;
  const imgRes = await fetch(
    `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${lon},${lat},18/600x600?access_token=${token}`,
  );
  const buffer = await imgRes.arrayBuffer();
  return new File([buffer], 'satellite.jpg', { type: 'image/jpeg' });
}

async function analyzeWithLLM(file: File): Promise<AnalysisResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // Fallback to mock when API key is missing
    return { squareFeet: 1500, damage: 'unknown', confidence: 0.5 };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString('base64');

  const text = await chat([
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text:
            'Estimate the roof area in square feet and any visible damage. Respond strictly in JSON with fields squareFeet, damage, confidence and optional bbox [x,y,width,height].',
        },
        {
          type: 'image_url',
          image_url: `data:${file.type};base64,${base64}`,
        },
      ],
    },
  ]);

  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('no json');
    const json = JSON.parse(match[0]) as AnalysisResult;
    return json;
  } catch (error: unknown) {
    throw new Error('parse failed');
  }
}

async function analyze(file: File): Promise<AnalysisResult> {
  if (process.env.EDGE_AI_MODE === 'true' && process.env.API_BASE_URL) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${process.env.API_BASE_URL}/api/ai/analyze-roof`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) return res.json();
    } catch (error: unknown) {
      // ignore edge inference errors
    }
  }
  return analyzeWithLLM(file);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData() as FormData;
  let file = formData.get('file') as File | null;
  const address = formData.get('address') as string | null;

  if (!file && !address) {
    return NextResponse.json(
      { error: 'file or address required' },
      { status: 400 }
    );
  }

  if (address && !file) {
    try {
      file = await fetchSatelliteImage(address);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Operation failed';
      console.error(`[AnalyzeRoof] address fetch failed: ${message}`);
      return NextResponse.json(
        { error: 'Unable to complete request. Please refresh and try again.' },
        { status: 500 }
      );
    }
  }

  if (!file) {
    return NextResponse.json({ error: 'file missing' }, { status: 400 });
  }

  try {
    const result = await analyze(file);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Operation failed';
    console.error(`[AnalyzeRoof] analysis failed: ${message}`);
    return NextResponse.json(
      { error: 'Unable to complete request. Please refresh and try again.' },
      { status: 500 }
    );
  }
}
