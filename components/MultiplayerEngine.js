'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import GameEngine from './GameEngine';

const P1_COLOR = '#6366f1';
const P2_COLOR = '#ef4444';
const SUCCESS_COLOR = '#10b981';

const T = {
    vi: {
        title: 'CHẾ ĐỘ 2 NGƯỜI CHƠI',
        subtitle: 'Người chơi 1 = Bên trái màn hình | Người chơi 2 = Bên phải màn hình',
        p1Label: 'NGƯỜI CHƠI 1',
        p2Label: 'NGƯỜI CHƠI 2',
        p1HandWait: 'Đang chờ tay P1...',
        p2HandWait: 'Đang chờ tay P2...',
        p1Raise: 'Giơ tay trái lên cao!',
        p2Raise: 'Giơ tay phải lên cao!',
        ready: 'Sẵn sàng!',
        start: 'BẮT ĐẦU THI ĐẤU',
        bothReady: 'Mỗi người giơ 1 tay để sẵn sàng',
        needFaces: 'CẦN 2 KHUÔN MẶT TRONG KHUNG HÌNH',
        needTwoFaces: 'Cần 2 người đứng trước camera',
        p2Override: 'TÔI LÀ NGƯỜI CHƠI 2',
        p2OverrideCountdown: 'Chạm trong {n}s',
        p2OverrideExpired: 'Đã hết giờ! Nhấn "Thử lại"',
        overrideRetry: 'Thử lại',
        p2OverrideReady: 'P2 đã sẵn sàng (chạm tay)',
        faceOk: 'Đã thấy mặt',
        faceMissing: 'Chưa thấy mặt',
        handOk: 'Đã thấy tay',
        handMissing: 'Chưa thấy tay',
        handRaised: 'Đã giơ lên',
        p1Wins: 'P1 THẮNG!',
        p2Wins: 'P2 THẮNG!',
        vs: 'VS',
        waiting: 'Đang chờ...',
        p1ReadyP2Wait: 'P1 sẵn sàng — P2 chạm nút bên dưới!',
        overrideInstruction: 'P2 chưa thấy tay? Hãy chạm vào nút bên dưới',
        faceCount: 'Số khuôn mặt: {n}',
        faceDetectorLoading: 'Đang khởi tạo AI nhận diện khuôn mặt...',
        faceDetectorError: 'AI nhận diện khuôn mặt không khả dụng',
        startMatch: '🚀 BẮT ĐẦU THI ĐẤU',
    },
    en: {
        title: 'MULTIPLAYER MODE',
        subtitle: 'Player 1 = Left side | Player 2 = Right side',
        p1Label: 'PLAYER 1',
        p2Label: 'PLAYER 2',
        p1HandWait: 'Waiting for P1 hand...',
        p2HandWait: 'Waiting for P2 hand...',
        p1Raise: 'Raise your LEFT hand!',
        p2Raise: 'Raise your RIGHT hand!',
        ready: 'Ready!',
        start: 'START MATCH',
        bothReady: 'Each player raise 1 hand to ready up',
        needFaces: 'NEED 2 FACES IN FRAME',
        needTwoFaces: 'Need 2 people standing in front of camera',
        p2Override: 'I AM PLAYER 2',
        p2OverrideCountdown: 'Tap in {n}s',
        p2OverrideExpired: 'Time expired! Tap "Retry"',
        overrideRetry: 'Retry',
        p2OverrideReady: 'P2 ready (tap)',
        faceOk: 'Face OK',
        faceMissing: 'No face',
        handOk: 'Hand OK',
        handMissing: 'No hand',
        handRaised: 'Raised',
        p1Wins: 'PLAYER 1 WINS!',
        p2Wins: 'PLAYER 2 WINS!',
        vs: 'VS',
        waiting: 'Waiting...',
        p1ReadyP2Wait: 'P1 ready — P2 tap the button below!',
        overrideInstruction: 'P2 hand not detected? Tap the button below',
        faceCount: 'Faces: {n}',
        faceDetectorLoading: 'Initializing face detection AI...',
        faceDetectorError: 'Face detection AI unavailable',
        startMatch: '🚀 START MATCH',
    },
};

