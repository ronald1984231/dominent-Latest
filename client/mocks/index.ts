// Enable mocking in development only
const ENABLE_MOCKING = import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCKING === 'true';

export const enableMocking = async () => {
  if (!ENABLE_MOCKING) {
    return;
  }

  if (typeof window !== "undefined") {
    // Browser environment
    const { startMocking } = await import("./browser");
    return startMocking();
  } else {
    // Node environment (for testing)
    const { server } = await import("./node");
    server.listen();
  }
};

export const disableMocking = async () => {
  if (!ENABLE_MOCKING) {
    return;
  }

  if (typeof window !== "undefined") {
    const { stopMocking } = await import("./browser");
    stopMocking();
  } else {
    const { server } = await import("./node");
    server.close();
  }
};

export { handlers } from "./handlers";
