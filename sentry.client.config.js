
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === 'development',
  
  replaysOnErrorSampleRate: 1.0,
  
  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0.1,
  
  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration goes in here, for example:
      maskAllText: true,
      blockAllMedia: true,
    }),
    Sentry.feedbackIntegration({
      // Additional Feedback configuration goes in here, for example:
      colorScheme: "system",
    }),
  ],
  
  environment: process.env.NODE_ENV,
  
  // Performance monitoring
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  beforeSend(event, hint) {
    // Filter out specific errors that aren't useful
    if (event.exception) {
      const error = hint.originalException;
      
      // Filter out network errors
      if (error && error.message && error.message.includes('Network Error')) {
        return null;
      }
      
      // Filter out script loading errors
      if (error && error.message && error.message.includes('Loading chunk')) {
        return null;
      }
    }
    
    return event;
  },
});
