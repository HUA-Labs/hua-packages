import { describe, it, expect } from 'vitest';
import {
  sanitizeInput,
  sanitizeTitle,
  sanitizeEmail,
  sanitizeName,
  escapeHtml,
  maskEmailForLog,
} from '../sanitize';

describe('sanitizeInput', () => {
  it('should remove HTML tags', () => {
    expect(sanitizeInput('<div>hello</div>')).toBe('hello');
    // Note: sanitizeInput removes tags but content inside remains (then escaped)
    expect(sanitizeInput('<script>alert("xss")</script>test')).toBe('alert(&quot;xss&quot;)test');
  });

  it('should escape special characters', () => {
    expect(sanitizeInput('a & b')).toBe('a &amp; b');
    expect(sanitizeInput('a < b')).toBe('a &lt; b');
    expect(sanitizeInput('a > b')).toBe('a &gt; b');
    expect(sanitizeInput('a "quote" b')).toBe('a &quot;quote&quot; b');
    expect(sanitizeInput("a 'quote' b")).toBe('a &#x27;quote&#x27; b');
  });

  it('should handle combined HTML and special chars', () => {
    const input = '<div>Test & "quote"</div>';
    const result = sanitizeInput(input);
    expect(result).not.toContain('<');
    expect(result).not.toContain('>');
    expect(result).toContain('&amp;');
    expect(result).toContain('&quot;');
  });

  it('should trim whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello');
  });

  it('should handle empty string', () => {
    expect(sanitizeInput('')).toBe('');
  });

  it('should handle non-string input gracefully', () => {
    // @ts-expect-error Testing non-string input
    expect(sanitizeInput(null)).toBe('');
    // @ts-expect-error Testing non-string input
    expect(sanitizeInput(undefined)).toBe('');
  });
});

describe('sanitizeTitle', () => {
  it('should remove HTML tags', () => {
    expect(sanitizeTitle('<h1>Title</h1>')).toBe('Title');
  });

  it('should remove script tags', () => {
    // Note: sanitizeTitle first removes all HTML tags (including <script>),
    // leaving the text content inside, which is safer than full removal
    expect(sanitizeTitle('Title<script>alert("xss")</script>')).toBe('Titlealert("xss")');
  });

  it('should remove iframe tags', () => {
    expect(sanitizeTitle('Title<iframe src="evil"></iframe>')).toBe('Title');
  });

  it('should remove javascript: protocol', () => {
    expect(sanitizeTitle('Title javascript:alert(1)')).toBe('Title alert(1)');
  });

  it('should remove event handlers', () => {
    expect(sanitizeTitle('Title onclick=alert(1)')).toBe('Title alert(1)');
    expect(sanitizeTitle('Title onload=alert(1)')).toBe('Title alert(1)');
  });

  it('should enforce max length', () => {
    const longTitle = 'a'.repeat(150);
    const result = sanitizeTitle(longTitle, 100);
    expect(result.length).toBeLessThanOrEqual(100);
  });

  it('should use default max length of 100', () => {
    const longTitle = 'a'.repeat(150);
    const result = sanitizeTitle(longTitle);
    expect(result.length).toBeLessThanOrEqual(100);
  });

  it('should trim whitespace', () => {
    expect(sanitizeTitle('  Title  ')).toBe('Title');
  });

  it('should handle empty string', () => {
    expect(sanitizeTitle('')).toBe('');
  });
});

describe('sanitizeEmail', () => {
  it('should trim whitespace', () => {
    expect(sanitizeEmail('  user@example.com  ')).toBe('user@example.com');
  });

  it('should convert to lowercase', () => {
    expect(sanitizeEmail('User@Example.COM')).toBe('user@example.com');
  });

  it('should handle both trim and lowercase', () => {
    expect(sanitizeEmail('  User@Example.COM  ')).toBe('user@example.com');
  });

  it('should handle empty string', () => {
    expect(sanitizeEmail('')).toBe('');
  });

  it('should handle non-string input gracefully', () => {
    // @ts-expect-error Testing non-string input
    expect(sanitizeEmail(null)).toBe('');
    // @ts-expect-error Testing non-string input
    expect(sanitizeEmail(undefined)).toBe('');
  });
});

