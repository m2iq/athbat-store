"use client";

import { AlertTriangle, X } from "lucide-react";
import {
    createContext,
    useCallback,
    useContext,
    useState,
    type ReactNode,
} from "react";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning";
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{
    options: ConfirmOptions;
    resolve: (v: boolean) => void;
  } | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ options, resolve });
    });
  }, []);

  const handleConfirm = () => {
    state?.resolve(true);
    setState(null);
  };

  const handleCancel = () => {
    state?.resolve(false);
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleCancel}
          />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-slide-in">
            <button
              onClick={handleCancel}
              className="absolute top-4 left-4 p-1 hover:bg-gray-100 rounded-lg"
            >
              <X size={18} className="text-gray-400" />
            </button>
            <div className="flex items-start gap-3 mb-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  state.options.variant === "danger"
                    ? "bg-red-100"
                    : "bg-yellow-100"
                }`}
              >
                <AlertTriangle
                  size={20}
                  className={
                    state.options.variant === "danger"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {state.options.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {state.options.message}
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleConfirm}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-colors ${
                  state.options.variant === "danger"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-yellow-600 hover:bg-yellow-700"
                }`}
              >
                {state.options.confirmText ?? "تأكيد"}
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                {state.options.cancelText ?? "إلغاء"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
