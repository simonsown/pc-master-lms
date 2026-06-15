# 🚀 MEGA PROMPT — PC MASTER BUILDER: 5 TÍNH NĂNG ĐỘC LÁO CHO TIN HỌC TRẺ
## Dán toàn bộ prompt này vào Claude/Gemini để tự động sinh và tích hợp mã nguồn vào dự án

---

## 🧠 CONTEXT DỰ ÁN & TECH STACK (AI ĐỌC TRƯỚC)
Bạn đang làm việc với một dự án Next.js 16 (App Router) + React 19 + Tailwind CSS + Supabase.
Mục tiêu là tích hợp 5 tính năng đột phá, mang tính thực tế và tính giáo dục cao (Gamification) để gây ấn tượng mạnh với Ban giám khảo cuộc thi Tin học trẻ:
1. **Chụp hóa đơn - Kiểm tra giá chống chặt chém (Vision AI)**: Quét hóa đơn linh kiện từ ảnh chụp, bóc tách giá tiền và so sánh với database linh kiện (`data/componentsData.json`) hoặc định giá thị trường.
2. **Chẩn đoán PC tự do từ triệu chứng nhập tay (AI Diagnosis)**: Nhập lỗi PC bằng tiếng Việt (máy kêu bíp bíp, màn hình xanh...), AI Gemini chẩn đoán lỗi linh kiện kèm xác suất % và hướng dẫn sửa.
3. **Điều khiển Web Builder bằng giọng nói tiếng Việt (Voice Control)**: Sử dụng Web Speech API nhận diện giọng nói tiếng Việt để lắp/tháo linh kiện trong Builder ảo.
4. **Nghề nghiệp - PC - Từ ước mơ ra cấu hình (Dream PC)**: Gợi ý cấu hình PC tối ưu dựa trên ước mơ nghề nghiệp của học sinh (AI Engineer, Designer 3D...), tự động nạp cấu hình đó vào Builder ảo để thực hành.
5. **Máy tính qua các thời đại (Computer Eras)**: Dòng thời gian lịch sử máy tính tương tác, tích hợp các hình ảnh phần cứng cổ điển có sẵn và mini-game quiz.

*Lưu ý: API Gemini sử dụng endpoint HTTP trực tiếp qua REST API (không dùng SDK) tương tự mẫu dưới đây:*
```typescript
const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const geminiRes = await fetch(
  `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
    })
  }
);
```

---

## 🛠️ CHI TIẾT TỪNG FILE CẦN THÊM VÀ SỬA

### 📸 TÍNH NĂNG 1: Chụp hóa đơn - So sánh giá chống chặt chém
**Mục tiêu**: Thêm trang `/builder/invoice-check` cho phép người dùng tải lên hóa đơn, so sánh giá linh kiện trong hóa đơn với giá thực tế.

#### 1.1. Tạo API Route nhận diện hóa đơn: `app/api/ai/scan-invoice/route.ts`
Hãy tạo API Route này sử dụng mô hình Gemini 1.5 Flash Vision. Nó sẽ nhận file ảnh hóa đơn dưới dạng base64, gửi kèm prompt phân tích sang cấu trúc JSON chứa: tên linh kiện, giá trên hóa đơn, giá thị trường dự kiến (nếu không có trong database) và đánh giá.
```typescript
import { NextRequest, NextResponse } from 'next/server';
import componentsData from '@/data/componentsData.json';