describe('sanitizeName', () => {
  it('should remove HTML tags', () => {
    expect(sanitizeName('<b>John</b>')).toBe('John');
  });

  it('should remove script tags', () => {
    // Note: sanitizeName removes HTML tags but leaves text content
    expect(sanitizeName('John<script>alert("xss")</script>')).toBe('Johnalert("xss")');
  });

  it('should remove javascript: protocol', () => {
    expect(sanitizeName('John javascript:alert(1)')).toBe('John alert(1)');
  });

  it('should remove event handlers', () => {
    expect(sanitizeName('John onclick=alert(1)')).toBe('John alert(1)');
  });

  it('should trim whitespace', () => {
    expect(sanitizeName('  John  ')).toBe('John');
  });

  it('should handle Korean names', () => {
    expect(sanitizeName('홍길동')).toBe('홍길동');
    expect(sanitizeName('<b>홍길동</b>')).toBe('홍길동');
  });

  it('should handle empty string', () => {
    expect(sanitizeName('')).toBe('');
  });
});

describe('escapeHtml', () => {
  it('should escape ampersand', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b');
  });

  it('should escape less than', () => {
    expect(escapeHtml('a < b')).toBe('a &lt; b');
  });

  it('should escape greater than', () => {
    expect(escapeHtml('a > b')).toBe('a &gt; b');
  });

  it('should escape double quotes', () => {
    expect(escapeHtml('a "quote" b')).toBe('a &quot;quote&quot; b');
  });

  it('should escape single quotes', () => {
    expect(escapeHtml("a 'quote' b")).toBe('a &#x27;quote&#x27; b');
  });

  it('should escape all special characters together', () => {
    const input = '<div class="test">A & B</div>';
    const result = escapeHtml(input);
    expect(result).toBe('&lt;div class=&quot;test&quot;&gt;A &amp; B&lt;/div&gt;');
  });

  it('should handle empty string', () => {
    expect(escapeHtml('')).toBe('');
  });

  it('should handle non-string input gracefully', () => {
    // @ts-expect-error Testing non-string input
    expect(escapeHtml(null)).toBe('');
    // @ts-expect-error Testing non-string input
    expect(escapeHtml(undefined)).toBe('');
  });
});

describe('maskEmailForLog', () => {
  it('should mask email with default visible chars (3)', () => {
    expect(maskEmailForLog('user@example.com')).toBe('use***@***');
  });

  it('should mask email with custom visible chars', () => {
    expect(maskEmailForLog('user@example.com', 2)).toBe('us***@***');
    // Note: local part 'user' has length 4, so with visibleChars=4 (not > 4), it shows '***'
    expect(maskEmailForLog('user@example.com', 4)).toBe('***@***');
    expect(maskEmailForLog('username@example.com', 4)).toBe('user***@***'); // length 8 > 4
  });

  it('should handle short email local part', () => {
    expect(maskEmailForLog('ab@example.com', 3)).toBe('***@***');
  });

  it('should handle null input', () => {
    expect(maskEmailForLog(null)).toBeUndefined();
  });

  it('should handle undefined input', () => {
    expect(maskEmailForLog(undefined)).toBeUndefined();
  });

  it('should handle empty string', () => {
    expect(maskEmailForLog('')).toBeUndefined();
  });

  it('should handle invalid email (no @ symbol)', () => {
    expect(maskEmailForLog('notanemail')).toBe('***@***');
  });

  it('should always mask domain', () => {
    const result = maskEmailForLog('user@example.com');
    expect(result).toContain('@***');
  });

  it('should handle long email addresses', () => {
    const result = maskEmailForLog('verylongemailaddress@example.com', 5);
    expect(result).toBe('veryl***@***');
  });
});
