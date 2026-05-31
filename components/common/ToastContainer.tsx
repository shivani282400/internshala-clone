'use client';

import React from 'react';
import { useToastStore } from '@/store/toastStore';

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div 
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full sm:w-auto pointer-events-none"
      aria-live="assertive"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-[#1A1A2E]/95 backdrop-blur-md text-white text-sm px-4 py-3 rounded-lg shadow-xl flex items-center justify-between gap-3 animate-fade-in border border-white/10"
          role="alert"
        >
          <div className="flex items-center gap-2">
            {toast.type === 'success' && <span className="text-green-400">✓</span>}
            {toast.type === 'error' && <span className="text-red-400">✕</span>}
            <span>{toast.message}</span>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-gray-400 hover:text-white transition-colors p-1 leading-none text-base cursor-pointer"
            aria-label="Close notification"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}
