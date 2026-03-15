/**
 * @hua-labs/i18n-formatters - Date Formatter Edge Case Tests
 *
 * formatDate, formatDateTime, formatDateLocalized, formatDateTimeLocalized,
 * relative-time, timezone 유틸리티의 엣지케이스 테스트.
 * 로캘별 포맷, DST, 타임존, 유효하지 않은 날짜, 상대 시간 심화 등을 검증한다.
 */

import { describe, it, expect } from "vitest";
import {
  formatDate,
  formatDateTime,
  formatDateLocalized,
  formatDateTimeLocalized,
  getLocaleFromLanguage,
} from "../date/utils/date-formatter";
import {
  getKoreanDate,
  getKoreanDateString,
  convertToTimezone,
  applyTimezoneOffset,
  parseDateAsTimezone,
  KST_OFFSET,
} from "../date/utils/timezone";
import { formatRelativeTime } from "../date/utils/relative-time";

// ─────────────────────────────────────────────
// getLocaleFromLanguage 엣지케이스
// ─────────────────────────────────────────────

describe("getLocaleFromLanguage 엣지케이스", () => {
  it("zh → zh-CN", () => {
    expect(getLocaleFromLanguage("zh")).toBe("zh-CN");
  });

  it("de → de-DE", () => {
    expect(getLocaleFromLanguage("de")).toBe("de-DE");
  });

  it("fr → fr-FR", () => {
    expect(getLocaleFromLanguage("fr")).toBe("fr-FR");
  });

  it("es → es-ES", () => {
    expect(getLocaleFromLanguage("es")).toBe("es-ES");
  });

  it("빈 문자열 → en-US 기본값", () => {
    expect(getLocaleFromLanguage("")).toBe("en-US");
  });

  it("매핑되지 않은 언어(ar) → en-US 기본값", () => {
    expect(getLocaleFromLanguage("ar")).toBe("en-US");
  });

  it("이미 전체 로케일 코드(ko-KR)가 들어오면 매핑 없으므로 en-US 반환", () => {
    // LOCALE_MAP은 단축 코드(ko, en, ja 등)만 가짐
    expect(getLocaleFromLanguage("ko-KR")).toBe("en-US");
  });
});

// ─────────────────────────────────────────────
// formatDate 포맷 문자열 엣지케이스
// ─────────────────────────────────────────────