export async function POST(request: NextRequest) {
  try {
    const { imageBase64 } = await request.json();
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API Key chưa cấu hình' }, { status: 500 });
    }

    const systemPrompt = `Bạn là chuyên gia phần cứng PC tại Việt Nam. Hãy phân tích ảnh hóa đơn linh kiện máy tính được cung cấp (dạng base64).
Trích xuất danh sách các linh kiện bao gồm: tên linh kiện, loại (CPU, RAM, GPU, PSU, Storage, Cooler, Mainboard), và giá tiền ghi trên hóa đơn (VNĐ).
Đồng thời, so sánh với giá trị trường hợp lý tại Việt Nam năm 2026. Trả về định dạng JSON thuần túy (không bọc trong markdown \`\`\`json) theo cấu trúc sau:
{
  "items": [
    {
      "name": "Tên linh kiện",
      "type": "CPU/RAM/...",
      "invoicePrice": 1200000,
      "marketPrice": 1000000,
      "status": "reasonable" | "expensive" | "overpriced"
    }
  ],
  "totalInvoicePrice": 1200000,
  "totalMarketPrice": 1000000,
  "verdict": "Lời khuyên tổng quan: Bạn có bị mua đắt quá không, bị chặt chém bao nhiêu %?"
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemPrompt },
                {
                  inlineData: {
                    mimeType: 'image/jpeg',
                    data: imageBase64.split(',')[1] || imageBase64
                  }
                }
              ]
            }
          ],
          generationConfig: { responseMimeType: 'application/json' }
        })
      }
    );

    const result = await response.json();
    const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    const data = JSON.parse(responseText);

    // Bổ sung so sánh giá thực tế từ database componentsData
    data.items = data.items.map((item: any) => {
      const dbMatch = componentsData.find((dbItem: any) =>
        item.name.toLowerCase().includes(dbItem.name.toLowerCase()) ||
        dbItem.name.toLowerCase().includes(item.name.toLowerCase())
      );
      if (dbMatch) {
        return {
          ...item,
          dbPrice: dbMatch.price,
          status: item.invoicePrice > dbMatch.price * 1.15 ? 'overpriced' : item.invoicePrice > dbMatch.price * 1.05 ? 'expensive' : 'reasonable'
        };
      }
      return item;
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Invoice Check API Error:', error);
    return NextResponse.json({ error: 'Không thể phân tích hóa đơn lúc này.' }, { status: 500 });
  }
}
```

#### 1.2. Tạo giao diện trang kiểm tra hóa đơn: `app/builder/invoice-check/page.tsx`
Giao diện Glassmorphism tuyệt đẹp, cho phép kéo thả ảnh hóa đơn, hiển thị hiệu ứng quét la-ze khi đang scan, và kết quả hiển thị bảng so sánh chi phí cực kỳ rõ ràng kèm theo đánh giá của AI.
*(Hãy viết toàn bộ mã nguồn React 19/Next.js 16 Client Component cho page.tsx này bao gồm nút back quay về `/builder`).*

---

### 🧠 TÍNH NĂNG 2: Chẩn đoán lỗi PC từ triệu chứng tự viết
**Mục tiêu**: Tích hợp một tab "AI Chẩn đoán tự do" bên cạnh giao diện game chẩn đoán lỗi phần cứng hiện tại (`components/DiagnosisMode.js`).

#### 2.1. Tạo API Route chẩn đoán triệu chứng: `app/api/ai/diagnose-symptoms/route.ts`
API nhận văn bản mô tả lỗi từ người dùng, gọi Gemini 1.5 Flash để chẩn đoán.
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { symptoms } = await request.json();
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API Key chưa cấu hình' }, { status: 500 });
    }

    const prompt = `Bạn là chuyên gia sửa chữa máy tính chuyên nghiệp. Người dùng mô tả triệu chứng lỗi PC như sau: "${symptoms}".
Hãy chẩn đoán lỗi phần cứng này. Trả về định dạng JSON thuần túy (không bọc trong markdown) gồm:
{
  "diagnosis": "Tên lỗi chính",
  "probability": 85,
  "suspectedComponent": "Linh kiện bị nghi ngờ hỏng (CPU, RAM, GPU, PSU, Storage, Cooler, Mainboard, etc.)",
  "reason": "Giải thích chi tiết nguyên nhân dẫn tới chẩn đoán này.",
  "steps": [
    "Các bước khắc phục 1",
    "Các bước khắc phục 2"
  ],
  "toolsNeeded": ["Tua vít", "Keo tản nhiệt"]
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      }
    );

    const result = await response.json();
    const data = JSON.parse(result.candidates?.[0]?.content?.parts?.[0]?.text);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Không thể chẩn đoán triệu chứng lúc này.' }, { status: 500 });
  }
}
```

#### 2.2. Chỉnh sửa component `components/DiagnosisMode.js`
Hãy tích hợp tab **"Chẩn đoán AI tự do"** ngay trên thanh điều hướng tiêu đề của `DiagnosisMode.js`. Khi chuyển qua tab này, giao diện sẽ hiển thị một Terminal nhập liệu cyberpunk cực ngầu:
- Cho phép gõ triệu chứng tự do bằng tiếng Việt.
- Bấm "Gửi AI chẩn đoán" sẽ kích hoạt la-ze chạy qua Terminal và hiển thị kết quả chẩn đoán dạng báo cáo kỹ thuật (suspected component, probability %, các bước thực hiện, và danh sách dụng cụ cần dùng).

---

### 🎙️ TÍNH NĂNG 3: Điều khiển Web Builder bằng giọng nói tiếng Việt
**Mục tiêu**: Người dùng có thể ra lệnh bằng giọng nói: "Lắp CPU", "Thêm RAM", "Tháo card đồ họa", "Khởi động PC", "Kiểm tra tương thích", hệ thống tự động thực thi các hành động đó trong trình Builder ảo.

