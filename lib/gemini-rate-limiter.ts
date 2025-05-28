"use client";

/**
 * GeminiRateLimiter - A service to handle rate limiting for Gemini API
 * 
 * This service implements:
 * 1. Request throttling
 * 2. Exponential backoff for retries
 * 3. Request queuing
 * 4. Rate limit tracking
 */
export class GeminiRateLimiter {
  // Singleton instance
  private static instance: GeminiRateLimiter;

  // Rate limit tracking
  private requestsThisMinute: number = 0;
  private requestsToday: number = 0;
  private tokensThisMinute: number = 0;
  private lastMinuteReset: number = Date.now();
  private lastDayReset: number = Date.now();

  // Rate limit thresholds (Free tier limits)
  private readonly MAX_REQUESTS_PER_MINUTE: number = 60;
  private readonly MAX_REQUESTS_PER_DAY: number = 60 * 24 * 3; // ~180 per day
  private readonly MAX_TOKENS_PER_MINUTE: number = 60000; // 60k tokens per minute

  // Backoff settings
  private isBackingOff: boolean = false;
  private backoffUntil: number = 0;
  private backoffMultiplier: number = 1;
  private readonly MAX_BACKOFF_MS: number = 60000; // 1 minute max backoff
  private readonly INITIAL_BACKOFF_MS: number = 1000; // 1 second initial backoff

  // Request queue
  private requestQueue: Array<{
    execute: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (reason: any) => void;
    priority: number;
    timestamp: number;
  }> = [];
  private isProcessingQueue: boolean = false;

  // Error tracking
  private consecutiveErrors: number = 0;
  private readonly MAX_CONSECUTIVE_ERRORS: number = 5;
  private readonly ERROR_RESET_TIME_MS: number = 300000; // 5 minutes
  private lastErrorTime: number = 0;

  // Private constructor for singleton
  private constructor() {
    // Reset counters every minute and day
    setInterval(() => this.resetMinuteCounters(), 60000);
    setInterval(() => this.resetDayCounters(), 86400000);
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): GeminiRateLimiter {
    if (!GeminiRateLimiter.instance) {
      GeminiRateLimiter.instance = new GeminiRateLimiter();
    }
    return GeminiRateLimiter.instance;
  }

  /**
   * Execute a Gemini API request with rate limiting
   * @param requestFn Function that executes the actual API request
   * @param priority Priority of the request (higher = more important)
   * @param estimatedTokens Estimated number of tokens in the request
   */
  public async executeRequest<T>(
    requestFn: () => Promise<T>,
    priority: number = 1,
    estimatedTokens: number = 100
  ): Promise<T> {
    // Reset counters if needed
    this.checkAndResetCounters();

    // Check if we're in a forced backoff period
    if (this.isBackingOff && Date.now() < this.backoffUntil) {
      console.log(`Gemini API in backoff mode. Waiting until ${new Date(this.backoffUntil).toISOString()}`);
      
      // Add request to queue
      return this.queueRequest(requestFn, priority);
    }

    // Check if we've hit rate limits
    if (
      this.requestsThisMinute >= this.MAX_REQUESTS_PER_MINUTE ||
      this.requestsToday >= this.MAX_REQUESTS_PER_DAY ||
      this.tokensThisMinute + estimatedTokens >= this.MAX_TOKENS_PER_MINUTE
    ) {
      console.log(`Gemini API rate limit reached. Queuing request.`);
      console.log(`Current usage: ${this.requestsThisMinute}/${this.MAX_REQUESTS_PER_MINUTE} requests/min, ${this.requestsToday}/${this.MAX_REQUESTS_PER_DAY} requests/day, ${this.tokensThisMinute}/${this.MAX_TOKENS_PER_MINUTE} tokens/min`);
      
      // Add request to queue
      return this.queueRequest(requestFn, priority);
    }

    // If we've had too many consecutive errors, enter backoff mode
    if (this.consecutiveErrors >= this.MAX_CONSECUTIVE_ERRORS) {
      this.enterBackoffMode();
      return this.queueRequest(requestFn, priority);
    }

    // Execute the request
    try {
      // Update counters before request
      this.requestsThisMinute++;
      this.requestsToday++;
      this.tokensThisMinute += estimatedTokens;

      const result = await requestFn();
      
      // Reset consecutive errors on success
      this.consecutiveErrors = 0;
      
      return result;
    } catch (error: any) {
      // Handle rate limit errors
      if (this.isRateLimitError(error)) {
        console.log('Gemini API rate limit error detected:', error.message);
        
        // Extract retry delay from error if available
        const retryDelay = this.extractRetryDelay(error) || this.calculateBackoff();
        
        // Enter backoff mode
        this.enterBackoffMode(retryDelay);
        
        // Add request back to queue
        return this.queueRequest(requestFn, priority);
      }
      
      // Track consecutive errors
      this.trackError();
      
      // Re-throw the error
      throw error;
    }
  }

