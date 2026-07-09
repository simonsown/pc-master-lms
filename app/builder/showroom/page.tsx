'use client';

import { Component, type ReactNode } from 'react';
import dynamic from 'next/dynamic';

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return <div style={{ color: '#ff4466', padding: 40, fontFamily: 'monospace', fontSize: 12 }}>
        <h2>Loi: {this.state.error.message}</h2>
        <pre style={{ color: '#88bbcc', marginTop: 12 }}>{this.state.error.stack}</pre>
      </div>;
    }
    return this.props.children;
  }
}

const ShowroomScene = dynamic(() => import('@/components/ShowroomScene'), { ssr: false });

export default function ShowroomPage() {
  return (
    <div className="w-full h-screen bg-[#f0f4ff] relative">
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
          Lop hoc
        </a>
      </ErrorBoundary>
    </div>
  );
}
