type ErrorContext = {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
};

type ErrorLevel = 'error' | 'warn' | 'info';

interface ErrorEntry {
  level: ErrorLevel;
  message: string;
  stack?: string;
  context?: ErrorContext;
  timestamp: string;
  url: string;
}

class ErrorLogger {
  private isDev = import.meta.env.DEV;

  log(error: unknown, context?: ErrorContext, level: ErrorLevel = 'error') {
    const err =
      error instanceof Error
        ? error
        : new Error(typeof error === 'string' ? error : JSON.stringify(error));
    const message = err.message;
    const stack = err.stack;

    const entry: ErrorEntry = {
      level,
      message,
      stack,
      context,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };

    if (this.isDev) {
      console[level](`[ErrorLogger] ${message}`, entry);
    }

    if (level === 'error') {
      this.sendToAnalytics(entry);
    }
  }

  error(error: unknown, context?: ErrorContext) {
    this.log(error, context, 'error');
  }

  warn(error: unknown, context?: ErrorContext) {
    this.log(error, context, 'warn');
  }

  info(message: string, context?: ErrorContext) {
    this.log(message, context, 'info');
  }

  private sendToAnalytics(entry: ErrorEntry) {
    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(entry)], { type: 'application/json' });
        navigator.sendBeacon('/api/error-log', blob);
      }
    } catch {
      // Silently fail - never break the app for logging
    }
  }
}

export const errorLogger = new ErrorLogger();
