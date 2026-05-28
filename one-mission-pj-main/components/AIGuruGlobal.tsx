'use client';

import React from 'react';
import { GuruProvider } from '@/lib/guru-state';
import AIGuru from './AIGuru';

export default function AIGuruGlobal() {
  return (
    <GuruProvider>
      <AIGuru />
    </GuruProvider>
  );
}
