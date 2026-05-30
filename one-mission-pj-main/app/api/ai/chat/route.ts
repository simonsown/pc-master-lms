import { NextResponse } from 'next/server';
import { KEY_QUESTIONS } from '@/data/key-questions';

const GROQ_API_KEY = () => process.env.GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `Bạn là AI Guru - trợ lý AI của nền tảng học tập PC Master Builder. Nhiệm vụ của bạn là hướng dẫn, hỗ trợ học sinh trong việc sử dụng website và trả lời câu hỏi về phần cứng máy tính.

THÔNG TIN VỀ WEBSITE:
- Tên: PC Master Builder - Học lắp ráp PC & Tin học
- Đối tượng: Học sinh phổ thông, sinh viên, người yêu thích công nghệ
- Nội dung chính: Dạy về phần cứng máy tính, lắp ráp PC, kiến thức tin học

CÁC TÍNH NĂNG CHÍNH:
1. Bài giảng (Lessons): Hệ thống bài giảng về phần cứng PC gồm video, text, hình ảnh, PDF
2. Thực hành lắp ráp (Builder): Phòng thực hành PC Builder với môi trường tương tác, kéo thả linh kiện
3. Thi trắc nghiệm (Quiz): Ngân hàng đề thi trắc nghiệm về phần cứng, có chấm điểm tự động
4. Tra cứu thuật ngữ: Bộ từ điển thuật ngữ phần cứng PC, tra cứu trong khi làm quiz
5. Lộ trình học tập (Learning Path): Lộ trình học được AI cá nhân hóa
6. Lớp học (Classes): Giáo viên tạo lớp, học sinh tham gia bằng mã lớp
7. AI Guru: Chính là bạn! Trợ lý AI hỗ trợ học tập

HÃY TRẢ LỜI:
- Luôn trả lời bằng tiếng Việt, giọng thân thiện, nhiệt tình
- Nếu học sinh hỏi về cách sử dụng tính năng, hãy hướng dẫn cụ thể từng bước
- Nếu hỏi về kiến thức phần cứng PC, hãy giải thích dễ hiểu, có ví dụ thực tế
- Giữ câu trả lời ngắn gọn, súc tích, dễ hiểu với học sinh phổ thông`;

