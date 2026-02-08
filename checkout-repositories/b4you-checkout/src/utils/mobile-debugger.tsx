'use client';

import { useEffect } from 'react';
import { env } from '@/env';

declare global {
  interface Window {
    __ERUDA__?: boolean;
  }
}

export default function MobileDebugger() {
  if (env.NEXT_PUBLIC_NODE_ENV !== 'dev') return null;

  useEffect(() => {
    let mounted = true;

    async function init() {
      if (typeof window === 'undefined') return;
      if (window.__ERUDA__) return;

      const eruda = await import('eruda');

      if (!mounted) return;

      eruda.default.init();
      window.__ERUDA__ = true;

       
      console.log('[eruda] initialized');
    }

    init();

    return () => {
      mounted = false;
    };
  }, []);

  return null;
}