"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

const ToastContext = createContext<{
  toast: (message: string, type?: Toast["type"]) => void;
}>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[90vw] max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`rounded-xl px-4 py-3 font-mono text-[0.7rem] shadow-lg animate-[slideUp_0.3s_ease-out] ${
              t.type === "success"
                ? "bg-[#2A5A2A] text-white"
                : t.type === "error"
                  ? "bg-accent text-white"
                  : "bg-vinyl text-[#D9D3C8]"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
