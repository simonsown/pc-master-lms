'use client';

import React, { useState, useEffect, useRef } from 'react';

/**
 * @typedef {import('@/types/pc-components').Build} Build
 * @typedef {import('@/types/pc-components').CPUProduct} CPUProduct
 * @typedef {import('@/types/pc-components').GPUProduct} GPUProduct
 * @typedef {import('@/types/pc-components').RAMProduct} RAMProduct
 * @typedef {import('@/types/pc-components').SSDProduct} SSDProduct
 */

const WINDOWS_VERSION = 'Windows 11 Pro (24H2)';

const WIFI_NETWORKS = [
  { id: 1, name: 'Nhà riêng', strength: 4, secured: true },
  { id: 2, name: 'Văn phòng PCM', strength: 5, secured: true },
  { id: 3, name: 'WiFi Quán Cà Phê', strength: 2, secured: false },
  { id: 4, name: 'Mạng Láng Giềng', strength: 3, secured: true },
  { id: 5, name: '5G Hotspot', strength: 5, secured: true },
  { id: 6, name: 'WiFi Trường Học', strength: 4, secured: true },
];

const SETUP_STEPS = [
  { label: 'Giới thiệu', icon: '📖' },
  { label: 'Ngôn ngữ', icon: '🌐' },
  { label: 'Cài đặt', icon: '⚙️' },
  { label: 'Tài khoản', icon: '👤' },
  { label: 'Quyền riêng tư', icon: '🔒' },
  { label: 'Mạng', icon: '📶' },
  { label: 'Hoàn tất', icon: '🎉' },
];

const INSTALL_MESSAGES = [
  { min: 0, max: 12, text: 'Đang sao chép tập tin cài đặt...' },
  { min: 12, max: 28, text: 'Đang cài đặt tính năng Windows...' },
  { min: 28, max: 45, text: 'Đang áp dụng cài đặt hệ thống...' },
  { min: 45, max: 65, text: 'Đang chuẩn bị thiết bị của bạn...' },
  { min: 65, max: 82, text: 'Đang thiết lập tùy chỉnh...' },
  { min: 82, max: 95, text: 'Sắp xong rồi...' },
  { min: 95, max: 100, text: 'Đang hoàn tất...' },
];

function LoadingSpinner({ size, color }) {
  return (
    <div
      style={{
        width: size || 40,
        height: size || 40,
        border: '3px solid rgba(255,255,255,0.15)',
        borderTopColor: color || 'var(--accent-blue, #0078d4)',
        borderRadius: '50%',
        animation: 'ospin 0.8s linear infinite',
      }}
    />
  );
}

function ToggleSwitch({ checked, onChange, disabled }) {
  return (
    <button
      onClick={() => { if (!disabled) onChange(!checked); }}
      disabled={disabled}
      style={{
        width: '44px', height: '24px',
        background: checked ? '#0078d4' : 'rgba(255,255,255,0.15)',
        borderRadius: '12px', border: 'none',
        cursor: disabled ? 'default' : 'pointer',
        position: 'relative', transition: 'background 0.2s',
        padding: 0, flexShrink: 0,
      }}
      type="button"
    >
      <div
        style={{
          width: '18px', height: '18px',
          background: 'white', borderRadius: '50%',
          position: 'absolute', top: '3px',
          left: checked ? '23px' : '3px',
          transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }}
      />
    </button>
  );
}

function WiFiIcon({ strength }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'flex-end', gap: '2px', height: '16px' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          style={{
            width: '3px',
            height: `${4 + i * 2.5}px`,
            background: i <= strength ? '#fff' : 'rgba(255,255,255,0.2)',
            borderRadius: '1px 1px 0 0',
            transition: 'background 0.3s',
          }}
        />
      ))}
    </span>
  );
}

const glassPanel = {
  background: 'rgba(0, 103, 192, 0.15)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '12px',
};

const win11Btn = (active) => ({
  padding: '8px 32px',
  background: active ? '#0078d4' : 'rgba(255,255,255,0.08)',
  color: active ? 'white' : 'rgba(255,255,255,0.4)',
  border: 'none',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: 600,
  cursor: active ? 'pointer' : 'default',
  fontFamily: 'inherit',
  transition: 'all 0.15s',
  opacity: active ? 1 : 0.5,
});

