import { NextRequest, NextResponse } from 'next/server'

interface QAStep {
  q: string
  a: string
}

interface DiagnosisResult {
  problem: string
  cause: string
  fixSteps: string[]
  partsNeeded: string[]
  repairShop: string
}

interface AiResponse {
  type: 'question' | 'diagnosis'
  message: string
  options?: string[]
  diagnosis?: DiagnosisResult
  model?: string
}

function buildPrompt(symptoms: string, answers: QAStep[]): string {
  const hasHistory = answers && answers.length > 0
  const context = hasHistory
    ? `Lịch sử: ${answers.map(a => `Q: ${a.q} → A: ${a.a}`).join('\n')}`
    : ''

  return `Bạn là chuyên gia chẩn đoán PC. Người dùng mô tả: "${symptoms}"

${context}

Hãy chẩn đoán tương tác:
1. Nếu đã có đủ triệu chứng để chẩn đoán → đưa ra kết luận + hướng dẫn sửa + gợi ý nơi sửa/mua linh kiện
2. Nếu chưa đủ → đưa ra 3-4 câu hỏi gợi ý (dạng options, người dùng chọn)

Trả về JSON:
{
  "type": "question" | "diagnosis",
  "message": "Lời nhắn cho người dùng",
  "options": ["Tùy chọn 1", "Tùy chọn 2", ...],
  "diagnosis": { (chỉ khi type=diagnosis)
    "problem": "Tên lỗi",
    "cause": "Nguyên nhân chính",
    "fixSteps": ["Bước 1...", "Bước 2...", ...],
    "partsNeeded": ["Linh kiện cần thay (nếu có)"],
    "repairShop": "Gợi ý ra tiệm sửa hoặc tự làm"
  }
}`
}

function parseAiResponse(text: string): AiResponse | null {
  try {
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || text.match(/{[\s\S]*"type"[\s\S]*"message"[\s\S]*}/)
    const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text
    return JSON.parse(jsonStr.trim())
  } catch {
    return null
  }
}

async function callGemini(symptoms: string, answers: QAStep[]): Promise<AiResponse | null> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY
  if (!apiKey) return null

  const prompt = buildPrompt(symptoms, answers)
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15000)

  try {
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 1024 }
      }),
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    if (!res.ok) return null
    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
    if (!text) return null
    return parseAiResponse(text)
  } catch {
    clearTimeout(timeoutId)
    return null
  }
}

async function callOpenAI(symptoms: string, answers: QAStep[]): Promise<AiResponse | null> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null

  const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'
  const prompt = buildPrompt(symptoms, answers)

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15000)

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1024
      }),
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    if (!res.ok) return null
    const data = await res.json()
    const text = data?.choices?.[0]?.message?.content || ''
    if (!text) return null
    return parseAiResponse(text)
  } catch {
    clearTimeout(timeoutId)
    return null
  }
}

