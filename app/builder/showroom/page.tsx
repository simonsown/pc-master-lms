'use client';

import { useState, useEffect, useRef, Component, type ReactNode } from 'react';
import dynamic from 'next/dynamic';

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return <div style={{ color: '#ff4466', padding: 40, fontFamily: 'monospace', fontSize: 12 }}>
        <h2>Error: {this.state.error.message}</h2>
        <pre style={{ color: '#88bbcc', marginTop: 12 }}>{this.state.error.stack}</pre>
      </div>;
    }
    return this.props.children;
  }
}

const ShowroomScene = dynamic(() => import('@/components/ShowroomScene'), { ssr: false });

export default function ShowroomPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full h-screen bg-[#0a0a1e] relative">
      {loading && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 20,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: '#0a0a1e', color: '#8af', fontFamily: 'monospace', fontSize: 14
        }}>
          <div style={{ marginBottom: 16 }}>⟳ Loading showroom...</div>
          <div style={{ width: 120, height: 2, background: '#1a1a3e', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: '40%', height: '100%', background: '#4040ff', borderRadius: 2,
              animation: 'shimmer 1.2s ease-in-out infinite' }} />
          </div>
          <style>{`@keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(350%); } }`}</style>
        </div>
      )}
      <ErrorBoundary>
        <ShowroomScene />
        <a href="/builder/3d-viewer"
          style={{
            position: 'fixed', top: 16, right: 16, zIndex: 50,
            padding: '8px 16px', borderRadius: 8,
            background: 'rgba(0,0,0,0.5)', color: '#8af',
            fontFamily: 'monospace', fontSize: 12, textDecoration: 'none',
            border: '1px solid rgba(100,100,255,0.2)', backdropFilter: 'blur(4px)',
          }}>
          Classroom
        </a>
      </ErrorBoundary>
    </div>
  );
}
