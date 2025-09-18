/**
 * 이메일 유효성 검사
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 비밀번호 유효성 검사
 */
export function validatePassword(password: string, options: {
  minLength?: number
  requireUppercase?: boolean
  requireLowercase?: boolean
  requireNumbers?: boolean
  requireSpecialChars?: boolean
} = {}): { isValid: boolean; errors: string[] } {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = false
  } = options

  const errors: string[] = []

  if (password.length < minLength) {
    errors.push(`비밀번호는 최소 ${minLength}자 이상이어야 합니다.`)
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('대문자가 포함되어야 합니다.')
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    errors.push('소문자가 포함되어야 합니다.')
  }

  if (requireNumbers && !/\d/.test(password)) {
    errors.push('숫자가 포함되어야 합니다.')
  }

  if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('특수문자가 포함되어야 합니다.')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * URL 유효성 검사
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * 전화번호 유효성 검사 (한국)
 */
export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^01[0-9]-?[0-9]{4}-?[0-9]{4}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

/**
 * 숫자 범위 검사
 */
export function validateNumberRange(
  value: number,
  min: number,
  max: number
): boolean {
  return value >= min && value <= max
}

/**
 * 문자열 길이 검사
 */
export function validateStringLength(
  str: string,
  min: number,
  max: number
): boolean {
  return str.length >= min && str.length <= max
} 