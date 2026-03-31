import { randomUUID } from 'crypto';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  requestId: string;
  userId?: string;
  action: string;
  message?: string;
  meta?: Record<string, unknown>;
  duration?: number;
}

/**
 * Structured JSON logging middleware. (NFR-004)
 *
 * Outputs JSON logs with timestamp, level, requestId, userId, and action.
 * In production, these can be ingested by log aggregation services.
 */
export function createLogger(requestId?: string) {
  const id = requestId ?? randomUUID();

  function log(level: LogLevel, action: string, data?: Partial<Omit<LogEntry, 'timestamp' | 'level' | 'requestId' | 'action'>>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      requestId: id,
      action,
      ...data,
    };

    const output = JSON.stringify(entry);

    switch (level) {
      case 'error':
        console.error(output);
        break;
      case 'warn':
        console.warn(output);
        break;
      case 'debug':
        if (process.env.NODE_ENV === 'development') {
          console.debug(output);
        }
        break;
      default:
        console.log(output);
    }
  }

  return {
    info: (action: string, data?: Partial<Omit<LogEntry, 'timestamp' | 'level' | 'requestId' | 'action'>>) =>
      log('info', action, data),
    warn: (action: string, data?: Partial<Omit<LogEntry, 'timestamp' | 'level' | 'requestId' | 'action'>>) =>
      log('warn', action, data),
    error: (action: string, data?: Partial<Omit<LogEntry, 'timestamp' | 'level' | 'requestId' | 'action'>>) =>
      log('error', action, data),
    debug: (action: string, data?: Partial<Omit<LogEntry, 'timestamp' | 'level' | 'requestId' | 'action'>>) =>
      log('debug', action, data),
    requestId: id,
  };
}

export type Logger = ReturnType<typeof createLogger>;