  /**
   * Check if an error is a rate limit error
   */
  private isRateLimitError(error: any): boolean {
    if (!error) return false;
    
    // Check for status code
    if (error.status === 429 || error.statusCode === 429) return true;
    
    // Check error message
    const errorMessage = error.message || error.toString();
    return (
      errorMessage.includes('429') ||
      errorMessage.includes('Too Many Requests') ||
      errorMessage.includes('quota') ||
      errorMessage.includes('rate limit') ||
      errorMessage.includes('exceeded')
    );
  }

  /**
   * Extract retry delay from error message
   */
  private extractRetryDelay(error: any): number | null {
    if (!error || !error.message) return null;
    
    // Try to extract retry delay from error message
    const retryMatch = error.message.match(/retryDelay:"(\d+)s"/);
    if (retryMatch && retryMatch[1]) {
      return parseInt(retryMatch[1], 10) * 1000; // Convert seconds to milliseconds
    }
    
    return null;
  }

  /**
   * Enter backoff mode
   */
  private enterBackoffMode(delayMs?: number): void {
    this.isBackingOff = true;
    
    // Calculate backoff time
    const backoffTime = delayMs || this.calculateBackoff();
    this.backoffUntil = Date.now() + backoffTime;
    
    console.log(`Entering Gemini API backoff mode for ${backoffTime}ms until ${new Date(this.backoffUntil).toISOString()}`);
    
    // Increase backoff multiplier for next time
    this.backoffMultiplier = Math.min(this.backoffMultiplier * 2, 10);
    
    // Schedule exit from backoff mode
    setTimeout(() => {
      this.isBackingOff = false;
      this.processQueue();
    }, backoffTime);
  }

  /**
   * Calculate exponential backoff time
   */
  private calculateBackoff(): number {
    const backoffTime = Math.min(
      this.INITIAL_BACKOFF_MS * this.backoffMultiplier,
      this.MAX_BACKOFF_MS
    );
    
    // Add jitter to prevent thundering herd
    return backoffTime + Math.random() * 1000;
  }

