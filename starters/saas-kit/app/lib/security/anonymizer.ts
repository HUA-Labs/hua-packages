/**
 * Personal information anonymization utility
 *
 * Anonymizes personally identifiable information during text analysis.
 */

/**
 * Detect Korean name patterns (2-4 Korean characters)
 */
function anonymizeKoreanNames(text: string): string {
  // Common words that should not be mistaken for names
  const commonWords = new Set([
    "오늘",
    "어제",
    "내일",
    "지금",
    "이제",
    "그때",
    "언제",
    "항상",
    "가끔",
    "매일",
    "아침",
    "점심",
    "저녁",
    "새벽",
    "낮",
    "밤",
    "오전",
    "오후",
    "월요일",
    "화요일",
    "수요일",
    "목요일",
    "금요일",
    "토요일",
    "일요일",
    "집",
    "회사",
    "학교",
    "카페",
    "식당",
    "병원",
    "공원",
    "마트",
    "서점",
    "도서관",
    "엄마",
    "아빠",
    "부모",
    "가족",
    "친구",
    "선배",
    "후배",
    "동료",
    "상사",
    "언니",
    "오빠",
    "누나",
    "형",
    "마음",
    "생각",
    "기분",
    "감정",
    "느낌",
    "기억",
    "추억",
    "시간",
    "사람",
    "세상",
    "나라",
    "그런데",
    "그래서",
    "그리고",
    "하지만",
    "그러나",
    "그래도",
    "그냥",
    "진짜",
    "정말",
    "너무",
    "아무것",
    "아무도",
    "누구",
    "무엇",
    "어디",
    "여기",
    "거기",
    "저기",
    "하나",
    "둘",
    "셋",
    "넷",
    "다섯",
    "여섯",
    "일곱",
    "여덟",
    "아홉",
    "열",
    "조금",
    "많이",
    "빨리",
    "천천히",
    "갑자기",
    "드디어",
    "아직",
    "이미",
    "별로",
    "꽤",
    "모든",
    "어떤",
    "같은",
    "다른",
    "이런",
    "저런",
    "그런",
    "사실",
    "결국",
    "아마",
    "확실",
    "분명",
    "물론",
    "대신",
    "때문",
    "요즘",
    "최근",
    "나중",
    "곧",
    "바로",
    "금방",
    "잠시",
    "잠깐",
    "기쁨",
    "슬픔",
    "분노",
    "불안",
    "걱정",
    "두려움",
    "즐거움",
    "행복",
    "고통",
    "일기",
    "오프라인",
    "임시저장",
    "온라인",
    "메시지",
    "알림",
    "커피",
    "음악",
    "영화",
    "드라마",
    "게임",
    "노래",
    "여행",
    "운동",
    "산책",
    "비가",
    "눈이",
    "바람",
    "날씨",
    "구름",
    "하늘",
    "태양",
    "아무리",
    "결국은",
    "그러면",
    "그럼",
    "그러니까",
  ]);

  // 1. Korean name patterns with particles (2-5 chars)
  const nameWithParticle =
    /([가-힣]{2,5})(이|가|을|를|은|는|과|와|도|만|에게|한테|께|의|이랑|랑|님|씨|아|야|이야|이가|이를|이는|이와|이도)/g;

  let anonymized = text.replace(nameWithParticle, (match, name, particle) => {
    if (commonWords.has(name)) return match;
    return `[익명]${particle}`;
  });

  // 2. Detect by title patterns ("OO이/가 말했다", "OO한테", "OO이랑" handled above)
  // "OO(이)라는", "OO(이)라고" patterns
  const quotedName = /([가-힣]{2,5})(이라는|라는|이라고|라고|이라면|라면)/g;
  anonymized = anonymized.replace(quotedName, (match, name, suffix) => {
    if (commonWords.has(name)) return match;
    return `[익명]${suffix}`;
  });

  return anonymized;
}

/**
 * Detect English name patterns
 */
