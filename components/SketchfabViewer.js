'use client';

export default function SketchfabViewer() {
  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative',
      background: '#0a0a0f', borderRadius: 12, overflow: 'hidden',
      border: '1px solid var(--border-default)',
    }}>
      <iframe
        title="Dream Computer Setup"
        style={{ width: '100%', height: '100%', border: 'none' }}
        src="https://sketchfab.com/models/82f78bbaf2d34f01af854a52151dbf49/embed"
        allow="autoplay; fullscreen; xr-spatial-tracking"
        allowFullScreen
        mozallowfullscreen="true"
        webkitallowfullscreen="true"
        xr-spatial-tracking
        web-share
        execution-while-out-of-viewport
        execution-while-not-rendered
      />
    </div>
  );
}
