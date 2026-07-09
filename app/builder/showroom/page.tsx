'use client';

import { useState, Component, type ReactNode } from 'react';
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
  const [component, setComponent] = useState<string | null>(null);

  return (
    <div className="w-full h-screen bg-[#0a0a1e] relative">
      <ErrorBoundary>
        <ShowroomScene component={component} onBack={() => setComponent(null)} />
      </ErrorBoundary>
    </div>
  );
}