function anonymizeEnglishNames(text: string): string {
  // English names starting with a capital letter, 2+ chars
  const englishNamePattern = /\b([A-Z][a-z]+)\b/g;

  const anonymized = text.replace(englishNamePattern, (match) => {
    // Exclude common English words
    const commonWords = [
      "Today",
      "Tomorrow",
      "Yesterday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
      "Morning",
      "Afternoon",
      "Evening",
      "Night",
      "Weekend",
      "Holiday",
      "Vacation",
      "Work",
      "Home",
      "Office",
    ];

    if (commonWords.includes(match)) {
      return match;
    }

    return "[Anonymous]";
  });

  return anonymized;
}

/**
 * Anonymize phone numbers
 */
function anonymizePhoneNumbers(text: string): string {
  const phonePattern = /\d{2,3}[-\s]?\d{3,4}[-\s]?\d{4}/g;
  return text.replace(phonePattern, "[전화번호]");
}

/**
 * Anonymize email addresses
 */
function anonymizeEmails(text: string): string {
  const emailPattern = /[\w.-]+@[\w.-]+\.\w+/g;
  return text.replace(emailPattern, "[이메일]");
}

/**
 * Anonymize addresses (simple pattern)
 */
function anonymizeAddresses(text: string): string {
  // "OO시 OO구 OO동" pattern
  const addressPattern = /[가-힣]+시\s+[가-힣]+구\s+[가-힣]+(동|로|길)/g;
  return text.replace(addressPattern, "[주소]");
}

/**
 * Comprehensive anonymization function
 */
export function anonymizePersonalInfo(text: string): string {
  let anonymized = text;

  // 1. Anonymize phone numbers
  anonymized = anonymizePhoneNumbers(anonymized);

  // 2. Anonymize emails
  anonymized = anonymizeEmails(anonymized);

  // 3. Anonymize addresses
  anonymized = anonymizeAddresses(anonymized);

  // 4. Anonymize Korean names
  anonymized = anonymizeKoreanNames(anonymized);

  // 5. Anonymize English names
  anonymized = anonymizeEnglishNames(anonymized);

  return anonymized;
}

/**
 * Compare before/after anonymization (for debugging)
 */
export function compareAnonymization(text: string): {
  original: string;
  anonymized: string;
  changes: number;
} {
  const anonymized = anonymizePersonalInfo(text);
  const changes = (
    anonymized.match(
      /\[익명\]|\[전화번호\]|\[이메일\]|\[주소\]|\[Anonymous\]/g,
    ) || []
  ).length;

  return {
    original: text,
    anonymized,
    changes,
  };
}

/**
 * Sensitive information filtering result
 */
export interface SensitiveInfoFilterResult {
  filtered: string;
  riskSignals: {
    hasSuicideRisk: boolean;
    hasSelfHarmRisk: boolean;
    hasDrugRisk: boolean;
    hasChildAbuseRisk: boolean;
    hasSeriousMedicalInfo: boolean;
    hasFinancialInfo: boolean;
    hasTerrorismRisk: boolean;
  };
  detectedPatterns: string[];
}

/**
 * Check Korean word boundary
 * Korean doesn't support \b word boundary, so check if matched keyword is part of a larger compound word.
 *
 * Example: "학대" inside "철학대로" → false (false positive)
 *          "학대" inside "아동학대" → true (registered separately in abuseTerms)
 *          "학대" inside "학대를 당했다" → true
 *
 * Rule: If the character before keyword is a Korean syllable, it's a compound word (false positive)
 *       Exception: allow prefixes registered in whitelistPrefixes
 */
function isStandaloneKoreanMatch(
  text: string,
  matchIndex: number,
  matchLength: number,
  whitelistPrefixes: string[] = [],
): boolean {
  // Check preceding character: if Korean immediately precedes, may be compound word
  if (matchIndex > 0) {
    const charBefore = text[matchIndex - 1];
    // Korean syllable range: AC00-D7AF
    if (/[가-힣]/.test(charBefore)) {
      // Check whitelist prefix (e.g., "아동" + "학대" → "아동학대" is allowed)
      const textBefore = text.substring(
        Math.max(0, matchIndex - 10),
        matchIndex,
      );
      const isWhitelisted = whitelistPrefixes.some((prefix) =>
        textBefore.endsWith(prefix),
      );
      if (!isWhitelisted) {
        return false; // Compound word false positive
      }
    }
  }
  return true;
}

