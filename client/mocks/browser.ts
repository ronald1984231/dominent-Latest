import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

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
