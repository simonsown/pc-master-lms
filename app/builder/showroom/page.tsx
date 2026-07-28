'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCw, Maximize2 } from 'lucide-react';

const VRShowroom = dynamic(() => import('@/components/VRShowroom/VRShowroom'), { ssr: false });

function useAudio() {
  const ctxRef = useRef(null);
  const play = useCallback(() => {
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AC();
      ctxRef.current = ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.5);
      osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 1);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.2);
      return new Promise(r => setTimeout(r, 1500));
    } catch { return Promise.resolve(); }
  }, []);
  return { play };
}

export default function ShowroomPage() {
  const [loading, setLoading] = useState(true);
  const [audioDone, setAudioDone] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [focusId, setFocusId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const audio = useAudio();

  useEffect(() => {
    let mounted = true;
    const timer = setInterval(() => {
      if (!mounted) return;
      setProgress(p => {
        if (p >= 90) { clearInterval(timer); return 90; }
        return p + Math.random() * 15;
      });
    }, 200);
    return () => { mounted = false; clearInterval(timer); };
  }, []);

  const handleStart = async () => {
    setFadeOut(true);
    await audio.play();
    setAudioDone(true);
    setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setLoading(false);
        setLoaded(true);
      }, 400);
    }, 300);
  };

  const handleComponentFocus = useCallback((id) => {
    setFocusId(id);
  }, []);

  const handleExitFocus = useCallback(() => {
    setFocusId(null);
  }, []);

  return (
    <div className="w-full h-screen bg-[#f0f4ff] relative overflow-hidden">
      <AnimatePresence>
        {loading && (
          <motion.div
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 99999,
              background: 'linear-gradient(135deg, #0a0a1a, #1a1a3e)',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', color: '#fff', fontFamily: 'monospace',
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ fontSize: 48, marginBottom: 24 }}
            >
              🖥️
            </motion.div>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, letterSpacing: 2 }}>
              PC MASTER BUILDER
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 32 }}>
              PHÒNG TRIỂN LÃM LINH KIỆN 3D
            </p>
            <div style={{ width: 280, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, marginBottom: 8, overflow: 'hidden' }}>
              <motion.div
                animate={{ width: `${progress}%` }}
                style={{ height: '100%', background: 'linear-gradient(90deg, #6366f1, #00d4aa)', borderRadius: 2 }}
              />
            </div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 32 }}>
              {Math.round(progress)}% — Đang tải tài nguyên 3D...
            </p>
            {!fadeOut && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStart}
                style={{
                  padding: '14px 48px', borderRadius: 12, border: 'none',
                  background: 'linear-gradient(135deg, #6366f1, #00d4aa)',
                  color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'inherit', letterSpacing: 1,
                  boxShadow: '0 0 30px rgba(99,102,241,0.3)',
                }}
              >
                🚀 VÀO PHÒNG TRIỂN LÃM
              </motion.button>
            )}
            {fadeOut && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}
              >
                Đang kết nối không gian 3D...
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {loaded && (
        <>
          <VRShowroom onFocus={handleComponentFocus} focusId={focusId} />

          <AnimatePresence>
            {focusId && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleExitFocus}
                style={{
                  position: 'fixed', inset: 0, zIndex: 10001,
                  background: 'rgba(0,0,0,0.7)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.8 }}
                  onClick={e => e.stopPropagation()}
                  style={{
                    background: 'rgba(15,23,42,0.95)',
                    borderRadius: 20, padding: 24,
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                    maxWidth: 500, width: '90%',
                    fontFamily: 'monospace', color: '#e2e8f0',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Maximize2 size={16} color="#00d4aa" /> Thông tin linh kiện
                    </h3>
                    <button onClick={handleExitFocus} style={{
                      background: 'rgba(255,255,255,0.08)', border: 'none',
                      borderRadius: 8, padding: '6px 12px', color: '#94a3b8',
                      cursor: 'pointer', fontSize: 12, fontFamily: 'inherit',
                    }}>
                      <X size={16} /> Đóng
                    </button>
                  </div>
                  <div style={{
                    width: '100%', aspectRatio: '16/10', borderRadius: 12,
                    background: 'rgba(255,255,255,0.03)', marginBottom: 16,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid rgba(255,255,255,0.06)',
                    overflow: 'hidden', position: 'relative',
                  }}>
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <RotateCw size={32} />
                      <span>Kéo chuột để xoay linh kiện</span>
                    </p>
                  </div>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textAlign: 'center', margin: 0 }}>
                    Nhấn vào nền mờ hoặc nút Đóng để thoát
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
