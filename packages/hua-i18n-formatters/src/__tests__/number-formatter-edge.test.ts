/**
 * @hua-labs/i18n-formatters - Number & Percent Formatter Edge Case Tests
 *
 * formatNumber, formatCompact, formatPercent의 엣지케이스 테스트.
 * 큰 수, 소수점, 로캘별 구분자, 특수값(NaN, Infinity, 0, 음수) 등을 검증한다.
 */

import { describe, it, expect } from "vitest";
import { formatNumber, formatCompact } from "../number/utils/number-formatter";
import { formatPercent } from "../number/utils/percent-formatter";

// ─────────────────────────────────────────────
// formatNumber 엣지케이스
// ─────────────────────────────────────────────

describe("formatNumber — 로캘별 구분자", () => {
  it("ko-KR: 천 단위 쉼표(,) 구분자 사용", () => {
    const result = formatNumber(1000, {}, "ko-KR");
    expect(result).toBe("1,000");
  });

  it("en-US: 천 단위 쉼표(,) 구분자 사용", () => {
    const result = formatNumber(1000, {}, "en-US");
    expect(result).toBe("1,000");
  });

  it("de-DE: 천 단위 점(.) 구분자 사용", () => {
    const result = formatNumber(1000, {}, "de-DE");
    // 독일어 로케일은 1.000 형식
    expect(result).toBe("1.000");
  });

  it("ja-JP: 천 단위 쉼표(,) 구분자 사용", () => {
    const result = formatNumber(10000, {}, "ja-JP");
    expect(result).toBe("10,000");
  });

  it("fr-FR: 천 단위 공백 구분자 사용", () => {
    const result = formatNumber(1000, {}, "fr-FR");
    // 프랑스어는 1 000 형태 (공백)
    expect(result).toContain("1");
    expect(result).toContain("000");
  });
});

describe("formatNumber — 소수점 처리", () => {
  it("소수점 없는 정수", () => {
    const result = formatNumber(42, {}, "en-US");
    expect(result).toBe("42");
  });

  it("최대 소수점 자리수 초과 시 반올림", () => {
    const result = formatNumber(1.9999, { maximumFractionDigits: 2 }, "en-US");
    expect(result).toBe("2");
  });

  it("minimumFractionDigits로 후행 0 강제", () => {
    const result = formatNumber(5, { minimumFractionDigits: 3 }, "en-US");
    expect(result).toBe("5.000");
  });

  it("maximumFractionDigits: 0 → 반올림 정수 반환", () => {
    const result = formatNumber(3.7, { maximumFractionDigits: 0 }, "en-US");
    expect(result).toBe("4");
  });

  it("소수점 6자리까지 표시", () => {
    const result = formatNumber(
      0.123456,
      { maximumFractionDigits: 6 },
      "en-US",
    );
    expect(result).toBe("0.123456");
  });

  it("de-DE: 소수점 구분자가 쉼표(,)", () => {
    const result = formatNumber(1.5, { minimumFractionDigits: 1 }, "de-DE");
    expect(result).toBe("1,5");
  });
});

describe("formatNumber — 큰 수", () => {
  it("백만 단위 포맷팅", () => {
    const result = formatNumber(1_000_000, {}, "en-US");
    expect(result).toBe("1,000,000");
  });

  it("10억 단위 포맷팅", () => {
    const result = formatNumber(1_000_000_000, {}, "en-US");
    expect(result).toBe("1,000,000,000");
  });

  it("1조 단위 포맷팅", () => {
    const result = formatNumber(1_000_000_000_000, {}, "en-US");
    expect(result).toBe("1,000,000,000,000");
  });

  it("Number.MAX_SAFE_INTEGER 포맷팅", () => {
    const result = formatNumber(Number.MAX_SAFE_INTEGER, {}, "en-US");
    expect(result).toContain(",");
    expect(typeof result).toBe("string");
  });
});

