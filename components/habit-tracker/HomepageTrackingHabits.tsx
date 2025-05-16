"use client";
import * as React from "react";
import { useEffect, useState } from "react";

/**
 * HomepageTrackingHabits component displays a tracking habits image
 * with specific styling for the homepage based on the Figma design
 */
function HomepageTrackingHabits() {
  const [isVisible, setIsVisible] = useState(false);

  // Add fade-in animation when component mounts
  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <figure className="w-full max-w-[414px] mx-auto relative">
      {/* Background decorative elements */}
      <div className="absolute -top-4 -right-4 w-20 h-20 bg-[#FDA758]/10 rounded-full blur-xl z-0"></div>
      <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-[#8C80F8]/10 rounded-full blur-lg z-0"></div>
      
      {/* Main image with proper dimensions from Figma design */}
      <div 
        className={`relative z-10 transition-opacity duration-700 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      >
        <img
          src="/images/tracking-habits-visualization.png"
          alt="Tracking habits visualization"
          className="object-contain mx-auto w-full aspect-[0.46] max-w-[414px] rounded-[24px] shadow-lg"
          onError={(e) => {
            // Fallback to external image if local image fails to load
            e.currentTarget.src = "https://cdn.builder.io/api/v1/image/assets/TEMP/382de0077e7b9f9f5fde503249646337a5c04281?placeholderIfAbsent=true";
            console.warn("Local image failed to load, using fallback image");
          }}
        />
        
        {/* Overlay gradient for better text readability if needed */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#573353]/10 to-transparent rounded-[24px] pointer-events-none"></div>
      </div>
      
      {/* Optional caption */}
      <figcaption className="text-center text-[#573353]/70 text-sm mt-3 font-medium">
        Track your daily habits and build consistency
      </figcaption>
    </figure>
  );
}

// Default export for normal React usage
export default HomepageTrackingHabits;

// Named export for Augment compatibility
export { HomepageTrackingHabits };
