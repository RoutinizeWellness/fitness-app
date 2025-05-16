"use client";
import * as React from "react";
import { useState } from "react";
import WelcomeScreen from "./WelcomeScreen";

/**
 * InputDesign component provides a wrapper for the WelcomeScreen
 * with additional functionality for customization
 */
function InputDesign() {
  const [showWelcome, setShowWelcome] = useState(true);
  
  // Function to skip the welcome screen
  const handleSkip = () => {
    setShowWelcome(false);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      {showWelcome ? (
        <>
          <WelcomeScreen />
          <button 
            onClick={handleSkip}
            className="mt-4 text-monumental-purple/70 font-manrope text-sm underline"
          >
            Skip welcome screens in development
          </button>
        </>
      ) : (
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-monumental-purple mb-4 font-klasik">
            Welcome to the App!
          </h1>
          <p className="text-monumental-purple/70 font-manrope mb-6">
            You've skipped the welcome screens.
          </p>
          <button 
            onClick={() => setShowWelcome(true)}
            className="px-6 py-2 bg-gradient-to-r from-monumental-orange to-monumental-red text-white font-medium rounded-full shadow-md font-manrope"
          >
            Show Welcome Screens Again
          </button>
        </div>
      )}
    </div>
  );
}

export default InputDesign;
