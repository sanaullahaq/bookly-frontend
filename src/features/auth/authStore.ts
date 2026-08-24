import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserOut } from "../../types/users";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserOut | null;
  //   These three are the state — the actual data held by the store:

  // accessToken — short-lived JWT (or similar) used to authenticate API requests. | null because there's no token before login.
  // refreshToken — longer-lived token used to get a new accessToken once it expires, without forcing the user to log in again.
  // user — the logged-in user's profile info, also nullable since it doesn't exist before login.
  setTokens: (access: string, refresh: string) => void;
  setAccessToken: (token: string) => void;
  setUser: (user: UserOut) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  //   These are the actions — functions that mutate or read the state:

  // setTokens(access, refresh) — set both tokens at once, typically called right after login
  // setAccessToken(token) — update just the access token, typically called after a token-refresh cycle (since the refresh token usually doesn't change on every refresh)
  // setUser(user) — store the user profile, typically called after login or a /me fetch
  // logout() — clears everything (tokens + user) — no params needed, it's a reset
  // isAuthenticated() — a derived/computed check, not stored state — likely implemented as something like () => get().accessToken !== null, letting components ask "is the user logged in?" without duplicating that logic everywhere
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,

      setTokens: (access, refresh) =>
        set({ accessToken: access, refreshToken: refresh }),

      setAccessToken: (token) => set({ accessToken: token }),

      setUser: (user) => set({ user: user }),

      logout: () => set({ accessToken: null, refreshToken: null, user: null }),

      isAuthenticated: () => get().accessToken !== null,
    }),
    {
      name: "bookly-auth", // localStorage key
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    },
  ),
);

// create<AuthState>()(...) — the extra () before the config function is a TypeScript quirk in Zustand called curried generics. Zustand needs it so create<AuthState>() can properly infer types when middleware (like persist) is involved — without it, TypeScript can't correctly infer the types flowing through the middleware chain. It's boilerplate you just always include when combining create with middleware.

// persist(...) wraps your store config and adds automatic save/load to storage (localStorage by default).

// name: "bookly-auth" — the key under which the entire store gets serialized and saved in localStorage. Open devtools → Application → Local Storage, and you'll see a bookly-auth entry containing your persisted state as JSON.
// partialize — this is the important one. By default, persist would save your entire store to localStorage — including your action functions (though functions get silently dropped during JSON serialization anyway, so that's not the real issue). The real reason partialize matters: it lets you choose exactly which state fields get persisted, excluding anything you don't want written to storage. Here, you're explicitly persisting only:
//  - accessToken
//  - refreshToken
//  - user
// Since your interface currently only has these three state fields (plus actions, which aren't data), partialize here is effectively just being explicit/future-proof — but it becomes important the moment you add non-persistable state later. For example:
