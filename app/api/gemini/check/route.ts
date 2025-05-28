import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { geminiRateLimiter } from '@/lib/gemini-rate-limiter';

/**
 * GET handler for checking Gemini API key
 */
export async function GET(request: NextRequest) {
  try {
    // Get API key from environment variable
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          status: "error",
          message: "API key not configured"
        },
        { status: 500 }
      );
    }

    // Try to initialize the Gemini API
    const genAI = new GoogleGenerativeAI(apiKey);

    // Try to get a model to verify the API key works
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Get rate limit status
    const rateLimitStatus = geminiRateLimiter.getRateLimitStatus();

    // If we're in backoff mode, return a "limited" status instead of error
    if (rateLimitStatus.isBackingOff) {
      const backoffTimeRemaining = Math.max(0, rateLimitStatus.backoffUntil - Date.now());
      const backoffSeconds = Math.ceil(backoffTimeRemaining / 1000);

      console.log(`Gemini API in backoff mode. Returning limited status. Retry in ${backoffSeconds}s`);

      return NextResponse.json({
        status: "limited",
        message: "Gemini API is rate limited. Try again later.",
        retryAfter: backoffSeconds,
        rateLimitStatus
      });
    }

    // Try a simple generation to verify the API key works using the rate limiter
    try {
      console.log('Testing Gemini API with a simple request...');

      // Use the rate limiter to execute the request
      const result = await geminiRateLimiter.executeRequest(
        async () => model.generateContent("Hello, are you working?"),
        10, // High priority for API check
        20  // Very small token estimate
      );

      const text = result.response.text();

      if (text) {
        console.log('Gemini API key is valid and working');
        return NextResponse.json({
          status: "success",
          message: "Gemini API key is valid and working",
          rateLimitStatus: geminiRateLimiter.getRateLimitStatus()
        });
      } else {
        console.error('Gemini API key validation failed: No response text');
        return NextResponse.json(
          {
            status: "error",
            message: "API key validation failed: No response text",
            rateLimitStatus: geminiRateLimiter.getRateLimitStatus()
          },
          { status: 500 }
        );
      }
    } catch (genError: any) {
      console.error('Gemini API key validation failed:', genError);

      // Check if it's a rate limit error
      if (genError.message && (
          genError.message.includes('429') ||
          genError.message.includes('Too Many Requests') ||
          genError.message.includes('quota') ||
          genError.message.includes('rate limit')
      )) {
        // Return a "limited" status instead of error
        return NextResponse.json({
          status: "limited",
          message: "Gemini API is rate limited. Try again later.",
          details: genError.message,
          rateLimitStatus: geminiRateLimiter.getRateLimitStatus()
        });
      }

      return NextResponse.json(
        {
          status: "error",
          message: "API key validation failed: " + (genError.message || "Unknown error"),
          details: genError.message,
          rateLimitStatus: geminiRateLimiter.getRateLimitStatus()
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error checking Gemini API key:', error);

    return NextResponse.json(
      {
        status: "error",
        message: "Invalid API key or API error",
        details: error.message
      },
      { status: 500 }
    );
  }
}
