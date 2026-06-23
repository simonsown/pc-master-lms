'use client'

import React, { useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X } from 'lucide-react'
import VirtualAssistant from './VirtualAssistant'

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const hiddenPaths = ['/student/discussion']
  if (hiddenPaths.some(p => pathname?.startsWith(p))) return null

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-20 right-4 z-[9999] w-14 h-14 rounded-full flex items-center justify-center shadow-2xl cursor-pointer border-2"
            style={{
              background: 'var(--brand-primary)',
              borderColor: 'color-mix(in srgb, var(--brand-primary) 50%, white)',
              boxShadow: '0 4px 20px color-mix(in srgb, var(--brand-primary) 40%, transparent)'
            }}
          >
            <MessageCircle size={26} className="text-black" />
          </motion.button>
        )}
      </AnimatePresence>

      <VirtualAssistant
        lang="vi"
        appMode={null}
        cartItems={[]}
        remainingBudget={0}
        missionTitle={null}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
    </>
  )
}
