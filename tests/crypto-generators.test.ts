import test from "node:test";
import assert from "node:assert/strict";
import {
  secureRandomBytes,
  randomInt,
  randomString,
  shuffleString,
  bytesToHex,
  bytesToBase64,
  secureUUID,
} from "../lib/crypto.ts";
import {
  GENERATORS,
  ALPHABET_LOWER,
  ALPHABET_UPPER,
  ALPHABET_DIGITS,
  ALPHABET_SYMBOLS,
} from "../lib/generators.ts";
import { WORDLIST } from "../lib/wordlist.ts";

test("lib/crypto - secureRandomBytes returns Uint8Array of requested length", () => {
  const bytes0 = secureRandomBytes(0);
  assert.equal(bytes0.length, 0);

  const bytes32 = secureRandomBytes(32);
  assert.equal(bytes32.length, 32);
  assert.ok(bytes32.some((b) => b !== 0), "Expected non-zero random bytes");

  assert.throws(() => secureRandomBytes(-1));
  assert.throws(() => secureRandomBytes(1.5));
});

test("lib/crypto - randomInt stays within bounds [0, max - 1]", () => {
  assert.equal(randomInt(1), 0);
  for (let i = 0; i < 200; i++) {
    const val = randomInt(7);
    assert.ok(Number.isInteger(val));
    assert.ok(val >= 0 && val < 7);
  }
  assert.throws(() => randomInt(0));
  assert.throws(() => randomInt(-5));
});

test("lib/crypto - randomString and shuffleString preserve character sets and length", () => {
  const s = randomString(64, "ABC");
  assert.equal(s.length, 64);
  for (const ch of s) {
    assert.ok("ABC".includes(ch));
  }
  assert.equal(randomString(0, "ABC"), "");
  assert.throws(() => randomString(10, ""));

  const original = "Aa1!Bb2@Cc3#";
  const shuffled = shuffleString(original);
  assert.equal(shuffled.length, original.length);
  assert.equal(
    Array.from(shuffled).sort().join(""),
    Array.from(original).sort().join("")
  );
});

test("lib/crypto - bytesToHex, bytesToBase64, and secureUUID format", () => {
  const sample = new Uint8Array([0x00, 0x0f, 0xff, 0xa5]);
  assert.equal(bytesToHex(sample), "000fffa5");
  assert.equal(bytesToBase64(new Uint8Array([71, 101, 110])), "R2Vu");

  const uuid = secureUUID();
  assert.match(
    uuid,
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
  );
});

test("lib/generators - password generator guarantees every enabled character class", () => {
  const pwdGen = GENERATORS.find((g) => g.id === "password");
  assert.ok(pwdGen);

  for (let i = 0; i < 50; i++) {
    const pwd = pwdGen.generate({
      length: 12,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
    });
    assert.equal(pwd.length, 12);
    assert.ok(Array.from(pwd).some((c) => ALPHABET_UPPER.includes(c)), "Missing uppercase");
    assert.ok(Array.from(pwd).some((c) => ALPHABET_LOWER.includes(c)), "Missing lowercase");
    assert.ok(Array.from(pwd).some((c) => ALPHABET_DIGITS.includes(c)), "Missing digit");
    assert.ok(Array.from(pwd).some((c) => ALPHABET_SYMBOLS.includes(c)), "Missing symbol");
  }

  // Fallback when all classes are false
  const fallbackPwd = pwdGen.generate({
    length: 10,
    uppercase: false,
    lowercase: false,
    numbers: false,
    symbols: false,
  });
  assert.equal(fallbackPwd.length, 10);
  assert.ok(Array.from(fallbackPwd).every((c) => ALPHABET_LOWER.includes(c)));
  assert.match(
    pwdGen.badge({
      length: 10,
      uppercase: false,
      lowercase: false,
      numbers: false,
      symbols: false,
    }),
    /10 car\. \/ ~47 bits/
  );
});

test("lib/generators - all 10 generators produce valid outputs and badges", () => {
  assert.equal(GENERATORS.length, 10);
  assert.equal(WORDLIST.length, 330);

  for (const gen of GENERATORS) {
    const defaults: Record<string, string | number | boolean> = {};
    for (const setting of gen.settings) {
      defaults[setting.id] = setting.defaultValue;
    }

    const badge = gen.badge(defaults);
    assert.ok(badge.length > 0, `Empty badge for ${gen.id}`);

    const value = gen.generate(defaults);
    assert.ok(value.length > 0, `Empty output for ${gen.id}`);

    if (gen.id === "mongodb-objectid") {
      assert.match(value, /^[0-9a-f]{24}$/);
      assert.equal(badge, "12 octets / 64 bits aléa");
    }
    if (gen.id === "hex-key") {
      assert.match(value, /^[0-9a-f]{32}$/);
    }
    if (gen.id === "api-key") {
      assert.ok(value.startsWith("sk_live_"));
      assert.equal(value.length, "sk_live_".length + 32);
    }
  }
});
