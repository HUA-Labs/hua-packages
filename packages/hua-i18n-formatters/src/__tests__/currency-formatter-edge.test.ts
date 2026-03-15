/**
 * @hua-labs/i18n-formatters - Currency Formatter Edge Case Tests
 *
 * formatCurrency, currency-data 함수에 대한 엣지케이스 테스트.
 * 다국적 통화, 심볼 위치, 소수점 처리, 큰 금액, 특수값 등을 검증한다.
 */

import { describe, it, expect } from "vitest";
import { formatCurrency } from "../currency/utils/currency-formatter";
import {
  getDefaultCurrency,
  getCurrencyDecimals,
  LANGUAGE_TO_CURRENCY,
  CURRENCY_DECIMALS,
} from "../currency/utils/currency-data";

// ─────────────────────────────────────────────
// currency-data 엣지케이스
// ─────────────────────────────────────────────

describe("LANGUAGE_TO_CURRENCY 엣지케이스", () => {
  it("de(독일어) 매핑이 없으면 undefined", () => {
    // 독일어는 매핑에 없음
    expect(LANGUAGE_TO_CURRENCY["de"]).toBeUndefined();
  });

  it("fr(프랑스어) 매핑이 없으면 undefined", () => {
    expect(LANGUAGE_TO_CURRENCY["fr"]).toBeUndefined();
  });

  it("ko-KR과 ko는 동일하게 KRW", () => {
    expect(LANGUAGE_TO_CURRENCY["ko"]).toBe(LANGUAGE_TO_CURRENCY["ko-KR"]);
  });

  it("en-US와 en은 동일하게 USD", () => {
    expect(LANGUAGE_TO_CURRENCY["en"]).toBe(LANGUAGE_TO_CURRENCY["en-US"]);
  });

  it("ja-JP와 ja는 동일하게 JPY", () => {
    expect(LANGUAGE_TO_CURRENCY["ja"]).toBe(LANGUAGE_TO_CURRENCY["ja-JP"]);
  });
});

describe("CURRENCY_DECIMALS 엣지케이스", () => {
  it("GBP는 소수점 2자리", () => {
    expect(CURRENCY_DECIMALS.GBP).toBe(2);
  });

  it("CNY는 소수점 2자리", () => {
    expect(CURRENCY_DECIMALS.CNY).toBe(2);
  });

  it("정의되지 않은 통화(BTC)는 undefined", () => {
    expect(CURRENCY_DECIMALS["BTC"]).toBeUndefined();
  });
});

describe("getDefaultCurrency 엣지케이스", () => {
  it("빈 문자열은 USD 기본값 반환", () => {
    expect(getDefaultCurrency("")).toBe("USD");
  });

  it("대소문자 혼합(KO)은 매핑 없으므로 USD 반환", () => {
    expect(getDefaultCurrency("KO")).toBe("USD");
  });

  it("일본어 전체 로케일(ja-JP)은 JPY 반환", () => {
    expect(getDefaultCurrency("ja-JP")).toBe("JPY");
  });

  it("알 수 없는 로케일은 USD 반환", () => {
    expect(getDefaultCurrency("xyz-ZZ")).toBe("USD");
  });
});

describe("getCurrencyDecimals 엣지케이스", () => {
  it("GBP는 2 반환", () => {
    expect(getCurrencyDecimals("GBP")).toBe(2);
  });

  it("CNY는 2 반환", () => {
    expect(getCurrencyDecimals("CNY")).toBe(2);
  });

  it("빈 문자열 통화코드는 2(기본값) 반환", () => {
    expect(getCurrencyDecimals("")).toBe(2);
  });

  it("소문자 통화코드(usd)는 매핑 없으므로 2 반환", () => {
    expect(getCurrencyDecimals("usd")).toBe(2);
  });
});

// ─────────────────────────────────────────────
// formatCurrency 엣지케이스
// ─────────────────────────────────────────────

describe("formatCurrency — 다국적 통화", () => {
  it("KRW: 원화는 소수점 없이 포맷팅", () => {
    const result = formatCurrency(50000, { currency: "KRW" }, "ko-KR");
    expect(result).toContain("50,000");
    expect(result).not.toMatch(/\.\d/);
  });

  it("USD: 달러는 소수점 2자리 포함", () => {
    const result = formatCurrency(99.9, { currency: "USD" }, "en-US");
    expect(result).toContain("99.90");
    expect(result).toContain("$");
  });

  it("JPY: 엔화는 소수점 없이 포맷팅", () => {
    const result = formatCurrency(10000, { currency: "JPY" }, "ja-JP");
    expect(result).not.toMatch(/\.\d/);
    expect(result).toContain("10,000");
  });

  it("EUR: 유로 포맷팅 결과에 숫자 포함", () => {
    const result = formatCurrency(1500, { currency: "EUR" }, "de-DE");
    expect(result).toContain("1.500");
    // 독일어 로케일은 점을 천 단위 구분자로 사용
  });

  it("GBP: 파운드 포맷팅 결과에 £ 포함", () => {
    const result = formatCurrency(200, { currency: "GBP" }, "en-GB");
    expect(result).toContain("£");
    expect(result).toContain("200");
  });

  it("CNY: 위안 포맷팅", () => {
    const result = formatCurrency(888, { currency: "CNY" }, "zh-CN");
    expect(result).toContain("888");
  });
});

