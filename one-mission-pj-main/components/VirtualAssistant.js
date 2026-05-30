'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Bot, Minimize2, Maximize2, X, Send, Copy, Sparkles, CheckCheck } from 'lucide-react';
import { QUICK_ACTIONS, WELCOME_MESSAGE } from '../utils/aiConstants';

// Typing indicator
function TypingDots() {
  return (
    <div className="flex gap-1.5 items-center px-1 py-2">
      <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-[#00d2a0] block" />
      <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-[#00d2a0] block" />
      <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-[#00d2a0] block" />
    </div>
  );
}

// Markdown Custom Components
const mdComponents = {
  p: ({ children }) => <p className="mb-2 leading-relaxed text-[15px]">{children}</p>,
  strong: ({ children }) => <strong className="font-bold text-[#00d2a0]">{children}</strong>,
  li: ({ children }) => <li className="ml-4 list-disc mb-1">{children}</li>,
  ul: ({ children }) => <ul className="my-2">{children}</ul>,
  code: ({ children }) => <code className="bg-black/30 px-1.5 py-0.5 rounded text-[#00b4d8] text-[13px] font-mono">{children}</code>,
  pre: ({ children }) => <pre className="bg-[#0f0f1a] p-3 rounded-lg overflow-x-auto my-2 border border-[#2a3655]">{children}</pre>
};

const VirtualAssistant = ({ lang = 'vi', appMode, cartItems = [], remainingBudget, missionTitle, isOpen, setIsOpen }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen, isMinimized]);

  // Focus input
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, isMinimized]);

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const sendMessage = useCallback(async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed || isLoading) return;

    const userMsg = { role: 'user', content: trimmed };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    const historyForAPI = newMessages.filter(m => m.content !== WELCOME_MESSAGE.content).slice(-10);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: historyForAPI.slice(0, -1),
          context: { appMode, cartItems, remainingBudget, missionTitle }
        })
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply || data.error || 'Xin lỗi, tôi gặp sự cố kết nối.'
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ Lỗi kết nối máy chủ. Vui lòng thử lại sau.'
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, appMode, cartItems, remainingBudget, missionTitle]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: 20, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className={`fixed bottom-4 right-4 z-[9999] bg-[#16213e]/95 backdrop-blur-xl border border-[#1e293b] flex flex-col shadow-2xl transition-all duration-300 origin-bottom-right ${
            isMinimized ? 'w-[320px] h-[60px] rounded-2xl' : 'w-[380px] h-[650px] max-h-[85vh] rounded-2xl sm:w-[420px]'
          }`}
        >
          {/* HEADER */}
          <div 
            onClick={() => setIsMinimized(m => !m)}
            className={`flex items-center justify-between px-5 py-3.5 cursor-pointer shrink-0 transition-colors ${
              isMinimized ? '' : 'border-b border-[#1e293b] bg-gradient-to-r from-[#00d2a0]/10 to-transparent rounded-t-2xl'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[#00d2a0]/20 flex items-center justify-center text-[#00d2a0]">
                  <Bot size={22} />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#16213e] rounded-full"></div>
              </div>
              <div>
                <h3 className="font-bold text-white leading-tight">AI Guru <span className="text-xl leading-none">🤖</span></h3>
                <p className="text-[11px] text-green-400 font-medium uppercase tracking-wider">
                  {isLoading ? 'Đang soạn tin...' : 'Trực tuyến'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-[#2a3655] rounded-md transition-colors"
              >
                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* BODY */}
          {!isMinimized && (
            <>
              {/* Context Alert */}
              {appMode && (
                <div className="bg-[#00d2a0]/10 border-b border-[#00d2a0]/20 px-4 py-2 flex items-center gap-2 text-[12px] text-[#00d2a0] shrink-0">
                  <Sparkles size={14} />
                  <span>AI đang theo dõi: {missionTitle || 'Thực hành tự do'}</span>
                </div>
              )}

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-hide">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group`}>
                    
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-[#1e293b] flex items-center justify-center mr-2 shrink-0 mt-1">
                        <Bot size={16} className="text-[#00d2a0]" />
                      </div>
                    )}

                    <div className={`relative max-w-[85%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user' 
                        ? 'bg-[#00d2a0] text-black rounded-tr-sm shadow-[0_4px_15px_rgba(0,210,160,0.2)]' 
                        : 'bg-[#1e293b] text-slate-200 rounded-tl-sm border border-[#2a3655]'
                    }`}>
                      {msg.role === 'assistant' ? (
                        <div className="markdown-body">
                          <ReactMarkdown components={mdComponents}>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-[15px] leading-relaxed">{msg.content}</p>
                      )}

                      {/* Copy Button (Only for assistant) */}
                      {msg.role === 'assistant' && (
                        <button 
                          onClick={() => copyToClipboard(msg.content, i)}
                          className="absolute -right-10 top-2 p-1.5 text-slate-500 hover:text-[#00d2a0] bg-[#16213e] rounded-md border border-[#2a3655] opacity-0 group-hover:opacity-100 transition-all"
                          title="Copy"
                        >
                          {copiedIndex === i ? <CheckCheck size={14} className="text-[#00d2a0]" /> : <Copy size={14} />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="w-8 h-8 rounded-full bg-[#1e293b] flex items-center justify-center mr-2 shrink-0">
                      <Bot size={16} className="text-[#00d2a0]" />
                    </div>
                    <div className="bg-[#1e293b] rounded-2xl rounded-tl-sm px-4 py-2 border border-[#2a3655]">
                      <TypingDots />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions */}
              <div className="px-3 pb-2 pt-1 flex gap-2 overflow-x-auto scrollbar-hide shrink-0">
                {QUICK_ACTIONS?.slice(0, 4).map((qa, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(qa.prompt)}
                    disabled={isLoading}
                    className="shrink-0 px-3 py-1.5 bg-[#1e293b] hover:bg-[#2a3655] text-[#00b4d8] text-[12px] font-medium rounded-full border border-[#2a3655] transition-colors whitespace-nowrap disabled:opacity-50"
                  >
                    {qa.label}
                  </button>
                ))}
              </div>

              {/* Input Area */}
              <div className="p-3 border-t border-[#1e293b] bg-[#16213e] rounded-b-2xl shrink-0">
                <div className="relative flex items-end gap-2 bg-[#0f0f1a] rounded-xl border border-[#2a3655] p-1 focus-within:border-[#00d2a0] focus-within:ring-1 focus-within:ring-[#00d2a0]/50 transition-all">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Hỏi AI Guru về linh kiện..."
                    disabled={isLoading}
                    rows={1}
                    className="flex-1 max-h-[120px] bg-transparent border-none text-white text-[14px] placeholder:text-slate-500 resize-none outline-none py-2.5 px-3"
                    onInput={e => {
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                    }}
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={isLoading || !input.trim()}
                    className="shrink-0 w-10 h-10 mb-0.5 mr-0.5 rounded-lg bg-[#00d2a0] text-black flex items-center justify-center hover:bg-[#00e6af] disabled:opacity-50 disabled:bg-[#1e293b] disabled:text-slate-500 transition-colors"
                  >
                    <Send size={18} className={input.trim() && !isLoading ? "ml-1" : ""} />
                  </button>
                </div>
                <div className="text-center mt-2">
                  <span className="text-[10px] text-slate-500">AI có thể mắc sai lầm. Hãy kiểm tra lại thông tin quan trọng.</span>
                </div>
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VirtualAssistant;
