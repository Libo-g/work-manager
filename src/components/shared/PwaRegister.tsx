'use client';

import { useEffect } from 'react';

export function PwaRegister() {
  useEffect(() => {
    // 仅在正式环境（HTTPS）注册 Service Worker，本地开发跳过
    if (
      'serviceWorker' in navigator &&
      window.location.protocol === 'https:'
    ) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // 静默处理注册失败
      });
    }
  }, []);

  return null;
}
