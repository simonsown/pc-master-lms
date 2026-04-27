'use client';

import { useEffect, useRef, useState } from 'react';

const PINCH_THRESHOLD = 0.05;

const WebcamCursor = ({ landmarks, enabled, trackingSensitivity = 1.0 }) => {
    const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
    const [isPinching, setIsPinching] = useState(false);
    const wasPinchingRef = useRef(false);
    const filterRef = useRef({ x: null, y: null, alpha: 0.12 }); // High smoothing coefficient

    useEffect(() => {
        if (!enabled || !landmarks || !landmarks.length) {
            filterRef.current = { x: null, y: null, alpha: 0.12 };
            setCursorPos({ x: -100, y: -100 });
            return;
        }

        const hand = landmarks[0];
        const tips = [4, 8, 12, 16, 20];
        let sumX = 0;
        let sumY = 0;
        
        tips.forEach(i => {
            sumX += hand[i].x;
            sumY += hand[i].y;
        });

        const avgX = sumX / tips.length;
        const avgY = sumY / tips.length;

        const scaleX = (avgX - 0.5) * trackingSensitivity + 0.5;
        const scaleY = (avgY - 0.5) * trackingSensitivity + 0.5;
        const rawX = scaleX * window.innerWidth;
        const rawY = scaleY * window.innerHeight;

        const f = filterRef.current;
        if (f.x === null) {
            f.x = rawX;
            f.y = rawY;
        } else {
            // Apply exponential moving average (EMA)
            f.x += f.alpha * (rawX - f.x);
            f.y += f.alpha * (rawY - f.y);
        }

        setCursorPos({ x: f.x, y: f.y });

        const thumbTip = hand[4];
        const indexTip = hand[8];
        const distance = Math.hypot(indexTip.x - thumbTip.x, indexTip.y - thumbTip.y);
        const currentPinch = distance < PINCH_THRESHOLD;
        setIsPinching(currentPinch);

        if (currentPinch && !wasPinchingRef.current) {
            // Try to find the element under cursor
            // We use standard document.elementFromPoint. Ensure the cursor itself has pointer-events: none
            const el = document.elementFromPoint(f.x, f.y);
            if (el && typeof el.click === 'function') {
                el.click();
            }
        }

        wasPinchingRef.current = currentPinch;

    }, [landmarks, enabled, trackingSensitivity]);

    if (!enabled) return null;

    return (
        <div style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: isPinching ? 'rgba(255, 255, 0, 0.8)' : 'rgba(0, 255, 255, 0.5)',
            border: '2px solid white',
            transform: `translate(${cursorPos.x - 12}px, ${cursorPos.y - 12}px)`,
            pointerEvents: 'none',
            zIndex: 9999,
            transition: 'transform 0.05s linear, background-color 0.1s',
            boxShadow: isPinching ? '0 0 20px yellow' : '0 0 15px cyan'
        }} />
    );
};

export default WebcamCursor;
