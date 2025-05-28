"use client"

import { LucideProps } from "lucide-react"

export function User3D(props: LucideProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 15c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 6z" />
      <path d="M3 20.2c0-1.267.818-2.387 2.032-2.764A15.53 15.53 0 0 1 12 16c2.472 0 4.768.614 6.768 1.645A2.988 2.988 0 0 1 21 20.2V22H3v-1.8z" />
      <path d="M14 5c.5 0 1 .16 1.42.45.4.28.74.65.97 1.08.23.42.35.9.35 1.38 0 .8-.36 1.5-.92 2.01-.28.26-.6.47-.95.62" />
      <path d="M10 5c-.5 0-1 .16-1.42.45-.4.28-.74.65-.97 1.08-.23.42-.35.9-.35 1.38 0 .8.36 1.5.92 2.01.28.26.6.47.95.62" />
      <path d="M12 13v3" />
      <path d="M10 19l2 2 2-2" />
    </svg>
  )
}
