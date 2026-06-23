'use client';

import { useState } from 'react';

const MISTAKES = [
  {
    id: 'ram', title: 'Máy không nhận RAM', videoId: 'SYCCvVFClXo',
    level: 'Cơ bản', time: '2-5 phút',
    summary: 'RAM chưa được cắm đúng cách hoặc không tương thích với mainboard.',
    reasons: ['RAM chưa được ấn mạnh xuống hết — ngàm nhựa hai đầu chưa bật lên', 'RAM cắm sai khe — cần cắm theo thứ tự A2-B2 (khe thứ 2 và thứ 4 tính từ CPU)', 'RAM không tương thích — không nằm trong QVL của mainboard', 'Bụi bẩn trong khe cắm RAM — vệ sinh bằng cồn isopropyl', 'Chân RAM bị cong hoặc gãy'],
    fixes: ['Tháo ra và cắm lại, ấn mạnh đến khi nghe "tách"', 'Cắm vào khe A2 (thứ 2 từ CPU) nếu chỉ 1 thanh', 'Kiểm tra QVL trên trang chủ của mainboard', 'Dùng tẩy chì hoặc cồn lau nhẹ chân RAM'],
    Icon: '🧠', color: '#6366f1',
  },
  {
    id: 'display', title: 'Màn hình không lên', videoId: 'rfmgTuR7Hls',
    level: 'Cơ bản', time: '3-10 phút',
    summary: 'Máy khởi động (quạt quay, đèn sáng) nhưng màn hình đen — không có tín hiệu.',
    reasons: ['Cắm dây màn hình vào cổng HDMI/VGA trên mainboard thay vì GPU', 'RAM chưa cắm chặt — nguyên nhân số 1 gây màn hình đen', 'Nguồn điện không đủ — PSU quá yếu hoặc chưa cắm dây CPU 8-pin', 'Card đồ họa chưa cắm nguồn PCIe', 'BIOS chưa hỗ trợ CPU mới — cần update BIOS'],
    fixes: ['Cắm dây vào GPU (card rời) — KHÔNG cắm vào mainboard nếu có card rời', 'Tháo RAM lau sạch chân, cắm lại nghe "tách"', 'Kiểm tra tất cả dây nguồn đã cắm chặt chưa', 'Reset CMOS bằng jumper pin hoặc tháo pin CMOS 5 phút'],
    Icon: '🖥️', color: '#f59e0b',
  },
  {
    id: 'assembly', title: 'Sai kỹ thuật lắp ráp', videoId: 'CrIxH6El3TQ',
    level: 'Trung bình', time: '5-15 phút',
    summary: 'Các lỗi phổ biến khi lắp ráp: không gắn IO shield, cắm RAM sai khe, cắm dây HDMI vào mainboard.',
    reasons: ['Quên gắn IO shield trước khi bắt vít mainboard', 'Cắm RAM vào sai khe (A1-A2 thay vì A2-B2)', 'Cắm dây màn hình vào mainboard khi có card đồ họa rời', 'Không bôi keo tản nhiệt hoặc bôi quá nhiều', 'Gắn cooler không đều — một bên chặt một bên lỏng'],
    fixes: ['Luôn gắn IO shield TRƯỚC khi bắt mainboard vào case', 'Cắm RAM vào khe thứ 2 và thứ 4 tính từ CPU (A2-B2)', 'Cắm dây màn hình vào GPU, không cắm vào mainboard', 'Bôi keo tản nhiệt cỡ hạt đậu — không cần trét đều', 'Siết ốc cooler theo hình chữ X, mỗi lần 1-2 vòng'],
    Icon: '🔧', color: '#ef4444',
  },
  {
    id: 'psu', title: 'Lỗi nguồn và hiển thị', videoId: 'Q8LHfWZwChE',
    level: 'Trung bình', time: '10-30 phút',
    summary: 'Lỗi liên quan đến PSU, VGA, RAM, CPU, BIOS — máy không khởi động hoặc khởi động không ổn định.',
    reasons: ['PSU không đủ công suất cho hệ thống', 'Dây nguồn cắm chưa chặt — đặc biệt dây CPU 8-pin và PCIe', 'Card đồ họa bị lỗi hoặc chưa cắm nguồn phụ', 'BIOS cũ không hỗ trợ CPU đời mới', 'Chập điện do mainboard chạm case (thiếu standoff)'],
    fixes: ['Tính toán TDP tổng và chọn PSU dư 20-30% công suất', 'Cắm lại tất cả dây nguồn, ấn đến khi nghe "click"', 'Kiểm tra GPU ở máy khác nếu có thể', 'Cập nhật BIOS lên phiên bản mới nhất', 'Kiểm tra standoff — mainboard không được chạm trực tiếp vào case'],
    Icon: '⚡', color: '#f97316',
  },
  {
    id: 'compatibility', title: 'Linh kiện không tương thích', videoId: '0L7SBpZXnsE',
    level: 'Nâng cao', time: '30-60 phút',
    summary: 'CPU không tương thích socket/chipset, RAM không đúng chuẩn, nguồn quá yếu cho GPU.',
    reasons: ['CPU không tương thích socket — Intel LGA1700 ≠ AMD AM5', 'Chipset mainboard không hỗ trợ CPU — cần update BIOS hoặc đổi main', 'RAM DDR4 không cắm được vào khe DDR5 và ngược lại', 'Nguồn không đủ cho GPU — RTX 4090 cần tối thiểu 850W', 'Case quá nhỏ không vừa GPU dài hoặc tản nhiệt cao'],
    fixes: ['Kiểm tra socket mainboard trước khi mua CPU: LGA1700 cho Intel 12-14th, AM5 cho AMD Ryzen 7000+', 'Dùng PC Part Picker để kiểm tra tương thích', 'Chọn RAM đúng thế hệ: DDR5 cho AM5/LGA1700, DDR4 cho AM4/LGA1200', 'Tính TDP tổng + 20-30% để chọn PSU', 'Check kích thước case: max GPU length & CPU cooler height'],
    Icon: '🔗', color: '#8b5cf6',
  },
  {
    id: 'ssd', title: 'Máy không phát hiện SSD', videoId: 'XXSof_YH85s',
    level: 'Cơ bản', time: '5-15 phút',
    summary: 'SSD không xuất hiện trong BIOS hoặc Windows — do chưa format, chưa kết nối đúng, hoặc ổ lỗi.',
    reasons: ['SSD M.2 chưa cắm chặt hoặc cắm sai khe (dùng chung lane với SATA)', 'SSD chưa được khởi tạo trong Disk Management', 'SSD không được set làm boot drive trong BIOS', 'Cáp SATA lỏng hoặc hỏng (với SSD 2.5")', 'Driver NVMe chưa được cài — đặc biệt trên Windows 10 cũ'],
    fixes: ['Vào Disk Management → chuột phải → Initialize Disk', 'Vào BIOS → Boot Order → chọn SSD làm ưu tiên 1', 'Rút ra cắm lại SSD M.2, thử khe M.2 khác', 'Cài driver NVMe từ trang chủ của hãng'],
    Icon: '💾', color: '#06b6d4',
  },
  {
    id: 'wrongbuild', title: 'Lắp ráp sai cách', videoId: '0L7SBpZXnsE',
    level: 'Trung bình', time: '10-30 phút',
    summary: 'Quy trình lắp ráp không đúng thứ tự dẫn đến hỏng linh kiện hoặc không hoạt động.',
    reasons: ['Lắp mainboard vào case trước khi gắn CPU + RAM + cooler — khó thao tác', 'Quên gắn standoff — mainboard chập case gây chết máy', 'Siết ốc quá chặt — hỏng PCB, nứt mainboard', 'Không kiểm tra trước ngoài case (bench test)', 'Cắm dây front panel sai cực tính'],
    fixes: ['Lắp CPU → RAM → Cooler → SSD → Kiểm tra ngoài case TRƯỚC', 'Bench test: lắp tối thiểu CPU + 1 RAM + GPU trên hộp carton', 'Siết ốc vừa tay — nếu thấy căng là đủ', 'Xem hướng dẫn trong sách mainboard trước khi lắp', 'Cực dương (+, PWR) thường ở bên trái, cực âm (-, GND) bên phải'],
    Icon: '🏗️', color: '#14b8a6',
  },
  {
    id: 'wiring', title: 'Cách cắm dây đúng khi build PC', videoId: 'xT36IDSQBX4',
    level: 'Trung bình', time: '15-45 phút',
    summary: 'Cắm dây sai thứ tự/sai vị trí dẫn đến không khởi động hoặc chập cháy.',
    reasons: ['Cắm dây nguồn CPU 8-pin vào GPU PCIe — có thể gây cháy', 'Cắm dây front panel sai cực hoặc sai chân', 'Dây SATA cắm ngược — có thể hỏng ổ cứng', 'Dây USB 3.0 cắm lệch chân — cong chân trên mainboard', 'Dây HD Audio cắm sai vị trí — mất âm thanh mặt trước'],
    fixes: ['Dây CPU 8-pin có ghi "CPU" — dây PCIe có ghi "PCIe" hoặc "VGA"', 'Xem sơ đồ chân front panel trong sách mainboard — mỗi hãng khác nhau', 'Dây SATA có ngàm chống cắm ngược — không dùng lực', 'USB 3.0 có lỗ khuyết ở 1 góc — căn đúng trước khi ấn', 'HD Audio có chân thiếu ở hàng thứ 2 — dùng làm mốc định vị'],
    Icon: '🔌', color: '#22c55e',
  },
];

