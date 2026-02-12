import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // TODO: Send error to error tracking service (e.g., Sentry)
    // if (import.meta.env.PROD) {
    //   logErrorToService(error, errorInfo);
    // }
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--background)' }}>
          <div className="max-w-md w-full text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: 'var(--destructive)', opacity: 0.1 }}
            >
              <AlertTriangle
                className="w-10 h-10"
                style={{ color: 'var(--destructive)' }}
              />
            </div>

            <h1
              className="font-serif text-2xl font-bold mb-4"
              style={{ color: 'var(--foreground)' }}
            >
              Something went wrong
            </h1>

            <p
              className="font-sans text-base mb-6"
              style={{ color: 'var(--muted-foreground)' }}
            >
              We apologize for the inconvenience. An unexpected error has occurred.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <details
                className="text-left mb-6 p-4 rounded-lg overflow-auto max-h-60"
                style={{
                  backgroundColor: 'var(--muted)',
                  color: 'var(--muted-foreground)',
                }}
              >
                <summary className="font-semibold cursor-pointer mb-2">
                  Error Details
                </summary>
                <pre className="text-xs font-mono whitespace-pre-wrap">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <Button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <RefreshCw size={16} />
              Try Again
            </Button>

            <p className="mt-4 font-sans text-sm" style={{ color: 'var(--muted-foreground)' }}>
              If the problem persists, please{' '}
              <a href="/contact" className="underline" style={{ color: 'var(--primary)' }}>
                contact our support team
              </a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
