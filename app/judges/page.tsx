'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';

const sections = [
  {
    icon: '🎯', title: 'Tổng Quan Dự Án',
    content: `PC Master Builder là nền tảng giáo dục trực tuyến giúp học sinh THPT học và thực hành lắp ráp máy tính thông qua mô phỏng 2D trực quan kết hợp với trí tuệ nhân tạo (AI). Dự án được phát triển bởi đội ngũ One Mission Team, hướng đến giải quyết bài toán thiếu hụt thiết bị thực hành trong các trường học.`
  },
  {
    icon: '🧠', title: 'Công Nghệ & AI',
    content: `Ứng dụng AI Guru (Google Gemini) làm trợ giảng ảo 24/7. Hệ thống RAG (Retrieval-Augmented Generation) với kiến thức phần cứng chuyên sâu. Machine Learning hỗ trợ gợi ý cấu hình PC tối ưu theo ngân sách và nhu cầu.`
  },
  {
    icon: '🖥️', title: 'Mô Phỏng Lắp Ráp 2D',
    content: `Phòng Lab 2D với đồ họa chi tiết từng linh kiện (CPU, RAM, GPU, PSU...). Cơ chế kéo-thả trực quan, tự động snap vào socket. Tính toán TDP thời gian thực. Kiểm tra tương thích socket & kích thước. Hiệu ứng hoạt ảnh sống động (RGB, quạt quay).`
  },
  {
    icon: '👐', title: 'Hand Tracking (Webcam)',
    content: `Tích hợp MediaPipe Hands cho phép điều khiển bằng cử chỉ tay qua webcam. Chạm ngón cái và ngón trỏ để nắm, kéo thả linh kiện. Công nghệ hỗ trợ học sinh khiếm khuyết hoặc trải nghiệm tương tác thực tế ảo.`
  },
  {
    icon: '🏪', title: 'Chợ Máy Tính',
    content: `Học sinh tích lũy ngân sách từ điểm quiz và bài tập. Vào chợ mua linh kiện yêu thích. Hệ thống kiểm tra tương thích linh kiện tự động (socket, RAM type, TDP). Giỏ hàng thông minh, thanh toán và mang ra phòng lab lắp ráp.`
  },
  {
    icon: '📝', title: 'Hệ Thống Quiz & Bài Tập',
    content: `250+ câu hỏi trắc nghiệm chia theo 25 chủ đề (CPU, RAM, GPU, PSU, Mainboard...). Phân loại độ khó (Dễ, Trung bình, Khó). Lộ trình học tập 5 cấp độ. Hệ thống tính điểm và lưu lịch sử.`
  },
  {
    icon: '📊', title: 'Bảng Điều Khiển',
    content: `Dashboard dành riêng cho Giáo viên: tạo lớp học, giao bài tập, theo dõi tiến độ. Dashboard Học sinh: xem điểm, thành tích, lộ trình học tập. Phụ huynh: giám sát kết quả học tập của con.`
  },
  {
    icon: '🔬', title: 'Thi Cử & Chứng Chỉ',
    content: `Hệ thống thi trực tuyến với giám thị ảo (Proctored Exam) qua webcam. Thi phòng Lab: lắp ráp PC theo yêu cầu. Tự động chấm điểm và cấp chứng chỉ hoàn thành (PDF/Blockchain).`
  },
  {
    icon: '🎮', title: 'Tính Năng Khác',
    content: `Chế độ 2 người chơi (Multiplayer): thi lắp ráp nhanh. Mô phỏng Windows 11 sau khi build xong PC. Cửa hàng linh kiện với 47+ sản phẩm chi tiết. AI Guru tư vấn cấu hình theo nhu cầu.`
  },
  {
    icon: '⚙️', title: 'Công Nghệ Kỹ Thuật',
    content: `Frontend: Next.js 16, React 19, TypeScript, Framer Motion, Tailwind CSS. Backend: Supabase (PostgreSQL, Auth, Storage, Realtime). AI: Google Gemini 1.5 Flash. Khác: @dnd-kit (drag-drop), MediaPipe (hand tracking), Recharts (biểu đồ), html2canvas + jspdf (chứng chỉ PDF).`
  },
  {
    icon: '📱', title: 'Triển Khai',
    content: `100% Web-based, không cần cài đặt. Chạy trên mọi trình duyệt hiện đại (Chrome, Edge, Safari). Hỗ trợ đầy đủ trên PC/Laptop. Deploy trên Vercel với CI/CD tự động. Hosting: Vercel Edge Network. Database: Supabase (PostgreSQL).`
  }
];

