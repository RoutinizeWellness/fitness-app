"use client"

import dynamic from 'next/dynamic'

// Dynamically import the animated page with no SSR to avoid any potential issues
const AnimatedTrainingPage = dynamic(
  () => import('./animated-page'),
  {
    ssr: false,
    loading: () => (
      <div className="container max-w-4xl mx-auto p-4 pt-20 pb-24 flex justify-center items-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4">Cargando...</p>
        </div>
      </div>
    )
  }
)

export default function TrainingPage() {
  // Use the animated version of the training page
  return <AnimatedTrainingPage />
}