function StepIndicator({ currentStep, steps }) {
  return (
    <div
      style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        gap: '8px', padding: '16px 20px',
      }}
    >
      {steps.map((step, i) => (
        <React.Fragment key={i}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px', height: '32px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: 700,
                background: i < currentStep
                  ? '#0078d4'
                  : i === currentStep
                    ? 'rgba(0,120,212,0.3)'
                    : 'rgba(255,255,255,0.08)',
                color: i <= currentStep ? 'white' : 'rgba(255,255,255,0.3)',
                border: i === currentStep ? '2px solid #0078d4' : '2px solid transparent',
                transition: 'all 0.3s',
              }}
            >
              {i < currentStep ? '✓' : step.icon}
            </div>
            <span
              style={{
                color: i <= currentStep ? 'white' : 'rgba(255,255,255,0.3)',
                fontSize: '11px', fontWeight: i === currentStep ? 600 : 400,
                transition: 'color 0.3s',
              }}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              style={{
                width: '32px', height: '2px',
                background: i < currentStep ? '#0078d4' : 'rgba(255,255,255,0.1)',
                transition: 'background 0.3s',
              }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function LanguageRegionStep({ lang, region, keyboard, onLangChange, onRegionChange, onKeyboardChange, onNext }) {
  const languages = ['Tiếng Việt', 'English (United States)', 'English (United Kingdom)', '日本語', '中文(简体)', '한국어'];
  const regions = ['Việt Nam', 'United States', 'United Kingdom', 'Japan', 'China', 'South Korea'];
  const keyboards = ['Tiếng Việt (Telex)', 'Tiếng Việt (VNI)', 'US QWERTY', 'US International', 'Japanese', 'Korean'];

  const selectStyle = (val, current) => ({
    padding: '10px 16px',
    width: '100%',
    background: val === current ? 'rgba(0,120,212,0.2)' : 'rgba(255,255,255,0.06)',
    border: val === current ? '1px solid #0078d4' : '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '13px',
    textAlign: 'left',
    fontFamily: 'inherit',
    transition: 'all 0.15s',
  });

  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: '24px', padding: '24px 20px 40px',
        maxWidth: '480px', margin: '0 auto',
        width: '100%',
      }}
    >
      <div style={{ fontSize: '48px' }}>🌐</div>
      <h2 style={{ color: 'white', fontSize: '24px', fontWeight: 300, margin: 0 }}>Chọn ngôn ngữ và khu vực</h2>

      <div style={{ width: '100%' }}>
        <label style={{ color: '#aaa', fontSize: '12px', display: 'block', marginBottom: '6px' }}>Ngôn ngữ hiển thị</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '140px', overflowY: 'auto' }}>
          {languages.map(l => (
            <button key={l} onClick={() => onLangChange(l)} style={selectStyle(l, lang)} type="button">{l}</button>
          ))}
        </div>
      </div>

      <div style={{ width: '100%' }}>
        <label style={{ color: '#aaa', fontSize: '12px', display: 'block', marginBottom: '6px' }}>Khu vực</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {regions.map(r => (
            <button key={r} onClick={() => onRegionChange(r)} style={selectStyle(r, region)} type="button">{r}</button>
          ))}
        </div>
      </div>

      <div style={{ width: '100%' }}>
        <label style={{ color: '#aaa', fontSize: '12px', display: 'block', marginBottom: '6px' }}>Bàn phím</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {keyboards.map(k => (
            <button key={k} onClick={() => onKeyboardChange(k)} style={selectStyle(k, keyboard)} type="button">{k}</button>
          ))}
        </div>
      </div>

      <button onClick={onNext} style={{ ...win11Btn(true), padding: '12px 48px', fontSize: '15px', marginTop: '4px' }} type="button">
        Tiếp theo →
      </button>
    </div>
  );
}

function InstallingStep({ progress }) {
  const msg = INSTALL_MESSAGES.find(m => progress >= m.min && progress < m.max) || INSTALL_MESSAGES[INSTALL_MESSAGES.length - 1];

  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: '32px', padding: '60px 20px',
        minHeight: '400px',
      }}
    >
      <LoadingSpinner size={60} color="#0078d4" />
      <h2 style={{ color: 'white', fontSize: '22px', fontWeight: 300, margin: 0 }}>
        Đang cài đặt Windows 11
      </h2>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%', width: `${progress}%`,
              background: 'linear-gradient(90deg, #0078d4, #00b4d8)',
              borderRadius: '3px',
              transition: 'width 0.15s ease-out',
              boxShadow: '0 0 8px rgba(0,120,212,0.5)',
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
          <span style={{ color: '#888', fontSize: '12px' }}>{Math.round(progress)}%</span>
          <span style={{ color: '#ccc', fontSize: '12px' }}>{msg.text}</span>
        </div>
      </div>
      <div style={{ color: '#555', fontSize: '12px', textAlign: 'center', maxWidth: '360px', marginTop: '20px' }}>
        PC Master Build &copy; {new Date().getFullYear()}
      </div>
    </div>
  );
}

