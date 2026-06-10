'use client';

import { useState, useMemo } from 'react';
import { useBuildStore } from '@/lib/build-store';
import { getPriorityIssues } from '@/lib/compatibility-engine';

const PART_CONFIG = {
  CPU: { icon: '⚡', color: '#00d4aa', label: 'CPU', labelVn: 'CPU' },
  GPU: { icon: '🎮', color: '#ef4444', label: 'GPU', labelVn: 'Card đồ họa' },
  MAINBOARD: { icon: '🔌', color: '#6366f1', label: 'Mainboard', labelVn: 'Bo mạch chủ' },
  RAM: { icon: '🧠', color: '#22c55e', label: 'RAM', labelVn: 'RAM' },
  SSD: { icon: '💾', color: '#06b6d4', label: 'SSD', labelVn: 'Ổ cứng' },
  PSU: { icon: '🔋', color: '#f59e0b', label: 'PSU', labelVn: 'Nguồn' },
  COOLER: { icon: '❄️', color: '#8b5cf6', label: 'Cooler', labelVn: 'Tản nhiệt' },
  CASE: { icon: '📦', color: '#ec4899', label: 'Case', labelVn: 'Vỏ máy' },
};

function SpecRow({ label, value, color }) {
  if (!value && value !== 0) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', fontSize: '11px' }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ color: color || 'var(--text-primary)', fontWeight: 600 }}>{value}</span>
    </div>
  );
}

