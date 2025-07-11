export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Stubbed chat helper used for demo builds
export async function chat(_messages: Message[]): Promise<string> {
  return 'LLM response disabled in this build.';
}