function AccountSetupStep({ username, password, confirmPassword, onUsernameChange, onPasswordChange, onConfirmChange, onNext, onBack }) {
  const [error, setError] = useState('');

  const inputStyle = {
    width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px',
    color: 'white', fontSize: '15px', outline: 'none',
    fontFamily: 'inherit', boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  };

  const handleNext = () => {
    if (!username.trim()) { setError('Vui lòng nhập tên người dùng'); return; }
    if (password && password !== confirmPassword) { setError('Mật khẩu không khớp'); return; }
    setError('');
    onNext();
  };

  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: '24px', padding: '40px 20px',
        maxWidth: '420px', margin: '0 auto',
      }}
    >
      <div style={{ fontSize: '48px' }}>👤</div>
      <h2 style={{ color: 'white', fontSize: '24px', fontWeight: 300, margin: 0 }}>Tạo tài khoản của bạn</h2>
      <p style={{ color: '#aaa', fontSize: '13px', textAlign: 'center', margin: 0 }}>
        Thiết lập tên và mật khẩu cho thiết bị này
      </p>

      {error && (
        <div style={{ color: 'var(--danger, #f46a6a)', fontSize: '13px', background: 'rgba(244,106,106,0.12)', padding: '8px 16px', borderRadius: '6px', width: '100%', textAlign: 'center' }}>
          {error}
        </div>
      )}

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ color: '#aaa', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Tên người dùng</label>
          <input
            value={username}
            onChange={e => onUsernameChange(e.target.value)}
            placeholder="Nhập tên của bạn"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ color: '#aaa', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Mật khẩu (tùy chọn)</label>
          <input
            value={password}
            onChange={e => onPasswordChange(e.target.value)}
            type="password"
            placeholder="Nhập mật khẩu"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ color: '#aaa', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Xác nhận mật khẩu</label>
          <input
            value={confirmPassword}
            onChange={e => onConfirmChange(e.target.value)}
            type="password"
            placeholder="Nhập lại mật khẩu"
            style={inputStyle}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
        <button onClick={onBack} style={win11Btn()} type="button">← Quay lại</button>
        <button onClick={handleNext} style={win11Btn(true)} type="button">Tiếp theo →</button>
      </div>
    </div>
  );
}

function PrivacySettingsStep({ settings, onToggle, onNext, onBack }) {
  const items = [
    { key: 'location', label: 'Vị trí', desc: 'Cho phép Windows và ứng dụng truy cập vị trí của bạn' },
    { key: 'diagnostics', label: 'Dữ liệu chẩn đoán', desc: 'Gửi dữ liệu chẩn đoán cho Microsoft để cải thiện Windows' },
    { key: 'ads', label: 'ID quảng cáo', desc: 'Cho phép ứng dụng sử dụng ID quảng cáo để cá nhân hóa trải nghiệm' },
  ];

  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: '24px', padding: '40px 20px',
        maxWidth: '480px', margin: '0 auto',
      }}
    >
      <div style={{ fontSize: '48px' }}>🔒</div>
      <h2 style={{ color: 'white', fontSize: '24px', fontWeight: 300, margin: 0 }}>Quyền riêng tư</h2>
      <p style={{ color: '#aaa', fontSize: '13px', textAlign: 'center', margin: 0 }}>
        Chọn cài đặt quyền riêng tư cho thiết bị của bạn. Bạn có thể thay đổi bất kỳ lúc nào trong Cài đặt.
      </p>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', ...glassPanel, padding: '8px' }}>
        {items.map(item => (
          <div
            key={item.key}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 16px', borderRadius: '8px',
              background: 'rgba(0,0,0,0.15)',
            }}
          >
            <div>
              <div style={{ color: 'white', fontSize: '14px', fontWeight: 600 }}>{item.label}</div>
              <div style={{ color: '#aaa', fontSize: '11px', marginTop: '2px' }}>{item.desc}</div>
            </div>
            <ToggleSwitch checked={settings[item.key]} onChange={() => onToggle(item.key)} />
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
        <button onClick={onBack} style={win11Btn()} type="button">← Quay lại</button>
        <button onClick={onNext} style={win11Btn(true)} type="button">Tiếp theo →</button>
      </div>
    </div>
  );
}

