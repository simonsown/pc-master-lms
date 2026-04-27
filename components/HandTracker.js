
'use client';

import { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

const HandTracker = ({ onLandmarks }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [handLandmarker, setHandLandmarker] = useState(null);
    const [webcamRunning, setWebcamRunning] = useState(false);

    useEffect(() => {
        const createHandLandmarker = async () => {
            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm"
            );
            const landmarker = await HandLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                    delegate: "GPU"
                },
                runningMode: "VIDEO",
                numHands: 2
            });
            setHandLandmarker(landmarker);
        };

        createHandLandmarker();
    }, []);

    // Auto-start webcam once landmarker is loaded
    useEffect(() => {
        if (handLandmarker && !webcamRunning) {
            setWebcamRunning(true);
        }
    }, [handLandmarker, webcamRunning]);

    useEffect(() => {
        let animationFrameId;

        const predictWebcam = async () => {
            if (videoRef.current && canvasRef.current && handLandmarker && webcamRunning) {
                const video = videoRef.current;
                const canvas = canvasRef.current;
                const ctx = canvas.getContext("2d");

                if (video.videoWidth > 0 && video.videoHeight > 0) {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                }

                let startTimeMs = performance.now();
                const results = await handLandmarker.detectForVideo(video, startTimeMs);

                ctx.clearRect(0, 0, canvas.width, canvas.height);

                if (results.landmarks) {
                    if (onLandmarks) {
                        const mirroredLandmarks = results.landmarks.map((hand, index) => {
                            const newHand = hand.map(point => ({ ...point, x: 1 - point.x }));
                            if (results.handednesses && results.handednesses[index]) {
                                newHand.handedness = results.handednesses[index][0].categoryName;
                            }
                            return newHand;
                        });
                        onLandmarks(mirroredLandmarks);
                    }
                    for (const landmarks of results.landmarks) {
                        drawConnectors(ctx, landmarks, HandLandmarker.HAND_CONNECTIONS, {
                            color: "#00FF00",
                            lineWidth: 5
                        });
                        drawLandmarks(ctx, landmarks, { color: "#FF0000", lineWidth: 2 });
                    }
                }

                animationFrameId = window.requestAnimationFrame(predictWebcam);
            }
        };

        if (webcamRunning) {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                alert("Camera access is not supported in your browser or you are not using HTTPS/localhost.");
                console.error("getUserMedia is not supported in this browser.");
                return;
            }
            const constraints = { video: true };
            navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    // predictWebcam is triggered by the effect loop now, but we need to start it?
                    // The effect depends on webcamRunning. 
                    // But we also need 'loadeddata' event? 
                    // Actually, just waiting for stream is enough to set srcObject. 
                    // The loop checks for video dimensions.
                    videoRef.current.addEventListener("loadeddata", () => {
                        predictWebcam();
                    });
                }
            }).catch(err => {
                console.error("Error accessing webcam:", err);
                alert("Error accessing webcam: " + err.message);
            });
        }

        return () => {
            if (animationFrameId) {
                window.cancelAnimationFrame(animationFrameId);
            }
        };
    }, [webcamRunning, handLandmarker, onLandmarks]);




    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: 'black', overflow: 'hidden' }}>
            <video
                ref={videoRef}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                autoPlay
                playsInline
            />
            <canvas
                ref={canvasRef}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', transform: 'scaleX(-1)' }}
            />
            {!handLandmarker && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', fontWeight: 'bold' }}>
                    Loading AI Model...
                </div>
            )}
        </div>
    );
};

// Helper functions for drawing
const drawConnectors = (ctx, landmarks, connections, style) => {
    ctx.strokeStyle = style.color;
    ctx.lineWidth = style.lineWidth;
    for (const connection of connections) {
        const start = landmarks[connection[0]];
        const end = landmarks[connection[1]];
        if (start && end) {
            ctx.beginPath();
            ctx.moveTo(start.x * ctx.canvas.width, start.y * ctx.canvas.height);
            ctx.lineTo(end.x * ctx.canvas.width, end.y * ctx.canvas.height);
            ctx.stroke();
        }
    }
}

const drawLandmarks = (ctx, landmarks, style) => {
    ctx.fillStyle = style.color;
    for (const landmark of landmarks) {
        ctx.beginPath();
        ctx.arc(landmark.x * ctx.canvas.width, landmark.y * ctx.canvas.height, style.lineWidth, 0, 2 * Math.PI);
        ctx.fill();
    }
}

export default HandTracker;
