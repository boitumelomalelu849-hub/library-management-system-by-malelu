// Security helpers: password hashing (Web Crypto), input cleaning, validation, login lockout.
// Everything here is built into the browser, so no extra libraries are needed.
import { KEYS, read, write } from './storage';

const encoder = new TextEncoder();
const PBKDF2_ITERATIONS = 100000;

const toHex = (buffer) =>
  [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');

const fromHex = (hex) =>
  new Uint8Array(hex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));

export const randomSalt = () => toHex(crypto.getRandomValues(new Uint8Array(16)));

// Hash a password (or security answer) with PBKDF2 + a unique random salt.
export async function hashSecret(secret, salt = randomSalt()) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), 'PBKDF2', false, [
    'deriveBits',
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: fromHex(salt), iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    key,
    256
  );
  return { hash: toHex(bits), salt };
}

// Constant-time string comparison.
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function verifySecret(secret, salt, expectedHash) {
  const { hash } = await hashSecret(secret, salt);
  return safeEqual(hash, expectedHash);
}

export const normaliseAnswer = (answer) => String(answer ?? '').trim().toLowerCase();

// ---------- Input cleaning and validation ----------

// Trim, collapse whitespace, remove angle brackets, and cap the length.
export const clean = (value, max = 100) =>
  String(value ?? '')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);

export const validateName = (v) =>
  v.length < 2 ? 'Enter a name of at least 2 characters.' : '';

export const validateUsername = (v) =>
  /^[A-Za-z0-9_]{3,20}$/.test(v) ? '' : 'Use 3 to 20 letters, numbers or underscores.';

export const validateEmail = (v) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Enter a valid email address.';

export function validatePassword(v) {
  if (typeof v !== 'string' || v.length < 8) return 'Use at least 8 characters.';
  if (v.length > 64) return 'Use 64 characters or fewer.';
  if (!/[A-Za-z]/.test(v) || !/\d/.test(v)) return 'Include at least one letter and one number.';
  return '';
}

export const SECURITY_QUESTIONS = [
  'What was the name of your first school?',
  'What is your favourite colour?',
  'What was the name of your first pet?',
  'In which town was your mother born?',
];

// ---------- Brute-force protection (per account, stored in Local Storage) ----------

const MAX_ATTEMPTS = 5;
const LOCK_MS = 2 * 60 * 1000;

export function lockRemaining(key) {
  const entry = read(KEYS.attempts, {})[key];
  if (entry && entry.lockedUntil && entry.lockedUntil > Date.now()) {
    return entry.lockedUntil - Date.now();
  }
  return 0;
}

export function recordFailure(key) {
  const all = read(KEYS.attempts, {});
  const entry = all[key] || { count: 0, lockedUntil: 0 };
  const expired = entry.lockedUntil && entry.lockedUntil <= Date.now();
  const count = (expired ? 0 : entry.count) + 1;
  all[key] = { count, lockedUntil: count >= MAX_ATTEMPTS ? Date.now() + LOCK_MS : 0 };
  write(KEYS.attempts, all);
}

export function clearFailures(key) {
  const all = read(KEYS.attempts, {});
  delete all[key];
  write(KEYS.attempts, all);
}

export const lockMessage = (ms) =>
  `Too many failed attempts. Try again in ${Math.ceil(ms / 1000)} seconds.`;