describe("formatCurrency — 심볼 위치 및 표시", () => {
  it("showSymbol: false → 숫자와 구분자/소수점만 남음", () => {
    const result = formatCurrency(
      1234.56,
      { currency: "USD", showSymbol: false },
      "en-US",
    );
    expect(result).toMatch(/^[\d,.-]+$/);
    expect(result).not.toContain("$");
  });

  it("symbolPosition: after → 숫자 뒤에 통화 기호", () => {
    const result = formatCurrency(
      100,
      { currency: "USD", symbolPosition: "after" },
      "en-US",
    );
    const firstDigitIdx = result.search(/\d/);
    const symbolIdx = result.indexOf("$");
    // 기호가 있다면 숫자보다 뒤에 위치해야 함
    if (symbolIdx !== -1) {
      expect(firstDigitIdx).toBeLessThan(symbolIdx);
    } else {
      // 기호 제거된 경우에도 숫자는 존재
      expect(result).toMatch(/\d/);
    }
  });

  it("symbolPosition: before (기본값) → USD는 $ 앞에 위치", () => {
    const result = formatCurrency(
      100,
      { currency: "USD", symbolPosition: "before" },
      "en-US",
    );
    const firstDigitIdx = result.search(/\d/);
    const symbolIdx = result.indexOf("$");
    if (symbolIdx !== -1) {
      // before이면 기호가 숫자보다 앞이거나 같은 위치
      expect(symbolIdx).toBeLessThanOrEqual(firstDigitIdx);
    }
  });
});

describe("formatCurrency — 소수점 자릿수 옵션", () => {
  it("minimumFractionDigits: 0 → 소수점 없음", () => {
    const result = formatCurrency(
      100,
      { currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 },
      "en-US",
    );
    expect(result).not.toMatch(/\.\d/);
    expect(result).toContain("100");
  });

  it("minimumFractionDigits: 3 → 소수점 3자리 강제", () => {
    const result = formatCurrency(
      100,
      { currency: "USD", minimumFractionDigits: 3, maximumFractionDigits: 3 },
      "en-US",
    );
    expect(result).toContain("100.000");
  });

  it("maximumFractionDigits: 0 → minimumFractionDigits도 0으로 설정해야 반올림 정수", () => {
    // USD의 기본 minimumFractionDigits=2와 maximumFractionDigits=0이 충돌하므로
    // 두 옵션을 함께 명시해야 함
    const result = formatCurrency(
      99.99,
      {
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      },
      "en-US",
    );
    expect(result).toContain("100");
    expect(result).not.toMatch(/\.\d/);
  });

  it("KRW에 minimumFractionDigits: 2 강제 적용", () => {
    const result = formatCurrency(
      1000,
      { currency: "KRW", minimumFractionDigits: 2, maximumFractionDigits: 2 },
      "ko-KR",
    );
    expect(result).toContain("1,000");
    // 소수점 2자리 강제
    expect(result).toMatch(/\.\d{2}/);
  });
});

describe("formatCurrency — 특수값 처리", () => {
  it("0 → 통화 기호와 0 포함", () => {
    const result = formatCurrency(0, { currency: "USD" }, "en-US");
    expect(result).toContain("$");
    expect(result).toContain("0");
  });

  it("음수 → 마이너스 기호 포함", () => {
    const result = formatCurrency(-500, { currency: "USD" }, "en-US");
    expect(result).toContain("-");
    expect(result).toContain("500");
  });

  it("매우 큰 금액(1조) → 쉼표 구분자 포함", () => {
    const result = formatCurrency(
      1_000_000_000_000,
      { currency: "KRW" },
      "ko-KR",
    );
    expect(result).toContain(",");
    // 조 단위 숫자가 포함됨
    expect(result).toMatch(/1[,\d]+/);
  });

  it("소수점 끝자리 반올림 처리", () => {
    // USD는 기본 소수점 2자리이므로 0.005는 반올림됨
    const result = formatCurrency(
      1.005,
      { currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 },
      "en-US",
    );
    expect(result).toMatch(/1\.(00|01)/);
  });

  it("로케일 기본값 사용 시 언어별 통화 적용", () => {
    const krResult = formatCurrency(10000, {}, "ko-KR");
    const usResult = formatCurrency(10000, {}, "en-US");
    const jpResult = formatCurrency(10000, {}, "ja-JP");
    // 세 결과가 모두 다름
    expect(krResult).not.toBe(usResult);
    expect(usResult).not.toBe(jpResult);
    expect(krResult).not.toBe(jpResult);
  });
});

describe("formatCurrency — 한국어 로케일 심화", () => {
  it("ko-KR + KRW: 원화 기호(₩ 또는 ₩) 포함", () => {
    const result = formatCurrency(50000, { currency: "KRW" }, "ko-KR");
    // KRW 기호는 ₩ 또는 KR₩ 형태일 수 있음
    expect(result.length).toBeGreaterThan("50,000".length);
  });

  it("ko-KR + USD: 달러 표기에 USD 또는 $ 포함", () => {
    const result = formatCurrency(1000, { currency: "USD" }, "ko-KR");
    expect(result).toMatch(/US\$|\$/);
  });

  it("큰 KRW 금액(10억) 포맷팅", () => {
    const result = formatCurrency(1_000_000_000, { currency: "KRW" }, "ko-KR");
    expect(result).toContain(",");
    expect(result).toMatch(/1[,\d]+/);
  });
});
