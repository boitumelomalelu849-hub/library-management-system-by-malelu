// Books, transactions and users. Every write re-checks the caller against the stored users,
// so authorisation is enforced here as well as in the route guards.
import { KEYS, read, write, newId } from './storage';
import {
  clean,
  hashSecret,
  validateName,
  validateUsername,
  validateEmail,
  validatePassword,
} from './security';

export const LOW_STOCK_LIMIT = 2; // fewer than 2 copies counts as low stock
export const MAX_ACTIVE_BORROWS = 3; // max books a single member can have out at once

const fail = (error, errors) => ({ ok: false, error, errors });

function requireAdmin(actor) {
  const stored = read(KEYS.users, []).find((u) => u.id === actor?.id);
  if (!stored || stored.role !== 'admin') throw new Error('You are not authorised to do this.');
  return stored;
}

function requireUser(actor) {
  const stored = read(KEYS.users, []).find((u) => u.id === actor?.id);
  if (!stored) throw new Error('You must be signed in to do this.');
  return stored;
}

function guard(actor, fn) {
  try {
    requireAdmin(actor);
    return fn();
  } catch (e) {
    return fail(e.message);
  }
}

async function guardAsync(actor, fn) {
  try {
    requireAdmin(actor);
    return await fn();
  } catch (e) {
    return fail(e.message);
  }
}

// ---------- Books ----------

function checkBook(data, { withQuantity }) {
  const value = {
    title: clean(data.title, 120),
    author: clean(data.author, 80),
    genre: clean(data.genre, 40),
    isbn: clean(data.isbn, 20).replace(/[-\s]/g, '').toUpperCase(),
  };
  const errors = {
    title: value.title ? '' : 'Enter the book title.',
    author: value.author ? '' : 'Enter the author.',
    genre: value.genre ? '' : 'Enter the genre.',
    isbn: /^(\d{9}[\dX]|\d{13})$/.test(value.isbn) ? '' : 'Enter a valid 10 or 13 digit ISBN.',
  };
  if (withQuantity) {
    const q = Number(data.quantity);
    value.quantity = q;
    errors.quantity =
      String(data.quantity).trim() !== '' && Number.isInteger(q) && q >= 0 && q <= 9999
        ? ''
        : 'Enter a whole number from 0 to 9999.';
  }
  return { value, errors };
}

const hasErrors = (errors) => Object.values(errors).some(Boolean);

export function addBook(actor, data) {
  return guard(actor, () => {
    const { value, errors } = checkBook(data, { withQuantity: true });
    const books = read(KEYS.books, []);
    if (!errors.isbn && books.some((b) => b.isbn === value.isbn)) {
      errors.isbn = 'A book with this ISBN already exists.';
    }
    if (hasErrors(errors)) return fail('', errors);
    write(KEYS.books, [...books, { id: newId('book'), ...value, createdAt: new Date().toISOString() }]);
    return { ok: true };
  });
}

// Stock is not editable here; it changes only through recorded transactions.
export function updateBook(actor, id, data) {
  return guard(actor, () => {
    const { value, errors } = checkBook(data, { withQuantity: false });
    const books = read(KEYS.books, []);
    if (!books.some((b) => b.id === id)) return fail('That book no longer exists.');
    if (!errors.isbn && books.some((b) => b.isbn === value.isbn && b.id !== id)) {
      errors.isbn = 'Another book already uses this ISBN.';
    }
    if (hasErrors(errors)) return fail('', errors);
    write(KEYS.books, books.map((b) => (b.id === id ? { ...b, ...value } : b)));
    return { ok: true };
  });
}

export function deleteBook(actor, id) {
  return guard(actor, () => {
    write(KEYS.books, read(KEYS.books, []).filter((b) => b.id !== id));
    return { ok: true };
  });
}

// ---------- Transactions (admin) ----------

