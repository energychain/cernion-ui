'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Optional custom fallback. Receives reset callback. */
  fallback?: (reset: () => void) => React.ReactNode;
  /** Label shown in the default fallback (e.g. "Dashboard-Widget") */
  label?: string;
  className?: string;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, State> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: unknown): State {
    const message =
      error instanceof Error ? error.message : 'Unbekannter Fehler';
    return { hasError: true, message };
  }

  override componentDidCatch(error: unknown, info: React.ErrorInfo) {
    // In production you'd send this to an error tracking service
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  reset = () => {
    this.setState({ hasError: false, message: '' });
  };

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.reset);
      }

      return (
        <div
          className={cn(
            'flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center',
            this.props.className
          )}
          role="alert"
        >
          <AlertTriangle className="h-8 w-8 text-destructive opacity-70" />
          <div>
            <p className="font-semibold text-sm text-destructive">
              {this.props.label
                ? `${this.props.label} nicht verfügbar`
                : 'Komponente nicht verfügbar'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground max-w-xs">
              {this.state.message}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={this.reset}
            className="gap-2"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Neu laden
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Lightweight wrapper for inline use:
 * <WithErrorBoundary label="KPI-Card"><KpiCard … /></WithErrorBoundary>
 */
export function WithErrorBoundary({
  children,
  label,
  className,
}: {
  children: React.ReactNode;
  label?: string;
  className?: string;
}) {
  return (
    <ErrorBoundary label={label} className={className}>
      {children}
    </ErrorBoundary>
  );
}
