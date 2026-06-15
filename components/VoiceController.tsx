'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface VoiceControllerProps {
  lang: string;
  onCommand: (action: string, params?: any) => void;
}

interface CommandDef {
  keywords: string[];
  action: string;
  params?: any;
  response: string;
}

const COMMANDS: CommandDef[] = [
  { keywords: ['lắp cpu', 'gắn cpu', 'thêm cpu', 'bộ vi xử lý', 'install cpu', 'processor'], action: 'SPAWN', params: { type: 'CPU' }, response: 'Đang lắp bộ vi xử lý CPU' },
  { keywords: ['lắp ram', 'gắn ram', 'thêm ram', 'bộ nhớ', 'install ram', 'memory'], action: 'SPAWN', params: { type: 'RAM' }, response: 'Đang lắp thanh bộ nhớ RAM' },
  { keywords: ['lắp gpu', 'gắn gpu', 'thẻ đồ họa', 'card màn hình', 'card đồ họa', 'gắn card', 'install gpu', 'graphics card'], action: 'SPAWN', params: { type: 'GPU' }, response: 'Đang gắn card màn hình GPU' },
  { keywords: ['lắp nguồn', 'gắn nguồn', 'thêm nguồn', 'bộ nguồn', 'install psu', 'power supply'], action: 'SPAWN', params: { type: 'PSU' }, response: 'Đang lắp bộ nguồn PSU' },
  { keywords: ['lắp tản nhiệt', 'gắn tản nhiệt', 'thêm tản nhiệt', 'quạt cpu', 'gắn quạt', 'install cooler', 'cpu fan'], action: 'SPAWN', params: { type: 'COOLER' }, response: 'Đang gắn quạt tản nhiệt CPU' },
  { keywords: ['lắp ssd', 'gắn ssd', 'thêm ssd', 'ổ cứng', 'install ssd', 'storage', 'nvme', 'm2'], action: 'SPAWN', params: { type: 'SSD' }, response: 'Đang cắm ổ cứng SSD' },
  { keywords: ['tháo cpu', 'gỡ cpu', 'bỏ cpu'], action: 'REMOVE', params: { type: 'CPU' }, response: 'Đã gỡ CPU' },
  { keywords: ['tháo ram', 'gỡ ram', 'bỏ ram'], action: 'REMOVE', params: { type: 'RAM' }, response: 'Đã rút RAM' },
  { keywords: ['tháo gpu', 'gỡ card', 'bỏ card màn hình', 'tháo card đồ họa'], action: 'REMOVE', params: { type: 'GPU' }, response: 'Đã tháo card màn hình' },
  { keywords: ['tháo nguồn', 'gỡ nguồn', 'bỏ nguồn'], action: 'REMOVE', params: { type: 'PSU' }, response: 'Đã ngắt nguồn' },
  { keywords: ['tháo tản nhiệt', 'gỡ tản nhiệt', 'bỏ quạt'], action: 'REMOVE', params: { type: 'COOLER' }, response: 'Đã tháo quạt tản nhiệt' },
  { keywords: ['tháo ssd', 'gỡ ổ cứng', 'bỏ ổ cứng'], action: 'REMOVE', params: { type: 'SSD' }, response: 'Đã gỡ ổ cứng' },
  { keywords: ['xóa hết', 'bỏ hết', 'dọn sạch', 'reset', 'xóa tất cả'], action: 'RESET', response: 'Đã dọn sạch tất cả linh kiện' },
  { keywords: ['kiểm tra tương thích', 'check tương thích', 'check compatibility'], action: 'CHECK_COMPATIBILITY', response: 'Đang kiểm tra tính tương thích' },
  { keywords: ['khởi động', 'bật máy', 'boot', 'start pc', 'bật pc'], action: 'BOOT_PC', response: 'Đang khởi động máy tính ảo' },
];

