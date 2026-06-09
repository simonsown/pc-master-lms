'use client';

import { useState } from 'react';

const MAC_MODELS = [
  { id: 'macbook-air-m1', name: 'MacBook Air M1 (2020)', chip: 'Apple M1', ram: '8GB Unified', gpu: '7-core', maxRam: '16GB', internal: '256GB SSD', minYear: 2020 },
  { id: 'macbook-air-m2', name: 'MacBook Air M2 (2022)', chip: 'Apple M2', ram: '8GB Unified', gpu: '8-core', maxRam: '24GB', internal: '256GB SSD', minYear: 2022 },
  { id: 'macbook-air-m3', name: 'MacBook Air M3 (2024)', chip: 'Apple M3', ram: '8GB Unified', gpu: '8-core', maxRam: '24GB', internal: '256GB SSD', minYear: 2024 },
  { id: 'macbook-pro-14-m3', name: 'MacBook Pro 14" M3 Pro', chip: 'Apple M3 Pro', ram: '18GB Unified', gpu: '18-core', maxRam: '36GB', internal: '512GB SSD', minYear: 2023 },
  { id: 'macbook-pro-16-m3', name: 'MacBook Pro 16" M3 Max', chip: 'Apple M3 Max', ram: '36GB Unified', gpu: '30-core', maxRam: '128GB', internal: '1TB SSD', minYear: 2023 },
  { id: 'macbook-pro-14-m4', name: 'MacBook Pro 14" M4 Pro', chip: 'Apple M4 Pro', ram: '24GB Unified', gpu: '20-core', maxRam: '48GB', internal: '512GB SSD', minYear: 2024 },
  { id: 'macbook-pro-16-m4', name: 'MacBook Pro 16" M4 Max', chip: 'Apple M4 Max', ram: '36GB Unified', gpu: '40-core', maxRam: '128GB', internal: '1TB SSD', minYear: 2024 },
  { id: 'mac-mini-m2', name: 'Mac Mini M2 (2023)', chip: 'Apple M2', ram: '8GB Unified', gpu: '10-core', maxRam: '24GB', internal: '256GB SSD', minYear: 2023 },
  { id: 'mac-mini-m4', name: 'Mac Mini M4 (2024)', chip: 'Apple M4', ram: '16GB Unified', gpu: '10-core', maxRam: '32GB', internal: '256GB SSD', minYear: 2024 },
  { id: 'imac-m3', name: 'iMac 24" M3 (2023)', chip: 'Apple M3', ram: '8GB Unified', gpu: '8-core', maxRam: '24GB', internal: '256GB SSD', minYear: 2023 },
  { id: 'mac-studio-m2', name: 'Mac Studio M2 Ultra', chip: 'Apple M2 Ultra', ram: '64GB Unified', gpu: '60-core', maxRam: '192GB', internal: '1TB SSD', minYear: 2023 },
  { id: 'mac-pro', name: 'Mac Pro (2019)', chip: 'Intel Xeon W', ram: '32GB DDR4 ECC', gpu: 'Radeon Pro 580X', maxRam: '1.5TB', internal: '256GB SSD', minYear: 2019 },
];

