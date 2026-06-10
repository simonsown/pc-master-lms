'use client'

import React from 'react'
import { Award, Download, Share2, ShieldCheck, CheckCircle2, Star, Calendar, User, Search, Filter } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { motion } from 'framer-motion'

export default function CertificatesPage() {
  const certificates = [
    {
      id: 'cert-1',
      title: 'Chuyên gia Lắp ráp PC Cơ bản',
      date: '10/05/2026',
      issuer: 'PC Master Academy',
      grade: 'Xuất sắc',
      image: 'https://img.freepik.com/free-vector/professional-certificate-template-with-golden-seal_23-2148202350.jpg?w=800'
    },
    {
      id: 'cert-2',
      title: 'Làm chủ Kỹ thuật Tản nhiệt',
      date: '02/04/2026',
      issuer: 'PC Master Academy',
      grade: 'Giỏi',
      image: 'https://img.freepik.com/free-vector/modern-certificate-template-with-abstract-shapes_23-2148202353.jpg?w=800'
    }
  ]

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white">
      <Navbar />

      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Chứng chỉ & <span className="text-[#00d2a0]">Huy hiệu</span></h1>
          <p className="text-slate-400">Nơi lưu giữ những nỗ lực và thành quả học tập của bạn.</p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#16213e] p-8 rounded-3xl border border-[#1e293b] flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-[#00d2a0]/10 text-[#00d2a0] flex items-center justify-center">
              <Award size={32} />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium">Chứng chỉ đã đạt</p>
              <p className="text-3xl font-black">{certificates.length}</p>
            </div>
          </div>
          <div className="bg-[#16213e] p-8 rounded-3xl border border-[#1e293b] flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center">
              <Star size={32} />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium">Huy hiệu đã mở</p>
              <p className="text-3xl font-black">12</p>
            </div>
          </div>
          <div className="bg-[#16213e] p-8 rounded-3xl border border-[#1e293b] flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <ShieldCheck size={32} />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium">Thứ hạng toàn khóa</p>
              <p className="text-3xl font-black">TOP 5%</p>
            </div>
          </div>
        </div>

        {/* CERTIFICATES GRID */}
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
          <CheckCircle2 size={24} className="text-[#00d2a0]" /> Chứng chỉ số
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          {certificates.map((cert, idx) => (
            <motion.div 
              key={cert.id}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#16213e] border border-[#1e293b] rounded-3xl overflow-hidden hover:border-[#00d2a0]/30 transition-all group"
            >
              <div className="aspect-[16/10] relative">
                <img src={cert.image} alt={cert.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                  <button className="p-4 bg-white text-black rounded-full hover:scale-110 transition-transform">
                    <Download size={24} />
                  </button>
                  <button className="p-4 bg-[#00d2a0] text-black rounded-full hover:scale-110 transition-transform">
                    <Share2 size={24} />
                  </button>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-xl font-bold mb-4">{cert.title}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Calendar size={16} /> <span>Ngày cấp: {cert.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <User size={16} /> <span>Xếp loại: {cert.grade}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* BADGES SECTION */}
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
          <Star size={24} className="text-yellow-500" /> Huy hiệu thành tựu
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
            <div key={i} className={`p-6 rounded-3xl border flex flex-col items-center text-center transition-all ${
              i <= 8 
                ? 'bg-[#16213e] border-[#1e293b] hover:border-yellow-500/50' 
                : 'bg-[#0f0f1a] border-[#1e293b] opacity-40 grayscale'
            }`}>
              <div className={`w-16 h-16 rounded-full mb-4 flex items-center justify-center ${
                i <= 8 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-slate-800 text-slate-600'
              }`}>
                <Award size={32} />
              </div>
              <p className="text-sm font-bold mb-1">{i <= 8 ? 'Thợ Máy' : 'Khóa'}</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Level {i}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
