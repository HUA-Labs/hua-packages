/**
 * Logger utility
 *
 * Environment-based log level control:
 * - production: warn, error only
 * - development: all levels
 *
 * Override with LOG_LEVEL env var:
 * - LOG_LEVEL=debug|info|warn|error
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  [key: string]: unknown;
}

export interface Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function getMinLevel(): number {
  const envLevel =
    typeof process !== 'undefined'
      ? (process.env?.LOG_LEVEL as LogLevel | undefined)
      : undefined;
  if (envLevel && LOG_LEVELS[envLevel] !== undefined) {
    return LOG_LEVELS[envLevel];
  }
  const isProd =
    typeof process !== 'undefined' &&
    process.env?.NODE_ENV === 'production';
  return isProd ? LOG_LEVELS.warn : LOG_LEVELS.debug;
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= getMinLevel();
}

function formatMessage(
  prefix: string,
  level: LogLevel,
  message: string,
  context?: LogContext,
): string {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` ${JSON.stringify(context)}` : '';
  const levelTag = level.toUpperCase();
  const prefixTag = prefix ? `${prefix}:` : '';
  return `[${timestamp}] [${prefixTag}${levelTag}] ${message}${contextStr}`;
}

function makeLogger(prefix: string): Logger {
  return {
    debug(message: string, context?: LogContext) {
      if (shouldLog('debug')) {
        console.log(formatMessage(prefix, 'debug', message, context));
      }
    },
    info(message: string, context?: LogContext) {
      if (shouldLog('info')) {
        console.log(formatMessage(prefix, 'info', message, context));
      }
    },
    warn(message: string, context?: LogContext) {
      if (shouldLog('warn')) {
        console.warn(formatMessage(prefix, 'warn', message, context));
      }
    },
    error(message: string, context?: LogContext) {
      if (shouldLog('error')) {
        console.error(formatMessage(prefix, 'error', message, context));
      }
    },
  };
}

/** Default logger (no prefix) */
export const logger: Logger = makeLogger('');

/** Create a named logger with a prefix */
export function createLogger(prefix: string): Logger {
  return makeLogger(prefix);
}
