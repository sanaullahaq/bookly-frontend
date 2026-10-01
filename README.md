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
- **Tooling**: ESLint 10 + typescript-eslint, no dedicated test framework

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

Basic flow after login: the app redirects unauthenticated visits to `/login`; book management lives under `/books`. API endpoints are rooted at `VITE_API_BASE_URL` (e.g. `/auth/login`, `GET /books/`).

**Tests**: TODO — no test framework or test script is configured in `package.json`.

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
└── router.tsx      # createBrowserRouter config
```

## Features

### Tags

Tags are **global** backend rows joined to books by a `BookTag` link, which shapes the UI into two separate pieces:

- `<TagChips />` — display-only pills rendered on `/books` list cards. Returns `null` when a book has no tags.
- `<TagEditor />` — the interactive add/remove card on `/books/:uid`. Removing a tag there is a **per-book unpin** (`DELETE /tags/book/{book_uid}/tags/{tag_uid}`), so the tag itself stays in the database and remains attached to any other book. The frontend has no route or button for the global `DELETE /tags/{uid}`.

Adding a tag takes free text plus a native `<datalist>` of every existing tag name, so typing a new name and picking an existing one go through the same single request (the backend find-or-creates). Add is disabled on empty input or when the trimmed name already matches a chip; both guards run client-side, so an invalid submit makes no network call. Remove needs no confirmation dialog since it is trivially reversible by re-adding.

Each chip's remove `×` is hidden at rest and appears on chip hover **and** keyboard focus, positioned absolutely at the chip's top-right corner so revealing it never reflows the chip or covers the tag name.