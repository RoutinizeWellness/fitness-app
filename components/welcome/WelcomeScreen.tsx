"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";

/**
 * WelcomeScreen component displays an onboarding welcome screen
 * with background, text, and navigation buttons
 */
function WelcomeScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Content for the welcome slides
  const slides = [
    {
      title: "Track Your Daily Habits",
      description: "Monitor your progress and build consistency with our easy-to-use habit tracking tools.",
      image: "/images/welcome-habits.svg",
      color: "from-monumental-orange to-monumental-red"
    },
    {
      title: "Achieve Your Goals",
      description: "Set meaningful goals and watch as daily habits transform into lasting achievements.",
      image: "/images/welcome-goals.svg",
      color: "from-monumental-blue to-monumental-lavender"
    },
    {
      title: "Stay Motivated",
      description: "Get insights, reminders and celebrate your streaks to stay on track.",
      image: "/images/welcome-motivation.svg",
      color: "from-monumental-purple to-monumental-lavender"
    }
  ];

  // Handle slide navigation
  const goToNextSlide = () => {
    if (currentSlide < slides.length - 1 && !isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlide(currentSlide + 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const goToPrevSlide = () => {
    if (currentSlide > 0 && !isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlide(currentSlide - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  return (
    <section className="w-[414px] h-[896px] mx-auto relative overflow-hidden bg-white">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-monumental-lavenderLight/30 to-white z-0"></div>
      
      {/* Background decorative elements */}
      <div className="absolute top-20 right-10 w-32 h-32 rounded-full bg-monumental-lavender/20 blur-xl z-0"></div>
      <div className="absolute bottom-40 left-10 w-40 h-40 rounded-full bg-monumental-orange/10 blur-xl z-0"></div>
      
      {/* Main content container */}
      <div className="relative z-10 flex flex-col h-full px-8">
        {/* Header with skip button */}
        <header className="pt-12 pb-4 flex justify-end">
          <Link 
            href="/dashboard" 
            className="text-monumental-purple/70 font-manrope text-sm font-medium"
          >
            Skip
          </Link>
        </header>
        
        {/* Slide content */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Slide image */}
          <div 
            className={`w-64 h-64 mb-8 transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}
          >
            <div className={`w-64 h-64 rounded-full bg-gradient-to-r ${slides[currentSlide].color} flex items-center justify-center shadow-lg`}>
              <img 
                src={slides[currentSlide].image} 
                alt={slides[currentSlide].title}
                className="w-40 h-40 object-contain"
              />
            </div>
          </div>
          
          {/* Slide text */}
          <div 
            className={`text-center mb-12 transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}
          >
            <h1 className="text-3xl font-bold tracking-tight text-monumental-purple mb-4 font-klasik">
              {slides[currentSlide].title}
            </h1>
            <p className="text-lg text-monumental-purple/70 font-manrope max-w-xs mx-auto">
              {slides[currentSlide].description}
            </p>
          </div>
          
          {/* Slide indicators */}
          <div className="flex space-x-2 mb-8">
            {slides.map((_, index) => (
              <div 
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'w-8 bg-monumental-orange' 
                    : 'bg-monumental-purple/20'
                }`}
              />
            ))}
          </div>
        </div>
        
        {/* Navigation buttons */}
        <div className="pb-12 flex justify-between">
          <button 
            onClick={goToPrevSlide}
            className={`w-12 h-12 rounded-full flex items-center justify-center border border-monumental-purple/20 transition-opacity ${
              currentSlide === 0 ? 'opacity-50 cursor-not-allowed' : 'opacity-100'
            }`}
            disabled={currentSlide === 0}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="#573353" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          {currentSlide < slides.length - 1 ? (
            <button 
              onClick={goToNextSlide}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-r from-monumental-orange to-monumental-red shadow-md"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 6L15 12L9 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          ) : (
            <Link 
              href="/dashboard"
              className="px-8 py-3 rounded-full bg-gradient-to-r from-monumental-orange to-monumental-red text-white font-medium shadow-md font-manrope"
            >
              Get Started
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

export default WelcomeScreen;
