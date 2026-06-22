import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const webhooks = [
    { path: '/api/n8n/health', method: 'GET', description: 'Health check' },
    { path: '/api/n8n/webhook/certificate', method: 'POST', description: 'Generate certificate on course completion' },
    { path: '/api/n8n/webhook/alert', method: 'POST', description: 'Send student performance alerts' },
    { path: '/api/n8n/webhook/xp', method: 'POST', description: 'Award XP to users' },
    { path: '/api/n8n/webhook/notification', method: 'POST', description: 'Create bulk notifications' },
    { path: '/api/n8n/webhook/lesson-content', method: 'POST', description: 'Generate lesson content with AI' },
    { path: '/api/n8n/triggers/lesson-complete', method: 'POST', description: 'Trigger on lesson completion' },
    { path: '/api/n8n/triggers/quiz-submit', method: 'POST', description: 'Trigger on quiz submission' },
  ]

  return NextResponse.json({
    service: 'PC Master Builder - n8n Webhook API',
    version: '1.0.0',
    baseUrl,
    webhooks,
    authentication: 'Bearer token in Authorization header',
    docs: 'See n8n/README.md for workflow import instructions'
  })
}