function NetworkSetupStep({ selectedNetwork, isConnected, onSelect, onConnect, onSkip, onBack }) {
  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: '24px', padding: '40px 20px',
        maxWidth: '480px', margin: '0 auto',
      }}
    >
      <div style={{ fontSize: '48px' }}>📶</div>
      <h2 style={{ color: 'white', fontSize: '24px', fontWeight: 300, margin: 0 }}>Kết nối mạng</h2>
      <p style={{ color: '#aaa', fontSize: '13px', textAlign: 'center', margin: 0 }}>
        Chọn mạng WiFi để kết nối Internet
      </p>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px', ...glassPanel, padding: '8px' }}>
        {WIFI_NETWORKS.map(net => (
          <button
            key={net.id}
            onClick={() => onSelect(net)}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 16px', borderRadius: '8px', cursor: 'pointer',
              background: selectedNetwork?.id === net.id ? 'rgba(0,120,212,0.2)' : 'rgba(0,0,0,0.15)',
              border: selectedNetwork?.id === net.id ? '1px solid #0078d4' : '1px solid transparent',
              color: 'white', fontSize: '14px', fontFamily: 'inherit',
              textAlign: 'left', transition: 'all 0.15s', width: '100%',
            }}
            type="button"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <WiFiIcon strength={net.strength} />
              <span>{net.name}</span>
            </div>
            {net.secured
              ? <span style={{ color: '#888', fontSize: '11px' }}>🔒 Bảo mật</span>
              : <span style={{ color: 'var(--warning, #f59e0b)', fontSize: '11px' }}>⚠️ Không bảo mật</span>
            }
          </button>
        ))}
      </div>

      {isConnected && (
        <div style={{ color: 'var(--success, #28c76f)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>✓</span> Đã kết nối với <strong>{selectedNetwork?.name}</strong>
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
        <button onClick={onBack} style={win11Btn()} type="button">← Quay lại</button>
        {selectedNetwork && !isConnected && (
          <button onClick={onConnect} style={win11Btn(true)} type="button">Kết nối</button>
        )}
        <button onClick={onSkip} style={{ ...win11Btn(true), background: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} type="button">
          Bỏ qua →
        </button>
      </div>
    </div>
  );
}

function SpecRow({ icon, label, value }) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '12px',
        padding: '10px 12px', borderRadius: '8px',
        background: 'rgba(0,0,0,0.15)',
      }}
    >
      <span style={{ fontSize: '16px', flexShrink: 0, marginTop: '1px' }}>{icon}</span>
      <div>
        <div style={{ color: '#aaa', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px' }}>{label}</div>
        <div style={{ color: 'white', fontSize: '13px', lineHeight: '1.4' }}>{value}</div>
      </div>
    </div>
  );
}

function SpecsApp({ build, onClose }) {
  const cpu = build?.cpu;
  const gpu = build?.gpu;
  const ram = build?.ram || [];
  const ssd = build?.ssd || [];
  const hdd = build?.hdd || [];

  const totalRamGb = ram.reduce((sum, r) => sum + (r.ram_capacity_gb || 0), 0);
  const totalStorageGb = [...ssd, ...hdd].reduce((sum, s) => sum + (s.ssd_capacity_gb || 0), 0);

  const cpuScore = (cpu?.cpu_cores || 4) * (cpu?.cpu_threads || 8) * ((cpu?.cpu_boost_ghz || 3) * 100)
    + (cpu?.cpu_cinebench_r23_multi || 10000) / 10;
  const gpuScore = (gpu?.gpu_vram_gb || 4) * 2000 + (gpu?.gpu_benchmark_1080p || 5000);
  const ramScore = totalRamGb * 50 + (ram[0]?.ram_speed_mhz || 3200) * 2;
  const storageScore = totalStorageGb * 2 + (ssd[0]?.ssd_read_mbps || 3000);
  const performanceScore = Math.round((cpuScore + gpuScore + ramScore + storageScore) / 5);

  const getPerformanceLevel = (score) => {
    if (score >= 15000) return { label: 'Xuất sắc', color: 'var(--success, #00d4aa)' };
    if (score >= 10000) return { label: 'Tốt', color: '#0078d4' };
    if (score >= 6000) return { label: 'Trung bình', color: 'var(--warning, #f59e0b)' };
    return { label: 'Cơ bản', color: '#888' };
  };

  const perf = getPerformanceLevel(performanceScore);

  return (
    <div
      style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        zIndex: 100, width: '520px', maxWidth: '90vw', maxHeight: '80vh', overflowY: 'auto',
        ...glassPanel, padding: '24px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        animation: 'osfadein 0.3s ease-out',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ color: 'white', margin: 0, fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          💻 Thông tin hệ thống
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)', border: 'none',
              color: '#aaa', width: '28px', height: '28px', borderRadius: '6px',
              cursor: 'pointer', fontSize: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            type="button"
          >
            ✕
          </button>
        )}
      </div>

      <div
        style={{
          ...glassPanel, padding: '16px', marginBottom: '16px', textAlign: 'center',
          border: `1px solid ${perf.color}33`,
        }}
      >
        <div style={{ color: perf.color, fontSize: '28px', fontWeight: 800, letterSpacing: '-1px' }}>
          {performanceScore.toLocaleString()}
        </div>
        <div style={{ color: perf.color, fontSize: '12px', fontWeight: 600, marginTop: '4px' }}>
          {perf.label}
        </div>
        <div style={{ color: '#888', fontSize: '11px', marginTop: '4px' }}>Điểm hiệu năng PCMaster</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <SpecRow icon="🪟" label="Hệ điều hành" value={WINDOWS_VERSION} />
        {cpu && (
          <SpecRow
            icon="⚡"
            label="CPU"
            value={`${cpu.brand} ${cpu.model} (${cpu.cpu_cores} nhân, ${cpu.cpu_threads} luồng, ${cpu.cpu_base_ghz}-${cpu.cpu_boost_ghz} GHz)`}
          />
        )}
        {gpu && (
          <SpecRow
            icon="🎮"
            label="GPU"
            value={`${gpu.brand} ${gpu.model} (${gpu.gpu_vram_gb}GB VRAM)`}
          />
        )}
        {ram.length > 0 && (
          <SpecRow
            icon="🧠"
            label="RAM"
            value={`${totalRamGb}GB DDR${ram[0].ram_ddr_type || ''} ${ram[0].ram_speed_mhz || ''}MHz`}
          />
        )}
        <SpecRow
          icon="💾"
          label="Lưu trữ"
          value={`${totalStorageGb}GB (${ssd.length} SSD${hdd.length > 0 ? `, ${hdd.length} HDD` : ''})`}
        />
        {ssd[0] && (
          <SpecRow
            icon="🚀"
            label="SSD"
            value={`${ssd[0].brand} ${ssd[0].model} - ${ssd[0].ssd_capacity_gb}GB (Đọc ${ssd[0].ssd_read_mbps}MB/s)`}
          />
        )}
      </div>
    </div>
  );
}