function fallbackReply(message: string): string {
  const lower = message.toLowerCase().trim()

  if (lower.includes('xin chào') || lower.includes('hello') || lower.includes('hi') || lower.includes('bạn là ai')) {
    return `Chào bạn! 😊 Có điều gì tôi có thể giúp bạn hôm nay không?\n\nBạn có thể hỏi tôi về:\n- 📚 Các bài giảng phần cứng PC\n- 🔧 Hướng dẫn lắp ráp & kiểm tra tương thích\n- 💰 Tư vấn cấu hình máy tính\n- 🎮 Cách làm quiz kiếm ngân sách\n- 🖥️ Các tính năng trên website`
  }

  if (lower.includes('quiz') || lower.includes('thi') || lower.includes('trắc nghiệm') || lower.includes('bài kiểm tra')) {
    return `📝 **Về tính năng thi trắc nghiệm (Quiz):**\n\n1. Vào **Ngân hàng đề thi** ở mục Student\n2. Mỗi ngày sẽ tự động **mở khoá thêm 1 bài quiz mới**\n3. Mỗi quiz có **10 câu hỏi** về phần cứng PC\n4. Làm đúng mỗi câu được **10 điểm**, tối đa **100 điểm**\n5. Đạt **80 điểm trở lên** là đạt yêu cầu ✅\n6. Điểm quiz được **tích luỹ thành ngân sách** (mỗi điểm = 100.000₫) để mua linh kiện ở Chợ máy tính 🛒\n\n💡 Mẹo: Nếu gặp thuật ngữ lạ, bạn có thể **click vào từ được tô xanh** để xem định nghĩa!`
  }

  if (lower.includes('builder') || lower.includes('lắp ráp') || lower.includes('thực hành') || lower.includes('mô phỏng')) {
    return `🛠️ **Về phòng thực hành lắp ráp PC (Builder):**\n\n- Đây là môi trường **3D tương tác** cho phép bạn kéo thả linh kiện\n- Bạn có thể lắp ráp CPU, RAM, GPU, ổ cứng, nguồn,... vào mainboard\n- Có chế độ **Hand Tracking** bằng webcam để điều khiển bằng tay 🖐️\n- Chế độ **Luyện tập (Learning Mode)** hướng dẫn từng bước\n- **Chợ máy tính (Marketplace)** dùng ngân sách từ điểm quiz để mua linh kiện\n\n💡 Bắt đầu bằng cách chọn "Thực hành lắp ráp" từ menu chính!`
  }

  if (lower.includes('cpu') || lower.includes('vi xử lý') || lower.includes('core') || lower.includes('ryzen')) {
    return `🧠 **CPU (Bộ vi xử lý trung tâm):**\n\n- Là "bộ não" của máy tính, thực hiện mọi tính toán\n- **Intel**: Core i3 (cơ bản), i5 (trung bình), i7 (cao cấp), i9 (siêu cao cấp)\n- **AMD**: Ryzen 3/5/7/9 tương ứng\n- Thông số quan trọng: **số nhân (cores)**, **xung nhịp (GHz)**, **TDP** (nhiệt lượng)\n- Socket phải **tương thích** với mainboard (Intel LGA1700, AMD AM5)\n\n💡 Xem chi tiết trong bài giảng "Bộ vi xử lý (CPU)"!`
  }

  if (lower.includes('gpu') || lower.includes('card đồ họa') || lower.includes('vga') || lower.includes('graphics') || lower.includes('nvidia') || lower.includes('amd')) {
    return `🎮 **GPU (Card đồ họa):**\n\n- Xử lý hình ảnh, render game, hỗ trợ AI\n- **NVIDIA**: GTX (cơ bản), RTX (ray tracing, AI)\n- **AMD**: Radeon RX\n- Thông số quan trọng: **VRAM** (bộ nhớ đồ họa), **xung nhịp**, **TDP**\n- Công nghệ nổi bật: **Ray Tracing** (ánh sáng thực tế), **DLSS/FSR** (tăng FPS bằng AI)\n\n💡 Card RTX 4060 trở lên phù hợp chơi game 1080p-1440p!`
  }

  if (lower.includes('ram') || lower.includes('bộ nhớ') || lower.includes('memory') || lower.includes('ddr')) {
    return `💾 **RAM (Bộ nhớ trong):**\n\n- Lưu dữ liệu tạm thời cho CPU truy xuất nhanh\n- **DDR4** (cũ) và **DDR5** (mới) - **không tương thích** ngược\n- Dung lượng: **16GB** là tối thiểu cho gaming, **32GB** cho làm đồ họa\n- Thông số: **tốc độ (MT/s)**, **CAS Latency (CL)** - càng thấp càng nhanh\n- **Dual Channel**: nên dùng 2 thanh để tăng hiệu năng\n\n💡 Xem trong bài giảng "RAM & Bộ Nhớ Trong"!`
  }

  if (lower.includes('ngân sách') || lower.includes('budget') || lower.includes('tiền') || lower.includes('giá') || lower.includes('mua')) {
    return `💰 **Ngân sách và Chợ máy tính:**\n\n- Mỗi lần làm quiz đạt điểm cao, bạn nhận được **điểm × 100.000₫** vào ngân sách\n- Vào **Chợ máy tính** để mua linh kiện với ngân sách tích luỹ\n- Linh kiện có sẵn: CPU, RAM, GPU, ổ cứng, nguồn, tản nhiệt, case,...\n- Kiểm tra **tương thích** trước khi mua (socket, RAM type, TDP)\n- Cấu hình gợi ý theo ngân sách:\n  • **~5-10tr**: i3/Ryzen 3 + GTX 1650 + 16GB RAM\n  • **~10-20tr**: i5/Ryzen 5 + RTX 3060/4060\n  • **~20tr+**: i7/Ryzen 7 + RTX 4070+`
  }

  if (lower.includes('học') || lower.includes('lesson') || lower.includes('bài giảng') || lower.includes('course') || lower.includes('bài học')) {
    return `📚 **Hệ thống bài giảng:**\n\n- Vào mục **Student → Lessons** để xem danh sách bài giảng\n- Các chủ đề: CPU, Mainboard, RAM, GPU, Ổ cứng, Nguồn, Tản nhiệt,...\n- Mỗi bài giảng có: **video**, **text**, **hình ảnh** minh hoạ\n- Sau mỗi bài giảng có **quiz** để kiểm tra kiến thức\n- Theo dõi tiến độ học tập trong mục **Progress** 📊\n\n💡 Học theo **Lộ trình học tập** để được gợi ý bài phù hợp!`
  }

  if (lower.includes('đăng nhập') || lower.includes('login') || lower.includes('tài khoản') || lower.includes('account')) {
    return `🔐 **Đăng nhập / Tài khoản:**\n\n1. Nhấn **Đăng nhập** ở góc phải trên cùng\n2. Bạn có thể đăng nhập bằng **Google** hoặc **Email**\n3. Lần đầu: nhập email → hệ thống tự tạo tài khoản, bạn chỉ cần điền **Họ tên**\n4. Có thể đăng nhập với vai trò: **Học sinh**, **Giáo viên**, **Admin**\n5. Sau khi đăng nhập, bạn có thể truy cập tất cả tính năng`
  }

  if (lower.includes('cảm ơn') || lower.includes('thank')) {
    return `Không có gì bạn ơi! 😊 Có thắc mắc gì cứ hỏi tôi nhé. Chúc bạn học tập vui vẻ! 🚀`
  }

  // Câu hỏi trọng tâm theo chủ đề bài giảng
  const topicMap: Record<string, string> = {
    'mainboard': 'Bo mạch chủ', 'bo mạch chủ': 'Bo mạch chủ', 'main': 'Bo mạch chủ',
    'lưu trữ': 'Lưu trữ dữ liệu', 'ssd': 'Lưu trữ dữ liệu', 'hdd': 'Lưu trữ dữ liệu', 'ổ cứng': 'Lưu trữ dữ liệu',
    'lắp ráp': 'Thực hành lắp ráp', 'build': 'Thực hành lắp ráp',
    'mạng': 'Mạng & Kết nối', 'wifi': 'Mạng & Kết nối', 'ethernet': 'Mạng & Kết nối',
    'thiết bị ngoại vi': 'Thiết bị ngoại vi', 'chuột': 'Thiết bị ngoại vi', 'bàn phím': 'Thiết bị ngoại vi', 'màn hình': 'Thiết bị ngoại vi',
    'khởi động': 'Hệ thống khởi động', 'bios': 'Hệ thống khởi động', 'uefi': 'Hệ thống khởi động', 'boot': 'Hệ thống khởi động',
    'công nghệ màn hình': 'Công nghệ màn hình', 'ips': 'Công nghệ màn hình', 'va': 'Công nghệ màn hình', 'tn': 'Công nghệ màn hình',
    'âm thanh': 'Hệ thống âm thanh', 'loa': 'Hệ thống âm thanh', 'tai nghe': 'Hệ thống âm thanh',
    'case': 'Vỏ case & quạt', 'vỏ máy': 'Vỏ case & quạt', 'quạt': 'Vỏ case & quạt',
    'benchmark': 'Đánh giá hiệu năng', 'hiệu năng': 'Đánh giá hiệu năng', 'fps': 'Đánh giá hiệu năng',
    'đánh giá hiệu năng': 'Đánh giá hiệu năng',
    'ép xung': 'Ép xung & tối ưu', 'overclock': 'Ép xung & tối ưu', 'undervolt': 'Ép xung & tối ưu',
    'tản nhiệt nước': 'Tản nhiệt nâng cao', 'aio': 'Tản nhiệt nâng cao', 'custom loop': 'Tản nhiệt nâng cao',
    'pc gaming': 'PC Gaming', 'gaming': 'PC Gaming', 'cấu hình': 'PC Gaming',
    'máy chủ': 'Máy chủ & Workstation', 'server': 'Máy chủ & Workstation', 'workstation': 'Máy chủ & Workstation',
    'cáp': 'Cáp & đấu nối', 'cable management': 'Cáp & đấu nối', 'hdmi': 'Cáp & đấu nối', 'displayport': 'Cáp & đấu nối',
    'sự cố': 'Xử lý sự cố', 'lỗi': 'Xử lý sự cố', 'bsod': 'Xử lý sự cố', 'chậm': 'Xử lý sự cố',
    'vr': 'VR/AR', 'ar': 'VR/AR', 'thực tế ảo': 'VR/AR',
    'lịch sử pc': 'Lịch sử PC', 'máy tính': 'Lịch sử PC',
    'đạo đức': 'Đạo đức & an toàn', 'bảo mật': 'Đạo đức & an toàn', 'rác điện tử': 'Đạo đức & an toàn',
    'ai': 'Trí tuệ nhân tạo', 'trí tuệ nhân tạo': 'Trí tuệ nhân tạo',
    'nguồn': 'Nguồn & Tản nhiệt', 'psu': 'Nguồn & Tản nhiệt', 'tản nhiệt': 'Nguồn & Tản nhiệt', '80 plus': 'Nguồn & Tản nhiệt',
    'laptop': 'Laptop',
  }
  for (const [keyword, title] of Object.entries(topicMap)) {
    if (lower.includes(keyword)) {
      const questions = KEY_QUESTIONS[title]
      if (questions && questions.length > 0) {
        let reply = `📖 **${title} - Câu hỏi trọng tâm:**\n\n`
        questions.slice(0, 3).forEach((kq, i) => {
          reply += `**Q${i + 1}:** ${kq.q}\n**A:** ${kq.a}\n\n`
        })
        reply += `💡 Xem thêm trong bài giảng "${title}" trên **Student → Lessons**!`
        return reply
      }
    }
  }

  return `Xin chào! Tôi là **AI Guru** của PC Master Builder 🤖\n\nHiện tại tôi chưa thể trả lời câu hỏi này vì API AI đang tạm thời gián đoạn. Tuy nhiên bạn có thể:\n- 📖 **Tra cứu thuật ngữ** bằng nút "Tra cứu" trên đầu trang quiz\n- 📚 Vào **Student → Lessons** để xem bài giảng chi tiết\n- 🛠️ Vào **Student → Quiz** để luyện tập trắc nghiệm\n\nHoặc thử hỏi tôi về: cpu, gpu, ram, mainboard, nguồn, ổ cứng, mạng, laptop, ai, lắp ráp,... nhé!`
}