/**
 * Risk keyword matching (false positive prevention + highlight approach)
 *
 * Instead of masking with [danger], mark as <<RISK:original_keyword>>
 * to preserve the original text while indicating risk signal locations.
 */
function matchRiskKeywords(
  text: string,
  terms: string[],
  whitelistPrefixes: string[] = [],
): { matched: boolean; markedText: string; matchedTerms: string[] } {
  let markedText = text;
  let matched = false;
  const matchedTerms: string[] = [];

  terms.forEach((term) => {
    const regex = new RegExp(term, "gi");
    let match;
    // Process match positions from back to front (prevent index shifting)
    const matches: { index: number; length: number; original: string }[] = [];

    while ((match = regex.exec(text)) !== null) {
      if (
        isStandaloneKoreanMatch(
          text,
          match.index,
          match[0].length,
          whitelistPrefixes,
        )
      ) {
        matches.push({
          index: match.index,
          length: match[0].length,
          original: match[0],
        });
        matched = true;
        if (!matchedTerms.includes(term)) matchedTerms.push(term);
      }
    }

    // Replace from back to preserve index positions
    for (let i = matches.length - 1; i >= 0; i--) {
      const m = matches[i];
      markedText =
        markedText.substring(0, m.index) +
        `<<RISK:${m.original}>>` +
        markedText.substring(m.index + m.length);
    }
  });

  return { matched, markedText, matchedTerms };
}

/**
 * Filter sensitive information and detect risk signals
 * Preserve place names and person names for natural analysis
 *
 * For initial AI analysis: to provide personalized responses on user screen
 * Risk signal detection: strengthen boundary
 *
 * Korean compound word false positive prevention in keyword matching:
 * - "철학대로" → "학대" not matched (preceding Korean forms compound word)
 * - "아동학대" → "학대" matched (whitelist prefix "아동")
 */
