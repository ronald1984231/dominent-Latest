import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://YOUR_DSN_HERE", // Replace with your actual DSN from Sentry
  
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of the transactions
  
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  
  // Environment
  environment: import.meta.env.MODE,
  
  // Release version
  release: "dominent@1.0.0",
  
  beforeSend(event) {
    // Filter out ResizeObserver errors we intentionally suppress
    if (event.exception?.values?.[0]?.value?.includes('ResizeObserver loop')) {
      return null;
    }
    
    // Filter out FullStory-related errors we handle
    if (event.exception?.values?.[0]?.value?.includes('Failed to fetch') &&
        event.exception?.values?.[0]?.stacktrace?.frames?.some(frame => 
          frame.filename?.includes('fullstory') || frame.filename?.includes('fs.js')
        )) {
      return null;
    }
    
    return event;
  }
});

export default Sentry;