async function callHuggingFace(symptoms: string, answers: QAStep[]): Promise<AiResponse | null> {
  const apiKey = process.env.HUGGINGFACE_API_KEY

  const prompt = buildPrompt(symptoms, answers)

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 20000)

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`
    }

    const res = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        inputs: prompt,
        parameters: { temperature: 0.3, max_new_tokens: 1024, return_full_text: false }
      }),
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    if (!res.ok) return null
    const data = await res.json()
    const text = Array.isArray(data) ? data[0]?.generated_text || '' : data?.generated_text || ''
    if (!text) return null
    return parseAiResponse(text)
  } catch {
    clearTimeout(timeoutId)
    return null
  }
}

function ruleBasedDiagnosis(symptoms: string, answers: QAStep[]): AiResponse {
  const lower = symptoms.toLowerCase()
  const allText = [lower, ...answers.map(a => (a.q + ' ' + a.a).toLowerCase())].join(' ')
  const userAnswers = answers.map(a => a.a.toLowerCase())

  if (allText.includes('không lên màn hình') || allText.includes('đen màn hình') || allText.includes('no display') || allText.includes('không có hình')) {
    if (answers.length < 2) {
      return {
        type: 'question',
        message: 'Máy có đèn nguồn sáng và quạt chạy không?',
        options: ['Có, đèn sáng và quạt chạy', 'Không, không có đèn nào sáng', 'Có đèn nhưng không boot']
      }
    }
    const hasPower = userAnswers.some(a => a.includes('có') && (a.includes('đèn') || a.includes('sáng') || a.includes('chạy')))
    if (hasPower) {
      return {
        type: 'diagnosis',
        message: 'Máy có đèn nguồn và quạt chạy nhưng không lên màn hình.',
        diagnosis: {
          problem: 'Lỗi không hiển thị (No Display)',
          cause: 'Có thể do RAM/GPU tiếp xúc kém, hoặc lỗi card màn hình rời',
          fixSteps: [
            'Tháo RAM ra, dùng gôm hoặc vải khô lau sạch chân tiếp xúc, gắn lại',
            'Thử với 1 thanh RAM, đổi khe cắm',
            'Nếu có card màn hình rời, thử tháo ra và cắm màn hình vào cổng trên mainboard',
            'Kiểm tra cáp màn hình (VGA/HDMI/DP)',
            'Clear CMOS bằng cách tháo pin mainboard trong 30s'
          ],
          partsNeeded: ['Có thể cần thay RAM nếu đã chạy các bước trên không được'],
          repairShop: 'Mang ra tiệm sửa chữa máy tính gần bạn để kiểm tra chi tiết'
        }
      }
    }
    return {
      type: 'diagnosis',
      message: 'Máy không lên nguồn, không có đèn và quạt.',
      diagnosis: {
        problem: 'Lỗi không lên nguồn (No Power)',
        cause: 'Có thể do nguồn hỏng, mainboard chết, hoặc dây nguồn lỏng',
        fixSteps: [
          'Kiểm tra dây nguồn cắm vào case và ổ điện đã chặt chưa',
          'Thử cắm trực tiếp vào ổ điện khác',
          'Kiểm tra công tắc nguồn phía sau PSU',
          'Thử test nguồn bằng cách dùng đồng hồ vạn năng hoặc nối chân PS-ON với GND',
          'Nếu vẫn không lên, có thể nguồn hoặc mainboard đã hỏng'
        ],
        partsNeeded: ['Nguồn máy tính (PSU) mới nếu nguồn cũ hỏng'],
        repairShop: 'Mang toàn bộ case ra tiệm sửa chữa uy tín để kiểm tra'
      }
    }
  }

  if (allText.includes('treo') || allText.includes('đơ') || allText.includes('freeze') || allText.includes('lag') || allText.includes('chậm')) {
    if (answers.length < 2) {
      return {
        type: 'question',
        message: 'Máy bị treo ngay khi vào Windows hay sau một thời gian sử dụng?',
        options: ['Treo ngay khi boot / vào Windows', 'Treo sau khi dùng 1 lúc', 'Treo khi chơi game / chạy ứng dụng nặng']
      }
    }
    return {
      type: 'diagnosis',
      message: 'Máy bị treo, đơ hoặc chạy chậm.',
      diagnosis: {
        problem: 'Hiệu năng thấp / Máy bị treo',
        cause: 'Có thể do ổ cứng chậm (HDD), thiếu RAM, nhiệt độ CPU cao, hoặc nhiễm virus',
        fixSteps: [
          'Kiểm tra nhiệt độ CPU/GPU bằng phần mềm (HWMonitor, MSI Afterburner)',
          'Vệ sinh quạt tản nhiệt, thay keo tản nhiệt nếu cần',
          'Nâng cấp lên SSD nếu đang dùng HDD',
          'Thêm RAM nếu dưới 8GB',
          'Chạy Windows Update và cập nhật driver',
          'Quét virus bằng Windows Defender hoặc phần mềm diệt virus'
        ],
        partsNeeded: ['SSD (nếu đang dùng HDD)', 'RAM (nếu dưới 8GB)'],
        repairShop: 'Có thể tự nâng cấp tại nhà. Nếu không rành, mang ra cửa hàng máy tính'
      }
    }
  }

  if (allText.includes('xanh màn hình') || allText.includes('bsod') || allText.includes('blue screen') || allText.includes('màn hình xanh')) {
    return {
      type: 'diagnosis',
      message: 'Máy bị lỗi màn hình xanh (Blue Screen of Death).',
      diagnosis: {
        problem: 'Lỗi màn hình xanh (BSOD)',
        cause: 'Nguyên nhân thường do driver lỗi, RAM/ổ cứng hỏng, hoặc quá nhiệt',
        fixSteps: [
          'Ghi lại mã lỗi trên màn hình xanh (VD: CRITICAL_PROCESS_DIED, MEMORY_MANAGEMENT)',
          'Khởi động vào Safe Mode và gỡ driver mới cài',
          'Chạy Windows Memory Diagnostic để kiểm tra RAM',
          'Chạy lệnh "sfc /scannow" trong Command Prompt (Admin)',
          'Kiểm tra ổ cứng bằng CrystalDiskInfo hoặc chkdsk',
          'Cập nhật Windows và driver lên bản mới nhất'
        ],
        partsNeeded: ['RAM (nếu kiểm tra có lỗi)', 'Ổ cứng mới (nếu ổ cũ bad sector)'],
        repairShop: 'Mang ra tiệm sửa chữa nếu đã thử các bước trên không hết'
      }
    }
  }

  if (allText.includes('nhiệt độ') || allText.includes('nóng') || allText.includes('fan') || allText.includes('quạt') || allText.includes('overheat')) {
    return {
      type: 'diagnosis',
      message: 'Máy bị quá nhiệt hoặc quạt kêu to.',
      diagnosis: {
        problem: 'Quá nhiệt (Overheating)',
        cause: 'Bụi bám nhiều, keo tản nhiệt khô, quạt hỏng hoặc thiếu quạt tản nhiệt',
        fixSteps: [
          'Vệ sinh toàn bộ case, đặc biệt là quạt CPU và quạt case',
          'Thay keo tản nhiệt cho CPU',
          'Kiểm tra tất cả quạt có quay không',
          'Cân nhắc thêm quạt case để tăng luồng gió',
          'Đảm bảo case có đủ luồng gió vào (intake) và ra (exhaust)'
        ],
        partsNeeded: ['Keo tản nhiệt', 'Quạt case (nếu thiếu)', 'Tản nhiệt mới (nếu tản cũ hỏng)'],
        repairShop: 'Tự làm được nếu có dụng cụ. Nếu không, ra tiệm sửa chữa'
      }
    }
  }

  if (allText.includes('nguồn') || allText.includes('psu') || allText.includes('tắt nguồn') || allText.includes('shutdown') || allText.includes('tự tắt')) {
    return {
      type: 'diagnosis',
      message: 'Máy tự tắt nguồn hoặc không lên nguồn.',
      diagnosis: {
        problem: 'Lỗi nguồn hoặc quá nhiệt gây shutdown bảo vệ',
        cause: 'Nguồn yếu/ hỏng, hoặc máy quá nhiệt kích hoạt cơ chế tự tắt bảo vệ',
        fixSteps: [
          'Kiểm tra nguồn có đủ công suất cho cấu hình không',
          'Đo nhiệt độ CPU/GPU trước khi máy tắt',
          'Vệ sinh máy, thay keo tản nhiệt',
          'Test nguồn bằng PSU tester hoặc thay nguồn khác'
        ],
        partsNeeded: ['Nguồn mới (nếu nguồn cũ yếu/hỏng)'],
        repairShop: 'Kiểm tra nguồn tại tiệm sửa chữa uy tín'
      }
    }
  }

  if (allText.includes('wifi') || allText.includes('mạng') || allText.includes('internet') || allText.includes('lan') || allText.includes('kết nối')) {
    return {
      type: 'diagnosis',
      message: 'Máy gặp sự cố kết nối mạng.',
      diagnosis: {
        problem: 'Lỗi kết nối mạng',
        cause: 'Driver mạng lỗi, cài đặt IP sai, hoặc card mạng hỏng',
        fixSteps: [
          'Khởi động lại modem/router và máy tính',
          'Vào Network Reset: Settings → Network & Internet → Advanced network settings → Network reset',
          'Cập nhật driver card mạng từ trang web nhà sản xuất',
          'Chạy lệnh "ipconfig /release" rồi "ipconfig /renew" trong CMD (Admin)',
          'Kiểm tra vật lý dây mạng (nếu dùng LAN)'
        ],
        partsNeeded: ['Card mạng USB (nếu card mạng onboard hỏng)'],
        repairShop: 'Có thể tự xử lý; nếu không được nhờ IT support'
      }
    }
  }

  if (answers.length < 2) {
    return {
      type: 'question',
      message: 'Tôi cần thêm thông tin để chẩn đoán chính xác. Bạn có thể cho tôi biết thêm chi tiết?',
      options: [
        'Máy có bị xanh màn hình (BSOD) không?',
        'Máy có lên nguồn (đèn, quạt) không?',
        'Có tiếng bíp khi khởi động không?',
        'Lỗi xuất hiện khi làm gì?'
      ]
    }
  }

  return {
    type: 'diagnosis',
    message: 'Dựa trên triệu chứng bạn mô tả, đây là chẩn đoán sơ bộ.',
    diagnosis: {
      problem: 'Lỗi phần cứng / phần mềm không xác định',
      cause: 'Cần kiểm tra thêm để xác định chính xác nguyên nhân',
      fixSteps: [
        'Thử khởi động lại máy tính',
        'Chạy Windows Update để cập nhật bản vá mới nhất',
        'Kiểm tra Event Viewer (Xem Sự kiện) để tìm mã lỗi chi tiết',
        'Nếu mới cài phần mềm/driver, thử gỡ cài đặt',
        'Chạy System Restore về thời điểm máy chưa bị lỗi'
      ],
      partsNeeded: [],
      repairShop: 'Mang máy đến trung tâm bảo hành hoặc tiệm sửa chữa uy tín'
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { symptoms, answers } = await request.json()
    const qas = (answers || []) as QAStep[]

    let result: AiResponse | null = null
    let usedModel = ''

    result = await callGemini(symptoms, qas)
    if (result) usedModel = 'gemini'

    if (!result) {
      result = await callOpenAI(symptoms, qas)
      if (result) usedModel = 'openai'
    }

    if (!result) {
      result = await callHuggingFace(symptoms, qas)
      if (result) usedModel = 'huggingface'
    }

    if (!result) {
      result = ruleBasedDiagnosis(symptoms, qas)
      usedModel = 'rule-based'
    }

    return NextResponse.json({ ...result, model: usedModel })
  } catch {
    const fallback = ruleBasedDiagnosis('', [])
    return NextResponse.json({ ...fallback, model: 'rule-based' })
  }
}