export default function JudgesPage() {
  const [url, setUrl] = useState('');
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    setUrl(window.location.origin + '/judges');
  }, []);

  return (
    <div style={{
      minHeight: '100vh', background: '#050507', color: '#fff',
      fontFamily: 'var(--font-sans)', overflowX: 'hidden'
    }}>
      {/* Hero */}
      <header style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        padding: '40px 24px', position: 'relative',
        background: 'radial-gradient(ellipse at center, rgba(0,243,255,0.08) 0%, rgba(5,5,7,1) 70%)'
      }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '8px 20px', background: 'rgba(0,243,255,0.1)',
            borderRadius: '100px', color: '#00d4aa', fontSize: '13px',
            fontWeight: 700, marginBottom: '24px', letterSpacing: '1px'
          }}>
            🏆 ONE MISSION TEAM · THPT NGUYỄN CÔNG TRỨ
          </div>
          <h1 style={{
            fontSize: 'clamp(36px, 7vw, 72px)', fontWeight: 900,
            marginBottom: '16px', lineHeight: 1.1, letterSpacing: '-0.04em'
          }}>
            PC Master Builder
          </h1>
          <p style={{
            fontSize: 'clamp(16px, 2.5vw, 24px)', color: '#8899a6',
            maxWidth: '700px', margin: '0 auto 40px', lineHeight: 1.6
          }}>
            Nền tảng giáo dục lắp ráp máy tính thông minh <br />
            với AI và mô phỏng 2D trực quan
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['Sáng Tạo', 'Giáo Dục', 'Công Nghệ', 'Đổi Mới'].map(tag => (
              <span key={tag} style={{
                padding: '8px 18px', borderRadius: '100px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                fontSize: '13px', fontWeight: 600, color: '#8899a6'
              }}>#{tag}</span>
            ))}
          </div>
        </motion.div>

        {/* Floating scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          style={{ position: 'absolute', bottom: '30px' }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{ color: '#8899a6', fontSize: '13px' }}
          >
            ↓ Cuộn xuống để xem thêm
          </motion.div>
        </motion.div>
      </header>

      {/* QR Code Section */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}
        >
          <div style={{
            padding: '24px', background: '#fff', borderRadius: '24px',
            boxShadow: '0 20px 60px rgba(0,243,255,0.15)',
            display: 'inline-flex', position: 'relative'
          }} id="qr-code-container">
            {url && <QRCodeSVG value={url} size={200} level="H" id="qr-code-img" />}
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => {
                const svg = document.getElementById('qr-code-img');
                if (!svg) return;
                const svgData = new XMLSerializer().serializeToString(svg);
                const canvas = document.createElement('canvas');
                canvas.width = 400; canvas.height = 400;
                const ctx = canvas.getContext('2d');
                const img = new Image();
                img.onload = () => {
                  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 400, 400);
                  ctx.drawImage(img, 0, 0, 400, 400);
                  const a = document.createElement('a');
                  a.download = 'pc-master-judges-qr.png';
                  a.href = canvas.toDataURL('image/png');
                  a.click();
                };
                img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
              }}
              style={{
                padding: '12px 24px', background: 'var(--brand-primary)', color: '#fff',
                border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '14px',
                cursor: 'pointer', fontFamily: 'inherit'
              }}
            >
              📥 Tải QR Code
            </button>
            <button
              onClick={() => {
                const text = `PC Master Builder - Nền tảng giáo dục lắp ráp máy tính với AI\nQuét QR hoặc truy cập: ${url}`;
                navigator.clipboard?.writeText(url);
                alert('Đã copy link!');
              }}
              style={{
                padding: '12px 24px', background: 'rgba(255,255,255,0.05)', color: '#fff',
                border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', fontWeight: 600, fontSize: '14px',
                cursor: 'pointer', fontFamily: 'inherit'
              }}
            >
              📋 Copy Link
            </button>
          </div>
          <p style={{ color: '#8899a6', fontSize: '14px', maxWidth: '400px' }}>
            Quét mã QR để xem trang giới thiệu dự án trên thiết bị di động
          </p>
          <div style={{
            padding: '12px 24px', background: 'rgba(255,255,255,0.03)',
            borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)',
            fontSize: '14px', color: 'var(--brand-primary)', fontWeight: 600,
            fontFamily: 'monospace'
          }}>
            {url}
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '60px 24px 100px', maxWidth: '1100px', margin: '0 auto' }}>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ fontSize: '36px', fontWeight: 900, textAlign: 'center', marginBottom: '60px', letterSpacing: '-0.02em' }}
        >
          Giới Thiệu Dự Án
        </motion.h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {sections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setActiveSection(activeSection === i ? -1 : i)}
              style={{
                padding: '24px 28px',
                background: activeSection === i ? 'rgba(0,243,255,0.04)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${activeSection === i ? 'rgba(0,243,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: '16px', cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '28px' }}>{section.icon}</span>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>{section.title}</h3>
                <span style={{ marginLeft: 'auto', color: '#8899a6', fontSize: '13px', transition: 'transform 0.3s', transform: activeSection === i ? 'rotate(180deg)' : 'none' }}>
                  ▼
                </span>
              </div>
              {activeSection === i && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  style={{ color: '#8899a6', fontSize: '15px', lineHeight: 1.7, margin: '16px 0 0 44px' }}
                >
                  {section.content}
                </motion.p>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '80px 24px', background: 'rgba(255,255,255,0.01)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
          {[
            { value: '5000+', label: 'Học sinh', desc: 'Đang sử dụng nền tảng' },
            { value: '50+', label: 'Linh kiện', desc: 'Chi tiết đầy đủ thông số' },
            { value: '250+', label: 'Câu hỏi', desc: 'Trắc nghiệm 25 chủ đề' },
            { value: '100%', label: 'Web-based', desc: 'Không cần cài đặt' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{
                textAlign: 'center', padding: '32px 20px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px'
              }}
            >
              <div style={{ fontSize: '36px', fontWeight: 900, color: 'var(--brand-primary)', marginBottom: '8px' }}>{stat.value}</div>
              <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>{stat.label}</div>
              <div style={{ fontSize: '13px', color: '#8899a6' }}>{stat.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '40px', letterSpacing: '-0.02em' }}>
          Đội Ngũ <span style={{ color: 'var(--brand-primary)' }}>Phát Triển</span>
        </h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
          {[
            { name: 'Nguyễn Phúc Khánh Sơn', role: 'Full-stack Developer' },
            { name: 'Dương Vũ Minh Đức', role: 'Frontend Developer' }
          ].map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{ textAlign: 'center' }}
            >
              <div style={{
                width: '120px', height: '120px', borderRadius: '60px',
                background: 'linear-gradient(135deg, rgba(0,212,170,0.2), rgba(40,156,249,0.2))',
                border: '2px solid rgba(0,243,255,0.2)',
                margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '40px'
              }}>
                {i === 0 ? '👑' : '⚡'}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px' }}>{m.name}</h3>
              <p style={{ color: '#8899a6', fontSize: '13px', margin: 0 }}>{m.role}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px 24px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '13px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <p>One Mission Team · Trường THPT Nguyễn Công Trứ · 97 Quang Trung, Phường 8, Gò Vấp, TP. HCM</p>
        <p style={{ marginTop: '8px' }}>© 2026 PC Master Builder. All rights reserved.</p>
      </footer>
    </div>
  );
}
