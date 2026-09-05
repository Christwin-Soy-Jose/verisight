import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Bot, User, CornerDownLeft, Loader2 } from 'lucide-react';
import { ChatMessage, VerificationResult, MediaItem } from '../types';

interface AICopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  media: MediaItem | null;
  result: VerificationResult | null;
}

export const AICopilotDrawer: React.FC<AICopilotDrawerProps> = ({
  isOpen,
  onClose,
  media,
  result,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Hello! I am your VeriSight Forensics Copilot, powered by Google Gemini. Ask me anything about this file, Error Level Analysis (ELA), sensor noise patterns, or how to detect synthetic generative media.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const messageContent = (textToSend || inputText).trim();
    if (!messageContent || isSending) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsSending(true);

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          context: {
            fileName: media?.name,
            mediaType: media?.type,
            verdict: result?.verdict,
            confidenceScore: result?.confidenceScore,
            summary: result?.summary,
            clientForensics: result?.clientForensics,
            metadata: result?.metadata,
          },
        }),
      });

      const data = await response.json();
      const reply = data.reply || 'Analysis completed.';

      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content:
          'Forensic engine explanation: Error Level Analysis demonstrates compression differences by measuring how pixel blocks re-quantize. Generative AI models often synthesize images in one pass, leaving unnatural high-frequency homogeneity compared to physical lenses.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const sampleQuestions = [
    'Explain the ELA findings for this file',
    'What indicates this is AI-generated?',
    'How do I verify C2PA Content Credentials?',
    'What is the difference between ELA and Noise Heatmaps?',
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-slate-950/95 border-l border-slate-800 shadow-2xl backdrop-blur-xl flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Forensics Copilot</h3>
            <p className="text-2xs text-slate-400 font-mono">Gemini 3.8 Multimodal AI</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-2.5 ${
              msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                msg.role === 'user'
                  ? 'bg-cyan-600 text-slate-950 font-bold'
                  : 'bg-indigo-950 border border-indigo-500/30 text-indigo-300'
              }`}
            >
              {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div
              className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-cyan-600 text-slate-950 font-medium rounded-tr-none'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none space-y-1'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <span
                className={`text-[10px] font-mono block ${
                  msg.role === 'user' ? 'text-slate-900/60' : 'text-slate-500'
                }`}
              >
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isSending && (
          <div className="flex items-center space-x-2 text-xs text-indigo-400 font-mono animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Forensics reasoning in progress...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Inquiries */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950 space-y-1.5">
        <span className="text-[10px] font-mono uppercase text-slate-500">Suggested Inquiries:</span>
        <div className="flex flex-wrap gap-1.5">
          {sampleQuestions.slice(0, 3).map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q)}
              className="text-[11px] px-2 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 text-left transition-colors truncate max-w-full"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input bar */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            placeholder="Ask about forensic signals, ELA, or AI tags..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isSending}
            className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-200 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold disabled:opacity-40 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
