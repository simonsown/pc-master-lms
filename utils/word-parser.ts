export function parseQuestionsFromText(text: string) {
  const lines = text.split('\n').filter(l => l.trim())
  const questions: {
    content: string
    type: 'single_choice' | 'true_false' | 'fill_blank'
    points: number
    explanation: string
    options: { content: string; isCorrect: boolean }[]
  }[] = []

  let currentQuestion: any = null
  let currentOptions: { content: string; isCorrect: boolean }[] = []
  let correctAnswerText = ''

  for (const line of lines) {
    const trimmed = line.trim()

    const questionMatch = trimmed.match(/^(?:Câu\s+)?(\d+)[.)]\s*(.+)/i)
    if (questionMatch) {
      if (currentQuestion && currentOptions.length > 0) {
        currentQuestion.options = currentOptions
        questions.push(currentQuestion)
      }
      currentOptions = []
      correctAnswerText = ''
      currentQuestion = {
        content: questionMatch[2].trim(),
        type: 'single_choice',
        points: 10,
        explanation: '',
        options: []
      }
      continue
    }

    const optionMatch = trimmed.match(/^([A-EĐ])[.)\]]\s*(.*)/)
    if (optionMatch && currentQuestion) {
      currentOptions.push({
        content: optionMatch[2].trim(),
        isCorrect: false
      })
      if (optionMatch[1] === 'Đ') {
        currentOptions[currentOptions.length - 1].isCorrect = true
      }
      continue
    }

    const isTrueFalse = trimmed.match(/^(Đúng|Sai|True|False)\b/i)
    if (isTrueFalse && currentQuestion && currentOptions.length === 0) {
      currentQuestion.type = 'true_false'
      currentOptions.push(
        { content: 'Đúng', isCorrect: trimmed.match(/^(Đúng|True)\b/i) ? true : false },
        { content: 'Sai', isCorrect: trimmed.match(/^(Sai|False)\b/i) ? true : false }
      )
      continue
    }

    const correctMatch = trimmed.match(/^(?:Đáp\s*án|Correct|Answer)\s*[::=]\s*([A-EĐ,]+)/i)
    if (correctMatch && currentQuestion) {
      correctAnswerText = correctMatch[1].toUpperCase()
      const correctIndices: number[] = []
      const letters = correctAnswerText.split('')
      for (const letter of letters) {
        const idx = letter.charCodeAt(0) - 65
        if (idx >= 0 && idx < currentOptions.length) {
          correctIndices.push(idx)
        }
      }
      for (let i = 0; i < currentOptions.length; i++) {
        currentOptions[i].isCorrect = correctIndices.includes(i)
      }
      if (correctIndices.length > 1) {
        currentQuestion.type = 'multiple_choice'
      }
      continue
    }

    const fillBlankMatch = trimmed.match(/^Điền\s*(?:vào\s*chỗ\s*trống|khuyết)\s*[::=]\s*(.+)/i)
    if (fillBlankMatch && currentQuestion) {
      currentQuestion.type = 'fill_blank'
      currentQuestion.options = [{ content: fillBlankMatch[1].trim(), isCorrect: true }]
      continue
    }

    if (currentQuestion && !questionMatch && !optionMatch && trimmed) {
      if (trimmed.match(/^(?:Giải\s*thích|Explanation)\s*[::=]/i)) {
        currentQuestion.explanation = trimmed.replace(/^(?:Giải\s*thích|Explanation)\s*[::=]\s*/i, '')
      }
    }
  }

  if (currentQuestion && currentOptions.length > 0) {
    currentQuestion.options = currentOptions
    questions.push(currentQuestion)
  }

  return questions
}

export async function parseDocx(file: File): Promise<{ text: string; questions: ReturnType<typeof parseQuestionsFromText> }> {
  const mammoth = await import('mammoth')
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })
  const text = result.value
  const questions = parseQuestionsFromText(text)
  return { text, questions }
}
