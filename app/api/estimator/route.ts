import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { size, material, location } = await req.json();
  const sqft = parseFloat(size) || 0;
  const estimated = sqft * 7; // simple placeholder logic
  const text = `For a ${sqft} sq ft ${material} roof in ${location || "your area"}, the estimated replacement cost is about $${estimated.toFixed(0)}.`;
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for (const char of text) {
        controller.enqueue(encoder.encode(char));
        await new Promise((r) => setTimeout(r, 50));
      }
      controller.close();
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
