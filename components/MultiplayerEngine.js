'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import GameEngine from './GameEngine';

const P1_COLOR = '#6366f1';
const P2_COLOR = '#f59e0b';
const SUCCESS_COLOR = '#10b981';

const T = {
    vi: {
        title: 'CHẾ ĐỘ 2 NGƯỜI CHƠI',
        subtitle: 'Mỗi người đứng 1 bên — Giơ tay lên để sẵn sàng!',
        p1Label: 'NGƯỜI CHƠI 1',
        p2Label: 'NGƯỜI CHƠI 2',
        waiting: 'Đang chờ người chơi...',
        ready: 'Sẵn sàng!',
        p1Ready: 'P1 đã sẵn sàng',
        p2Ready: 'P2 đã sẵn sàng',
        bothReady: 'Cả 2 đã sẵn sàng — Bắt đầu!',
        startMatch: 'BẮT ĐẦU',
        starting: 'ĐANG BẮT ĐẦU...',
        p1Wins: 'P1 THẮNG!',
        p2Wins: 'P2 THẮNG!',
        vs: 'VS',
        handOk: 'Đã thấy tay',
        handRaised: 'Đã giơ lên',
        handMissing: 'Đưa tay vào khung',
        handsCount: 'Cả 2 tay',
        p1Desc: 'Giơ 1 tay lên cao!',
        p2Desc: 'Giơ 1 tay lên cao!',
    },
    en: {
        title: '2-PLAYER MODE',
        subtitle: 'Stand on opposite sides — Raise your hand to ready up!',
        p1Label: 'PLAYER 1',
        p2Label: 'PLAYER 2',
        waiting: 'Waiting for players...',
        ready: 'Ready!',
        p1Ready: 'P1 ready',
        p2Ready: 'P2 ready',
        bothReady: 'Both ready — Start!',
        startMatch: 'START',
        starting: 'STARTING...',
        p1Wins: 'P1 WINS!',
        p2Wins: 'P2 WINS!',
        vs: 'VS',
        handOk: 'Hand detected',
        handRaised: 'Hand raised',
        handMissing: 'Show your hand',
        handsCount: 'Both hands',
        p1Desc: 'Raise your hand!',
        p2Desc: 'Raise your hand!',
    },
};

const L = (key, lang) => (T[lang === 'en' ? 'en' : 'vi']?.[key] ?? T.vi[key]);

const LM_SMOOTH = 0.3;

function smoothLandmarks(raw, cache) {
  if (!raw || raw.length === 0) return raw;
  if (!cache || cache.length !== raw.length || cache[0]?.length !== raw[0]?.length) return raw;
  return raw.map((hand, hi) =>
    hand.map((lm, li) => {
      const p = cache[hi]?.[li];
      if (!p) return { ...lm };
      return {
        x: p.x + LM_SMOOTH * (lm.x - p.x),
        y: p.y + LM_SMOOTH * (lm.y - p.y),
        z: (p.z ?? 0) + LM_SMOOTH * ((lm.z ?? 0) - (p.z ?? 0)),
      };
    })
  );
}

