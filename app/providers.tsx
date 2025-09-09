"use client";
import { SessionProvider } from "next-auth/react";
import { NotificationProvider } from "@/app/hooks/useNotifications";
import type { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </SessionProvider>
  );
}
