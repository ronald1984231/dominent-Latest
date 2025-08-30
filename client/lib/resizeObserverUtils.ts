/**
 * Utility functions to handle ResizeObserver errors gracefully
 */
import React from "react";

/**
 * Wraps a ResizeObserver callback to catch and suppress loop errors
 */
export function safeResizeObserverCallback<T extends ResizeObserverEntry[]>(
  callback: (entries: T, observer: ResizeObserver) => void,
) {
  return (entries: T, observer: ResizeObserver) => {
    try {
      callback(entries, observer);
    } catch (error) {
      // Suppress ResizeObserver loop errors
      if (
        error instanceof Error &&
        error.message.includes("ResizeObserver loop")
      ) {
        console.debug(
          "ResizeObserver loop detected and suppressed:",
          error.message,
        );
        return;
      }
      // Re-throw other errors
      throw error;
    }
  };
}

/**
 * Creates a ResizeObserver with error handling
 */
export function createSafeResizeObserver(
  callback: (entries: ResizeObserverEntry[], observer: ResizeObserver) => void,
): ResizeObserver {
  return new ResizeObserver(safeResizeObserverCallback(callback));
}

/**
 * Debounces ResizeObserver callbacks to reduce frequency
 */
export function debouncedResizeObserver(
  callback: (entries: ResizeObserverEntry[], observer: ResizeObserver) => void,
  delay: number = 16, // ~60fps
): ResizeObserver {
  let timeoutId: number | undefined;

  return new ResizeObserver((entries, observer) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = window.setTimeout(() => {
      safeResizeObserverCallback(callback)(entries, observer);
    }, delay);
  });
}

/**
 * Global error handler setup for ResizeObserver errors
 */
export function setupResizeObserverErrorHandler(): void {
  // Handle unhandled errors
  window.addEventListener("error", (event) => {
    // Suppress ResizeObserver loop errors
    if (event.message?.includes("ResizeObserver loop")) {
      event.preventDefault();
      event.stopPropagation();
      console.debug("ResizeObserver loop error suppressed globally");
      return false;
    }

    // Suppress FullStory-related fetch errors that don't affect app functionality
    if (
      event.message?.includes("Failed to fetch") &&
      (event.filename?.includes("edge.fullstory.com") ||
        event.filename?.includes("fs.js") ||
        event.error?.stack?.includes("fullstory") ||
        event.error?.stack?.includes("edge.fullstory.com"))
    ) {
      event.preventDefault();
      event.stopPropagation();
      console.debug("FullStory fetch error suppressed globally");
      return false;
    }

    // Suppress specific FullStory evaluation errors
    if (
      event.message?.includes("TypeError: Failed to fetch") &&
      (event.filename?.includes("fs.js") ||
        (event.lineno === 4 && event.colno === 60118))
    ) {
      event.preventDefault();
      event.stopPropagation();
      console.debug("FullStory specific error suppressed");
      return false;
    }
  });

  // Handle unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    if (event.reason?.message?.includes("ResizeObserver loop")) {
      event.preventDefault();
      console.debug("ResizeObserver loop promise rejection suppressed");
      return false;
    }

    // Suppress FullStory-related promise rejections
    if (
      (event.reason?.message?.includes("Failed to fetch") ||
        event.reason?.message?.includes("TypeError: Failed to fetch")) &&
      (event.reason?.stack?.includes("fullstory") ||
        event.reason?.stack?.includes("edge.fullstory.com") ||
        event.reason?.stack?.includes("fs.js"))
    ) {
      event.preventDefault();
      console.debug("FullStory fetch promise rejection suppressed");
      return false;
    }
  });
}

/**
 * React hook for safe ResizeObserver usage
 */
export function useSafeResizeObserver(
  callback: (entries: ResizeObserverEntry[]) => void,
  dependencies: React.DependencyList = [],
): React.RefObject<ResizeObserver | null> {
  const observerRef = React.useRef<ResizeObserver | null>(null);

  React.useEffect(() => {
    observerRef.current = createSafeResizeObserver(callback);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, dependencies);

  return observerRef;
}
