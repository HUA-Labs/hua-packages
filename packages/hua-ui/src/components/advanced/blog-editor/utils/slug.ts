/**
 * 슬러그 생성 유틸리티
 * Slug generation utilities
 */

/**
 * 제목에서 URL 슬러그 생성
 * Generate URL slug from title
 *
 * @param title - 제목 / Title
 * @returns 슬러그 / Slug
 *
 * @example
 * ```ts
 * generateSlug('Hello World') // 'hello-world'
 * generateSlug('안녕하세요') // '안녕하세요'
 * generateSlug('Hello 안녕') // 'hello-안녕'
 * ```
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣ぁ-んァ-ン一-龯\s_.~-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim()
}

/**
 * 슬러그 유효성 검사
 * Validate slug
 *
 * @param slug - 슬러그 / Slug
 * @returns 유효 여부 / Whether valid
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || slug.length === 0) return false
  if (slug.length > 200) return false

  // 슬러그 형식 검사: 영문, 숫자, 한글, 일본어, 하이픈만 허용
  const slugPattern = /^[a-z0-9가-힣ぁ-んァ-ン一-龯_.~-]+$/
  return slugPattern.test(slug)
}

/**
 * 슬러그 정규화 (입력된 슬러그를 유효한 형식으로 변환)
 * Normalize slug (convert input to valid format)
 *
 * @param input - 입력값 / Input value
 * @returns 정규화된 슬러그 / Normalized slug
 */
export function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9가-힣ぁ-んァ-ン一-龯_.~-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}
