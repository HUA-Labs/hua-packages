/**
 * User data encryption/decryption utility
 *
 * Safely decrypts encrypted fields of user personal information.
 * Uses KMS Envelope Encryption.
 */

import { decryptUserData } from "./encryption";

/**
 * Minimum fields required by decryptUser
 */
export interface EncryptedUserInput {
  id: string;
  email_enc?: Buffer | Uint8Array | null;
  nickname_enc?: Buffer | Uint8Array | null;
  profile_image?: string | null;
  state?: string;
  role?: string;
  created_at?: Date;
  updated_at?: Date;
  image?: string | null;
}

/**
 * User data decryption result type
 */
export interface DecryptedUser {
  id: string;
  email: string | null;
  nickname: string | null;
  profile_image: string | null;
  state: string;
  role: string;
  created_at: Date;
  updated_at: Date;
  image: string | null;
}

/**
 * Decrypt and return user data (async - uses KMS)
 *
 * @param user - Prisma User object (with encrypted fields)
 * @returns Decrypted user data
 */
export async function decryptUser(
  user: EncryptedUserInput,
): Promise<DecryptedUser> {
  // Helper to convert Uint8Array from Prisma to Buffer
  const toBuffer = (
    data: Buffer | Uint8Array | null | undefined,
  ): Buffer | null => {
    if (!data) return null;
    return Buffer.isBuffer(data) ? data : Buffer.from(data);
  };

  try {
    const emailBuffer = toBuffer(user.email_enc);
    const decryptedEmail = emailBuffer
      ? await decryptUserData(emailBuffer)
      : null;

    const nicknameBuffer = toBuffer(user.nickname_enc);
    const decryptedNickname = nicknameBuffer
      ? await decryptUserData(nicknameBuffer)
      : null;

    return {
      id: user.id,
      email: decryptedEmail,
      nickname: decryptedNickname,
      profile_image: user.profile_image ?? null,
      state: user.state ?? "ACTIVE",
      role: user.role ?? "USER",
      created_at: user.created_at ?? new Date(),
      updated_at: user.updated_at ?? new Date(),
      image: user.image ?? null,
    };
  } catch (error) {
    console.error("Failed to decrypt user data:", error);

    return {
      id: user.id,
      email: null,
      nickname: null,
      profile_image: user.profile_image ?? null,
      state: user.state ?? "ACTIVE",
      role: user.role ?? "USER",
      created_at: user.created_at ?? new Date(),
      updated_at: user.updated_at ?? new Date(),
      image: user.image ?? null,
    };
  }
}

/**
 * Decrypt and return user list (async - uses KMS)
 *
 * @param users - Array of Prisma User objects
 * @returns Array of decrypted user data
 */
export async function decryptUsers(
  users: EncryptedUserInput[],
): Promise<DecryptedUser[]> {
  return Promise.all(users.map(decryptUser));
}

/**
 * Check encryption status of user data
 *
 * @param user - Prisma User object
 * @returns Encryption status info
 */
export function getUserEncryptionStatus(user: EncryptedUserInput): {
  hasEncryptedEmail: boolean;
  hasEncryptedNickname: boolean;
  isFullyEncrypted: boolean;
} {
  return {
    hasEncryptedEmail: !!user.email_enc,
    hasEncryptedNickname: !!user.nickname_enc,
    isFullyEncrypted: !!(user.email_enc && user.nickname_enc),
  };
}

/**
 * Check user data migration status
 *
 * @param user - Prisma User object
 * @returns Migration status
 */
export function getUserMigrationStatus(user: EncryptedUserInput): {
  needsMigration: boolean;
  missingFields: string[];
  migrationProgress: number; // 0-100%
} {
  const status = getUserEncryptionStatus(user);
  const missingFields: string[] = [];

  if (!status.hasEncryptedEmail) missingFields.push("email");
  if (!status.hasEncryptedNickname) missingFields.push("nickname");

  const totalFields = 2;
  const encryptedFields = totalFields - missingFields.length;
  const migrationProgress = Math.round((encryptedFields / totalFields) * 100);

  return {
    needsMigration: missingFields.length > 0,
    missingFields,
    migrationProgress,
  };
}
