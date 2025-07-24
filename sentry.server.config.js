
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === 'development',
  
  environment: process.env.NODE_ENV,
  
  // Performance monitoring
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Server-side integrations
  integrations: [
    // Add server-specific integrations
    Sentry.prismaIntegration(),
  ],
  
  beforeSend(event, hint) {
    // Server-side error filtering
    if (event.exception) {
      const error = hint.originalException;
      
      // Don't send client disconnection errors
      if (error && error.code === 'ECONNABORTED') {
        return null;
      }
      
      // Filter out expected Prisma errors
      if (error && error.code && error.code.startsWith('P')) {
        // Log but don't send to Sentry for expected Prisma constraint violations
        if (error.code === 'P2002') {
          console.log('Prisma unique constraint violation:', error.message);
          return null;
        }
      }
    }
    
    return event;
  },
});
