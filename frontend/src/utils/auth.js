// Authentication: login, registration and password reset (all against Local Storage).
import { KEYS, read, write, newId } from './storage';
import {
  hashSecret,
  verifySecret,
  normaliseAnswer,
  clean,
  validateName,
  validateUsername,
  validateEmail,
  validatePassword,
  SECURITY_QUESTIONS,
  lockRemaining,
  lockMessage,
  recordFailure,
  clearFailures,
} from './security';

export const homeFor = (user) => (user?.role === 'admin' ? '/admin' : '/dashboard');

const findByUsername = (users, username) =>
  users.find((u) => u.username.toLowerCase() === username.toLowerCase());

export function nextMembershipId(users) {
  const max = users.reduce((m, u) => {
    const n = /^LIB-(\d+)$/.exec(u.membershipId);
    return n ? Math.max(m, Number(n[1])) : m;
  }, 0);
  return `LIB-${String(max + 1).padStart(4, '0')}`;
}

// Verify credentials AND the chosen role. Errors are deliberately generic so an attacker
// cannot tell whether the username, password or role was wrong.
export async function loginUser({ username, password, role }) {
  const name = clean(username, 20);
  const key = `login:${name.toLowerCase()}`;
  const locked = lockRemaining(key);
  if (locked) return { ok: false, error: lockMessage(locked) };

  const user = findByUsername(read(KEYS.users, []), name);
  let valid = false;
  if (user) {
    valid = await verifySecret(String(password), user.salt, user.passwordHash);
  } else {
    await hashSecret(String(password)); // keep timing similar when the user does not exist
  }

  if (!valid || user.role !== role) {
    recordFailure(key);
    return { ok: false, error: 'Invalid username, password or role.' };
  }
  clearFailures(key);
  return { ok: true, user };
}

export async function registerUser(form) {
  const values = {
    name: clean(form.name, 60),
    username: clean(form.username, 20),
    email: clean(form.email, 100).toLowerCase(),
    question: form.question,
    answer: normaliseAnswer(clean(form.answer, 60)),
  };
  const errors = {
    name: validateName(values.name),
    username: validateUsername(values.username),
    email: validateEmail(values.email),
    password: validatePassword(form.password),
    confirm: form.password === form.confirm ? '' : 'Passwords do not match.',
    question: SECURITY_QUESTIONS.includes(values.question) ? '' : 'Choose a security question.',
    answer: values.answer.length < 2 ? 'Enter an answer of at least 2 characters.' : '',
  };

  const users = read(KEYS.users, []);
  if (!errors.username && findByUsername(users, values.username)) {
    errors.username = 'That username is already taken.';
  }
  if (!errors.email && users.some((u) => u.email === values.email)) {
    errors.email = 'An account with this email already exists.';
  }
  if (Object.values(errors).some(Boolean)) return { ok: false, errors };

  const pw = await hashSecret(form.password);
  const ans = await hashSecret(values.answer);
  const latest = read(KEYS.users, []);
  write(KEYS.users, [
    ...latest,
    {
      id: newId('user'),
      name: values.name,
      username: values.username,
      email: values.email,
      membershipId: nextMembershipId(latest),
      role: 'user', // self-registration can only ever create a standard user
      passwordHash: pw.hash,
      salt: pw.salt,
      question: values.question,
      answerHash: ans.hash,
      answerSalt: ans.salt,
      createdAt: new Date().toISOString(),
    },
  ]);
  return { ok: true };
}

// ---------- Password reset (security question) ----------

// Unknown usernames get a stable decoy question so the form does not reveal who has an account.
export function getResetQuestion(username) {
  const name = clean(username, 20);
  const user = findByUsername(read(KEYS.users, []), name);
  if (user && user.role === 'admin') {
    return { ok: false, error: 'Administrator passwords cannot be reset here.' };
  }
  if (user && user.question) return { ok: true, question: user.question };
  const seed = [...name.toLowerCase()].reduce((s, c) => s + c.charCodeAt(0), 0);
  return { ok: true, question: SECURITY_QUESTIONS[seed % SECURITY_QUESTIONS.length] };
}

export async function resetPassword({ username, answer, password, confirm }) {
  const name = clean(username, 20);
  const key = `reset:${name.toLowerCase()}`;
  const locked = lockRemaining(key);
  if (locked) return { ok: false, error: lockMessage(locked) };

  const errors = {
    password: validatePassword(password),
    confirm: password === confirm ? '' : 'Passwords do not match.',
    answer: normaliseAnswer(answer).length < 1 ? 'Enter your answer.' : '',
  };
  if (Object.values(errors).some(Boolean)) return { ok: false, errors };

  const users = read(KEYS.users, []);
  const user = findByUsername(users, name);
  const eligible = user && user.role !== 'admin' && user.answerHash;
  const correct = eligible
    ? await verifySecret(normaliseAnswer(answer), user.answerSalt, user.answerHash)
    : (await hashSecret(normaliseAnswer(answer)), false);

  if (!correct) {
    recordFailure(key);
    return { ok: false, error: 'The answer is incorrect, or this account cannot be reset here.' };
  }
  const pw = await hashSecret(password);
  write(
    KEYS.users,
    users.map((u) => (u.id === user.id ? { ...u, passwordHash: pw.hash, salt: pw.salt } : u))
  );
  clearFailures(key);
  clearFailures(`login:${name.toLowerCase()}`);
  return { ok: true };
}