export function recordTransaction(actor, data) {
  return guard(actor, () => {
    const admin = requireAdmin(actor);
    const books = read(KEYS.books, []);
    const users = read(KEYS.users, []);
    const book = books.find((b) => b.id === data.bookId);
    const quantity = Number(data.quantity);
    const type = data.type === 'borrow' ? 'borrow' : 'add';
    const errors = {
      bookId: book ? '' : 'Choose a book.',
      quantity:
        Number.isInteger(quantity) && quantity >= 1 && quantity <= 9999
          ? ''
          : 'Enter a whole number from 1 to 9999.',
      memberId: '',
    };
    let member = null;
    if (type === 'borrow') {
      member = users.find((u) => u.id === data.memberId);
      if (!member) errors.memberId = 'Choose the member borrowing the book.';
      if (book && !errors.quantity && quantity > book.quantity) {
        errors.quantity = `Only ${book.quantity} in stock.`;
      }
    }
    if (hasErrors(errors)) return fail('', errors);

    write(
      KEYS.books,
      books.map((b) =>
        b.id === book.id ? { ...b, quantity: b.quantity + (type === 'add' ? quantity : -quantity) } : b
      )
    );
    write(KEYS.transactions, [
      {
        id: newId('txn'),
        bookId: book.id,
        bookTitle: book.title,
        type,
        quantity,
        memberId: member ? member.id : null,
        memberName: member ? member.name : '',
        note: clean(data.note, 120),
        recordedBy: admin.username,
        createdAt: new Date().toISOString(),
      },
      ...read(KEYS.transactions, []),
    ]);
    return { ok: true };
  });
}

// Admin shortcut: create a brand-new book AND log an "add stock" transaction in one step.
export function addNewStock(actor, data) {
  return guard(actor, () => {
    const admin = requireAdmin(actor);
    const { value, errors } = checkBook(data, { withQuantity: true });
    const books = read(KEYS.books, []);
    if (!errors.isbn && books.some((b) => b.isbn === value.isbn)) {
      errors.isbn = 'A book with this ISBN already exists.';
    }
    if (value.quantity !== undefined && value.quantity < 1) {
      errors.quantity = 'Enter a quantity of at least 1.';
    }
    if (hasErrors(errors)) return fail('', errors);

    const book = {
      id: newId('book'),
      title: value.title,
      author: value.author,
      genre: value.genre,
      isbn: value.isbn,
      quantity: value.quantity,
      createdAt: new Date().toISOString(),
    };
    write(KEYS.books, [...books, book]);
    write(KEYS.transactions, [
      {
        id: newId('txn'),
        bookId: book.id,
        bookTitle: book.title,
        type: 'add',
        quantity: value.quantity,
        memberId: null,
        memberName: '',
        note: clean(data.note, 120) || 'New stock',
        recordedBy: admin.username,
        createdAt: new Date().toISOString(),
      },
      ...read(KEYS.transactions, []),
    ]);
    return { ok: true, bookId: book.id };
  });
}

// Admin: delete a transaction AND reverse its effect on stock.
export function deleteTransaction(actor, id) {
  return guard(actor, () => {
    requireAdmin(actor);
    const txns = read(KEYS.transactions, []);
    const target = txns.find((t) => t.id === id);
    if (!target) return fail('That transaction no longer exists.');

    // Reverse the effect on stock. +add and -borrow originally; deleting undoes both.
    // 'return' rows count like 'add' (they put stock back), so they behave the same way.
    const direction =
      target.type === 'borrow' ? +target.quantity : -target.quantity;

    const books = read(KEYS.books, []);
    const book = books.find((b) => b.id === target.bookId);
    if (book) {
      const nextQty = book.quantity + direction;
      if (nextQty < 0) {
        return fail('Cannot delete: it would make stock negative.');
      }
      write(
        KEYS.books,
        books.map((b) => (b.id === book.id ? { ...b, quantity: nextQty } : b))
      );
    }
    write(KEYS.transactions, txns.filter((t) => t.id !== id));
    return { ok: true };
  });
}

// ---------- Users ----------