export function filterSensitiveInfo(text: string): SensitiveInfoFilterResult {
  let filtered = text;
  const detectedPatterns: string[] = [];
  const riskSignals = {
    hasSuicideRisk: false,
    hasSelfHarmRisk: false,
    hasDrugRisk: false,
    hasChildAbuseRisk: false,
    hasSeriousMedicalInfo: false,
    hasFinancialInfo: false,
    hasTerrorismRisk: false,
  };

  // 1. Filter phone numbers
  if (/\d{2,3}[-\s]?\d{3,4}[-\s]?\d{4}/.test(text)) {
    detectedPatterns.push("phone_number");
  }
  filtered = anonymizePhoneNumbers(filtered);

  // 2. Filter emails
  if (/[\w.-]+@[\w.-]+\.\w+/.test(text)) {
    detectedPatterns.push("email");
  }
  filtered = anonymizeEmails(filtered);

  // 3. Filter financial information
  if (/\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}/.test(text)) {
    riskSignals.hasFinancialInfo = true;
    detectedPatterns.push("card_number");
  }
  filtered = filtered.replace(
    /\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}/g,
    "[카드번호]",
  );

  if (/[가-힣]+은행[\s]*\d{2,}/.test(text)) {
    riskSignals.hasFinancialInfo = true;
    detectedPatterns.push("bank_account");
  }
  filtered = filtered.replace(/[가-힣]+은행[\s]*\d{2,}/g, "[계좌정보]");

  // 4. Filter national ID numbers
  if (/\d{6}[-\s]?\d{7}/.test(text)) {
    detectedPatterns.push("ssn");
  }
  filtered = filtered.replace(/\d{6}[-\s]?\d{7}/g, "[주민등록번호]");

  // 5. Filter serious health information (highlight approach, false positive prevention)
  // "말기", "중증" risk false positives in compounds → use whitelist prefix
  // "말기" → only matches in "암 말기", "말기 암", etc.
  const seriousMedicalTerms = [
    "암진단",
    "암 진단",
    "암환자",
    "항암",
    "말기 암",
    "말기 환자",
    "말기 진단",
    "중증 질환",
    "중증 환자",
    "입원",
  ];
  const medicalResult = matchRiskKeywords(filtered, seriousMedicalTerms);
  if (medicalResult.matched) {
    riskSignals.hasSeriousMedicalInfo = true;
    detectedPatterns.push("serious_medical");
    filtered = medicalResult.markedText;
  }

  // 6. Detect suicide/self-harm risk signals (highlight approach, false positive prevention)
  const suicideTerms = [
    "자살",
    "목숨을 끊",
    "죽고 싶",
    "살고 싶지 않",
    "사라지고 싶",
    "세상을 떠나",
    "끝내고 싶",
    "유서",
    "극단적 선택",
  ];
  const suicideResult = matchRiskKeywords(filtered, suicideTerms);
  if (suicideResult.matched) {
    riskSignals.hasSuicideRisk = true;
    detectedPatterns.push("suicide_risk");
    filtered = suicideResult.markedText;
  }

  const selfHarmTerms = [
    "자해",
    "손목을 그",
    "칼로",
    "베었",
    "상처를 냈",
    "피를 봤",
  ];
  const selfHarmResult = matchRiskKeywords(filtered, selfHarmTerms);
  if (selfHarmResult.matched) {
    riskSignals.hasSelfHarmRisk = true;
    detectedPatterns.push("self_harm_risk");
    filtered = selfHarmResult.markedText;
  }

  // 7. Detect drug-related risk signals (highlight approach, false positive prevention)
  // "대마" may false-positive on "대마도" (place name) → use specific forms like "대마초", "대마 흡연"
  const drugTerms = [
    "마약",
    "대마초",
    "대마 흡연",
    "대마를",
    "필로폰",
    "코카인",
    "헤로인",
    "엑스터시",
    "환각제",
    "약물 복용",
    "과다 복용",
    "약을 많이",
  ];
  const drugResult = matchRiskKeywords(filtered, drugTerms);
  if (drugResult.matched) {
    riskSignals.hasDrugRisk = true;
    detectedPatterns.push("drug_risk");
    filtered = drugResult.markedText;
  }

  // 8. Detect child abuse/crime signals (highlight approach, false positive prevention)
  // "학대" has high false positive risk as standalone keyword (e.g., "철학대로" → matches "학대")
  // whitelistPrefixes allows only compounds like "아동학대", "동물학대"
  const childAbuseTerms = [
    "아동학대",
    "아이를 때렸",
    "아이를 때림",
    "애를 때렸",
    "체벌",
    "폭행",
    "성추행",
    "성폭행",
    "학대",
  ];
  const childAbuseWhitelist = [
    "아동",
    "동물",
    "가정",
    "노인",
    "정서적",
    "신체적",
  ];
  const childAbuseResult = matchRiskKeywords(
    filtered,
    childAbuseTerms,
    childAbuseWhitelist,
  );
  if (childAbuseResult.matched) {
    riskSignals.hasChildAbuseRisk = true;
    detectedPatterns.push("child_abuse_risk");
    filtered = childAbuseResult.markedText;
  }

  // 9. Detect terrorism/violence risk signals (highlight approach, false positive prevention)
  const terrorismTerms = [
    "테러",
    "폭탄",
    "폭발물",
    "총기",
    "인질",
    "납치",
    "폭파",
    "테러리스트",
    "테러 계획",
    "공격 계획",
    "폭탄 제조",
    "칼부림",
    "묻지마 범죄",
    "무차별 살상",
    "사람을 죽",
    "사람을 살해",
    "살인 계획",
    "사람을 죽임",
    "총격",
    "살상",
    "폭력 행위",
    "범죄 계획",
  ];
  const terrorismResult = matchRiskKeywords(filtered, terrorismTerms);
  if (terrorismResult.matched) {
    riskSignals.hasTerrorismRisk = true;
    detectedPatterns.push("terrorism_risk");
    filtered = terrorismResult.markedText;
  }

  return {
    filtered,
    riskSignals,
    detectedPatterns,
  };
}

/**
 * Generate ethics tags for passing risk signals to the slip system
 */