const SOFTWARE_CATEGORIES = [
  {
    name: 'Thiết kế Đồ họa',
    items: [
      { name: 'Adobe Photoshop', minRam: 8, minStorage: 20, platforms: ['mac', 'win'], gpuRequired: false, rating: 5 },
      { name: 'Adobe Illustrator', minRam: 8, minStorage: 10, platforms: ['mac', 'win'], gpuRequired: false, rating: 5 },
      { name: 'Adobe InDesign', minRam: 8, minStorage: 10, platforms: ['mac', 'win'], gpuRequired: false, rating: 5 },
      { name: 'Adobe Lightroom', minRam: 8, minStorage: 15, platforms: ['mac', 'win'], gpuRequired: false, rating: 5 },
      { name: 'Figma', minRam: 8, minStorage: 5, platforms: ['mac', 'win'], gpuRequired: false, rating: 5 },
      { name: 'Sketch', minRam: 8, minStorage: 5, platforms: ['mac'], gpuRequired: false, rating: 5 },
      { name: 'Affinity Photo', minRam: 8, minStorage: 8, platforms: ['mac', 'win'], gpuRequired: false, rating: 4 },
      { name: 'Affinity Designer', minRam: 8, minStorage: 5, platforms: ['mac', 'win'], gpuRequired: false, rating: 4 },
    ],
  },
  {
    name: 'Dựng phim & VFX',
    items: [
      { name: 'Final Cut Pro', minRam: 16, minStorage: 50, platforms: ['mac'], gpuRequired: true, rating: 5 },
      { name: 'DaVinci Resolve', minRam: 16, minStorage: 30, platforms: ['mac', 'win'], gpuRequired: true, rating: 5 },
      { name: 'Adobe Premiere Pro', minRam: 16, minStorage: 50, platforms: ['mac', 'win'], gpuRequired: true, rating: 5 },
      { name: 'Adobe After Effects', minRam: 16, minStorage: 30, platforms: ['mac', 'win'], gpuRequired: true, rating: 5 },
      { name: 'Motion', minRam: 8, minStorage: 20, platforms: ['mac'], gpuRequired: false, rating: 4 },
      { name: 'Compressor', minRam: 8, minStorage: 10, platforms: ['mac'], gpuRequired: false, rating: 4 },
    ],
  },
  {
    name: 'Lập trình & Dev',
    items: [
      { name: 'Xcode', minRam: 8, minStorage: 30, platforms: ['mac'], gpuRequired: false, rating: 5 },
      { name: 'VS Code', minRam: 4, minStorage: 5, platforms: ['mac', 'win'], gpuRequired: false, rating: 5 },
      { name: 'Android Studio', minRam: 8, minStorage: 20, platforms: ['mac', 'win'], gpuRequired: false, rating: 4 },
      { name: 'Docker Desktop', minRam: 8, minStorage: 10, platforms: ['mac', 'win'], gpuRequired: false, rating: 4 },
      { name: 'Unity', minRam: 8, minStorage: 20, platforms: ['mac', 'win'], gpuRequired: true, rating: 4 },
      { name: 'Unreal Engine', minRam: 16, minStorage: 50, platforms: ['mac', 'win'], gpuRequired: true, rating: 4 },
    ],
  },
  {
    name: 'Nhạc & Audio',
    items: [
      { name: 'Logic Pro', minRam: 8, minStorage: 30, platforms: ['mac'], gpuRequired: false, rating: 5 },
      { name: 'Ableton Live', minRam: 8, minStorage: 20, platforms: ['mac', 'win'], gpuRequired: false, rating: 5 },
      { name: 'Pro Tools', minRam: 16, minStorage: 30, platforms: ['mac', 'win'], gpuRequired: false, rating: 4 },
      { name: 'GarageBand', minRam: 4, minStorage: 10, platforms: ['mac', 'ios'], gpuRequired: false, rating: 5 },
      { name: 'MainStage', minRam: 8, minStorage: 15, platforms: ['mac'], gpuRequired: false, rating: 4 },
    ],
  },
  {
    name: '3D & CAD',
    items: [
      { name: 'Blender', minRam: 16, minStorage: 20, platforms: ['mac', 'win'], gpuRequired: true, rating: 5 },
      { name: 'Autodesk Maya', minRam: 16, minStorage: 30, platforms: ['mac', 'win'], gpuRequired: true, rating: 4 },
      { name: 'Cinema 4D', minRam: 16, minStorage: 20, platforms: ['mac', 'win'], gpuRequired: true, rating: 4 },
      { name: 'SketchUp Pro', minRam: 8, minStorage: 10, platforms: ['mac', 'win'], gpuRequired: false, rating: 4 },
      { name: 'ZBrush', minRam: 8, minStorage: 15, platforms: ['mac', 'win'], gpuRequired: false, rating: 4 },
    ],
  },
];

function extractRamGB(ramStr) {
  const match = ramStr.match(/(\d+)\s*GB/);
  return match ? parseInt(match[1]) : 0;
}

function extractStorageGB(storageStr) {
  const match = storageStr.match(/(\d+)\s*(GB|TB)/);
  if (!match) return 0;
  const val = parseInt(match[1]);
  return match[2] === 'TB' ? val * 1000 : val;
}

