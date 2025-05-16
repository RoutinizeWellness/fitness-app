"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();

  React.useEffect(() => {
    // Redirect to the signup page
    router.push("/auth/signup");
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-monumental-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-monumental-purple font-manrope">Redirecting to sign up page...</p>
      </div>
    </div>
  );
}
