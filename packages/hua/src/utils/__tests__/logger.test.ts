/**
 * Logger utility tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createLogger } from '../logger';

describe('utils/logger', () => {
  const originalEnv = process.env;
  let consoleSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    process.env = { ...originalEnv };
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    consoleSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  describe('createLogger', () => {
    it('should create logger instance with prefix', () => {
      const logger = createLogger('test');
      expect(logger).toBeDefined();
      expect(logger.debug).toBeDefined();
      expect(logger.info).toBeDefined();
      expect(logger.warn).toBeDefined();
      expect(logger.error).toBeDefined();
    });

    it('should log debug message in development', () => {
      process.env.NODE_ENV = 'development';
      const logger = createLogger('test');
      logger.debug('debug message');
      expect(consoleSpy).toHaveBeenCalled();
      const call = consoleSpy.mock.calls[0][0];
      expect(call).toContain('test:DEBUG');
      expect(call).toContain('debug message');
    });

    it('should log warn message with context', () => {
      const logger = createLogger('test');
      logger.warn('warning', { key: 'value' });
      expect(warnSpy).toHaveBeenCalled();
      const call = warnSpy.mock.calls[0][0];
      expect(call).toContain('test:WARN');
      expect(call).toContain('warning');
      expect(call).toContain('"key":"value"');
    });

    it('should log error message', () => {
      const logger = createLogger('test');
      logger.error('error message');
      expect(errorSpy).toHaveBeenCalled();
      const call = errorSpy.mock.calls[0][0];
      expect(call).toContain('test:ERROR');
      expect(call).toContain('error message');
    });

    it('should not log debug/info in production', () => {
      process.env.NODE_ENV = 'production';
      const logger = createLogger('test');
      logger.debug('debug');
      logger.info('info');
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('should respect LOG_LEVEL env var', () => {
      process.env.LOG_LEVEL = 'error';
      const logger = createLogger('test');
      logger.warn('warning');
      expect(warnSpy).not.toHaveBeenCalled();

      logger.error('error');
      expect(errorSpy).toHaveBeenCalled();
    });
  });
});
