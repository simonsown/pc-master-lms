import { NextRequest, NextResponse } from 'next/server';
import componentsData from '@/data/componentsData.json';

interface Component {
  id: string; name: string; type: string; price: number;
  socket?: string; power?: number; desc?: string;
  ramType?: string; size?: string; wattage?: number;
}

const CPU_NAMES: { name: string; id: string }[] = [];
for (const c of componentsData as Component[]) {
  CPU_NAMES.push({ name: c.name.toLowerCase(), id: c.id });
}

function findBestMatch(name: string, items: Component[]): Component | null {
  const n = name.toLowerCase().trim();
  let best: Component | null = null;
  let bestScore = 0;
  for (const db of items) {
    const dbn = db.name.toLowerCase();
    let s = n.includes(dbn) || dbn.includes(n) ? Math.max(n.length, dbn.length) : 0;
    const nw = n.split(/\s+/);
    const dw = dbn.split(/\s+/);
    const common = nw.filter((w: string) => dw.includes(w));
    s = Math.max(s, common.length * 3);
    if (s > bestScore) { bestScore = s; best = db; }
  }
  return best && bestScore >= 2 ? best : null;
}

async function scanWithGroq(imageBase64: string, apiKey: string) {
  const imageData = imageBase64.split(',')[1] || imageBase64;
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'llama-3.2-90b-vision-preview',
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: 'Bạn là chuyên gia phần cứng PC tại Việt Nam. Phân tích ảnh hóa đơn này. Trích xuất tên từng linh kiện, loại (CPU/RAM/GPU/Mainboard/PSU/Storage/Cooler), giá tiền VNĐ. Ước lượng giá thị trường hợp lý. Xác định status: reasonable (<=+8%), expensive (+8-20%), overpriced (>+20%). Trả về JSON: {"items":[{"name":"","type":"","invoicePrice":0,"marketPrice":0,"status":"reasonable"}],"totalInvoicePrice":0,"totalMarketPrice":0,"verdict":"Đánh giá tiếng Việt"}' },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageData}` } },
        ],
      }],
      temperature: 0.3,
      max_tokens: 2048,
    }),
  });
  if (!r.ok) throw new Error(`Groq vision error (${r.status})`);
  const j = await r.json();
  const t = j.choices?.[0]?.message?.content;
  if (!t) throw new Error('Groq không trả về kết quả');
  const cleaned = t.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned);
}

async function scanWithGemini(imageBase64: string, apiKey: string) {
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: 'Bạn là chuyên gia phần cứng PC tại Việt Nam. Phân tích ảnh hóa đơn. Trích xuất tên linh kiện, loại (CPU/RAM/GPU/Mainboard/PSU/Storage/Cooler), giá VNĐ. Ước lượng giá thị trường. Status: reasonable (<=+8%), expensive (+8-20%), overpriced (>+20%). Trả về JSON: {"items":[{"name":"","type":"","invoicePrice":0,"marketPrice":0,"status":"reasonable"}],"totalInvoicePrice":0,"totalMarketPrice":0,"verdict":"Đánh giá tiếng Việt"}' },
            { inlineData: { mimeType: 'image/jpeg', data: imageBase64.split(',')[1] || imageBase64 } },
          ],
        }],
      }),
    }
  );
  if (!r.ok) throw new Error(`Gemini error (${r.status})`);
  const j = await r.json();
  const t = j.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!t) throw new Error('Gemini không trả về kết quả');
  return JSON.parse(t);
}

function applyDbPrices(items: any[]) {
  return items.map((item: any) => {
    const ip = Number(item.invoicePrice) || 0;
    let mp = Number(item.marketPrice) || 0;
    const db = findBestMatch(item.name, componentsData as Component[]);
    if (db?.price && db.price > 0) mp = db.price;
    if (mp <= 0) mp = ip;
    const ratio = ip / mp;
    return {
      name: item.name,
      type: item.type || 'Other',
      invoicePrice: ip,
      marketPrice: mp,
      dbPrice: db?.price || mp,
      status: ratio > 1.2 ? 'overpriced' : ratio > 1.08 ? 'expensive' : 'reasonable',
      percentDiff: mp > 0 ? Math.round(((ip - mp) / mp) * 100) : 0,
    };
  });
}

function buildVerdict(items: any[], ti: number, tm: number): string {
  const diff = ti - tm;
  const pct = tm > 0 ? Math.round((diff / tm) * 100) : 0;
  const o = items.filter((i: any) => i.status === 'overpriced');
  const e = items.filter((i: any) => i.status === 'expensive');
  if (o.length > 0) return `🚨 CẢNH BÁO CHẶT CHÉM! Bạn bị hở ${pct}% (${diff.toLocaleString('vi-VN')}₫). Đắt nhất: ${o.map((i: any) => i.name).join(', ')}.${e.length ? ` Hơi đắt: ${e.map((i: any) => i.name).join(', ')}.` : ''} Thương lượng lại!`;
  if (e.length > 0) return `⚠️ Giá hơi cao. Trả thêm ${pct}% (${diff.toLocaleString('vi-VN')}₫). Hơi đắt: ${e.map((i: any) => i.name).join(', ')}.`;
  return `✅ Giá hợp lý! Chênh ${pct}%.${diff < 0 ? ` Bạn mua rẻ hơn ${Math.abs(diff).toLocaleString('vi-VN')}₫!` : ''} Không bị chặt chém.`;
}

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, manualItems } = await request.json();

    // Manual entry mode
    if (manualItems && Array.isArray(manualItems) && manualItems.length > 0) {
      const items = applyDbPrices(manualItems);
      const ti = items.reduce((s: number, i: any) => s + i.invoicePrice, 0);
      const tm = items.reduce((s: number, i: any) => s + i.marketPrice, 0);
      return NextResponse.json({ items, totalInvoicePrice: ti, totalMarketPrice: tm, verdict: buildVerdict(items, ti, tm) });
    }

    // Image scanning mode
    if (!imageBase64) return NextResponse.json({ error: 'Vui lòng cung cấp ảnh hóa đơn hoặc nhập tay linh kiện' }, { status: 400 });

    const groqKey = process.env.GROQ_API_KEY || '';
    const geminiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';

    let items: any[] = [];

    // Try Groq vision first, then Gemini
    if (groqKey) {
      try {
        const d = await scanWithGroq(imageBase64, groqKey);
        if (d.items?.length) items = d.items;
      } catch (e: any) { console.warn('Groq vision fail:', e.message); }
    }

    if (!items.length && geminiKey) {
      try {
        const d = await scanWithGemini(imageBase64, geminiKey);
        if (d.items?.length) items = d.items;
      } catch (e: any) { console.warn('Gemini fail:', e.message); }
    }

    // If both fail, return error suggesting manual entry
    if (!items.length) {
      return NextResponse.json({
        error: 'AI không nhận diện được ảnh. Bạn có thể nhập tay linh kiện bên dưới.',
        suggestManual: true,
      }, { status: 422 });
    }

    const processed = applyDbPrices(items);
    const ti = processed.reduce((s: number, i: any) => s + i.invoicePrice, 0);
    const tm = processed.reduce((s: number, i: any) => s + i.marketPrice, 0);

    return NextResponse.json({
      items: processed,
      totalInvoicePrice: ti,
      totalMarketPrice: tm,
      verdict: buildVerdict(processed, ti, tm),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Lỗi phân tích hóa đơn' }, { status: 500 });
  }
}
