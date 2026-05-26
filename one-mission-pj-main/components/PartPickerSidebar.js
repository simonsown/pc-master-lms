'use client';

import { COMPONENT_DATA } from '@/utils/i18nData';

const PART_ICONS = {
  CPU: '⚡',
  RAM: '🧠',
  GPU: '🎮',
  SSD: '💾',
  PSU: '🔌',
  COOLER: '❄️'
};

const PART_COLORS = {
  CPU: '#00d4aa',
  RAM: '#6366f1',
  GPU: '#ef4444',
  SSD: '#22c55e',
  PSU: '#f59e0b',
  COOLER: '#06b6d4'
};

export default function PartPickerSidebar({ lang, onSelect, placedCounts }) {
  const data = COMPONENT_DATA[lang] || COMPONENT_DATA.en;
  const parts = ['CPU', 'GPU', 'RAM', 'SSD', 'PSU', 'COOLER'];

  return (
    <div style={{
      width: '220px',
      minWidth: '220px',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-subtle)',
      borderRadius: '12px',
      padding: '16px 12px',
      display: 'flex',
      flexDirection: 'column',
      maxHeight: 'calc(100vh - 120px)',
      overflowY: 'auto',
      gap: '8px'
    }}>
      <h3 style={{
        margin: '0 0 8px 0',
        fontSize: '13px',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        fontWeight: 600
      }}>
        {lang === 'en' ? 'Component Tray' : 'Khay linh kiện'}
      </h3>
      <p style={{
        margin: '0 0 12px 0',
        fontSize: '11px',
        color: 'var(--text-muted)',
        lineHeight: 1.4
      }}>
        {lang === 'en'
          ? 'Click any part to add it to the staging area, then drag it onto the motherboard.'
          : 'Nhấn vào linh kiện để thêm vào khu vực lắp ráp, sau đó kéo thả lên mainboard.'}
      </p>

      {parts.map(type => {
        const info = data[type];
        const count = placedCounts[type] || 0;
        return (
          <button
            key={type}
            onClick={() => onSelect(type)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              background: 'var(--bg-elevated)',
              border: `1px solid var(--border-default)`,
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textAlign: 'left',
              width: '100%',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontFamily: 'inherit',
              position: 'relative'
            }}
            onMouseOver={e => {
              e.currentTarget.style.borderColor = PART_COLORS[type];
              e.currentTarget.style.background = 'var(--bg-hover)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.borderColor = 'var(--border-default)';
              e.currentTarget.style.background = 'var(--bg-elevated)';
            }}
          >
            <span style={{ fontSize: '20px' }}>{PART_ICONS[type]}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '12px' }}>{type}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {info?.title || type}
              </div>
            </div>
            {count > 0 && (
              <span style={{
                background: PART_COLORS[type] + '20',
                color: PART_COLORS[type],
                padding: '1px 7px',
                borderRadius: '100px',
                fontSize: '11px',
                fontWeight: 700
              }}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
