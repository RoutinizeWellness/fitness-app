"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./signup.css";

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    keepSignedIn: true,
    emailMe: true
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Here you would typically call your authentication service
    // For now, we'll just redirect to the dashboard
    router.push("/dashboard");
  };

  return (
    <div className="sign-up-page">
      {/* Already have an account */}
      <div className="already-have-an-account-sign-in">
        <span>
          <span className="already-have-an-account-sign-in-span">
            Already have an account?{" "}
          </span>
          <Link href="/auth/login">
            <span className="already-have-an-account-sign-in-span2">Sign In</span>
          </Link>
        </span>
      </div>

      {/* Social login buttons */}
      <div className="social-buttons">
        <button type="button" className="facebook-button" onClick={() => console.log("Facebook login clicked")}>
          <div className="rectangle-23772"></div>
          <img className="vector" src="/images/vector0.svg" alt="Facebook icon" />
          <div className="facebook">Facebook</div>
        </button>

        <button type="button" className="google-button" onClick={() => console.log("Google login clicked")}>
          <div className="rectangle-23756"></div>
          <div className="google">Google</div>
          <img className="google-icon" src="/images/google-icon0.svg" alt="Google icon" />
        </button>
      </div>

      {/* Or sign in with text */}
      <div className="text">
        <div className="or-sign-in-with">or sign up with</div>
        <div className="vector-144"></div>
        <div className="vector-145"></div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Input fields */}
        <div className="input-fields">
          {/* Profile input */}
          <div className="input-profile">
            <div className="rectangle-23775"></div>
            <div className="vector-141"></div>
            <div className="group-10069">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mira-passaquindici"
                placeholder="Full Name"
                required
              />
              <div className="vector-149"></div>
            </div>
            <img className="user" src="/images/user.svg" alt="User icon" />
          </div>

          {/* Email input */}
          <div className="input-email">
            <div className="rectangle-23778"></div>
            <div className="vector-142"></div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="email"
              placeholder="Email"
              required
            />
            <img className="vector3" src="/images/vector3.svg" alt="Email icon" />
          </div>

          {/* Password input */}
          <div className="input-password">
            <div className="rectangle-23779"></div>
            <div className="vector-143"></div>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="password"
              placeholder="Password"
              required
            />
            <button
              type="button"
              className="show"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
            <img className="vector2" src="/images/vector2.svg" alt="Password icon" />
          </div>
        </div>

        {/* Checkboxes */}
        <div className="text-and-checkbox">
          <div className="checkbox-container">
            <label className="keep-me-signed-in">
              <input
                type="checkbox"
                name="keepSignedIn"
                checked={formData.keepSignedIn}
                onChange={handleChange}
                className="hidden-checkbox"
              />
              <div className={`custom-checkbox ${formData.keepSignedIn ? 'checked' : ''}`}>
                {formData.keepSignedIn && <img className="vector-131" src="/images/vector-131.svg" alt="Checkmark" />}
              </div>
              Keep me signed in
            </label>
          </div>

          <div className="checkbox-container">
            <label className="email-me-about-special-pricing-and-more">
              <input
                type="checkbox"
                name="emailMe"
                checked={formData.emailMe}
                onChange={handleChange}
                className="hidden-checkbox"
              />
              <div className={`custom-checkbox ${formData.emailMe ? 'checked' : ''}`}>
                {formData.emailMe && <img className="vector-140" src="/images/vector-140.svg" alt="Checkmark" />}
              </div>
              Email me about special pricing and more
            </label>
          </div>
        </div>

        {/* Submit button */}
        <div className="button-374-x-variant-4">
          <button type="submit" className="button">
            <div className="text2">Create Account</div>
          </button>
        </div>
      </form>

      {/* Title and illustration */}
      <div className="create-your-account">Create your account</div>
      <img
        className="create-your-account-2-1"
        src="/images/create-your-account-2-1.svg"
        alt="Create account illustration"
      />
    </div>
  );
}
