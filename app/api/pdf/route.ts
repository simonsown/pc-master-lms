import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const ALLOWED = ['sach-tin10.pdf', 'sach-tin11.pdf']

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const file = searchParams.get('file')

  if (!file || !ALLOWED.includes(file)) {
    return new NextResponse('File not found', { status: 404 })
  }

  const filePath = path.join(process.cwd(), 'public', file)
  if (!fs.existsSync(filePath)) {
    return new NextResponse('File not found', { status: 404 })
  }

  const buffer = fs.readFileSync(filePath)
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="' + file + '"',
    },
  })
}
