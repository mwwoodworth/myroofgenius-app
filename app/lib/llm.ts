export type LLMProvider = 'openai' | 'claude' | 'gemini'

export interface ChatMessage {
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
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.warn('Claude API key not set, falling back to OpenAI')
    return callOpenAI(messages)
  }
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-opus-20240229',
      max_tokens: 400,
      messages,
    }),
  })
  const data = await res.json()
  return data?.content?.[0]?.text || ''
}

async function callGemini(messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.warn('Gemini API key not set, falling back to OpenAI')
    return callOpenAI(messages)
  }
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: 'user', parts: messages.map(m => ({ text: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) })) }] }),
    },
  )
  const data = await res.json()
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
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
