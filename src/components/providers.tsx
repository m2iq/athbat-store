"use client";

import { type ReactNode } from "react";
import { AuthProvider } from "./auth-provider";
import { ConfirmProvider } from "./confirm-modal";
import { SidebarProvider } from "./sidebar";
import { ToastProvider } from "./toast";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <ConfirmProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </ConfirmProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