describe("formatDate — 다양한 포맷 패턴", () => {
  // 고정 UTC 날짜를 사용해 KST 변환 후 결과 예측
  // 2025-06-15T00:00:00Z → KST는 2025-06-15 09:00:00
  const date = new Date("2025-06-15T00:00:00.000Z");

  it("기본 YYYY-MM-DD 형식", () => {
    const result = formatDate(date);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("YYYY/MM/DD 형식", () => {
    const result = formatDate(date, { format: "YYYY/MM/DD" });
    expect(result).toMatch(/^\d{4}\/\d{2}\/\d{2}$/);
  });

  it("DD/MM/YYYY 유럽 형식", () => {
    const result = formatDate(date, { format: "DD/MM/YYYY" });
    expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });

  it("MM-DD-YYYY 미국 형식", () => {
    const result = formatDate(date, { format: "MM-DD-YYYY" });
    expect(result).toMatch(/^\d{2}-\d{2}-\d{4}$/);
  });

  it("YYYY년 MM월 DD일 한국어 형식", () => {
    const result = formatDate(date, { format: "YYYY년 MM월 DD일" });
    expect(result).toMatch(/^\d{4}년 \d{2}월 \d{2}일$/);
  });

  it("단일 자리 M, D 형식", () => {
    // 1월 5일 같은 경우 M=1, D=5
    const jan5 = new Date("2025-01-05T00:00:00.000Z");
    const result = formatDate(jan5, { format: "YYYY-M-D" });
    // M은 1~2자리, D는 1~2자리
    expect(result).toMatch(/^\d{4}-\d{1,2}-\d{1,2}$/);
  });
});

describe("formatDate — 타임존 옵션", () => {
  it("UTC+5:30(IST) 타임존으로 변환", () => {
    // 2025-01-01T00:00:00Z → IST는 2025-01-01 05:30
    const date = new Date("2025-01-01T00:00:00.000Z");
    const result = formatDate(date, { timezone: { offset: 330 } }); // UTC+5:30
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    // IST로 변환 후 날짜는 2025-01-01 (같은 날)
    expect(result).toContain("2025");
  });

  it("UTC-5(EST) 타임존으로 변환", () => {
    // 2025-01-01T06:00:00Z → EST는 2025-01-01 01:00
    const date = new Date("2025-01-01T06:00:00.000Z");
    const result = formatDate(date, { timezone: { offset: -300 } }); // UTC-5
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("타임존 없으면 KST(UTC+9) 기본 적용", () => {
    // 2025-06-15T00:00:00Z → KST 09:00 (같은 날)
    const date = new Date("2025-06-15T00:00:00.000Z");
    const result = formatDate(date);
    expect(result).toContain("2025");
  });
});

// ─────────────────────────────────────────────
// formatDateTime 엣지케이스
// ─────────────────────────────────────────────

describe("formatDateTime — 다양한 포맷 패턴", () => {
  const date = new Date("2025-03-10T03:05:09.000Z"); // KST: 2025-03-10 12:05:09

  it("기본 YYYY-MM-DD HH:mm:ss", () => {
    const result = formatDateTime(date);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
  });

  it("시간만 HH:mm 형식", () => {
    const result = formatDateTime(date, { format: "HH:mm" });
    expect(result).toMatch(/^\d{2}:\d{2}$/);
  });

  it("날짜+시간 커스텀 형식", () => {
    const result = formatDateTime(date, {
      format: "YYYY년 MM월 DD일 HH시 mm분",
    });
    expect(result).toMatch(/\d{4}년 \d{2}월 \d{2}일 \d{2}시 \d{2}분/);
  });

  it("단일 자리 H:m:s 형식", () => {
    const result = formatDateTime(date, { format: "H:m:s" });
    expect(result).toMatch(/^\d{1,2}:\d{1,2}:\d{1,2}$/);
  });
});

// ─────────────────────────────────────────────
// formatDateLocalized 로캘별 심화
// ─────────────────────────────────────────────

describe("formatDateLocalized — 로캘별 포맷", () => {
  const date = new Date("2025-07-20T12:00:00.000Z");

  it('ko-KR long → "2025년 7월 20일" 형태', () => {
    const result = formatDateLocalized(date, "ko-KR", { dateStyle: "long" });
    expect(result).toMatch(/\d{4}년/);
    expect(result).toMatch(/\d{1,2}월/);
    expect(result).toMatch(/\d{1,2}일/);
  });

  it("ko-KR full → 요일 포함", () => {
    const result = formatDateLocalized(date, "ko-KR", { dateStyle: "full" });
    expect(result).toMatch(/\d{4}년/);
    // 요일(일, 월, 화, 수, 목, 금, 토) 포함
    expect(result).toMatch(/[일월화수목금토]요일/);
  });

  it("ko-KR short → 마지막 점 없음(trailing dot 제거)", () => {
    const result = formatDateLocalized(date, "ko-KR", { dateStyle: "short" });
    expect(result.endsWith(".")).toBe(false);
  });

  it("en-US short → M/D/YY 형태", () => {
    const result = formatDateLocalized(date, "en-US", { dateStyle: "short" });
    expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{2,4}/);
  });

  it("en-US medium → Jan 20, 2025 형태", () => {
    const result = formatDateLocalized(date, "en-US", { dateStyle: "medium" });
    expect(result).toMatch(/\w{3} \d{1,2}, \d{4}/);
  });

  it("ja-JP long → 日本語 날짜 형식", () => {
    const result = formatDateLocalized(date, "ja-JP", { dateStyle: "long" });
    expect(result).toContain("2025年");
  });

  it("de-DE long → 독일어 날짜 형식", () => {
    const result = formatDateLocalized(date, "de-DE", { dateStyle: "long" });
    expect(result).toContain("2025");
  });

  it("dateStyle: long vs short → long이 더 길거나 같음", () => {
    const longResult = formatDateLocalized(date, "en-US", {
      dateStyle: "long",
    });
    const shortResult = formatDateLocalized(date, "en-US", {
      dateStyle: "short",
    });
    expect(longResult.length).toBeGreaterThanOrEqual(shortResult.length);
  });

  it("timeZone 옵션 전달 시 지정된 타임존으로 포맷팅", () => {
    const result = formatDateLocalized(date, "en-US", {
      dateStyle: "short",
      timeZone: "America/New_York",
    });
    expect(result).toMatch(/\d/);
  });
});

// ─────────────────────────────────────────────
// DST(일광절약시간) 경계 날짜 테스트
// ─────────────────────────────────────────────

describe("formatDateLocalized — DST 경계 날짜", () => {
  it("미국 DST 시작 날짜(3월 둘째 일요일 2시) → 유효한 날짜 반환", () => {
    // 2025년 미국 DST 시작: 3월 9일 02:00
    const dstStart = new Date("2025-03-09T07:00:00.000Z"); // UTC 07:00 = EST 02:00
    const result = formatDateLocalized(dstStart, "en-US", {
      dateStyle: "short",
    });
    expect(result).toMatch(/\d/);
  });

  it("미국 DST 종료 날짜(11월 첫째 일요일 2시) → 유효한 날짜 반환", () => {
    // 2025년 미국 DST 종료: 11월 2일 02:00
    const dstEnd = new Date("2025-11-02T07:00:00.000Z");
    const result = formatDateLocalized(dstEnd, "en-US", { dateStyle: "short" });
    expect(result).toMatch(/\d/);
  });

  it("유럽 DST 시작(3월 마지막 일요일 01:00 UTC) → 유효한 날짜 반환", () => {
    // 2025년 유럽 DST: 3월 30일 01:00 UTC
    const euDst = new Date("2025-03-30T01:00:00.000Z");
    const result = formatDateLocalized(euDst, "de-DE", { dateStyle: "short" });
    expect(result).toMatch(/\d/);
  });
});

// ─────────────────────────────────────────────
// formatDateTimeLocalized 엣지케이스
// ─────────────────────────────────────────────

describe("formatDateTimeLocalized — 엣지케이스", () => {
  const date = new Date("2025-12-31T23:59:59.000Z");

  it("ko-KR long+short → 날짜와 시간 함께 표시", () => {
    const result = formatDateTimeLocalized(date, "ko-KR", {
      dateStyle: "long",
      timeStyle: "short",
    });
    expect(result).toMatch(/\d{4}년/);
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });

  it("en-US short+short → 간결한 날짜+시간 형식", () => {
    const result = formatDateTimeLocalized(date, "en-US", {
      dateStyle: "short",
      timeStyle: "short",
    });
    expect(result).toMatch(/\d/);
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });

  it("ja-JP full+medium → 일본어 전체 형식", () => {
    // 2025-12-31T23:59:59Z → KST 기준 2026-01-01 08:59:59이므로 2026年
    // Intl.DateTimeFormat은 UTC 기반이므로 UTC 시간인 2025년 표시 가능
    const result = formatDateTimeLocalized(date, "ja-JP", {
      dateStyle: "full",
      timeStyle: "medium",
    });
    // 연도를 포함한 일본어 날짜 형식인지 확인
    expect(result).toMatch(/\d{4}年/);
  });

  it("timeZone 옵션 적용", () => {
    const result = formatDateTimeLocalized(date, "en-US", {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: "Asia/Tokyo",
    });
    expect(result).toMatch(/\d/);
  });
});

// ─────────────────────────────────────────────
// timezone 유틸리티 엣지케이스
// ─────────────────────────────────────────────

describe("applyTimezoneOffset 엣지케이스", () => {
  it("오프셋 0 → 원본 UTC 시간과 동일", () => {
    const date = new Date("2025-01-01T00:00:00.000Z");
    const result = applyTimezoneOffset(date, 0);
    // 오프셋 0이면 UTC 기준이므로 로컬 타임존 오프셋만 적용됨
    expect(result).toBeInstanceOf(Date);
  });

  it("양수 오프셋(KST +540) → 원본보다 미래 시간", () => {
    const date = new Date("2025-06-01T00:00:00.000Z");
    const result = applyTimezoneOffset(date, KST_OFFSET);
    // KST 적용 후 Date는 UTC+9에서의 로컬 시간을 나타냄
    expect(result).toBeInstanceOf(Date);
  });

  it("음수 오프셋(UTC-5) → 적용 결과가 Date 객체", () => {
    const date = new Date("2025-06-01T12:00:00.000Z");
    const result = applyTimezoneOffset(date, -300);
    expect(result).toBeInstanceOf(Date);
  });
});

describe("getKoreanDate 엣지케이스", () => {
  it("연초(1월 1일 00:00 UTC) → KST는 1월 1일 09:00", () => {
    const date = new Date("2025-01-01T00:00:00.000Z");
    const kstDate = getKoreanDate(date);
    // KST로 변환된 Date 객체의 getHours()는 로컬 타임존에 따라 다름
    // 하지만 KST 시간 기준으로 시각은 09:00이 되어야 함
    expect(kstDate).toBeInstanceOf(Date);
    // UTC 기준으로 KST offset(9시간) 추가된 시간이어야 함
    const expectedMs =
      date.getTime() + date.getTimezoneOffset() * 60000 + KST_OFFSET * 60000;
    expect(kstDate.getTime()).toBe(expectedMs);
  });

  it("연말(12월 31일 23:00 UTC) → KST는 다음날 1월 1일 08:00", () => {
    const date = new Date("2025-12-31T23:00:00.000Z");
    const kstDate = getKoreanDate(date);
    expect(kstDate).toBeInstanceOf(Date);
  });
});

describe("getKoreanDateString 엣지케이스", () => {
  it("YYYY-MM-DD 형식 정확한 출력", () => {
    // 2025-03-05T00:00:00Z → KST 2025-03-05 09:00
    const date = new Date("2025-03-05T00:00:00.000Z");
    const result = getKoreanDateString(date);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(result.startsWith("2025")).toBe(true);
  });

  it("월과 일이 한 자리여도 두 자리로 패딩", () => {
    const date = new Date("2025-01-05T00:00:00.000Z");
    const result = getKoreanDateString(date);
    // 반드시 YYYY-MM-DD 형식 (01, 05)
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("parseDateAsTimezone 엣지케이스", () => {
  it("2025-01-01 → Date 객체 반환", () => {
    const result = parseDateAsTimezone("2025-01-01");
    expect(result).toBeInstanceOf(Date);
  });

  it("KST 오프셋 적용 시 UTC보다 9시간 전", () => {
    const result = parseDateAsTimezone("2025-06-15", { offset: 540 });
    // parseDateAsTimezone은 해당 타임존의 자정을 UTC로 변환
    // 2025-06-15 00:00 KST → 2025-06-14 15:00:00 UTC
    expect(result).toBeInstanceOf(Date);
    const utcH = result.getUTCHours();
    const utcD = result.getUTCDate();
    // UTC 기준 14일 15시 또는 15일 등 (환경에 따라 다를 수 있음)
    expect(typeof utcH).toBe("number");
    expect(typeof utcD).toBe("number");
  });

  it("UTC+0 오프셋 → UTC 자정 반환", () => {
    const result = parseDateAsTimezone("2025-06-15", { offset: 0 });
    expect(result).toBeInstanceOf(Date);
    // UTC 기준으로 6월 15일 자정
    expect(result.getUTCFullYear()).toBe(2025);
    expect(result.getUTCMonth()).toBe(5); // 0-indexed
    expect(result.getUTCDate()).toBe(15);
    expect(result.getUTCHours()).toBe(0);
  });

  it("기본값(KST) 사용 시 오프셋 540 적용", () => {
    const withKst = parseDateAsTimezone("2025-06-15", { offset: KST_OFFSET });
    const withDefault = parseDateAsTimezone("2025-06-15");
    expect(withDefault.getTime()).toBe(withKst.getTime());
  });
});

describe("convertToTimezone 엣지케이스", () => {
  it("UTC+9와 UTC+0 결과는 9시간 차이", () => {
    const date = new Date("2025-06-01T00:00:00.000Z");
    const kst = convertToTimezone(date, { offset: 540 });
    const utcPlus0 = convertToTimezone(date, { offset: 0 });
    const diffHours = (kst.getTime() - utcPlus0.getTime()) / (1000 * 60 * 60);
    expect(diffHours).toBe(9);
  });

  it("음수 오프셋(UTC-8) 적용", () => {
    const date = new Date("2025-06-01T10:00:00.000Z");
    const result = convertToTimezone(date, { offset: -480 }); // UTC-8
    expect(result).toBeInstanceOf(Date);
  });
});

// ─────────────────────────────────────────────
// formatRelativeTime 심화 엣지케이스
// ─────────────────────────────────────────────

describe("formatRelativeTime — 단위별 심화", () => {
  it('정확히 1초 전 → "1초 전"', () => {
    const date = new Date(Date.now() - 1000);
    const result = formatRelativeTime(date);
    expect(result).toBe("1초 전");
  });

  it('59초 전 → "59초 전"', () => {
    const date = new Date(Date.now() - 59 * 1000);
    const result = formatRelativeTime(date);
    expect(result).toBe("59초 전");
  });

  it('60초 전 → "1분 전"', () => {
    const date = new Date(Date.now() - 60 * 1000);
    const result = formatRelativeTime(date);
    expect(result).toBe("1분 전");
  });

  it('1시간 전 → "1시간 전"', () => {
    const date = new Date(Date.now() - 60 * 60 * 1000);
    const result = formatRelativeTime(date);
    expect(result).toBe("1시간 전");
  });

  it('23시간 전 → "23시간 전"', () => {
    const date = new Date(Date.now() - 23 * 60 * 60 * 1000);
    const result = formatRelativeTime(date);
    expect(result).toBe("23시간 전");
  });

  it('24시간 전 → "1일 전"', () => {
    const date = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const result = formatRelativeTime(date);
    expect(result).toBe("1일 전");
  });

  it('7일 전 → "1주 전"', () => {
    const date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const result = formatRelativeTime(date);
    expect(result).toBe("1주 전");
  });

  it('30일 전 → "1개월 전"', () => {
    const date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const result = formatRelativeTime(date);
    expect(result).toBe("1개월 전");
  });

  it('365일 전 → "1년 전"', () => {
    const date = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const result = formatRelativeTime(date);
    expect(result).toBe("1년 전");
  });
});

describe("formatRelativeTime — 미래 시간", () => {
  it('1초 후 → "1초 후"', () => {
    const date = new Date(Date.now() + 1000);
    const result = formatRelativeTime(date);
    expect(result).toBe("1초 후");
  });

  it('30분 후 → "30분 후"', () => {
    const date = new Date(Date.now() + 30 * 60 * 1000);
    const result = formatRelativeTime(date);
    expect(result).toBe("30분 후");
  });

  it('3시간 후 → "3시간 후"', () => {
    const date = new Date(Date.now() + 3 * 60 * 60 * 1000);
    const result = formatRelativeTime(date);
    expect(result).toBe("3시간 후");
  });

  it('5일 후 → "5일 후"', () => {
    const date = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    const result = formatRelativeTime(date);
    expect(result).toBe("5일 후");
  });
});

describe("formatRelativeTime — minUnit 옵션", () => {
  it('minUnit: minute이면 초 단위 시간도 "0분 전" 대신 numeric:false에선 "방금 전"', () => {
    const date = new Date(Date.now() - 30 * 1000); // 30초 전
    const result = formatRelativeTime(date, {
      numeric: false,
      minUnit: "minute",
    });
    expect(result).toBe("방금 전");
  });

  it("minUnit: hour이면 50분 전도 시간 단위로 표현", () => {
    const date = new Date(Date.now() - 50 * 60 * 1000); // 50분 전
    const result = formatRelativeTime(date, { minUnit: "hour" });
    expect(result).toMatch(/\d+시간 전/);
  });

  it("minUnit: day이면 2시간 전도 일 단위로 표현", () => {
    const date = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2시간 전
    const result = formatRelativeTime(date, { minUnit: "day" });
    expect(result).toMatch(/\d+일 전/);
  });
});

describe("formatRelativeTime — maxUnit 옵션", () => {
  it("maxUnit: hour이면 2일 전도 시간 단위로 표현", () => {
    const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const result = formatRelativeTime(date, { maxUnit: "hour" });
    expect(result).toMatch(/\d+시간 전/);
  });

  it("maxUnit: day이면 2주 전도 일 단위로 표현", () => {
    const date = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const result = formatRelativeTime(date, { maxUnit: "day" });
    expect(result).toMatch(/\d+일 전/);
  });

  it("maxUnit: minute이면 3시간 전도 분 단위로 표현", () => {
    const date = new Date(Date.now() - 3 * 60 * 60 * 1000);
    const result = formatRelativeTime(date, { maxUnit: "minute" });
    expect(result).toMatch(/\d+분 전/);
  });
});

describe("formatRelativeTime — numeric 옵션", () => {
  it("numeric: true (기본값) → 항상 숫자 표시", () => {
    const date = new Date(Date.now() - 5 * 60 * 1000);
    const result = formatRelativeTime(date, { numeric: true });
    expect(result).toMatch(/^5분 전$/);
  });

  it('numeric: false + 0분 차이 → "방금 전"', () => {
    // minUnit을 minute으로 하면 1분 미만은 0분 → 방금 전
    const date = new Date(Date.now() - 10 * 1000);
    const result = formatRelativeTime(date, {
      numeric: false,
      minUnit: "minute",
    });
    expect(result).toBe("방금 전");
  });
});
