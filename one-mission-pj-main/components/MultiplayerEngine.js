'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import GameEngine from './GameEngine';

const P1_COLOR = '#6366f1';
const P2_COLOR = '#ef4444';
const SUCCESS_COLOR = '#10b981';

const MultiplayerEngine = ({ landmarks, onGameEvent, lang, trackingSensitivity }) => {
    const [p1State, setP1State] = useState({ detected: false, ready: false, finished: false, time: 0 });
    const [p2State, setP2State] = useState({ detected: false, ready: false, finished: false, time: 0 });
    const [gameStarted, setGameStarted] = useState(false);
    const [winner, setWinner] = useState(null);
    const timerRef = useRef(null);

    const p1Landmarks = useMemo(() => {
        if (!landmarks || landmarks.length === 0) return null;
        return landmarks.filter(hand => hand.handedness === 'Left');
    }, [landmarks]);

    const p2Landmarks = useMemo(() => {
        if (!landmarks || landmarks.length === 0) return null;
        return landmarks.filter(hand => hand.handedness === 'Right');
    }, [landmarks]);

    useEffect(() => {
        if (!gameStarted) {
            const p1Detected = p1Landmarks && p1Landmarks.length > 0;
            const p2Detected = p2Landmarks && p2Landmarks.length > 0;
            const p1Ready = p1Detected && p1Landmarks[0][8].y < 0.4;
            const p2Ready = p2Detected && p2Landmarks[0][8].y < 0.4;
            setP1State(prev => ({ ...prev, detected: p1Detected, ready: p1Ready }));
            setP2State(prev => ({ ...prev, detected: p2Detected, ready: p2Ready }));
        }
    }, [p1Landmarks, p2Landmarks, gameStarted]);

    const startGame = () => {
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
    };

    const handlePlayerFinish = (playerId) => {
        if (!gameStarted || winner) return;
        if (playerId === 1) { setP1State(prev => ({ ...prev, finished: true })); setWinner('P1'); clearInterval(timerRef.current); }
        else { setP2State(prev => ({ ...prev, finished: true })); setWinner('P2'); clearInterval(timerRef.current); }
        if (onGameEvent) onGameEvent(`win_${playerId}`, 'all');
    };

    const PlayerCard = ({ id, state, landmarks, color, label }) => (
        <div style={{
            flex: 1, textAlign: 'center', padding: '40px 24px', borderRadius: '20px',
            border: state.ready ? `3px solid ${color}` : '2px dashed rgba(255,255,255,0.15)',
            background: state.ready ? `${color}18` : 'rgba(255,255,255,0.03)',
            position: 'relative', transition: 'all 0.3s', minHeight: '260px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
            <div style={{
                fontSize: '56px', filter: state.detected ? 'none' : 'grayscale(1)',
                opacity: state.detected ? 1 : 0.3, marginBottom: '12px',
            }}>{state.detected ? (state.ready ? '✅' : '✋') : '🕐'}</div>
            <h3 style={{ color, margin: '0 0 4px 0', fontSize: '22px', fontWeight: 800, letterSpacing: '1px' }}>{label}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600, margin: 0 }}>
                {!state.detected ? 'Đang chờ người chơi...' : !state.ready ? 'Giơ tay lên cao!' : '✅ Sẵn sàng!'}
            </p>
            {state.ready && (
                <div style={{ marginTop: '12px', padding: '6px 16px', background: color, borderRadius: '20px', color: '#fff', fontWeight: 700, fontSize: '13px' }}>
                    READY
                </div>
            )}
            {landmarks && landmarks.length > 0 && (
                <div style={{
                    position: 'absolute', top: `${landmarks[0][8].y * 100}%`, left: `${landmarks[0][8].x * 100}%`,
                    width: 28, height: 28, background: color, borderRadius: '50%',
                    border: '4px solid white', boxShadow: `0 0 20px ${color}`,
                    transform: 'translate(-50%, -50%)', transition: 'all 0.1s',
                }} />
            )}
        </div>
    );

    return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
            {!gameStarted ? (
                <div style={{
                    padding: '48px', borderRadius: '24px',
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px',
                }}>
                    <h2 style={{ color: '#fff', fontSize: '28px', fontWeight: 800, margin: 0 }}>
                        {lang === 'en' ? 'MULTIPLAYER MODE' : 'CHẾ ĐỘ 2 NGƯỜI CHƠI'}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '15px', margin: 0 }}>
                        {lang === 'en' ? 'Player 1 = Right hand (left side of screen) · Player 2 = Left hand' : 'Người chơi 1 = Tay phải (bên trái màn hình) · Người chơi 2 = Tay trái'}
                    </p>
                    <div style={{ display: 'flex', gap: '32px', width: '100%', maxWidth: '800px' }}>
                        <PlayerCard id={1} state={p1State} landmarks={p1Landmarks} color={P1_COLOR} label="PLAYER 1" />
                        <div style={{ display: 'flex', alignItems: 'center', fontSize: '32px', fontWeight: 900, color: 'var(--text-muted)' }}>VS</div>
                        <PlayerCard id={2} state={p2State} landmarks={p2Landmarks} color={P2_COLOR} label="PLAYER 2" />
                    </div>
                    <button onClick={startGame} disabled={!p1State.ready || !p2State.ready}
                        style={{
                            padding: '16px 56px', fontSize: '20px', fontWeight: 800,
                            background: (p1State.ready && p2State.ready) ? 'linear-gradient(135deg, #00d4aa, #06b6d4)' : 'rgba(255,255,255,0.05)',
                            color: (p1State.ready && p2State.ready) ? '#000' : 'var(--text-muted)',
                            border: 'none', borderRadius: '16px', cursor: (p1State.ready && p2State.ready) ? 'pointer' : 'not-allowed',
                            boxShadow: (p1State.ready && p2State.ready) ? '0 8px 32px rgba(0,212,170,0.4)' : 'none',
                            transition: 'all 0.3s', letterSpacing: '2px',
                        }}>
                        {lang === 'en' ? '🚀 START MATCH' : '🚀 BẮT ĐẦU THI ĐẤU'}
                    </button>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
                        {lang === 'en' ? 'Both players raise hand to the top of the camera frame' : 'Cả 2 người chơi giơ tay lên cao để sẵn sàng'}
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                    {/* Scoreboard */}
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '16px 32px', borderRadius: '16px',
                        background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)',
                    }}>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{ fontSize: '13px', color: P1_COLOR, fontWeight: 700, letterSpacing: '2px', marginBottom: '4px' }}>PLAYER 1</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#fff', fontFamily: 'monospace' }}>
                                {winner === 'P2' ? '⏹' : `${p1State.time}s`}
                            </div>
                        </div>
                        <div style={{
                            padding: '8px 24px', borderRadius: '30px',
                            background: winner ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${winner ? SUCCESS_COLOR : 'rgba(255,255,255,0.1)'}`,
                        }}>
                            <span style={{ fontSize: '18px', fontWeight: 900, color: winner ? SUCCESS_COLOR : 'var(--warning)', letterSpacing: '2px' }}>
                                {winner ? `🏆 ${winner === 'P1' ? 'P1' : 'P2'} THẮNG!` : '⚔️ VS'}
                            </span>
                        </div>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{ fontSize: '13px', color: P2_COLOR, fontWeight: 700, letterSpacing: '2px', marginBottom: '4px' }}>PLAYER 2</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#fff', fontFamily: 'monospace' }}>
                                {winner === 'P1' ? '⏹' : `${p2State.time}s`}
                            </div>
                        </div>
                    </div>

                    {/* Game Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '100%' }}>
                        <div style={{
                            position: 'relative', borderRadius: '16px', overflow: 'hidden',
                            border: winner === 'P1' ? `4px solid ${SUCCESS_COLOR}` : `2px solid ${P1_COLOR}`,
                            boxShadow: winner === 'P1' ? `0 0 30px ${SUCCESS_COLOR}40` : 'none',
                        }}>
                            <div style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 100, padding: '4px 12px', background: P1_COLOR, borderRadius: '8px', color: '#fff', fontWeight: 700, fontSize: '12px' }}>P1</div>
                            <GameEngine landmarks={p1Landmarks} playerColor="blue"
                                onGameEvent={(ev, type) => { if (ev === 'COMPLETE') handlePlayerFinish(1); }}
                                trackingSensitivity={trackingSensitivity} />
                            {winner === 'P1' && (
                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 1000, backdropFilter: 'blur(6px)' }}>
                                    <h2 style={{ color: '#fff', fontSize: '3.5rem', fontWeight: 900, textShadow: '0 4px 20px rgba(0,0,0,0.7)', textAlign: 'center', margin: 0 }}>
                                        🏆 {lang === 'en' ? 'PLAYER 1 WINS!' : 'P1 THẮNG!'}
                                    </h2>
                                </div>
                            )}
                        </div>
                        <div style={{
                            position: 'relative', borderRadius: '16px', overflow: 'hidden',
                            border: winner === 'P2' ? `4px solid ${SUCCESS_COLOR}` : `2px solid ${P2_COLOR}`,
                            boxShadow: winner === 'P2' ? `0 0 30px ${SUCCESS_COLOR}40` : 'none',
                        }}>
                            <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 100, padding: '4px 12px', background: P2_COLOR, borderRadius: '8px', color: '#fff', fontWeight: 700, fontSize: '12px' }}>P2</div>
                            <GameEngine landmarks={p2Landmarks} playerColor="red"
                                onGameEvent={(ev, type) => { if (ev === 'COMPLETE') handlePlayerFinish(2); }}
                                trackingSensitivity={trackingSensitivity} />
                            {winner === 'P2' && (
                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 1000, backdropFilter: 'blur(6px)' }}>
                                    <h2 style={{ color: '#fff', fontSize: '3.5rem', fontWeight: 900, textShadow: '0 4px 20px rgba(0,0,0,0.7)', textAlign: 'center', margin: 0 }}>
                                        🏆 {lang === 'en' ? 'PLAYER 2 WINS!' : 'P2 THẮNG!'}
                                    </h2>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MultiplayerEngine;
