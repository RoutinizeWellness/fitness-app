import type { Metadata, Viewport } from "next"
import { Inter, Roboto_Serif } from "next/font/google"
import "./globals.css"

// Usar Roboto Serif como reemplazo para Klasik
const klasik = Roboto_Serif({
  subsets: ['latin'],
  variable: '--font-klasik',
  display: 'swap',
})
import { ThemeProvider } from "@/components/theme-provider"
import { EnhancedThemeProvider } from "@/components/theme/theme-provider"
import { OrganicThemeProvider } from "@/components/theme/organic-theme-provider"
import { HabitBuilderThemeProvider } from "@/components/theme/habit-builder-theme-provider"
import { ActionFeedbackProvider } from "@/components/feedback/action-feedback"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Routinize Wellness",
  description: "Tu compañero integral para fitness, nutrición y bienestar",
  generator: 'v0.dev',
  manifest: '/manifest.json',
  icons: [
    { rel: 'icon', url: '/favicon.ico' },
    { rel: 'apple-touch-icon', url: '/icons/icon-192x192.png' },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Routinize Wellness',
  },
  keywords: 'fitness, nutrición, entrenamiento, bienestar, salud, ejercicio, hábitos saludables',
  authors: [{ name: 'Routinize Wellness Team' }],
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://routinizewellness.com',
    title: 'Routinize Wellness',
    description: 'Tu compañero integral para fitness, nutrición y bienestar',
    siteName: 'Routinize Wellness',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#FDA758',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#FDA758" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="application-name" content="Routinize Wellness" />
      </head>
      <body className={`${inter.className} ${klasik.variable} h-full monumental-theme`}>
        <ThemeProvider defaultTheme="system" storageKey="routinize-theme">
          <EnhancedThemeProvider defaultTheme="light" storageKey="routinize-ui">
            <OrganicThemeProvider defaultTheme="light" storageKey="routinize-organic">
              <HabitBuilderThemeProvider defaultTheme="light" storageKey="routinize-habit">
                <ActionFeedbackProvider>
                  <Providers>
                    {children}
                  </Providers>
                </ActionFeedbackProvider>
              </HabitBuilderThemeProvider>
            </OrganicThemeProvider>
          </EnhancedThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
