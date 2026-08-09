import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  User,
  Send,
  Zap,
  Trash2,
  Copy,
  Check,
  Sparkles,
  Code,
  PenTool,
  TrendingUp,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { ChatMessage, CreditState } from '../types';
import { deductCredit } from '../utils/creditManager';

interface AiChatProps {
  creditState: CreditState;
  setCreditState: (state: CreditState) => void;
  onOpenPricing: () => void;
  initialMessage?: string;
}

export const AiChat: React.FC<AiChatProps> = ({
  creditState,
  setCreditState,
  onOpenPricing,
  initialMessage,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello! I am your AI Tools Hub Assistant. How can I assist you today? Select a persona below or ask any question (Costs 1 Credit per response).",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState(initialMessage || '');
  const [persona, setPersona] = useState<'assistant' | 'coder' | 'copywriter' | 'creative' | 'business'>('assistant');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (initialMessage) {
      setInput(initialMessage);
    }
  }, [initialMessage]);

  const personas = [
    { id: 'assistant', label: 'General AI', icon: Bot },
    { id: 'coder', label: 'Code Architect', icon: Code },
    { id: 'copywriter', label: 'Copywriter', icon: PenTool },
    { id: 'business', label: 'Business Strategy', icon: TrendingUp },
    { id: 'creative', label: 'Creative Spark', icon: Sparkles },
  ] as const;

  const starterPrompts = [
    'Write a TypeScript function to debounce an async search API call.',
    'Give me 3 high-converting landing page headlines for a SaaS productivity tool.',
    'Explain quantum computing concepts to a high school student simply.',
    'Outline a 30-day product launch checklist for a mobile app.',
  ];

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    // Check credits
    const deductRes = deductCredit(
      creditState,
      1,
      `AI Chat Turn (${persona})`,
      'chat_usage'
    );

    if (!deductRes.success) {
      setErrorMsg('You have run out of credits! Please top up to continue chatting.');
      onOpenPricing();
      return;
    }

    setCreditState(deductRes.newState);
    setErrorMsg(null);

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({ role: m.sender, content: m.text })),
          persona,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get chat response.');
      }

      const botMsg: ChatMessage = {
        id: 'bot-' + Date.now(),
        sender: 'assistant',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        persona,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorMsg(err.message || 'An error occurred while generating response.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        sender: 'assistant',
        text: "Conversation cleared. Ready for new questions!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col h-[700px] relative">
      {/* Chat Header & Persona Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Gemini AI Chat
            </h3>
            <p className="text-xs text-slate-400">1 Credit per AI Turn</p>
          </div>
        </div>

        {/* Persona Selectors */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {personas.map((p) => {
            const Icon = p.icon;
            const isSelected = persona === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setPersona(p.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{p.label}</span>
              </button>
            );
          })}
          <button
            onClick={clearChat}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors ml-1"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Message History Window */}
      <div className="flex-1 overflow-y-auto my-4 pr-2 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                msg.sender === 'user'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed relative group ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none font-mono whitespace-pre-wrap'
              }`}
            >
              <div>{msg.text}</div>

              <div className="mt-2 pt-1 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                <span>{msg.timestamp}</span>
                {msg.sender === 'assistant' && (
                  <button
                    onClick={() => handleCopyText(msg.id, msg.text)}
                    className="opacity-80 hover:opacity-100 flex items-center gap-1 text-slate-400 hover:text-indigo-300"
                  >
                    {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedId === msg.id ? 'Copied' : 'Copy'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-400 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span>Gemini AI is crafting a response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Starter Prompts */}
      {messages.length <= 2 && (
        <div className="mb-3 flex items-center gap-2 overflow-x-auto pb-1">
          {starterPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="px-3 py-1 bg-slate-950 border border-slate-800 hover:border-indigo-500/50 text-slate-400 hover:text-slate-200 text-[11px] rounded-xl whitespace-nowrap transition-colors flex-shrink-0"
            >
              💡 {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div className="mb-3 p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={onOpenPricing} className="px-2 py-0.5 bg-rose-500 text-white rounded text-[11px] font-bold">
            Top Up
          </button>
        </div>
      )}

      {/* Input Bar */}
      <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-2xl p-2">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={`Ask anything as ${persona} persona... (Press Enter)`}
          className="flex-1 bg-transparent border-none text-xs text-white placeholder-slate-500 focus:outline-none resize-none px-2 py-1.5"
        />

        <button
          onClick={() => handleSend()}
          disabled={isLoading || !input.trim()}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
            isLoading || !input.trim()
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white shadow-md shadow-indigo-600/20'
          }`}
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>Send (1 Credit)</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
