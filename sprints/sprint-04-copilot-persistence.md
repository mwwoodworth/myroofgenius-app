# Sprint 04: Fix AI Copilot Session Persistence

## Objective
Replace the in-memory session storage for AI Copilot with database persistence to maintain conversation context across serverless instances and function restarts.

## Critical Context for Codex
- **Current Issue**: Chat history stored in global `sessions` object in server memory
- **Result**: Conversations reset when Lambda instances change or restart
- **Solution**: Persist sessions and messages to Supabase database tables

## Implementation Tasks

### Task 1: Create Database Tables
Run these migrations in Supabase SQL editor:

```sql
-- Create copilot sessions table
CREATE TABLE IF NOT EXISTS copilot_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true
);

-- Create copilot messages table
CREATE TABLE IF NOT EXISTS copilot_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES copilot_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  metadata JSONB DEFAULT '{}'
);

-- Create indexes for performance
CREATE INDEX idx_copilot_sessions_user_id ON copilot_sessions(user_id);
CREATE INDEX idx_copilot_sessions_updated_at ON copilot_sessions(updated_at);
CREATE INDEX idx_copilot_messages_session_id ON copilot_messages(session_id);
CREATE INDEX idx_copilot_messages_created_at ON copilot_messages(created_at);

-- Enable RLS
ALTER TABLE copilot_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE copilot_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for copilot_sessions
CREATE POLICY "Users can view own sessions" ON copilot_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions" ON copilot_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON copilot_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for copilot_messages
CREATE POLICY "Users can view messages from own sessions" ON copilot_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM copilot_sessions
      WHERE copilot_sessions.id = copilot_messages.session_id
      AND copilot_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in own sessions" ON copilot_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM copilot_sessions
      WHERE copilot_sessions.id = copilot_messages.session_id
      AND copilot_sessions.user_id = auth.uid()
    )
  );
```

