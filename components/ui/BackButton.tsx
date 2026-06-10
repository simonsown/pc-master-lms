'use client'

import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface BackButtonProps {
  href?: string
  label?: string
  className?: string
}

export function BackButton({ href, label = 'Quay lại', className = 'flex items-center gap-2 text-[#636678] hover:text-[#dde0ed] transition-colors text-sm mb-4' }: BackButtonProps) {
  const router = useRouter()
  return (
    <button
      onClick={() => {
        if (href) {
          router.push(href)
        } else {
          router.back()
        }
      }}
      className={className}
    >
      <ArrowLeft size={16} />
      {label}
    </button>
  )
}
