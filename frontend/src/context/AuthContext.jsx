import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { KEYS, read, write, remove, publicUser, seedIfEmpty } from '../utils/storage';
import { loginUser } from '../utils/auth';

const AuthContext = createContext(null);
const SESSION_MS = 15 * 60 * 1000; // sign out after 15 minutes of inactivity

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  // Rebuild the user from the stored account, so the role always comes from the database
  // and not from the session record.
  const loadSession = useCallback(() => {
    const session = read(KEYS.session, null);
    if (!session || session.expiresAt < Date.now()) {
      remove(KEYS.session);
      return null;
    }
    const account = read(KEYS.users, []).find((u) => u.id === session.userId);
    return account ? publicUser(account) : null;
  }, []);

  // Lifecycle: seed data and restore the session once, on first load.
  useEffect(() => {
    seedIfEmpty().then(() => {
      setUser(loadSession());
      setReady(true);
    });
  }, [loadSession]);

  // While signed in: expire idle sessions, extend on activity, sync sign-out across tabs.
  useEffect(() => {
    if (!user) return undefined;
    const check = () => {
      if (!loadSession()) setUser(null);
    };
    const timer = setInterval(check, 15000);
    const onStorage = (e) => {
      if (e.key === KEYS.session || e.key === KEYS.users) check();
    };
    let last = 0;
    const extend = () => {
      const now = Date.now();
      if (now - last < 10000) return;
      last = now;
      const session = read(KEYS.session, null);
      if (session) write(KEYS.session, { ...session, expiresAt: now + SESSION_MS });
    };
    const events = ['click', 'keydown', 'touchstart'];
    events.forEach((ev) => window.addEventListener(ev, extend));
    window.addEventListener('storage', onStorage);
    return () => {
      clearInterval(timer);
      events.forEach((ev) => window.removeEventListener(ev, extend));
      window.removeEventListener('storage', onStorage);
    };
  }, [user, loadSession]);

  const login = async (credentials) => {
    const result = await loginUser(credentials);
    if (!result.ok) return result;
    write(KEYS.session, { userId: result.user.id, expiresAt: Date.now() + SESSION_MS });
    setUser(publicUser(result.user));
    return { ok: true, user: publicUser(result.user) };
  };

  const logout = () => {
    remove(KEYS.session);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, ready, login, logout }}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