### Task 2: Update Copilot API Route
Replace the entire content of: `app/api/copilot/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { OpenAI } from 'openai'
import { createRouteClient } from '@/lib/supabase-route-handler'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

// System prompts for different roles
const SYSTEM_PROMPTS = {
  field: `You are a field technician assistant for MyRoofGenius. Help with on-site roofing inspections, safety protocols, and technical guidance.`,
  pm: `You are a project management assistant for MyRoofGenius. Help with project planning, resource allocation, timeline management, and team coordination.`,
  exec: `You are an executive assistant for MyRoofGenius. Provide strategic insights, market analysis, and high-level business guidance for roofing industry leaders.`
}

export async function POST(req: Request) {
  try {
    const supabase = createRouteClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { message, sessionId, role = 'field' } = await req.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Get or create session
    let session
    if (sessionId) {
      // Fetch existing session
      const { data: existingSession, error: sessionError } = await supabase
        .from('copilot_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single()

      if (sessionError || !existingSession) {
        console.error('Session not found:', sessionError)
        // Create new session if not found
        const { data: newSession, error: createError } = await supabase
          .from('copilot_sessions')
          .insert({
            user_id: user.id,
            metadata: { role }
          })
          .select()
          .single()

        if (createError) {
          throw new Error('Failed to create session')
        }
        session = newSession
      } else {
        session = existingSession
        // Update session activity
        await supabase
          .from('copilot_sessions')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', session.id)
      }
    } else {
      // Create new session
      const { data: newSession, error: createError } = await supabase
        .from('copilot_sessions')
        .insert({
          user_id: user.id,
          metadata: { role }
        })
        .select()
        .single()

      if (createError) {
        throw new Error('Failed to create session')
      }
      session = newSession
    }

    // Store user message
    const { error: userMsgError } = await supabase
      .from('copilot_messages')
      .insert({
        session_id: session.id,
        role: 'user',
        content: message
      })

    if (userMsgError) {
      console.error('Failed to store user message:', userMsgError)
    }

    // Fetch conversation history (last 10 messages)
    const { data: messages, error: messagesError } = await supabase
      .from('copilot_messages')
      .select('role, content')
      .eq('session_id', session.id)
      .order('created_at', { ascending: true })
      .limit(10)

    if (messagesError) {
      console.error('Failed to fetch messages:', messagesError)
    }

    // Build conversation for OpenAI
    const conversation = [
      { role: 'system', content: SYSTEM_PROMPTS[role as keyof typeof SYSTEM_PROMPTS] || SYSTEM_PROMPTS.field },
      ...(messages || []).slice(-9), // Last 9 messages (we'll add the current one)
      { role: 'user', content: message }
    ]

    // Create streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: conversation as any,
            temperature: 0.7,
            max_tokens: 500,
            stream: true
          })

          let assistantMessage = ''

          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              assistantMessage += content
              controller.enqueue(encoder.encode(content))
            }
          }

          // Store assistant message
          await supabase
            .from('copilot_messages')
            .insert({
              session_id: session.id,
              role: 'assistant',
              content: assistantMessage
            })

          // Send session ID at the end
          controller.enqueue(encoder.encode(`\n\n[SESSION_ID:${session.id}]`))
          controller.close()
        } catch (error) {
          console.error('OpenAI streaming error:', error)
          controller.error(error)
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })
  } catch (error) {
    console.error('Copilot error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

// GET endpoint to fetch session history
export async function GET(req: Request) {
  try {
    const supabase = createRouteClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      // Return user's recent sessions
      const { data: sessions, error } = await supabase
        .from('copilot_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(5)

      if (error) {
        throw error
      }

      return NextResponse.json({ sessions })
    }

    // Return messages for specific session
    const { data: messages, error } = await supabase
      .from('copilot_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })

    if (error) {
      throw error
    }

    // Verify session belongs to user
    const { data: session } = await supabase
      .from('copilot_sessions')
      .select('user_id')
      .eq('id', sessionId)
      .single()

    if (!session || session.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Failed to fetch history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    )
  }
}
```

### Task 3: Update Copilot Panel Component
Update: `components/copilot/CopilotPanel.tsx`

