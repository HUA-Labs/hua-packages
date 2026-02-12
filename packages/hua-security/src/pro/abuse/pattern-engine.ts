/**
 * Abuse Pattern Engine
 *
 * Content pattern matching for abuse detection.
 * Pure pattern engine — no database, no request handling.
 * App-level code handles DB logging, alerts, and penalties.
 */

/**
 * Abuse pattern types
 */
export type AbusePattern =
  | 'RAPID_REQUESTS'
  | 'REPETITIVE_CONTENT'
  | 'SUSPICIOUS_PROMPTS'
  | 'TOKEN_ABUSE'
  | 'MULTI_ACCOUNT'
  | 'API_SCRAPING';

/**
 * Penalty levels
 */
export type PenaltyLevel =
  | 'WARNING'
  | 'RATE_LIMIT'
  | 'TEMPORARY_BAN'
  | 'PERMANENT_BAN';

/**
 * Abuse detection configuration
 */
export const ABUSE_DETECTION_CONFIG = {
  MAX_REQUESTS_PER_MINUTE: 10,
  MAX_REQUESTS_PER_HOUR: 100,

  MIN_CONTENT_LENGTH: 10,
  MAX_CONTENT_LENGTH: 10000,
  REPETITIVE_THRESHOLD: 0.8,

  SUSPICIOUS_KEYWORDS: [
    'ignore', 'forget', 'previous', 'prompt', 'system',
    'as an ai', 'you are', 'pretend', 'roleplay',
    'jailbreak', 'bypass', 'hack', 'exploit',
    '무시', '지시사항', '원래', '제약', '필터', '비활성화',
    '명령', '따르', '자유롭게', '제한 없이',
  ],

  JAILBREAK_PROMPT_PATTERNS: [
    /당신\s*(은|이)?\s*(이제|지금|바로|이후)\s*(부터|후|부터는)?/i,
    /이?\s*구조\s*로\s*응답/i,
    /템플릿/i,
    /therapist|상담사|치료사/i,
    /(감정|분석)\s*하지\s*마/i,
    /다음\s*형식\s*으로/i,
    /응답\s*템플릿/i,
    /원래\s*(지시사항|프롬프트|지시)\s*(을|를)?\s*무시/i,
    /모든\s*(필터|제약|제한|콘텐츠\s*필터)\s*(을|를)?\s*비활성화/i,
    /제약\s*(없이|없이)?\s*응답/i,
    /자유롭게\s*응답/i,
    /다음\s*(명령|지시)\s*(을|를)?\s*따르/i,
    /\[SYSTEM[_\s]?PROMPT[_\s]?OVERRIDE\]/i,
    /\[.*OVERRIDE.*\]/i,
    /SYSTEM[_\s]?PROMPT[_\s]?OVERRIDE/i,
  ] as RegExp[],

  EMOTION_AVOIDANCE_PATTERNS: [
    /이\s*일기는?\s*(감정|느낌|기분)\s*(에\s*대한\s*것이\s*)?아니/i,
    /(감정|느낌)\s*(에\s*대한|을?\s*다루는)\s*것이\s*아니/i,
    /고양이\s*전사|소설|판타지|모험담/i,
    /이건\s*(일기|감정)\s*아니/i,
  ] as RegExp[],

  VECTOR_PATTERNS: [
    /\[-?\d+\.\d+(\s*,\s*-?\d+\.\d+)*\s*\]/,
    /벡터|vector|array|배열/i,
    /기반\s*합니다?\s*[:：]\s*\[/i,
    /^\s*\[?\s*[-+]?\d+\.\d+(\s*,\s*[-+]?\d+\.\d+){5,}\s*\]?\s*$/m,
  ] as RegExp[],

  BENCHMARK_PATTERNS: [
    /benchmark|벤치마크/i,
    /모델\s*비교|모델\s*평가|성능\s*테스트/i,
    /정확도\s*(를\s*)?평가|정확도\s*테스트/i,
    /테스트\s*데이터|test\s*data/i,
    /평가\s*용|비교\s*용/i,
    /openai\s*모델|gpt\s*비교/i,
  ] as RegExp[],

  TEMPORARY_BAN_DURATION: 60,
  RATE_LIMIT_DURATION: 15,
} as const;

/**
 * Result of content pattern analysis
 */
export interface PatternMatchResult {
  skip: boolean;
  pattern?: AbusePattern;
  reason?: string;
}

/**
 * Check if content should be skipped from analysis
 *
 * Detects truly meaningless content (spam, base64, jailbreak without substance).
 * Does NOT skip content that has real emotional/diary content, even with suspicious patterns.
 */
export function shouldSkipAnalysis(content: string, userLang?: 'ko' | 'en' | 'ja' | undefined): PatternMatchResult {
  if (!content || content.length < ABUSE_DETECTION_CONFIG.MIN_CONTENT_LENGTH) {
    return { skip: true, pattern: 'TOKEN_ABUSE', reason: '내용이 너무 짧음' };
  }

  // Nonsense pattern ratio
  const nonsensePattern = /[a-zA-Z0-9]{20,}/g;
  const nonsenseMatches = content.match(nonsensePattern) || [];
  const nonsenseRatio = content.length > 0
    ? nonsenseMatches.reduce((sum, match) => sum + match.length, 0) / content.length
    : 0;

  if (nonsenseRatio > 0.3) {
    return { skip: true, pattern: 'REPETITIVE_CONTENT', reason: '무의미한 패턴 비율이 너무 높음' };
  }

  // Command-only content
  const commandOnlyPattern = /^(이전 프롬프트|무시하고|지우고|~하라|ignore|forget|clear)/i;
  if (commandOnlyPattern.test(content) && content.length < 100) {
    const hasReflectiveContent = /(감정|느낌|기분|마음|생각|상황|오늘|어제|내일)/i.test(content);
    if (!hasReflectiveContent) {
      return { skip: true, pattern: 'SUSPICIOUS_PROMPTS', reason: '컨텍스트 없는 순수 명령어만 포함' };
    }
  }

  // Repetitive content
  const words = content.split(/\s+/);
  const uniqueWords = new Set(words);
  const repetitionRatio = uniqueWords.size / words.length;

  if (repetitionRatio < 0.1) {
    return { skip: true, pattern: 'REPETITIVE_CONTENT', reason: '반복된 내용이 90% 이상' };
  }

  // Excessive length
  if (content.length > ABUSE_DETECTION_CONFIG.MAX_CONTENT_LENGTH) {
    return { skip: true, pattern: 'TOKEN_ABUSE', reason: '입력 길이가 허용 범위 초과' };
  }

  // Base64 garbage
  const base64Pattern = /^[A-Za-z0-9+/=]{100,}$/;
  if (base64Pattern.test(content.trim())) {
    return { skip: true, pattern: 'REPETITIVE_CONTENT', reason: 'Base64 같은 인코딩된 데이터로 보임' };
  }

  // Jailbreak prompt patterns
  for (const pattern of ABUSE_DETECTION_CONFIG.JAILBREAK_PROMPT_PATTERNS) {
    if (pattern.test(content)) {
      const hasReflectiveContent = /(감정|느낌|기분|마음|생각|상황|오늘|어제|내일|경험|일어난|느꼈|실제|하지만|그냥|일기)/i.test(content);
      const contentRatio = (content.match(/(감정|느낌|기분|마음|생각|상황|오늘|어제|내일|경험|실제|하지만|그냥|일기)/gi) || []).length;
      if (!hasReflectiveContent || (contentRatio < 2 && content.length < 100)) {
        return { skip: true, pattern: 'SUSPICIOUS_PROMPTS', reason: '탈옥용 롱프롬프트 패턴 감지 (실제 내용 부족)' };
      }
    }
  }

  // Emotion avoidance patterns
  for (const pattern of ABUSE_DETECTION_CONFIG.EMOTION_AVOIDANCE_PATTERNS) {
    if (pattern.test(content)) {
      const diaryContentRatio = (content.match(/(오늘|어제|내일|상황|경험|느꼈|생각)/gi) || []).length;
      if (diaryContentRatio < 2) {
        return { skip: true, pattern: 'SUSPICIOUS_PROMPTS', reason: '감정 회피형 프롬프트 패턴 감지' };
      }
    }
  }

  // Vector/random injection
  for (const pattern of ABUSE_DETECTION_CONFIG.VECTOR_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      const vectorLength = matches.reduce((sum, match) => sum + match.length, 0);
      if (vectorLength / content.length > 0.3) {
        return { skip: true, pattern: 'REPETITIVE_CONTENT', reason: '분석 회피용 벡터/난수 삽입 패턴 감지' };
      }
    }
  }

  // Multilingual injection detection
  const koreanCount = (content.match(/[가-힣]/g) || []).length;
  const englishCount = (content.match(/[a-zA-Z]/g) || []).length;
  const japaneseCount = (content.match(/[\u3040-\u309F\u30A0-\u30FF]/g) || []).length;
  const cjkCount = (content.match(/[\u4E00-\u9FFF]/g) || []).length;
  const arabicCount = (content.match(/[\u0600-\u06FF]/g) || []).length;
  const greekCount = (content.match(/[\u0370-\u03FF]/g) || []).length;
  const cyrillicCount = (content.match(/[\u0400-\u04FF]/g) || []).length;

  const totalChars = content.length;

  let normalLangCount = englishCount;
  let otherLangCount = arabicCount + greekCount + cyrillicCount;

  if (userLang === 'ja') {
    normalLangCount += japaneseCount + cjkCount;
    otherLangCount += koreanCount;
  } else if (userLang === 'ko') {
    normalLangCount += koreanCount;
    otherLangCount += japaneseCount + cjkCount;
  } else if (userLang === 'en') {
    normalLangCount += koreanCount + japaneseCount + cjkCount;
  } else {
    normalLangCount += koreanCount;
    otherLangCount += japaneseCount + cjkCount;
  }

  const normalLangRatio = normalLangCount / totalChars;
  const otherLangRatio = otherLangCount / totalChars;

  if (normalLangRatio < 0.3 && otherLangRatio > 0.2 && totalChars > 50) {
    const hasReflectiveContent = /(감정|느낌|기분|마음|생각|상황|오늘|어제|내일|경험|일어난|느꼈|실제|하지만|그냥|일기|feel|emotion|feeling|today|yesterday|think|thought|気持ち|感情|今日|昨日|思|考え)/i.test(content);
    const diaryContentRatio = (content.match(/(감정|느낌|기분|마음|생각|상황|오늘|어제|내일|경험|실제|하지만|그냥|일기|feel|emotion|feeling|today|yesterday|think|thought|気持ち|感情|今日|昨日|思|考え)/gi) || []).length;

    if (!hasReflectiveContent || diaryContentRatio < 2) {
      const detectedLanguages = [];
      if (arabicCount > 0) detectedLanguages.push('아랍어');
      if (greekCount > 0) detectedLanguages.push('그리스어');
      if (cyrillicCount > 0) detectedLanguages.push('키릴문자');

      if (detectedLanguages.length > 0) {
        return {
          skip: true,
          pattern: 'SUSPICIOUS_PROMPTS',
          reason: `비정상 언어 혼합 감지 (${detectedLanguages.join(', ')} 포함, 실제 일기 내용 부족)`,
        };
      }
    }
  }

  // Benchmark/test data injection
  for (const pattern of ABUSE_DETECTION_CONFIG.BENCHMARK_PATTERNS) {
    if (pattern.test(content)) {
      const testKeywords = (content.match(/(benchmark|벤치마크|모델|평가|테스트|비교|정확도)/gi) || []).length;
      const diaryKeywords = (content.match(/(오늘|어제|내일|감정|느낌|기분|마음|생각)/gi) || []).length;
      if (testKeywords >= 2 && diaryKeywords < 3) {
        return { skip: true, pattern: 'SUSPICIOUS_PROMPTS', reason: '모델 성능 테스트 데이터 주입 패턴 감지' };
      }
    }
  }

  // Excessive sentence repetition
  const sentences = content.split(/[.!?。！？\n]/).filter(s => s.trim().length > 10);
  if (sentences.length > 10) {
    const sentenceMap = new Map<string, number>();
    sentences.forEach(s => {
      const normalized = s.trim().toLowerCase();
      sentenceMap.set(normalized, (sentenceMap.get(normalized) || 0) + 1);
    });
    const maxRepeat = Math.max(...Array.from(sentenceMap.values()));
    if (maxRepeat >= 5) {
      return { skip: true, pattern: 'REPETITIVE_CONTENT', reason: '과도한 문장 반복 패턴 감지 (노잼 장난)' };
    }
  }

  return { skip: false };
}

