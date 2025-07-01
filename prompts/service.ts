const localPrompts: Record<string, string> = {
  copilot_intro: 'Hello from MyRoofGenius Copilot.'
};

export async function fetchPrompt(name: string, version?: number): Promise<string> {
  const baseUrl = process.env.API_BASE_URL;
  if (baseUrl) {
    try {
      const url = version
        ? `${baseUrl}/api/prompts/${name}?version=${version}`
        : `${baseUrl}/api/prompts/${name}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        return (data.prompt || data.content) as string;
      }
    } catch (e) {
      console.error('prompt fetch failed', e);
    }
  }
  return localPrompts[name] || '';
}
