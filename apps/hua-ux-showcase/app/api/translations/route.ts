import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const language = searchParams.get('language') || 'ko';
  const namespace = searchParams.get('namespace') || 'common';

  try {
    const filePath = join(process.cwd(), 'translations', language, `${namespace}.json`);
    const fileContents = readFileSync(filePath, 'utf-8');
    const translations = JSON.parse(fileContents);

    return NextResponse.json(translations);
  } catch (error) {
    console.error('Translation load error:', error);
    return NextResponse.json(
      { error: 'Translation not found' },
      { status: 404 }
    );
  }
}