#### 3.1. Tạo Component điều khiển giọng nói: `components/VoiceController.tsx`
Sử dụng Web Speech API (`webkitSpeechRecognition`) và Web Speech Synthesis (đọc to phản hồi bằng tiếng Việt).
```typescript
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface VoiceControllerProps {
  lang: string;
  onCommand: (action: string, params?: any) => void;
  isListeningGlobal?: boolean;
}

export default function VoiceController({ lang, onCommand }: VoiceControllerProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [pulse, setPulse] = useState(false);
  const recognitionRef = useRef<any>(null);

  const speakText = useCallback((text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.lang = 'vi-VN';
        rec.continuous = false;
        rec.interimResults = false;

        rec.onstart = () => {
          setIsListening(true);
          setPulse(true);
        };

        rec.onend = () => {
          setIsListening(false);
          setPulse(false);
        };

        rec.onresult = (event: any) => {
          const text = event.results[0][0].transcript.toLowerCase();
          setTranscript(text);
          processVoiceCommand(text);
        };

        recognitionRef.current = rec;
      }
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript('');
      recognitionRef.current?.start();
    }
  };

  const processVoiceCommand = (text: string) => {
    // 1. Nhận diện lệnh LẮP linh kiện
    if (text.includes('lắp') || text.includes('gắn') || text.includes('thêm')) {
      if (text.includes('cpu') || text.includes('bộ vi xử lý')) {
        onCommand('SPAWN', { type: 'CPU' });
        speakText('Đang lắp bộ vi xử lý trung tâm CPU');
      } else if (text.includes('ram') || text.includes('bộ nhớ')) {
        onCommand('SPAWN', { type: 'RAM' });
        speakText('Đang lắp thanh bộ nhớ RAM');
      } else if (text.includes('card') || text.includes('gpu') || text.includes('đồ họa')) {
        onCommand('SPAWN', { type: 'GPU' });
        speakText('Đang gắn card màn hình rời GPU');
      } else if (text.includes('nguồn') || text.includes('psu')) {
        onCommand('SPAWN', { type: 'PSU' });
        speakText('Đang định vị bộ cấp nguồn máy tính');
      } else if (text.includes('tản nhiệt') || text.includes('cooler')) {
        onCommand('SPAWN', { type: 'COOLER' });
        speakText('Đang gắn quạt tản nhiệt CPU');
      } else if (text.includes('ssd') || text.includes('ổ cứng') || text.includes('m2')) {
        onCommand('SPAWN', { type: 'SSD' });
        speakText('Đang cắm ổ cứng lưu trữ thể rắn SSD');
      }
    }
    // 2. Nhận diện lệnh THÁO/XÓA linh kiện
    else if (text.includes('tháo') || text.includes('gỡ') || text.includes('xóa')) {
      if (text.includes('cpu')) {
        onCommand('REMOVE', { type: 'CPU' });
        speakText('Đã gỡ bỏ bộ xử lý CPU');
      } else if (text.includes('ram')) {
        onCommand('REMOVE', { type: 'RAM' });
        speakText('Đã rút thanh bộ nhớ RAM');
      } else if (text.includes('card') || text.includes('gpu')) {
        onCommand('REMOVE', { type: 'GPU' });
        speakText('Đã tháo card màn hình GPU');
      } else if (text.includes('nguồn') || text.includes('psu')) {
        onCommand('REMOVE', { type: 'PSU' });
        speakText('Đã ngắt kết nối bộ cấp nguồn');
      } else if (text.includes('tản nhiệt') || text.includes('cooler')) {
        onCommand('REMOVE', { type: 'COOLER' });
        speakText('Đã tháo quạt tản nhiệt');
      } else if (text.includes('ssd') || text.includes('ổ cứng')) {
        onCommand('REMOVE', { type: 'SSD' });
        speakText('Đã gỡ ổ cứng lưu trữ');
      } else if (text.includes('hết') || text.includes('tất cả') || text.includes('reset')) {
        onCommand('RESET');
        speakText('Đã dọn sạch tất cả linh kiện trên bàn thực hành');
      }
    }
    // 3. Nhận diện các lệnh điều khiển hệ thống
    else if (text.includes('bật máy') || text.includes('khởi động') || text.includes('kiểm tra')) {
      if (text.includes('tương thích') || text.includes('check')) {
        onCommand('CHECK_COMPATIBILITY');
      } else {
        onCommand('BOOT_PC');
        speakText('Đang kích hoạt quy trình khởi động hệ thống máy tính ảo');
      }
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3">
      <button
        onClick={toggleListening}
        className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all ${
          isListening
            ? 'bg-red-500/20 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]'
            : 'bg-teal-500/10 border-teal-400 hover:bg-teal-500/20'
        }`}
      >
        <span className={`text-2xl ${pulse ? 'animate-ping' : ''}`}>🎙️</span>
      </button>
      {transcript && (
        <div className="glass-panel px-4 py-2 text-sm text-teal-300 max-w-xs border border-teal-500/30 rounded-lg backdrop-blur-md">
          <div className="text-[10px] text-teal-500 font-bold uppercase tracking-wider">Đang nghe...</div>
          <div>"{transcript}"</div>
        </div>
      )}
    </div>
  );
}
```

#### 3.2. Nhúng `VoiceController` vào `/app/builder/page.js`
Hãy tích hợp component này vào main page của builder, đồng thời kết nối callback `onCommand` với ref của `GameEngine` và xử lý:
- `SPAWN`: gọi `gameEngineRef.current.spawnComponent(type)`.
- `REMOVE`: Xử lý gỡ bỏ linh kiện khỏi `placedItemsList` và cập nhật stateRef trong `GameEngine`.
- `CHECK_COMPATIBILITY`: Kích hoạt hàm kiểm tra tương thích có sẵn và thông báo lỗi nếu có.

---

### 💼 TÍNH NĂNG 4: Nghề nghiệp - PC - Từ ước mơ ra cấu hình
**Mục tiêu**: Tạo trang chọn nghề nghiệp tương lai, AI gợi ý cấu hình phần cứng phù hợp và cho phép áp dụng ngay vào Builder ảo.

#### 4.1. Tạo giao diện trang nghề nghiệp: `app/builder/career-build/page.tsx`
Trang hiển thị danh sách các nghề nghiệp dưới dạng các 3D card đẹp:
- AI Engineer / Deep Learning
- 3D Designer / Animator
- Video Editor / Filmmaker
- Professional Streamer / Gamer
- Coder / Software Developer
- Office Worker / Student
Học sinh có thể chọn một nghề nghiệp hoặc nhập ước mơ tự do. Khi chọn, hệ thống gửi yêu cầu lên API để Gemini phân tích và đưa ra lý do tại sao nghề đó cần CPU/GPU/RAM mạnh, hiển thị cấu hình chi tiết trích xuất chính xác từ `data/componentsData.json`. Nút **"Bắt đầu lắp ráp cấu hình này"** sẽ chuyển hướng sang Builder ảo và tự động nạp cấu hình linh kiện đã chọn vào khay builder.

---

### ⏳ TÍNH NĂNG 5: Máy tính qua các thời đại
**Mục tiêu**: Tạo dòng thời gian (Timeline) lịch sử phần cứng PC để BGK thấy tính giáo dục sâu sắc về mặt lịch sử khoa học máy tính.

#### 5.1. Tạo giao diện dòng thời gian: `app/builder/eras/page.tsx`
Thiết kế dòng thời gian nằm ngang hoặc dọc kiểu Neon Sci-Fi với các mốc lịch sử:
1. **1940s - Kỷ nguyên Đèn chân không**: Sự ra đời của máy tính ENIAC. Sử dụng ảnh `mainboard_classic_green_front.png` đại diện.
2. **1970s - Bộ vi xử lý đầu tiên**: Sự xuất hiện của Intel 4004. Sử dụng hình ảnh `cpu_intel_front.png`.
3. **1990s - Kỷ nguyên Máy tính cá nhân**: Windows 95, chip Pentium. Sử dụng hình ảnh `hdd_old_front.png`, `cpu_xeon_old_front.png`.
4. **2000s - Bùng nổ đồ họa 3D**: NVIDIA Voodoo/GeForce 256. Sử dụng hình ảnh `gpu_gtx_1650_front.png`.
5. **2020s - Kỷ nguyên Ray Tracing & AI**: RTX 5090 và Ryzen 9 9950X. Sử dụng các ảnh hiện đại của bạn: `gpu_rtx_5090_front.png` và `amd_ryzen_9_9950x.png`.

Mỗi kỷ nguyên có một nút "Kiểm tra kiến thức" (Quiz) trắc nghiệm nhanh 1 câu. Trả lời đúng học sinh sẽ được nhận XP trực tiếp cộng vào tài khoản LMS.

---

## 🎯 KỊCH BẢN THUYẾT TRÌNH VÀ DEMO WOW MOMENT CHO BGK NGÀY MAI
Hãy hướng dẫn tôi cách trình bày 5 tính năng này trước BGK sao cho cuốn hút nhất:
1. **Thao tác nhanh**: Chỉ demo các tính năng bằng giọng nói hoặc chụp quét hóa đơn trước để tạo sự tò mò.
2. **Dẫn dắt cảm xúc**: Bắt đầu bằng việc đặt vấn đề: *"Em có một người bạn chuẩn bị mua PC cũ nhưng không biết giá, em đã dùng tính năng Quét Hóa Đơn AI để kiểm tra xem có bị chặt chém không..."*.
3. **Tương tác trực tiếp**: Mời BGK đọc to một khẩu lệnh để điều khiển PC Builder ảo trên màn hình lớn.

Hãy sinh toàn bộ mã nguồn hoàn chỉnh, cấu trúc tối ưu cho 5 tính năng này!
