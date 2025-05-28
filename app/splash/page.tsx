"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import SplashScreen from "@/components/splash/SplashScreen";
import { useAuth } from "@/lib/contexts/auth-context";

export default function SplashPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const handleSplashComplete = () => {
    if (isLoading) return;

    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/auth/login");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <SplashScreen onComplete={handleSplashComplete} />
    </div>
  );
}
