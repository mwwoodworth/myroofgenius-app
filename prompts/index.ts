export const prompts: Record<string, string> = {
  copilot_intro: 'Hello from MyRoofGenius Copilot.'
}

export function getPrompt(name: string): string {
  return prompts[name] || ''
}
