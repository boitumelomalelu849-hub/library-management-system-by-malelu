// Local Storage "database" plus first-run seed data.
import { hashSecret, normaliseAnswer } from './security';

export const KEYS = {
  users: 'lms_users',
  books: 'lms_books',
  transactions: 'lms_transactions',
  session: 'lms_session',
  attempts: 'lms_attempts',
};

export function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export const remove = (key) => localStorage.removeItem(key);

export const newId = (prefix) => `${prefix}_${crypto.randomUUID()}`;

// Never send password hashes, salts or security answers to the UI.
export function publicUser(user) {
  if (!user) return null;
  const { passwordHash, salt, answerHash, answerSalt, ...safe } = user;
  return { ...safe, canReset: Boolean(answerHash) };
}

const SEED_BOOKS = [
  ['Things Fall Apart', 'Chinua Achebe', 'Fiction', '9780385474542', 5],
  ['Long Walk to Freedom', 'Nelson Mandela', 'Biography', '9780316548182', 1],
  ['A Brief History of Time', 'Stephen Hawking', 'Science', '9780553380163', 3],
  ['The Alchemist', 'Paulo Coelho', 'Fiction', '9780062315007', 0],
  ['Clean Code', 'Robert C. Martin', 'Technology', '9780132350884', 4],
  ['Sapiens', 'Yuval Noah Harari', 'History', '9780062316097', 1],
].map(([title, author, genre, isbn, quantity], i) => ({
  id: `book_seed_${i + 1}`,
  title,
  author,
  genre,
  isbn,
  quantity,
  createdAt: new Date().toISOString(),
}));

export async function seedIfEmpty() {
  if (read(KEYS.users, null) === null) {
    const admin = await hashSecret('202601');
    const demo = await hashSecret('Demo1234');
    const demoAnswer = await hashSecret(normaliseAnswer('blue'));
    write(KEYS.users, [
      {
        id: 'user_admin',
        name: 'Head Librarian',
        username: 'Admin2026',
        email: 'admin@library.local',
        membershipId: 'ADMIN-001',
        role: 'admin',
        passwordHash: admin.hash,
        salt: admin.salt,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'user_demo',
        name: 'Demo Member',
        username: 'demo',
        email: 'demo@library.local',
        membershipId: 'LIB-0001',
        role: 'user',
        passwordHash: demo.hash,
        salt: demo.salt,
        question: 'What is your favourite colour?',
        answerHash: demoAnswer.hash,
        answerSalt: demoAnswer.salt,
        createdAt: new Date().toISOString(),
      },
    ]);
  }
  if (read(KEYS.books, null) === null) write(KEYS.books, SEED_BOOKS);
  if (read(KEYS.transactions, null) === null) write(KEYS.transactions, []);
}
