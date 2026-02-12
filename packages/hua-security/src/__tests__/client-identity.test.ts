import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getClientIP, getUserAgent, isAllowedBot, isSuspiciousUserAgent, isNormalMobileUserAgent } from '../http/client-identity';

function mockRequest(headers: Record<string, string>) {
  return {
    headers: {
      get(name: string) {
        return headers[name.toLowerCase()] ?? null;
      },
    },
  };
}

describe('client-identity', () => {
  describe('getClientIP', () => {
    it('should extract IP from x-forwarded-for', () => {
      const req = mockRequest({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8' });
      expect(getClientIP(req)).toBe('1.2.3.4');
    });

    it('should extract IP from x-real-ip', () => {
      const req = mockRequest({ 'x-real-ip': '10.0.0.1' });
      expect(getClientIP(req)).toBe('10.0.0.1');
    });

    it('should return unknown when no headers', () => {
      const origEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      const req = mockRequest({});
      expect(getClientIP(req)).toBe('unknown');
      process.env.NODE_ENV = origEnv;
    });

    it('should return 127.0.0.1 in development', () => {
      const origEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      const req = mockRequest({});
      expect(getClientIP(req)).toBe('127.0.0.1');
      process.env.NODE_ENV = origEnv;
    });

    it('should extract first IP from multi-IP forwarded header', () => {
      const req = mockRequest({ 'x-forwarded-for': '1.1.1.1, 2.2.2.2, 3.3.3.3' });
      expect(getClientIP(req)).toBe('1.1.1.1');
    });

    it('should trim whitespace from forwarded IP', () => {
      const req = mockRequest({ 'x-forwarded-for': '  4.4.4.4  ' });
      expect(getClientIP(req)).toBe('4.4.4.4');
    });

    it('should prefer x-forwarded-for over x-real-ip', () => {
      const req = mockRequest({ 'x-forwarded-for': '1.1.1.1', 'x-real-ip': '2.2.2.2' });
      expect(getClientIP(req)).toBe('1.1.1.1');
    });
  });

  describe('getUserAgent', () => {
    it('should extract user-agent header', () => {
      const req = mockRequest({ 'user-agent': 'Mozilla/5.0' });
      expect(getUserAgent(req)).toBe('Mozilla/5.0');
    });

    it('should return null when missing', () => {
      const req = mockRequest({});
      expect(getUserAgent(req)).toBeNull();
    });
  });

  describe('isAllowedBot', () => {
    it('should detect googlebot', () => {
      expect(isAllowedBot('Googlebot/2.1')).toBe(true);
    });

    it('should reject unknown bot', () => {
      expect(isAllowedBot('EvilBot/1.0')).toBe(false);
    });

    it('should return false for empty', () => {
      expect(isAllowedBot('')).toBe(false);
    });

    it('should detect custom env bot', () => {
      const orig = process.env.ALLOWED_BOT_USER_AGENTS;
      process.env.ALLOWED_BOT_USER_AGENTS = 'MyCustomBot';
      expect(isAllowedBot('MyCustomBot/1.0')).toBe(true);
      process.env.ALLOWED_BOT_USER_AGENTS = orig || '';
    });

    it('should detect hua-bot', () => {
      expect(isAllowedBot('hua-bot/1.0 monitor')).toBe(true);
    });

    it('should detect whatsapp', () => {
      expect(isAllowedBot('WhatsApp/2.0')).toBe(true);
    });
  });

  describe('isNormalMobileUserAgent', () => {
    it('should detect mobile browser', () => {
      expect(isNormalMobileUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 16_0)')).toBe(true);
    });

    it('should detect android', () => {
      expect(isNormalMobileUserAgent('Mozilla/5.0 (Linux; Android 13)')).toBe(true);
    });

    it('should detect Samsung browser', () => {
      expect(isNormalMobileUserAgent('Mozilla/5.0 SamsungBrowser/20.0')).toBe(true);
    });

    it('should detect UCBrowser', () => {
      expect(isNormalMobileUserAgent('Mozilla/5.0 UCBrowser/13.0')).toBe(true);
    });

    it('should return false for empty', () => {
      expect(isNormalMobileUserAgent('')).toBe(false);
    });
  });

  describe('isSuspiciousUserAgent', () => {
    const origEnv = process.env.NODE_ENV;

    beforeEach(() => {
      process.env.NODE_ENV = 'production';
      delete process.env.DISABLE_USER_AGENT_CHECK;
    });

    afterEach(() => {
      process.env.NODE_ENV = origEnv;
    });

    it('should flag empty user-agent', () => {
      expect(isSuspiciousUserAgent('')).toBe(true);
    });

    it('should flag short user-agent', () => {
      expect(isSuspiciousUserAgent('Hi')).toBe(true);
    });

    it('should flag curl', () => {
      expect(isSuspiciousUserAgent('curl/7.68.0')).toBe(true);
    });

    it('should allow chrome browser', () => {
      expect(isSuspiciousUserAgent('Mozilla/5.0 Chrome/120.0.0.0 Safari/537.36')).toBe(false);
    });

    it('should allow googlebot', () => {
      expect(isSuspiciousUserAgent('Googlebot/2.1 (+http://www.google.com/bot.html)')).toBe(false);
    });

    it('should be disabled in test env', () => {
      process.env.NODE_ENV = 'test';
      expect(isSuspiciousUserAgent('curl/7.68.0')).toBe(false);
    });

    it('should respect DISABLE_USER_AGENT_CHECK', () => {
      process.env.DISABLE_USER_AGENT_CHECK = 'true';
      expect(isSuspiciousUserAgent('curl/7.68.0')).toBe(false);
      delete process.env.DISABLE_USER_AGENT_CHECK;
    });

    it('should flag python-requests', () => {
      expect(isSuspiciousUserAgent('python-requests/2.28.0')).toBe(true);
    });

    it('should flag selenium', () => {
      expect(isSuspiciousUserAgent('Mozilla/5.0 Selenium/4.0')).toBe(true);
    });
  });
});
