'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useAssemblyStore } from '@/lib/useStore';

const GameScene = dynamic(() => import('@/components/GameScene'), { ssr: false });
const HeadTracker = dynamic(() => import('@/components/HeadTracker'), { ssr: false });

const PART_COLORS: Record<string, string> = {
  cpu: '#00d4aa',
  cooler: '#00aaff',
  ram: '#6366f1',
  gpu: '#ef4444',
  psu: '#f59e0b',
  ssd: '#22c55e',
  motherboard: '#8b5cf6',
};

const PART_LABELS: Record<string, string> = {
  cpu: 'CPU',
  cooler: 'CPU Cooler',
  ram: 'RAM',
  gpu: 'GPU',
  psu: 'PSU',
  ssd: 'SSD',
  motherboard: 'Mainboard',
};

function ProgressRing({ progress, color, size = 40 }: { progress: number; color: string; size?: number }) {
  const r = size / 2 - 4;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - progress * circumference;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={3} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={3}
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
    </svg>
  );
}

function BootOverlay() {
  const bootStatus = useAssemblyStore((s) => s.bootStatus);
  const bootErrors = useAssemblyStore((s) => s.bootErrors);
  const [bootStep, setBootStep] = useState(0);

  useEffect(() => {
    if (bootStatus === 'booting') {
      setBootStep(0);
      const interval = setInterval(() => {
        setBootStep((prev) => {
          if (prev >= 3) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 400);
      return () => clearInterval(interval);
    }
  }, [bootStatus]);

  if (bootStatus === 'idle') return null;

  const bootMessages = [
    'Initializing UEFI firmware...',
    'Detecting hardware components...',
    'Validating system configuration...',
    'Starting power-on self-test...',
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9998,
      display: 'flex', flexDirection: 'column',
      background: bootStatus === 'success'
        ? 'rgba(0,0,0,0.85)'
        : bootStatus === 'failed'
          ? 'rgba(10,0,0,0.92)'
          : 'rgba(0,0,0,0.9)',
      backdropFilter: 'blur(8px)',
      fontFamily: "'JetBrains Mono', monospace",
      animation: 'fadeIn 0.3s ease',
    }}>
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center', gap: 24, padding: 40,
      }}>
        {bootStatus === 'booting' && (
          <>
            <div style={{
              width: 48, height: 48,
              border: '3px solid rgba(0,212,170,0.2)',
              borderTopColor: '#00d4aa',
              borderRadius: '50%',
              animation: 'vr-spin 0.6s linear infinite',
            }} />
            <div style={{ color: '#00d4aa', fontSize: 13, fontWeight: 700, letterSpacing: 2 }}>
              SYSTEM BOOTING
            </div>
            <div style={{ color: '#64748b', fontSize: 11, minHeight: 20 }}>
              {bootMessages[Math.min(bootStep, bootMessages.length - 1)]}
            </div>
          </>
        )}

        {bootStatus === 'success' && (
          <>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'rgba(0,212,170,0.15)',
              border: '2px solid #00d4aa',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 40px rgba(0,212,170,0.3)',
              animation: 'vr-pulse 2s ease-in-out infinite',
            }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#00d4aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div style={{ color: '#00d4aa', fontSize: 20, fontWeight: 800, letterSpacing: 1 }}>
              BOOT SUCCESSFUL
            </div>
            <div style={{ color: '#94a3b8', fontSize: 12 }}>
              All components detected and operational
            </div>
            <div style={{
              display: 'flex', gap: 16, marginTop: 8,
              padding: '12px 20px', background: 'rgba(0,212,170,0.06)',
              borderRadius: 10, border: '1px solid rgba(0,212,170,0.15)',
            }}>
              {[
                { label: 'Status', value: 'SYSTEM READY', color: '#00d4aa' },
                { label: 'Mode', value: 'VIRTUAL REALITY', color: '#00aaff' },
                { label: 'FPS', value: '60+', color: '#22c55e' },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 9, color: '#64748b', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {bootStatus === 'failed' && (
          <>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'rgba(239,68,68,0.15)',
              border: '2px solid #ef4444',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 40px rgba(239,68,68,0.2)',
            }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <div style={{ color: '#ef4444', fontSize: 20, fontWeight: 800, letterSpacing: 1 }}>
              BOOT FAILED
            </div>
            <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 16 }}>
              Hardware error detected — check diagnostic report
            </div>

            <div style={{
              width: '100%', maxWidth: 480,
              background: 'rgba(239,68,68,0.04)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 12, padding: 16,
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                marginBottom: 12, paddingBottom: 12,
                borderBottom: '1px solid rgba(239,68,68,0.15)',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span style={{ color: '#ef4444', fontSize: 12, fontWeight: 700 }}>
                  DIAGNOSTIC REPORT — {bootErrors.length} ERROR(S)
                </span>
              </div>
              {bootErrors.map((err, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '8px 0', borderBottom: i < bootErrors.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}>
                  <span style={{
                    background: 'rgba(239,68,68,0.15)', color: '#ef4444',
                    padding: '2px 6px', borderRadius: 4, fontSize: 9,
                    fontFamily: 'monospace', flexShrink: 0, marginTop: 1,
                  }}>
                    {err.code}
                  </span>
                  <span style={{ color: '#cbd5e1', fontSize: 11 }}>{err.message}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <div style={{
        padding: '12px 24px', display: 'flex', justifyContent: 'center', gap: 12,
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <button
          onClick={() => useAssemblyStore.getState().resetBoot()}
          style={{
            padding: '8px 24px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)',
            background: 'transparent', color: '#94a3b8', cursor: 'pointer',
            fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
          }}
        >
          DISMISS
        </button>
        {bootStatus === 'failed' && (
          <button
            onClick={() => useAssemblyStore.getState().resetAssembly()}
            style={{
              padding: '8px 24px', borderRadius: 8, border: 'none',
              background: '#ef4444', color: '#fff', cursor: 'pointer',
              fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
            }}
          >
            RESET ASSEMBLY
          </button>
        )}
      </div>
    </div>
  );
}

export default function Viewer3DPage() {
  const [headTracking, setHeadTracking] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);

  const components = useAssemblyStore((s) => s.components);
  const bootStatus = useAssemblyStore((s) => s.bootStatus);
  const triggerBootCheck = useAssemblyStore((s) => s.triggerBootCheck);
  const resetBoot = useAssemblyStore((s) => s.resetBoot);

  const installedCount = components.filter((c) => c.installed).length;
  const totalCount = components.filter((c) => !['motherboard'].includes(c.type)).length;
  const progress = totalCount > 0 ? installedCount / totalCount : 0;
  const allInstalled = installedCount >= totalCount;

  const handlePowerPress = useCallback(() => {
    if (bootStatus !== 'idle') return;
    if (!audioCtx) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioCtx(ctx);
    }
    triggerBootCheck();
  }, [bootStatus, audioCtx, triggerBootCheck]);

  const installedParts = components.filter((c) => c.installed);
  const missingParts = components.filter((c) => !c.installed && c.type !== 'motherboard');

  return (
    <div style={{
      width: '100vw', height: '100vh', overflow: 'hidden',
      background: '#050510', fontFamily: "'Montserrat', sans-serif",
      position: 'relative',
    }}>
      {showInstructions && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 24, padding: 32,
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: 'linear-gradient(135deg, #00d4aa, #00aaff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 40px rgba(0,212,170,0.3)',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
          </div>
          <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 800, textAlign: 'center' }}>
            PC Master Builder
            <span style={{ color: '#00d4aa' }}> 3D VR</span>
          </h1>
          <div style={{
            maxWidth: 480, textAlign: 'center', color: '#94a3b8', fontSize: 13, lineHeight: 1.7,
          }}>
            Build your PC in an immersive 3D environment. Use your <span style={{ color: '#00d4aa', fontWeight: 600 }}>webcam</span> to look around inside the case by moving your head, and drag components to their slots with your mouse.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 360 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px', background: 'rgba(255,255,255,0.04)',
              borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <span style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'rgba(0,212,170,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#00d4aa', fontWeight: 700, fontSize: 12,
              }}>1</span>
              <span style={{ color: '#cbd5e1', fontSize: 12 }}>Enable webcam for head tracking</span>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px', background: 'rgba(255,255,255,0.04)',
              borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <span style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'rgba(0,170,255,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#00aaff', fontWeight: 700, fontSize: 12,
              }}>2</span>
              <span style={{ color: '#cbd5e1', fontSize: 12 }}>Move head to look around the 3D case</span>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px', background: 'rgba(255,255,255,0.04)',
              borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <span style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'rgba(99,102,241,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#6366f1', fontWeight: 700, fontSize: 12,
              }}>3</span>
              <span style={{ color: '#cbd5e1', fontSize: 12 }}>Drag parts into slots — press POWER to boot!</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button
              onClick={() => { setShowInstructions(false); setHeadTracking(true); }}
              style={{
                padding: '12px 32px', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg, #00d4aa, #00aaff)',
                color: '#000', cursor: 'pointer', fontSize: 14, fontWeight: 700,
                fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(0,212,170,0.3)',
              }}
            >
              ENTER VR WORKSHOP
            </button>
          </div>
        </div>
      )}

      <GameScene />

      {headTracking && <HeadTracker />}

      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
        padding: '16px 24px', zIndex: 9995,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ProgressRing progress={progress} color="#00d4aa" size={28} />
          </div>
          <div>
            <div style={{ color: '#94a3b8', fontSize: 10, fontWeight: 600, letterSpacing: 1 }}>
              ASSEMBLY PROGRESS
            </div>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>
              {installedCount}/{totalCount} components
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {headTracking && !showInstructions && (
            <button
              onClick={() => setHeadTracking(!headTracking)}
              style={{
                padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
                background: headTracking ? 'rgba(0,212,170,0.1)' : 'rgba(255,255,255,0.04)',
                color: headTracking ? '#00d4aa' : '#94a3b8', cursor: 'pointer',
                fontSize: 11, fontWeight: 600, fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: headTracking ? '#10b981' : '#64748b',
              }} />
              HEAD TRACKING
            </button>
          )}

          <button
            onClick={handlePowerPress}
            disabled={bootStatus !== 'idle'}
            style={{
              padding: '10px 24px', borderRadius: 10, border: 'none',
              cursor: bootStatus === 'idle' ? 'pointer' : 'not-allowed',
              background: bootStatus === 'idle'
                ? allInstalled
                  ? 'linear-gradient(135deg, #00d4aa, #00aaff)'
                  : 'linear-gradient(135deg, #64748b, #475569)'
                : 'transparent',
              color: bootStatus === 'idle' ? '#000' : '#64748b',
              fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 8,
              opacity: bootStatus !== 'idle' ? 0.5 : 1,
              boxShadow: allInstalled && bootStatus === 'idle' ? '0 0 20px rgba(0,212,170,0.3)' : 'none',
              transition: 'all 0.3s ease',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18.36 6.64a9 9 0 1 1-12.73 0" /><line x1="12" y1="2" x2="12" y2="12" />
            </svg>
            {bootStatus === 'idle' ? 'POWER ON' : bootStatus === 'booting' ? 'BOOTING...' : bootStatus === 'success' ? 'RUNNING' : 'FAILED'}
          </button>
        </div>
      </div>

      <div style={{
        position: 'fixed', top: 16, right: 16, zIndex: 9995,
        display: 'flex', flexDirection: 'column', gap: 6,
        maxHeight: '60vh', overflowY: 'auto',
      }}>
        <div style={{
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)',
          padding: '10px 14px', minWidth: 160,
        }}>
          <div style={{ color: '#64748b', fontSize: 9, fontWeight: 600, letterSpacing: 1, marginBottom: 8 }}>
            INSTALLED
          </div>
          {installedParts.length === 0 ? (
            <div style={{ color: '#475569', fontSize: 11, fontStyle: 'italic' }}>Empty</div>
          ) : installedParts.map((part) => (
            <div key={part.id} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '4px 0', fontSize: 11,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: PART_COLORS[part.type] || '#666',
                boxShadow: `0 0 6px ${PART_COLORS[part.type] || '#666'}`,
              }} />
              <span style={{ color: '#cbd5e1' }}>{PART_LABELS[part.type] || part.type}</span>
              <span style={{ color: '#22c55e', marginLeft: 'auto', fontSize: 10 }}>OK</span>
            </div>
          ))}
        </div>
        {missingParts.length > 0 && (
          <div style={{
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
            borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)',
            padding: '10px 14px', minWidth: 160,
          }}>
            <div style={{ color: '#64748b', fontSize: 9, fontWeight: 600, letterSpacing: 1, marginBottom: 8 }}>
              MISSING
            </div>
            {missingParts.map((part) => (
              <div key={part.id} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '4px 0', fontSize: 11, opacity: 0.6,
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: PART_COLORS[part.type] || '#666',
                }} />
                <span style={{ color: '#94a3b8' }}>{PART_LABELS[part.type] || part.type}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <BootOverlay />

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes vr-spin { to { transform: rotate(360deg); } }
        @keyframes vr-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
      `}</style>
    </div>
  );
}
