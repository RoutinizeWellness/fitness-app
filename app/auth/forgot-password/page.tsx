"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import "./forgot-password.css";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("Jonathansmth@gmail.com");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setErrorMessage("Please enter your email address");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const { error } = await resetPassword(email);

      if (error) {
        console.error("Error sending reset email:", error);
        setErrorMessage(error.message || "Error sending reset email. Please try again.");
        setIsSubmitting(false);
      } else {
        setIsSubmitting(false);
        setIsSuccess(true);

        // Redirect after showing success message
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setErrorMessage("An unexpected error occurred. Please try again later.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="reset-password">
      {/* Remember password? Login link */}
      <div className="remember-password-login">
        <span>
          <span className="remember-password-login-span">
            Remember password?{" "}
          </span>
          <Link href="/auth/login">
            <span className="remember-password-login-span2">Login</span>
          </Link>
        </span>
      </div>

      {/* Page title */}
      <div className="forgot-your-password">Forgot your password?</div>

      {/* Back button */}
      <div className="icons">
        <div className="ellipse"></div>
        <Link href="/auth/login">
          <img className="back-icon" src="/images/back-icon0.svg" alt="Back" />
        </Link>
      </div>

      {/* Content area */}
      <div className="content">
        <div className="rectangle-23775"></div>
        <div className="enter-your-registered-email-below-to-receive-password-reset-instruction">
          Enter your registered email below to receive password reset instruction
        </div>

        {/* Email input area */}
        <div className="rectangle-23726"></div>
        <div className="text">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="jonathansmth-gmail-com"
            placeholder="Enter your email"
            disabled={isSubmitting || isSuccess}
          />
          <img className="vector-149" src="/images/vector-1490.svg" alt="" />
        </div>

        {/* Error message */}
        {errorMessage && (
          <div style={{
            position: 'absolute',
            top: '63%',
            left: '10%',
            right: '10%',
            backgroundColor: 'rgba(255, 103, 103, 0.1)',
            padding: '8px 12px',
            borderRadius: '8px',
            color: '#573353',
            fontSize: '12px',
            textAlign: 'center',
            fontFamily: 'Manrope, sans-serif'
          }}>
            {errorMessage}
          </div>
        )}

        {/* Submit button */}
        <form onSubmit={handleSubmit}>
          <div className="button-334-x-variant-4">
            <button
              type="submit"
              className="button"
              disabled={isSubmitting || isSuccess}
            >
              <div className="text2">
                {isSubmitting ? "Sending..." : isSuccess ? "Link Sent!" : "Send Reset Link"}
              </div>
            </button>
          </div>
        </form>
      </div>

      {/* Illustration */}
      <div className="frame-19">
        <img className="xmlid-3" src="/images/xmlid-30.svg" alt="Reset password illustration" />
      </div>

      {/* Success message overlay */}
      {isSuccess && (
        <div className="success-overlay">
          <div className="success-modal">
            <div className="success-icon">✓</div>
            <h3>Reset Link Sent!</h3>
            <p>Please check your email for instructions to reset your password.</p>
            <p className="redirecting">Redirecting to login page...</p>
          </div>
        </div>
      )}
    </div>
  );
}
