import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Translation API Route (Dynamic Path)
 * 
 * 번역 파일을 제공하는 API 엔드포인트입니다.
 * Provides translation files via API endpoint.
 * 
 * 경로: /api/translations/[language]/[namespace]
 * Path: /api/translations/[language]/[namespace]
 * 
 * @param request - Next.js request object
 * @param params - Route parameters: { language: string, namespace: string }
 * @returns Translation object or error response
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ language: string; namespace: string }> }
) {
  const { language, namespace } = await params;

  // 언어 검증
  // Validate language
  const supportedLanguages = ['ko', 'en'];
  if (!supportedLanguages.includes(language)) {
    return NextResponse.json(
      { error: 'Unsupported language' },
      { status: 400 }
    );
  }

  // 네임스페이스 검증 (보안: 파일 경로 조작 방지)
  // Validate namespace (security: prevent path traversal)
  const safeNamespace = namespace.replace(/[^a-zA-Z0-9-_]/g, '');
  if (safeNamespace !== namespace) {
    return NextResponse.json(
      { error: 'Invalid namespace' },
      { status: 400 }
    );
  }

  try {
    const filePath = join(process.cwd(), 'translations', language, `${safeNamespace}.json`);
    const fileContents = readFileSync(filePath, 'utf-8');
    const translations = JSON.parse(fileContents);

    return NextResponse.json(translations, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    // 에러 타입 구분
    // Distinguish error types
    
    // 파일이 없는 경우
    // File not found
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return NextResponse.json(
        { error: 'Translation file not found' },
        { status: 404 }
      );
    }
    
    // JSON 파싱 에러
    // JSON parse error
    if (error instanceof SyntaxError) {
      console.error('Translation JSON parse error:', error);
      return NextResponse.json(
        { error: 'Invalid translation file format' },
        { status: 500 }
      );
    }

    // 기타 에러
    // Other errors
    console.error('Translation load error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
