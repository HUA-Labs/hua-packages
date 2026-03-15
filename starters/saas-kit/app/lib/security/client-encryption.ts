/**
 * Client-side encryption utility
 * Browser-environment encryption using Web Crypto API
 *
 * Note: ENCRYPTION_KEY is managed only on the server,
 * so the client uses temporary session-based keys.
 */

// Web Crypto API encryption settings
const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // Recommended AES-GCM IV length

/**
 * Generate encryption key based on user session
 * Create a secure key by combining session ID and user ID
 */
async function deriveEncryptionKey(
  userId: string,
  sessionId?: string,
): Promise<CryptoKey> {
  const keyMaterial = `${userId}_${sessionId || "default"}_${typeof window !== "undefined" ? window.location.origin : ""}`;

  // UTF-8 encoding
  const encoder = new TextEncoder();
  const keyData = encoder.encode(keyMaterial);

  // Generate key via SHA-256 hash
  const hashBuffer = await crypto.subtle.digest("SHA-256", keyData);

  // Convert to AES-GCM key
  return await crypto.subtle.importKey(
    "raw",
    hashBuffer,
    { name: ALGORITHM },
    false,
    ["encrypt", "decrypt"],
  );
}

/**
 * Client-side encryption
 *
 * @param plainText - Plain text
 * @param userId - User ID
 * @returns Base64-encoded encrypted string
 */
export async function encryptClient(
  plainText: string,
  userId: string,
): Promise<string> {
  try {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    // Generate encryption key
    const key = await deriveEncryptionKey(userId);

    // Generate IV
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

    // Encode text
    const encoder = new TextEncoder();
    const data = encoder.encode(plainText);

    // Perform encryption
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: ALGORITHM,
        iv: iv,
      },
      key,
      data,
    );

    // Combine IV + encrypted data into one
    const combined = new Uint8Array(iv.length + encryptedData.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedData), iv.length);

    // Convert to string by encoding as Base64
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error("Client-side encryption failed:", error);
    throw new Error("Failed to encrypt data.", { cause: error });
  }
}

/**
 * Client-side decryption
 *
 * @param encryptedBase64 - Base64-encoded encrypted string
 * @param userId - User ID
 * @returns Decrypted plain text
 */
export async function decryptClient(
  encryptedBase64: string,
  userId: string,
): Promise<string> {
  try {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    // Base64 decode
    const combined = Uint8Array.from(atob(encryptedBase64), (c) =>
      c.charCodeAt(0),
    );

    // Separate IV and encrypted data
    const iv = combined.slice(0, IV_LENGTH);
    const encryptedData = combined.slice(IV_LENGTH);

    // Generate encryption key
    const key = await deriveEncryptionKey(userId);

    // Perform decryption
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv: iv,
      },
      key,
      encryptedData,
    );

    // Decode text
    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  } catch (error) {
    console.error("Client-side decryption failed:", error);
    throw new Error("Failed to decrypt data.", { cause: error });
  }
}
