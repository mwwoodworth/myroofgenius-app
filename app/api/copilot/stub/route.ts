export async function POST() {
  const text = "Hello from the AI Copilot stub endpoint.";
  const encoder = new TextEncoder();
  let i = 0;
  const stream = new ReadableStream({
    start(controller) {
      function push() {
        if (i < text.length) {
          controller.enqueue(encoder.encode(text[i]));
          i++;
          setTimeout(push, 50);
        } else {
          controller.close();
        }
      }
      push();
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Session-Id": "stub",
    },
  });
}
