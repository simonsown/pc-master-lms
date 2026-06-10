'use client';

import React from 'react';
import { Award, Download, Share2, ShieldCheck, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface CertificateProps {
  courseName: string;
  issueDate: string;
  verificationCode: string;
  studentName: string;
}

export default function CertificateCard({ courseName, issueDate, verificationCode, studentName }: CertificateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-panel p-8 border-brand-primary/30 relative overflow-hidden group hover:border-brand-primary transition-all"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-brand-primary/10 transition-colors"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-primary/5 rounded-full -ml-12 -mb-12 blur-2xl"></div>

      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex justify-between items-start">
          <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20 shadow-[0_0_20px_rgba(0,243,255,0.1)]">
            <Award size={32} />
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-brand-primary uppercase tracking-[2px]">Mã xác thực</p>
            <p className="text-xs font-mono text-text-muted">{verificationCode}</p>
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-black text-white mb-2">{courseName}</h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            Chứng nhận <span className="text-white font-bold">{studentName}</span> đã hoàn thành xuất sắc lộ trình đào tạo và các bài kiểm tra đánh giá.
          </p>
        </div>

        <div className="flex items-center gap-6 py-4 border-y border-white/5">
           <div className="flex items-center gap-2">
              <Calendar size={14} className="text-brand-primary" />
              <span className="text-xs text-text-muted">Ngày cấp: <strong>{new Date(issueDate).toLocaleDateString('vi-VN')}</strong></span>
           </div>
           <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-green" />
              <span className="text-xs text-text-muted">Trạng thái: <strong className="text-green">Hợp lệ</strong></span>
           </div>
        </div>

        <div className="flex gap-4">
          <button className="flex-1 py-3 bg-brand-primary text-black rounded-xl font-black text-xs uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg">
            <Download size={14} /> Tải PDF
          </button>
          <button className="px-4 py-3 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-all flex items-center justify-center">
            <Share2 size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
