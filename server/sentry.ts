import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

const DSN = process.env.SENTRY_DSN;

// Only initialize Sentry if a valid DSN is provided
if (DSN && !/^https:\/\/YOUR_DSN_HERE/.test(DSN)) {
  Sentry.init({
    dsn: DSN,
    integrations: [nodeProfilingIntegration()],
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
    environment: process.env.NODE_ENV || "development",
    release: "dominent-server@1.0.0",
    beforeSend(event) {
      if (
        event.exception?.values?.[0]?.value?.includes("ECONNRESET") ||
        event.exception?.values?.[0]?.value?.includes(
          "Connection terminated unexpectedly",
        )
      ) {
        return null;
      }
      if (
        event.exception?.values?.[0]?.value?.includes("WHOIS lookup failed") ||
        event.exception?.values?.[0]?.value?.includes(
          "getaddrinfo ENOTFOUND whois.",
        )
      ) {
        return null;
      }
      return event;
    },
  });
} else {
  console.warn("Sentry DSN not set; skipping server Sentry initialization");
}

export default Sentry;
