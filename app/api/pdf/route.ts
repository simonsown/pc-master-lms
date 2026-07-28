import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const file = searchParams.get('file')

  if (!file) {
    return new NextResponse('File parameter is required', { status: 400 })
  }

  // Prevent path traversal
  const safeFilename = path.basename(file)
  
  // Search in public/slides first, then public/
  let filePath = path.join(process.cwd(), 'public', 'slides', safeFilename)
  if (!fs.existsSync(filePath)) {
    filePath = path.join(process.cwd(), 'public', safeFilename)
  }

  if (!fs.existsSync(filePath)) {
    return new NextResponse(`File not found: ${safeFilename}`, { status: 404 })
  }

  const buffer = fs.readFileSync(filePath)
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${safeFilename}"`,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
