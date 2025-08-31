import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";
import { errorHandlers, successHandlers } from "./error-scenarios";

// Setup the worker with the handlers
export const worker = setupWorker(...handlers);

// Start the worker conditionally
export const startMocking = async () => {
  if (typeof window !== "undefined") {
    const { worker } = await import("./browser");
    await worker.start({
      onUnhandledRequest: "bypass", // Allow real requests for unhandled routes
      serviceWorker: {
        url: "/mockServiceWorker.js" // Default MSW service worker location
      }
    });

    // Expose utilities to window for Cypress testing
    (window as any).switchToErrorScenario = switchToErrorScenario;
    (window as any).switchToSuccessScenario = switchToSuccessScenario;
    (window as any).resetToDefaultHandlers = resetToDefaultHandlers;

    console.log("🎭 MSW: Mock Service Worker started");
    return worker;
  }
};

// Stop mocking
export const stopMocking = () => {
  if (typeof window !== "undefined") {
    worker.stop();
    console.log("🎭 MSW: Mock Service Worker stopped");
  }
};

// Scenario switching utilities for testing
export const switchToErrorScenario = (scenarioName: keyof typeof errorHandlers) => {
  if (typeof window !== "undefined" && errorHandlers[scenarioName]) {
    worker.use(errorHandlers[scenarioName]);
    console.log(`🎭 MSW: Switched to error scenario: ${scenarioName}`);
  }
};

export const switchToSuccessScenario = (scenarioName: keyof typeof successHandlers) => {
  if (typeof window !== "undefined" && successHandlers[scenarioName]) {
    worker.use(successHandlers[scenarioName]);
    console.log(`🎭 MSW: Switched to success scenario: ${scenarioName}`);
  }
};

// Reset to default handlers
export const resetToDefaultHandlers = () => {
  if (typeof window !== "undefined") {
    worker.resetHandlers();
    console.log("🎭 MSW: Reset to default handlers");
  }
};
