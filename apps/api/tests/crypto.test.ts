import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  hashPassword,
  verifyPassword,
  generateToken,
  sha256Hex,
} from '../src/security/crypto';

describe('Security & Crypto Utilities', () => {
  it('correctly hashes and verifies passwords using PBKDF2 Web Crypto', async () => {
    const password = 'SuperSecretDevPassword2026!';
    const hash = await hashPassword(password);

    assert.ok(hash.startsWith('pbkdf2:100000:'), 'Hash format must start with pbkdf2:100000:');

    const isValid = await verifyPassword(password, hash);
    assert.strictEqual(isValid, true, 'Correct password must verify successfully');

    const isInvalid = await verifyPassword('WrongPassword123', hash);
    assert.strictEqual(isInvalid, false, 'Wrong password must be rejected');
  });

  it('generates cryptographically random tokens with custom prefixes', () => {
    const token1 = generateToken('whistle_hb');
    const token2 = generateToken('whistle_hb');

    assert.ok(token1.startsWith('whistle_hb_'), 'Token should have proper prefix');
    assert.notStrictEqual(token1, token2, 'Generated tokens must be unique');
    assert.ok(token1.length > 30, 'Token must have high entropy');
  });

  it('computes consistent deterministic SHA-256 hashes', async () => {
    const input = 'whistle_hb_1234567890abcdef';
    const hash1 = await sha256Hex(input);
    const hash2 = await sha256Hex(input);

    assert.strictEqual(hash1, hash2, 'SHA-256 hash must be deterministic');
    assert.strictEqual(hash1.length, 64, 'SHA-256 hex string must be 64 characters long');
  });
});

