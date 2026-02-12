/**
 * Password validation utilities
 */

/**
 * Validate password strength against security rules
 *
 * Rules:
 * - Minimum 8 characters
 * - Must contain uppercase letter
 * - Must contain lowercase letter
 * - Must contain number
 * - Must contain special character
 * - No spaces allowed
 * - No 3+ consecutive identical characters
 *
 * @returns Object with isValid boolean and errors array with bilingual messages
 */
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (password.length < 8) errors.push('8자 이상 / At least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('대문자 포함 / Uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('소문자 포함 / Lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('숫자 포함 / Number');
  if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) errors.push('특수문자 포함 / Special character');
  if (/\s/.test(password)) errors.push('공백 불가 / No spaces');
  if (/(.)\1\1/.test(password)) errors.push('동일 문자 3회 이상 불가 / No 3 consecutive identical chars');
  return { isValid: errors.length === 0, errors };
}
