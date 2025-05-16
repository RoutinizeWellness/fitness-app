"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface HabitBuilderOnboardingProps {
  onComplete?: () => void
}

export function HabitBuilderOnboarding({ onComplete }: HabitBuilderOnboardingProps) {
  const [currentScreen, setCurrentScreen] = useState(0)
  const router = useRouter()

  // Define the screens
  const screens = [
    {
      id: "splash",
      title: "Routinize",
      type: "splash"
    },
    {
      id: "intro1",
      title: "Routinize",
      description: "We can help you to be a better version of yourself.",
      type: "intro"
    },
    {
      id: "intro2",
      title: "Habits",
      description: "We can help you to be a better version of yourself.",
      type: "intro"
    }
  ]

  const handleNext = () => {
    if (currentScreen < screens.length - 1) {
      setCurrentScreen(prev => prev + 1)
    } else {
      // On last screen, complete onboarding
      if (onComplete) {
        onComplete()
      } else {
        router.push("/auth/login")
      }
    }
  }

  const handleSkip = () => {
    if (onComplete) {
      onComplete()
    } else {
      router.push("/auth/login")
    }
  }

  // Auto-advance from splash screen after 2 seconds
  useEffect(() => {
    if (currentScreen === 0) {
      const timer = setTimeout(() => {
        setCurrentScreen(1)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [currentScreen])

  return (
    <div className="relative h-screen w-full overflow-hidden bg-white">
      <AnimatePresence mode="wait">
        {currentScreen === 0 ? (
          <SplashScreen key="splash" />
        ) : currentScreen === 1 ? (
          <IntroScreen1 key="intro1" />
        ) : (
          <IntroScreen2 key="intro2" />
        )}
      </AnimatePresence>

      {/* Navigation controls - only show on intro screens */}
      {currentScreen > 0 && (
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex justify-between items-center">
            <button
              onClick={handleSkip}
              className="font-manrope font-bold text-[17px] text-[#573353]"
            >
              Skip
            </button>

            {/* Pagination indicators */}
            <div className="flex space-x-2">
              {screens.slice(1).map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-4 h-4 rounded-full",
                    currentScreen === index + 1
                      ? "bg-[#573353] shadow-[0px_20px_60px_rgba(87,51,83,0.15)]"
                      : "bg-[#573353] opacity-20"
                  )}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="font-manrope font-bold text-[17px] text-[#573353]"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function SplashScreen() {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative w-full h-full">
        {/* Background patterns */}
        <div className="absolute w-[171.51px] h-[171.51px] left-[93.92px] top-[-8.72px] transform -rotate-6">
          <div className="w-[86.83px] h-[155.72px] absolute left-[15.55px] top-[155.73px] bg-[#FFF2E9] transform rotate-[39deg]"></div>
        </div>

        <div className="absolute w-[434px] h-[940px] left-[338.56px] top-[23.28px] transform -rotate-6">
          <div className="absolute w-[90.32px] h-[93.33px] left-[267.48px] top-[122.54px] bg-[#FFF2E9]"></div>
        </div>

        <div className="absolute w-[164.6px] h-[208.16px] left-[276.39px] top-[175.58px] bg-[#FFF2E9] transform -rotate-[135deg]"></div>

        <div className="absolute w-[169.58px] h-[169.58px] left-[182px] top-[176px]">
          <div className="absolute w-[95.27px] h-[144.54px] left-[249.37px] top-[345.58px] bg-[#FFF2E9] transform -rotate-[135deg]"></div>
        </div>

        <div className="absolute w-[434px] h-[940px] left-[-53px] top-[78.21px]"></div>

        {/* Title */}
        <div className="absolute w-[264px] h-[120px] left-[75px] top-[96px]">
          <h1 className="font-klasik font-normal text-[40px] leading-[40px] text-center tracking-tight uppercase text-[#573353]">
            Routinize
          </h1>
        </div>
      </div>
    </motion.div>
  )
}

function IntroScreen1() {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Content */}
      <div className="absolute w-[399px] h-[619px] left-[8px] top-[80px]">
        {/* Title */}
        <div className="absolute w-[246px] h-[64px] left-[84px] top-[0px]">
          <h1 className="font-klasik font-normal text-[32px] leading-[32px] text-center tracking-tight uppercase text-[#573353]">
            Routinize
          </h1>
        </div>

        {/* Illustration */}
        <div className="absolute w-[350px] h-[487px] left-[42px] top-[64px]">
          <div className="absolute left-[10.14%] right-[5.31%] top-[16.07%] bottom-[29.58%] bg-white rounded-[10px]"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src="/images/onboarding/intro-illustration.svg"
              alt="Introduction Illustration"
              width={350}
              height={487}
              className="object-contain"
            />
          </div>
        </div>

        {/* Description */}
        <div className="absolute left-[7.73%] right-[7.73%] top-[72.66%] bottom-[21.99%]">
          <p className="font-manrope font-bold text-[17px] leading-[24px] text-center uppercase text-[#573353]">
            We can help you to be a better version of yourself.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

function IntroScreen2() {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Content */}
      <div className="absolute w-[399px] h-[619px] left-[8px] top-[80px]">
        {/* Title */}
        <div className="absolute w-[246px] h-[64px] left-[84px] top-[0px]">
          <h1 className="font-klasik font-normal text-[32px] leading-[32px] text-center tracking-tight uppercase text-[#573353]">
            Habits
          </h1>
        </div>

        {/* Illustration */}
        <div className="absolute w-[399px] h-[399px] left-[0px] top-[106px]">
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src="/images/onboarding/habits-illustration.svg"
              alt="Habits Illustration"
              width={399}
              height={399}
              className="object-contain"
            />
          </div>
        </div>

        {/* Quote */}
        <div className="absolute w-[374px] h-[146px] left-[20px] top-[107px]">
          <div className="absolute w-[374px] h-[146px] left-[0px] top-[0px] bg-white rounded-[12px]"></div>
          <div className="absolute left-[45.45%] right-[-8.82%] top-[-25.34%] bottom-[-115.75%] bg-[url('/images/habit-pattern.svg')] bg-contain bg-no-repeat mix-blend-normal opacity-10"></div>
          <div className="absolute left-[4.01%] right-[2.94%] top-[17.81%] bottom-[39.73%]">
            <p className="font-klasik font-normal text-[18px] leading-[20px] tracking-tight uppercase text-[#573353]">
              We first make our habits, and then our habits makes us.
            </p>
          </div>
          <div className="absolute w-[85px] h-[24px] left-[14px] top-[88px]">
            <p className="font-manrope font-bold text-[12px] leading-[24px] text-center uppercase text-[#573353] opacity-50">
              - anonymous
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="absolute left-[7.73%] right-[7.73%] top-[72.66%] bottom-[21.99%]">
          <p className="font-manrope font-bold text-[17px] leading-[24px] text-center uppercase text-[#573353]">
            We can help you to be a better version of yourself.
          </p>
        </div>
      </div>
    </motion.div>
  )
}