export default function MacCompatibilityChecker({ lang = 'vn' }) {
  const [selectedMac, setSelectedMac] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);

  const results = [];
  if (selectedMac) {
    const ramGB = extractRamGB(selectedMac.ram);
    const storageGB = extractStorageGB(selectedMac.internal);

    for (const cat of SOFTWARE_CATEGORIES) {
      for (const app of cat.items) {
        const isMacApp = app.platforms.includes('mac');
        const ramOk = ramGB >= app.minRam;
        const storageOk = storageGB >= app.minStorage;
        const compatible = isMacApp && ramOk && storageOk;
        results.push({ ...app, catName: cat.name, compatible, ramOk, storageOk });
      }
    }
  }

  const compatibleCount = results.filter(r => r.compatible).length;
  const totalCount = results.length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '24px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #555, #999)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px'
          }}>🍎</div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              {lang === 'en' ? 'Mac Compatibility Checker' : 'Kiểm Tra Tương Thích Mac'}
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
              {lang === 'en'
                ? 'Check if your favorite software runs on Mac'
                : 'Kiểm tra phần mềm bạn cần có chạy trên Mac không'}
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '20px' }}>
          {/* Left: Mac Selection */}
          <div className="pro-card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '12px', overflow: 'hidden', alignSelf: 'start' }}>
            <div className="pro-card-header">
              {lang === 'en' ? 'Select Mac Model' : 'Chọn dòng Mac'}
            </div>
            <div className="pro-card-body" style={{ padding: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {MAC_MODELS.map(mac => (
                  <button
                    key={mac.id}
                    onClick={() => { setSelectedMac(mac); setExpandedCategory(null); }}
                    style={{
                      display: 'flex', flexDirection: 'column', gap: '2px',
                      padding: '10px 12px', borderRadius: '8px',
                      background: selectedMac?.id === mac.id ? 'rgba(59,130,246,0.1)' : 'var(--bg-elevated)',
                      border: `1px solid ${selectedMac?.id === mac.id ? '#3b82f6' : 'var(--border-default)'}`,
                      cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                      transition: 'all 0.15s',
                    }}
                    onMouseOver={e => { if (selectedMac?.id !== mac.id) { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.background = 'var(--bg-hover)'; }}}
                    onMouseOut={e => { if (selectedMac?.id !== mac.id) { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.background = 'var(--bg-elevated)'; }}}
                  >
                    <div style={{ fontWeight: 600, fontSize: '12px', color: 'var(--text-primary)' }}>{mac.name}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      {mac.chip} · {mac.ram} · {mac.internal}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Compatibility Results */}
          <div>
            {!selectedMac ? (
              <div className="pro-card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🍎</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                  {lang === 'en' ? 'Select a Mac model to check software compatibility' : 'Chọn một dòng Mac để kiểm tra tương thích phần mềm'}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Summary card */}
                <div className="pro-card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '12px' }}>
                  <div className="pro-card-body" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div className="pro-score-ring" style={{ width: '48px', height: '48px', flexShrink: 0 }}>
                      <svg width="48" height="48" viewBox="0 0 36 36">
                        <circle className="bg" cx="18" cy="18" r="15.5"/>
                        <circle className="fg" cx="18" cy="18" r="15.5"
                          stroke={compatibleCount / totalCount > 0.8 ? 'var(--success)' : compatibleCount / totalCount > 0.5 ? 'var(--warning)' : 'var(--danger)'}
                          strokeDasharray={`${(compatibleCount / totalCount) * 97} 100`}/>
                      </svg>
                      <div className="pro-score-value" style={{ fontSize: '11px', color: 'var(--text-primary)' }}>
                        {Math.round(compatibleCount / totalCount * 100)}%
                      </div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
                        {selectedMac.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {compatibleCount}/{totalCount} {lang === 'en' ? 'compatible apps' : 'ứng dụng tương thích'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Software categories */}
                {SOFTWARE_CATEGORIES.map(cat => {
                  const catResults = results.filter(r => r.catName === cat.name);
                  const catCompatible = catResults.filter(r => r.compatible).length;
                  const isExpanded = expandedCategory === cat.name;

                  return (
                    <div key={cat.name} className="pro-card" style={{
                      background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '12px', overflow: 'hidden',
                    }}>
                      <div
                        onClick={() => setExpandedCategory(isExpanded ? null : cat.name)}
                        style={{
                          padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px',
                          cursor: 'pointer', borderBottom: isExpanded ? '1px solid var(--border-subtle)' : 'none',
                          background: 'var(--bg-elevated)',
                        }}
                      >
                        <div style={{
                          width: '24px', height: '24px', borderRadius: '6px',
                          background: catCompatible === catResults.length ? 'rgba(0,212,170,0.15)' : 'rgba(245,158,11,0.15)',
                          color: catCompatible === catResults.length ? 'var(--success)' : 'var(--warning)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700,
                        }}>
                          {catCompatible}/{catResults.length}
                        </div>
                        <div style={{ flex: 1, fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                          {cat.name}
                        </div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '10px', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'none' }}>▼</span>
                      </div>

                      {isExpanded && (
                        <div style={{ padding: '8px 12px' }}>
                          {catResults.map((app, i) => (
                            <div key={i} style={{
                              display: 'flex', alignItems: 'center', gap: '10px',
                              padding: '8px 10px', borderBottom: i < catResults.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                              opacity: app.compatible ? 1 : 0.5,
                            }}>
                              <div style={{
                                width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
                                background: app.compatible ? 'rgba(0,212,170,0.2)' : 'rgba(232,72,85,0.15)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: app.compatible ? 'var(--success)' : 'var(--danger)',
                                fontSize: '9px', fontWeight: 700,
                              }}>
                                {app.compatible ? '✓' : '✗'}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 600, fontSize: '12px', color: 'var(--text-primary)' }}>
                                  {app.name}
                                </div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                  {app.minRam}GB RAM · {app.minStorage}GB storage
                                  {app.gpuRequired ? ' · GPU req' : ''}
                                </div>
                              </div>
                              <div style={{
                                fontSize: '9px', padding: '2px 6px', borderRadius: '4px',
                                background: app.compatible ? 'rgba(0,212,170,0.1)' : 'rgba(232,72,85,0.1)',
                                color: app.compatible ? 'var(--success)' : 'var(--danger)',
                                fontWeight: 700,
                              }}>
                                {app.compatible
                                  ? (lang === 'en' ? 'OK' : 'OK')
                                  : (lang === 'en' ? 'No' : 'Không')}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
