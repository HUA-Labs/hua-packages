/**
 * 입력값 sanitization 유틸리티
 * XSS 및 인젝션 공격 방지
 */

/**
 * HTML 태그를 제거하고 특수 문자를 이스케이프
 * @param input 사용자 입력 문자열
 * @returns sanitized 문자열
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // HTML 태그 제거
  let sanitized = input.replace(/<[^>]*>/g, '');
  
  // 특수 문자 이스케이프 (기본적인 XSS 방지)
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  return sanitized.trim();
}

/**
 * 제목용 sanitization (일부 특수 문자는 허용)
 * @param input 사용자 입력 문자열
 * @param maxLength 최대 길이
 * @returns sanitized 문자열 (길이 제한 적용)
 */
export function sanitizeTitle(input: string, maxLength: number = 100): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // HTML 태그 제거
  let sanitized = input.replace(/<[^>]*>/g, '');
  
  // 기본적인 XSS 방지 (제목은 일부 특수 문자 허용)
  sanitized = sanitized
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');

  // 길이 제한
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized.trim();
}

/**
 * 이메일 주소 sanitization
 * @param email 이메일 주소
 * @returns sanitized 이메일 주소
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return '';
  }

  // 이메일 형식에 맞게 기본적인 sanitization만 수행
  return email.trim().toLowerCase();
}

/**
 * 이름 sanitization
 * @param name 이름
 * @returns sanitized 이름
 */
export function sanitizeName(name: string): string {
  if (!name || typeof name !== 'string') {
    return '';
  }

  // HTML 태그 제거
  let sanitized = name.replace(/<[^>]*>/g, '');
  
  // 기본적인 XSS 방지
  sanitized = sanitized
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');

  return sanitized.trim();
}

/**
 * HTML 이스케이프 유틸리티 (이메일 본문용)
 * @param text 이스케이프할 텍스트
 * @returns 이스케이프된 HTML 문자열
 */
export function escapeHtml(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}
