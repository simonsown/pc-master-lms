'use client';

import { useEffect, useRef, useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import confetti from 'canvas-confetti';

const GRAB_DISTANCE = 0.05; // Threshold for pinch detection

const GameEngine = forwardRef(({ landmarks, onGameEvent, purchasedItems }, ref) => {
    const canvasRef = useRef(null);

    // Offscreen Canvas for caching static heavy elements
    const bgCacheRef = useRef(null);

    // Game State Ref - Init with or without purchasedItems
    const stateRef = useRef(null);
    if (stateRef.current === null) {
        let initialComponents = [];
        if (purchasedItems) {
            let leftY = 50;
            let rightY = 50;

            purchasedItems.forEach((item) => {
                if (item.type === 'Mainboard') return; // Don't spawn mainboard as draggable part

                const spawnProps = (type) => {
                    let w, h;
                    if (type === 'CPU') { w = 80; h = 80; }
                    else if (type === 'RAM') { w = 25; h = 260; }
                    else if (type === 'GPU') { w = 320; h = 130; }
                    else if (type === 'SSD' || type === 'Storage') { w = 140; h = 35; }
                    else if (type === 'COOLER' || type === 'Cooler') { w = 90; h = 90; }
                    else if (type === 'PSU') { w = 180; h = 160; }
                    else { w = 100; h = 100; }
                    return { w, h };
                };

                const pushComp = (ctype) => {
                    const { w, h } = spawnProps(ctype);
                    let x, y;
                    if (initialComponents.length % 2 === 0) {
                        x = 20; y = leftY; leftY += h + 20;
                    } else {
                        x = 1050; y = rightY; rightY += h + 20;
                    }
                    initialComponents.push({
                        id: Math.random(),
                        type: ctype === 'Storage' ? 'SSD' : ctype === 'Cooler' ? 'COOLER' : ctype,
                        x, y, width: w, height: h, isGrabbed: false, isPlaced: false, itemData: item
                    });
                };

                pushComp(item.type);
                if (item.type === 'RAM') { // Kits have 2 pieces
                    pushComp('RAM');
                }
            });
        } else {
            initialComponents = [
                // Left Side staging:
                { id: 1, type: 'CPU', x: 20, y: 50, width: 80, height: 80, isGrabbed: false, isPlaced: false },
                { id: 2, type: 'RAM', x: 20, y: 200, width: 25, height: 260, isGrabbed: false, isPlaced: false },
                { id: 4, type: 'RAM', x: 100, y: 200, width: 25, height: 260, isGrabbed: false, isPlaced: false },
                { id: 5, type: 'PSU', x: 20, y: 500, width: 180, height: 160, isGrabbed: false, isPlaced: false },
                // Right Side staging:
                { id: 3, type: 'GPU', x: 1000, y: 650, width: 320, height: 130, isGrabbed: false, isPlaced: false },
                { id: 6, type: 'SSD', x: 1050, y: 50, width: 140, height: 35, isGrabbed: false, isPlaced: false },
                { id: 7, type: 'COOLER', x: 1050, y: 150, width: 90, height: 90, isGrabbed: false, isPlaced: false }
            ];
        }

        stateRef.current = {
            components: initialComponents,
            sockets: [
                { id: 'socket-cpu', type: 'CPU', x: 615, y: 190, width: 80, height: 80 },
                { id: 'socket-cooler', type: 'COOLER', x: 610, y: 185, width: 90, height: 90 },
                { id: 'socket-ram-1', type: 'RAM', x: 800, y: 120, width: 25, height: 260, vertical: true },
                { id: 'socket-ram-2', type: 'RAM', x: 870, y: 120, width: 25, height: 260, vertical: true },
                { id: 'socket-gpu', type: 'GPU', x: 455, y: 560, width: 320, height: 130 },
                { id: 'socket-psu', type: 'PSU', x: 135, y: 620, width: 200, height: 160 },
                { id: 'socket-ssd', type: 'SSD', x: 515, y: 480, width: 140, height: 35 }
            ]
        };
    }

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
        spawnComponent: (type) => {
            let w, h, spawnY = 100;
            if (type === 'CPU') { w = 80; h = 80; }
            else if (type === 'RAM') { w = 35; h = 160; spawnY = 250; }
            else if (type === 'GPU') { w = 320; h = 130; spawnY = 450; }
            else if (type === 'SSD') { w = 140; h = 35; spawnY = 320; }
            else if (type === 'COOLER') { w = 90; h = 90; spawnY = 350; }

            // Limit duplicate unplaced logic
            const alreadyExists = stateRef.current.components.find(c => c.type === type && !c.isPlaced);
            if (!alreadyExists) {
                stateRef.current.components.push({
                    id: Date.now(),
                    type,
                    x: 120, // Clean staging area on the left
                    y: spawnY,
                    width: w, height: h,
                    isGrabbed: false, isPlaced: false
                });
            }
        }
    }));

    // Input States
    const mouseRef = useRef({ x: 0, y: 0, isDown: false });
    const landmarksRef = useRef(null);
    const cursorFilterRef = useRef({ x: null, y: null, alpha: 0.1 }); // Ultra-strong smoothing filter for zero jitter

    useEffect(() => {
        landmarksRef.current = landmarks;
    }, [landmarks]);

    const handleMouseMove = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        mouseRef.current.x = (e.clientX - rect.left) * (canvas.width / rect.width);
        mouseRef.current.y = (e.clientY - rect.top) * (canvas.height / rect.height);
    };

    const handleMouseDown = useCallback((e) => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        // Calculate true coordinates respecting CSS scaling and aspect ratio bounding
        const scaleX = 1400 / rect.width;
        const scaleY = 800 / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        mouseRef.current = { x, y, isDown: true };
        canvasRef.current.style.cursor = 'grabbing';
    }, []);

    const handleMouseUp = useCallback(() => {
        mouseRef.current.isDown = false;
        if (canvasRef.current) {
            canvasRef.current.style.cursor = 'grab';
        }
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false }); // Optimize for no alpha bg
        let animId;

        // --- HELPER FUNCTIONS FOR 3D RENDERING ---
        const draw3DBox = (context, x, y, width, height, depth, colorTop, colorFront, colorSide, edgeColor = 'rgba(0,0,0,0.5)') => {
            // Shadow (only if drawing to main context)
            if (context === ctx) {
                context.fillStyle = 'rgba(0,0,0,0.5)';
                context.beginPath();
                context.moveTo(x + depth, y - depth); context.lineTo(x + width + depth, y - depth); context.lineTo(x + width + depth, y + height - depth); context.lineTo(x + depth, y + height - depth);
                context.fill();
            }

            context.lineWidth = 1;
            context.strokeStyle = edgeColor;
            context.lineJoin = 'round';

            // Top Face
            context.fillStyle = colorTop;
            context.beginPath();
            context.moveTo(x, y); context.lineTo(x + width, y);
            context.lineTo(x + width + depth, y - depth); context.lineTo(x + depth, y - depth);
            context.closePath();
            context.fill(); context.stroke();

            // Side Face
            context.fillStyle = colorSide;
            context.beginPath();
            context.moveTo(x + width, y); context.lineTo(x + width + depth, y - depth);
            context.lineTo(x + width + depth, y + height - depth); context.lineTo(x + width, y + height);
            context.closePath();
            context.fill(); context.stroke();

            // Front Face
            context.fillStyle = colorFront;
            context.fillRect(x, y, width, height);
            context.strokeRect(x, y, width, height);
        };

        const drawCylinder = (context, x, y, radius, height, colorDark, colorLight) => {
            const grad = context.createLinearGradient(x - radius, y, x + radius, y);
            grad.addColorStop(0, colorDark);
            grad.addColorStop(0.5, colorLight);
            grad.addColorStop(1, colorDark);

            context.fillStyle = grad;
            context.beginPath();
            context.ellipse(x, y, radius, radius * 0.4, 0, 0, Math.PI * 2);
            context.fill();

            context.fillRect(x - radius, y, radius * 2, height);

            context.beginPath();
            context.ellipse(x, y + height, radius, radius * 0.4, 0, 0, Math.PI * 2);
            context.fill();
        };

        // Static heavy elements cached to offscreen canvas
        const initBgCache = () => {
            const offCanvas = document.createElement('canvas');
            offCanvas.width = 1400;
            offCanvas.height = 800;
            const oCtx = offCanvas.getContext('2d');

            // --- 0. Draw Background PC Case Chassis & Case Fans ---
            const caseGrad = oCtx.createLinearGradient(0, 0, 1400, 800);
            caseGrad.addColorStop(0, '#111827');
            caseGrad.addColorStop(1, '#030712');
            oCtx.fillStyle = caseGrad;
            oCtx.fillRect(0, 0, 1400, 800);

            oCtx.save();
            oCtx.translate(-125, 0); // Center translation for whole Case + Motherboard

            // Outer Case Boundary
            draw3DBox(oCtx, 240, 20, 940, 780, 20, '#1f2937', '#111827', '#030712');

            // Front panel inner bracket
            oCtx.fillStyle = '#0f172a';
            oCtx.fillRect(1130, 40, 40, 740);

            // Cable Routing Grommets
            oCtx.fillStyle = '#0a0a0a';
            for (let i = 100; i < 600; i += 150) {
                oCtx.beginPath(); oCtx.roundRect(1080, i, 40, 100, 20); oCtx.fill();
                oCtx.beginPath(); oCtx.roundRect(650 + (i / 3), 730, 80, 30, 15); oCtx.fill();
            }

            // PSU Shroud
            draw3DBox(oCtx, 240, 600, 940, 200, 10, '#0f172a', '#020617', '#000000');
            oCtx.fillStyle = '#1e293b';
            oCtx.fillRect(250, 610, 220, 180);
            oCtx.strokeStyle = '#334155'; oCtx.lineWidth = 4;
            oCtx.strokeRect(250, 610, 220, 180);


            // --- 1. Draw Elite Dark Motherboard Base ---
            const mainboardGrad = oCtx.createLinearGradient(480, 50, 1150, 770);
            mainboardGrad.addColorStop(0, '#1e1e24'); // Deep carbon slate
            mainboardGrad.addColorStop(0.5, '#121214'); // Dark
            mainboardGrad.addColorStop(1, '#09090b'); // Almost black shadow
            oCtx.fillStyle = mainboardGrad;
            oCtx.fillRect(500, 50, 650, 720);

            // Motherboard metallic rim/border
            oCtx.strokeStyle = '#3f3f46';
            oCtx.lineWidth = 3;
            oCtx.strokeRect(500, 50, 650, 720);

            // Cyberpunk PCB Angled Decals
            oCtx.fillStyle = 'rgba(255, 255, 255, 0.02)';
            oCtx.beginPath(); oCtx.moveTo(500, 600); oCtx.lineTo(900, 50); oCtx.lineTo(500, 50); oCtx.fill();
            oCtx.beginPath(); oCtx.moveTo(1150, 200); oCtx.lineTo(600, 770); oCtx.lineTo(1150, 770); oCtx.fill();

            // Motherboard metallic mounting standoffs (9 holes)
            oCtx.fillStyle = '#9ca3af'; // silver screw
            oCtx.strokeStyle = '#374151'; oCtx.lineWidth = 2;
            [
                [520, 70], [825, 70], [1130, 70],
                [520, 380], [825, 380], [1130, 380],
                [520, 750], [825, 750], [1130, 750]
            ].forEach(([sx, sy]) => {
                oCtx.beginPath(); oCtx.arc(sx, sy, 5, 0, Math.PI * 2); oCtx.fill(); oCtx.stroke();
                // Inner screw hole
                oCtx.fillStyle = '#030712';
                oCtx.beginPath(); oCtx.arc(sx, sy, 2, 0, Math.PI * 2); oCtx.fill(); oCtx.fillStyle = '#9ca3af';
            });

            // Intense High-Density PCB Background Traces (Copper / Gold styling)
            oCtx.strokeStyle = 'rgba(180, 83, 9, 0.3)'; // Copper traces
            oCtx.lineWidth = 1;
            oCtx.beginPath();

            // Generate heavily dense 90-degree/45-degree circuit traces
            for (let i = 0; i < 250; i++) {
                let startX = 510 + Math.random() * 630;
                let startY = 60 + Math.random() * 700;
                let len1 = 15 + Math.random() * 50;
                let len2 = 10 + Math.random() * 30;
                oCtx.moveTo(startX, startY);

                let direction = Math.random();
                if (direction > 0.75) {
                    oCtx.lineTo(startX + len1, startY);
                    oCtx.lineTo(startX + len1 + len2, startY + len2);
                } else if (direction > 0.5) {
                    oCtx.lineTo(startX, startY + len1);
                    oCtx.lineTo(startX - len2, startY + len1 + len2);
                } else if (direction > 0.25) {
                    oCtx.lineTo(startX - len1, startY);
                    oCtx.lineTo(startX - len1, startY - len2);
                } else {
                    oCtx.lineTo(startX, startY - len1);
                    oCtx.lineTo(startX + len2, startY - len1 - len2);
                }
            }
            oCtx.stroke();

            // Micro-vias and solder pads
            oCtx.fillStyle = 'rgba(217, 119, 6, 0.4)'; // Dim Copper for pads
            for (let i = 0; i < 300; i++) {
                let vx = 520 + Math.random() * 600;
                let vy = 70 + Math.random() * 680;
                oCtx.fillRect(vx, vy, 2, 2);
            }
            oCtx.fillStyle = '#fde047'; // Shiny Gold solder points
            for (let i = 0; i < 60; i++) {
                let px = 550 + Math.random() * 550;
                let py = 100 + Math.random() * 600;
                oCtx.beginPath();
                oCtx.arc(px, py, 1.5, 0, Math.PI * 2);
                oCtx.fill();
            }

            // 3D VRM Heatsinks (Aggressive Stealth Aluminum)
            draw3DBox(oCtx, 580, 50, 240, 60, 15, '#3f3f46', '#27272a', '#18181b', '#000');
            draw3DBox(oCtx, 580, 120, 50, 180, 15, '#3f3f46', '#27272a', '#18181b', '#000');

            // VRM Heatsink Fins Detail with Cyber-slits
            oCtx.fillStyle = '#09090b';
            for (let i = 590; i < 810; i += 12) { oCtx.fillRect(i, 58, 4, 44); oCtx.fillRect(i + 1, 65, 2, 30); }
            for (let i = 130; i < 290; i += 12) { oCtx.fillRect(588, i, 34, 4); oCtx.fillRect(595, i + 1, 20, 2); }

            // CPU Socket Area Bracket (Silver Metal LGA1151 Style Match)
            // Metal Base framing the pins
            draw3DBox(oCtx, 720, 170, 120, 120, 8, '#d1d5db', '#e5e7eb', '#9ca3af', '#6b7280');

            // Inner hollow for pins
            oCtx.fillStyle = '#111827';
            oCtx.fillRect(735, 185, 90, 90);

            // Socket pins bed
            oCtx.fillStyle = '#030712';
            oCtx.fillRect(740, 190, 80, 80);
            oCtx.fillStyle = '#fef08a'; // Bright gold pins
            for (let x = 742; x < 818; x += 3) {
                for (let y = 192; y < 268; y += 3) {
                    if ((x + y) % 7 !== 0) oCtx.fillRect(x, y, 1, 1);
                }
            }

            // Top Hinge Bracket & Bottom Locking Clasp (Silver)
            draw3DBox(oCtx, 730, 160, 100, 15, 6, '#cbd5e1', '#f1f5f9', '#94a3b8'); // Top hinge
            draw3DBox(oCtx, 750, 285, 60, 12, 6, '#cbd5e1', '#f1f5f9', '#94a3b8');  // Bottom lip

            // Locking Metal Lever (Right side)
            oCtx.strokeStyle = '#e2e8f0'; oCtx.lineWidth = 5;
            oCtx.shadowBlur = 4; oCtx.shadowColor = 'rgba(0,0,0,0.5)';
            oCtx.beginPath();
            oCtx.moveTo(850, 280); // Bottom latch
            oCtx.lineTo(865, 280);
            oCtx.lineTo(865, 150); // Up arm
            oCtx.lineTo(845, 150); // Top hook
            oCtx.stroke();
            oCtx.shadowBlur = 0;

            // Strict Proportion: Exactly 4 RAM Slots (Dual Channel Configuration)
            // Alternating colors: Elite dark gray and jet black
            for (let i = 0; i < 4; i++) {
                const startX = 890 + (i * 35); // 35px gap between DIMMs precisely scaled

                // Active slots 2 and 4
                const isOptimalSlot = (i === 1 || i === 3);
                const baseColor = isOptimalSlot ? '#52525b' : '#18181b';
                const shadowColor = isOptimalSlot ? '#3f3f46' : '#09090b';

                draw3DBox(oCtx, startX, 120, 18, 260, 6, baseColor, shadowColor, '#000');

                // Slot groove
                oCtx.fillStyle = '#000'; oCtx.fillRect(startX + 4, 125, 10, 250);

                // Top/Bottom clips (grey vs dark grey based on slot)
                oCtx.fillStyle = isOptimalSlot ? '#9ca3af' : '#4b5563';
                oCtx.fillRect(startX - 1, 108, 20, 12); oCtx.fillRect(startX - 1, 375, 20, 12);

                // PCB Gold trace pins bordering slot
                oCtx.fillStyle = '#f59e0b';
                for (let py = 130; py < 370; py += 5) {
                    if (py !== 260) { // realistic notch gap
                        oCtx.fillRect(startX - 2, py, 3, 2);
                        oCtx.fillRect(startX + 17, py, 3, 2);
                    }
                }
            }

            // GPU Armor Reinforced PCIe Slots (Steel/Metal)
            draw3DBox(oCtx, 560, 550, 400, 30, 8, '#e4e4e7', '#a1a1aa', '#71717a');
            oCtx.fillStyle = '#09090b'; oCtx.fillRect(570, 560, 380, 10);
            oCtx.fillStyle = '#fbbf24'; // PCIe gold pins
            for (let i = 575; i < 945; i += 4) oCtx.fillRect(i, 563, 2, 4);
            // Secondary simple slot
            draw3DBox(oCtx, 560, 650, 320, 20, 5, '#27272a', '#18181b', '#09090b');

            // M.2 NVMe Slot with Armor Heatsink Shield
            draw3DBox(oCtx, 640, 480, 150, 35, 6, '#3f3f46', '#27272a', '#18181b');
            oCtx.fillStyle = '#a1a1aa'; // Shield metallic logo accent
            oCtx.fillRect(660, 495, 60, 2); oCtx.fillRect(660, 500, 40, 2);

            // 3D CMOS Battery (Moved)
            drawCylinder(oCtx, 1000, 580, 22, 6, '#6b7280', '#e5e7eb');
            oCtx.beginPath(); oCtx.arc(1000, 580, 18, 0, Math.PI * 2); oCtx.strokeStyle = '#9ca3af'; oCtx.stroke();

            // Scattered Metallic Chokes and Black Capacitors 
            // Silver blocks around CPU
            for (let i = 0; i < 5; i++) draw3DBox(oCtx, 670, 180 + i * 20, 15, 15, 8, '#d4d4d8', '#a1a1aa', '#71717a');
            for (let i = 0; i < 3; i++) draw3DBox(oCtx, 720 + i * 25, 120, 15, 15, 8, '#d4d4d8', '#a1a1aa', '#71717a');
            // Premium Gold/Black Capacitors
            for (let i = 0; i < 8; i++) drawCylinder(oCtx, 610, 135 + i * 12, 5, 10, '#18181b', '#3f3f46');
            oCtx.fillStyle = '#f59e0b'; // Gold top caps
            for (let i = 0; i < 8; i++) oCtx.beginPath(), oCtx.arc(610, 135 + i * 12, 3, 0, Math.PI * 2), oCtx.fill();

            // Southbridge Base (Chipset Heatsink)
            draw3DBox(oCtx, 960, 630, 110, 110, 10, '#27272a', '#18181b', '#09090b', '#000');
            oCtx.fillStyle = '#18181b'; oCtx.fillRect(970, 640, 90, 90);

            // Real-life Steel/Silver Motherboard Screws (replaced green)
            const drawScrew = (x, y) => {
                oCtx.fillStyle = '#f4f4f5'; // Bright silver
                oCtx.beginPath(); oCtx.arc(x, y, 6, 0, Math.PI * 2); oCtx.fill();
                oCtx.fillStyle = '#a1a1aa'; // Dark inner socket

                oCtx.beginPath(); oCtx.arc(x, y, 4, 0, Math.PI * 2); oCtx.fill();
                oCtx.strokeStyle = '#064e3b'; // Screw cross slots
                oCtx.lineWidth = 1.5;
                oCtx.beginPath(); oCtx.moveTo(x - 3, y - 3); oCtx.lineTo(x + 3, y + 3); oCtx.moveTo(x + 3, y - 3); oCtx.lineTo(x - 3, y + 3); oCtx.stroke();
            };
            drawScrew(520, 70);
            drawScrew(1130, 70);
            drawScrew(520, 750);
            drawScrew(1130, 750);
            drawScrew(520, 410);
            drawScrew(1130, 410);

            oCtx.restore();
            bgCacheRef.current = offCanvas;
        };

        if (!bgCacheRef.current) initBgCache();

        const drawAnimatedMotherboard = (ctx, time) => {
            // Draw static baked layer
            if (bgCacheRef.current) {
                ctx.drawImage(bgCacheRef.current, 0, 0);
            }


            // Glowing Circuit Traces (Animated)
            ctx.save();
            ctx.translate(-125, 0);

            ctx.strokeStyle = '#d97706';
            ctx.lineWidth = 1.5;
            ctx.shadowBlur = 4;
            ctx.shadowColor = '#f59e0b';
            ctx.setLineDash([15, 20]);
            ctx.lineDashOffset = -time * 10;
            ctx.beginPath();
            ctx.moveTo(600, 300); ctx.lineTo(550, 300); ctx.lineTo(550, 150); ctx.lineTo(520, 150);
            ctx.moveTo(800, 200); ctx.lineTo(850, 200); ctx.lineTo(850, 100); ctx.lineTo(1100, 100);
            ctx.moveTo(600, 350); ctx.lineTo(570, 380); ctx.lineTo(570, 480); ctx.lineTo(520, 480);
            ctx.moveTo(800, 350); ctx.lineTo(850, 390); ctx.lineTo(1050, 390); ctx.lineTo(1050, 650);
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.setLineDash([]);

            // Southbridge Pulsating Glow
            const pulse = (Math.sin(time * 2) + 1) / 2;
            ctx.shadowBlur = 10; ctx.shadowColor = `rgba(245, 158, 11, ${pulse})`;
            ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2; ctx.strokeRect(970, 640, 90, 90);
            ctx.shadowBlur = 0;

            ctx.restore();
        };

        const drawComponent = (ctx, comp, time) => {
            ctx.save();
            ctx.translate(comp.x, comp.y);

            // Realistic Drop Shadow - Native shadowBlur is EXTREMELY expensive on complex paths like GPU, causing severe drag latency.
            // When grabbed, we remove shadowBlur and rely entirely on scale + a fast native offset fill to ensure absolutely ZERO lag.
            ctx.translate(comp.width / 2, comp.height / 2);
            if (comp.isGrabbed) {
                ctx.scale(1.05, 1.05); // Simple scale is GPU accelerated and instant
                ctx.shadowBlur = 0;
                ctx.shadowOffsetY = 0;
            } else {
                ctx.shadowBlur = 6;
                ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                ctx.shadowOffsetY = 4;
            }
            ctx.translate(-comp.width / 2, -comp.height / 2);

            if (comp.type === 'CPU') {
                // 3D CPU IHS Base (Premium Matte Silver with metallic gradient)
                const ihsGrad = ctx.createLinearGradient(0, 0, comp.width, comp.height);
                ihsGrad.addColorStop(0, '#f4f4f5');
                ihsGrad.addColorStop(0.5, '#d4d4d8');
                ihsGrad.addColorStop(1, '#a1a1aa');

                // High-End PCB Substrate (Deep Bronze/Brown like Ryzen/Intel bases)
                draw3DBox(ctx, 0, 0, comp.width, comp.height, 4, '#451a03', '#2e1503', '#1c0d02', '#000');

                // Dense Gold Contacts array on bottom edge of substrate
                ctx.fillStyle = '#fef08a';
                for (let i = 4; i < comp.width - 4; i += 4) {
                    ctx.fillRect(i, 2, 2, 2);
                    ctx.fillRect(i, comp.height - 4, 2, 2);
                    ctx.fillRect(2, i, 2, 2);
                    ctx.fillRect(comp.width - 4, i, 2, 2);
                }

                // Heat Spreader Surface (IHS)
                ctx.fillStyle = ihsGrad;
                ctx.shadowBlur = 5; ctx.shadowColor = 'rgba(0,0,0,0.6)';
                // Unique cut-out shape for IHS
                ctx.beginPath();
                ctx.moveTo(15, 10); ctx.lineTo(comp.width - 15, 10);
                ctx.lineTo(comp.width - 10, 15); ctx.lineTo(comp.width - 10, comp.height - 15);
                ctx.lineTo(comp.width - 15, comp.height - 10); ctx.lineTo(15, comp.height - 10);
                ctx.lineTo(10, comp.height - 15); ctx.lineTo(10, 15); ctx.closePath();
                ctx.fill();
                ctx.shadowBlur = 0;

                // Intricate Heat Spreader Engravings (QR Code like square + alignments)
                ctx.strokeStyle = '#6b7280'; ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(15, 15); ctx.lineTo(35, 15); ctx.lineTo(35, 35); ctx.lineTo(15, 35); ctx.closePath(); ctx.stroke();

                // Corner Alignment Triangle (Gold)
                ctx.fillStyle = '#eab308';
                ctx.beginPath();
                ctx.moveTo(5, 5); ctx.lineTo(12, 5); ctx.lineTo(5, 12); ctx.fill();

            } else if (comp.type === 'RAM') {
                // Tall 3D RAM Stick (Black Aluminum)
                draw3DBox(ctx, 0, 0, comp.width, comp.height, 10, '#1f2937', '#111827', '#030712', '#374151');

                // Advanced Aluminum Heatsink Grooves (Angular Cyber Cuts)
                ctx.strokeStyle = '#09090b'; ctx.lineWidth = 2;
                ctx.beginPath();
                for (let i = 15; i < comp.height - 15; i += 12) {
                    ctx.moveTo(0, i); ctx.lineTo(10, i + 5); ctx.lineTo(comp.width - 10, i + 5); ctx.lineTo(comp.width, i);
                }
                ctx.stroke();

                // Bright ARGB LED Edge-Lit Diffuser
                const hue1 = (time * 120) % 360;
                const hue2 = (time * 120 + 80) % 360;
                const grad = ctx.createLinearGradient(0, 0, 0, comp.height);
                grad.addColorStop(0, `hsl(${hue1}, 100%, 65%)`);
                grad.addColorStop(0.5, '#ffffff'); // Crystal burst
                grad.addColorStop(1, `hsl(${hue2}, 100%, 65%)`);

                // RGB Core Light
                ctx.shadowBlur = 20; ctx.shadowColor = `hsl(${hue1}, 100%, 60%)`;
                ctx.fillStyle = grad;
                ctx.beginPath(); ctx.roundRect(comp.width / 2 - 4, 2, 8, comp.height - 4, 4); ctx.fill();
                ctx.shadowBlur = 0;

                // Gold PCB Connection Pins (bottom edge)
                ctx.fillStyle = '#eab308';
                for (let i = 10; i < comp.height - 10; i += 4) {
                    if (i !== comp.height / 2 && i !== comp.height / 2 + 4) { // Notch gap
                        ctx.fillRect(-4, i, 4, 2); // Left edge pins
                    }
                }

            } else if (comp.type === 'GPU') {
                // Massive 3D GPU Block (Elite Stealth Armor)
                const gpuGrad = ctx.createLinearGradient(0, 0, comp.width, 0);
                gpuGrad.addColorStop(0, '#27272a'); gpuGrad.addColorStop(0.5, '#3f3f46'); gpuGrad.addColorStop(1, '#18181b');
                draw3DBox(ctx, 0, 0, comp.width, comp.height, 25, gpuGrad, '#18181b', '#09090b', '#000');

                // Advanced Armor Plates and Indentations
                ctx.fillStyle = '#09090b';
                ctx.beginPath(); ctx.moveTo(10, 10); ctx.lineTo(comp.width - 10, 10); ctx.lineTo(comp.width - 40, comp.height - 10); ctx.lineTo(10, comp.height - 10); ctx.fill();

                // Cyberpunk Neon/Tech line accents
                ctx.strokeStyle = '#0ea5e9'; ctx.lineWidth = 2;
                ctx.shadowBlur = 5; ctx.shadowColor = '#0ea5e9';
                ctx.beginPath(); ctx.moveTo(25, 25); ctx.lineTo(120, 25); ctx.lineTo(140, 45); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(comp.width - 25, comp.height - 25); ctx.lineTo(comp.width - 120, comp.height - 25); ctx.stroke();
                ctx.shadowBlur = 0;

                // Exposed Copper Heatpipes (Multiple layers)
                ctx.strokeStyle = '#b45309'; ctx.lineWidth = 5;
                ctx.lineCap = 'round';
                [35, 45, comp.width - 45, comp.width - 35].forEach(x => {
                    ctx.beginPath(); ctx.moveTo(x, 20); ctx.lineTo(x, comp.height - 20); ctx.stroke();
                    // Highlights for pipes
                    ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.moveTo(x - 1, 20); ctx.lineTo(x - 1, comp.height - 20); ctx.stroke();
                    ctx.strokeStyle = '#b45309'; ctx.lineWidth = 5; // Reset
                });

                // Advanced Tri-Fan Setup with 3D Depth & Reflection
                const fanRadii = 42;
                const fanCenters = [90, 160, 230];
                fanCenters.forEach(cx => {
                    // Fan Well Depth
                    ctx.fillStyle = '#030712';
                    ctx.beginPath(); ctx.arc(cx, comp.height / 2, fanRadii + 5, 0, Math.PI * 2); ctx.fill();

                    // RGB Ring Around Fan — only pulse when GPU is placed in PCIe slot
                    if (comp.isPlaced) {
                        const pulse = (Math.sin(time * 3 + cx) + 1) / 2;
                        ctx.strokeStyle = `rgba(16, 185, 129, ${0.4 + pulse * 0.6})`;
                        ctx.shadowBlur = 8; ctx.shadowColor = '#10b981';
                    } else {
                        ctx.strokeStyle = 'rgba(71, 85, 105, 0.5)';
                        ctx.shadowBlur = 0;
                    }
                    ctx.lineWidth = 3;
                    ctx.beginPath(); ctx.arc(cx, comp.height / 2, fanRadii + 1, 0, Math.PI * 2); ctx.stroke();
                    ctx.shadowBlur = 0;

                    // Blade Spin — only spin when GPU is placed
                    const gpuFanAngle = comp.isPlaced ? time * 30 : 0;
                    ctx.save();
                    ctx.translate(cx, comp.height / 2);
                    ctx.rotate(gpuFanAngle);

                    for (let i = 0; i < 9; i++) {
                        ctx.rotate(Math.PI * 2 / 9);
                        ctx.beginPath();
                        ctx.moveTo(0, 0);
                        ctx.bezierCurveTo(fanRadii * 0.3, -18, fanRadii * 0.8, -12, fanRadii - 2, 0);
                        ctx.bezierCurveTo(fanRadii * 0.8, 10, fanRadii * 0.3, 10, 0, 0);
                        ctx.fillStyle = comp.isPlaced ? 'rgba(71, 85, 105, 0.85)' : 'rgba(51, 65, 85, 0.5)';
                        ctx.fill();

                        const bladeGrad = ctx.createLinearGradient(0, -10, fanRadii, 10);
                        bladeGrad.addColorStop(0, comp.isPlaced ? 'rgba(156, 163, 175, 0.9)' : 'rgba(100, 116, 139, 0.6)');
                        bladeGrad.addColorStop(1, comp.isPlaced ? 'rgba(75, 85, 99, 0.9)' : 'rgba(51, 65, 85, 0.6)');
                        ctx.fillStyle = bladeGrad;
                        ctx.fill();

                        ctx.strokeStyle = comp.isPlaced ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255,255,255,0.1)';
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                    ctx.restore();

                    // Fan Hub Center (Brushed metal)
                    drawCylinder(ctx, cx, comp.height / 2, 16, 3, '#27272a', '#a1a1aa');
                    // Hub Logo Ring
                    ctx.beginPath(); ctx.arc(cx, comp.height / 2, 10, 0, Math.PI * 2); ctx.strokeStyle = '#09090b'; ctx.lineWidth = 1; ctx.stroke();
                });

                // Top PCIe Connector Edge (Hidden slightly behind body, drops exactly into slot)
                ctx.fillStyle = '#f59e0b'; // Gold PCIe pins base
                ctx.fillRect(comp.width / 2 - 70, -8, 140, 8);
                // PCIe Pins detail
                ctx.fillStyle = '#b45309';
                for (let i = comp.width / 2 - 68; i < comp.width / 2 + 68; i += 3) {
                    if (i !== comp.width / 2 - 20) { // Small gap notch
                        ctx.fillRect(i, -8, 2, 6);
                    }
                }
            } else if (comp.type === 'SSD') {
                // Elite NVMe M.2 SSD
                const ssdGrad = ctx.createLinearGradient(0, 0, comp.width, comp.height);
                ssdGrad.addColorStop(0, '#18181b'); ssdGrad.addColorStop(1, '#09090b');
                draw3DBox(ctx, 0, 0, comp.width, comp.height, 4, ssdGrad, '#09090b', '#000', '#27272a');

                // Label
                ctx.fillStyle = '#0ea5e9'; // Cyan accent
                ctx.font = 'bold 10px monospace';
                ctx.fillText('NVMe M.2 1TB', 10, 22);

                // Gold Pins
                ctx.fillStyle = '#eab308';
                for (let i = 2; i < 20; i += 3) ctx.fillRect(-3, i, 3, 2);
                for (let i = 26; i < comp.height - 2; i += 3) ctx.fillRect(-3, i, 3, 2); // Gap for notch
            } else if (comp.type === 'PSU') {
                // Massive 3D PSU Power Box (Dark industrial aesthetic with gold trim)
                const psuGrad = ctx.createLinearGradient(0, 0, comp.width, comp.height);
                psuGrad.addColorStop(0, '#27272a'); psuGrad.addColorStop(1, '#09090b');
                draw3DBox(ctx, 0, 0, comp.width, comp.height, 18, psuGrad, '#18181b', '#09090b', '#000');

                // Gold Warning Trim
                ctx.strokeStyle = '#eab308'; ctx.lineWidth = 2;
                ctx.strokeRect(5, 5, comp.width - 10, comp.height - 10);

                // Advanced Modular Port Grid Interface
                ctx.fillStyle = '#09090b';
                ctx.fillRect(10, 10, comp.width - 20, 30);
                ctx.fillStyle = '#020617';
                // 12 Modular cable ports
                for (let row = 0; row < 2; row++) {
                    for (let col = 0; col < 6; col++) {
                        ctx.fillRect(15 + col * 26, 13 + row * 12, 20, 8);
                        // Gold pin inside port
                        ctx.fillStyle = '#fbbf24'; ctx.fillRect(18 + col * 26, 15 + row * 12, 14, 4); ctx.fillStyle = '#020617';
                    }
                }

                // Circular fan grille on top of PSU
                const cx = comp.width / 2;
                const cy = comp.height / 2 + 10;
                ctx.fillStyle = '#0f172a';
                ctx.beginPath(); ctx.arc(cx, cy, 55, 0, Math.PI * 2); ctx.fill();

                // Concentric circles for grille
                ctx.strokeStyle = '#334155'; ctx.lineWidth = 3;
                for (let r = 15; r <= 50; r += 10) {
                    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
                }

                // 24-pin Braided Cable snake protruding from side (Cable Managed!)
                ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 14;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(comp.width, comp.height - 40);

                if (comp.isPlaced) {
                    // Tuck cable immediately downwards and behind the back panel (Cable Management!)
                    ctx.bezierCurveTo(comp.width + 40, comp.height - 40, comp.width + 50, comp.height + 20, comp.width + 10, comp.height + 50);
                } else {
                    // Flailing cable when grabbed
                    ctx.bezierCurveTo(comp.width + 60, comp.height - 50, comp.width + 80, -20, comp.width + 150, -40);
                }
                ctx.stroke();

                // Colorful wires inside the sleeve (only visible near the connector)
                ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2; // Red wire
                ctx.beginPath(); ctx.moveTo(comp.width, comp.height - 42);
                if (comp.isPlaced) {
                    ctx.bezierCurveTo(comp.width + 40, comp.height - 40, comp.width + 50, comp.height + 20, comp.width + 10, comp.height + 50);
                } else {
                    ctx.bezierCurveTo(comp.width + 60, comp.height - 50, comp.width + 80, -20, comp.width + 150, -40);
                }
                ctx.stroke();

            } else if (comp.type === 'COOLER') {
                // Circular CPU Cooler with RGB and spinning fan
                ctx.fillStyle = '#0f172a';
                ctx.beginPath(); ctx.arc(comp.width / 2, comp.height / 2, 45, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = '#334155'; ctx.lineWidth = 4;
                ctx.stroke();

                // RGB Ring - only glow when placed
                ctx.strokeStyle = comp.isPlaced ? `hsl(${(time * 50) % 360}, 100%, 65%)` : '#334155';
                ctx.shadowBlur = comp.isPlaced ? 10 : 0;
                ctx.shadowColor = comp.isPlaced ? ctx.strokeStyle : 'transparent';
                ctx.lineWidth = 3;
                ctx.beginPath(); ctx.arc(comp.width / 2, comp.height / 2, 40, 0, Math.PI * 2); ctx.stroke();
                ctx.shadowBlur = 0;

                // Fan Blades - only spin when placed on CPU socket
                const fanAngle = comp.isPlaced ? time * 40 : 0; // stationary if not placed
                ctx.save();
                ctx.translate(comp.width / 2, comp.height / 2);
                ctx.rotate(fanAngle);
                for (let i = 0; i < 9; i++) {
                    ctx.rotate(Math.PI * 2 / 9);
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.bezierCurveTo(15, -15, 30, -10, 38, 0);
                    ctx.bezierCurveTo(30, 8, 15, 8, 0, 0);
                    ctx.fillStyle = comp.isPlaced ? 'rgba(148, 163, 184, 0.9)' : 'rgba(100, 116, 139, 0.7)';
                    ctx.fill();
                }
                ctx.restore();

                // Center logo
                ctx.fillStyle = '#0f172a';
                ctx.beginPath(); ctx.arc(comp.width / 2, comp.height / 2, 12, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 2; ctx.stroke();
                ctx.fillStyle = comp.isPlaced ? '#0ea5e9' : '#475569'; ctx.font = 'bold 8px Arial'; ctx.textAlign = 'center'; ctx.fillText('AI', comp.width / 2, comp.height / 2 + 3);

                // "Not installed" indicator when not placed
                if (!comp.isPlaced) {
                    ctx.fillStyle = 'rgba(0,0,0,0.0)'; // transparent — just logic indicator
                }
            }

            ctx.restore();
        };

        const updateAndDraw = () => {
            const time = performance.now() / 1000;
            const state = stateRef.current;
            const w = canvas.width;
            const h = canvas.height;

            // Determine active cursor (Hand Tracking OR Mouse)
            let activeCursorX = mouseRef.current.x;
            let activeCursorY = mouseRef.current.y;
            let isGrabbing = mouseRef.current.isDown;
            let showHandCursor = false;

            if (landmarksRef.current && landmarksRef.current.length > 0) {
                const hand = landmarksRef.current[0];
                const indexTip = hand[8];
                const thumbTip = hand[4];
                const distance = Math.hypot(indexTip.x - thumbTip.x, indexTip.y - thumbTip.y);

                // Add sensitivity multiplier to make the cursor feel extremely fast and responsive
                const SENSITIVITY = 1.6;
                const offsetX = (indexTip.x - 0.5) * SENSITIVITY + 0.5;
                const offsetY = (indexTip.y - 0.5) * SENSITIVITY + 0.5;

                const rawX = Math.max(0, Math.min(1, offsetX)) * w;
                const rawY = Math.max(0, Math.min(1, offsetY)) * h;

                const filter = cursorFilterRef.current;
                if (filter.x === null) {
                    filter.x = rawX;
                    filter.y = rawY;
                } else {
                    filter.x += filter.alpha * (rawX - filter.x);
                    filter.y += filter.alpha * (rawY - filter.y);
                }

                activeCursorX = filter.x;
                activeCursorY = filter.y;
                isGrabbing = distance < GRAB_DISTANCE;
                showHandCursor = true;
            } else {
                cursorFilterRef.current.x = null;
            }

            let hoveredCompType = null;

            // Logic Update
            state.components.forEach(comp => {
                if (comp.isPlaced) return;

                if (activeCursorX > comp.x && activeCursorX < comp.x + comp.width &&
                    activeCursorY > comp.y && activeCursorY < comp.y + comp.height) {
                    hoveredCompType = comp.type;
                }

                if (comp.isGrabbed) {
                    if (isGrabbing) {
                        comp.x = activeCursorX - comp.width / 2;
                        comp.y = activeCursorY - comp.height / 2;
                    } else {
                        // Released
                        comp.isGrabbed = false;

                        // Check Snap to closest Unoccupied Socket
                        let closestSocket = null;
                        let minDist = 120; // Very forgiving snap radius

                        state.sockets.filter(s => s.type === comp.type).forEach(socket => {
                            if (comp.type === 'COOLER') {
                                const cpuPlaced = state.components.some(c => c.type === 'CPU' && c.isPlaced);
                                if (!cpuPlaced) return; // Prevent placing cooler before CPU
                            }

                            // Check if this specific socket is already occupied by another placed component
                            const isOccupied = state.components.some(c => c.isPlaced && c.id !== comp.id && c.x === socket.x && c.y === socket.y);
                            if (!isOccupied) {
                                const dist = Math.hypot(comp.x - socket.x, comp.y - socket.y);
                                if (dist < minDist) {
                                    minDist = dist;
                                    closestSocket = socket;
                                }
                            }
                        });

                        if (closestSocket) {
                            comp.x = closestSocket.x;
                            comp.y = closestSocket.y;
                            comp.isPlaced = true;
                            if (onGameEvent) onGameEvent('placed', comp.type);

                            // Trigger Confetti
                            const allPlaced = state.components.every(c => c.isPlaced);
                            if (allPlaced && confetti) {
                                confetti({
                                    particleCount: 200,
                                    spread: 100,
                                    origin: { y: 0.6 },
                                    colors: ['#38bdf8', '#ff0055', '#10b981', '#f59e0b']
                                });
                                if (onGameEvent) onGameEvent('COMPLETE', 'ALL');
                            }
                        }
                    }
                } else {
                    if (isGrabbing) {
                        const holding = state.components.find(c => c.isGrabbed);
                        if (!holding && hoveredCompType === comp.type) {
                            comp.isGrabbed = true;
                            if (onGameEvent) onGameEvent('grabbed', comp.type);
                        }
                    }
                }
            });

            // --- DRAWING PHASE ---
            ctx.fillStyle = '#0f172a'; // Deep base color
            ctx.fillRect(0, 0, w, h);

            // Render Motherboard (cached + dynamic)
            drawAnimatedMotherboard(ctx, time);

            // Draw Glowing Sockets (Drop Zones) inside Motherboard - Only if empty
            state.sockets.forEach(socket => {
                const componentPlaced = state.components.find(c => c.isPlaced && Math.abs(c.x - socket.x) < 5 && Math.abs(c.y - socket.y) < 5);
                if (componentPlaced) return; // Do not draw glowing socket if filled perfectly

                ctx.save();
                ctx.translate(socket.x, socket.y);
                const pulse = (Math.sin(time * 4) + 1) / 2;
                ctx.strokeStyle = `rgba(16, 185, 129, ${0.5 + pulse * 0.5})`; // Emerald glowing pulsating border
                ctx.shadowBlur = 10; ctx.shadowColor = '#10b981';
                ctx.lineWidth = 3;
                ctx.setLineDash([15, 10]);
                ctx.lineDashOffset = -time * 25;
                ctx.strokeRect(0, 0, socket.width, socket.height);
                ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
                ctx.fillRect(0, 0, socket.width, socket.height);
                ctx.restore();
            });

            // Draw Components (Z-index sorting: placed -> unplaced non-grabbed -> grabbed goes ON TOP)
            state.components.filter(c => c.isPlaced).forEach(comp => drawComponent(ctx, comp, time));
            state.components.filter(c => !c.isPlaced && !c.isGrabbed).forEach(comp => drawComponent(ctx, comp, time));
            state.components.filter(c => c.isGrabbed).forEach(comp => drawComponent(ctx, comp, time));

            // Draw Active Cursor Indicator
            if (showHandCursor) {
                ctx.beginPath();
                ctx.arc(activeCursorX, activeCursorY, 15, 0, 2 * Math.PI);
                ctx.fillStyle = isGrabbing ? 'rgba(234, 179, 8, 0.9)' : 'rgba(56, 189, 248, 0.9)';
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 3;
                ctx.stroke();
            }

            animId = requestAnimationFrame(updateAndDraw);
        };

        // Start Loop
        animId = requestAnimationFrame(updateAndDraw);

        return () => cancelAnimationFrame(animId);
    }, [onGameEvent]);

    return (
        <canvas
            ref={canvasRef}
            width={1400}
            height={800}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
                width: '100%',
                maxHeight: '100%',
                aspectRatio: '7/4',
                background: '#0f172a',
                touchAction: 'none',
                cursor: 'crosshair'
            }}
        />
    );
});

GameEngine.displayName = 'GameEngine';

export default GameEngine;