/**
 * Analyze content for suspicious patterns (returns detected tags)
 *
 * Unlike shouldSkipAnalysis, this doesn't decide skip/allow — it just tags patterns found.
 */
export function matchAbusePatterns(content: string): {
  hasJailbreakPattern: boolean;
  hasEmotionAvoidance: boolean;
  hasVectorPattern: boolean;
  hasBenchmarkPattern: boolean;
  suspiciousKeywordCount: number;
  tags: string[];
} {
  const lowerContent = content.toLowerCase();

  const suspiciousKeywordCount = ABUSE_DETECTION_CONFIG.SUSPICIOUS_KEYWORDS.filter(
    keyword => lowerContent.includes(keyword.toLowerCase())
  ).length;

  let hasJailbreakPattern = false;
  for (const pattern of ABUSE_DETECTION_CONFIG.JAILBREAK_PROMPT_PATTERNS) {
    if (pattern.test(content)) {
      hasJailbreakPattern = true;
      break;
    }
  }

  let hasEmotionAvoidance = false;
  for (const pattern of ABUSE_DETECTION_CONFIG.EMOTION_AVOIDANCE_PATTERNS) {
    if (pattern.test(content)) {
      hasEmotionAvoidance = true;
      break;
    }
  }

  let hasVectorPattern = false;
  for (const pattern of ABUSE_DETECTION_CONFIG.VECTOR_PATTERNS) {
    if (pattern.test(content)) {
      hasVectorPattern = true;
      break;
    }
  }

  let hasBenchmarkPattern = false;
  for (const pattern of ABUSE_DETECTION_CONFIG.BENCHMARK_PATTERNS) {
    if (pattern.test(content)) {
      hasBenchmarkPattern = true;
      break;
    }
  }

  const tags: string[] = [];
  if (hasJailbreakPattern) tags.push('jailbreak_attempt');
  if (hasEmotionAvoidance) tags.push('emotion_avoidance');
  if (hasVectorPattern) tags.push('vector_injection');
  if (hasBenchmarkPattern) tags.push('benchmark_test');
  if (suspiciousKeywordCount >= 2) tags.push('suspicious_pattern');

  return {
    hasJailbreakPattern,
    hasEmotionAvoidance,
    hasVectorPattern,
    hasBenchmarkPattern,
    suspiciousKeywordCount,
    tags,
  };
}