export default function PartPickerSidebarV2({ lang = 'vn' }) {
  const [expandedType, setExpandedType] = useState(null);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  const store = useBuildStore();

  const selectedParts = useMemo(() => ({
    CPU: store.cpu,
    GPU: store.gpu,
    MAINBOARD: store.mainboard,
    RAM: store.ram,
    SSD: store.ssd,
    PSU: store.psu,
    COOLER: store.cooler,
    CASE: store.case,
  }), [store.cpu, store.gpu, store.mainboard, store.ram, store.ssd, store.psu, store.cooler, store.case]);

  const { errors, warnings } = useMemo(
    () => getPriorityIssues(store.issues),
    [store.issues]
  );

  const fetchProducts = async (type) => {
    if (products[type]) return;
    setLoading(prev => ({ ...prev, [type]: true }));
    try {
      const params = new URLSearchParams({ category: type, limit: '50' });
      if (searchQuery) params.set('q', searchQuery);
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      if (data.products) setProducts(prev => ({ ...prev, [type]: data.products }));
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleSelect = (type, product) => {
    if (!product) return;
    switch (type) {
      case 'CPU': store.setCPU(product); break;
      case 'GPU': store.setGPU(product); break;
      case 'MAINBOARD': store.setMainboard(product); break;
      case 'RAM': store.addRAM(product); break;
      case 'SSD': store.addSSD(product); break;
      case 'PSU': store.setPSU(product); break;
      case 'COOLER': store.setCooler(product); break;
      case 'CASE': store.setCase(product); break;
    }
    setExpandedType(null);
  };

  const handleRemove = (type, index) => {
    switch (type) {
      case 'CPU': store.setCPU(null); break;
      case 'GPU': store.setGPU(null); break;
      case 'MAINBOARD': store.setMainboard(null); break;
      case 'RAM': store.removeRAM(index); break;
      case 'SSD': store.removeSSD(index); break;
      case 'PSU': store.setPSU(null); break;
      case 'COOLER': store.setCooler(null); break;
      case 'CASE': store.setCase(null); break;
    }
  };

  const toggleExpand = (type) => {
    if (expandedType === type) {
      setExpandedType(null);
    } else {
      setExpandedType(type);
      fetchProducts(type);
    }
  };

  const getSpecs = (type, product) => {
    switch (type) {
      case 'CPU': return [
        { label: 'Socket', value: product.cpu_socket },
        { label: 'Nhân/Luồng', value: `${product.cpu_cores}C/${product.cpu_threads}T` },
        { label: 'Clock', value: `${product.cpu_base_ghz} / ${product.cpu_boost_ghz} GHz` },
        { label: 'TDP', value: `${product.cpu_tdp_watts}W`, color: product.cpu_tdp_watts > 125 ? 'var(--warning)' : null },
        { label: 'RAM', value: `${product.cpu_ram_type} ${product.cpu_max_ram_mhz}MHz` },
        { label: 'iGPU', value: product.cpu_has_igpu ? product.cpu_igpu_model || 'Có' : 'Không' },
      ];
      case 'GPU': return [
        { label: 'VRAM', value: `${product.gpu_vram_gb}GB` },
        { label: 'TDP', value: `${product.gpu_tdp_watts}W` },
        { label: 'Chiều dài', value: `${product.gpu_length_mm}mm`, color: 'var(--warning)' },
        { label: 'PSU yêu cầu', value: `${product.gpu_recommended_psu}W` },
        { label: 'PCIe', value: `Gen ${product.gpu_pcie_gen}` },
      ];
      case 'MAINBOARD': return [
        { label: 'Socket', value: product.mb_socket },
        { label: 'Chipset', value: product.mb_chipset },
        { label: 'Form Factor', value: product.mb_form_factor },
        { label: 'RAM', value: `${product.mb_ram_type} ${product.mb_max_ram_mhz}MHz` },
        { label: 'Khe RAM', value: `${product.mb_ram_slots} khe / tối đa ${product.mb_max_ram_gb}GB` },
        { label: 'M.2 / SATA', value: `${product.mb_m2_slots} M.2 · ${product.mb_sata_ports} SATA` },
        { label: 'WiFi', value: product.mb_has_wifi ? product.mb_wifi_version || 'Có' : 'Không' },
      ];
      case 'RAM': return [
        { label: 'Loại', value: product.ram_ddr_type },
        { label: 'Dung lượng', value: `${product.ram_capacity_gb}GB × ${product.ram_kit_count}` },
        { label: 'Tốc độ', value: `${product.ram_speed_mhz}MHz` },
        { label: 'CL', value: product.ram_cl_latency },
        { label: 'XMP/EXPO', value: product.ram_has_xmp ? 'XMP' : product.ram_has_expo ? 'EXPO' : 'Không' },
      ];
      case 'SSD': return [
        { label: 'Loại', value: product.ssd_interface === 'm2_nvme' ? 'M.2 NVMe' : product.ssd_interface },
        { label: 'Dung lượng', value: `${product.ssd_capacity_gb}GB` },
        { label: 'Đọc/Ghi', value: `${product.ssd_read_mbps}/${product.ssd_write_mbps} MB/s` },
        { label: 'DRAM', value: product.ssd_has_dram_cache ? 'Có' : 'Không' },
      ];
      case 'PSU': return [
        { label: 'Công suất', value: `${product.psu_wattage}W`, color: product.psu_wattage < 650 ? 'var(--warning)' : null },
        { label: 'Chuẩn', value: product.psu_efficiency },
        { label: 'Modular', value: product.psu_modular === 'full_modular' ? 'Full' : product.psu_modular === 'semi_modular' ? 'Semi' : 'Non' },
        { label: 'Dài', value: `${product.psu_length_mm}mm` },
      ];
      case 'COOLER': return [
        { label: 'Loại', value: product.cooler_type === 'aio' ? `AIO ${product.cooler_aio_size_mm}mm` : 'Khí' },
        { label: 'TDP tối đa', value: `${product.cooler_max_tdp_support}W` },
        { label: 'Cao', value: product.cooler_height_mm ? `${product.cooler_height_mm}mm` : '—' },
        { label: 'RGB', value: product.cooler_has_rgb ? 'Có' : 'Không' },
      ];
      case 'CASE': return [
        { label: 'Form hỗ trợ', value: product.case_supported_forms?.join(', ') },
        { label: 'GPU tối đa', value: `${product.case_max_gpu_length_mm}mm` },
        { label: 'Cooler tối đa', value: `${product.case_max_cooler_height_mm}mm` },
        { label: 'AIO hỗ trợ', value: product.case_supports_aio?.map(s => `${s}mm`).join(', ') },
        { label: 'Kính', value: product.case_side_panel === 'glass' ? 'Kính cường lực' : product.case_side_panel },
      ];
      default: return [];
    }
  };

  const renderSelectedPart = (type) => {
    const items = selectedParts[type];
    if (!items || (Array.isArray(items) && items.length === 0)) return null;

    const arr = Array.isArray(items) ? items : [items];
    return arr.map((item, idx) => (
      <div key={idx} style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '6px 8px', marginTop: '4px',
        background: PART_CONFIG[type]?.color + '12',
        borderRadius: '6px', border: `1px solid ${PART_CONFIG[type]?.color}30`,
        fontSize: '11px',
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.full_name || item.name}
          </div>
          <div style={{ color: 'var(--text-muted)' }}>
            {(item.price_vnd || 0).toLocaleString()}đ
          </div>
        </div>
        <button
          onClick={() => handleRemove(type, idx)}
          style={{
            background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ef4444',
            borderRadius: '4px', padding: '2px 6px', cursor: 'pointer', fontSize: '11px', fontFamily: 'inherit',
          }}
        >
          ✕
        </button>
      </div>
    ));
  };

  return (
    <div style={{
      width: '280px', minWidth: '280px',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-subtle)',
      borderRadius: '12px',
      display: 'flex', flexDirection: 'column',
      maxHeight: 'calc(100vh - 100px)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px', borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-elevated)',
      }}>
        <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '4px' }}>
          {lang === 'en' ? 'Component Picker' : 'Chọn linh kiện'}
        </div>
        <div style={{ fontSize: '11px', color: errors.length > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
          {errors.length > 0
            ? `${errors.length} ${lang === 'en' ? 'error(s)' : 'lỗi'} — ${warnings.length} ${lang === 'en' ? 'warning(s)' : 'cảnh báo'}`
            : lang === 'en' ? 'No compatibility errors' : 'Không có lỗi tương thích'}
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: '8px 12px' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={lang === 'en' ? 'Search components...' : 'Tìm linh kiện...'}
          style={{
            width: '100%', padding: '6px 10px', borderRadius: '6px',
            border: '1px solid var(--border-default)',
            background: 'var(--bg-elevated)', color: 'var(--text-primary)',
            fontSize: '12px', fontFamily: 'inherit', outline: 'none',
          }}
        />
      </div>

      {/* Component list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 12px' }}>
        {Object.entries(PART_CONFIG).map(([type, cfg]) => {
          const isExpanded = expandedType === type;
          const selected = selectedParts[type];
          const hasSelected = selected && (Array.isArray(selected) ? selected.length > 0 : true);
          const list = products[type];
          const isLoading = loading[type];

          return (
            <div key={type} style={{ marginBottom: '4px' }}>
              <button
                onClick={() => toggleExpand(type)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  width: '100%', padding: '8px 10px',
                  background: isExpanded ? 'var(--bg-hover)' : hasSelected ? cfg.color + '10' : 'var(--bg-elevated)',
                  border: `1px solid ${isExpanded ? cfg.color : hasSelected ? cfg.color + '40' : 'var(--border-default)'}`,
                  borderRadius: '8px', cursor: 'pointer',
                  textAlign: 'left', fontFamily: 'inherit',
                  color: 'var(--text-primary)', fontSize: '12px',
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: '16px' }}>{cfg.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '12px' }}>
                    {lang === 'en' ? cfg.label : cfg.labelVn}
                  </div>
                  {hasSelected && (
                    <div style={{ fontSize: '10px', color: cfg.color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {Array.isArray(selected) ? `${selected.length} ${lang === 'en' ? 'selected' : 'đã chọn'}` : (selected.full_name || selected.name)?.slice(0, 30)}
                    </div>
                  )}
                </div>
                <span style={{
                  color: 'var(--text-muted)', fontSize: '9px',
                  transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'none',
                }}>
                  ▼
                </span>
              </button>

              {renderSelectedPart(type)}

              {isExpanded && (
                <div style={{
                  marginTop: '4px', maxHeight: '300px', overflowY: 'auto',
                  display: 'flex', flexDirection: 'column', gap: '3px',
                  padding: '4px', background: 'var(--bg-elevated)', borderRadius: '8px',
                }}>
                  {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)', fontSize: '11px' }}>
                      {lang === 'en' ? 'Loading...' : 'Đang tải...'}
                    </div>
                  ) : !list || list.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)', fontSize: '11px' }}>
                      {lang === 'en' ? 'No components found' : 'Không tìm thấy linh kiện'}
                    </div>
                  ) : (
                    list.map(product => (
                      <button
                        key={product.id}
                        onClick={() => handleSelect(type, product)}
                        style={{
                          display: 'flex', flexDirection: 'column', gap: '2px',
                          padding: '8px 10px', background: 'var(--bg-surface)',
                          border: '1px solid var(--border-subtle)', borderRadius: '6px',
                          cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                          color: 'var(--text-primary)', fontSize: '11px',
                          transition: 'all 0.1s',
                        }}
                        onMouseOver={e => { e.currentTarget.style.borderColor = cfg.color; e.currentTarget.style.background = 'var(--bg-hover)'; }}
                        onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.background = 'var(--bg-surface)'; }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 600, fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                            {product.full_name || product.name}
                          </span>
                          <span style={{ color: cfg.color, fontWeight: 700, fontSize: '10px', flexShrink: 0, marginLeft: '4px' }}>
                            {(product.price_vnd || 0).toLocaleString()}đ
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {getSpecs(type, product).slice(0, 3).map((spec, si) => (
                            <span key={si} style={{
                              background: 'var(--bg-elevated)', padding: '1px 5px',
                              borderRadius: '3px', fontSize: '9px', color: 'var(--text-muted)',
                            }}>
                              {spec.label}: {spec.value}
                            </span>
                          ))}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Budget Summary */}
      <div style={{
        padding: '12px 16px', borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-elevated)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px' }}>
          <span style={{ color: 'var(--text-muted)' }}>{lang === 'en' ? 'Total' : 'Tổng cộng'}</span>
          <span style={{ fontWeight: 700, color: store.totalPrice > store.budget ? 'var(--danger)' : 'var(--text-primary)' }}>
            {(store.totalPrice || 0).toLocaleString()}đ
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
          <span style={{ color: 'var(--text-muted)' }}>TDP</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            {store.totalTdp}W
          </span>
        </div>
      </div>
    </div>
  );
}
