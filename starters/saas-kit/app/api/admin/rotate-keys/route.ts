import { NextRequest, NextResponse } from "next/server";
import { withAdmin } from "@/app/lib/admin/admin";
import { keyManager, validateAllKeys } from "@/app/lib/security/key-management";
import { logger } from "@/app/lib/infra/logger";
import {
  withRateLimit,
  RATE_LIMIT_PRESETS,
} from "@/app/lib/rate-limit/with-rate-limit";
import { internalError, validationError } from "@/app/lib/errors";

/**
 * Key rotation API
 * Admin access only
 */
async function handleGetKeyStatus(
  request: NextRequest,
  { userId }: { userId: string },
) {
  try {
    const keyStatus = keyManager.getAllKeyStatus();
    const validationResults = validateAllKeys();

    const keyInfo = Array.from(keyStatus.entries()).map(([type, info]) => ({
      type,
      current: info.current.substring(0, 8) + "...",
      hasPrevious: !!info.previous,
      createdAt: info.createdAt,
      isValid: validationResults[type],
    }));

    return NextResponse.json({
      success: true,
      keys: keyInfo,
      validation: validationResults,
    });
  } catch (error) {
    console.error("Key status error:", error);
    return internalError();
  }
}

async function handleRotateKey(
  request: NextRequest,
  { userId }: { userId: string },
) {
  try {
    const { keyType } = await request.json();

    if (!keyType || !["encryption", "jwt", "api"].includes(keyType)) {
      return validationError("VALIDATION_INVALID_FORMAT");
    }

    const newKey = keyManager.rotateKey(
      keyType as "encryption" | "jwt" | "api",
    );

    logger.info("Admin key rotation complete", {
      keyType,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: `${keyType} key rotated successfully.`,
      newKey: newKey.substring(0, 8) + "...",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Key rotation error:", error);
    return internalError();
  }
}

export const GET = withRateLimit(
  withAdmin(handleGetKeyStatus),
  RATE_LIMIT_PRESETS.default,
);
export const POST = withRateLimit(
  withAdmin(handleRotateKey),
  RATE_LIMIT_PRESETS.sensitive,
);
