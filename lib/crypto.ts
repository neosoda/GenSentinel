/**
 * Secure cryptographic helper functions for SecureKeyForge.
 * All functions use the client-side Web Crypto API.
 */

/**
 * Generates securely random bytes using the Web Crypto API.
 */
export function secureRandomBytes(length: number): Uint8Array {
  if (typeof window === "undefined" || !window.crypto) {
    throw new Error("Web Crypto API is only available in the browser context.");
  }
  const bytes = new Uint8Array(length);
  window.crypto.getRandomValues(bytes);
  return bytes;
}

/**
 * Returns a cryptographically secure random integer in [0, max - 1].
 * Uses rejection sampling to completely avoid modulo bias.
 * Supports max values up to 2^32.
 */
export function randomInt(max: number): number {
  if (max <= 0) {
    throw new Error("max must be greater than 0");
  }
  if (max === 1) {
    return 0;
  }

  if (typeof window === "undefined" || !window.crypto) {
    throw new Error("Web Crypto API is only available in the browser context.");
  }

  const range = max;
  const limit = 4294967296 - (4294967296 % range);
  const buffer = new Uint32Array(1);

  while (true) {
    window.crypto.getRandomValues(buffer);
    const val = buffer[0];
    if (val < limit) {
      return val % range;
    }
  }
}

/**
 * Generates a cryptographically secure random string of a given length
 * from a specific character set (alphabet).
 */
export function randomString(length: number, alphabet: string): string {
  if (!alphabet) {
    throw new Error("Alphabet cannot be empty.");
  }
  let result = "";
  const alphabetLength = alphabet.length;
  for (let i = 0; i < length; i++) {
    result += alphabet[randomInt(alphabetLength)];
  }
  return result;
}

/**
 * Converts a Uint8Array of bytes into its hex string representation.
 */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Converts a Uint8Array of bytes into its standard Base64 representation.
 */
export function bytesToBase64(bytes: Uint8Array): string {
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  return btoa(binary);
}

/**
 * Generates a cryptographically secure UUID v4.
 * Uses window.crypto.randomUUID if available, with a robust fallback.
 */
export function secureUUID(): string {
  if (typeof window !== "undefined" && window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  // Fallback using Web Crypto bytes
  const bytes = secureRandomBytes(16);
  
  // Set version to 4 (0100xxxx at byte 6)
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  // Set variant to RFC 4122 (10xxxxxx at byte 8)
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = bytesToHex(bytes);
  return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20, 32)}`;
}
