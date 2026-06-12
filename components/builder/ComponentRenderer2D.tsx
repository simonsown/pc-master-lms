'use client';

import { useMemo } from 'react';
import { type ComponentRenderSpec, MM_TO_PX } from '@/data/componentSpecs';

interface ComponentRenderer2DProps {
  spec: ComponentRenderSpec;
  scale?: number;
  isSelected?: boolean;
  isHovered?: boolean;
  showConnectors?: boolean;
  showDimensions?: boolean;
  viewMode: 'top' | 'front' | 'side';
  onConnectorClick?: (connectorId: string) => void;
  onComponentClick?: () => void;
}

export default function ComponentRenderer2D({
  spec,
  scale = 1,
  isSelected = false,
  isHovered = false,
  showConnectors = false,
  showDimensions = false,
  viewMode = 'top',
  onConnectorClick,
  onComponentClick,
}: ComponentRenderer2DProps) {
  const s = scale * MM_TO_PX;
  const w = spec.dimensions.width_mm * s;
  const h = spec.dimensions.height_mm * s;
  const d = spec.dimensions.depth_mm * s;

  const viewWidth = viewMode === 'top' || viewMode === 'side' ? w : d;
  const viewHeight = viewMode === 'top' ? h : viewMode === 'front' ? h : d;
  const padding = 20;
  const svgW = viewWidth + padding * 2;
  const svgH = viewHeight + padding * 2;

  const connectorDots = useMemo(() => {
    if (!showConnectors) return null;
    return spec.connectors.map((conn) => {
      const cx = padding + (conn.position.x / 100) * viewWidth;
      const cy = padding + (conn.position.y / 100) * viewHeight;
      return (
        <g key={conn.id}>
          <circle
            cx={cx} cy={cy} r={6}
            fill={conn.color} opacity={0.3}
            stroke={conn.color} strokeWidth={2}
          />
          <circle
            cx={cx} cy={cy} r={3}
            fill={conn.color}
            style={{ cursor: 'pointer' }}
            onClick={() => onConnectorClick?.(conn.id)}
          />
          <text
            x={cx + 10} y={cy + 4}
            fill={conn.color} fontSize={9} fontFamily="monospace"
          >
            {conn.label}
          </text>
        </g>
      );
    });
  }, [showConnectors, spec.connectors, viewWidth, viewHeight, padding, onConnectorClick]);

  const renderCPU = () => {
    const bw = viewWidth;
    const bh = viewHeight;
    return (
      <g>
        <rect x={padding} y={padding} width={bw} height={bh} rx={4}
          fill={spec.colors.pcb} stroke={spec.colors.connector} strokeWidth={1.5} />
        <rect x={padding + bw * 0.1} y={padding + bh * 0.1}
          width={bw * 0.8} height={bh * 0.8} rx={3}
          fill={spec.colors.heatsink || '#a0a0a0'}
          stroke={spec.colors.accent || '#666'} strokeWidth={0.5} />
        <text x={padding + bw / 2} y={padding + bh * 0.45}
          textAnchor="middle" fill={spec.colors.accent || '#fff'}
          fontSize={Math.max(10, bw * 0.12)} fontWeight="bold" fontFamily="monospace">
          {spec.brand}
        </text>
        <text x={padding + bw / 2} y={padding + bh * 0.6}
          textAnchor="middle" fill="#999" fontSize={Math.max(8, bw * 0.08)} fontFamily="monospace">
          {spec.model}
        </text>
      </g>
    );
  };

  const renderGPU = () => {
    const bw = viewWidth;
    const bh = viewHeight;
    const shroudH = bh * 0.8;
    const pcieW = bw * 0.15;
    return (
      <g>
        <rect x={padding} y={padding + (bh - shroudH) / 2}
          width={bw - pcieW} height={shroudH} rx={6}
          fill={spec.colors.shroud || spec.colors.pcb}
          stroke={spec.colors.accent || '#666'} strokeWidth={1.5} />
        <rect x={padding + bw - pcieW} y={padding + bh * 0.1}
          width={pcieW} height={bh * 0.8} rx={2}
          fill={spec.colors.connector} stroke={spec.colors.accent || '#ffcc00'} strokeWidth={1} />
        {[0, 1].map((fi) => (
          <circle key={fi}
            cx={padding + (bw - pcieW) * (0.25 + fi * 0.35)}
            cy={padding + bh / 2} r={bh * 0.15}
            fill="none" stroke={spec.colors.accent || '#666'} strokeWidth={1} opacity={0.5} />
        ))}
        <text x={padding + bw / 2 - pcieW / 2} y={padding + bh * 0.2}
          textAnchor="middle" fill={spec.colors.accent || '#fff'}
          fontSize={Math.max(8, bw * 0.06)} fontWeight="bold" fontFamily="monospace">
          {spec.brand}
        </text>
      </g>
    );
  };

  const renderMotherboard = () => {
    const bw = viewWidth;
    const bh = viewHeight;
    return (
      <g>
        <rect x={padding} y={padding} width={bw} height={bh} rx={6}
          fill={spec.colors.pcb} stroke={spec.colors.accent || '#ffd700'} strokeWidth={1.5} />
        {spec.connectors.map((conn) => {
          const cx = padding + (conn.position.x / 100) * bw;
          const cy = padding + (conn.position.y / 100) * bh;
          const cw = conn.type.includes('cpu_socket') ? bw * 0.2 : conn.type.includes('ram') ? bw * 0.035 : bw * 0.12;
          const ch = conn.type.includes('cpu_socket') ? bh * 0.25 : conn.type.includes('ram') ? bh * 0.12 : bh * 0.025;
          return (
            <rect key={conn.id} x={cx - cw / 2} y={cy - ch / 2}
              width={cw} height={ch} rx={2}
              fill={conn.color} opacity={0.4} stroke={conn.color} strokeWidth={0.5} />
          );
        })}
        <text x={padding + bw / 2} y={padding + bh * 0.08}
          textAnchor="middle" fill={spec.colors.accent || '#ffd700'}
          fontSize={Math.max(10, bw * 0.05)} fontWeight="bold" fontFamily="monospace">
          {spec.brand} {spec.model}
        </text>
      </g>
    );
  };

  const renderRAM = () => {
    const bw = viewWidth;
    const bh = viewHeight;
    return (
      <g>
        <rect x={padding} y={padding} width={bw} height={bh} rx={4}
          fill={spec.colors.pcb} stroke={spec.colors.accent || '#ff6600'} strokeWidth={1.5} />
        <rect x={padding + bw * 0.08} y={padding + bh * 0.15}
          width={bw * 0.84} height={bh * 0.55} rx={2}
          fill={spec.colors.heatsink || '#2c2c2c'}
          stroke={spec.colors.accent || '#ff6600'} strokeWidth={0.5} opacity={0.8} />
        <rect x={padding + bw * 0.05} y={padding + bh * 0.82}
          width={bw * 0.9} height={bh * 0.12} rx={1}
          fill={spec.colors.connector} opacity={0.8} />
        <text x={padding + bw / 2} y={padding + bh * 0.5}
          textAnchor="middle" fill={spec.colors.accent || '#ff6600'}
          fontSize={Math.max(9, bw * 0.08)} fontWeight="bold" fontFamily="monospace">
          {spec.techSpecs.capacity_gb}GB {spec.techSpecs.speed_mhz}MHz
        </text>
      </g>
    );
  };

  const renderPSU = () => {
    const bw = viewWidth;
    const bh = viewHeight;
    return (
      <g>
        <rect x={padding} y={padding} width={bw} height={bh} rx={6}
          fill={spec.colors.heatsink || '#000'} stroke={spec.colors.accent || '#ffff00'} strokeWidth={1.5} />
        <circle cx={padding + bw * 0.3} cy={padding + bh / 2} r={bh * 0.2}
          fill="none" stroke={spec.colors.accent || '#ffff00'} strokeWidth={1} opacity={0.6} />
        <text x={padding + bw * 0.3} y={padding + bh / 2 + 3}
          textAnchor="middle" fill={spec.colors.accent || '#ffff00'}
          fontSize={Math.max(8, bw * 0.05)} fontWeight="bold" fontFamily="monospace">
          FAN
        </text>
        <rect x={padding + bw * 0.7} y={padding + bh * 0.2}
          width={bw * 0.2} height={bh * 0.6} rx={3}
          fill={spec.colors.connector} opacity={0.5} />
        <text x={padding + bw / 2} y={padding + bh * 0.92}
          textAnchor="middle" fill="#999" fontSize={Math.max(8, bw * 0.06)} fontFamily="monospace">
          {spec.techSpecs.wattage}W {spec.techSpecs.efficiency}
        </text>
      </g>
    );
  };

  const renderSSD = () => {
    const bw = viewWidth;
    const bh = viewHeight;
    return (
      <g>
        <rect x={padding} y={padding} width={bw} height={bh} rx={4}
          fill={spec.colors.pcb} stroke={spec.colors.accent || '#1428a0'} strokeWidth={1.5} />
        <rect x={padding + bw * 0.05} y={padding + bh * 0.15}
          width={bw * 0.65} height={bh * 0.7} rx={2}
          fill={spec.colors.heatsink || '#c0c0c0'} opacity={0.5} />
        <rect x={padding + bw * 0.82} y={padding + bh * 0.3}
          width={bw * 0.12} height={bh * 0.4} rx={1}
          fill={spec.colors.connector} opacity={0.7} />
        <text x={padding + bw * 0.35} y={padding + bh * 0.55}
          textAnchor="middle" fill={spec.colors.accent || '#1428a0'}
          fontSize={Math.max(8, bw * 0.08)} fontWeight="bold" fontFamily="monospace">
          {spec.brand}
        </text>
      </g>
    );
  };

  const renderByType = () => {
    switch (spec.type) {
      case 'cpu': return renderCPU();
      case 'gpu': return renderGPU();
      case 'motherboard': return renderMotherboard();
      case 'ram': return renderRAM();
      case 'psu': return renderPSU();
      case 'ssd': case 'hdd': return renderSSD();
      default: return (
        <rect x={padding} y={padding} width={viewWidth} height={viewHeight} rx={4}
          fill={spec.colors.pcb} stroke={spec.colors.accent || '#666'} strokeWidth={1.5} />
      );
    }
  };

  return (
    <svg
      viewBox={`0 0 ${svgW} ${svgH}`}
      width={svgW}
      height={svgH}
      style={{
        cursor: 'pointer',
        outline: isSelected ? `2px solid ${spec.colors.accent || '#00d4aa'}` : 'none',
        outlineOffset: 2,
        borderRadius: 8,
        filter: isHovered ? 'brightness(1.15)' : 'none',
        transition: 'all 0.2s',
      }}
      onClick={onComponentClick}
    >
      {renderByType()}
      {connectorDots}
      {showDimensions && (
        <text x={padding + viewWidth / 2} y={padding + viewHeight + 16}
          textAnchor="middle" fill="#666" fontSize={10} fontFamily="monospace">
          {spec.dimensions.width_mm}mm × {spec.dimensions.height_mm}mm × {spec.dimensions.depth_mm}mm
        </text>
      )}
    </svg>
  );
}
