'use client';

import { useState } from 'react';

const MISTAKES = [
  {
    id: 'ram',
    title: 'Máy không nhận RAM',
    videoId: 'SYCCvVFClXo',
    level: 'Cơ bản',
    time: '2-5 phút',
    summary: 'RAM chưa được cắm đúng cách hoặc không tương thích với mainboard.',
    reasons: [
      'RAM chưa được ấn mạnh xuống hết — ngàm nhựa hai đầu chưa bật lên',
      'RAM cắm sai khe — cần cắm theo thứ tự A2-B2 (khe thứ 2 và thứ 4 tính từ CPU)',
      'RAM không tương thích — không nằm trong QVL (Qualified Vendor List) của mainboard',
      'Bụi bẩn trong khe cắm RAM — vệ sinh bằng cồn isopropyl',
      'Chân RAM bị cong hoặc gãy',
    ],
    fixes: [
      'Tháo ra và cắm lại, ấn mạnh đến khi nghe "tách"',
      'Cắm vào khe A2 (thứ 2 từ CPU) nếu chỉ 1 thanh',
      'Kiểm tra QVL trên trang chủ của mainboard',
      'Dùng tẩy chì hoặc cồn lau nhẹ chân RAM',
    ],
    Icon: '🧠',
    color: '#6366f1',
    animation: 'shakeY',
  },
  {
    id: 'display',
    title: 'Màn hình không lên',
    videoId: 'rfmgTuR7Hls',
    level: 'Cơ bản',
    time: '3-10 phút',
    summary: 'Máy khởi động (quạt quay, đèn sáng) nhưng màn hình đen — không có tín hiệu.',
    reasons: [
      'Cắm dây màn hình vào cổng HDMI/VGA trên mainboard thay vì GPU',
      'RAM chưa cắm chặt — nguyên nhân số 1 gây màn hình đen',
      'Nguồn điện không đủ — PSU quá yếu hoặc chưa cắm dây CPU 8-pin',
      'Card đồ họa chưa cắm nguồn PCIe',
      'BIOS chưa hỗ trợ CPU mới — cần update BIOS',
    ],
    fixes: [
      'Cắm dây vào GPU (card rời) — KHÔNG cắm vào mainboard nếu có card rời',
      'Tháo RAM lau sạch chân, cắm lại nghe "tách"',
      'Kiểm tra tất cả dây nguồn đã cắm chặt chưa',
      'Reset CMOS bằng jumper pin hoặc tháo pin CMOS 5 phút',
    ],
    Icon: '🖥️',
    color: '#f59e0b',
    animation: 'fadeOut',
  },
  {
    id: 'assembly',
    title: 'Sai kỹ thuật lắp ráp',
    videoId: 'CrIxH6El3TQ',
    level: 'Trung bình',
    time: '5-15 phút',
    summary: 'Các lỗi phổ biến khi lắp ráp: không gắn IO shield, cắm RAM sai khe, cắm dây HDMI vào mainboard.',
    reasons: [
      'Quên gắn IO shield (FE chắn main) trước khi bắt vít mainboard',
      'Cắm RAM vào sai khe (A1-A2 thay vì A2-B2)',
      'Cắm dây màn hình vào mainboard khi có card đồ họa rời',
      'Không bôi keo tản nhiệt hoặc bôi quá nhiều',
      'Gắn cooler không đều — một bên chặt một bên lỏng',
    ],
    fixes: [
      'Luôn gắn IO shield TRƯỚC khi bắt mainboard vào case',
      'Cắm RAM vào khe thứ 2 và thứ 4 tính từ CPU (A2-B2)',
      'Cắm dây màn hình vào GPU, không cắm vào mainboard',
      'Bôi keo tản nhiệt cỡ hạt đậu — không cần trét đều',
      'Siết ốc cooler theo hình chữ X, mỗi lần 1-2 vòng',
    ],
    Icon: '🔧',
    color: '#ef4444',
    animation: 'shakeX',
  },
  {
    id: 'psu',
    title: 'Lỗi nguồn và hiển thị',
    videoId: 'Q8LHfWZwChE',
    level: 'Trung bình',
    time: '10-30 phút',
    summary: 'Lỗi liên quan đến PSU, VGA, RAM, CPU, BIOS — máy không khởi động hoặc khởi động không ổn định.',
    reasons: [
      'PSU không đủ công suất cho hệ thống',
      'Dây nguồn cắm chưa chặt — đặc biệt dây CPU 8-pin và PCIe',
      'Card đồ họa bị lỗi hoặc chưa cắm nguồn phụ',
      'BIOS cũ không hỗ trợ CPU đời mới',
      'Chập điện do mainboard chạm case (thiếu standoff)',
    ],
    fixes: [
      'Tính toán TDP tổng và chọn PSU dư 20-30% công suất',
      'Cắm lại tất cả dây nguồn, ấn đến khi nghe "click"',
      'Kiểm tra GPU ở máy khác nếu có thể',
      'Cập nhật BIOS lên phiên bản mới nhất',
      'Kiểm tra standoff — mainboard không được chạm trực tiếp vào case',
    ],
    Icon: '⚡',
    color: '#f97316',
    animation: 'spark',
  },
  {
    id: 'compatibility',
    title: 'Linh kiện không tương thích',
    videoId: '0L7SBpZXnsE',
    level: 'Nâng cao',
    time: '30-60 phút',
    summary: 'CPU không tương thích socket/ chipset, RAM không đúng chuẩn, nguồn quá yếu cho GPU.',
    reasons: [
      'CPU không tương thích socket — Intel LGA1700 ≠ AMD AM5',
      'Chipset mainboard không hỗ trợ CPU — cần update BIOS hoặc đổi main',
      'RAM DDR4 không cắm được vào khe DDR5 và ngược lại',
      'Nguồn không đủ cho GPU — RTX 4090 cần tối thiểu 850W',
      'Case quá nhỏ không vừa GPU dài hoặc tản nhiệt cao',
    ],
    fixes: [
      'Kiểm tra socket mainboard trước khi mua CPU: LGA1700 cho Intel 12-14th, AM5 cho AMD Ryzen 7000+',
      'Dùng PC Part Picker để kiểm tra tương thích',
      'Chọn RAM đúng thế hệ: DDR5 cho AM5 / LGA1700, DDR4 cho AM4 / LGA1200',
      'Tính TDP tổng + 20-30% để chọn PSU',
      'Check kích thước case: max GPU length & CPU cooler height',
    ],
    Icon: '🔗',
    color: '#8b5cf6',
    animation: 'none',
  },
  {
    id: 'ssd',
    title: 'Máy không phát hiện SSD',
    videoId: 'XXSof_YH85s',
    level: 'Cơ bản',
    time: '5-15 phút',
    summary: 'SSD không xuất hiện trong BIOS hoặc Windows — do chưa format, chưa kết nối đúng, hoặc ổ lỗi.',
    reasons: [
      'SSD M.2 chưa cắm chặt hoặc cắm sai khe (dùng chung lane với SATA)',
      'SSD chưa được khởi tạo (initialize) trong Disk Management',
      'SSD không được set làm boot drive trong BIOS',
      'Cáp SATA lỏng hoặc hỏng (với SSD 2.5")',
      'Driver NVMe chưa được cài — đặc biệt trên Windows 10 cũ',
    ],
    fixes: [
      'Vào Disk Management → chuột phải → Initialize Disk',
      'Vào BIOS → Boot Order → chọn SSD làm ưu tiên 1',
      'Rút ra cắm lại SSD M.2, thử khe M.2 khác',
      'Cài driver NVMe từ trang chủ của hãng',
    ],
    Icon: '💾',
    color: '#06b6d4',
    animation: 'none',
  },
  {
    id: 'wrongbuild',
    title: 'Lắp ráp sai cách',
    videoId: '0L7SBpZXnsE',
    level: 'Trung bình',
    time: '10-30 phút',
    summary: 'Quy trình lắp ráp không đúng thứ tự dẫn đến hỏng linh kiện hoặc không hoạt động.',
    reasons: [
      'Lắp mainboard vào case trước khi gắn CPU + RAM + cooler — khó thao tác',
      'Quên gắn standoff — mainboard chập case gây chết máy',
      'Siết ốc quá chặt — hỏng PCB, nứt mainboard',
      'Không kiểm tra trước ngoài case (bench test)',
      'Cắm dây front panel sai cực tính',
    ],
    fixes: [
      'Lắp CPU → RAM → Cooler → SSD → Kiểm tra ngoài case TRƯỚC',
      'Bench test: lắp tối thiểu CPU + 1 RAM + GPU trên hộp carton',
      'Siết ốc vừa tay — nếu thấy căng là đủ',
      'Xem hướng dẫn trong sách mainboard trước khi lắp',
      'Cực dương (+, PWR) thường ở bên trái, cực âm (-, GND) bên phải',
    ],
    Icon: '🏗️',
    color: '#14b8a6',
    animation: 'none',
  },
  {
    id: 'wiring',
    title: 'Cách cắm dây đúng khi build PC',
    videoId: 'xT36IDSQBX4',
    level: 'Trung bình',
    time: '15-45 phút',
    summary: 'Cắm dây sai thứ tự / sai vị trí dẫn đến không khởi động hoặc chập cháy.',
    reasons: [
      'Cắm dây nguồn CPU 8-pin vào GPU PCIe — có thể gây cháy',
      'Cắm dây front panel (PWR SW, RESET, LED) sai cực hoặc sai chân',
      'Dây SATA cắm ngược — có thể hỏng ổ cứng',
      'Dây USB 3.0 cắm lệch chân — cong chân trên mainboard',
      'Dây HD Audio cắm sai vị trí — mất âm thanh mặt trước',
    ],
    fixes: [
      'Dây CPU 8-pin có ghi "CPU" — dây PCIe có ghi "PCIe" hoặc "VGA"',
      'Xem sơ đồ chân front panel trong sách mainboard — mỗi hãng khác nhau',
      'Dây SATA có ngàm chống cắm ngược — không dùng lực',
      'USB 3.0 có lỗ khuyết ở 1 góc — căn đúng trước khi ấn',
      'HD Audio có chân thiếu ở hàng thứ 2 — dùng làm mốc định vị',
    ],
    Icon: '🔌',
    color: '#22c55e',
    animation: 'flow',
  },
];

