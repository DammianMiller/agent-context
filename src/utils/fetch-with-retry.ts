/**
 * Configuration for retry behavior
 */
export interface RetryConfig {
  maxRetries: number;
  backoffMs: number;
}

/**
 * Custom error for fetch retry failures
 */
export class FetchRetryError extends Error {
  readonly url: string;
  readonly attempts: number;
  readonly lastError: Error | null;
  readonly statusCode?: number;

  constructor(
    message: string,
    url: string,
    attempts: number,
    lastError: Error | null = null,
    statusCode?: number
  ) {
    super(message);
    this.name = 'FetchRetryError';
    this.url = url;
    this.attempts = attempts;
    this.lastError = lastError;
    this.statusCode = statusCode;
  }
}

const DEFAULT_CONFIG: RetryConfig = {
  maxRetries: 3,
  backoffMs: 1000,
};

/**
 * Fetches a URL with automatic retry logic using exponential backoff.
 *
 * @param url - The URL to fetch
 * @param options - Optional fetch RequestInit options
 * @param retryConfig - Optional retry configuration
 * @returns Promise resolving to the Response on success
 * @throws FetchRetryError if all retry attempts fail
 */
export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  retryConfig?: { maxRetries: number; backoffMs: number }
): Promise<Response> {
  const config: RetryConfig = { ...DEFAULT_CONFIG, ...retryConfig };
  let lastError: Error | null = null;
  let lastStatusCode: number | undefined;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      // Apply exponential backoff delay before retry attempts
      if (attempt > 0) {
        const delay = config.backoffMs * Math.pow(2, attempt - 1);
        console.log(
          `[fetchWithRetry] Retry attempt ${attempt}/${config.maxRetries} for ${url} after ${delay}ms delay`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      const response = await fetch(url, options);

      // Handle HTTP errors (non-2xx status codes)
      if (!response.ok) {
        lastStatusCode = response.status;
        const isRetryable =
          response.status >= 500 ||
          response.status === 408 ||
          response.status === 429;

        if (isRetryable && attempt < config.maxRetries) {
          lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
          console.log(
            `[fetchWithRetry] HTTP ${response.status} error on attempt ${attempt + 1}/${config.maxRetries + 1} for ${url}, will retry`
          );
          continue;
        }

        throw new FetchRetryError(
          `HTTP error ${response.status}: ${response.statusText}`,
          url,
          attempt + 1,
          null,
          response.status
        );
      }

      return response;
    } catch (error) {
      // Re-throw FetchRetryError immediately
      if (error instanceof FetchRetryError) {
        throw error;
      }

      // Handle network errors
      if (error instanceof Error) {
        lastError = error;

        if (attempt < config.maxRetries) {
          console.log(
            `[fetchWithRetry] Network error on attempt ${attempt + 1}/${config.maxRetries + 1} for ${url}: ${error.message}, will retry`
          );
          continue;
        }
      }

      throw new FetchRetryError(
        `Fetch failed after ${attempt + 1} attempts: ${error instanceof Error ? error.message : String(error)}`,
        url,
        attempt + 1,
        error instanceof Error ? error : null,
        lastStatusCode
      );
    }
  }

  // All retries exhausted
  throw new FetchRetryError(
    `All ${config.maxRetries + 1} attempts failed for ${url}`,
    url,
    config.maxRetries + 1,
    lastError,
    lastStatusCode
  );
}
