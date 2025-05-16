"use client"

import dynamic from "next/dynamic"

// Import the redirect component
const RedirectComponent = dynamic(() => import('./redirect'), { ssr: false })

export default function HabitDashboardPage() {
  return <RedirectComponent />
}
