"use client";
import * as React from "react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

/**
 * Enhanced SplashScreen component with modern design and animations
 * Based on high-quality fitness app examples from Mobbin
 */
function SplashScreen({ onComplete }: { onComplete?: () => void }) {
  const [isVisible, setIsVisible] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const router = useRouter();

  // Add staggered animations when component mounts
  useEffect(() => {
    // Initial fade in
    setIsVisible(true);

    // Staggered animations for a more polished feel
    const contentTimer = setTimeout(() => {
      setShowContent(true);
    }, 600);

    const buttonTimer = setTimeout(() => {
      setShowButton(true);
    }, 1200);

    // Auto-proceed after 3 seconds if onComplete is provided
    const autoCompleteTimer = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, 3000);

    return () => {
      clearTimeout(contentTimer);
      clearTimeout(buttonTimer);
      clearTimeout(autoCompleteTimer);
    };
  }, [onComplete]);

  const handleGetStarted = () => {
    if (onComplete) {
      onComplete();
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <section className="w-full h-screen mx-auto relative overflow-hidden bg-gradient-to-b from-[#1a2151] to-[#2d3a80]">
      {/* Background decorative elements - modern fitness app style */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        {/* Abstract shapes */}
        <div className="absolute top-[10%] right-[10%] w-64 h-64 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-500/20 blur-3xl animate-float-organic"></div>
        <div className="absolute bottom-[20%] left-[5%] w-72 h-72 rounded-full bg-gradient-to-r from-teal-400/10 to-blue-500/10 blur-3xl animate-float-organic" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-[40%] left-[20%] w-48 h-48 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-3xl animate-float-organic" style={{ animationDelay: '2s' }}></div>

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('/images/grid-pattern.png')] bg-repeat opacity-5"></div>
      </div>

      {/* Main content container with animation */}
      <div
        className={`relative z-10 flex flex-col items-center justify-center h-full px-8 transition-all duration-1000 ease-out ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Logo with enhanced animation */}
        <div
          className={`mb-10 transition-all duration-700 ease-out ${
            showContent ? 'opacity-100 transform-none' : 'opacity-0 -translate-y-10'
          }`}
        >
          <div className="w-36 h-36 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center shadow-lg relative overflow-hidden group">
            {/* Animated ring */}
            <div className="absolute inset-0 border-4 border-white/20 rounded-full animate-spin-slow"></div>

            {/* Logo */}
            <div className="relative z-10 w-20 h-20 flex items-center justify-center">
              <Image
                src="/images/routinize-logo.svg"
                alt="Routinize Logo"
                width={80}
                height={80}
                className="drop-shadow-lg animate-pulse-organic"
                priority
              />
            </div>

            {/* Inner glow effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-600/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
        </div>

        {/* Welcome text with enhanced typography */}
        <div
          className={`text-center transition-all duration-700 delay-300 ease-out ${
            showContent ? 'opacity-100 transform-none' : 'opacity-0 -translate-y-10'
          }`}
        >
          <h1 className="text-5xl font-bold tracking-tight text-white mb-3 font-klasik">
            ROUTINIZE
          </h1>
          <h2 className="text-3xl font-medium tracking-tight text-blue-200 font-klasik">
            WELLNESS
          </h2>
          <p className="mt-6 text-lg text-blue-100/80 font-manrope max-w-md">
            Build habits that last a lifetime and transform your fitness journey
          </p>
        </div>

        {/* Get Started button with enhanced animation and interaction */}
        <button
          onClick={handleGetStarted}
          className={`mt-12 px-10 py-4 bg-gradient-to-r from-teal-400 to-blue-500 text-white font-medium rounded-full shadow-lg transition-all duration-700 delay-500 ease-out hover:shadow-xl hover:scale-105 active:scale-95 ${
            showButton ? 'opacity-100 transform-none' : 'opacity-0 translate-y-10'
          }`}
        >
          <span className="font-manrope text-lg">Get Started</span>
        </button>
      </div>
    </section>
  );
}

export default SplashScreen;
