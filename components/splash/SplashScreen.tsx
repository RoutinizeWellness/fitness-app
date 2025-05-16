"use client";
import * as React from "react";
import { useEffect, useState } from "react";
import Image from "next/image";

/**
 * SplashScreen component displays a welcome screen with background image and text
 * using the Roboto Serif and Manrope fonts with the specified color palette
 */
function SplashScreen() {
  const [isVisible, setIsVisible] = useState(false);
  const [showContent, setShowContent] = useState(false);

  // Add fade-in animations when component mounts
  useEffect(() => {
    setIsVisible(true);

    // Delay showing the content for a smoother animation
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="w-[414px] h-[896px] mx-auto relative overflow-hidden bg-[#FFF3E9]">
      {/* Main illustration */}
      <Image
        className="splash-screen-illustration-1 absolute inset-0 z-0"
        src="/splash-screen-illustration-1.png"
        alt="Splash screen illustration"
        width={414}
        height={940}
        priority
      />

      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-monumental-lavenderLight/30 to-transparent z-0"></div>

      {/* Background decorative elements */}
      <div className="absolute top-20 right-10 w-32 h-32 rounded-full bg-monumental-lavender/20 blur-xl z-0"></div>
      <div className="absolute bottom-40 left-10 w-40 h-40 rounded-full bg-monumental-orange/10 blur-xl z-0"></div>

      {/* Main content container with animation */}
      <div
        className={`relative z-10 flex flex-col items-center justify-center h-full px-8 transition-opacity duration-1000 ease-in-out ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Logo or icon */}
        <div
          className={`w-32 h-32 mb-8 transition-all duration-700 ease-out ${
            showContent ? 'opacity-100 transform-none' : 'opacity-0 -translate-y-10'
          }`}
        >
          <div className="w-32 h-32 rounded-full bg-gradient-to-r from-monumental-orange to-monumental-red flex items-center justify-center shadow-lg">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 6V12L16 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Welcome text */}
        <div
          className={`text-center transition-all duration-700 delay-300 ease-out ${
            showContent ? 'opacity-100 transform-none' : 'opacity-0 -translate-y-10'
          }`}
        >
          <h1 className="text-5xl font-bold tracking-tight uppercase text-monumental-blue mb-4 font-klasik">
            WELCOME TO
          </h1>
          <h2 className="text-4xl font-bold tracking-tight uppercase text-monumental-purple font-klasik">
            Monumental habits
          </h2>
          <p className="mt-6 text-lg text-monumental-purple/70 font-manrope">
            Build habits that last and transform your life
          </p>
        </div>

        {/* Get Started button */}
        <button
          className={`mt-12 px-8 py-4 bg-gradient-to-r from-monumental-orange to-monumental-red text-white font-medium rounded-full shadow-lg transition-all duration-700 delay-500 ease-out ${
            showContent ? 'opacity-100 transform-none' : 'opacity-0 translate-y-10'
          }`}
        >
          <span className="font-manrope">Get Started</span>
        </button>
      </div>
    </section>
  );
}

export default SplashScreen;