function DesktopPhase({ build, username, onExit }) {
  const [openApp, setOpenApp] = useState(null);
  const [startOpen, setStartOpen] = useState(false);
  const [time, setTime] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const t = setInterval(
      () => setTime(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })),
      1000,
    );
    setTime(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (showWelcome) {
      const timer = setTimeout(() => setShowWelcome(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showWelcome]);

  const wallpaperColors = 'linear-gradient(135deg,#0f1b2d 0%,#0d2137 40%,#1a0533 100%)';

  const desktopApps = [
    { id: 'specs', icon: '💻', name: 'PC Specs' },
    { id: 'browser', icon: '🌐', name: 'Edge' },
    { id: 'files', icon: '📁', name: 'File Explorer' },
    { id: 'store', icon: '🛒', name: 'Store' },
  ];

  const appWindows = {
    specs: (
      <SpecsApp build={build} onClose={() => setOpenApp(null)} />
    ),
    browser: (
      <div
        style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          ...glassPanel, padding: '24px', zIndex: 100,
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          minWidth: '400px', textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🌐</div>
        <h3 style={{ color: 'white', margin: '0 0 8px 0', fontWeight: 600 }}>Microsoft Edge</h3>
        <p style={{ color: '#aaa', fontSize: '13px' }}>Trình duyệt web mặc định của Windows 11</p>
        <button onClick={() => setOpenApp(null)} style={{ ...win11Btn(true), marginTop: '12px' }} type="button">Đóng</button>
      </div>
    ),
    files: (
      <div
        style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          ...glassPanel, padding: '24px', zIndex: 100,
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          minWidth: '380px',
        }}
      >
        <h3 style={{ color: 'white', margin: '0 0 12px 0', fontSize: '15px', fontWeight: 600 }}>📁 File Explorer</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
          {['Desktop', 'Downloads', 'Documents', 'Pictures', 'Music'].map(f => (
            <div key={f} style={{ color: '#ccc', padding: '8px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.04)', fontSize: '13px' }}>
              📁 {f}
            </div>
          ))}
        </div>
        <button onClick={() => setOpenApp(null)} style={win11Btn(true)} type="button">Đóng</button>
      </div>
    ),
    store: (
      <div
        style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          ...glassPanel, padding: '24px', zIndex: 100,
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          minWidth: '400px', textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🛒</div>
        <h3 style={{ color: 'white', margin: '0 0 8px 0', fontWeight: 600 }}>Microsoft Store</h3>
        <p style={{ color: '#aaa', fontSize: '13px' }}>Hàng nghìn ứng dụng và trò chơi đang chờ bạn</p>
        <button onClick={() => setOpenApp(null)} style={{ ...win11Btn(true), marginTop: '12px' }} type="button">Đóng</button>
      </div>
    ),
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: wallpaperColors,
        fontFamily: "'Segoe UI', 'Segoe UI Variable', sans-serif",
        userSelect: 'none', overflow: 'hidden',
      }}
      onClick={() => { if (startOpen) setStartOpen(false); }}
    >
      {showWelcome && (
        <div
          style={{
            position: 'absolute', inset: 0, zIndex: 50,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
            animation: 'osfadein 0.5s',
          }}
        >
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🪟</div>
          <h1 style={{ color: 'white', fontSize: '32px', fontWeight: 300, margin: 0 }}>
            Chào mừng đến với Windows 11
          </h1>
          <p style={{ color: '#aaa', fontSize: '14px', marginTop: '12px' }}>
            {username || 'PC Master User'}
          </p>
        </div>
      )}

      <div
        style={{
          padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px',
          width: '80px', position: 'relative', zIndex: 10,
        }}
      >
        {desktopApps.map(app => (
          <div
            key={app.id}
            onDoubleClick={() => setOpenApp(app)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '4px', cursor: 'pointer', padding: '8px', borderRadius: '6px',
              color: 'white',
            }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <span style={{ fontSize: '32px' }}>{app.icon}</span>
            <span style={{ fontSize: '11px', textAlign: 'center', textShadow: '1px 1px 2px black' }}>
              {app.name}
            </span>
          </div>
        ))}
      </div>

      {openApp && appWindows[openApp.id]}

      <div
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, height: '48px',
          background: 'rgba(32,32,32,0.95)', backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px', zIndex: 200,
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={() => setStartOpen(v => !v)}
            style={{
              background: 'transparent', border: 'none', fontSize: '22px',
              cursor: 'pointer', padding: '6px 10px', borderRadius: '6px',
              transition: 'background 0.15s',
            }}
            type="button"
          >
            🪟
          </button>
          {desktopApps.map(app => (
            <button
              key={app.id}
              onClick={() => setOpenApp(app)}
              title={app.name}
              style={{
                background: openApp?.id === app.id ? 'rgba(255,255,255,0.15)' : 'transparent',
                border: 'none', fontSize: '20px', padding: '6px 10px', borderRadius: '6px',
                cursor: 'pointer', fontFamily: 'inherit',
                borderBottom: openApp?.id === app.id ? '2px solid #0078d4' : '2px solid transparent',
              }}
              type="button"
            >
              {app.icon}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onExit}
            style={{
              background: 'rgba(239,68,68,0.8)', color: 'white', border: 'none',
              padding: '4px 14px', borderRadius: '6px', cursor: 'pointer',
              fontSize: '12px', fontWeight: 700, fontFamily: 'inherit',
            }}
            type="button"
          >
            ⏻ Tắt máy
          </button>
          <div style={{ color: 'white', fontSize: '12px', textAlign: 'right' }}>
            <div style={{ fontWeight: 600 }}>{time}</div>
            <div style={{ color: '#aaa', fontSize: '10px' }}>
              {new Date().toLocaleDateString('vi-VN')}
            </div>
          </div>
        </div>
      </div>

      {startOpen && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: 'fixed', bottom: '56px', left: '50%', transform: 'translateX(-50%)',
            width: '520px', background: 'rgba(36,36,36,0.98)', backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            borderRadius: '12px', padding: '24px',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
            zIndex: 300, animation: 'osfadein 0.15s ease-out',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <input
              placeholder="Tìm kiếm ứng dụng, cài đặt..."
              style={{
                flex: 1, padding: '10px 16px', borderRadius: '8px', border: 'none',
                background: 'rgba(255,255,255,0.08)', color: 'white', fontSize: '13px',
                outline: 'none', fontFamily: 'inherit',
              }}
            />
          </div>
          <div
            style={{
              color: 'rgba(255,255,255,0.6)', fontWeight: 600, marginBottom: '12px',
              fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px',
            }}
          >
            Ứng dụng
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px', marginBottom: '16px' }}>
            {desktopApps.map(app => (
              <button
                key={app.id}
                onClick={() => { setOpenApp(app); setStartOpen(false); }}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: '4px', padding: '12px 8px', borderRadius: '8px',
                  color: 'white', fontFamily: 'inherit',
                  transition: 'background 0.15s',
                }}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}
                type="button"
              >
                <span style={{ fontSize: '28px' }}>{app.icon}</span>
                <span style={{ fontSize: '11px' }}>{app.name}</span>
              </button>
            ))}
          </div>
          <div
            style={{
              borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}
          >
            <span style={{ color: '#aaa', fontSize: '13px' }}>
              👤 {username || 'PC Master User'}
            </span>
            <button
              onClick={onExit}
              style={{
                background: 'transparent', border: 'none', color: '#aaa',
                cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit',
              }}
              type="button"
            >
              ⏻ Tắt máy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function IntroStep({ onNext }) {
  const [phase, setPhase] = useState(0);
  const phases = [
    { icon: '📦', title: 'Bạn vừa mua một bộ PC mới!', desc: 'Linh kiện đã lắp ráp xong, BIOS đã nhận đầy đủ thiết bị.' },
    { icon: '💿', title: 'Nhưng máy tính chưa có hệ điều hành', desc: 'Không có Windows = không thể sử dụng. Cần cài đặt Windows để bắt đầu.' },
    { icon: '🪟', title: 'Cài Windows 11 bản quyền — an toàn, bảo mật', desc: 'Dùng bản chính hãng từ Microsoft, tránh bản cài sẵn chứa mã độc.' },
  ];

  useEffect(() => {
    if (phase < phases.length - 1) {
      const t = setTimeout(() => setPhase(p => p + 1), 2500);
      return () => clearTimeout(t);
    }
  }, [phase]);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 20, padding: '40px 20px',
      minHeight: 400, maxWidth: 600, margin: '0 auto',
    }}>
      <div style={{
        fontSize: 72, animation: 'ospulse 2s ease-in-out infinite',
        transition: 'all 0.4s',
      }}>{phases[phase].icon}</div>
      <h2 style={{ color: 'white', fontSize: 22, fontWeight: 300, margin: 0, textAlign: 'center' }}>
        {phases[phase].title}
      </h2>
      <p style={{ color: '#aaa', fontSize: 14, textAlign: 'center', lineHeight: 1.6, margin: 0 }}>
        {phases[phase].desc}
      </p>

      {phase === phases.length - 1 && (
        <div style={{
          animation: 'osfadein 0.5s', display: 'flex', flexDirection: 'column',
          gap: 14, width: '100%', marginTop: 8,
        }}>
          <div style={{
            background: 'rgba(0,120,212,0.1)', border: '1px solid rgba(0,120,212,0.2)',
            borderRadius: 10, padding: '14px 18px',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#0078d4', marginBottom: 6 }}>
              📥 Tải Windows 11 bản quyền (chính thống)
            </div>
            <ul style={{ margin: 0, padding: '0 0 0 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <li style={{ fontSize: 12, color: '#aaa' }}>
                <a href="https://www.microsoft.com/software-download/windows11" target="_blank" rel="noopener noreferrer"
                  style={{ color: '#3b82f6' }}>
                  Microsoft.com — Tạo USB cài Win chính thức
                </a>
              </li>
              <li style={{ fontSize: 12, color: '#aaa' }}>
                <a href="https://www.microsoft.com/en-us/evalcenter/evaluate-windows-11-enterprise" target="_blank" rel="noopener noreferrer"
                  style={{ color: '#3b82f6' }}>
                  Trung tâm đánh giá — Windows 11 Enterprise Evaluation
                </a>
              </li>
            </ul>
          </div>
          <button onClick={onNext}
            style={{
              padding: '12px 48px', borderRadius: 8, fontSize: 15, fontWeight: 600,
              background: '#0078d4', border: 'none', color: 'white', cursor: 'pointer',
              fontFamily: 'inherit', alignSelf: 'center',
            }}>
            Bắt đầu cài đặt →
          </button>
        </div>
      )}
    </div>
  );
}

export default function OSInstallationSimulator({ build, onComplete, onExit }) {
  const [step, setStep] = useState(0);
  const [lang, setLang] = useState('Tiếng Việt');
  const [region, setRegion] = useState('Việt Nam');
  const [keyboard, setKeyboard] = useState('Tiếng Việt (Telex)');
  const [installProgress, setInstallProgress] = useState(0);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [privacySettings, setPrivacySettings] = useState({ location: true, diagnostics: false, ads: false });
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [desktopReady, setDesktopReady] = useState(false);

  useEffect(() => {
    if (step === 2) {
      setInstallProgress(0);
      const timer = setInterval(() => {
        setInstallProgress(p => {
          if (p >= 100) {
            clearInterval(timer);
            setTimeout(() => setStep(3), 500);
            return 100;
          }
          const increment = p < 80 ? 1.5 : p < 95 ? 0.8 : 0.3;
          return Math.min(100, p + increment);
        });
      }, 80);
      return () => clearInterval(timer);
    }
  }, [step]);

  useEffect(() => {
    if (!document.getElementById('os-sim-styles')) {
      const style = document.createElement('style');
      style.id = 'os-sim-styles';
      style.textContent = `
        @keyframes ospin { to { transform: rotate(360deg); } }
        @keyframes osfadein { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes ospulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes osslideup { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        input::placeholder { color: #666; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.25); }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const handleNext = () => {
    setStep(s => Math.min(s + 1, 6));
  };

  const handleBack = () => {
    setStep(s => Math.max(s - 1, 0));
  };

  const handleNetworkConnect = () => {
    if (selectedNetwork) setIsConnected(true);
  };

  const handleNetworkSkip = () => {
    setIsConnected(false);
    setSelectedNetwork(null);
    setStep(6);
  };

  useEffect(() => {
    if (step === 6 && !desktopReady) {
      setDesktopReady(true);
      if (onComplete) {
        setTimeout(() => onComplete(), 1000);
      }
    }
  }, [step, desktopReady, onComplete]);

  const renderStep = () => {
    switch (step) {
      case 0:
        return <IntroStep onNext={handleNext} />;
      case 1:
        return (
          <LanguageRegionStep
            lang={lang}
            region={region}
            keyboard={keyboard}
            onLangChange={setLang}
            onRegionChange={setRegion}
            onKeyboardChange={setKeyboard}
            onNext={handleNext}
          />
        );
      case 2:
        return <InstallingStep progress={installProgress} />;
      case 3:
        return (
          <AccountSetupStep
            username={username}
            password={password}
            confirmPassword={confirmPassword}
            onUsernameChange={setUsername}
            onPasswordChange={setPassword}
            onConfirmChange={setConfirmPassword}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <PrivacySettingsStep
            settings={privacySettings}
            onToggle={(key) => setPrivacySettings(s => ({ ...s, [key]: !s[key] }))}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 5:
        return (
          <NetworkSetupStep
            selectedNetwork={selectedNetwork}
            isConnected={isConnected}
            onSelect={setSelectedNetwork}
            onConnect={handleNetworkConnect}
            onSkip={handleNetworkSkip}
            onBack={handleBack}
          />
        );
      case 6:
        return <DesktopPhase build={build} username={username} onExit={onExit} />;
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'linear-gradient(135deg, #0f1b2d 0%, #0d2137 40%, #1a0533 100%)',
        fontFamily: "'Segoe UI', 'Segoe UI Variable', -apple-system, sans-serif",
        display: 'flex', flexDirection: 'column',
        overflow: 'auto',
      }}
    >
      {step < 6 && (
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '12px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(0,0,0,0.2)',
          }}
        >
          <span style={{ fontSize: '20px' }}>🪟</span>
          <span style={{ color: 'white', fontSize: '13px', fontWeight: 600 }}>
            Trình cài đặt Windows 11
          </span>
        </div>
      )}

      {step < 6 && <StepIndicator currentStep={step} steps={SETUP_STEPS} />}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', animation: 'osslideup 0.3s ease-out' }}>
        {renderStep()}
      </div>
    </div>
  );
}
