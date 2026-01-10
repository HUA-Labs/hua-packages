import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

/**
 * 번역 API Route
 *
 * @hua-labs/i18n-core의 API loader와 연동하여
 * 동적으로 번역 파일을 제공합니다.
 *
 * GET /api/translations/[lang]/[namespace]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lang: string; namespace: string }> }
) {
  const { lang, namespace } = await params;

  // 보안: 허용된 언어만 처리
  const allowedLanguages = ["ko", "en", "ja"];
  if (!allowedLanguages.includes(lang)) {
    return NextResponse.json({ error: "Invalid language" }, { status: 400 });
  }

  // 보안: namespace 검증 (영문, 숫자, -, _ 만 허용)
  if (!/^[a-zA-Z0-9-_]+$/.test(namespace)) {
    return NextResponse.json({ error: "Invalid namespace" }, { status: 400 });
  }

  try {
    // 번역 파일 경로
    const translationsDir = path.join(process.cwd(), "translations");
    const filePath = path.join(translationsDir, lang, `${namespace}.json`);

    // 파일 존재 확인
    if (!fs.existsSync(filePath)) {
      // fallback 언어 시도
      const fallbackPath = path.join(translationsDir, "ko", `${namespace}.json`);
      if (fs.existsSync(fallbackPath)) {
        const data = JSON.parse(fs.readFileSync(fallbackPath, "utf-8"));
        return NextResponse.json(data);
      }

      return NextResponse.json(
        { error: `Translation not found: ${lang}/${namespace}` },
        { status: 404 }
      );
    }

    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    return NextResponse.json(data, {
      headers: {
        // 캐시 설정: 1시간 캐시, stale-while-revalidate
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error(`Failed to load translation: ${lang}/${namespace}`, error);
    return NextResponse.json(
      { error: "Failed to load translation" },
      { status: 500 }
    );
  }
}
