/**
 * Key Management System
 *
 * Environment variable based key management with rotation support.
 * Works without KMS — provides local key management.
 */

import crypto from 'crypto';

/**
 * Key type definition
 */
export type KeyType = 'encryption' | 'jwt' | 'api';

/**
 * Key info interface
 */
export interface KeyInfo {
  type: KeyType;
  current: string;
  previous?: string;
  createdAt: Date;
  expiresAt?: Date;
}

/**
 * KeyManager configuration
 */
export interface KeyManagerConfig {
  /** Check if KMS is enabled (optional, defaults to false) */
  isKMSEnabled?: () => boolean;
  /** Check if build time (optional) */
  isBuildTime?: boolean;
  /** Environment (optional, defaults to process.env.NODE_ENV) */
  nodeEnv?: string;
  /** Custom key sources (optional, overrides process.env) */
  keys?: {
    encryption?: string;
    jwt?: string;
    api?: string;
  };
}

/**
 * Key Manager class
 *
 * Manages encryption, JWT, and API keys with rotation support.
 */
export class KeyManager {
  private keys: Map<KeyType, KeyInfo> = new Map();

  constructor(config?: KeyManagerConfig) {
    this.initializeKeys(config);
  }

  private initializeKeys(config?: KeyManagerConfig): void {
    const isBuildTime = config?.isBuildTime ?? process.env.NEXT_PHASE === 'phase-production-build';
    const isProduction = (config?.nodeEnv ?? process.env.NODE_ENV) === 'production';
    const kmsEnabled = config?.isKMSEnabled?.() ?? false;

    // Encryption key
    const encryptionKey = config?.keys?.encryption ?? process.env.ENCRYPTION_KEY;
    if (isProduction && !isBuildTime && !encryptionKey && !kmsEnabled) {
      throw new Error(
        'ENCRYPTION_KEY environment variable is required in production (unless KMS is enabled).'
      );
    }
    this.keys.set('encryption', {
      type: 'encryption',
      current:
        encryptionKey ||
        (kmsEnabled ? 'KMS_MANAGED' : isBuildTime ? 'BUILD_PLACEHOLDER' : this.generateKey(32)),
      createdAt: new Date(),
    });

    // JWT secret
    const jwtSecret = config?.keys?.jwt ?? process.env.NEXTAUTH_SECRET;
    if (isProduction && !isBuildTime && !jwtSecret) {
      throw new Error(
        'NEXTAUTH_SECRET environment variable is required in production.'
      );
    }
    this.keys.set('jwt', {
      type: 'jwt',
      current: jwtSecret || (isBuildTime ? 'BUILD_PLACEHOLDER' : this.generateKey(32)),
      createdAt: new Date(),
    });

    // API key (optional)
    const apiKey = config?.keys?.api ?? process.env.HUA_API_KEY;
    this.keys.set('api', {
      type: 'api',
      current: apiKey || this.generateKey(16),
      createdAt: new Date(),
    });
  }

  private generateKey(length: number): string {
    return crypto.randomBytes(length).toString('base64');
  }

  /**
   * Get current key by type
   */
  public getCurrentKey(type: KeyType): string {
    const keyInfo = this.keys.get(type);
    if (!keyInfo) {
      throw new Error(`Key type ${type} not found`);
    }
    return keyInfo.current;
  }

  /**
   * Validate key strength
   */
  public validateKeyStrength(key: string, minLength: number = 32): boolean {
    if (key.length < minLength) return false;

    const uniqueChars = new Set(key).size;
    return uniqueChars > key.length * 0.5;
  }

  /**
   * Rotate key (generate new, store previous)
   */
  public rotateKey(type: KeyType): string {
    const keyInfo = this.keys.get(type);
    if (!keyInfo) {
      throw new Error(`Key type ${type} not found`);
    }

    keyInfo.previous = keyInfo.current;
    const newKey = this.generateKey(32);
    keyInfo.current = newKey;
    keyInfo.createdAt = new Date();

    return newKey;
  }

  /**
   * Get key status
   */
  public getKeyStatus(type: KeyType): KeyInfo | null {
    return this.keys.get(type) || null;
  }

  /**
   * Get all key statuses
   */
  public getAllKeyStatus(): Map<KeyType, KeyInfo> {
    const copy = new Map<KeyType, KeyInfo>();
    for (const [type, info] of this.keys) {
      copy.set(type, { ...info });
    }
    return copy;
  }
}
