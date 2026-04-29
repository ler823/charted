import React, { createContext, useContext, useRef, useState } from "react";

export type ToastType = "success" | "error" | "info";

interface ToastState {
  message: string;
  type: ToastType;
  visible: boolean;
}

interface ToastContextValue {
  toast: ToastState;
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState>({
    message: "",
    type: "success",
    visible: false,
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideToast = () => setToast((prev) => ({ ...prev, visible: false }));

  const showToast = (message: string, type: ToastType = "success") => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ message, type, visible: true });
    timerRef.current = setTimeout(hideToast, 2500);
  };

  return (
    <ToastContext.Provider value={{ toast, showToast, hideToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
