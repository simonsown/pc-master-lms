'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useAssemblyStore } from '@/lib/useStore';

const GameScene = dynamic(() => import('@/components/GameScene'), { ssr: false });
const HeadTracker = dynamic(() => import('@/components/HeadTracker'), { ssr: false });

const PART_COLORS: Record<string, string> = {
  cpu: '#00ffcc',
  cooler: '#44aaff',
  ram: '#8866ff',
  gpu: '#ff4466',
  psu: '#ffaa00',
  ssd: '#44ff88',
  motherboard: '#aa66ff',
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
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={3} />
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
          if (prev >= 3) return prev;
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

  const isSuccess = bootStatus === 'success';
  const isFailed = bootStatus === 'failed';
  const accentColor = isSuccess ? '#00ffcc' : isFailed ? '#ff4466' : '#44aaff';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9998,
      display: 'flex', flexDirection: 'column',
      background: isSuccess
        ? 'linear-gradient(135deg, #0a1628 0%, #0d1a30 50%, #0a1628 100%)'
        : isFailed
          ? 'linear-gradient(135deg, #1a0808 0%, #2a0a0a 50%, #1a0808 100%)'
          : 'linear-gradient(135deg, #0a1220 0%, #0d1a30 50%, #0a1220 100%)',
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
              width: 56, height: 56,
              border: '4px solid rgba(68,170,255,0.2)',
              borderTopColor: '#44aaff',
              borderRadius: '50%',
              animation: 'vr-spin 0.5s linear infinite',
              boxShadow: '0 0 30px rgba(68,170,255,0.3)',
            }} />
            <div style={{ color: '#44aaff', fontSize: 16, fontWeight: 800, letterSpacing: 3 }}>
              SYSTEM BOOTING
            </div>
            <div style={{ color: '#6688aa', fontSize: 12, minHeight: 20 }}>
              {bootMessages[Math.min(bootStep, bootMessages.length - 1)]}
            </div>
            <div style={{
              width: 200, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden',
            }}>
              <div style={{
                width: `${(bootStep + 1) * 25}%`, height: '100%',
                background: 'linear-gradient(90deg, #44aaff, #00ffcc)',
                borderRadius: 2, transition: 'width 0.4s ease',
              }} />
            </div>
          </>
        )}

        {isSuccess && (
          <>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'rgba(0,255,204,0.12)',
              border: '3px solid #00ffcc',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 60px rgba(0,255,204,0.4)',
              animation: 'vr-pulse 2s ease-in-out infinite',
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#00ffcc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div style={{ color: '#00ffcc', fontSize: 24, fontWeight: 900, letterSpacing: 2 }}>
              BOOT SUCCESSFUL
            </div>
            <div style={{ color: '#88bbcc', fontSize: 13 }}>
              All components detected and operational
            </div>
            <div style={{
              display: 'flex', gap: 24, marginTop: 12,
              padding: '16px 28px', background: 'rgba(0,255,204,0.06)',
              borderRadius: 12, border: '1px solid rgba(0,255,204,0.2)',
            }}>
              {[
                { label: 'STATUS', value: 'SYSTEM READY', color: '#00ffcc' },
                { label: 'MODE', value: 'VIRTUAL REALITY', color: '#44aaff' },
                { label: 'FPS', value: '60+', color: '#44ff88' },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 9, color: '#6688aa', marginBottom: 6, letterSpacing: 1 }}>{s.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {isFailed && (
          <>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'rgba(255,68,102,0.12)',
              border: '3px solid #ff4466',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 60px rgba(255,68,102,0.3)',
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ff4466" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <div style={{ color: '#ff4466', fontSize: 24, fontWeight: 900, letterSpacing: 2 }}>
              BOOT FAILED
            </div>
            <div style={{ color: '#cc8899', fontSize: 13, marginBottom: 16 }}>
              Hardware error detected — check diagnostic report
            </div>

            <div style={{
              width: '100%', maxWidth: 500,
              background: 'rgba(255,68,102,0.04)',
              border: '1px solid rgba(255,68,102,0.25)',
              borderRadius: 12, padding: 20,
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                marginBottom: 14, paddingBottom: 14,
                borderBottom: '1px solid rgba(255,68,102,0.15)',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff4466" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span style={{ color: '#ff4466', fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>
                  DIAGNOSTIC REPORT — {bootErrors.length} ERROR(S)
                </span>
              </div>
              {bootErrors.map((err, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  padding: '10px 0', borderBottom: i < bootErrors.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                }}>
                  <span style={{
                    background: 'rgba(255,68,102,0.2)', color: '#ff4466',
                    padding: '3px 8px', borderRadius: 4, fontSize: 10,
                    fontFamily: 'monospace', flexShrink: 0, marginTop: 1, fontWeight: 700,
                  }}>
                    {err.code}
                  </span>
                  <span style={{ color: '#ddeeff', fontSize: 12 }}>{err.message}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <div style={{
        padding: '16px 24px', display: 'flex', justifyContent: 'center', gap: 12,
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }}>
        <button
          onClick={() => useAssemblyStore.getState().resetBoot()}
          style={{
            padding: '10px 28px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.05)', color: '#88bbcc', cursor: 'pointer',
            fontSize: 12, fontWeight: 700, fontFamily: 'inherit', letterSpacing: 1,
          }}
        >
          DISMISS
        </button>
        {isFailed && (
          <button
            onClick={() => useAssemblyStore.getState().resetAssembly()}
            style={{
              padding: '10px 28px', borderRadius: 8, border: 'none',
              background: 'linear-gradient(135deg, #ff4466, #ff6688)', color: '#fff', cursor: 'pointer',
              fontSize: 12, fontWeight: 700, fontFamily: 'inherit', letterSpacing: 1,
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

  const components = useAssemblyStore((s) => s.components);
  const bootStatus = useAssemblyStore((s) => s.bootStatus);
  const triggerBootCheck = useAssemblyStore((s) => s.triggerBootCheck);

  const installedCount = components.filter((c) => c.installed).length;
  const totalCount = components.filter((c) => !['motherboard'].includes(c.type)).length;
  const progress = totalCount > 0 ? installedCount / totalCount : 0;
  const allInstalled = installedCount >= totalCount;

  const handlePowerPress = useCallback(() => {
    if (bootStatus !== 'idle') return;
    triggerBootCheck();
  }, [bootStatus, triggerBootCheck]);

  const installedParts = components.filter((c) => c.installed);
  const missingParts = components.filter((c) => !c.installed && c.type !== 'motherboard');

  return (
    <div style={{
      width: '100vw', height: '100vh', overflow: 'hidden',
      background: '#14182b', fontFamily: "'Montserrat', sans-serif",
      position: 'relative',
    }}>
      {showInstructions && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'linear-gradient(135deg, #0a1220, #14182b, #0a1220)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 28, padding: 32,
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: 'linear-gradient(135deg, #00ffcc, #44aaff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 50px rgba(0,255,204,0.3)',
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
          </div>
          <h1 style={{
            color: '#fff', fontSize: 32, fontWeight: 900, textAlign: 'center',
            letterSpacing: '-0.5px',
          }}>
            PC Master Builder <span style={{ color: '#00ffcc' }}>3D VR</span>
          </h1>
          <div style={{
            maxWidth: 480, textAlign: 'center', color: '#88bbcc', fontSize: 14, lineHeight: 1.8,
          }}>
            Build your PC in an immersive 3D environment. Use your <span style={{ color: '#00ffcc', fontWeight: 700 }}>webcam</span> to look around inside the case and drag parts into place.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 400 }}>
            {[
              { num: '1', text: 'Enable webcam for head tracking', color: '#00ffcc' },
              { num: '2', text: 'Move your head to look around the 3D case', color: '#44aaff' },
              { num: '3', text: 'Drag parts into slots — press POWER to boot!', color: '#8866ff' },
            ].map((step, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 18px', background: 'rgba(255,255,255,0.03)',
                borderRadius: 10, border: `1px solid ${step.color}22`,
              }}>
                <span style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: `${step.color}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: step.color, fontWeight: 800, fontSize: 13,
                }}>{step.num}</span>
                <span style={{ color: '#ddeeff', fontSize: 13 }}>{step.text}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => { setShowInstructions(false); setHeadTracking(true); }}
            style={{
              padding: '14px 40px', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, #00ffcc, #44aaff)',
              color: '#000', cursor: 'pointer', fontSize: 16, fontWeight: 800,
              fontFamily: 'inherit', letterSpacing: 1,
              boxShadow: '0 4px 30px rgba(0,255,204,0.3)',
            }}
          >
            ENTER VR WORKSHOP
          </button>
        </div>
      )}

      <GameScene />

      {headTracking && <HeadTracker />}

      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(transparent, rgba(10,18,32,0.9))',
        padding: '16px 24px', zIndex: 9995,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ProgressRing progress={progress} color="#00ffcc" size={30} />
          </div>
          <div>
            <div style={{ color: '#6688aa', fontSize: 10, fontWeight: 700, letterSpacing: 1.5 }}>
              ASSEMBLY PROGRESS
            </div>
            <div style={{ color: '#ddeeff', fontSize: 14, fontWeight: 800 }}>
              {installedCount}/{totalCount} components
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => setHeadTracking(!headTracking)}
            style={{
              padding: '8px 18px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)',
              background: headTracking ? 'rgba(0,255,204,0.1)' : 'rgba(255,255,255,0.03)',
              color: headTracking ? '#00ffcc' : '#6688aa', cursor: 'pointer',
              fontSize: 11, fontWeight: 700, fontFamily: 'inherit', letterSpacing: 0.5,
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: headTracking ? '#00ffcc' : '#445566',
              boxShadow: headTracking ? '0 0 8px #00ffcc' : 'none',
            }} />
            HEAD TRACKING
          </button>

          <button
            onClick={handlePowerPress}
            disabled={bootStatus !== 'idle'}
            style={{
              padding: '10px 28px', borderRadius: 10, border: 'none',
              cursor: bootStatus === 'idle' ? 'pointer' : 'not-allowed',
              background: bootStatus === 'idle'
                ? allInstalled
                  ? 'linear-gradient(135deg, #00ffcc, #44aaff)'
                  : 'linear-gradient(135deg, #445577, #334466)'
                : 'transparent',
              color: bootStatus === 'idle' ? '#000' : '#445566',
              fontSize: 12, fontWeight: 800, fontFamily: 'inherit', letterSpacing: 1,
              display: 'flex', alignItems: 'center', gap: 10,
              opacity: bootStatus !== 'idle' ? 0.5 : 1,
              boxShadow: allInstalled && bootStatus === 'idle' ? '0 0 25px rgba(0,255,204,0.3)' : 'none',
              transition: 'all 0.3s ease',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
          background: 'rgba(10,18,32,0.7)', backdropFilter: 'blur(12px)',
          borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)',
          padding: '12px 16px', minWidth: 170,
        }}>
          <div style={{ color: '#6688aa', fontSize: 9, fontWeight: 700, letterSpacing: 1.5, marginBottom: 10 }}>
            INSTALLED
          </div>
          {installedParts.length === 0 ? (
            <div style={{ color: '#445566', fontSize: 11, fontStyle: 'italic' }}>Empty</div>
          ) : installedParts.map((part) => (
            <div key={part.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '5px 0', fontSize: 11,
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: PART_COLORS[part.type] || '#666',
                boxShadow: `0 0 8px ${PART_COLORS[part.type] || '#666'}`,
              }} />
              <span style={{ color: '#ddeeff', fontWeight: 600 }}>{PART_LABELS[part.type] || part.type}</span>
              <span style={{ color: '#44ff88', marginLeft: 'auto', fontSize: 10, fontWeight: 700 }}>OK</span>
            </div>
          ))}
        </div>
        {missingParts.length > 0 && (
          <div style={{
            background: 'rgba(10,18,32,0.7)', backdropFilter: 'blur(12px)',
            borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)',
            padding: '12px 16px', minWidth: 170,
          }}>
            <div style={{ color: '#6688aa', fontSize: 9, fontWeight: 700, letterSpacing: 1.5, marginBottom: 10 }}>
              MISSING
            </div>
            {missingParts.map((part) => (
              <div key={part.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '5px 0', fontSize: 11, opacity: 0.6,
              }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: PART_COLORS[part.type] || '#666',
                }} />
                <span style={{ color: '#88bbcc' }}>{PART_LABELS[part.type] || part.type}</span>
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
