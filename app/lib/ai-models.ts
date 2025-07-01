export async function analyzeRoofImage(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/ai/analyze-roof', { method: 'POST', body: formData });
  if (!res.ok) throw new Error('analysis failed');
  return res.json();
}

export async function chatWithAssistant(message: string) {
  const res = await fetch('/api/copilot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error('chat failed');
  const data = await res.json();
  return data.reply as string;
}
