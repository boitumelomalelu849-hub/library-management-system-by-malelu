import { useCallback, useEffect, useState } from 'react';
import { KEYS, read, publicUser } from '../utils/storage';

const load = () => ({
  books: read(KEYS.books, []),
  users: read(KEYS.users, []).map(publicUser),
  transactions: read(KEYS.transactions, []),
});

// Loads books, users and transactions from Local Storage and keeps them fresh.
export default function useLibraryData() {
  const [data, setData] = useState(load);
  const refresh = useCallback(() => setData(load()), []);

  useEffect(() => {
    const onStorage = (e) => {
      if (Object.values(KEYS).includes(e.key)) refresh();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [refresh]);

  return { ...data, refresh };
}
