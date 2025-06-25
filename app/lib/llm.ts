export type LLMProvider = 'openai' | 'claude' | 'gemini'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string | any
}

async function callOpenAI(messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY not set')
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages,
      max_tokens: 400,
    }),
  })
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

async function callClaude(messages: ChatMessage[]): Promise<string> {
  // TODO: implement real Claude call
  console.warn('Claude integration not implemented')
  return callOpenAI(messages)
}

async function callGemini(messages: ChatMessage[]): Promise<string> {
  // TODO: implement real Gemini call
  console.warn('Gemini integration not implemented')
  return callOpenAI(messages)
}

export async function chat(messages: ChatMessage[], provider?: LLMProvider) {
  const p = provider || (process.env.LLM_PROVIDER as LLMProvider) || 'openai'
  switch (p) {
    case 'claude':
      return callClaude(messages)
    case 'gemini':
      return callGemini(messages)
    default:
      return callOpenAI(messages)
  }
}
