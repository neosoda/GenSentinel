import {
  secureRandomBytes,
  randomInt,
  randomString,
  shuffleString,
  bytesToHex,
  bytesToBase64,
  secureUUID,
} from "./crypto.ts";
import { WORDLIST } from "./wordlist.ts";

// Character sets
export const ALPHABET_LOWER = "abcdefghijklmnopqrstuvwxyz";
export const ALPHABET_UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const ALPHABET_DIGITS = "0123456789";
export const ALPHABET_SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";
export const ALPHABET_WIFI_SYMBOLS = "_-.*!@#$%^&+=";
export const ALPHABET_DJANGO = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*(-_=+)";
const ALPHABET_ALPHANUMERIC = ALPHABET_LOWER + ALPHABET_UPPER + ALPHABET_DIGITS;
const ALPHABET_WIFI = ALPHABET_ALPHANUMERIC + ALPHABET_WIFI_SYMBOLS;

export type GeneratorSettingType = "number" | "text" | "boolean" | "select";
export type GeneratorSettingValue = string | number | boolean;

export interface GeneratorSettingOption {
  value: string;
  label: string;
}

export interface GeneratorSetting {
  id: string;
  label: string;
  type: GeneratorSettingType;
  defaultValue: GeneratorSettingValue;
  min?: number;
  max?: number;
  options?: GeneratorSettingOption[];
}

export interface GeneratorDefinition {
  id: string;
  name: string;
  description: string;
  badge: (settings: Record<string, GeneratorSettingValue>) => string;
  count: number;
  settings: GeneratorSetting[];
  generate: (settings: Record<string, GeneratorSettingValue>) => string;
}