export function generateEthicsFromRiskSignals(
  riskSignals: SensitiveInfoFilterResult["riskSignals"],
): string[] {
  const ethics: string[] = [];

  if (riskSignals.hasSuicideRisk) {
    ethics.push("crisis_suicide");
  }
  if (riskSignals.hasSelfHarmRisk) {
    ethics.push("crisis_self_harm");
  }
  if (riskSignals.hasDrugRisk) {
    ethics.push("crisis_drug");
  }
  if (riskSignals.hasChildAbuseRisk) {
    ethics.push("crisis_child_abuse");
  }
  if (riskSignals.hasTerrorismRisk) {
    ethics.push("crisis_terrorism");
  }
  if (riskSignals.hasSeriousMedicalInfo) {
    ethics.push("medical_sensitive");
  }
  if (riskSignals.hasFinancialInfo) {
    ethics.push("financial_sensitive");
  }

  // Trigger hard slip if crisis is detected
  if (
    riskSignals.hasSuicideRisk ||
    riskSignals.hasSelfHarmRisk ||
    riskSignals.hasDrugRisk ||
    riskSignals.hasChildAbuseRisk ||
    riskSignals.hasTerrorismRisk
  ) {
    ethics.push("hard_slip_required");
  }

  return ethics;
}

/**
 * Calculate risk level (0: none, 1: low, 2: medium, 3: high, 4: crisis)
 */
export function calculateRiskLevel(
  riskSignals: SensitiveInfoFilterResult["riskSignals"],
): number {
  let level = 0;

  // Crisis (immediate intervention required)
  if (riskSignals.hasSuicideRisk) level = Math.max(level, 4);
  if (riskSignals.hasSelfHarmRisk) level = Math.max(level, 4);
  if (riskSignals.hasDrugRisk) level = Math.max(level, 4);
  if (riskSignals.hasChildAbuseRisk) level = Math.max(level, 4);
  if (riskSignals.hasTerrorismRisk) level = Math.max(level, 4);

  // Sensitive information (requires attention)
  if (riskSignals.hasSeriousMedicalInfo) level = Math.max(level, 2);
  if (riskSignals.hasFinancialInfo) level = Math.max(level, 1);

  return level;
}

/**
 * Anonymize foreign names written in Korean
 * Examples: 에드, 조쉬, 다리오, 아모데이, 제임스, etc.
 *
 * Since transliterated foreign names in Korean text are hard to detect by pattern,
 * use a heuristic that detects repeatedly appearing proper nouns
 */
function anonymizeForeignNamesInKorean(text: string): string {
  // Syllable patterns common in foreign names (2-6 chars)
  // Common final consonant/vowel combinations in foreign names written in Korean
  const foreignNameIndicators =
    /(?:^|[\s,.!?~\n(])((?:[가-힣]{1,3}(?:쉬|시|슈|스|즈|츠|드|트|프|브|크|그|르|리|라|로|루|레|디|티|니|미|비|피|키|네|데|메|베|펜|젠|던|번|덴|벤|헨|델|렉|셀|넬|멜|렌|젠))|(?:[가-힣]{2,5}(?:아이|에이)))(?=[\s,.!?~\n)]|이|가|을|를|은|는|과|와|도|만|에게|한테|$)/g;

  // This can be too aggressive, so use only in anonymizeForAdmin
  return text.replace(foreignNameIndicators, (match, name) => {
    const prefix = match.slice(0, match.length - name.length);
    return `${prefix}[익명]`;
  });
}

/**
 * Full anonymization for admin - regex-based (sync, for fallback)
 * For HUA AI analysis (Privacy-First)
 */
export function anonymizeForAdmin(text: string): string {
  let anonymized = anonymizePersonalInfo(text);
  anonymized = anonymizeForeignNamesInKorean(anonymized);
  return anonymized;
}

/**
 * AI integrated anonymization + risk detection response type
 */
export interface AIAnonymizeResult {
  anonymized: string;
  detectedNames: string[];
  pii: Array<{ type: string; original: string }>;
  riskSignals: SensitiveInfoFilterResult["riskSignals"];
  riskLevel: number;
  riskReasoning: string;
  method: "ai" | "regex";
}

