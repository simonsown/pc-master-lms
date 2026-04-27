'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import GameEngine from './GameEngine';

const MultiplayerEngine = ({ landmarks, onGameEvent, lang, trackingSensitivity }) => {
    const [p1State, setP1State] = useState({ detected: false, ready: false, finished: false, time: 0 });
    const [p2State, setP2State] = useState({ detected: false, ready: false, finished: false, time: 0 });
    const [gameStarted, setGameStarted] = useState(false);
    const [winner, setWinner] = useState(null);
    const timerRef = useRef(null);

    // Split landmarks into P1 (Left) and P2 (Right)
    const p1Landmarks = useMemo(() => {
        if (!landmarks || landmarks.length === 0) return null;
        // P1: Tay phải (Physical Right Hand). MediaPipe unmirrored interprets physical right as 'Left'.
        return landmarks.filter(hand => hand.handedness === 'Left');
    }, [landmarks]);

    const p2Landmarks = useMemo(() => {
        if (!landmarks || landmarks.length === 0) return null;
        // P2: Tay trái (Physical Left Hand). MediaPipe unmirrored interprets physical left as 'Right'.
        return landmarks.filter(hand => hand.handedness === 'Right');
    }, [landmarks]);

    // Detection logic for "Ready" (Hand in upper half of the camera: y < 0.4)
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
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
            setP1State(prev => prev.finished ? prev : { ...prev, time: elapsed });
            setP2State(prev => prev.finished ? prev : { ...prev, time: elapsed });
        }, 100);
    };

    const handlePlayerFinish = (playerId) => {
        if (!gameStarted || winner) return;

        if (playerId === 1) {
            setP1State(prev => ({ ...prev, finished: true }));
            if (!winner) {
                setWinner('P1');
                clearInterval(timerRef.current);
            }
        } else {
            setP2State(prev => ({ ...prev, finished: true }));
            if (!winner) {
                setWinner('P2');
                clearInterval(timerRef.current);
            }
        }

        if (onGameEvent) onGameEvent(`win_${playerId}`, 'all');
    };

    return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
            {/* CENTRAL DIVIDER */}
            {gameStarted && (
                <div style={{
                    position: 'absolute', left: '50%', top: '100px', bottom: '0',
                    width: '1px', background: 'linear-gradient(to bottom, var(--warning), transparent)',
                    zIndex: 10, transform: 'translateX(-50%)', opacity: 0.3
                }} />
            )}
            {!gameStarted ? (
                <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>
                    <div style={{ display: 'flex', gap: '32px', width: '100%', justifyContent: 'center' }}>
                        {/* Player 1 Status */}
                        <div style={{ textAlign: 'center', padding: '32px', border: '2px dashed var(--brand-primary)', borderRadius: '16px', background: p1State.ready ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-surface)', flex: 1, position: 'relative', transition: 'all 0.3s' }}>
                            <div style={{ fontSize: '48px', filter: p1State.detected ? 'none' : 'grayscale(1)', transform: 'scaleX(-1)', opacity: p1State.detected ? 1 : 0.4 }}>✋</div>
                            <h3 style={{ color: 'var(--brand-light)', marginTop: '16px', marginBottom: '8px', fontSize: '18px' }}>PLAYER 1 (LEFT)</h3>
                            {!p1State.detected ? (
                                <p style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '14px' }}>Waiting for Player 1...</p>
                            ) : !p1State.ready ? (
                                <p style={{ color: 'var(--warning)', fontWeight: 600, fontSize: '14px' }}>Raise hand to the Top (Start Zone)</p>
                            ) : (
                                <p style={{ color: 'var(--success)', fontWeight: 700, fontSize: '16px' }}>P1 READY!</p>
                            )}

                            {/* Visual feedback where hand is */}
                            {p1Landmarks && p1Landmarks.length > 0 && (
                                <div style={{ position: 'absolute', top: p1Landmarks[0][8].y * 100 + '%', left: p1Landmarks[0][8].x * 100 + '%', width: 24, height: 24, background: 'var(--brand-primary)', borderRadius: '50%', transform: 'translate(-50%, -50%)', border: '3px solid white', boxShadow: '0 0 10px var(--brand-primary)' }} />
                            )}
                        </div>

                        {/* Player 2 Status */}
                        <div style={{ textAlign: 'center', padding: '32px', border: '2px dashed #ef4444', borderRadius: '16px', background: p2State.ready ? 'rgba(239, 68, 68, 0.15)' : 'var(--bg-surface)', flex: 1, position: 'relative', transition: 'all 0.3s' }}>
                            <div style={{ fontSize: '48px', filter: p2State.detected ? 'none' : 'grayscale(1)', opacity: p2State.detected ? 1 : 0.4 }}>✋</div>
                            <h3 style={{ color: '#f87171', marginTop: '16px', marginBottom: '8px', fontSize: '18px' }}>PLAYER 2 (RIGHT)</h3>
                            {!p2State.detected ? (
                                <p style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '14px' }}>Waiting for Player 2...</p>
                            ) : !p2State.ready ? (
                                <p style={{ color: 'var(--warning)', fontWeight: 600, fontSize: '14px' }}>Raise hand to the Top (Start Zone)</p>
                            ) : (
                                <p style={{ color: 'var(--success)', fontWeight: 700, fontSize: '16px' }}>P2 READY!</p>
                            )}

                            {/* Visual feedback where hand is */}
                            {p2Landmarks && p2Landmarks.length > 0 && (
                                <div style={{ position: 'absolute', top: p2Landmarks[0][8].y * 100 + '%', left: p2Landmarks[0][8].x * 100 + '%', width: 24, height: 24, background: '#ef4444', borderRadius: '50%', transform: 'translate(-50%, -50%)', border: '3px solid white', boxShadow: '0 0 10px #ef4444' }} />
                            )}
                        </div>
                    </div>

                    <button
                        onClick={startGame}
                        disabled={!p1State.ready || !p2State.ready}
                        style={{
                            padding: '16px 48px',
                            fontSize: '18px',
                            background: (p1State.ready && p2State.ready) ? 'var(--brand-primary)' : 'var(--bg-hover)',
                            color: (p1State.ready && p2State.ready) ? 'white' : 'var(--text-muted)',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: (p1State.ready && p2State.ready) ? 'pointer' : 'not-allowed',
                            fontWeight: 700,
                            boxShadow: (p1State.ready && p2State.ready) ? '0 8px 24px rgba(99, 102, 241, 0.4)' : 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                        {lang === 'en' ? 'START MATCH' : 'BẮT ĐẦU'}
                    </button>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        {lang === 'en' ? 'Both players must show hands to start (Left & Right side of webcam)' : 'Hai người chơi cần giơ tay (Trái & Phải khung hình) để bắt đầu'}
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                    {/* TOP SCOREBOARD */}
                    <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 32px', background: 'var(--bg-elevated)', borderBottom: '2px solid var(--border-subtle)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1 }}>
                            <span style={{ fontSize: '11px', color: 'var(--brand-light)', fontWeight: 700, letterSpacing: '1px' }}>PLAYER 1</span>
                            <span style={{ fontSize: '24px', color: 'var(--text-primary)', fontWeight: 800 }}>{p1State.time}s</span>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                            <div style={{ 
                                width: '100px', height: '50px', borderRadius: '8px', overflow: 'hidden', 
                                border: '1px solid var(--border-subtle)', background: 'transparent',
                                position: 'relative'
                            }}>
                                <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'var(--warning)', opacity: 0.5 }} />
                            </div>
                            <span style={{ fontSize: '14px', color: 'var(--warning)', fontWeight: 800 }}>VS</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flex: 1 }}>
                            <span style={{ fontSize: '11px', color: '#f87171', fontWeight: 700, letterSpacing: '1px' }}>PLAYER 2</span>
                            <span style={{ fontSize: '24px', color: 'var(--text-primary)', fontWeight: 800 }}>{p2State.time}s</span>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '100%' }}>
                        {/* Player 1 Side */}
                        <div style={{ position: 'relative', border: winner === 'P1' ? '4px solid var(--success)' : '2px solid var(--brand-primary)', borderRadius: '16px', overflow: 'hidden', boxShadow: winner === 'P1' ? '0 0 20px var(--success)' : 'none' }}>
                            <GameEngine
                                landmarks={p1Landmarks}
                                playerColor="blue"
                                onGameEvent={(ev, type) => {
                                    if (ev === 'COMPLETE') handlePlayerFinish(1);
                                }}
                                trackingSensitivity={trackingSensitivity}
                            />
                            {winner === 'P1' && (
                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
                                    <h2 style={{ color: 'white', fontSize: '3rem', fontWeight: 800, textShadow: '0 4px 12px rgba(0,0,0,0.5)', textAlign: 'center', padding: '0 20px' }}>{lang === 'en' ? 'PLAYER 1 WINS!' : 'NGƯỜI CHƠI 1 THẮNG!'}</h2>
                                </div>
                            )}
                        </div>

                        {/* Player 2 Side */}
                        <div style={{ position: 'relative', border: winner === 'P2' ? '4px solid var(--success)' : '2px solid #ef4444', borderRadius: '16px', overflow: 'hidden', boxShadow: winner === 'P2' ? '0 0 20px var(--success)' : 'none' }}>
                            <GameEngine
                                landmarks={p2Landmarks}
                                playerColor="red"
                                onGameEvent={(ev, type) => {
                                    if (ev === 'COMPLETE') handlePlayerFinish(2);
                                }}
                                trackingSensitivity={trackingSensitivity}
                            />
                            {winner === 'P2' && (
                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
                                    <h2 style={{ color: 'white', fontSize: '3rem', fontWeight: 800, textShadow: '0 4px 12px rgba(0,0,0,0.5)', textAlign: 'center', padding: '0 20px' }}>{lang === 'en' ? 'PLAYER 2 WINS!' : 'NGƯỜI CHƠI 2 THẮNG!'}</h2>
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