```typescript
'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageSquare, X, Send, Mic, MicOff, User, Bot } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function CopilotPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [role, setRole] = useState('field')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  // Load session history on mount
  useEffect(() => {
    if (user && isOpen && !sessionId) {
      loadRecentSession()
    }
  }, [user, isOpen])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadRecentSession = async () => {
    try {
      const response = await fetch('/api/copilot')
      if (response.ok) {
        const { sessions } = await response.json()
        if (sessions && sessions.length > 0) {
          // Load the most recent session
          const recentSession = sessions[0]
          setSessionId(recentSession.id)
          setRole(recentSession.metadata?.role || 'field')
          
          // Load messages from that session
          const messagesResponse = await fetch(`/api/copilot?sessionId=${recentSession.id}`)
          if (messagesResponse.ok) {
            const { messages: sessionMessages } = await messagesResponse.json()
            setMessages(sessionMessages.map((m: any) => ({
              role: m.role,
              content: m.content
            })))
          }
        }
      }
    } catch (error) {
      console.error('Failed to load session history:', error)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = { role: 'user' as const, content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          sessionId,
          role
        })
      })

      if (!response.ok) throw new Error('Failed to send message')

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          
          // Extract session ID if present
          const sessionMatch = chunk.match(/\[SESSION_ID:([^\]]+)\]/)
          if (sessionMatch) {
            setSessionId(sessionMatch[1])
            assistantMessage += chunk.replace(sessionMatch[0], '')
          } else {
            assistantMessage += chunk
          }

          setMessages(prev => {
            const newMessages = [...prev]
            const lastMessage = newMessages[newMessages.length - 1]
            
            if (lastMessage?.role === 'assistant') {
              lastMessage.content = assistantMessage.trim()
            } else {
              newMessages.push({ 
                role: 'assistant', 
                content: assistantMessage.trim() 
              })
            }
            
            return newMessages
          })
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'
      
      recognition.onstart = () => setIsListening(true)
      recognition.onend = () => setIsListening(false)
      recognition.onerror = () => setIsListening(false)
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInput(transcript)
      }
      
      recognition.start()
    }
  }

  const clearSession = () => {
    setMessages([])
    setSessionId(null)
  }

  if (!user) return null

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg"
          >
            <MessageSquare className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bot className="h-6 w-6" />
                <div>
                  <h3 className="font-semibold">AI Assistant</h3>
                  <p className="text-sm text-blue-100">
                    {role === 'field' && 'Field Technician Mode'}
                    {role === 'pm' && 'Project Manager Mode'}
                    {role === 'exec' && 'Executive Mode'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-blue-700 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Role Selector */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <select
                value={role}
                onChange={(e) => {
                  setRole(e.target.value)
                  clearSession()
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              >
                <option value="field">Field Technician</option>
                <option value="pm">Project Manager</option>
                <option value="exec">Executive</option>
              </select>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                  <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>How can I assist you today?</p>
                  <p className="text-sm mt-2">
                    Ask me about roofing, project management, or business insights.
                  </p>
                </div>
              )}
              
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.role === 'assistant' && (
                        <Bot className="h-4 w-4 mt-1 flex-shrink-0" />
                      )}
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  disabled={isLoading}
                />
                <button
                  onClick={startListening}
                  className={`p-2 rounded-lg ${
                    isListening
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </button>
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
              {sessionId && (
                <button
                  onClick={clearSession}
                  className="mt-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Start New Conversation
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
```

### Task 4: Create Cleanup Route for Old Sessions
Create file: `app/api/cron/cleanup-copilot-sessions/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  // Verify cron secret if configured
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Delete sessions older than 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { error } = await supabase
      .from('copilot_sessions')
      .delete()
      .lt('updated_at', thirtyDaysAgo.toISOString())

    if (error) {
      throw error
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Old sessions cleaned up successfully' 
    })
  } catch (error) {
    console.error('Session cleanup error:', error)
    return NextResponse.json(
      { error: 'Failed to cleanup sessions' },
      { status: 500 }
    )
  }
}
```

### Task 5: Update Vercel Cron Configuration
Update: `vercel.json`

```json
{
  "functions": {
    "app/api/webhook/route.ts": {
      "maxDuration": 30
    },
    "app/api/copilot/route.ts": {
      "maxDuration": 60
    }
  },
  "crons": [
    {
      "path": "/api/cron/cleanup-expired-downloads",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/cleanup-copilot-sessions",
      "schedule": "0 3 * * *"
    }
  ]
}
```

## Verification Steps for Codex

1. **Apply database migrations**:
   - Run the SQL scripts in Supabase SQL editor
   - Verify tables are created with proper indexes and RLS

2. **Test session persistence**:
   - Open the Copilot panel and send a message
   - Note the conversation
   - Refresh the page
   - Open Copilot again - previous conversation should load

3. **Test across instances**:
   - Deploy to Vercel
   - Have a conversation
   - Wait a few minutes (for potential Lambda cycling)
   - Continue conversation - context should be maintained

4. **Verify database storage**:
   ```sql
   -- Check sessions are being created
   SELECT * FROM copilot_sessions ORDER BY created_at DESC LIMIT 5;
   
   -- Check messages are being stored
   SELECT * FROM copilot_messages ORDER BY created_at DESC LIMIT 20;
   ```

5. **Test cleanup**:
   ```bash
   # Test cleanup endpoint locally
   curl http://localhost:3000/api/cron/cleanup-copilot-sessions
   ```

## Notes for Next Sprint
Next, we'll fix the AI model configuration issues (Sprint 05), including the invalid OpenAI model name and image analysis problems.