const LEVEL_COLORS = {
  'Cơ bản': '#6366f1',
  'Trung bình': '#f59e0b',
  'Nâng cao': '#ef4444',
};

function MistakeCard({ mistake }) {
  const [showVideo, setShowVideo] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  return (
    <div
      onMouseEnter={() => setShowDetail(true)}
      onMouseLeave={() => setShowDetail(false)}
      style={{
        background: 'var(--bg-surface)',
        border: `1px solid ${showDetail ? mistake.color + '44' : 'var(--border-default)'}`,
        borderRadius: '14px', overflow: 'hidden',
        transition: 'all 0.3s ease', cursor: 'default',
        position: 'relative',
      }}>
      {/* Header row */}
      <div style={{ display: 'flex', gap: '14px', padding: '16px 18px', alignItems: 'center' }}>
        <div style={{
          width: '42px', height: '42px', borderRadius: '12px',
          background: `${mistake.color}15`, display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0,
          transition: 'transform 0.3s', transform: showDetail ? 'scale(1.1)' : 'scale(1)',
        }}>
          {mistake.Icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{mistake.title}</span>
            <span style={{
              fontSize: '9px', fontWeight: 700, padding: '2px 10px', borderRadius: '99px',
              background: `${LEVEL_COLORS[mistake.level]}15`, color: LEVEL_COLORS[mistake.level],
            }}>{mistake.level}</span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>⏱ {mistake.time}</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0', lineHeight: '1.5' }}>
            {mistake.summary}
          </p>
        </div>
        <div style={{
          width: '160px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden',
          position: 'relative',
        }}>
          {showVideo ? (
            <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000' }}>
              <iframe
                src={`https://www.youtube.com/embed/${mistake.videoId}?autoplay=1&rel=0`}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                allow="autoplay; encrypted-media" allowFullScreen
              />
            </div>
          ) : (
            <div onClick={() => setShowVideo(true)} style={{
              position: 'relative', width: '100%', aspectRatio: '16/9', cursor: 'pointer',
              background: 'linear-gradient(135deg, #1a1a2e, #16213e)', borderRadius: '8px', overflow: 'hidden',
            }}>
              <img src={`https://img.youtube.com/vi/${mistake.videoId}/hqdefault.jpg`}
                alt={mistake.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,0.25)',
              }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: '#fff' }}>
                  ▶
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail expand */}
      <div style={{
        maxHeight: showDetail ? '300px' : '0', opacity: showDetail ? 1 : 0,
        transition: 'all 0.35s ease', overflow: 'hidden', borderTop: showDetail ? '1px solid var(--border-subtle)' : 'none',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', padding: '14px 18px' }}>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: mistake.color, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>❌</span> Nguyên nhân
            </div>
            <ul style={{ margin: 0, padding: '0 0 0 16px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {mistake.reasons.map((r, i) => (
                <li key={i} style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{r}</li>
              ))}
            </ul>
          </div>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#22c55e', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>✅</span> Cách khắc phục
            </div>
            <ul style={{ margin: 0, padding: '0 0 0 16px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {mistake.fixes.map((f, i) => (
                <li key={i} style={{ fontSize: '11px', color: '#22c55e', lineHeight: '1.5' }}>{f}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CommonMistakes({ lang = 'vn', onExit }) {
  const [search, setSearch] = useState('');

  const filtered = MISTAKES.filter(m =>
    !search || m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.summary.toLowerCase().includes(search.toLowerCase()) ||
    m.level.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'var(--bg-base)', display: 'flex', flexDirection: 'column',
      fontFamily: 'system-ui, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 24px', borderBottom: '1px solid var(--border-default)',
        background: 'var(--bg-surface)', flexShrink: 0,
      }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
              ⚠️
            </div>
            <div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)' }}>Lỗi Thường Gặp</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{MISTAKES.length} lỗi — di chuột vào để xem chi tiết</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              placeholder="Tìm lỗi..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border-default)',
                background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: '13px',
                fontFamily: 'inherit', outline: 'none', width: '200px',
              }}
            />
            <button onClick={onExit} style={{
              padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border-default)',
              background: 'transparent', color: 'var(--text-muted)', fontSize: '14px', cursor: 'pointer',
              fontFamily: 'inherit',
            }}>✕</button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 24px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '14px' }}>
              Không tìm thấy lỗi nào phù hợp với "{search}"
            </div>
          ) : (
            filtered.map((m, i) => (
              <div key={m.id} style={{ animation: `fadeUp 0.3s ease-out ${i * 0.05}s both` }}>
                <MistakeCard mistake={m} />
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
