"use client"

import { ThemeProvider } from "@/components/theme-provider"
import { ActionFeedbackProvider } from "@/components/feedback/action-feedback"
import { ProvidersWrapper } from "./providers-wrapper"
import { ServerClientDebug } from "@/components/debug/server-client-debug"

interface ClientLayoutProps {
  children: React.ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="routinize-theme">
      <ActionFeedbackProvider>
        <ProvidersWrapper>
          {children}
          <ServerClientDebug />
        </ProvidersWrapper>
      </ActionFeedbackProvider>
    </ThemeProvider>
  )
}
