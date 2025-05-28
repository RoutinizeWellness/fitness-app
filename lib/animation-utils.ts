"use client"

/**
 * Animation utilities for safely handling framer-motion animations
 * This file provides utilities to safely import and use framer-motion
 * with proper error handling and fallbacks
 */

// Feature flag to enable/disable animations globally
// This can be controlled via user preferences or system capabilities
let animationsEnabled = true;

/**
 * Check if animations should be enabled based on system capabilities and user preferences
 * @returns boolean indicating if animations should be enabled
 */
export function shouldEnableAnimations(): boolean {
  // Check if we're in a browser environment
  const isBrowser = typeof window !== 'undefined';
  
  // If not in browser, disable animations to prevent SSR issues
  if (!isBrowser) {
    return false;
  }
  
  // Check for reduced motion preference
  if (isBrowser && window.matchMedia) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return false;
    }
  }
  
  // Check for low-end devices
  // This is a simple heuristic and could be improved
  if (isBrowser && navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
    return false;
  }
  
  // Return the global setting
  return animationsEnabled;
}

/**
 * Enable or disable animations globally
 * @param enabled boolean to enable or disable animations
 */
export function setAnimationsEnabled(enabled: boolean): void {
  animationsEnabled = enabled;
}

/**
 * Animation variants for common animations
 * These can be used with framer-motion components
 */
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

export const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

export const slideDown = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

export const slideLeft = {
  hidden: { opacity: 0, x: 20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.5 }
  }
};

export const slideRight = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.5 }
  }
};

export const scale = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5 }
  }
};

export const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

/**
 * Animation presets for common UI patterns
 */
export const animationPresets = {
  // Card animations
  card: {
    initial: "hidden",
    animate: "visible",
    variants: {
      hidden: { opacity: 0, y: 20 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.4, ease: "easeOut" }
      }
    },
    whileHover: { 
      y: -5,
      boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
      transition: { duration: 0.2 }
    }
  },
  
  // Button animations
  button: {
    whileHover: { 
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    whileTap: { 
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  },
  
  // List item animations
  listItem: {
    variants: {
      hidden: { opacity: 0, x: -20 },
      visible: { 
        opacity: 1, 
        x: 0,
        transition: { duration: 0.3 }
      }
    }
  },
  
  // Page transitions
  page: {
    initial: "hidden",
    animate: "visible",
    exit: "exit",
    variants: {
      hidden: { opacity: 0 },
      visible: { 
        opacity: 1,
        transition: { duration: 0.5, when: "beforeChildren", staggerChildren: 0.1 }
      },
      exit: { 
        opacity: 0,
        transition: { duration: 0.3 }
      }
    }
  }
};

/**
 * Safe animation properties that can be used with or without framer-motion
 * These properties will be ignored if animations are disabled
 */
export function getSafeAnimationProps(animationType: keyof typeof animationPresets) {
  if (!shouldEnableAnimations()) {
    return {};
  }
  
  return animationPresets[animationType];
}
