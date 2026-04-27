'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { QUICK_ACTIONS, WELCOME_MESSAGE } from '../utils/aiConstants';

// ──────────────────────────────────────────────
// Typing indicator (3 dots bouncing)
// ──────────────────────────────────────────────
function TypingDots() {
    return (
        <div style={{ display: 'flex', gap: '5px', padding: '4px 2px', alignItems: 'center' }}>
            {[0, 1, 2].map(i => (
                <span key={i} style={{
                    width: '7px', height: '7px', borderRadius: '50%',
                    background: 'var(--primary-neon)',
                    display: 'inline-block',
                    animation: `va-bounce 1.2s ease-in-out ${i * 0.2}s infinite`
                }} />
            ))}

        </div>
    );
}

// ──────────────────────────────────────────────
// Markdown components (rendered inside message)
// ──────────────────────────────────────────────
const mdComponents = {
    p: ({ children }) => <p style={{ margin: '0 0 8px 0', lineHeight: '1.6' }}>{children}</p>,
    strong: ({ children }) => <strong style={{ color: 'var(--primary-neon)' }}>{children}</strong>,
    li: ({ children }) => <li style={{ marginLeft: '12px', marginBottom: '3px' }}>{children}</li>,
    ul: ({ children }) => <ul style={{ margin: '4px 0', paddingLeft: '16px' }}>{children}</ul>,
    table: ({ children }) => (
        <div style={{ overflowX: 'auto', margin: '8px 0' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.78rem' }}>{children}</table>
        </div>
    ),
    th: ({ children }) => <th style={{ padding: '4px 8px', borderBottom: '1px solid rgba(0,243,255,0.3)', color: 'var(--primary-neon)', textAlign: 'left' }}>{children}</th>,
    td: ({ children }) => <td style={{ padding: '4px 8px', borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#e2e8f0' }}>{children}</td>,
    code: ({ children }) => <code style={{ background: 'rgba(0,243,255,0.1)', padding: '1px 4px', borderRadius: '3px', fontSize: '0.85em', color: 'var(--primary-neon)' }}>{children}</code>,
};

// ──────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────
const VirtualAssistant = ({ lang, appMode, cartItems = [], remainingBudget, missionTitle, isOpen, setIsOpen }) => {
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([WELCOME_MESSAGE]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (isOpen && !isMinimized) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading, isOpen, isMinimized]);

    // Focus input when panel opens
    useEffect(() => {
        if (isOpen && !isMinimized) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen, isMinimized]);

    const sendMessage = useCallback(async (text) => {
        const trimmed = (text || input).trim();
        if (!trimmed || isLoading) return;

        const userMsg = { role: 'user', content: trimmed };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        // Build history (last 10 entries = 5 pairs, exclude welcome)
        const historyForAPI = newMessages
            .filter(m => m.content !== WELCOME_MESSAGE.content)
            .slice(-10);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: trimmed,
                    history: historyForAPI.slice(0, -1), // exclude latest user msg
                    context: { appMode, cartItems, remainingBudget, missionTitle }
                })
            });
            const data = await res.json();
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.error ? `⚠️ ${data.error}` : data.reply
            }]);
        } catch {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '⚠️ Lỗi kết nối. Vui lòng thử lại sau.'
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

    // ── Panel width: 360px on large, 300px on smaller via CSS var
    const panelWidth = 360;

    return (
        <>

            {/* ─── Chat Panel ─── */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: panelWidth + 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: panelWidth + 20, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                        style={{
                            position: 'fixed',
                            bottom: 0,
                            right: 0,
                            width: `${panelWidth}px`,
                            maxWidth: '90vw',
                            height: isMinimized ? '52px' : 'min(620px, 80vh)',
                            background: 'rgba(8, 12, 28, 0.92)',
                            backdropFilter: 'blur(18px)',
                            border: '1px solid rgba(124,58,237,0.35)',
                            borderBottom: 'none',
                            borderRight: 'none',
                            borderRadius: '16px 0 0 0',
                            display: 'flex',
                            flexDirection: 'column',
                            zIndex: 150,
                            boxShadow: '-8px -8px 30px rgba(0,0,0,0.6), 0 0 40px rgba(124,58,237,0.15)',
                            overflow: 'hidden',
                            transition: 'height 0.3s ease'
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '12px 16px',
                            background: 'linear-gradient(90deg, rgba(124,58,237,0.25), rgba(14,165,233,0.15))',
                            borderBottom: isMinimized ? 'none' : '1px solid rgba(255,255,255,0.07)',
                            flexShrink: 0, cursor: 'pointer'
                        }}
                            onClick={() => setIsMinimized(m => !m)}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '1.2rem' }}>✨</span>
                                <div>
                                    <div style={{ color: 'white', fontWeight: 'bold', fontSize: '0.95rem', lineHeight: 1 }}>PC Master AI</div>
                                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>
                                        {isLoading
                                            ? (lang === 'en' ? 'Thinking...' : 'Đang suy nghĩ...')
                                            : (lang === 'en' ? 'Online' : 'Trực tuyến')}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setIsMinimized(m => !m); }}
                                    style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1rem', padding: '2px 6px', borderRadius: '4px' }}
                                    title={isMinimized ? 'Mở rộng' : 'Thu nhỏ'}
                                >
                                    {isMinimized ? '▲' : '▼'}
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                                    style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.1rem', padding: '2px 6px', borderRadius: '4px' }}
                                    title="Đóng"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        {/* Body — hidden when minimized */}
                        {!isMinimized && (
                            <>
                                {/* Context Bar — shows when in market mode with cart */}
                                {appMode === 'market' && cartItems.length > 0 && (
                                    <div style={{
                                        padding: '6px 12px', fontSize: '0.72rem',
                                        background: 'rgba(0,243,255,0.05)',
                                        borderBottom: '1px solid rgba(0,243,255,0.1)',
                                        color: '#94a3b8', flexShrink: 0
                                    }}>
                                        🛒 {lang === 'en' ? 'AI sees your cart' : 'AI đang thấy giỏ hàng của bạn'} ({cartItems.length} {lang === 'en' ? 'items' : 'linh kiện'})
                                        {remainingBudget !== undefined && ` · ${remainingBudget.toLocaleString()} VNĐ`}
                                    </div>
                                )}

                                {/* Messages */}
                                <div style={{
                                    flex: 1, overflowY: 'auto', padding: '16px 14px',
                                    display: 'flex', flexDirection: 'column', gap: '12px',
                                    scrollbarWidth: 'thin', scrollbarColor: 'rgba(124,58,237,0.3) transparent'
                                }}>
                                    {messages.map((msg, i) => (
                                        <div key={i} style={{
                                            display: 'flex',
                                            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                                        }}>
                                            {msg.role === 'assistant' && (
                                                <span style={{ fontSize: '1.2rem', alignSelf: 'flex-end', marginRight: '6px', flexShrink: 0 }}>✨</span>
                                            )}
                                            <div style={{
                                                maxWidth: '82%',
                                                padding: '10px 13px',
                                                borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                                                background: msg.role === 'user'
                                                    ? 'linear-gradient(135deg, rgba(14,165,233,0.35), rgba(124,58,237,0.25))'
                                                    : 'rgba(255,255,255,0.05)',
                                                border: msg.role === 'user'
                                                    ? '1px solid rgba(14,165,233,0.3)'
                                                    : '1px solid rgba(255,255,255,0.08)',
                                                fontSize: '0.85rem',
                                                color: '#e2e8f0',
                                                lineHeight: '1.5',
                                                wordBreak: 'break-word'
                                            }}>
                                                {msg.role === 'assistant' ? (
                                                    <ReactMarkdown components={mdComponents}>{msg.content}</ReactMarkdown>
                                                ) : (
                                                    <span>{msg.content}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Typing indicator */}
                                    {isLoading && (
                                        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                            <span style={{ fontSize: '1.2rem', marginRight: '6px' }}>✨</span>
                                            <div style={{
                                                padding: '10px 14px', borderRadius: '14px 14px 14px 4px',
                                                background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid rgba(255,255,255,0.08)'
                                            }}>
                                                <TypingDots />
                                            </div>
                                        </div>
                                    )}

                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Quick Actions */}
                                <div style={{
                                    padding: '8px 12px 4px',
                                    display: 'flex', gap: '6px', flexWrap: 'wrap',
                                    borderTop: '1px solid rgba(255,255,255,0.06)',
                                    flexShrink: 0
                                }}>
                                    {QUICK_ACTIONS.map((qa, i) => (
                                        <button
                                            key={i}
                                            onClick={() => sendMessage(qa.prompt)}
                                            disabled={isLoading}
                                            style={{
                                                padding: '5px 10px',
                                                background: 'rgba(124,58,237,0.15)',
                                                border: '1px solid rgba(124,58,237,0.35)',
                                                borderRadius: '20px',
                                                color: '#c4b5fd',
                                                fontSize: '0.72rem',
                                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                                transition: 'all 0.15s',
                                                whiteSpace: 'nowrap',
                                                opacity: isLoading ? 0.5 : 1
                                            }}
                                            onMouseOver={e => { if (!isLoading) e.currentTarget.style.background = 'rgba(124,58,237,0.3)'; }}
                                            onMouseOut={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.15)'; }}
                                        >
                                            {qa.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Input */}
                                <div style={{
                                    padding: '10px 12px',
                                    display: 'flex', gap: '8px', alignItems: 'flex-end',
                                    flexShrink: 0,
                                    borderTop: '1px solid rgba(255,255,255,0.06)'
                                }}>
                                    <textarea
                                        ref={inputRef}
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder={lang === 'en' ? 'Ask about PC parts...' : 'Hỏi về linh kiện, cấu hình...'}
                                        disabled={isLoading}
                                        rows={1}
                                        style={{
                                            flex: 1, padding: '10px 13px',
                                            background: 'rgba(255,255,255,0.06)',
                                            border: '1px solid rgba(255,255,255,0.12)',
                                            borderRadius: '10px',
                                            color: 'white', fontSize: '0.85rem',
                                            resize: 'none', outline: 'none',
                                            fontFamily: 'inherit', lineHeight: '1.4',
                                            maxHeight: '80px',
                                            scrollbarWidth: 'thin'
                                        }}
                                        onInput={e => {
                                            e.target.style.height = 'auto';
                                            e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px';
                                        }}
                                    />
                                    <button
                                        onClick={() => sendMessage()}
                                        disabled={isLoading || !input.trim()}
                                        style={{
                                            padding: '10px 14px',
                                            background: input.trim() && !isLoading
                                                ? 'linear-gradient(135deg, #7c3aed, #0ea5e9)'
                                                : 'rgba(255,255,255,0.08)',
                                            border: 'none', borderRadius: '10px',
                                            color: 'white', cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                                            fontSize: '1rem', fontWeight: 'bold',
                                            transition: 'all 0.2s', flexShrink: 0
                                        }}
                                    >
                                        ➤
                                    </button>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default VirtualAssistant;