export default function VoiceController({ lang, onCommand }: VoiceControllerProps) {
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const listenRef = useRef(false);
  const onCommandRef = useRef(onCommand);
  const viVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  onCommandRef.current = onCommand;

  const findViVoice = useCallback((): SpeechSynthesisVoice | null => {
    const voices = window.speechSynthesis.getVoices();
    let voice = voices.find(v => v.lang.startsWith('vi') && (v.name.includes('Natural') || v.name.includes('Online')));
    if (!voice) voice = voices.find(v => v.lang.startsWith('vi'));
    return voice || null;
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const loadVoices = () => {
      viVoiceRef.current = findViVoice();
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, [findViVoice]);

  const speakText = useCallback((text: string) => {
    if (typeof window === 'undefined') return;
    const playViaGoogle = () => {
      const audio = new Audio(`/api/tts?text=${encodeURIComponent(text)}&lang=vi`);
      audio.volume = 1.0;
      audio.play().catch(() => {
        playViaSpeechSynth();
      });
    };
    const playViaSpeechSynth = () => {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      utterance.rate = 0.7;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      let v = viVoiceRef.current;
      if (!v) {
        v = findViVoice();
        viVoiceRef.current = v;
      }
      if (v) utterance.voice = v;
      window.speechSynthesis.speak(utterance);
    };
    playViaGoogle();
  }, [findViVoice]);

  const findBestMatch = useCallback((text: string): CommandDef | null => {
    const normalized = text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .trim();

    let bestMatch: CommandDef | null = null;
    let bestScore = 0;

    for (const cmd of COMMANDS) {
      for (const keyword of cmd.keywords) {
        const kw = keyword
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/đ/g, 'd')
          .trim();

        if (normalized.includes(kw)) {
          const score = kw.length / normalized.length;
          if (score > bestScore) {
            bestScore = score;
            bestMatch = cmd;
          }
        }
      }
    }
    return bestMatch;
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    listenRef.current = true;
    setTranscript('');
    try {
      recognitionRef.current.start();
    } catch {
      setTimeout(() => {
        try { recognitionRef.current?.start(); } catch {}
      }, 200);
    }
  }, []);

  const stopListening = useCallback(() => {
    listenRef.current = false;
    try { recognitionRef.current?.stop(); } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setFeedback(lang === 'vn' ? 'Trình duyệt không hỗ trợ' : 'Browser not supported');
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = 'vi-VN';
    rec.continuous = false;
    rec.interimResults = false;
    rec.maxAlternatives = 5;

    rec.onstart = () => {
      setIsListening(true);
      setFeedback(lang === 'vn' ? 'Đang nghe...' : 'Listening...');
    };

    rec.onend = () => {
      setIsListening(false);
      if (listenRef.current) {
        setTimeout(() => startListening(), 300);
      } else {
        setFeedback(lang === 'vn' ? 'Dừng nghe' : 'Stopped');
      }
    };

    rec.onerror = (event: any) => {
      if (event.error === 'no-speech') {
        if (listenRef.current) {
          setTimeout(() => startListening(), 200);
        }
        return;
      }
      setIsListening(false);
      if (event.error === 'not-allowed') {
        setFeedback(lang === 'vn' ? 'Vui lòng cấp quyền microphone' : 'Please allow microphone');
      } else {
        setFeedback(lang === 'vn' ? 'Lỗi: ' + event.error : 'Error: ' + event.error);
      }
    };

    rec.onresult = (event: any) => {
      let bestText = '';
      let bestConfidence = 0;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          for (let j = 0; j < event.results[i].length; j++) {
            const alt = event.results[i][j];
            if (alt.confidence > bestConfidence) {
              bestConfidence = alt.confidence;
              bestText = alt.transcript;
            }
          }
        }
      }

      if (bestText) {
        setTranscript(bestText);
        const matched = findBestMatch(bestText);
        if (matched) {
          setFeedback(`✓ ${matched.response}`);
          speakText(matched.response);
          onCommandRef.current(matched.action, matched.params);
        } else {
          setFeedback(lang === 'vn' ? `Không hiểu: "${bestText}"` : `Unknown: "${bestText}"`);
          speakText(lang === 'vn' ? 'Xin hãy nói rõ lệnh' : 'Please speak a command');
        }
      }
    };

    recognitionRef.current = rec;
  }, [lang, speakText, findBestMatch, startListening]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setFeedback(lang === 'vn' ? 'Trình duyệt không hỗ trợ' : 'Browser not supported');
      return;
    }
    if (isListening || listenRef.current) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div style={{
      position: 'fixed', bottom: '100px', left: '24px', zIndex: 999,
      display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start',
    }}>
      <button
        onClick={toggleListening}
        title={lang === 'vn' ? 'Điều khiển bằng giọng nói' : 'Voice control'}
        style={{
          width: '56px', height: '56px', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `2px solid ${isListening ? '#ef4444' : 'var(--border-default)'}`,
          background: isListening
            ? 'rgba(239,68,68,0.15)'
            : 'var(--bg-surface)',
          cursor: 'pointer', transition: 'all 0.2s',
          boxShadow: isListening
            ? '0 0 24px rgba(239,68,68,0.4), 0 0 60px rgba(239,68,68,0.15)'
            : '0 4px 12px rgba(0,0,0,0.15)',
          position: 'relative',
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isListening ? '#ef4444' : 'var(--text-secondary)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
        {isListening && (
          <span style={{
            position: 'absolute', inset: '-4px', borderRadius: '50%',
            border: '2px solid #ef4444', animation: 'voicePulse 1.5s ease-in-out infinite',
          }} />
        )}
      </button>

      {feedback && (
        <div style={{
          padding: '8px 14px', borderRadius: '8px',
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(0,212,170,0.3)',
          fontSize: '12px', color: feedback.startsWith('✓') ? '#22c55e' : feedback.startsWith('Không') ? '#ef4444' : '#00d4aa',
          maxWidth: '300px', fontFamily: 'monospace',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}>
          {isListening && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: transcript ? '4px' : 0 }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', animation: 'blink 1s infinite' }} />
              <span>{lang === 'vn' ? 'Đang nghe...' : 'Listening...'}</span>
            </div>
          )}
          {transcript && (
            <div style={{ marginTop: '4px', color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>
              &quot;{transcript}&quot;
            </div>
          )}
          <div style={{ marginTop: '4px', fontSize: '11px' }}>{feedback}</div>
        </div>
      )}
    </div>
  );
}
