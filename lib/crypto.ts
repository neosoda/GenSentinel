/**
 * Secure cryptographic helper functions for GenSentinel.
 * All functions use the Web Crypto API (browser & Node.js 20+ compatible).
 */

function getCrypto(): Crypto {
  if (typeof globalThis !== "undefined" && globalThis.crypto && typeof globalThis.crypto.getRandomValues === "function") {
    return globalThis.crypto;
  }
  throw new Error("Web Crypto API is not available in the current environment.");
}

/**
 * Generates securely random bytes using the Web Crypto API.
 */
export function secureRandomBytes(length: number): Uint8Array {
  if (length < 0 || !Number.isInteger(length)) {
    throw new Error("length must be a non-negative integer");
  }
  const cryptoObj = getCrypto();
  const bytes = new Uint8Array(length);
  if (length > 0) {
    cryptoObj.getRandomValues(bytes);
  }
  return bytes;
}

/**
 * Returns a cryptographically secure random integer in [0, max - 1].
 * Uses rejection sampling to completely avoid modulo bias.
 * Supports max values up to 2^32.
 */
export function randomInt(max: number): number {
  if (max <= 0 || !Number.isInteger(max) || max > 0x100000000) {
    throw new Error("max must be an integer between 1 and 2^32");
  }
  if (max === 1) {
    return 0;
  }

  const cryptoObj = getCrypto();
  const range = max;
  const limit = 0x100000000 - (0x100000000 % range);
  const buffer = new Uint32Array(1);

  while (true) {
    cryptoObj.getRandomValues(buffer);
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
  if (length <= 0) {
    return "";
  }
  let result = "";
  const alphabetLength = alphabet.length;
  for (let i = 0; i < length; i++) {
    result += alphabet[randomInt(alphabetLength)];
  }
  return result;
}

/**
 * Uniformly shuffles a string using the Fisher-Yates algorithm and CSPRNG.
 */
export function shuffleString(input: string): string {
  const chars = Array.from(input);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    const temp = chars[i];
    chars[i] = chars[j];
    chars[j] = temp;
  }
  return chars.join("");
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
 * Uses crypto.randomUUID if available, with a robust RFC 4122 fallback.
 */
export function secureUUID(): string {
  const cryptoObj = getCrypto();
  if (typeof cryptoObj.randomUUID === "function") {
    return cryptoObj.randomUUID();
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
