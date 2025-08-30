/**
 * ✅ CORRECT Sentry Logging for Vite + React Projects
 * 
 * ❌ DON'T USE: import * as Sentry from "@sentry/nextjs"; (This is for Next.js only)
 * ✅ USE THIS: import * as Sentry from "@sentry/react"; (For Vite + React)
 */

import * as Sentry from "@sentry/react";

// ❌ DEPRECATED: Sentry.logger.info() - This no longer exists in modern Sentry
// ✅ CORRECT APPROACHES:

export const sentryLoggingExamples = {
  
  // 1. ✅ Capture custom messages (like your logger.info)
  logInfo: (message: string, data?: Record<string, any>) => {
    Sentry.captureMessage(message, {
      level: 'info',
      tags: data?.log_source ? { log_source: data.log_source } : undefined,
      extra: data
    });
  },

  // 2. ✅ Add breadcrumbs for debugging trail
  addBreadcrumb: (message: string, data?: Record<string, any>) => {
    Sentry.addBreadcrumb({
      message,
      level: 'info',
      data: {
        ...data,
        timestamp: Date.now()
      }
    });
  },

  // 3. ✅ Set user context
  setUser: (userId: string, email?: string, username?: string) => {
    Sentry.setUser({
      id: userId,
      email,
      username
    });
  },

  // 4. ✅ Add custom tags
  setTag: (key: string, value: string) => {
    Sentry.setTag(key, value);
  },

  // 5. ✅ Set context data
  setContext: (key: string, context: Record<string, any>) => {
    Sentry.setContext(key, context);
  },

  // 6. ✅ Capture exceptions with context
  captureError: (error: Error, context?: Record<string, any>) => {
    Sentry.captureException(error, {
      tags: context?.tags,
      extra: context?.extra,
      user: context?.user
    });
  }
};

// 🎯 EXACT REPLACEMENT for your code:
// ❌ OLD: Sentry.logger.info('User triggered test log', { log_source: 'sentry_test' })
// ✅ NEW: 
export const userTriggeredTestLog = () => {
  // Option 1: Using captureMessage (most similar to logger.info)
  Sentry.captureMessage('User triggered test log', {
    level: 'info',
    tags: { log_source: 'sentry_test' }
  });

  // Option 2: Using breadcrumb (for debugging trail)
  Sentry.addBreadcrumb({
    message: 'User triggered test log',
    level: 'info',
    data: { log_source: 'sentry_test' }
  });
};

// 🚀 USAGE EXAMPLES:

// Basic logging
sentryLoggingExamples.logInfo('User triggered test log', { log_source: 'sentry_test' });

// Add debugging breadcrumb
sentryLoggingExamples.addBreadcrumb('User clicked button', { button_id: 'test-btn' });

// Set user context
sentryLoggingExamples.setUser('user-123', 'test@example.com', 'testuser');

// Add custom tags
sentryLoggingExamples.setTag('feature', 'error-testing');

// Capture error with context
try {
  throw new Error('Test error');
} catch (error) {
  sentryLoggingExamples.captureError(error as Error, {
    tags: { source: 'test' },
    extra: { test_data: 'example' }
  });
}
