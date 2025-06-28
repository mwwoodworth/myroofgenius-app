# Sprint 2: AI/Copilot Security & Reliability

## Why This Matters

Your AI Copilot is currently exposed to the public internet without authentication — anyone can drain your API quota and incur costs. Additionally, a typo in the model name means OpenAI requests are failing silently. This sprint secures your AI investment and ensures reliable operation for legitimate users.

## What This Protects

- Prevents unauthorized AI usage and cost overruns
- Ensures AI requests actually reach the intended model
- Protects your API keys from quota exhaustion
- Maintains consistent user experience across AI providers

## Sprint Objectives

### 🔴 Critical Fix 1: Secure the AI Endpoint

**Current Issue**: `/api/copilot` accepts requests from anyone, including the public

**Implementation**:
```typescript
// app/api/copilot/route.ts - Add authentication check
export async function POST(request: Request) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ 
    cookies: () => cookieStore 
  })
  
  // Require authentication
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Authentication required' }), 
      { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
  
  // Optional: Add rate limiting per user
  const { count } = await supabase
    .from('copilot_usage')
    .select('count', { count: 'exact' })
    .eq('user_id', user.id)
    .gte('created_at', new Date(Date.now() - 3600000).toISOString()) // Last hour
    
  if (count > 50) { // 50 requests per hour limit
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded' }), 
      { status: 429 }
    )
  }
  
  // Continue with existing chat logic...
}
```

**Database Migration for Rate Limiting**:
```sql
-- Migration: create_copilot_usage.sql
CREATE TABLE copilot_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  model TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_copilot_usage_user_created ON copilot_usage(user_id, created_at);

-- RLS Policy
ALTER TABLE copilot_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage" ON copilot_usage
  FOR SELECT USING (auth.uid() = user_id);
```

### 🔴 Critical Fix 2: Correct GPT-4 Model Name

**Current Issue**: Using "gpt-4o" instead of valid model name

**Implementation**:
```typescript
// app/lib/llm.ts - Fix model name
const MODELS = {
  OPENAI: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview', // or 'gpt-4'
  CLAUDE: 'claude-3-opus-20240229',
  GEMINI: 'gemini-pro'
} as const

async function chatOpenAI(messages: Message[]): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODELS.OPENAI, // Use corrected model name
      messages,
      temperature: 0.7,
      max_tokens: 500,
    }),
  })
  
  if (!response.ok) {
    const error = await response.json()
    console.error('OpenAI API Error:', error)
    throw new Error(`OpenAI API failed: ${error.error?.message || 'Unknown error'}`)
  }
  
  // Rest of implementation...
}
```

### ⚠️ Enhancement: Implement Claude Streaming

**Current Issue**: Claude responses appear all at once instead of streaming

**Implementation** (if time permits):
```typescript
// app/lib/llm.ts - Add Claude streaming support
async function chatStreamClaude(
  messages: Message[],
  onChunk: (text: string) => void
): Promise<void> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': process.env.CLAUDE_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODELS.CLAUDE,
      messages: messages.map(m => ({
        role: m.role === 'system' ? 'user' : m.role,
        content: m.content,
      })),
      stream: true,
      max_tokens: 500,
    }),
  })
  
  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    
    const chunk = decoder.decode(value)
    const lines = chunk.split('\n')
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6))
        if (data.type === 'content_block_delta') {
          onChunk(data.delta.text)
        }
      }
    }
  }
}
```

### 🛡️ Security Enhancement: API Key Rotation

**Implementation Checklist**:
- [ ] Rotate all AI API keys after implementing authentication
- [ ] Update environment variables in Vercel
- [ ] Add key rotation reminder to deployment checklist
- [ ] Implement API key usage monitoring

## Sprint Deliverables Checklist

### Code Changes
- [ ] Add authentication to Copilot endpoint
- [ ] Implement rate limiting (database + logic)
- [ ] Fix GPT-4 model name typo
- [ ] Add comprehensive error logging for API failures
- [ ] Update client to handle 401/429 responses gracefully

### Database Updates
- [ ] Create copilot_usage table migration
- [ ] Add RLS policies for usage tracking
- [ ] Test migration and rollback

### Configuration Updates
- [ ] Update .env.example with correct model names
- [ ] Document available model options
- [ ] Add OPENAI_MODEL to environment validation

### Testing Requirements
- [ ] Test unauthenticated requests are rejected
- [ ] Verify rate limiting works correctly
- [ ] Confirm GPT-4 requests succeed
- [ ] Test fallback behavior when API fails
- [ ] Load test with concurrent users

## What to Watch For

- **API Costs**: Monitor usage closely after deployment to ensure rate limits are appropriate
- **User Experience**: Ensure auth failures show helpful messages, not generic errors
- **Model Performance**: Track which AI model users prefer and performs best
- **Quota Warnings**: Set up alerts when approaching API limits

## Monitoring Setup

```typescript
// Add to Copilot endpoint for usage tracking
await supabase.from('copilot_usage').insert({
  user_id: user.id,
  tokens_used: estimatedTokens,
  model: selectedModel,
})

// Add to health check endpoint
const openAIHealth = await testOpenAIConnection()
const claudeHealth = await testClaudeConnection()
```

## Next Sprint Preview

Sprint 3 will fix UI consistency issues including the user role bug and theme switching problems that are confusing users.

---

**Sprint Duration**: 2-3 days  
**Risk Level**: Critical (System vulnerable to abuse, core feature broken)  
**Dependencies**: Must complete Sprint 1 auth fixes first