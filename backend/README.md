# Backend

This folder is intentionally code-free.

The assignment brief fixes the stack to **React (JSX, Components, Hooks, Router), CSS and Local Storage as the database**.
All data (users, books, transactions, session) is therefore stored in the browser's Local Storage by the frontend,
and the data-access and security logic lives in `frontend/src/utils/`:

| Concern                    | File                              |
| -------------------------- | --------------------------------- |
| Storage + seed data        | `frontend/src/utils/storage.js`   |
| Hashing, validation, lockout | `frontend/src/utils/security.js` |
| Login, register, reset     | `frontend/src/utils/auth.js`      |
| Books, transactions, users (admin-only) | `frontend/src/utils/library.js` |

If the project is later extended with a real server (for example Node + Express + a database), the functions in
`library.js` and `auth.js` are the layer to move here, because only a server can enforce security that users cannot edit.
