/**
 * 마크다운 파서 유틸리티
 * Markdown parser utilities
 *
 * 지원 문법 / Supported syntax:
 * - **볼드**, *이탤릭*, ~~취소선~~
 * - [링크](url)
 * - # 헤딩 (h1-h6)
 * - - 또는 * 리스트
 * - `인라인 코드`
 * - ```코드블록```
 * - > 인용문
 * - --- 수평선
 */

/**
 * HTML 특수문자 이스케이프
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * 마크다운 텍스트를 HTML로 변환
 * Convert markdown text to HTML
 */
export function parseMarkdown(text: string): string {
  if (!text) return ''

  let html = text

  // 코드블록 먼저 처리 (다른 파싱 방지)
  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    const escaped = escapeHtml(code.trim())
    return `<pre class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto my-4"><code class="text-sm">${escaped}</code></pre>`
  })

  // 인라인 코드
  html = html.replace(
    /`([^`]+)`/g,
    '<code class="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm">$1</code>'
  )

  // 헤딩 (줄 시작에서만)
  html = html.replace(/^######\s+(.+)$/gm, '<h6 class="text-base font-semibold mt-4 mb-2">$1</h6>')
  html = html.replace(/^#####\s+(.+)$/gm, '<h5 class="text-lg font-semibold mt-4 mb-2">$1</h5>')
  html = html.replace(/^####\s+(.+)$/gm, '<h4 class="text-xl font-semibold mt-5 mb-2">$1</h4>')
  html = html.replace(/^###\s+(.+)$/gm, '<h3 class="text-2xl font-semibold mt-5 mb-3">$1</h3>')
  html = html.replace(/^##\s+(.+)$/gm, '<h2 class="text-2xl font-bold mt-6 mb-3">$1</h2>')
  html = html.replace(/^#\s+(.+)$/gm, '<h1 class="text-3xl font-bold mt-6 mb-4">$1</h1>')

  // 수평선
  html = html.replace(/^---+$/gm, '<hr class="my-6 border-gray-300 dark:border-gray-600" />')

  // 인용문
  html = html.replace(
    /^>\s+(.+)$/gm,
    '<blockquote class="border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-4 italic text-gray-600 dark:text-gray-400">$1</blockquote>'
  )

  // 볼드, 이탤릭, 취소선
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
  html = html.replace(/~~(.+?)~~/g, '<del class="text-gray-500">$1</del>')

  // 링크
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">$1</a>'
  )

  // 리스트 (연속된 리스트 아이템을 ul로 감싸기)
  html = html.replace(/^[-*]\s+(.+)$/gm, '<li class="ml-4">$1</li>')
  html = html.replace(/(<li[^>]*>.*<\/li>\n?)+/g, (match) => {
    return `<ul class="list-disc list-inside my-4 space-y-1">${match}</ul>`
  })

  // 줄바꿈을 <br>로 변환 (단, 블록 요소 직후는 제외)
  html = html.replace(/\n(?!<)/g, '<br />\n')

  // 연속된 <br /> 정리
  html = html.replace(/(<br \/>[\n\s]*){3,}/g, '<br /><br />\n')

  return html
}

/**
 * 마크다운에서 순수 텍스트만 추출 (미리보기용)
 * Extract plain text from markdown (for preview)
 */
export function stripMarkdown(text: string): string {
  if (!text) return ''

  return text
    // 코드블록 제거
    .replace(/```[\s\S]*?```/g, '')
    // 인라인 코드 제거
    .replace(/`[^`]+`/g, '')
    // 헤딩 마크 제거
    .replace(/^#{1,6}\s+/gm, '')
    // 볼드/이탤릭 마크 제거
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/~~(.+?)~~/g, '$1')
    // 링크에서 텍스트만 추출
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // 리스트 마크 제거
    .replace(/^[-*]\s+/gm, '')
    // 인용문 마크 제거
    .replace(/^>\s+/gm, '')
    // 수평선 제거
    .replace(/^---+$/gm, '')
    // 연속 공백/줄바꿈 정리
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * 마크다운 텍스트 미리보기 (글자수 제한)
 * Markdown text preview (with character limit)
 */
export function getMarkdownPreview(text: string, maxLength: number = 150): string {
  const stripped = stripMarkdown(text)
  if (stripped.length <= maxLength) return stripped
  return stripped.slice(0, maxLength).trim() + '...'
}

/**
 * 마크다운 삽입 헬퍼
 * Markdown insertion helper
 */
export function insertMarkdown(
  text: string,
  selectionStart: number,
  selectionEnd: number,
  before: string,
  after: string
): { text: string; cursorPosition: number } {
  const selectedText = text.slice(selectionStart, selectionEnd)
  const beforeText = text.slice(0, selectionStart)
  const afterText = text.slice(selectionEnd)

  const newText = beforeText + before + selectedText + after + afterText
  const cursorPosition = selectionStart + before.length + selectedText.length + after.length

  return { text: newText, cursorPosition }
}
