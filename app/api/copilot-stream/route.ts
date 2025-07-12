import type { NextRequest } from 'next/server';
import { POST as copilot } from '../copilot/route';

export async function POST(req: NextRequest) {
  return copilot(req);
}