async function checkUser(data, users, ignoreId, { passwordRequired }) {
  const value = {
    name: clean(data.name, 60),
    username: clean(data.username, 20),
    email: clean(data.email, 100).toLowerCase(),
    membershipId: clean(data.membershipId, 20).toUpperCase(),
    role: data.role === 'admin' ? 'admin' : 'user',
  };
  const errors = {
    name: validateName(value.name),
    username: validateUsername(value.username),
    email: validateEmail(value.email),
    membershipId: /^[A-Z0-9-]{3,20}$/.test(value.membershipId)
      ? ''
      : 'Use 3 to 20 letters, numbers or dashes.',
    password: '',
  };
  const others = users.filter((u) => u.id !== ignoreId);
  if (!errors.username && others.some((u) => u.username.toLowerCase() === value.username.toLowerCase())) {
    errors.username = 'That username is already taken.';
  }
  if (!errors.email && others.some((u) => u.email === value.email)) {
    errors.email = 'Another account uses this email.';
  }
  if (!errors.membershipId && others.some((u) => u.membershipId === value.membershipId)) {
    errors.membershipId = 'That membership ID is already in use.';
  }
  if (passwordRequired || data.password) errors.password = validatePassword(data.password || '');
  return { value, errors };
}

export function addUser(actor, data) {
  return guardAsync(actor, async () => {
    const users = read(KEYS.users, []);
    const { value, errors } = await checkUser(data, users, null, { passwordRequired: true });
    if (hasErrors(errors)) return fail('', errors);
    const pw = await hashSecret(data.password);
    write(KEYS.users, [
      ...read(KEYS.users, []),
      {
        id: newId('user'),
        ...value,
        passwordHash: pw.hash,
        salt: pw.salt,
        createdAt: new Date().toISOString(),
      },
    ]);
    return { ok: true };
  });
}

export function updateUser(actor, id, data) {
  return guardAsync(actor, async () => {
    const users = read(KEYS.users, []);
    const target = users.find((u) => u.id === id);
    if (!target) return fail('That user no longer exists.');
    const { value, errors } = await checkUser(data, users, id, { passwordRequired: false });

    if (target.id === actor.id && value.role !== target.role) {
      errors.role = 'You cannot change your own role.';
    }
    if (target.role === 'admin' && value.role !== 'admin') {
      if (users.filter((u) => u.role === 'admin').length < 2) {
        errors.role = 'At least one administrator is required.';
      }
    }
    if (hasErrors(errors)) return fail('', errors);

    const changes = { ...value };
    if (data.password) {
      const pw = await hashSecret(data.password);
      changes.passwordHash = pw.hash;
      changes.salt = pw.salt;
    }
    write(KEYS.users, read(KEYS.users, []).map((u) => (u.id === id ? { ...u, ...changes } : u)));
    return { ok: true };
  });
}

export function deleteUser(actor, id) {
  return guard(actor, () => {
    const users = read(KEYS.users, []);
    const target = users.find((u) => u.id === id);
    if (!target) return fail('That user no longer exists.');
    if (target.id === actor.id) return fail('You cannot delete your own account.');
    if (target.role === 'admin' && users.filter((u) => u.role === 'admin').length < 2) {
      return fail('At least one administrator is required.');
    }
    write(KEYS.users, users.filter((u) => u.id !== id));
    return { ok: true };
  });
}

// ---------- Member actions (any signed-in user) ----------

// How many copies this member currently has out (borrowed minus returned).
export function activeBorrowCount(memberId) {
  const all = read(KEYS.transactions, []);
  const map = new Map();
  all
    .filter((t) => t.memberId === memberId && t.borrowId)
    .forEach((t) => {
      const cur = map.get(t.borrowId) || { borrowed: 0, returned: 0 };
      if (t.type === 'borrow') cur.borrowed += t.quantity;
      if (t.type === 'return') cur.returned += t.quantity;
      map.set(t.borrowId, cur);
    });
  return [...map.values()].reduce((sum, r) => sum + Math.max(r.borrowed - r.returned, 0), 0);
}

