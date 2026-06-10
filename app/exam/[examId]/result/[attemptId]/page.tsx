'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Trophy, Clock, Target, ArrowRight, RotateCcw, 
  Share2, CheckCircle2, XCircle, AlertCircle, 
  BarChart3, PieChart, Layout 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ExamResultPage({ params }: { params: Promise<{ examId: string, attemptId: string }> }) {
  const resolvedParams = use(params);
  const { examId, attemptId } = resolvedParams;

  // Mock data matching Mega Prompt examples
  const [result, setResult] = useState({
    score: 85,
    total: 100,
    correctCount: 17,
    wrongCount: 2,
    blankCount: 1,
    timeSpent: "23 phút 15 giây",
    rank: 5,
    passScore: 50,
    topics: [
      { name: "CPU & Mainboard", score: 9, total: 10 },
      { name: "RAM & Storage", score: 6, total: 10 },
      { name: "GPU & PSU", score: 7, total: 10 }
    ]
  });

  const isPassed = result.score >= result.passScore;
  
  const getGrade = (score: number) => {
    if (score >= 90) return { label: "Xuất sắc", color: "#00d2a0" };
    if (score >= 80) return { label: "Giỏi", color: "#00b4d8" };
    if (score >= 65) return { label: "Khá", color: "#f59e0b" };
    if (score >= 50) return { label: "Trung bình", color: "#94a3b8" };
    return { label: "Yếu", color: "#ef4444" };
  };

  const grade = getGrade(result.score);

  useEffect(() => {
    if (isPassed) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
    }
  }, [isPassed]);

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* HERO SECTION */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative overflow-hidden rounded-[40px] p-10 text-center border-2 transition-colors duration-1000
            ${isPassed ? 'bg-[#00d2a0]/5 border-[#00d2a0]/30 shadow-[0_0_50px_rgba(0,210,160,0.1)]' : 'bg-red-500/5 border-red-500/30'}
          `}
        >
          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className={`w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-2xl
                ${isPassed ? 'bg-[#00d2a0] text-black' : 'bg-red-500 text-white'}
              `}
            >
              {isPassed ? <Trophy size={40} /> : <AlertCircle size={40} />}
            </motion.div>

            <h1 className="text-3xl md:text-5xl font-black mb-4">
              {isPassed ? '🎉 Chúc mừng bạn đã qua!' : '💪 Tiếc quá! Hãy thử lại!'}
            </h1>
            
            {/* Circular Progress Ring */}
            <div className="relative w-48 h-48 mx-auto my-10 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="96" cy="96" r="88"
                  className="stroke-[#1e293b]"
                  strokeWidth="12"
                  fill="transparent"
                />
                <motion.circle
                  cx="96" cy="96" r="88"
                  stroke={grade.color}
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={552}
                  initial={{ strokeDashoffset: 552 }}
                  animate={{ strokeDashoffset: 552 - (552 * result.score) / 100 }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black">{result.score}</span>
                <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">Điểm số</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6">
              <Badge icon={<CheckCircle2 size={16} />} label="Xếp loại" value={grade.label} color={grade.color} />
              <Badge icon={<Clock size={16} />} label="Thời gian" value={result.timeSpent} color="#94a3b8" />
              <Badge icon={<Trophy size={16} />} label="Xếp hạng" value={`Top ${result.rank} lớp 🏆`} color="#f59e0b" />
            </div>
          </div>

          {/* Background Decorative Circles */}
          <div className={`absolute top-0 right-0 w-64 h-64 blur-[100px] -translate-y-1/2 translate-x-1/2 opacity-20
            ${isPassed ? 'bg-[#00d2a0]' : 'bg-red-500'}
          `}></div>
        </motion.section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* STATS BREAKDOWN (Donut Chart) */}
          <motion.section 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#16213e] p-8 rounded-[32px] border border-[#1e293b]"
          >
            <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
              <PieChart size={20} className="text-[#00d2a0]" /> Thống kê chi tiết
            </h2>
            
            <div className="flex items-center justify-around gap-4">
               {/* Simple SVG Donut */}
               <div className="relative w-40 h-40">
                 <svg className="w-full h-full -rotate-90">
                    {/* Correct */}
                    <circle cx="80" cy="80" r="70" stroke="#00d2a0" strokeWidth="20" fill="transparent" strokeDasharray="440" strokeDashoffset="0" />
                    {/* Wrong - Mocking offset */}
                    <circle cx="80" cy="80" r="70" stroke="#ef4444" strokeWidth="20" fill="transparent" strokeDasharray="440" strokeDashoffset="360" />
                    {/* Blank */}
                    <circle cx="80" cy="80" r="70" stroke="#475569" strokeWidth="20" fill="transparent" strokeDasharray="440" strokeDashoffset="420" />
                 </svg>
               </div>

               <div className="space-y-4">
                 <LegendItem color="#00d2a0" label="Đúng" value={result.correctCount} />
                 <LegendItem color="#ef4444" label="Sai" value={result.wrongCount} />
                 <LegendItem color="#475569" label="Bỏ trống" value={result.blankCount} />
               </div>
            </div>
          </motion.section>

          {/* TOPIC BREAKDOWN */}
          <motion.section 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#16213e] p-8 rounded-[32px] border border-[#1e293b]"
          >
            <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
              <BarChart3 size={20} className="text-[#00b4d8]" /> Điểm theo chủ đề
            </h2>
            <div className="space-y-6">
              {result.topics.map((topic, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span>{topic.name}</span>
                    <span className="text-[#00d2a0]">{topic.score}/{topic.total}</span>
                  </div>
                  <div className="h-3 w-full bg-[#0f0f1a] rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(topic.score / topic.total) * 100}%` }}
                      transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                      className="h-full bg-gradient-to-r from-[#00b4d8] to-[#00d2a0]"
                    ></motion.div>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

        </div>

        {/* ACTIONS */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-10"
        >
          <Link href={`/exam/${examId}`} className="w-full sm:w-auto px-8 py-4 bg-[#16213e] border border-[#1e293b] text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-[#1e293b] transition-colors">
            <RotateCcw size={20} /> Làm lại bài thi
          </Link>
          <Link href="/lessons" className="w-full sm:w-auto px-8 py-4 bg-[#00d2a0] text-black font-bold rounded-2xl flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(0,210,160,0.3)] transition-all">
            Học bài tiếp theo <ArrowRight size={20} />
          </Link>
          <button className="w-full sm:w-auto px-8 py-4 bg-[#0f0f1a] border border-[#1e293b] text-slate-400 font-bold rounded-2xl flex items-center justify-center gap-2 hover:text-white transition-colors">
            <Share2 size={20} /> Chia sẻ kết quả
          </button>
        </motion.div>

      </div>
    </div>
  );
}

function Badge({ icon, label, value, color }: { icon: any, label: string, value: string, color: string }) {
  return (
    <div className="flex items-center gap-3 bg-[#0f0f1a] px-5 py-3 rounded-2xl border border-[#1e293b]">
      <div style={{ color: color }}>{icon}</div>
      <div className="text-left">
        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{label}</div>
        <div className="font-bold text-sm" style={{ color: color }}>{value}</div>
      </div>
    </div>
  );
}

function LegendItem({ color, label, value }: { color: string, label: string, value: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-3 h-3 rounded-full" style={{ background: color }}></div>
      <span className="text-slate-400 font-medium text-sm w-20">{label}</span>
      <span className="font-bold text-white">{value}</span>
    </div>
  );
}
