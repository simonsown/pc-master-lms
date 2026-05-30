'use client';
import { useEffect } from 'react';

declare global {
  interface Window {
    chatbase?: any;
  }
}

export default function ChatbaseScript() {
  useEffect(() => {
    if (window.chatbase && window.chatbase('getState') === 'initialized') return;
    window.chatbase = (...args: any[]) => {
      if (!window.chatbase.q) window.chatbase.q = [];
      window.chatbase.q.push(args);
    };
    window.chatbase = new Proxy(window.chatbase, {
      get(target: any, prop: string) {
        if (prop === 'q') return target.q;
        return (...args: any[]) => target(prop, ...args);
      }
    });
    const script = document.createElement('script');
    script.src = 'https://www.chatbase.co/embed.min.js';
    script.id = 'Xk6BgUmtM4fmXWOQfSsm_';
    script.setAttribute('domain', 'www.chatbase.co');
    script.defer = true;
    document.body.appendChild(script);
  }, []);

  return null;
}
