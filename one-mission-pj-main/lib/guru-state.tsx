'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface GuruState {
  message: string;
  trigger: number;
  silentMessage: string;
  silentTrigger: number;
  lang: string;
  setMessage: (msg: string) => void;
  setSilentMessage: (msg: string) => void;
  setLang: (l: string) => void;
  incrementTrigger: () => void;
  incrementSilentTrigger: () => void;
}

const GuruContext = createContext<GuruState | null>(null);

export function GuruProvider({ children }: { children: ReactNode }) {
  const [message, setMessageState] = useState('');
  const [trigger, setTrigger] = useState(0);
  const [silentMessage, setSilentMessageState] = useState('');
  const [silentTrigger, setSilentTrigger] = useState(0);
  const [lang, setLangState] = useState('vn');

  const setMessage = useCallback((msg: string) => {
    setMessageState(msg);
    setTrigger(t => t + 1);
  }, []);

  const setSilentMessage = useCallback((msg: string) => {
    setSilentMessageState(msg);
    setSilentTrigger(t => t + 1);
  }, []);

  const setLang = useCallback((l: string) => {
    setLangState(l);
  }, []);

  const incrementTrigger = useCallback(() => setTrigger(t => t + 1), []);
  const incrementSilentTrigger = useCallback(() => setSilentTrigger(t => t + 1), []);

  return (
    <GuruContext.Provider value={{
      message, trigger, silentMessage, silentTrigger, lang,
      setMessage, setSilentMessage, setLang,
      incrementTrigger, incrementSilentTrigger
    }}>
      {children}
    </GuruContext.Provider>
  );
}

export function useGuru(): GuruState {
  const ctx = useContext(GuruContext);
  if (!ctx) throw new Error('useGuru must be used within GuruProvider');
  return ctx;
}