function YouTubeEmbed({ videoId, title }) {
  const [show, setShow] = useState(false);
  const [thumbError, setThumbError] = useState(false);

  if (show) {
    return (
      <div style={{
        position: 'relative', width: '100%', paddingBottom: '56.25%',
        borderRadius: 8, overflow: 'hidden', background: '#000',
      }}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            border: 'none', borderRadius: 8,
          }}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
        <button onClick={() => setShow(false)}
          style={{
            position: 'absolute', top: 6, right: 6, zIndex: 10,
            width: 28, height: 28, borderRadius: '50%', border: 'none',
            background: 'rgba(0,0,0,0.6)', color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14,
          }}>✕</button>
      </div>
    );
  }

  return (
    <div onClick={() => setShow(true)}
      style={{
        position: 'relative', width: '100%', aspectRatio: '16/9',
        borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
        background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
        border: '1px solid var(--border-default)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
      {!thumbError && (
        <img
          src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
          alt={title}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
          onError={() => setThumbError(true)}
        />
      )}
      {thumbError && (
        <div style={{
          fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', padding: 10,
          display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center',
        }}>
          <span style={{ fontSize: 24 }}>🎬</span>
          <span>{title}</span>
        </div>
      )}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.3)', transition: 'background 0.2s',
      }}
        onMouseOver={e => e.currentTarget.style.background = 'rgba(0,0,0,0.15)'}
        onMouseOut={e => e.currentTarget.style.background = 'rgba(0,0,0,0.3)'}>
        <div style={{
          width: 52, height: 36, borderRadius: 8,
          background: 'rgba(255,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        }}>▶</div>
      </div>
    </div>
  );
}