async function callGroq(messages: { role: string; content: string }[]): Promise<string> {
  const apiKey = GROQ_API_KEY();
  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('Groq API error:', res.status, text);
    throw new Error(`Groq responded with ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

export async function POST(req: Request) {
  let requestMessage = '';
  try {
    const body = await req.json();
    requestMessage = body.message || '';
    const { message, history = [], context = {} } = body;
    const apiKey = GROQ_API_KEY();
    if (!apiKey) {
      return NextResponse.json({ reply: fallbackReply(message) });
    }

    let contextPrefix = '';
    if (context?.appMode && context.appMode !== 'menu') {
      const modeLabel: Record<string, string> = {
        course: 'Chế Độ Bài Giảng',
        learning: 'Chế Độ Luyện Tập',
        market: 'Chợ Máy Tính',
        mission_assembly: 'Phòng Lắp Ráp Nhiệm Vụ',
        assembly: 'Lắp Ráp Tự Do',
        multiplayer: 'Chế Độ 2 Người Chơi',
      }
      const label = modeLabel[context.appMode] || context.appMode;
      contextPrefix = `[Ngữ cảnh hiện tại: Người dùng đang ở "${label}"`;
      if (context.cartItems?.length > 0) {
        const cartSummary = context.cartItems.map((i: any) => `${i.type}: ${i.name} (${i.price?.toLocaleString()} VNĐ)`).join(', ');
        contextPrefix += `. Giỏ hàng: ${cartSummary}`;
      }
      if (context.remainingBudget !== undefined) {
        contextPrefix += `. Ngân sách còn lại: ${context.remainingBudget.toLocaleString()} VNĐ`;
      }
      if (context.missionTitle) {
        contextPrefix += `. Nhiệm vụ: "${context.missionTitle}"`;
      }
      contextPrefix += ']\n\n';
    }

    const fullMessage = contextPrefix + message;
    const messages: { role: string; content: string }[] = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    if (history.length > 0) {
      const recent = history.slice(-10);
      for (const msg of recent) {
        messages.push({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content,
        });
      }
    }

    messages.push({ role: 'user', content: fullMessage });

    const text = await callGroq(messages);
    if (!text) {
      return NextResponse.json({ reply: fallbackReply(message) });
    }
    return NextResponse.json({ reply: text });
  } catch (err: any) {
    console.error('AI Chat Route Error:', err?.message || err);
    return NextResponse.json({ reply: fallbackReply(requestMessage) });
  }
}