  /**
   * Add a request to the queue
   */
  private queueRequest<T>(
    requestFn: () => Promise<T>,
    priority: number = 1
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({
        execute: requestFn,
        resolve,
        reject,
        priority,
        timestamp: Date.now()
      });
      
      // Sort queue by priority (higher first) and then by timestamp (older first)
      this.requestQueue.sort((a, b) => {
        if (a.priority !== b.priority) {
          return b.priority - a.priority;
        }
        return a.timestamp - b.timestamp;
      });
      
      // Start processing queue if not already processing
      if (!this.isProcessingQueue) {
        this.processQueue();
      }
    });
  }

  /**
   * Process the request queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }
    
    this.isProcessingQueue = true;
    
    // Process queue until empty or rate limited
    while (this.requestQueue.length > 0) {
      // Check if we're in backoff mode
      if (this.isBackingOff && Date.now() < this.backoffUntil) {
        console.log(`Still in backoff mode. Pausing queue processing for ${this.backoffUntil - Date.now()}ms`);
        break;
      }
      
      // Check if we've hit rate limits
      if (
        this.requestsThisMinute >= this.MAX_REQUESTS_PER_MINUTE ||
        this.requestsToday >= this.MAX_REQUESTS_PER_DAY
      ) {
        console.log('Rate limits reached. Pausing queue processing.');
        break;
      }
      
      // Get next request from queue
      const request = this.requestQueue.shift();
      if (!request) break;
      
      try {
        // Execute the request
        this.requestsThisMinute++;
        this.requestsToday++;
        
        const result = await request.execute();
        request.resolve(result);
        
        // Reset consecutive errors on success
        this.consecutiveErrors = 0;
      } catch (error: any) {
        // Handle rate limit errors
        if (this.isRateLimitError(error)) {
          console.log('Rate limit error while processing queue:', error.message);
          
          // Put the request back at the front of the queue
          this.requestQueue.unshift(request);
          
          // Extract retry delay from error if available
          const retryDelay = this.extractRetryDelay(error) || this.calculateBackoff();
          
          // Enter backoff mode
          this.enterBackoffMode(retryDelay);
          break;
        }
        
        // For other errors, reject the request
        request.reject(error);
        this.trackError();
      }
      
      // Add a small delay between requests to avoid bursts
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    this.isProcessingQueue = false;
    
    // If there are still items in the queue and we're not in backoff mode,
    // schedule the next processing cycle
    if (this.requestQueue.length > 0 && !this.isBackingOff) {
      setTimeout(() => this.processQueue(), 1000);
    }
  }

  /**
   * Track an error
   */
  private trackError(): void {
    this.consecutiveErrors++;
    this.lastErrorTime = Date.now();
    
    // If we've had too many consecutive errors, enter backoff mode
    if (this.consecutiveErrors >= this.MAX_CONSECUTIVE_ERRORS) {
      this.enterBackoffMode();
    }
    
    // Schedule error counter reset
    setTimeout(() => {
      if (Date.now() - this.lastErrorTime >= this.ERROR_RESET_TIME_MS) {
        this.consecutiveErrors = 0;
      }
    }, this.ERROR_RESET_TIME_MS);
  }

  /**
   * Check and reset counters if needed
   */
  private checkAndResetCounters(): void {
    const now = Date.now();
    
    // Reset minute counters if it's been more than a minute
    if (now - this.lastMinuteReset >= 60000) {
      this.resetMinuteCounters();
    }
    
    // Reset day counters if it's been more than a day
    if (now - this.lastDayReset >= 86400000) {
      this.resetDayCounters();
    }
  }

  /**
   * Reset minute counters
   */
  private resetMinuteCounters(): void {
    this.requestsThisMinute = 0;
    this.tokensThisMinute = 0;
    this.lastMinuteReset = Date.now();
    console.log('Gemini API minute counters reset');
    
    // Process queue after reset
    this.processQueue();
  }

  /**
   * Reset day counters
   */
  private resetDayCounters(): void {
    this.requestsToday = 0;
    this.lastDayReset = Date.now();
    console.log('Gemini API day counters reset');
    
    // Process queue after reset
    this.processQueue();
  }

  /**
   * Get current rate limit status
   */
  public getRateLimitStatus(): {
    requestsThisMinute: number;
    requestsToday: number;
    tokensThisMinute: number;
    isBackingOff: boolean;
    backoffUntil: number;
    queueLength: number;
  } {
    return {
      requestsThisMinute: this.requestsThisMinute,
      requestsToday: this.requestsToday,
      tokensThisMinute: this.tokensThisMinute,
      isBackingOff: this.isBackingOff,
      backoffUntil: this.backoffUntil,
      queueLength: this.requestQueue.length
    };
  }
}

// Export singleton instance
export const geminiRateLimiter = GeminiRateLimiter.getInstance();
