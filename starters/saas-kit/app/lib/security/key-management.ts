/**
 * Key management system
 *
 * Handles environment variable-based key management and rotation.
 *
 * ENCRYPTION_KEY is optional when KMS is enabled.
 */

import crypto from "crypto";
import { getServerEnv } from "../env/env";
import { isKMSEnabled } from "@hua-labs/security";

// Key type definitions
export type KeyType = "encryption" | "jwt" | "api";

// Key info interface
interface KeyInfo {
  type: KeyType;
  current: string;
  previous?: string;
  createdAt: Date;
  expiresAt?: Date;
}

/**
 * Key generation utility
 */
export class KeyManager {
  private static instance: KeyManager;
  private keys: Map<KeyType, KeyInfo> = new Map();

  private constructor() {
    this.initializeKeys();
  }

  public static getInstance(): KeyManager {
    if (!KeyManager.instance) {
      KeyManager.instance = new KeyManager();
    }
    return KeyManager.instance;
  }

  /**
   * Initialize keys
   *
   * At build time (NEXT_PHASE === 'phase-production-build'),
   * skip env var validation and use placeholder values.
   */
  private initializeKeys(): void {
    // Check if build time
    const isBuildTime = process.env.NEXT_PHASE === "phase-production-build";

    let isProduction: boolean;
    let encryptionKey: string | undefined;

    try {
      const serverEnv = getServerEnv();
      isProduction = serverEnv.NODE_ENV === "production";
      encryptionKey = serverEnv.ENCRYPTION_KEY;
    } catch {
      isProduction = process.env.NODE_ENV === "production";
      encryptionKey = process.env.ENCRYPTION_KEY;
    }

    // Encryption key (required in production runtime, optional when KMS is used)
    const kmsEnabled = isKMSEnabled();
    if (isProduction && !isBuildTime && !encryptionKey && !kmsEnabled) {
      throw new Error(
        "ENCRYPTION_KEY environment variable is required in production (unless KMS is enabled). " +
          "Generate a secure key: node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\"",
      );
    }
    this.keys.set("encryption", {
      type: "encryption",
      current:
        encryptionKey ||
        (kmsEnabled
          ? "KMS_MANAGED"
          : isBuildTime
            ? "BUILD_PLACEHOLDER"
            : this.generateKey(32)),
      createdAt: new Date(),
    });

    // JWT secret (required in production runtime)
    const jwtSecret = process.env.NEXTAUTH_SECRET;
    if (isProduction && !isBuildTime && !jwtSecret) {
      throw new Error(
        "NEXTAUTH_SECRET environment variable is required in production. " +
          "Generate a secure secret: node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\"",
      );
    }
    this.keys.set("jwt", {
      type: "jwt",
      current:
        jwtSecret || (isBuildTime ? "BUILD_PLACEHOLDER" : this.generateKey(32)),
      createdAt: new Date(),
    });

    // API key (optional)
    this.keys.set("api", {
      type: "api",
      current: process.env.HUA_API_KEY || this.generateKey(16),
      createdAt: new Date(),
    });
  }

  /**
   * Generate a secure key
   */
  private generateKey(length: number): string {
    return crypto.randomBytes(length).toString("base64");
  }

  /**
   * Get current key
   */
  public getCurrentKey(type: KeyType): string {
    const keyInfo = this.keys.get(type);
    if (!keyInfo) {
      throw new Error(`Key type ${type} not found`);
    }
    return keyInfo.current;
  }

  /**
   * Check key strength
   */
  public validateKeyStrength(key: string, minLength: number = 32): boolean {
    if (key.length < minLength) return false;

    // Entropy check (simple version)
    const uniqueChars = new Set(key).size;
    return uniqueChars > key.length * 0.5;
  }

  /**
   * Key rotation (generate new key)
   */
  public rotateKey(type: KeyType): string {
    const keyInfo = this.keys.get(type);
    if (!keyInfo) {
      throw new Error(`Key type ${type} not found`);
    }

    // Save previous key
    keyInfo.previous = keyInfo.current;

    // Generate new key
    const newKey = this.generateKey(32);
    keyInfo.current = newKey;
    keyInfo.createdAt = new Date();

    // Update environment variables (runtime only)
    if (type === "encryption") {
      process.env.ENCRYPTION_KEY = newKey;
    } else if (type === "jwt") {
      process.env.NEXTAUTH_SECRET = newKey;
    } else if (type === "api") {
      process.env.HUA_API_KEY = newKey;
    }

    return newKey;
  }

  /**
   * Check key status
   */
  public getKeyStatus(type: KeyType): KeyInfo | null {
    return this.keys.get(type) || null;
  }

  /**
   * Check all key statuses
   */
  public getAllKeyStatus(): Map<KeyType, KeyInfo> {
    return new Map(this.keys);
  }
}

/**
 * Key management helper functions
 */
export const keyManager = KeyManager.getInstance();

/**
 * Get encryption key
 */
export function getEncryptionKey(): string {
  return keyManager.getCurrentKey("encryption");
}

/**
 * Get JWT secret
 */
export function getJWTSecret(): string {
  return keyManager.getCurrentKey("jwt");
}

/**
 * Get API key
 */
export function getApiKey(): string {
  return keyManager.getCurrentKey("api");
}

/**
 * Check key strength
 */
export function validateAllKeys(): { [key: string]: boolean } {
  const results: { [key: string]: boolean } = {};

  for (const [type, keyInfo] of keyManager.getAllKeyStatus()) {
    results[type] = keyManager.validateKeyStrength(keyInfo.current);
  }

  return results;
}
