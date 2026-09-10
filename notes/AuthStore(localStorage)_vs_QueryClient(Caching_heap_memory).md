# AuthStore (localStorage) vs QueryClient (Caching in Heap Memory)

Frontend note on how auth state and server-state (books) caching work, and why one lives in `localStorage` while the other lives only in memory.

---

## Q1: "we are storing our access_token, refresh_token, user informations into the auth store. I can verify this info from the browser > dev tools > application > storage > local storage. But we are not storing any book data to any store. Then how the caching is working? written into `@bookly-frontend/src/features/books/queries.ts`"

**Answer — two different layers, for two different jobs:**

### Layer 1 — Zustand `persist` (auth): durable client state
- `authStore` (Zustand, persisted) holds `access_token`, `refresh_token` and the user JSON.
- They are written to `localStorage` under the key `bookly-auth`, so they survive a full page reload and can be read **synchronously** by the axios interceptor when attaching the `Authorization: Bearer` header.

### Layer 2 — TanStack Query cache (books): in-memory server-state cache
- `main.tsx` mounts `<QueryClientProvider client={queryClient}>` at the root. That single `queryClient` object lives in the JS heap memory for the whole SPA lifetime — **this object *is* the cache**. No localStorage, no Zustand, no `persist`.
- Each `useQuery` registers itself under a key and stores the `queryFn` result (the axios `data`) there:
  - `["books"]` → the list (`useBooks`)
  - `["books", uid]` → one detail (`useBook`)
- **How caching works:** navigate to `/books` → one `GET /books/`, result stored. Click a book → `GET /books/{uid}`. Press Back → `BooksListPage` re-runs `useBooks`, finds `["books"]`, sees it is fresh (within `staleTime: 60s`), and returns the stored data with **zero network calls**. No store writes — just the key→value map inside the `QueryClient`.
- **When it re-fetches:** after 60s the entry is "stale" (shown instantly, but refetched in the background); after `invalidateQueries` (the mutation `onSuccess` handlers, e.g. `bookKeys.all`); or after a hard refresh (F5 wipes heap memory → everything re-fetches).

### Why book data is not stored in localStorage like auth
- **Auth tokens are credentials** — needed synchronously by `apiClient` and must survive reloads/logins. Durable client state.
- **Book data is a mirror of server state** — a durable local copy would silently go stale across refreshes and sessions, and you could show deleted/outdated data that invalidation never reaches. In-memory cache + 60s `staleTime` + explicit invalidation is the correct model; a reload re-reads the source of truth.

### How to verify in DevTools
1. Login → `/books` → Network shows `GET /books/`.
2. Open a book → `GET /books/{uid}`.
3. Press **Back** → **no new request** for `/books/` (served from the `QueryClient` cache).
4. Press **F5** → requests happen again (the cache was in memory only).

So `queries.ts` does not persist anything — the hooks simply read/write the `QueryClient`'s in-memory key→data map, keyed by `bookKeys`.

---

## Q2: "From `/books/:uid` if I go back/ forward between books-list or book-detail page there is no twice hit to the backend server for the same resource. But if I click the normal reload button/ hard reload there is hit to the sever as much as I click reload."

**Answer — correct, and that is the intended two-mode behavior:**

- **SPA navigation (Back/Forward, or any client-side link):** `react-router` swaps components via the History API inside the same already-loaded page. The JS context (and the `queryClient`) stays alive in memory, so `/books/:uid` ←→ `/books` re-mounts `useBook`/`useBooks`, finds the cached entry for the key, sees it is fresh (within the 60s `staleTime`), and returns it — **zero `GET` requests**.

- **Hard reload (F5 / reload button):** the browser abandons the current JS context and re-executes the whole bundle from scratch. A reload = a brand-new `QueryClient` — the in-memory cache is empty by design (book data is never persisted to localStorage). So every `useBooks`/`useBook` mount runs its `queryFn` → a real network `GET`. One reload = one fresh cache = one hit; there is no cross-reload cache to reuse, so repeated reloads hit the server every time.

**Important nuance:** `staleTime: 60s` only governs freshness *within a cache instance*. It does not survive a reload — a fresh empty cache starts cold regardless of how recently you fetched.

**Should you persist the query cache across reloads?** No. Reload meaning "the page is starting over" and the source of truth should be re-read is the correct behavior for server state. `persistQueryClient` would reintroduce exactly the stale-data risk a reload is meant to clear — you would show possibly-deleted books without any invalidation path.