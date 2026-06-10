'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import componentsData from '../data/componentsData.json';
import { COMPONENT_DATA } from '@/utils/i18nData';
import ComponentPreview from './ComponentPreview';

const PART_ICONS = {
  CPU: '⚡', RAM: '🧠', GPU: '🎮', SSD: '💾', PSU: '🔌', COOLER: '❄️'
};

const PART_COLORS = {
  CPU: '#00d4aa', RAM: '#6366f1', GPU: '#ef4444',
  SSD: '#22c55e', PSU: '#f59e0b', COOLER: '#06b6d4'
};

export default function PartPickerSidebar({ lang, onSelect, placedCounts }) {
  const [expandedType, setExpandedType] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const data = COMPONENT_DATA[lang] || COMPONENT_DATA.en;
  const parts = ['CPU', 'GPU', 'RAM', 'SSD', 'PSU', 'COOLER'];

  const modelsByType = useMemo(() => {
    const map = {};
    parts.forEach(type => {
      map[type] = componentsData.filter(c => c.type === type);
    });
    return map;
  }, []);

  const handleSelect = (type, modelId = null) => {
    if (modelId) {
      onSelect(type, modelId);
      const model = modelsByType[type]?.find(m => m.id === modelId);
      setSelectedModel(model);
      setExpandedType(null);
    } else {
      setExpandedType(expandedType === type ? null : type);
      setSelectedModel(null);
    }
  };

  return (
    <div style={{
      width: '240px', minWidth: '240px',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-subtle)',
      borderRadius: '12px', padding: '16px 12px',
      display: 'flex', flexDirection: 'column',
      maxHeight: 'calc(100vh - 120px)',
      overflowY: 'auto', gap: '4px'
    }}>
      <h3 style={{ margin: '0 0 4px 0', fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
        {lang === 'en' ? 'Component Tray' : 'Khay linh kiện'}
      </h3>
      <p style={{ margin: '0 0 12px 0', fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
        {lang === 'en'
          ? 'Click to expand and pick a specific model.'
          : 'Nhấn để mở rộng và chọn model cụ thể.'}
      </p>

      {parts.map(type => {
        const info = data[type];
        const count = placedCounts[type] || 0;
        const models = modelsByType[type] || [];
        const isExpanded = expandedType === type;

        return (
          <div key={type} style={{ marginBottom: isExpanded ? '4px' : '0' }}>
            <button
              onClick={() => handleSelect(type)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px',
                background: isExpanded ? 'var(--bg-hover)' : 'var(--bg-elevated)',
                border: `1px solid ${isExpanded ? PART_COLORS[type] : 'var(--border-default)'}`,
                borderRadius: '8px', cursor: 'pointer',
                transition: 'all 0.2s', textAlign: 'left',
                width: '100%', color: 'var(--text-primary)',
                fontSize: '13px', fontFamily: 'inherit',
                position: 'relative'
              }}
              onMouseOver={e => { if (!isExpanded) { e.currentTarget.style.borderColor = PART_COLORS[type]; e.currentTarget.style.background = 'var(--bg-hover)'; } }}
              onMouseOut={e => { if (!isExpanded) { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.background = 'var(--bg-elevated)'; } }}
            >
              <span style={{ fontSize: '20px' }}>{PART_ICONS[type]}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '12px' }}>{type}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {info?.title || type} · {models.length} model
                </div>
              </div>
              {count > 0 && (
                <span style={{ background: PART_COLORS[type] + '20', color: PART_COLORS[type], padding: '1px 7px', borderRadius: '100px', fontSize: '11px', fontWeight: 700 }}>
                  {count}
                </span>
              )}
              <span style={{ color: 'var(--text-muted)', fontSize: '10px', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'none' }}>
                ▼
              </span>
            </button>

            {/* Component Preview */}
            {isExpanded && (
              <div style={{ margin: '8px 0', padding: '0 4px' }}>
                <ComponentPreview type={type} model={null} />
              </div>
            )}
            {/* Nested scrollable model list */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{
                    maxHeight: '220px', overflowY: 'auto',
                    marginTop: '4px', marginLeft: '8px',
                    display: 'flex', flexDirection: 'column', gap: '3px',
                    paddingRight: '4px'
                  }}>
                    {models.map(model => (
                      <button
                        key={model.id}
                        onClick={() => handleSelect(type, model.id)}
                        style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '8px 10px', background: 'var(--bg-elevated)',
                          border: '1px solid var(--border-subtle)', borderRadius: '6px',
                          cursor: 'pointer', textAlign: 'left', width: '100%',
                          color: 'var(--text-primary)', fontSize: '11px', fontFamily: 'inherit',
                          transition: 'all 0.15s'
                        }}
                        onMouseOver={e => { e.currentTarget.style.borderColor = PART_COLORS[type]; e.currentTarget.style.background = 'var(--bg-hover)'; }}
                        onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{model.name}</div>
                          <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                            {model.socket && `Socket: ${model.socket} `}
                            {model.ramType && `RAM: ${model.ramType} `}
                            {model.power && `${model.power}W`}
                          </div>
                        </div>
                        <span style={{ fontSize: '10px', color: PART_COLORS[type], fontWeight: 700, flexShrink: 0, marginLeft: '8px' }}>
                          {(model.price || 0).toLocaleString()}đ
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
