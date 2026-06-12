'use client';

import { useState } from 'react';
import { COMPONENT_SPECS, type ComponentRenderSpec } from '@/data/componentSpecs';
import ComponentRenderer2D from './ComponentRenderer2D';
import dynamic from 'next/dynamic';

const ComponentViewer3D = dynamic(() => import('./ComponentViewer3D'), { ssr: false });

type ViewMode = '2d' | '3d' | 'split';

interface BuilderLabProps {
  onSelectComponent?: (spec: ComponentRenderSpec) => void;
}

export default function BuilderLab({ onSelectComponent }: BuilderLabProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('2d');
  const [selectedSpec, setSelectedSpec] = useState<ComponentRenderSpec | null>(null);
  const [hoveredSpec, setHoveredSpec] = useState<string | null>(null);

  const handleComponentClick = (spec: ComponentRenderSpec) => {
    setSelectedSpec(spec);
    onSelectComponent?.(spec);
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex', flexDirection: 'column', gap: 16, width: '100%',
  };

  const tabBarStyle: React.CSSProperties = {
    display: 'flex', gap: 4, padding: 4,
    background: 'rgba(255,255,255,0.05)', borderRadius: 10,
    width: 'fit-content',
  };

  const tabButton = (mode: ViewMode, label: string, icon: string): React.CSSProperties => ({
    padding: '6px 16px', borderRadius: 8, cursor: 'pointer',
    background: viewMode === mode ? 'rgba(0,212,170,0.2)' : 'transparent',
    color: viewMode === mode ? '#00d4aa' : '#94a3b8',
    border: `1px solid ${viewMode === mode ? 'rgba(0,212,170,0.3)' : 'transparent'}`,
    fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
    transition: 'all 0.2s',
  });

  const renderComponentList = (limit?: number) => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(auto-fill, minmax(180px, 1fr))`,
      gap: 12, padding: 8,
    }}>
      {(limit ? COMPONENT_SPECS.slice(0, limit) : COMPONENT_SPECS).map((spec) => (
        <div key={spec.id}
          onClick={() => handleComponentClick(spec)}
          onMouseEnter={() => setHoveredSpec(spec.id)}
          onMouseLeave={() => setHoveredSpec(null)}
          style={{
            background: 'rgba(255,255,255,0.03)', borderRadius: 12,
            padding: 12, cursor: 'pointer',
            border: `1px solid ${selectedSpec?.id === spec.id ? '#00d4aa' : 'rgba(255,255,255,0.08)'}`,
            transition: 'all 0.2s',
            transform: hoveredSpec === spec.id ? 'translateY(-2px)' : 'none',
            boxShadow: hoveredSpec === spec.id ? '0 4px 20px rgba(0,0,0,0.3)' : 'none',
          }}>
          <ComponentRenderer2D
            spec={spec}
            scale={0.6}
            viewMode="top"
            isSelected={selectedSpec?.id === spec.id}
            isHovered={hoveredSpec === spec.id}
            showConnectors={false}
          />
          <div style={{ marginTop: 8, textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{spec.name}</div>
            <div style={{ fontSize: 10, color: '#64748b' }}>{spec.type.toUpperCase()} · {spec.brand}</div>
          </div>
        </div>
      ))}
    </div>
  );

  if (viewMode === '2d') {
    return (
      <div style={containerStyle}>
        <div style={tabBarStyle}>
          <button style={tabButton('2d', '2D', '🔲')} onClick={() => setViewMode('2d')}>🔲 2D</button>
          <button style={tabButton('3d', '3D', '📦')} onClick={() => setViewMode('3d')}>📦 3D</button>
          <button style={tabButton('split', 'Split', '⧉')} onClick={() => setViewMode('split')}>⧉ Cả hai</button>
        </div>
        {renderComponentList()}
      </div>
    );
  }

  if (viewMode === '3d') {
    return (
      <div style={{ ...containerStyle, alignItems: 'center' }}>
        <div style={tabBarStyle}>
          <button style={tabButton('2d', '2D', '🔲')} onClick={() => setViewMode('2d')}>🔲 2D</button>
          <button style={tabButton('3d', '3D', '📦')} onClick={() => setViewMode('3d')}>📦 3D</button>
          <button style={tabButton('split', 'Split', '⧉')} onClick={() => setViewMode('split')}>⧉ Cả hai</button>
        </div>
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', padding: 16,
        }}>
          {COMPONENT_SPECS.slice(0, 6).map((spec) => (
            <div key={spec.id} onClick={() => handleComponentClick(spec)}
              style={{
                cursor: 'pointer', borderRadius: 12, overflow: 'hidden',
                border: `2px solid ${selectedSpec?.id === spec.id ? '#00d4aa' : 'rgba(255,255,255,0.08)'}`,
              }}>
              <ComponentViewer3D spec={spec} width={280} height={200} />
              <div style={{ padding: 8, textAlign: 'center', background: 'rgba(0,0,0,0.5)' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0' }}>{spec.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={tabBarStyle}>
        <button style={tabButton('2d', '2D', '🔲')} onClick={() => setViewMode('2d')}>🔲 2D</button>
        <button style={tabButton('3d', '3D', '📦')} onClick={() => setViewMode('3d')}>📦 3D</button>
        <button style={tabButton('split', 'Split', '⧉')} onClick={() => setViewMode('split')}>⧉ Cả hai</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, height: '60vh' }}>
        <div style={{ overflowY: 'auto', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
          {renderComponentList()}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {selectedSpec ? (
            <ComponentViewer3D spec={selectedSpec} width={400} height={350} />
          ) : (
            <div style={{ color: '#64748b', fontSize: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>👆</div>
              Chọn linh kiện bên trái để xem 3D
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
