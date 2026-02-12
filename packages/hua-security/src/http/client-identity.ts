/**
 * HTTP Client Identity utilities
 *
 * Extract client IP, User-Agent, and detect suspicious agents.
 * Framework-agnostic: works with any object that has a headers.get() method.
 */

/**
 * Request-like object with headers
 */
export interface RequestWithHeaders {
  headers: {
    get(name: string): string | null;
  };
}

/**
 * Extract client IP address from request headers
 *
 * Priority:
 * 1. x-forwarded-for header (behind proxy/load balancer)
 * 2. x-real-ip header
 * 3. Development: 127.0.0.1
 * 4. Unknown: 'unknown'
 */
export function getClientIP(request: RequestWithHeaders): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  if (process.env.NODE_ENV === 'development') {
    return '127.0.0.1';
  }

  return 'unknown';
}

/**
 * Extract User-Agent from request headers
 */
export function getUserAgent(request: RequestWithHeaders): string | null {
  return request.headers.get('user-agent');
}

/**
 * Check if User-Agent belongs to an allowed bot
 */
export function isAllowedBot(userAgent: string): boolean {
  if (!userAgent) return false;

  const lowerUA = userAgent.toLowerCase();

  const allowedBotsEnv = process.env.ALLOWED_BOT_USER_AGENTS || '';
  const allowedBots = allowedBotsEnv
    .split(',')
    .map(bot => bot.trim().toLowerCase())
    .filter(bot => bot.length > 0);

  const defaultAllowedBots = [
    'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
    'yandexbot', 'facebookexternalhit', 'twitterbot', 'linkedinbot',
    'whatsapp', 'telegrambot', 'discordbot',
    'hua-bot', 'my-app-bot', 'hua-monitor',
  ];

  const allAllowedBots = [...defaultAllowedBots, ...allowedBots];

  return allAllowedBots.some(bot => lowerUA.includes(bot));
}

/**
 * Check if User-Agent is a normal mobile browser
 */
export function isNormalMobileUserAgent(userAgent: string): boolean {
  if (!userAgent) return false;

  const lowerUA = userAgent.toLowerCase();
  const mobileBrowsers = [
    'mobile', 'android', 'iphone', 'ipad', 'ipod',
    'safari', 'chrome', 'firefox', 'samsung', 'opera',
    'edge', 'ucbrowser', 'miuibrowser',
  ];

  return mobileBrowsers.some(browser => lowerUA.includes(browser));
}

/**
 * Check if User-Agent appears suspicious (bot, crawler, automation tool)
 *
 * Checks against known suspicious patterns while allowing:
 * - Known search engine bots
 * - Normal mobile browsers
 */
export function isSuspiciousUserAgent(userAgent: string): boolean {
  if (process.env.NODE_ENV === 'test' || process.env.DISABLE_USER_AGENT_CHECK === 'true') {
    return false;
  }

  if (!userAgent || userAgent.trim().length === 0) {
    return true;
  }

  if (isAllowedBot(userAgent)) {
    return false;
  }

  if (isNormalMobileUserAgent(userAgent)) {
    return false;
  }

  const suspiciousPatterns = [
    'bot', 'crawler', 'spider', 'scraper', 'crawling',
    'curl', 'wget', 'httpie', 'python-requests', 'go-http-client',
    'postman', 'insomnia', 'rest-client', 'httpclient',
    'python', 'node', 'java', 'scrapy', 'selenium',
    'apache-httpclient', 'okhttp', 'axios', 'fetch', 'urllib',
  ];

  const lowerUserAgent = userAgent.toLowerCase().trim();

  if (lowerUserAgent.length < 10) {
    return true;
  }

  return suspiciousPatterns.some(pattern => lowerUserAgent.includes(pattern));
}
