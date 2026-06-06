import {
  secureRandomBytes,
  randomInt,
  randomString,
  bytesToHex,
  bytesToBase64,
  secureUUID,
} from "./crypto";
import { WORDLIST } from "./wordlist";

// Character sets
const ALPHABET_LOWER = "abcdefghijklmnopqrstuvwxyz";
const ALPHABET_UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const ALPHABET_DIGITS = "0123456789";
const ALPHABET_SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";
const ALPHABET_WIFI_SYMBOLS = "_-.*!@#$%^&+=";
const ALPHABET_DJANGO = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*(-_=+)";

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
      { id: "wordCount", label: "Nombre de mots", type: "number", defaultValue: 3, min: 2, max: 10 },
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
    badge: (s) => `${s.wordCount} mots / ~${Math.round((s.wordCount as number) * 8.23)} bits`,
    generate: (s) => {
      const words = [];
      const count = s.wordCount as number;
      for (let i = 0; i < count; i++) {
        words.push(WORDLIST[randomInt(WORDLIST.length)]);
      }
      return words.join(s.separator as string);
    },
  },
  {
    id: "password",
    name: "Mot de passe robuste",
    description: "Mot de passe aléatoire hautement sécurisé pour les comptes critiques.",
    count: 4,
    settings: [
      { id: "length", label: "Longueur", type: "number", defaultValue: 16, min: 8, max: 128 },
      { id: "uppercase", label: "Majuscules (A-Z)", type: "boolean", defaultValue: true },
      { id: "lowercase", label: "Minuscules (a-z)", type: "boolean", defaultValue: true },
      { id: "numbers", label: "Chiffres (0-9)", type: "boolean", defaultValue: true },
      { id: "symbols", label: "Symboles (!@#$)", type: "boolean", defaultValue: true },
    ],
    badge: (s) => {
      const charCount =
        (s.uppercase ? 26 : 0) +
        (s.lowercase ? 26 : 0) +
        (s.numbers ? 10 : 0) +
        (s.symbols ? 26 : 0) || 1;
      return `${s.length} car. / ~${Math.round((s.length as number) * Math.log2(charCount))} bits`;
    },
    generate: (s) => {
      let alphabet = "";
      if (s.uppercase) alphabet += ALPHABET_UPPER;
      if (s.lowercase) alphabet += ALPHABET_LOWER;
      if (s.numbers) alphabet += ALPHABET_DIGITS;
      if (s.symbols) alphabet += ALPHABET_SYMBOLS;
      if (!alphabet) alphabet = ALPHABET_LOWER; // fallback
      return randomString(s.length as number, alphabet);
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
    badge: (s) => `${s.length} car. / ~${Math.round((s.length as number) * 5.95)} bits`,
    generate: (s) => randomString(s.length as number, ALPHABET_LOWER + ALPHABET_UPPER + ALPHABET_DIGITS),
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
    badge: (s) => `${s.prefix} + ${s.length} car.`,
    generate: (s) => `${s.prefix as string}${randomString(s.length as number, ALPHABET_LOWER + ALPHABET_UPPER + ALPHABET_DIGITS)}`,
  },
  {
    id: "hex-key",
    name: "Clé Hexadécimale",
    description: "Représentation hexadécimale, couramment utilisée pour les clés AES.",
    count: 4,
    settings: [
      { id: "bytes", label: "Octets (Bytes)", type: "number", defaultValue: 16, min: 8, max: 128 },
    ],
    badge: (s) => `${s.bytes} octets / ${(s.bytes as number) * 8} bits`,
    generate: (s) => bytesToHex(secureRandomBytes(s.bytes as number)),
  },
  {
    id: "jwt-secret",
    name: "Secret JWT",
    description: "Secret aléatoire encodé en Base64 standard.",
    count: 4,
    settings: [
      { id: "bytes", label: "Octets avant encodage", type: "number", defaultValue: 32, min: 16, max: 128 },
    ],
    badge: (s) => `${s.bytes} octets / ${(s.bytes as number) * 8} bits`,
    generate: (s) => bytesToBase64(secureRandomBytes(s.bytes as number)),
  },
  {
    id: "django-secret-key",
    name: "Clé secrète Django",
    description: "Clé aléatoire utilisant les caractères compatibles avec settings.py.",
    count: 3,
    settings: [
      { id: "length", label: "Longueur", type: "number", defaultValue: 50, min: 32, max: 128 },
    ],
    badge: (s) => `${s.length} car. / ~${Math.round((s.length as number) * 6.24)} bits`,
    generate: (s) => randomString(s.length as number, ALPHABET_DJANGO),
  },
  {
    id: "mongodb-objectid",
    name: "ObjectId MongoDB",
    description: "Identifiant hexadécimal de 12 octets avec un horodatage valide de 4 octets et 8 octets aléatoires sécurisés.",
    count: 4,
    settings: [],
    badge: () => `12 octets / 96 bits`,
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
    badge: (s) => `${s.length} car. / ~${Math.round((s.length as number) * 6.22)} bits`,
    generate: (s) =>
      randomString(
        s.length as number,
        ALPHABET_LOWER + ALPHABET_UPPER + ALPHABET_DIGITS + ALPHABET_WIFI_SYMBOLS
      ),
  },
];
