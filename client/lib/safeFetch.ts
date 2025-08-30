/**
 * Safe fetch utility with retry logic, timeout, and better error handling
 */
import { useState, useCallback } from "react";

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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...fetchOptions.headers,
        },
      });

      clearTimeout(timeoutId);

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