// Borrow a book: decrements stock, logs a borrow, tags it with the member.
export function borrowBook(actor, { bookId, quantity = 1 }) {
  try {
    const member = requireUser(actor);
    const books = read(KEYS.books, []);
    const book = books.find((b) => b.id === bookId);
    const qty = Number(quantity);
    const errors = {
      bookId: book ? '' : 'Choose a book.',
      quantity:
        Number.isInteger(qty) && qty >= 1 && qty <= 5 ? '' : 'Choose 1 to 5 copies.',
    };

    if (book && !errors.quantity && qty > book.quantity) {
      errors.quantity = `Only ${book.quantity} in stock.`;
    }
    if (activeBorrowCount(member.id) + qty > MAX_ACTIVE_BORROWS) {
      errors.quantity = `You can have at most ${MAX_ACTIVE_BORROWS} books borrowed at once.`;
    }
    if (hasErrors(errors)) return fail('', errors);

    const borrowId = newId('borrow');
    write(
      KEYS.books,
      books.map((b) => (b.id === book.id ? { ...b, quantity: b.quantity - qty } : b))
    );
    write(KEYS.transactions, [
      {
        id: newId('txn'),
        borrowId,
        bookId: book.id,
        bookTitle: book.title,
        type: 'borrow',
        quantity: qty,
        memberId: member.id,
        memberName: member.name,
        note: '',
        recordedBy: member.username,
        createdAt: new Date().toISOString(),
      },
      ...read(KEYS.transactions, []),
    ]);
    return { ok: true, borrowId };
  } catch (e) {
    return fail(e.message);
  }
}

// Return a previously borrowed book: restores stock and logs a return.
export function returnBook(actor, { borrowId, quantity = 1 }) {
  try {
    const member = requireUser(actor);
    const txns = read(KEYS.transactions, []);
    const open = txns.filter((t) => t.borrowId === borrowId && t.memberId === member.id);

    if (!open.length) return fail('That borrow record was not found.');

    const borrowed = open
      .filter((t) => t.type === 'borrow')
      .reduce((s, t) => s + t.quantity, 0);
    const alreadyReturned = open
      .filter((t) => t.type === 'return')
      .reduce((s, t) => s + t.quantity, 0);
    const remaining = borrowed - alreadyReturned;
    const qty = Number(quantity);

    if (remaining <= 0) return fail('That book has already been returned.');
    if (!Number.isInteger(qty) || qty < 1 || qty > remaining) {
      return fail(`Enter a whole number from 1 to ${remaining}.`);
    }

    const books = read(KEYS.books, []);
    const book = books.find((b) => b.id === open[0].bookId);
    if (!book) return fail('That book is no longer in the catalogue.');

    write(
      KEYS.books,
      books.map((b) => (b.id === book.id ? { ...b, quantity: b.quantity + qty } : b))
    );
    write(KEYS.transactions, [
      {
        id: newId('txn'),
        borrowId,
        bookId: book.id,
        bookTitle: book.title,
        type: 'return',
        quantity: qty,
        memberId: member.id,
        memberName: member.name,
        note: 'Returned',
        recordedBy: member.username,
        createdAt: new Date().toISOString(),
      },
      ...txns,
    ]);
    return { ok: true };
  } catch (e) {
    return fail(e.message);
  }
}

// Which books this member currently has out (one row per open borrow).
export function myOpenBorrows(memberId) {
  const all = read(KEYS.transactions, []);
  const map = new Map();
  all
    .filter((t) => t.memberId === memberId && t.borrowId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .forEach((t) => {
      const cur =
        map.get(t.borrowId) || {
          borrowId: t.borrowId,
          bookId: t.bookId,
          bookTitle: t.bookTitle,
          borrowed: 0,
          returned: 0,
          firstAt: t.createdAt,
        };
      if (t.type === 'borrow') cur.borrowed += t.quantity;
      if (t.type === 'return') cur.returned += t.quantity;
      map.set(t.borrowId, cur);
    });
  return [...map.values()]
    .filter((r) => r.borrowed - r.returned > 0)
    .map((r) => ({ ...r, remaining: r.borrowed - r.returned }));
}