const MultiplayerEngine = ({ landmarks, onGameEvent, lang, trackingSensitivity }) => {
  const smoothCacheRef = useRef(null);

  const smoothedLandmarks = useMemo(() => {
    if (!landmarks || landmarks.length === 0) {
      smoothCacheRef.current = null;
      return landmarks;
    }
    const cache = smoothCacheRef.current;
    const smoothed = smoothLandmarks(landmarks, cache);
    smoothCacheRef.current = smoothed;
    return smoothed;
  }, [landmarks]);
    const [p1State, setP1State] = useState({ detected: false, ready: false, finished: false, time: 0 });
    const [p2State, setP2State] = useState({ detected: false, ready: false, finished: false, time: 0 });
    const [gameStarted, setGameStarted] = useState(false);
    const [winner, setWinner] = useState(null);
    const [countdown, setCountdown] = useState(0);

    const timerRef = useRef(null);
    const mountedRef = useRef(true);

    // Spatial detection: P1 = left side (x<0.5), P2 = right side (x>=0.5)
    const p1Landmarks = useMemo(() => {
        if (!smoothedLandmarks || smoothedLandmarks.length === 0) return null;
        const leftSide = smoothedLandmarks.filter(hand =>
            hand[0] && hand[0].x !== undefined && hand[0].x < 0.5
        );
        return leftSide.length >= 1 ? leftSide : null;
    }, [smoothedLandmarks]);

    const p2Landmarks = useMemo(() => {
        if (!smoothedLandmarks || smoothedLandmarks.length === 0) return null;
        const rightSide = smoothedLandmarks.filter(hand =>
            hand[0] && hand[0].x !== undefined && hand[0].x >= 0.5
        );
        return rightSide.length >= 1 ? rightSide : null;
    }, [smoothedLandmarks]);

    function isHandRaised(hand) {
        return hand && hand[8] && hand[8].y !== undefined && hand[8].y < 0.35;
    }

    // Player detection
    useEffect(() => {
        if (gameStarted) return;
        const p1h = p1Landmarks;
        const p1d = p1h && p1h.length >= 1;
        const p1r = p1d && p1h.every(h => isHandRaised(h));
        setP1State(prev => ({ ...prev, detected: !!p1d, ready: !!p1r }));

        const p2h = p2Landmarks;
        const p2d = p2h && p2h.length >= 1;
        const p2r = p2d && p2h.every(h => isHandRaised(h));
        setP2State(prev => ({ ...prev, detected: !!p2d, ready: !!p2r }));
    }, [p1Landmarks, p2Landmarks, gameStarted]);

    const canStart = p1State.ready && p2State.ready;

    const startGame = useCallback(() => {
        setCountdown(3);
        const cdInterval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(cdInterval);
                    setGameStarted(true);
                    setP1State(prev => ({ ...prev, time: 0, finished: false }));
                    setP2State(prev => ({ ...prev, time: 0, finished: false }));
                    setWinner(null);
                    const startTime = Date.now();
                    timerRef.current = setInterval(() => {
                        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
                        setP1State(prev => prev.finished ? prev : { ...prev, time: elapsed });
                        setP2State(prev => prev.finished ? prev : { ...prev, time: elapsed });
                    }, 100);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    const handlePlayerFinish = useCallback((playerId) => {
        if (!gameStarted || winner) return;
        const id = playerId === 1 ? 'P1' : 'P2';
        if (playerId === 1) setP1State(prev => ({ ...prev, finished: true }));
        else setP2State(prev => ({ ...prev, finished: true }));
        setWinner(id);
        clearInterval(timerRef.current);
        if (onGameEvent) onGameEvent(`win_${playerId}`, 'all');
    }, [gameStarted, winner, onGameEvent]);

    const dotTrans = 'top 0.1s,left 0.1s';

    return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {!gameStarted ? (
                <div style={{
                    padding: '40px 32px', borderRadius: '24px',
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(245,158,11,0.08))',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px',
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ color: '#fff', fontSize: '28px', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '1px' }}>
                            ⚔️ {L('title', lang)}
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
                            {L('subtitle', lang)}
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '24px', width: '100%', maxWidth: '800px', alignItems: 'stretch' }}>
                        {[{ id: 1, state: p1State, color: P1_COLOR, label: L('p1Label', lang), desc: L('p1Desc', lang), landmarks: p1Landmarks, side: 'left' },
                          { id: 2, state: p2State, color: P2_COLOR, label: L('p2Label', lang), desc: L('p2Desc', lang), landmarks: p2Landmarks, side: 'right' }].map(p => {
                            const handsCount = p.landmarks ? p.landmarks.length : 0;
                            return (
                            <div key={p.id} style={{
                                flex: 1, textAlign: 'center', padding: '28px 20px', borderRadius: '20px',
                                border: p.state.ready ? `2px solid ${p.color}` : '1px solid rgba(255,255,255,0.1)',
                                background: p.state.ready ? `${p.color}18` : 'rgba(255,255,255,0.03)',
                                position: 'relative', overflow: 'hidden',
                            }}>
                                {handsCount > 0 && (
                                    <div style={{ position: 'absolute', top: '10px', right: '10px', padding: '3px 10px', borderRadius: '12px', background: p.color, color: '#fff', fontSize: '11px', fontWeight: 700 }}>
                                        {handsCount} {L('handOk', lang)}
                                    </div>
                                )}
                                <div style={{ fontSize: '40px', marginBottom: '8px', filter: p.state.detected ? 'none' : 'grayscale(0.5)', opacity: p.state.detected ? 1 : 0.4 }}>
                                    {p.state.ready ? '✋' : p.state.detected ? '🖐️' : '👤'}
                                </div>
                                <h3 style={{ color: p.color, margin: '0 0 6px 0', fontSize: '16px', fontWeight: 800, letterSpacing: '1px' }}>{p.label}</h3>
                                <p style={{ color: p.state.ready ? 'var(--success)' : (p.state.detected ? 'var(--warning)' : 'var(--text-muted)'), fontSize: '13px', fontWeight: 600, margin: '0 0 10px 0' }}>
                                    {p.state.ready ? '✅ ' + L('ready', lang) : p.state.detected ? '👋 ' + p.desc : '⏳ ' + L('handMissing', lang)}
                                </p>
                                {p.state.ready && (
                                    <div style={{ display: 'inline-block', padding: '4px 16px', background: p.color, borderRadius: '14px', color: '#fff', fontWeight: 700, fontSize: '12px' }}>
                                        READY
                                    </div>
                                )}
                                {p.landmarks && p.landmarks.map((hand, hi) => {
                                    const tip = hand?.[8];
                                    if (!tip) return null;
                                    return (
                                        <div key={hi} style={{
                                            position: 'absolute',
                                            top: `${Math.min(tip.y * 100, 88)}%`,
                                            left: `${Math.min(tip.x * 100, 88)}%`,
                                            width: '12px', height: '12px',
                                            background: p.color,
                                            borderRadius: '50%',
                                            border: '2px solid rgba(255,255,255,0.9)',
                                            boxShadow: `0 0 10px ${p.color}`,
                                            transform: 'translate(-50%, -50%)',
                                            opacity: 0.85,
                                        }} />
                                    );
                                })}
                            </div>
                            );
                        })}
                    </div>

                    {countdown > 0 ? (
                        <div style={{ fontSize: '72px', fontWeight: 900, color: '#fff', textShadow: '0 0 40px rgba(0,212,170,0.5)' }}>
                            {countdown}
                        </div>
                    ) : (
                        <button onClick={startGame} disabled={!canStart}
                            style={{
                                padding: '16px 56px', fontSize: '20px', fontWeight: 800, letterSpacing: '2px',
                                background: canStart ? 'linear-gradient(135deg, #00d4aa, #06b6d4)' : 'rgba(255,255,255,0.05)',
                                color: canStart ? '#000' : 'var(--text-muted)',
                                border: 'none', borderRadius: '16px', cursor: canStart ? 'pointer' : 'not-allowed',
                                boxShadow: canStart ? '0 8px 32px rgba(0,212,170,0.4)' : 'none',
                            }}>
                            {canStart ? '🚀 ' + L('startMatch', lang) : '⏳ ' + L('waiting', lang)}
                        </button>
                    )}

                    {!canStart && !countdown && (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
                            {p1State.ready && !p2State.ready ? `👉 ${L('p2Desc', lang)}` :
                             !p1State.ready && p2State.ready ? `👉 ${L('p1Desc', lang)}` :
                             L('waiting', lang)}
                        </p>
                    )}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '16px 28px', borderRadius: '16px',
                        background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)',
                    }}>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{ fontSize: '12px', color: P1_COLOR, fontWeight: 700, letterSpacing: '2px', marginBottom: '4px' }}>{L('p1Label', lang)}</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#fff', fontFamily: 'monospace' }}>
                                {winner === 'P2' ? '⏹' : `${p1State.time}s`}
                            </div>
                        </div>
                        <div style={{
                            padding: '6px 24px', borderRadius: '28px',
                            background: winner ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${winner ? SUCCESS_COLOR : 'rgba(255,255,255,0.08)'}`,
                        }}>
                            <span style={{ fontSize: '18px', fontWeight: 900, color: winner ? SUCCESS_COLOR : 'var(--warning)', letterSpacing: '1px' }}>
                                {winner ? `🏆 ${winner === 'P1' ? 'P1' : 'P2'} ${winner === 'P1' ? L('p1Wins', lang) : L('p2Wins', lang)}` : `⚔️ ${L('vs', lang)}`}
                            </span>
                        </div>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{ fontSize: '12px', color: P2_COLOR, fontWeight: 700, letterSpacing: '2px', marginBottom: '4px' }}>{L('p2Label', lang)}</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#fff', fontFamily: 'monospace' }}>
                                {winner === 'P1' ? '⏹' : `${p2State.time}s`}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '100%' }}>
                        <div style={{
                            position: 'relative', borderRadius: '16px', overflow: 'hidden',
                            border: winner === 'P1' ? `3px solid ${SUCCESS_COLOR}` : `1px solid ${P1_COLOR}40`,
                        }}>
                            <div style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 100, padding: '4px 12px', background: P1_COLOR, borderRadius: '8px', color: '#fff', fontWeight: 700, fontSize: '12px', opacity: 0.9 }}>P1</div>
                            <GameEngine landmarks={p1Landmarks}
                                onGameEvent={(ev) => { if (ev === 'COMPLETE') handlePlayerFinish(1); }}
                                trackingSensitivity={trackingSensitivity} />
                            {winner === 'P1' && (
                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 1000 }}>
                                    <h2 style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 900, textShadow: '0 4px 20px rgba(0,0,0,0.7)', margin: 0 }}>
                                        🏆 {L('p1Wins', lang)}
                                    </h2>
                                </div>
                            )}
                        </div>
                        <div style={{
                            position: 'relative', borderRadius: '16px', overflow: 'hidden',
                            border: winner === 'P2' ? `3px solid ${SUCCESS_COLOR}` : `1px solid ${P2_COLOR}40`,
                        }}>
                            <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 100, padding: '4px 12px', background: P2_COLOR, borderRadius: '8px', color: '#fff', fontWeight: 700, fontSize: '12px', opacity: 0.9 }}>P2</div>
                            <GameEngine landmarks={p2Landmarks}
                                onGameEvent={(ev) => { if (ev === 'COMPLETE') handlePlayerFinish(2); }}
                                trackingSensitivity={trackingSensitivity} />
                            {winner === 'P2' && (
                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 1000 }}>
                                    <h2 style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 900, textShadow: '0 4px 20px rgba(0,0,0,0.7)', margin: 0 }}>
                                        🏆 {L('p2Wins', lang)}
                                    </h2>
                                </div>
                            )}
                        </div>
                    </div>

                    {winner && (
                        <div style={{ textAlign: 'center', marginTop: '8px' }}>
                            <button onClick={() => { setGameStarted(false); setWinner(null); setCountdown(0); clearInterval(timerRef.current); }}
                                style={{
                                    padding: '12px 36px', fontSize: '16px', fontWeight: 700,
                                    background: 'linear-gradient(135deg, #00d4aa, #06b6d4)',
                                    color: '#000', border: 'none', borderRadius: '12px', cursor: 'pointer',
                                    boxShadow: '0 4px 16px rgba(0,212,170,0.3)',
                                }}>
                                🔄 Chơi lại
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MultiplayerEngine;
