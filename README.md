# bookly-frontend

Frontend web app for Bookly, a personal book catalog with reviews, tags, and user accounts.

This is the frontend of the [bookly-backend](https://github.com/sanaullahaq/bookly-backend) project (FastAPI API).

## Objective

Bookly lets users create an account and manage a catalog of books (title, author, publisher, page count, language, published date), organize them with tags, and write/delete reviews on individual books. The app solves the problem of tracking a personal reading library plus community feedback per title, all behind a token-based auth flow (signup, email verification, login, password reset). The frontend is a SPA that talks directly to the Bookly API; there is no database or server-side logic in this repo.

## Tech Stack

- **Frontend**: React 19, TypeScript 6, Vite 8, react-router-dom v7
- **Styling**: Tailwind CSS v4 (via the `@tailwindcss/vite` plugin; no `tailwind.config`)
- **Data / State**: TanStack Query v5 (server state + caching), Zustand 5 with `persist` (auth state, `localStorage` key `bookly-auth`)
- **HTTP**: Axios (`src/lib/apiClient.ts`, auto-attaches Bearer token and refreshes on 401)
- **Other**: lucide-react (icons)
- **Tooling**: ESLint 10 + typescript-eslint, Vitest 5 + Testing Library + MSW 2 (tests)

## Setup

1. Clone the repo:

```bash
git clone <repo-url> bookly-frontend
cd bookly-frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file (there is no committed `.env.example`; `.env` is gitignored) with the API base URL, no trailing slash:

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

4. Start the backend. The app is a pure API consumer and needs the Bookly backend running on `:8000` (FastAPI, PostgreSQL, Redis, Celery — see `../bookly-backend/README.md`). Run its dev server, apply migrations, and start a Celery worker for email sending before using auth features.

No frontend database or migrations exist.

## Usage

Run the Vite dev server on `:5173`:

```bash
npm run dev
```

Build (production bundle). This runs `tsc -b` first, so it also serves as the typecheck step:

```bash
npm run build
```

Lint the codebase:

```bash
npm run lint
```

Preview a production build:

```bash
npm run preview
```

Run the full suite (single pass, jsdom environment):

```bash
npm test
```

Run tests in watch mode while developing:

```bash
npm run test:watch
```

Run tests with a coverage report (V8 provider, text + HTML output in `coverage/`):

```bash
npm run test:coverage
```

Basic flow after login: the app redirects unauthenticated visits to `/login`; book management lives under `/books`. API endpoints are rooted at `VITE_API_BASE_URL` (e.g. `/auth/login`, `GET /books/`).

## Tests

Component and unit tests use Vitest 5 with Testing Library (React, jest-dom matchers, user-event) and MSW 2 for request mocking.

- **Config**: the `test` block lives in `vite.config.ts` (jsdom environment, `globals: true`, `setupFiles: ./src/test/setup.ts`, V8 coverage).
- **`src/test/setup.ts`**: loads jest-dom matchers, starts the MSW server, and does `resetHandlers()` + RTL `cleanup()` after each test. `onUnhandledRequest: "error"` means an unmocked request fails the test instead of hitting the network.
- **`src/test/server.ts`**: the shared `setupServer(...handlers)` instance.
- **`src/test/utils.tsx`**: `renderWithProviders` — wraps a subject in `MemoryRouter` + a fresh `QueryClient` (caching and retries disabled) so tests stay isolated.
- **`src/test/mocks/handlers.ts`**: default MSW handlers, rooted at `import.meta.env.VITE_API_BASE_URL`. Override per-test with `server.use(http.get(...))` after `server.resetHandlers()`.
- **Test files**: co-located in `src/features/<feature>/__tests__/` next to the code they cover.
- **Typing**: test files are excluded from `tsconfig.app.json` (so `tsc -b` never checks them) and type-checked through the separate `tsconfig.vitest.json` project, which adds `vitest/globals` and `@testing-library/jest-dom` types.

Tests need no backend, database, Redis, or Celery — MSW intercepts every HTTP call, so the suite runs fully offline.

## Project Structure

```
src/
├── components/     # Shared UI: Layout, NavBar, ProtectedRoute, Loading,
│                   # ErrorMessage, ConfirmDialog
├── features/       # One folder per domain
│   ├── auth/       # api.ts, queries.ts, authStore.ts, useAuth.ts, *Page.tsx
│   ├── books/      # api.ts, queries.ts, BooksListPage, BookDetailPage,
│   │               # BookForm (shared create/edit), BookEditPage
│   ├── reviews/    # api.ts, queries.ts, ReviewList, ReviewForm
│   └── tags/       # api.ts, queries.ts, TagChips, TagEditor
├── lib/            # apiClient (auth interceptor), errors, queryClient
├── types/          # Per-domain types mirroring the backend Pydantic schemas
├── test/           # Vitest harness: setup.ts, server.ts, utils.tsx, mocks/
└── router.tsx      # createBrowserRouter config
```

## Features

### Tags

Tags are **global** backend rows joined to books by a `BookTag` link, which shapes the UI into two separate pieces:

- `<TagChips />` — display-only pills rendered on `/books` list cards. Returns `null` when a book has no tags.
- `<TagEditor />` — the interactive add/remove card on `/books/:uid`. Removing a tag there is a **per-book unpin** (`DELETE /tags/book/{book_uid}/tags/{tag_uid}`), so the tag itself stays in the database and remains attached to any other book. The frontend has no route or button for the global `DELETE /tags/{uid}`.

Adding a tag takes free text plus a native `<datalist>` of every existing tag name, so typing a new name and picking an existing one go through the same single request (the backend find-or-creates). Add is disabled on empty input or when the trimmed name already matches a chip; both guards run client-side, so an invalid submit makes no network call. Remove needs no confirmation dialog since it is trivially reversible by re-adding.

Each chip's remove `×` is hidden at rest and appears on chip hover **and** keyboard focus, positioned absolutely at the chip's top-right corner so revealing it never reflows the chip or covers the tag name.