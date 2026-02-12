import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import './index.css'
import App from './App.tsx'

// Initialize Sentry for error tracking
const sentryDsn = import.meta.env['VITE_SENTRY_DSN'];
const appEnv = import.meta.env['VITE_APP_ENV'];

if (sentryDsn && sentryDsn !== 'https://your-sentry-dsn@sentry.io/project-id') {
  Sentry.init({
    dsn: sentryDsn,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: appEnv === 'production' ? 0.1 : 1.0,
    // Session Replay
    replaysSessionSampleRate: appEnv === 'production' ? 0.05 : 1.0,
    replaysOnErrorSampleRate: 1.0,
    environment: appEnv || 'development',
    beforeSend(event) {
      // Sanitize sensitive data before sending to Sentry
      if (event.request?.headers) {
        delete event.request.headers['Authorization'];
        delete event.request.headers['X-API-Key'];
      }
      return event;
    },
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