export const GENERATORS: GeneratorDefinition[] = [
  {
    id: "memorable-passphrase",
    name: "Phrases secrètes mémorisables",
    description: "Mots de passe faciles à retenir combinant des mots simples.",
    count: 4,
    settings: [
      { id: "wordCount", label: "Nombre de mots", type: "number", defaultValue: 4, min: 2, max: 10 },
      {
        id: "separator",
        label: "Séparateur",
        type: "select",
        defaultValue: "-",
        options: [
          { value: "-", label: "Tiret (-)" },
          { value: "_", label: "Tiret bas (_)" },
          { value: ".", label: "Point (.)" },
          { value: " ", label: "Espace" },
          { value: "", label: "Aucun" },
        ],
      },
    ],
    badge: (s) => {
      const count = (s.wordCount as number) ?? 4;
      const bits = Math.round(count * Math.log2(WORDLIST.length));
      return `${count} mots / ~${bits} bits`;
    },
    generate: (s) => {
      const words: string[] = [];
      const count = (s.wordCount as number) ?? 4;
      const sep = (s.separator as string) ?? "-";
      for (let i = 0; i < count; i++) {
        words.push(WORDLIST[randomInt(WORDLIST.length)]);
      }
      return words.join(sep);
    },
  },
  {
    id: "password",
    name: "Mot de passe robuste",
    description: "Mot de passe aléatoire hautement sécurisé garantissant chaque classe sélectionnée.",
    count: 4,
    settings: [
      { id: "length", label: "Longueur", type: "number", defaultValue: 16, min: 8, max: 128 },
      { id: "uppercase", label: "Majuscules (A-Z)", type: "boolean", defaultValue: true },
      { id: "lowercase", label: "Minuscules (a-z)", type: "boolean", defaultValue: true },
      { id: "numbers", label: "Chiffres (0-9)", type: "boolean", defaultValue: true },
      { id: "symbols", label: "Symboles (!@#$)", type: "boolean", defaultValue: true },
    ],
    badge: (s) => {
      const length = (s.length as number) ?? 16;
      const charCount =
        (s.uppercase ? ALPHABET_UPPER.length : 0) +
        (s.lowercase ? ALPHABET_LOWER.length : 0) +
        (s.numbers ? ALPHABET_DIGITS.length : 0) +
        (s.symbols ? ALPHABET_SYMBOLS.length : 0) || ALPHABET_LOWER.length;
      return `${length} car. / ~${Math.round(length * Math.log2(charCount))} bits`;
    },
    generate: (s) => {
      const length = (s.length as number) ?? 16;
      const pools: string[] = [];
      if (s.uppercase) pools.push(ALPHABET_UPPER);
      if (s.lowercase) pools.push(ALPHABET_LOWER);
      if (s.numbers) pools.push(ALPHABET_DIGITS);
      if (s.symbols) pools.push(ALPHABET_SYMBOLS);
      if (pools.length === 0) pools.push(ALPHABET_LOWER);

      const fullAlphabet = pools.join("");
      const requiredChars = pools
        .slice(0, length)
        .map((pool) => pool[randomInt(pool.length)])
        .join("");
      const remainingLength = Math.max(0, length - requiredChars.length);
      const remainingChars = randomString(remainingLength, fullAlphabet);
      return shuffleString(requiredChars + remainingChars);
    },
  },
  {
    id: "alphanumeric-token",
    name: "Jeton alphanumérique",
    description: "Clé aléatoire contenant uniquement des lettres et des chiffres, évitant les conflits de symboles.",
    count: 4,
    settings: [
      { id: "length", label: "Longueur", type: "number", defaultValue: 32, min: 8, max: 256 },
    ],
    badge: (s) => {
      const length = (s.length as number) ?? 32;
      return `${length} car. / ~${Math.round(length * Math.log2(ALPHABET_ALPHANUMERIC.length))} bits`;
    },
    generate: (s) => randomString((s.length as number) ?? 32, ALPHABET_ALPHANUMERIC),
  },
  {
    id: "uuid-v4",
    name: "UUID v4",
    description: "Identifiant Unique Universel (128-bit), idéal pour les clés primaires de bases de données.",
    count: 4,
    settings: [],
    badge: () => `UUIDv4 / 122 bits`,
    generate: () => secureUUID(),
  },
  {
    id: "api-key",
    name: "Clés d'API",
    description: "Format standard de clé d'API utilisant un préfixe lisible.",
    count: 4,
    settings: [
      { id: "prefix", label: "Préfixe", type: "text", defaultValue: "sk_live_" },
      { id: "length", label: "Longueur aléatoire", type: "number", defaultValue: 32, min: 16, max: 128 },
    ],
    badge: (s) => {
      const length = (s.length as number) ?? 32;
      const prefix = (s.prefix as string) ?? "sk_live_";
      return `${prefix} + ${length} car.`;
    },
    generate: (s) => {
      const prefix = (s.prefix as string) ?? "sk_live_";
      const length = (s.length as number) ?? 32;
      return `${prefix}${randomString(length, ALPHABET_ALPHANUMERIC)}`;
    },
  },
  {
    id: "hex-key",
    name: "Clé Hexadécimale",
    description: "Représentation hexadécimale, couramment utilisée pour les clés AES.",
    count: 4,
    settings: [
      { id: "bytes", label: "Octets (Bytes)", type: "number", defaultValue: 16, min: 8, max: 128 },
    ],
    badge: (s) => {
      const bytes = (s.bytes as number) ?? 16;
      return `${bytes} octets / ${bytes * 8} bits`;
    },
    generate: (s) => bytesToHex(secureRandomBytes((s.bytes as number) ?? 16)),
  },
  {
    id: "jwt-secret",
    name: "Secret JWT",
    description: "Secret aléatoire encodé en Base64 standard.",
    count: 4,
    settings: [
      { id: "bytes", label: "Octets avant encodage", type: "number", defaultValue: 32, min: 16, max: 128 },
    ],
    badge: (s) => {
      const bytes = (s.bytes as number) ?? 32;
      return `${bytes} octets / ${bytes * 8} bits`;
    },
    generate: (s) => bytesToBase64(secureRandomBytes((s.bytes as number) ?? 32)),
  },
  {
    id: "django-secret-key",
    name: "Clé secrète Django",
    description: "Clé aléatoire utilisant les caractères compatibles avec settings.py.",
    count: 3,
    settings: [
      { id: "length", label: "Longueur", type: "number", defaultValue: 50, min: 32, max: 128 },
    ],
    badge: (s) => {
      const length = (s.length as number) ?? 50;
      return `${length} car. / ~${Math.round(length * Math.log2(ALPHABET_DJANGO.length))} bits`;
    },
    generate: (s) => randomString((s.length as number) ?? 50, ALPHABET_DJANGO),
  },
  {
    id: "mongodb-objectid",
    name: "ObjectId MongoDB",
    description: "Identifiant hexadécimal de 12 octets avec un horodatage valide de 4 octets et 8 octets aléatoires sécurisés.",
    count: 4,
    settings: [],
    badge: () => `12 octets / 64 bits aléa`,
    generate: () => {
      const timestamp = Math.floor(Date.now() / 1000);
      const tsBytes = new Uint8Array(4);
      tsBytes[0] = (timestamp >> 24) & 0xff;
      tsBytes[1] = (timestamp >> 16) & 0xff;
      tsBytes[2] = (timestamp >> 8) & 0xff;
      tsBytes[3] = timestamp & 0xff;
      const randBytes = secureRandomBytes(8);
      const totalBytes = new Uint8Array(12);
      totalBytes.set(tsBytes, 0);
      totalBytes.set(randBytes, 4);
      return bytesToHex(totalBytes);
    },
  },
  {
    id: "wifi-password",
    name: "Mot de passe WiFi / WPA",
    description: "Clé sécurisée utilisant des symboles compatibles avec la plupart des routeurs.",
    count: 3,
    settings: [
      { id: "length", label: "Longueur", type: "number", defaultValue: 20, min: 8, max: 63 },
    ],
    badge: (s) => {
      const length = (s.length as number) ?? 20;
      return `${length} car. / ~${Math.round(length * Math.log2(ALPHABET_WIFI.length))} bits`;
    },
    generate: (s) => randomString((s.length as number) ?? 20, ALPHABET_WIFI),
  },
];
