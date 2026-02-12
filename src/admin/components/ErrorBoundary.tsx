// ============================================================================
// ERROR BOUNDARY - Catch and handle React errors gracefully
// ============================================================================

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Error info:', errorInfo);
    
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
    
    // Could also send to error tracking service here
    // sentry.captureException(error, { extra: errorInfo });
  }

  override componentDidUpdate(prevProps: Props) {
    if (
      this.props.resetOnPropsChange &&
      prevProps.children !== this.props.children
    ) {
      this.setState({ hasError: false, error: null, errorInfo: null });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoBack = () => {
    window.history.back();
  };

  handleGoHome = () => {
    window.location.href = '/admin';
  };

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-xl">Something went wrong</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-center">
                An error occurred while rendering this page. Try refreshing or go back to the dashboard.
              </p>
              
              {import.meta.env.DEV && this.state.error && (
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm font-mono overflow-auto max-h-48">
                  <p className="text-red-400">{this.state.error.message}</p>
                  {this.state.errorInfo && (
                    <p className="mt-2 text-gray-400">{this.state.errorInfo.componentStack}</p>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-2 justify-center pt-4">
                <Button onClick={this.handleReset} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button onClick={this.handleReload} variant="outline">
                  Reload Page
                </Button>
                <Button onClick={this.handleGoBack} variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
                <Button onClick={this.handleGoHome}>
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Async error boundary for data fetching errors
 */
export function AsyncErrorBoundary({
  error,
  onRetry,
  children,
}: {
  error: Error | null;
  onRetry: () => void;
  children: ReactNode;
}) {
  if (error) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold">Failed to load data</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {error.message || 'Something went wrong while fetching data.'}
            </p>
          </div>
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  return <>{children}</>;
}

export default ErrorBoundary;
