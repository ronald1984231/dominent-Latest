import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

Sentry.init({
  dsn: process.env.SENTRY_DSN || "https://YOUR_DSN_HERE", // Replace with your actual DSN from Sentry
  
  integrations: [
    nodeProfilingIntegration(),
  ],
  
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of the transactions
  
  // Profiling
  profilesSampleRate: 1.0, // Capture 100% of the profiles
  
  // Environment
  environment: process.env.NODE_ENV || "development",
  
  // Release version  
  release: "dominent-server@1.0.0",
  
  beforeSend(event) {
    // Filter out database connection noise
    if (event.exception?.values?.[0]?.value?.includes('ECONNRESET') ||
        event.exception?.values?.[0]?.value?.includes('Connection terminated unexpectedly')) {
      return null;
    }
    
    // Filter out WHOIS lookup errors (these are expected and handled)
    if (event.exception?.values?.[0]?.value?.includes('WHOIS lookup failed') ||
        event.exception?.values?.[0]?.value?.includes('getaddrinfo ENOTFOUND whois.')) {
      return null;
    }
    
    return event;
  }
});

export default Sentry;
