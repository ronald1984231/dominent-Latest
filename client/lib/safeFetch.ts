/**
 * Safe fetch utility with retry logic, timeout, and better error handling
 * Includes fallback mechanisms to bypass FullStory and other third-party interference
 */
import { useState, useCallback } from "react";

// Store original fetch before any third-party libraries can interfere
const originalFetch = window.fetch;

export interface SafeFetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export class FetchError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: Response,
  ) {
    super(message);
    this.name = "FetchError";
  }
}

/**
 * XMLHttpRequest fallback for when fetch is intercepted by third-party scripts
 */
function fetchWithXHR(url: string, options: RequestInit = {}): Promise<Response> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const method = options.method || 'GET';

    xhr.open(method, url);

    // Set headers
    if (options.headers) {
      const headers = options.headers as Record<string, string>;
      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
    }

    // Handle timeout
    xhr.timeout = 10000; // 10 second default timeout

    xhr.onload = () => {
      // Create a Response-like object
      const response = {
        ok: xhr.status >= 200 && xhr.status < 300,
        status: xhr.status,
        statusText: xhr.statusText,
        headers: new Headers(),
        json: async () => {
          try {
            return JSON.parse(xhr.responseText);
          } catch (e) {
            throw new Error('Failed to parse JSON response');
          }
        },
        text: async () => xhr.responseText,
      } as Response;

      resolve(response);
    };

    xhr.onerror = () => {
      reject(new FetchError(`XMLHttpRequest failed for ${url}`, xhr.status));
    };

    xhr.ontimeout = () => {
      reject(new FetchError(`XMLHttpRequest timeout for ${url}`));
    };

    // Send request
    xhr.send(options.body as string);
  });
}

/**
 * Detect if an error is caused by FullStory or similar third-party interference
 */
function isThirdPartyInterferenceError(error: unknown): boolean {
  if (error instanceof Error) {
    const stack = error.stack || '';
    const message = error.message || '';

    return (
      message.includes('Failed to fetch') &&
      (stack.includes('fullstory') ||
       stack.includes('edge.fullstory.com') ||
       stack.includes('fs.js') ||
       stack.includes('eval at messageHandler'))
    );
  }
  return false;
}

/**
 * Safe fetch function with automatic retries and error handling
 */
export async function safeFetch(
  url: string,
  options: SafeFetchOptions = {},
): Promise<Response> {
  const {
    timeout = 10000,
    retries = 3,
    retryDelay = 1000,
    ...fetchOptions
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      let response: Response;

      // Try original fetch first, then fallback mechanisms
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        response = await originalFetch(url, {
          ...fetchOptions,
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            ...fetchOptions.headers,
          },
        });

        clearTimeout(timeoutId);
      } catch (fetchError) {
        // If original fetch fails due to third-party interference, try XMLHttpRequest
        if (isThirdPartyInterferenceError(fetchError)) {
          console.debug('Fetch intercepted by third-party, trying XMLHttpRequest fallback');
          response = await fetchWithXHR(url, {
            ...fetchOptions,
            headers: {
              "Content-Type": "application/json",
              ...fetchOptions.headers,
            },
          });
        } else {
          throw fetchError;
        }
      }

      if (!response.ok) {
        throw new FetchError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          response,
        );
      }

      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on client errors (4xx) except 408 (timeout)
      if (
        error instanceof FetchError &&
        error.status &&
        error.status >= 400 &&
        error.status < 500 &&
        error.status !== 408
      ) {
        throw error;
      }

      // Don't retry on the last attempt
      if (attempt === retries) {
        break;
      }

      // Log retry attempt
      console.log(
        `Fetch attempt ${attempt + 1} failed, retrying in ${retryDelay}ms...`,
        error,
      );

      // Wait before retrying
      await new Promise((resolve) =>
        setTimeout(resolve, retryDelay * (attempt + 1)),
      );
    }
  }

  throw lastError || new Error("Fetch failed after all retries");
}

/**
 * Safe fetch that returns JSON with error handling
 */
export async function safeFetchJson<T = any>(
  url: string,
  options: SafeFetchOptions = {},
): Promise<T> {
  const response = await safeFetch(url, options);

  try {
    return await response.json();
  } catch (error) {
    throw new FetchError("Failed to parse JSON response");
  }
}

/**
 * Handle fetch errors and return user-friendly messages
 */
export function getFetchErrorMessage(error: unknown): string {
  if (error instanceof FetchError) {
    if (error.status === 404) {
      return "Resource not found";
    }
    if (error.status === 401 || error.status === 403) {
      return "Access denied";
    }
    if (error.status === 500) {
      return "Server error. Please try again later.";
    }
    if (error.status && error.status >= 500) {
      return "Server error. Please try again later.";
    }
    return error.message;
  }

  if (error instanceof TypeError && error.message.includes("fetch")) {
    return "Network error. Please check your connection.";
  }

  if (error instanceof Error && error.name === "AbortError") {
    return "Request timeout. Please try again.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred";
}

/**
 * React hook for safe API calls with loading state
 */
export function useSafeApiCall() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const call = useCallback(
    async <T>(apiCall: () => Promise<T>): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await apiCall();
        return result;
      } catch (err) {
        const errorMessage = getFetchErrorMessage(err);
        setError(errorMessage);
        console.error("API call failed:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { loading, error, call };
}