function MistakeCard({ mistake, index }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-default)',
      borderRadius: 12, overflow: 'hidden',
      animation: `fadeInUp 0.4s ease-out ${index * 0.08}s both`,
    }}>
      <div onClick={() => setExpanded(!expanded)}
        style={{
          padding: '16px 18px', cursor: 'pointer', display: 'flex', gap: 14,
          alignItems: 'flex-start',
          transition: 'background 0.2s',
          background: expanded ? 'var(--bg-hover)' : 'transparent',
        }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: `${mistake.color}15`, display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0,
        }}>{mistake.Icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{mistake.title}</span>
            <span style={{
              fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
              background: `${mistake.color}20`, color: mistake.color,
            }}>{mistake.level}</span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{mistake.summary}</p>
        </div>
        <div style={{
          color: 'var(--text-muted)', fontSize: 16, transition: 'transform 0.2s',
          transform: expanded ? 'rotate(180deg)' : 'none', flexShrink: 0, marginTop: 4,
        }}>▼</div>
      </div>

      {expanded && (
        <div style={{
          padding: '0 18px 18px', borderTop: '1px solid var(--border-subtle)',
          animation: 'fadeIn 0.2s',
        }}>
          <div style={{ display: 'flex', gap: 16, marginTop: 14 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 14 }}>❌</span> Nguyên nhân
                </div>
                <ul style={{ margin: 0, padding: '0 0 0 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {mistake.reasons.map((r, i) => (
                    <li key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{r}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 14 }}>✅</span> Cách khắc phục
                </div>
                <ul style={{ margin: 0, padding: '0 0 0 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {mistake.fixes.map((f, i) => (
                    <li key={i} style={{ fontSize: 12, color: 'var(--success)', lineHeight: 1.5 }}>{f}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div style={{ width: 280, flexShrink: 0 }}>
              <YouTubeEmbed videoId={mistake.videoId} title={mistake.title} />
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 6 }}>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>⏱ {mistake.time}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AnimationDemo({ mistake }) {
  const [playAnim, setPlayAnim] = useState(false);

  const animStyle = (type) => {
    if (!playAnim) return {};
    switch(type) {
      case 'shakeY': return { animation: 'mistShakeY 0.6s ease-in-out' };
      case 'shakeX': return { animation: 'mistShakeX 0.5s ease-in-out' };
      case 'fadeOut': return { animation: 'mistFade 2s ease-in-out' };
      case 'spark': return { animation: 'mistSpark 1s ease-in-out' };
      case 'flow': return { animation: 'mistFlow 1.5s linear infinite' };
      default: return {};
    }
  };

  return (
    <div style={{
      background: 'var(--bg-elevated)', borderRadius: 10,
      border: '1px solid var(--border-default)',
      padding: 16, textAlign: 'center',
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
        Hoạt ảnh ví dụ
      </div>
      <div style={{
        width: 60, height: 60, margin: '0 auto 10px',
        borderRadius: 12, background: `${mistake.color}12`,
        border: `1px solid ${mistake.color}22`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 28,
        ...animStyle(mistake.animation),
      }}>{mistake.Icon}</div>
      <div style={{ fontSize: 11, color: 'var(--text-primary)', marginBottom: 8, fontWeight: 600 }}>{mistake.title}</div>
      <button onClick={() => { setPlayAnim(true); setTimeout(() => setPlayAnim(false), 2000); }}
        style={{
          padding: '6px 14px', borderRadius: 6, fontSize: 10, fontWeight: 600,
          background: `${mistake.color}15`, border: `1px solid ${mistake.color}33`,
          color: mistake.color, cursor: 'pointer', fontFamily: 'inherit',
        }}>
        ▶ Xem mô phỏng
      </button>
    </div>
  );
}

export default function CommonMistakes({ lang = 'vn', onExit }) {
  const [filter, setFilter] = useState(null);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'var(--bg-base)', display: 'flex', flexDirection: 'column',
      fontFamily: 'system-ui, sans-serif', overflow: 'hidden',
    }}>
      <style>{`
        @keyframes mistShakeY { 0%,100% { transform: translateY(0); } 20% { transform: translateY(-8px); } 40% { transform: translateY(8px); } 60% { transform: translateY(-4px); } 80% { transform: translateY(4px); } }
        @keyframes mistShakeX { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-10px); } 40% { transform: translateX(10px); } 60% { transform: translateX(-6px); } 80% { transform: translateX(6px); } }
        @keyframes mistFade { 0% { opacity: 1; } 30% { opacity: 0.1; } 60% { opacity: 0.8; } 100% { opacity: 1; } }
        @keyframes mistSpark { 0% { box-shadow: 0 0 0 0 transparent; } 50% { box-shadow: 0 0 24px 8px rgba(249,115,22,0.3); } 100% { box-shadow: 0 0 0 0 transparent; } }
        @keyframes mistFlow { 0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); } 50% { box-shadow: 0 0 20px 4px rgba(34,197,94,0.3); } 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); } }
      `}</style>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 24px', borderBottom: '1px solid var(--border-default)',
        background: 'var(--bg-surface)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>⚠️</span>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>
              Lỗi Thường Gặp
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {MISTAKES.length} lỗi phổ biến khi lắp ráp PC — click để xem video hướng dẫn
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            display: 'flex', gap: 4, padding: '3px',
            background: 'var(--bg-elevated)', borderRadius: 8,
          }}>
            {['all', 'Cơ bản', 'Trung bình', 'Nâng cao'].map(l => (
              <button key={l} onClick={() => setFilter(filter === l ? null : l)}
                style={{
                  padding: '4px 10px', borderRadius: 6, fontSize: 10, fontWeight: 600,
                  background: filter === l ? 'var(--brand-subtle)' : 'transparent',
                  border: `1px solid ${filter === l ? 'var(--brand-primary)' : 'transparent'}`,
                  color: filter === l ? 'var(--brand-primary)' : 'var(--text-muted)',
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>{l === 'all' ? 'Tất cả' : l}</button>
            ))}
          </div>
          <button onClick={onExit}
            style={{
              padding: '6px 14px', borderRadius: 8,
              border: '1px solid var(--border-default)',
              background: 'transparent', color: 'var(--text-muted)',
              fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
            }}>✕</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {MISTAKES.filter(m => !filter || filter === 'all' || m.level === filter).map((m, i) => (
            <MistakeCard key={m.id} mistake={m} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
