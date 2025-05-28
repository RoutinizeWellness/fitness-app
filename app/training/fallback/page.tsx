"use client"

import dynamic from 'next/dynamic'

// Dynamically import the completely static page with no SSR to avoid any potential issues
const StaticTrainingPage = dynamic(
  () => import('../static-page'),
  {
    ssr: false,
    loading: () => (
      <div className="container max-w-4xl mx-auto p-4 pt-20 pb-24 flex justify-center items-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4">Cargando versión alternativa...</p>
        </div>
      </div>
    )
  }
)

export default function FallbackPage() {
  return <StaticTrainingPage />
}
