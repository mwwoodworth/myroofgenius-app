'use client';
import { motion } from 'framer-motion';
import { Rnd } from 'react-rnd';
import { useEffect, useRef, useState } from 'react';
import { useRole, PresenceProvider, PresenceAvatars } from './ui';
import type { Role } from './ui/RoleProvider';

type Msg = {
  role: 'user' | 'assistant';
  content: string;
};

// Minimal SpeechRecognition types
interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: { transcript: string };
    };
  };
}
interface SpeechRecognition {
  lang: string;
  interimResults: boolean;
  onresult: (e: SpeechRecognitionEvent) => void;
  onend: () => void;
  start: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: unknown;
    webkitSpeechRecognition: unknown;
  }
}

export default function CopilotPanel({
  open,
  onClose,
  initialPrompt,
}: {
  open: boolean;
  onClose: () => void;
  initialPrompt?: string;
}) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [recording, setRecording] = useState(false);
  const [saved, setSaved] = useState(false);
  const recognizer = useRef<SpeechRecognition | null>(null);
  const initialSent = useRef(false);

  const { role: userRole, setRole } = useRole();

  useEffect(() => {
    if (open) {
      const ts = Number(localStorage.getItem('copilotSessionTimestamp') || '0');
      if (ts && Date.now() - ts > 30 * 24 * 60 * 60 * 1000) {
        localStorage.removeItem('copilotSession');
        localStorage.removeItem('copilotDraft');
      }
      const stored = localStorage.getItem('copilotSession');
      const sid = stored || crypto.randomUUID();
      setSessionId(sid);
      localStorage.setItem('copilotSession', sid);
      localStorage.setItem('copilotSessionTimestamp', Date.now().toString());
      const draft = localStorage.getItem('copilotDraft');
      if (draft) {
        try {
          const decoded = JSON.parse(atob(draft));
          const { messages: savedMsgs, input: savedInput } = decoded;
          setMessages(savedMsgs || []);
          setInput(savedInput || '');
        } catch {}
      }
    }
  }, [open]);

  useEffect(() => {
    if (sessionId) {
      fetch(`/api/copilot?sessionId=${sessionId}`)
        .then((res) => res.json())
        .then((d) => setMessages(d.history || []))
        .catch(() => {});
    }
  }, [sessionId]);

  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const payload = JSON.stringify({ messages, input });
        localStorage.setItem('copilotDraft', btoa(payload));
        setSaved(true);
        setTimeout(() => setSaved(false), 1000);
      } catch {}
    }, 30000);
    return () => clearInterval(interval);
  }, [messages, input]);

  useEffect(() => {
    if (messages.length && messages.length % 10 === 0) {
      const size = new Blob([JSON.stringify(messages)]).size;
      console.log(`[Copilot] memory usage ~${size} bytes`);
    }
  }, [messages]);

  useEffect(() => {
    if (open && initialPrompt && !initialSent.current) {
      initialSent.current = true;
      send(initialPrompt);
    }
    if (!open) {
      initialSent.current = false;
    }
  }, [open, initialPrompt]);

  if (!open) return null;

  const appendAssistant = (text: string) => {
    setMessages((m) => {
      const copy = [...m];
      const last = copy[copy.length - 1];
      if (last && last.role === 'assistant') {
        copy[copy.length - 1] = { role: 'assistant', content: text };
      } else {
        copy.push({ role: 'assistant', content: text });
      }
      return copy.slice(-50);
    });
  };

  const send = async (content?: string) => {
    const msg = content ?? input;
    if (!msg) return;
    setInput('');
    setLoading(true);
    setMessages((m) => [...m, { role: 'user', content: msg } as Msg].slice(-50));
    if (msg.toLowerCase().startsWith('support:')) {
      await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg.slice(8).trim() })
      }).catch(() => {});
    }
    try {
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, sessionId }),
      }).catch(() => {
        throw new Error('network');
      });

      const sid = res.headers.get('x-session-id');
      if (sid) {
        setSessionId(sid);
        localStorage.setItem('copilotSession', sid);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let acc = '';
      if (reader) {
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          acc += decoder.decode(value);
          appendAssistant(acc);
        }
      }
    } catch (error) {
      console.error('Message send failed', error);
      appendAssistant('Network error, please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startVoice = () => {
    const Rec =
      (window as unknown as {
        SpeechRecognition?: new () => SpeechRecognition;
        webkitSpeechRecognition?: new () => SpeechRecognition;
      }).SpeechRecognition ||
      (window as unknown as {
        SpeechRecognition?: new () => SpeechRecognition;
        webkitSpeechRecognition?: new () => SpeechRecognition;
      }).webkitSpeechRecognition;
    if (!Rec) return;
    recognizer.current = new Rec();
    recognizer.current.lang = 'en-US';
    recognizer.current.interimResults = false;
    recognizer.current.onresult = (e: unknown) => {
      try {
        const event = e as SpeechRecognitionEvent;
        const t = event.results[0][0].transcript;
        setInput(t);
      } catch (error) {
        console.error('Speech recognition error', error);
      }
    };
    recognizer.current.onend = () => setRecording(false);
    recognizer.current.start();
    setRecording(true);
  };

  const quickActions: Record<string, string[]> = {
    field: ['Generate an estimate'],
    pm: ['Create a support ticket'],
    executive: ['Show best-selling template'],
  };

  return (
    <PresenceProvider room="copilot">
    <Rnd
      default={{ x: typeof window === 'undefined' ? 0 : window.innerWidth - 400, y: 80, width: 380, height: 600 }}
      bounds="window"
      minWidth={300}
      minHeight={400}
      className="fixed z-40"
    >
    <motion.aside
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="h-full w-full bg-[rgba(44,44,46,0.8)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)] shadow-2xl p-8 rounded-xl"
    >
      <PresenceAvatars />
      <button
        className="absolute top-4 right-4 text-accent font-bold"
        onClick={onClose}
      >
        ✕
      </button>
      <h3 className="text-2xl font-bold mb-4">AI Copilot</h3>
      <select
        className="mb-4 w-full rounded-md bg-bg-card border border-gray-700 p-2 text-sm"
        value={userRole}
        onChange={(e) => setRole(e.target.value as Role)}
      >
        <option value="field">Field</option>
        <option value="pm">Project Manager</option>
      </select>
      <div className="flex gap-2 mb-4">
        {(quickActions[userRole] || []).map((a) => (
          <button
            key={a}
            onClick={() => send(a)}
            className="px-3 py-1 rounded-lg bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)]"
          >
            {a}
          </button>
        ))}
      </div>
      <div className="overflow-y-auto h-[60%] mb-4 pr-2 space-y-2">
        {messages.map((m, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={
              m.role === 'user'
                ? 'text-right text-blue-200'
                : 'text-green-200'
            }
          >
            {m.content}
          </motion.p>
        ))}
      </div>
      <div className="flex gap-2 items-center">
        <textarea
          className="flex-1 rounded-lg px-3 py-2 bg-bg-card text-text-primary"
          placeholder="Ask AI about your project..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <input type="file" className="hidden" id="copilot-file" onChange={() => {}} />
        <label htmlFor="copilot-file" className="px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.1)] cursor-pointer">
          📎
        </label>
        <button
          onClick={startVoice}
          className="px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.1)]"
        >
          {recording ? '🎙️...' : '🎙️'}
        </button>
        <button
          onClick={() => send()}
          className="bg-accent text-white px-4 py-2 rounded-md disabled:opacity-50"
          disabled={loading}
        >
          {loading ? '...' : 'Send'}
        </button>
        {loading && <motion.div className="ml-2 w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" />}
    {saved && <span className="text-xs text-gray-400 ml-2">message saved</span>}
      </div>
    </motion.aside>
    </Rnd>
    </PresenceProvider>
  );
}
export const RoleSwitcher = () => null;