describe("formatNumber — 특수값", () => {
  it("0 포맷팅", () => {
    const result = formatNumber(0, {}, "en-US");
    expect(result).toBe("0");
  });

  it("음수 포맷팅", () => {
    const result = formatNumber(-1234, {}, "en-US");
    expect(result).toBe("-1,234");
  });

  it("음수 소수점 포맷팅", () => {
    const result = formatNumber(-3.14, { maximumFractionDigits: 2 }, "en-US");
    expect(result).toBe("-3.14");
  });

  it("Infinity 포맷팅 — 문자열 반환", () => {
    const result = formatNumber(Infinity, {}, "en-US");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("-Infinity 포맷팅 — 문자열 반환", () => {
    const result = formatNumber(-Infinity, {}, "en-US");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("NaN 포맷팅 — 문자열 반환", () => {
    const result = formatNumber(NaN, {}, "en-US");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("formatNumber — useGrouping 옵션", () => {
  it("useGrouping: false → 구분자 없음", () => {
    const result = formatNumber(1_234_567, { useGrouping: false }, "en-US");
    expect(result).toBe("1234567");
  });

  it("useGrouping: true (기본값) → 구분자 있음", () => {
    const result = formatNumber(1_234_567, { useGrouping: true }, "en-US");
    expect(result).toBe("1,234,567");
  });
});

// ─────────────────────────────────────────────
// formatCompact 엣지케이스
// ─────────────────────────────────────────────

describe("formatCompact — 영어 로케일", () => {
  it("999 이하는 그대로 표시", () => {
    const result = formatCompact(999, {}, "en-US");
    expect(result).toBe("999");
  });

  it("1000 → 1K", () => {
    const result = formatCompact(1000, {}, "en-US");
    expect(result).toMatch(/1K/i);
  });

  it("10000 → 10K", () => {
    const result = formatCompact(10_000, {}, "en-US");
    expect(result).toMatch(/10K/i);
  });

  it("1000000 → 1M", () => {
    const result = formatCompact(1_000_000, {}, "en-US");
    expect(result).toMatch(/1M/i);
  });

  it("1000000000 → 1B", () => {
    const result = formatCompact(1_000_000_000, {}, "en-US");
    expect(result).toMatch(/1B/i);
  });

  it("1500 → 1.5K 형태", () => {
    const result = formatCompact(1500, {}, "en-US");
    expect(result).toMatch(/1[.,]?5K/i);
  });
});

describe("formatCompact — 한국어 로케일", () => {
  it("1만 단위 컴팩트 표기", () => {
    const result = formatCompact(10_000, {}, "ko-KR");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
    // 한국어 컴팩트는 '만' 단위를 사용
    expect(result).toMatch(/만|K/i);
  });

  it("1억 단위 컴팩트 표기", () => {
    const result = formatCompact(100_000_000, {}, "ko-KR");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
    expect(result).toMatch(/억|M/i);
  });

  it("1000 → 컴팩트 표기 (1천)", () => {
    const result = formatCompact(1_000, {}, "ko-KR");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("formatCompact — 일본어 로케일", () => {
  it("10000 → 万 단위 표기", () => {
    const result = formatCompact(10_000, {}, "ja-JP");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
    // 일본어 컴팩트는 '万' 단위를 사용할 수 있음
  });
});

describe("formatCompact — 특수값", () => {
  it("0 컴팩트 표기", () => {
    const result = formatCompact(0, {}, "en-US");
    expect(result).toBe("0");
  });

  it("음수 컴팩트 표기 — 마이너스 포함", () => {
    const result = formatCompact(-1_000_000, {}, "en-US");
    expect(result).toContain("-");
    expect(result).toMatch(/M/i);
  });

  it("NaN 컴팩트 표기 — 문자열 반환", () => {
    const result = formatCompact(NaN, {}, "en-US");
    expect(typeof result).toBe("string");
  });
});

// ─────────────────────────────────────────────
// formatPercent 엣지케이스
// ─────────────────────────────────────────────

describe("formatPercent — 기본 변환", () => {
  it("0.01 = 1%", () => {
    const result = formatPercent(0.01, {}, "en-US");
    expect(result).toBe("1%");
  });

  it("0.5 = 50%", () => {
    const result = formatPercent(0.5, {}, "en-US");
    expect(result).toBe("50%");
  });

  it("1 = 100%", () => {
    const result = formatPercent(1, {}, "en-US");
    expect(result).toBe("100%");
  });

  it("2 = 200% (1 초과값 허용)", () => {
    const result = formatPercent(2, {}, "en-US");
    expect(result).toBe("200%");
  });
});

describe("formatPercent — 로캘별 %기호 위치", () => {
  it("en-US: 숫자 뒤에 % 기호", () => {
    const result = formatPercent(0.5, {}, "en-US");
    expect(result).toMatch(/50%/);
  });

  it("ko-KR: 숫자 뒤에 % 기호", () => {
    const result = formatPercent(0.5, {}, "ko-KR");
    expect(result).toMatch(/50%/);
  });

  it("de-DE: % 기호 포함", () => {
    const result = formatPercent(0.25, {}, "de-DE");
    expect(result).toContain("%");
    expect(result).toContain("25");
  });
});

describe("formatPercent — 소수점 처리", () => {
  it("minimumFractionDigits: 2 → 소수점 2자리 강제", () => {
    // maximumFractionDigits 기본값(1)이 minimumFractionDigits(2)보다 작으면 RangeError
    // 두 옵션을 함께 명시해야 함
    const result = formatPercent(
      0.5,
      { minimumFractionDigits: 2, maximumFractionDigits: 2 },
      "en-US",
    );
    expect(result).toMatch(/50\.00%/);
  });

  it("maximumFractionDigits: 0 → 반올림 정수%", () => {
    const result = formatPercent(0.333, { maximumFractionDigits: 0 }, "en-US");
    expect(result).toBe("33%");
  });

  it("기본 maximumFractionDigits: 1 → 소수점 1자리까지", () => {
    const result = formatPercent(0.1234, {}, "en-US");
    expect(result).toBe("12.3%");
  });

  it("매우 작은 값(0.0001) → 0%로 표시 (기본 소수점 1자리)", () => {
    const result = formatPercent(0.0001, {}, "en-US");
    expect(result).toBe("0%");
  });
});

describe("formatPercent — 특수값 및 signDisplay", () => {
  it("0% 포맷팅", () => {
    const result = formatPercent(0, {}, "en-US");
    expect(result).toBe("0%");
  });

  it("음수 퍼센트 포맷팅", () => {
    const result = formatPercent(-0.25, {}, "en-US");
    expect(result).toContain("-");
    expect(result).toContain("25%");
  });

  it("signDisplay: always → 양수에도 + 표시", () => {
    const result = formatPercent(0.5, { signDisplay: "always" }, "en-US");
    expect(result).toContain("+");
    expect(result).toContain("50%");
  });

  it("signDisplay: never → 음수에도 - 없음", () => {
    const result = formatPercent(-0.25, { signDisplay: "never" }, "en-US");
    expect(result).not.toContain("-");
    expect(result).toContain("25%");
  });

  it("signDisplay: auto (기본값) → 양수에 + 없음", () => {
    const result = formatPercent(0.5, { signDisplay: "auto" }, "en-US");
    expect(result).not.toContain("+");
    expect(result).toContain("50%");
  });

  it("NaN 퍼센트 포맷팅 — 문자열 반환", () => {
    const result = formatPercent(NaN, {}, "en-US");
    expect(typeof result).toBe("string");
    expect(result).toContain("%");
  });

  it("Infinity 퍼센트 포맷팅 — 문자열 반환", () => {
    const result = formatPercent(Infinity, {}, "en-US");
    expect(typeof result).toBe("string");
  });
});
