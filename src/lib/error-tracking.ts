// ============================================================================
// ERROR TRACKING & MONITORING
// Capture and report errors for debugging
// ============================================================================

export interface ErrorContext {
  userId?: string;
  route?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export interface ErrorReport {
  id: string;
  timestamp: string;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  context: ErrorContext;
  userAgent: string;
  url: string;
}

class ErrorTracker {
  private errors: ErrorReport[] = [];
  private maxErrors = 50;
  private isEnabled = true;

  constructor() {
    // Setup global error handlers
    if (typeof window !== 'undefined') {
      window.addEventListener('error', this.handleGlobalError.bind(this));
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private handleGlobalError(event: ErrorEvent) {
    this.capture(event.error, {
      component: 'Global',
      action: 'uncaught_error',
    });
  }

  private handleUnhandledRejection(event: PromiseRejectionEvent) {
    this.capture(
      event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
      {
        component: 'Global',
        action: 'unhandled_promise_rejection',
      }
    );
  }

  capture(error: Error | string, context: ErrorContext = {}): ErrorReport {
    if (!this.isEnabled) return null as any;

    const report: ErrorReport = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      error: {
        name: error instanceof Error ? error.name : 'Error',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      context: {
        route: window.location.pathname,
        ...context,
      },
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Store locally (keep only last N errors)
    this.errors.unshift(report);
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('[ErrorTracker]', report);
    }

    // Send to Supabase (async, don't wait)
    this.sendToServer(report).catch(console.error);

    return report;
  }

  private async sendToServer(report: ErrorReport): Promise<void> {
    try {
      // You can send errors to Supabase or a service like Sentry
      // For now, we'll just store critical errors
      if (this.isCriticalError(report)) {
        // Store in localStorage as fallback
        const key = 'error_reports';
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        existing.push(report);
        localStorage.setItem(key, JSON.stringify(existing.slice(-10)));
      }
    } catch {
      // Silent fail - don't cause more errors
    }
  }

  private isCriticalError(report: ErrorReport): boolean {
    const criticalPatterns = [
      'database',
      'connection',
      'network',
      'timeout',
      'authentication',
      'authorization',
    ];
    
    return criticalPatterns.some(pattern => 
      report.error.message.toLowerCase().includes(pattern)
    );
  }

  getRecentErrors(): ErrorReport[] {
    return [...this.errors];
  }

  clearErrors(): void {
    this.errors = [];
  }

  enable(): void {
    this.isEnabled = true;
  }

  disable(): void {
    this.isEnabled = false;
  }
}

// Singleton instance
export const errorTracker = new ErrorTracker();

// Helper functions
export const captureError = (error: Error | string, context?: ErrorContext) => {
  return errorTracker.capture(error, context);
};

export const captureException = (error: unknown, context?: ErrorContext): void => {
  if (error instanceof Error) {
    captureError(error, context);
  } else {
    captureError(String(error), context);
  }
};

export const getRecentErrors = () => errorTracker.getRecentErrors();
export const clearErrors = () => errorTracker.clearErrors();

export default errorTracker;