const L = (key, lang) => (T[lang === 'en' ? 'en' : 'vi']?.[key] ?? T.vi[key]);

const MultiplayerEngine = ({ landmarks, onGameEvent, lang, trackingSensitivity }) => {
    const [p1State, setP1State] = useState({ detected: false, ready: false, finished: false, time: 0 });
    const [p2State, setP2State] = useState({ detected: false, ready: false, finished: false, time: 0 });
    const [gameStarted, setGameStarted] = useState(false);
    const [winner, setWinner] = useState(null);
    const [p2OverrideActive, setP2OverrideActive] = useState(false);
    const [p2Overridden, setP2Overridden] = useState(false);
    const [p2OverrideCountdown, setP2OverrideCountdown] = useState(5);
    const [p2OverrideExpired, setP2OverrideExpired] = useState(false);

    const timerRef = useRef(null);
    const overrideTimerRef = useRef(null);
    const mountedRef = useRef(true);
    const p1WasReadyRef = useRef(false);

    // ------------------------------------------------------------------
    // Spatial clustering
    // Each player needs 1 hand
    // ------------------------------------------------------------------
    const minHandsPerPlayer = 1;

    const p1Landmarks = useMemo(() => {
        if (!landmarks || landmarks.length === 0) return null;
        const leftSide = landmarks.filter(hand =>
            hand[0] && hand[0].x !== undefined && hand[0].x < 0.5
        );
        return leftSide.length >= minHandsPerPlayer ? leftSide : null;
    }, [landmarks, minHandsPerPlayer]);

    const p2Landmarks = useMemo(() => {
        if (!landmarks || landmarks.length === 0) return null;
        const rightSide = landmarks.filter(hand =>
            hand[0] && hand[0].x !== undefined && hand[0].x >= 0.5
        );
        return rightSide.length >= minHandsPerPlayer ? rightSide : null;
    }, [landmarks, minHandsPerPlayer]);

    function isHandRaised(hand) {
        return hand && hand[8] && hand[8].y !== undefined && hand[8].y < 0.4;
    }

    // ------------------------------------------------------------------
    // P2 override countdown
    // ------------------------------------------------------------------
    useEffect(() => {
        if (!p2OverrideActive || p2OverrideCountdown <= 0) return;
        overrideTimerRef.current = setInterval(() => {
            setP2OverrideCountdown(prev => {
                if (prev <= 1) {
                    setP2OverrideActive(false);
                    setP2OverrideExpired(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(overrideTimerRef.current);
    }, [p2OverrideActive, p2OverrideCountdown]);

    // ------------------------------------------------------------------
    // Player detection (pre-game)
    // ------------------------------------------------------------------
    useEffect(() => {
        if (gameStarted) return;

        const p1Hands = p1Landmarks;
        const p1Detected = p1Hands && p1Hands.length >= 1;
        const p1Ready = p1Detected && p1Hands && p1Hands.every(h => isHandRaised(h));

        setP1State(prev => ({ ...prev, detected: !!p1Detected, ready: !!p1Ready }));

        const p2Hands = p2Landmarks;
        const p2Detected = p2Hands && p2Hands.length >= 1;
        const p2Ready = p2Detected && p2Hands && p2Hands.every(h => isHandRaised(h));

        setP2State(prev => ({ ...prev, detected: !!p2Detected, ready: !!p2Ready }));
    }, [p1Landmarks, p2Landmarks, gameStarted]);

    // Activate P2 override when P1 becomes ready
    useEffect(() => {
        if (p1State.ready && !gameStarted && !p1WasReadyRef.current) {
            p1WasReadyRef.current = true;
            setP2OverrideActive(true);
            setP2OverrideCountdown(5);
            setP2OverrideExpired(false);
            setP2Overridden(false);
        }
        if (!p1State.ready && !gameStarted) {
            p1WasReadyRef.current = false;
        }
    }, [p1State.ready, gameStarted]);

    // Reset override when P2 becomes ready via hands
    useEffect(() => {
        if (p2State.ready && p2OverrideActive) {
            setP2OverrideActive(false);
            setP2Overridden(false);
        }
    }, [p2State.ready, p2OverrideActive]);

    // ------------------------------------------------------------------
    // Derived ready state
    // ------------------------------------------------------------------
    const p2IsReady = p2State.ready || p2Overridden;
    const canStart = p1State.ready && p2IsReady;

    // ------------------------------------------------------------------
    // Game controls
    // ------------------------------------------------------------------
    const handleP2Override = () => {
        setP2Overridden(true);
        setP2OverrideActive(false);
        setP2OverrideExpired(false);
        setP2State(prev => ({ ...prev, detected: true, ready: true }));
    };

    const startGame = () => {
        setGameStarted(true);
        setP1State(prev => ({ ...prev, time: 0, finished: false }));
        setP2State(prev => ({ ...prev, time: 0, finished: false }));
        setWinner(null);
        setP2OverrideActive(false);
        setP2Overridden(false);
        setP2OverrideExpired(false);

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

    // ------------------------------------------------------------------
    // PlayerCard
    // ------------------------------------------------------------------
    const PlayerCard = ({ id, state, color, label, side }) => {
        const hands = side === 'left' ? p1Landmarks : p2Landmarks;
        const hasHand = state.detected;
        const handRaised = state.ready;

        return (
            <div style={{
                flex: 1, textAlign: 'center', padding: '32px 20px', borderRadius: '20px',
                border: state.ready ? `3px solid ${color}` : '2px dashed rgba(255,255,255,0.15)',
                background: state.ready ? `${color}18` : 'rgba(255,255,255,0.03)',
                position: 'relative', transition: 'all 0.3s', minHeight: '300px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}>
                {/* Hand status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '28px', filter: hasHand ? 'none' : 'grayscale(1)', opacity: hasHand ? 1 : 0.3 }}>
                        {handRaised ? '✋' : '🖐️'}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: hasHand ? (handRaised ? '#10b981' : 'var(--warning)') : 'var(--text-muted)' }}>
                        {!hasHand ? L('handMissing', lang) : !handRaised ? L('handOk', lang) : L('handRaised', lang)}
                    </span>
                </div>

                <h3 style={{ color, margin: '8px 0 4px 0', fontSize: '18px', fontWeight: 800, letterSpacing: '1px' }}>{label}</h3>

                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600, margin: 0 }}>
                    {!state.ready
                        ? (!hasHand
                            ? (id === 1 ? L('p1HandWait', lang) : L('p2HandWait', lang))
                            : (id === 1 ? L('p1Raise', lang) : L('p2Raise', lang)))
                        : L('ready', lang)}
                </p>

                {state.ready && (
                    <div style={{ marginTop: '4px', padding: '4px 14px', background: color, borderRadius: '20px', color: '#fff', fontWeight: 700, fontSize: '12px' }}>
                        READY
                    </div>
                )}

                {hands && hands.map((hand, hi) => {
                    const tip = hand && hand[8];
                    const tx = tip && tip.x !== undefined ? Math.min(tip.x, 0.95) : 0.5;
                    const ty = tip && tip.y !== undefined ? Math.min(tip.y, 0.95) : 0.5;
                    return (
                        <div key={hi} style={{
                            position: 'absolute',
                            top: `${ty * 100}%`,
                            left: `${tx * 100}%`,
                            width: 18, height: 18, background: color, borderRadius: '50%',
                            border: '3px solid white', boxShadow: `0 0 15px ${color}`,
                            transform: 'translate(-50%, -50%)', transition: 'all 0.1s',
                            opacity: 0.8,
                        }} />
                    );
                })}
            </div>
        );
    };

    // ------------------------------------------------------------------
    // Render
    // ------------------------------------------------------------------
    return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
            {!gameStarted ? (
                <div style={{
                    padding: '48px 32px', borderRadius: '24px',
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px',
                }}>
                    <h2 style={{ color: '#fff', fontSize: '26px', fontWeight: 800, margin: 0 }}>
                        {L('title', lang)}
                    </h2>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0, textAlign: 'center' }}>
                        {L('subtitle', lang)}
                    </p>

                    <div style={{ display: 'flex', gap: '24px', width: '100%', maxWidth: '800px', alignItems: 'stretch' }}>
                        <PlayerCard id={1} state={p1State} color={P1_COLOR} label={L('p1Label', lang)} side="left" />
                        <div style={{ display: 'flex', alignItems: 'center', fontSize: '24px', fontWeight: 800, color: 'var(--text-muted)', padding: '0 8px' }}>{L('vs', lang)}</div>
                        <PlayerCard id={2} state={p2State} color={P2_COLOR} label={L('p2Label', lang)} side="right" />
                    </div>

                    {/* P2 manual override button */}
                    {p1State.ready && !p2State.ready && !p2Overridden && !p2OverrideExpired && p2OverrideActive && (
                        <div style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                            padding: '16px 24px', borderRadius: '16px',
                            background: 'rgba(239,68,68,0.06)', border: '2px solid rgba(239,68,68,0.2)',
                            width: '100%', maxWidth: '400px',
                        }}>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0, textAlign: 'center' }}>
                                {L('overrideInstruction', lang)}
                            </p>
                            <button onClick={handleP2Override}
                                style={{
                                    padding: '14px 40px', fontSize: '18px', fontWeight: 800,
                                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                    color: '#fff',
                                    border: 'none', borderRadius: '14px', cursor: 'pointer',
                                    boxShadow: '0 4px 20px rgba(239,68,68,0.4)',
                                    transition: 'all 0.3s', letterSpacing: '1px',
                                    animation: p2OverrideCountdown <= 3 ? 'pulse 0.6s ease-in-out infinite' : 'none',
                                    width: '100%',
                                }}>
                                {L('p2Override', lang)} — {L('p2OverrideCountdown', lang).replace('{n}', p2OverrideCountdown)}
                            </button>
                        </div>
                    )}

                    {p2OverrideExpired && !p2Overridden && (
                        <div style={{
                            padding: '12px 24px', borderRadius: '12px',
                            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                            color: '#ef4444', fontSize: '14px', fontWeight: 600,
                            display: 'flex', alignItems: 'center', gap: '12px',
                        }}>
                            <span>{L('p2OverrideExpired', lang)}</span>
                            <button onClick={() => { setP2OverrideExpired(false); setP2OverrideActive(true); setP2OverrideCountdown(5); }}
                                style={{
                                    padding: '6px 16px', background: '#ef4444', color: '#fff',
                                    border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit',
                                }}>
                                {L('overrideRetry', lang)}
                            </button>
                        </div>
                    )}

                    {/* Already have an override button; no second message needed */}

                    <button onClick={startGame} disabled={!canStart}
                        style={{
                            padding: '16px 56px', fontSize: '20px', fontWeight: 800,
                            background: canStart ? 'linear-gradient(135deg, #00d4aa, #06b6d4)' : 'rgba(255,255,255,0.05)',
                            color: canStart ? '#000' : 'var(--text-muted)',
                            border: 'none', borderRadius: '16px', cursor: canStart ? 'pointer' : 'not-allowed',
                            boxShadow: canStart ? '0 8px 32px rgba(0,212,170,0.4)' : 'none',
                            transition: 'all 0.3s', letterSpacing: '2px',
                        }}>
                        {L('startMatch', lang)}
                    </button>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0, textAlign: 'center' }}>
                        {L('bothReady', lang)}
                    </p>

                    <style>{`@keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }`}</style>
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
                            <div style={{ fontSize: '13px', color: P1_COLOR, fontWeight: 700, letterSpacing: '2px', marginBottom: '4px' }}>{L('p1Label', lang)}</div>
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
                                {winner ? `🏆 ${winner === 'P1' ? 'P1' : 'P2'} ${winner === 'P1' ? L('p1Wins', lang) : L('p2Wins', lang)}` : `⚔️ ${L('vs', lang)}`}
                            </span>
                        </div>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{ fontSize: '13px', color: P2_COLOR, fontWeight: 700, letterSpacing: '2px', marginBottom: '4px' }}>{L('p2Label', lang)}</div>
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
                                        🏆 {L('p1Wins', lang)}
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
                                        🏆 {L('p2Wins', lang)}
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
