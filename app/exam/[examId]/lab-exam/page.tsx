'use client'

import { useState, useCallback, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import RawGameEngine from '@/components/GameEngine'
const GameEngine = RawGameEngine as any;
import dynamic from 'next/dynamic'
const HandTracker = dynamic(
  () => import('@/components/HandTracker'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center gap-2 text-sm text-[#5a5d72]">
        <div className="w-4 h-4 border-2 border-[#00d4aa] border-t-transparent rounded-full animate-spin" />
        Đang tải Hand Tracking...
      </div>
    )
  }
)
import VirtualAssistant from '@/components/VirtualAssistant'
import { useGuru } from '@/lib/guru-state'
import { GURU_MESSAGES } from '@/utils/i18nData'
import { Timer, Send, AlertCircle, Info, ChevronLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { submitExamAttempt } from '@/lib/exam-actions'

export default function LabExamPage({ params }: { params: Promise<{ examId: string }> }) {
  const resolvedParams = use(params);
  const { examId } = resolvedParams;
  const router = useRouter();

  // 1. Exam State
  const [timeLeft, setTimeLeft] = useState(1800); // 30 phút
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [landmarks, setLandmarks] = useState([]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const guru = useGuru();

  // 2. Mission Data (Mocked from Mega Prompt Scenario)
  const [missionData] = useState({
    missionId: "Lắp ráp PC Văn Phòng",
    scenario: "Hãy lắp ráp một bộ máy tính văn phòng với ngân sách 15 triệu VNĐ. Yêu cầu: Hoạt động ổn định, tiết kiệm điện và đủ sức mạnh chạy các tác vụ Office.",
    budget: 15000000,
    purchasedItems: [
        { id: 1, name: "Core i3-12100", type: "CPU", price: 3000000, power: 65, socket: "LGA1700" },
        { id: 2, name: "H610M-K", type: "Mainboard", price: 2500000, socket: "LGA1700" },
        { id: 3, name: "RAM 8GB DDR4", type: "RAM", price: 800000, power: 5 },
        { id: 4, name: "RAM 8GB DDR4", type: "RAM", price: 800000, power: 5 },
        { id: 5, name: "SSD 500GB NVMe", type: "SSD", price: 1200000, power: 10 },
        { id: 6, name: "PSU 450W 80 Plus", type: "PSU", price: 1000000, wattage: 450 },
        { id: 7, name: "Stock Cooler", type: "COOLER", price: 0, power: 0 }
    ],
    targets: { minPower: 50 }
  });

  // 3. Timer Logic
  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    if (timeLeft <= 0) handleSubmit();
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  // 4. Handle Game Events (Tái sử dụng logic chấm điểm của bạn)
  const handleGameEvent = useCallback((event: string, type: string) => {
    if (event === 'grabbed') {
      guru.setMessage(`Bạn đang cầm: ${type}`);
    } else if (event === 'placed') {
      guru.setMessage(`Đã lắp xong: ${type}. Tiếp tục nào!`);
    } else if (event === 'COMPLETE') {
      guru.setMessage("Hệ thống đã được lắp ráp hoàn tất! Hãy kiểm tra lại và nhấn Nộp bài.");
    }
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Logic chấm điểm tự động (Bê từ builder/page.js của bạn)
    let totalTDP = 0, psuWattage = 0;
    missionData.purchasedItems.forEach(item => {
      if (item.power) totalTDP += item.power;
      if (item.wattage) psuWattage += item.wattage;
    });

    let score = 100;
    if (psuWattage < totalTDP + 50) score -= 30; // Nguồn yếu
    // Thêm các tiêu chí chấm điểm khác tại đây...

    // Nộp bài (Sử dụng server action chung)
    const res = await submitExamAttempt("dummy_attempt_id", {}, score, 1800 - timeLeft);
    if (res.success) {
       router.push(`/exam/${examId}/result/dummy_attempt_id`);
    } else {
       alert("Lỗi nộp bài!");
       setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-20 bg-[#16213e] border-b border-[#1e293b] flex items-center justify-between px-8 z-50">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-black uppercase tracking-wider">{missionData.missionId}</h1>
            <div className="flex items-center gap-2 text-xs text-[#00d2a0] font-bold">
               <Timer size={14} /> Thời gian còn lại: {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <button 
             onClick={() => setIsCameraActive(!isCameraActive)}
             className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all
               ${isCameraActive ? 'bg-[#00d2a0]/10 border-[#00d2a0] text-[#00d2a0]' : 'bg-slate-800 border-slate-700 text-slate-400'}
             `}
           >
             {isCameraActive ? 'Tắt Webcam Tracking' : 'Bật Webcam Tracking'}
           </button>
           <button 
             onClick={handleSubmit}
             disabled={isSubmitting}
             className="px-8 py-2.5 bg-[#00d2a0] text-black font-black rounded-xl hover:shadow-[0_0_20px_rgba(0,210,160,0.4)] transition-all disabled:opacity-50"
           >
             {isSubmitting ? 'Đang nộp...' : 'Nộp bài thi'}
           </button>
        </div>
      </header>

      <div className="flex-1 flex relative">
        {/* Scenario Info */}
        <div className="absolute top-6 left-6 z-10 w-80">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-[#16213e]/80 backdrop-blur-md p-6 rounded-3xl border border-[#1e293b] shadow-2xl"
          >
            <h3 className="text-sm font-black text-[#00d2a0] uppercase tracking-widest mb-3 flex items-center gap-2">
              <Info size={16} /> Yêu cầu đề bài
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed italic">
              "{missionData.scenario}"
            </p>
            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-end">
               <div>
                 <div className="text-[10px] text-slate-500 font-bold uppercase">Ngân sách</div>
                 <div className="text-lg font-black text-white">{missionData.budget.toLocaleString()}đ</div>
               </div>
               <div className="text-right">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Linh kiện</div>
                  <div className="text-lg font-black text-[#00d2a0]">{missionData.purchasedItems.length}</div>
               </div>
            </div>
          </motion.div>
        </div>

        {/* The 2D Lab Canvas (Reusing your GameEngine) */}
        <main className="flex-1 flex items-center justify-center bg-black/40">
           <div className="relative w-full max-w-[1400px] aspect-[14/8]">
              <GameEngine 
                landmarks={landmarks}
                onGameEvent={handleGameEvent}
                purchasedItems={missionData.purchasedItems}
              />
              
              {/* Camera Feed Integrated */}
              {isCameraActive && (
                <div className="absolute bottom-6 right-6 w-64 p-2 bg-[#16213e] rounded-2xl border border-white/10 shadow-2xl">
                   <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <HandTracker onLandmarks={setLandmarks} />
                   </div>
                </div>
              )}
           </div>
        </main>
      </div>

    </div>
  )
}