const AI_ANONYMIZE_PROMPT = `You are a Korean text anonymizer and risk assessor. You perform TWO tasks in a single pass:

## Task 1: Anonymize ALL personally identifiable information

Replace with these exact markers:
- Person names (Korean, English, nicknames, foreign names in Korean) → [익명]
  - Includes: 김민수→[익명], 에드→[익명], 조쉬→[익명], 공냥이→[익명], Josh→[익명], Dario Amodei→[익명]
  - Does NOT include generic terms: 엄마, 아빠, 친구, 선배, 후배, 동료, 언니, 오빠, 형, 누나
- Phone numbers → [전화번호]
- Email addresses → [이메일]
- Physical addresses → [주소]
- National ID (주민등록번호) → [주민등록번호]
- Credit card numbers → [카드번호]
- Bank account info → [계좌정보]

Keep everything else (emotions, places, organizations, dates, general nouns) intact.

## Task 2: Assess risk signals

Detect these risk categories:
- hasSuicideRisk: suicidal ideation, desire to die, farewell messages
- hasSelfHarmRisk: self-harm behavior, cutting, intentional injury
- hasDrugRisk: illegal drug use, substance abuse
- hasChildAbuseRisk: child abuse, violence against minors
- hasSeriousMedicalInfo: serious medical conditions (cancer, terminal illness)
- hasFinancialInfo: financial account details, transaction info
- hasTerrorismRisk: terrorism, mass violence planning

riskLevel: 0=none, 1=low(financial info), 2=medium(medical), 3=high, 4=crisis(suicide/self-harm/drug/abuse/terrorism)

## Output format (strict JSON)

{
  "anonymized": "the full anonymized text preserving all formatting",
  "detectedNames": ["에드", "조쉬"],
  "pii": [{"type": "name", "original": "에드"}, {"type": "phone", "original": "010-1234-5678"}],
  "riskSignals": {
    "hasSuicideRisk": false,
    "hasSelfHarmRisk": false,
    "hasDrugRisk": false,
    "hasChildAbuseRisk": false,
    "hasSeriousMedicalInfo": false,
    "hasFinancialInfo": false,
    "hasTerrorismRisk": false
  },
  "riskLevel": 0,
  "riskReasoning": "brief explanation of risk assessment"
}`;

/**
 * AI integrated anonymization + risk detection (async)
 * Shared by actual pipeline & E2E tests
 * Automatically applies regex fallback on AI failure
 */
export async function anonymizeWithAI(
  text: string,
): Promise<AIAnonymizeResult> {
  try {
    const { default: OpenAI } = await import("openai");
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY not set");

    const openai = new OpenAI({ apiKey });
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: AI_ANONYMIZE_PROMPT },
        { role: "user", content: text },
      ],
      temperature: 0,
      max_tokens: 4000,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("Empty AI response");

    const parsed = JSON.parse(content);
    if (!parsed.anonymized || typeof parsed.anonymized !== "string") {
      throw new Error("Invalid AI response: missing anonymized field");
    }

    return {
      anonymized: parsed.anonymized,
      detectedNames: Array.isArray(parsed.detectedNames)
        ? parsed.detectedNames
        : [],
      pii: Array.isArray(parsed.pii) ? parsed.pii : [],
      riskSignals: {
        hasSuicideRisk: !!parsed.riskSignals?.hasSuicideRisk,
        hasSelfHarmRisk: !!parsed.riskSignals?.hasSelfHarmRisk,
        hasDrugRisk: !!parsed.riskSignals?.hasDrugRisk,
        hasChildAbuseRisk: !!parsed.riskSignals?.hasChildAbuseRisk,
        hasSeriousMedicalInfo: !!parsed.riskSignals?.hasSeriousMedicalInfo,
        hasFinancialInfo: !!parsed.riskSignals?.hasFinancialInfo,
        hasTerrorismRisk: !!parsed.riskSignals?.hasTerrorismRisk,
      },
      riskLevel: typeof parsed.riskLevel === "number" ? parsed.riskLevel : 0,
      riskReasoning: parsed.riskReasoning || "",
      method: "ai",
    };
  } catch (error) {
    console.error("AI anonymization failed (regex fallback):", error);

    // regex fallback
    const anonymized = anonymizeForAdmin(text);
    const filterResult = filterSensitiveInfo(text);
    const riskLevel = calculateRiskLevel(filterResult.riskSignals);

    return {
      anonymized,
      detectedNames: [],
      pii: [],
      riskSignals: filterResult.riskSignals,
      riskLevel,
      riskReasoning: "regex fallback (AI unavailable)",
      method: "regex",
    };
  }
}
