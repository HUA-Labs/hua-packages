/**
 * API abuse detection and penalty system
 *
 * Detects suspicious patterns and applies appropriate penalties.
 */

import { NextRequest } from "next/server";
import { prisma } from "../infra/prisma";
function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
import { logger } from "../infra/logger";
import { notifyAbuseAlert } from "../infra/discord-webhook";

/**
 * Abuse pattern types
 */
export type AbusePattern =
  | "RAPID_REQUESTS" // Extremely rapid requests
  | "REPETITIVE_CONTENT" // Repetitive content
  | "SUSPICIOUS_PROMPTS" // Suspicious prompts (jailbreak attempts, etc.)
  | "TOKEN_ABUSE" // Token abuse (excessive length)
  | "MULTI_ACCOUNT" // Multi-account usage
  | "API_SCRAPING"; // API scraping

/**
 * Penalty levels
 */
export type PenaltyLevel =
  | "WARNING" // Warning
  | "RATE_LIMIT" // Rate limiting
  | "TEMPORARY_BAN" // Temporary ban
  | "PERMANENT_BAN"; // Permanent ban

/**
 * Abuse detection configuration
 */
export const ABUSE_DETECTION_CONFIG = {
  // Rate limiting
  MAX_REQUESTS_PER_MINUTE: 10,
  MAX_REQUESTS_PER_HOUR: 100,

  // Content patterns
  MIN_CONTENT_LENGTH: 10,
  MAX_CONTENT_LENGTH: 10000,
  REPETITIVE_THRESHOLD: 0.8, // 80%+ duplication

  // Suspicious patterns (English + Korean)
  SUSPICIOUS_KEYWORDS: [
    "ignore",
    "forget",
    "previous",
    "prompt",
    "system",
    "as an ai",
    "you are",
    "pretend",
    "roleplay",
    "jailbreak",
    "bypass",
    "hack",
    "exploit",
    // Korean suspicious keywords
    "무시",
    "지시사항",
    "원래",
    "제약",
    "필터",
    "비활성화",
    "명령",
    "따르",
    "자유롭게",
    "제한 없이",
  ],

  // Jailbreak long-prompt patterns
  JAILBREAK_PROMPT_PATTERNS: [
    /당신\s*(은|이)?\s*(이제|지금|바로|이후)\s*(부터|후|부터는)?/i,
    /이?\s*구조\s*로\s*응답/i,
    /템플릿/i,
    /therapist|상담사|치료사/i,
    /(감정|분석)\s*하지\s*마/i,
    /다음\s*형식\s*으로/i,
    /응답\s*템플릿/i,
    // Additional Korean jailbreak patterns
    /원래\s*(지시사항|프롬프트|지시)\s*(을|를)?\s*무시/i,
    /모든\s*(필터|제약|제한|콘텐츠\s*필터)\s*(을|를)?\s*비활성화/i,
    /제약\s*(없이|없이)?\s*응답/i,
    /자유롭게\s*응답/i,
    /다음\s*(명령|지시)\s*(을|를)?\s*따르/i,
    // System prompt override patterns
    /\[SYSTEM[_\s]?PROMPT[_\s]?OVERRIDE\]/i,
    /\[.*OVERRIDE.*\]/i,
    /SYSTEM[_\s]?PROMPT[_\s]?OVERRIDE/i,
  ],

  // Vector/random number patterns
  VECTOR_PATTERNS: [
    /\[-?\d+\.\d+(\s*,\s*-?\d+\.\d+)*\s*\]/, // [0.313, 0.524, -0.129]
    /벡터|vector|array|배열/i,
    /기반\s*합니다?\s*[:：]\s*\[/i,
    /^\s*\[?\s*[-+]?\d+\.\d+(\s*,\s*[-+]?\d+\.\d+){5,}\s*\]?\s*$/m, // Pure numeric arrays only
  ],

  // Model test data patterns
  BENCHMARK_PATTERNS: [
    /benchmark|벤치마크/i,
    /모델\s*비교|모델\s*평가|성능\s*테스트/i,
    /정확도\s*(를\s*)?평가|정확도\s*테스트/i,
    /테스트\s*데이터|test\s*data/i,
    /평가\s*용|비교\s*용/i,
    /openai\s*모델|gpt\s*비교/i,
  ],

  // Penalty durations (minutes)
  TEMPORARY_BAN_DURATION: 60, // 1 hour
  RATE_LIMIT_DURATION: 15, // 15 minutes
} as const;

/**
 * Abuse log interface
 */
interface AbuseLog {
  id: string;
  userId?: string;
  ip: string;
  pattern: AbusePattern;
  level: PenaltyLevel;
  timestamp: Date;
  details?: any;
}

/**
 * IP-based request frequency check
 */
export async function checkRequestFrequency(
  ip: string,
  userId?: string,
): Promise<{ allowed: boolean; pattern?: AbusePattern; level?: PenaltyLevel }> {
  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  try {
    // Check recent request count from LoginLog
    const whereClause: any = {
      ip: ip,
      created_at: { gte: oneMinuteAgo },
    };

    if (userId) {
      whereClause.user_id = userId;
    }

    const recentRequests = await prisma.loginLog.count({
      where: whereClause,
    });

    if (recentRequests >= ABUSE_DETECTION_CONFIG.MAX_REQUESTS_PER_MINUTE) {
      return {
        allowed: false,
        pattern: "RAPID_REQUESTS",
        level: "RATE_LIMIT",
      };
    }

    // Check hourly request count
    const hourlyWhere = { ...whereClause };
    hourlyWhere.created_at = { gte: oneHourAgo };

    const hourlyRequests = await prisma.loginLog.count({
      where: hourlyWhere,
    });

    if (hourlyRequests >= ABUSE_DETECTION_CONFIG.MAX_REQUESTS_PER_HOUR) {
      return {
        allowed: false,
        pattern: "RAPID_REQUESTS",
        level: "TEMPORARY_BAN",
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error("Failed to check request frequency:", error);
    // Allow on error to prevent service disruption
    return { allowed: true };
  }
}

/**
 * Record abuse log
 */
export async function logAbuse(
  request: NextRequest,
  pattern: AbusePattern,
  level: PenaltyLevel,
  userId?: string,
  details?: any,
): Promise<void> {
  try {
    const ip = getClientIP(request);

    // Record to LoginLog (reusing existing schema)
    await prisma.loginLog.create({
      data: {
        ip: ip,
        ua: request.headers.get("user-agent"),
        action: "abuse_detected",
        is_guest: !userId,
        user_id: userId,
        created_at: new Date(),
        // Store details as JSON (if needed)
      },
    });

    logger.warn("Abuse detected", {
      pattern,
      level,
      ip,
      userId,
      details,
    });
  } catch (error) {
    console.error("Failed to log abuse:", error);
    // Log failure should not affect service operation
  }
}

/**
 * Create AbuseAlert (async)
 *
 * Creates an AbuseAlert when an abuse pattern is detected.
 * Processed asynchronously to avoid impacting user response.
 */
export async function createAbuseAlertAsync(input: {
  userId: string;
  contentId?: string;
  abusePatterns: AbusePattern[];
  penaltyLevel: PenaltyLevel;
  contentFlags?: string[];
  detectedPatterns?: string[];
  excludeFromAnalysis?: boolean;
  contentExcerpt?: string;
  content?: string;
}): Promise<void> {
  try {
    const excerptLength = Math.min(
      (input.contentExcerpt || input.content || "").length,
      500,
    );
    const contentExcerpt =
      input.contentExcerpt ||
      (input.content || "").substring(0, excerptLength) +
        ((input.content || "").length > excerptLength ? "..." : "");

    await prisma.abuseAlert.create({
      data: {
        user_id: input.userId,
        alert_type: "ABUSE",
        abuse_patterns: input.abusePatterns,
        penalty_level: input.penaltyLevel,
        status: "PENDING",
        content_flags: input.contentFlags || [],
        detected_patterns: input.detectedPatterns || [],
        exclude_from_analysis: input.excludeFromAnalysis || false,
        content_excerpt: contentExcerpt || null,
      },
    });

    logger.info("AbuseAlert created", {
      contentId: input.contentId || "N/A",
      patterns: input.abusePatterns.join(", "),
    });

    notifyAbuseAlert({
      userId: input.userId,
      resourceId: input.contentId,
      abusePatterns: input.abusePatterns,
      penaltyLevel: input.penaltyLevel,
    });
  } catch (error) {
    console.error(
      `[Error] Failed to create AbuseAlert (Content ID: ${input.contentId || "N/A"}):`,
      error,
    );
    // Error does not affect user experience (async processing)
  }
}

/**
 * Integrated abuse detection and check
 */
export async function detectAndCheckAbuse(
  request: NextRequest,
  content?: string,
  userId?: string,
  contentId?: string,
  userLang?: "ko" | "en" | "ja",
): Promise<{
  allowed: boolean;
  pattern?: AbusePattern;
  level?: PenaltyLevel;
  message?: string;
  excludeFromAnalysis?: boolean; // Whether to exclude from analysis
  analysisTags?: string[]; // Analysis tags (for filtering in normal data analysis)
}> {
  const ip = getClientIP(request);

  // 1. Check request frequency
  const frequencyCheck = await checkRequestFrequency(ip, userId);
  if (!frequencyCheck.allowed) {
    await logAbuse(
      request,
      frequencyCheck.pattern!,
      frequencyCheck.level!,
      userId,
    );

    // Create AbuseAlert (async)
    if (userId) {
      Promise.resolve().then(async () => {
        await createAbuseAlertAsync({
          userId,
          contentId,
          abusePatterns: [frequencyCheck.pattern!],
          penaltyLevel: frequencyCheck.level!,
          detectedPatterns: [
            `Request frequency exceeded: ${frequencyCheck.pattern}`,
          ],
          excludeFromAnalysis: false,
        });
      });
    }

    return {
      allowed: false,
      pattern: frequencyCheck.pattern,
      level: frequencyCheck.level,
      message: "Too many requests. Please try again later.",
    };
  }

  // 2. Content-based pattern detection
  if (content) {
    const lowerContent = content.toLowerCase();
    const suspiciousKeywords =
      ABUSE_DETECTION_CONFIG.SUSPICIOUS_KEYWORDS.filter((keyword) =>
        lowerContent.includes(keyword.toLowerCase()),
      ).length;

    // Detect jailbreak long-prompt patterns
    let hasJailbreakPattern = false;
    for (const pattern of ABUSE_DETECTION_CONFIG.JAILBREAK_PROMPT_PATTERNS) {
      if (pattern.test(content)) {
        hasJailbreakPattern = true;
        logger.debug("Jailbreak pattern detected", {
          pattern: pattern.toString(),
        });
        break;
      }
    }

    // Detect vector/random number patterns
    let hasVectorPattern = false;
    for (const pattern of ABUSE_DETECTION_CONFIG.VECTOR_PATTERNS) {
      if (pattern.test(content)) {
        hasVectorPattern = true;
        break;
      }
    }

    // Detect benchmark/test patterns
    let hasBenchmarkPattern = false;
    for (const pattern of ABUSE_DETECTION_CONFIG.BENCHMARK_PATTERNS) {
      if (pattern.test(content)) {
        hasBenchmarkPattern = true;
        break;
      }
    }

    const hasAnySuspiciousPattern =
      suspiciousKeywords >= 2 || hasJailbreakPattern || hasBenchmarkPattern;

    if (hasJailbreakPattern || suspiciousKeywords >= 2) {
      logger.debug("Jailbreak attempt condition check", {
        hasJailbreakPattern,
        suspiciousKeywords,
        hasAnySuspiciousPattern,
        contentLength: content.length,
      });
    }

    if (hasAnySuspiciousPattern) {
      logger.warn("Prompt injection detected", {
        suspiciousKeywords,
        hasJailbreakPattern,
        hasBenchmarkPattern,
        contentLength: content.length,
      });

      await logAbuse(request, "SUSPICIOUS_PROMPTS", "WARNING", userId, {
        content: content.substring(0, 100),
        patterns: {
          jailbreak: hasJailbreakPattern,
          vector: hasVectorPattern,
          benchmark: hasBenchmarkPattern,
          suspiciousKeywords,
        },
      });

      const tags: string[] = [];
      const detectedPatterns: string[] = [];
      const abusePatterns: AbusePattern[] = ["SUSPICIOUS_PROMPTS"];

      if (hasJailbreakPattern) {
        tags.push("jailbreak_attempt");
        detectedPatterns.push("Jailbreak long-prompt pattern detected");
      }
      if (hasVectorPattern) {
        tags.push("vector_injection");
        detectedPatterns.push(
          "Vector/random number injection pattern detected",
        );
      }
      if (hasBenchmarkPattern) {
        tags.push("benchmark_test");
        detectedPatterns.push(
          "Model performance test data injection pattern detected",
        );
      }
      if (suspiciousKeywords >= 2) {
        tags.push("suspicious_pattern");
        detectedPatterns.push(
          `${suspiciousKeywords} suspicious keywords detected`,
        );
      }

      return {
        allowed: true,
        pattern: "SUSPICIOUS_PROMPTS",
        level: "WARNING",
        message: "Suspicious pattern detected.",
        excludeFromAnalysis: false,
        analysisTags: tags.length > 0 ? tags : ["suspicious_content"],
      };
    }

    // Vector pattern present
    if (hasVectorPattern) {
      return {
        allowed: true,
        pattern: "SUSPICIOUS_PROMPTS",
        level: "WARNING",
        message: "Suspicious pattern detected.",
        excludeFromAnalysis: false,
        analysisTags: ["vector_injection"],
      };
    }
  }

  return { allowed: true };
}
