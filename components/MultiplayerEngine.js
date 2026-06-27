'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import GameEngine from './GameEngine';

const P1_COLOR = '#6366f1';
const P2_COLOR = '#f59e0b';
const SUCCESS_COLOR = '#10b981';

const T = {
    vi: {
        title: 'CHẾ ĐỘ 2 NGƯỜI CHƠI',
        subtitle: 'Mỗi người đứng 1 bên — tay trái P1, tay phải P2',
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
        p1Desc: 'Giơ tay trái lên',
        p2Desc: 'Giơ tay phải lên',
    },
    en: {
        title: '2-PLAYER MODE',
        subtitle: 'Stand on opposite sides — Left hand P1, Right hand P2',
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
        p1Desc: 'Raise your LEFT hand',
        p2Desc: 'Raise your RIGHT hand',
    },
};

const L = (key, lang) => (T[lang === 'en' ? 'en' : 'vi']?.[key] ?? T.vi[key]);

const MultiplayerEngine = ({ landmarks, onGameEvent, lang, trackingSensitivity }) => {
    const [p1State, setP1State] = useState({ detected: false, ready: false, finished: false, time: 0 });
    const [p2State, setP2State] = useState({ detected: false, ready: false, finished: false, time: 0 });
    const [gameStarted, setGameStarted] = useState(false);
    const [winner, setWinner] = useState(null);
    const [countdown, setCountdown] = useState(0);

    const timerRef = useRef(null);
    const mountedRef = useRef(true);

    // Spatial detection: P1 = left side (x<0.5), P2 = right side (x>=0.5)
    const p1Landmarks = useMemo(() => {
        if (!landmarks || landmarks.length === 0) return null;
        const leftSide = landmarks.filter(hand =>
            hand[0] && hand[0].x !== undefined && hand[0].x < 0.5
        );
        return leftSide.length >= 1 ? leftSide : null;
    }, [landmarks]);

    const p2Landmarks = useMemo(() => {
        if (!landmarks || landmarks.length === 0) return null;
        const rightSide = landmarks.filter(hand =>
            hand[0] && hand[0].x !== undefined && hand[0].x >= 0.5
        );
        return rightSide.length >= 1 ? rightSide : null;
    }, [landmarks]);

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

    return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {!gameStarted ? (
                <div style={{
                    padding: '32px 24px', borderRadius: '20px',
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.05), rgba(245,158,11,0.05))',
                    border: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px',
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: 800, margin: '0 0 4px 0', letterSpacing: '1px' }}>
                            ⚔️ {L('title', lang)}
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
                            {L('subtitle', lang)}
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', width: '100%', maxWidth: '700px', alignItems: 'stretch' }}>
                        {[{ id: 1, state: p1State, color: P1_COLOR, label: L('p1Label', lang), desc: L('p1Desc', lang), landmarks: p1Landmarks, side: 'left' },
                          { id: 2, state: p2State, color: P2_COLOR, label: L('p2Label', lang), desc: L('p2Desc', lang), landmarks: p2Landmarks, side: 'right' }].map(p => (
                            <div key={p.id} style={{
                                flex: 1, textAlign: 'center', padding: '20px 16px', borderRadius: '16px',
                                border: p.state.ready ? `2px solid ${p.color}` : '1px solid rgba(255,255,255,0.08)',
                                background: p.state.ready ? `${p.color}15` : 'rgba(255,255,255,0.02)',
                                transition: 'all 0.3s',
                            }}>
                                <div style={{ fontSize: '32px', marginBottom: '8px', filter: p.state.detected ? 'none' : 'grayscale(0.5)', opacity: p.state.detected ? 1 : 0.4 }}>
                                    {p.state.ready ? '✋' : p.state.detected ? '🖐️' : '👤'}
                                </div>
                                <h3 style={{ color: p.color, margin: '0 0 4px 0', fontSize: '14px', fontWeight: 800, letterSpacing: '1px' }}>{p.label}</h3>
                                <p style={{ color: p.state.ready ? 'var(--success)' : (p.state.detected ? 'var(--warning)' : 'var(--text-muted)'), fontSize: '12px', fontWeight: 600, margin: '0 0 8px 0' }}>
                                    {p.state.ready ? '✅ ' + L('ready', lang) : p.state.detected ? '👋 ' + p.desc : '⏳ ' + L('handMissing', lang)}
                                </p>
                                {p.state.ready && (
                                    <div style={{ display: 'inline-block', padding: '3px 12px', background: p.color, borderRadius: '12px', color: '#fff', fontWeight: 700, fontSize: '11px' }}>
                                        READY
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {countdown > 0 ? (
                        <div style={{ fontSize: '64px', fontWeight: 900, color: '#fff', textShadow: '0 0 40px rgba(0,212,170,0.5)', animation: 'pulse 0.5s ease-in-out infinite' }}>
                            {countdown}
                        </div>
                    ) : (
                        <button onClick={startGame} disabled={!canStart}
                            style={{
                                padding: '14px 48px', fontSize: '18px', fontWeight: 800, letterSpacing: '2px',
                                background: canStart ? 'linear-gradient(135deg, #00d4aa, #06b6d4)' : 'rgba(255,255,255,0.05)',
                                color: canStart ? '#000' : 'var(--text-muted)',
                                border: 'none', borderRadius: '14px', cursor: canStart ? 'pointer' : 'not-allowed',
                                boxShadow: canStart ? '0 8px 32px rgba(0,212,170,0.4)' : 'none',
                                transition: 'all 0.3s',
                            }}>
                            {canStart ? '🚀 ' + L('startMatch', lang) : '⏳ ' + L('waiting', lang)}
                        </button>
                    )}

                    {!canStart && !countdown && (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '12px', margin: 0 }}>
                            {p1State.ready && !p2State.ready ? `👉 ${L('p2Desc', lang)}` :
                             !p1State.ready && p2State.ready ? `👉 ${L('p1Desc', lang)}` :
                             L('waiting', lang)}
                        </p>
                    )}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                    {/* Scoreboard */}
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '12px 24px', borderRadius: '14px',
                        background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)',
                    }}>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{ fontSize: '11px', color: P1_COLOR, fontWeight: 700, letterSpacing: '2px', marginBottom: '2px' }}>{L('p1Label', lang)}</div>
                            <div style={{ fontSize: '28px', fontWeight: 800, color: '#fff', fontFamily: 'monospace' }}>
                                {winner === 'P2' ? '⏹' : `${p1State.time}s`}
                            </div>
                        </div>
                        <div style={{
                            padding: '4px 20px', borderRadius: '24px',
                            background: winner ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${winner ? SUCCESS_COLOR : 'rgba(255,255,255,0.08)'}`,
                        }}>
                            <span style={{ fontSize: '16px', fontWeight: 900, color: winner ? SUCCESS_COLOR : 'var(--warning)', letterSpacing: '1px' }}>
                                {winner ? `🏆 ${winner === 'P1' ? 'P1' : 'P2'} ${winner === 'P1' ? L('p1Wins', lang) : L('p2Wins', lang)}` : `⚔️ ${L('vs', lang)}`}
                            </span>
                        </div>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{ fontSize: '11px', color: P2_COLOR, fontWeight: 700, letterSpacing: '2px', marginBottom: '2px' }}>{L('p2Label', lang)}</div>
                            <div style={{ fontSize: '28px', fontWeight: 800, color: '#fff', fontFamily: 'monospace' }}>
                                {winner === 'P1' ? '⏹' : `${p2State.time}s`}
                            </div>
                        </div>
                    </div>

                    {/* Game Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%' }}>
                        <div style={{
                            position: 'relative', borderRadius: '14px', overflow: 'hidden',
                            border: winner === 'P1' ? `3px solid ${SUCCESS_COLOR}` : `1px solid ${P1_COLOR}40`,
                            boxShadow: winner === 'P1' ? `0 0 24px ${SUCCESS_COLOR}30` : 'none',
                        }}>
                            <div style={{ position: 'absolute', top: '6px', left: '6px', zIndex: 100, padding: '3px 10px', background: P1_COLOR, borderRadius: '6px', color: '#fff', fontWeight: 700, fontSize: '11px', opacity: 0.9 }}>P1</div>
                            <GameEngine landmarks={p1Landmarks}
                                onGameEvent={(ev) => { if (ev === 'COMPLETE') handlePlayerFinish(1); }}
                                trackingSensitivity={trackingSensitivity} />
                            {winner === 'P1' && (
                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
                                    <h2 style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 900, textShadow: '0 4px 20px rgba(0,0,0,0.7)', margin: 0 }}>
                                        🏆 {L('p1Wins', lang)}
                                    </h2>
                                </div>
                            )}
                        </div>
                        <div style={{
                            position: 'relative', borderRadius: '14px', overflow: 'hidden',
                            border: winner === 'P2' ? `3px solid ${SUCCESS_COLOR}` : `1px solid ${P2_COLOR}40`,
                            boxShadow: winner === 'P2' ? `0 0 24px ${SUCCESS_COLOR}30` : 'none',
                        }}>
                            <div style={{ position: 'absolute', top: '6px', right: '6px', zIndex: 100, padding: '3px 10px', background: P2_COLOR, borderRadius: '6px', color: '#fff', fontWeight: 700, fontSize: '11px', opacity: 0.9 }}>P2</div>
                            <GameEngine landmarks={p2Landmarks}
                                onGameEvent={(ev) => { if (ev === 'COMPLETE') handlePlayerFinish(2); }}
                                trackingSensitivity={trackingSensitivity} />
                            {winner === 'P2' && (
                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
                                    <h2 style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 900, textShadow: '0 4px 20px rgba(0,0,0,0.7)', margin: 0 }}>
                                        🏆 {L('p2Wins', lang)}
                                    </h2>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Restart button */}
                    {winner && (
                        <div style={{ textAlign: 'center', marginTop: '8px' }}>
                            <button onClick={() => { setGameStarted(false); setWinner(null); setCountdown(0); clearInterval(timerRef.current); }}
                                style={{
                                    padding: '10px 32px', fontSize: '14px', fontWeight: 700,
                                    background: 'linear-gradient(135deg, #00d4aa, #06b6d4)',
                                    color: '#000', border: 'none', borderRadius: '10px', cursor: 'pointer',
                                    boxShadow: '0 4px 16px rgba(0,212,170,0.3)',
                                }}>
                                🔄 Chơi lại
                            </button>
                        </div>
                    )}
                </div>
            )}
            <style>{`@keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }`}</style>
        </div>
    );
};

export default MultiplayerEngine;
