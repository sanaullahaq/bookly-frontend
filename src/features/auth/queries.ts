import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "./authStore";
import { getCurrentUser } from "./api";

export function useCurrentUser() {
  const accessToken = useAuthStore((s) => s.accessToken); // primitive — identity changes on login/logout
  return useQuery({
    queryKey: ["currentUser", accessToken], //queryKey shape now includes both the hard-coded string "currentUser" and <accessToken> and identity changes on login/logout
    queryFn: async () => {
      const { data } = await getCurrentUser();
      return data; //UserDetailOut
    },
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000,
  });
}

// - queryKey: ["currentUser"] — cache identity. Any other component calling this hook shares one cached result; invalidating ["currentUser"] refetches everywhere.
// - queryFn — calls getCurrentUser() from api.ts and unwraps the axios response ({ data } destructuring), returning the typed payload.
// - enabled: !!accessToken — conditional fetching: the query should only execute when there's a logged-in user. While enabled is false, React Query stays idle (no request, no error).
// - staleTime: 5 min — overrides the global 1-min default: after fetching /auth/me, the cache is considered fresh for 5 minutes; remounts within that window serve cache instantly with no network call.

/* === Why useAuthStore directly instead of useAuth? ===
 Functionally, there is no difference. Look at useAuth.ts — it's just a thin wrapper whose implementation is literally useAuthStore((s) => s.isAuthenticated). Both paths select the exact same slice of state. Going direct is simply:
 - One less layer of indirection — you see exactly which state field this hook depends on
 - A narrower subscription contract (though as noted below, that's moot here)
 It's a style choice, not a correctness choice.
*/

/**
 * ***useCurrentUser() triggers under these conditions: ***
    Runs (queryFn fires → GET /auth/me):
    - Only when enabled is truthy, i.e. accessToken is set in the store (!!accessToken). No token → query stays idle, no request.
    - On the first mount (or remount) of a component that calls the hook, when enabled and the ["currentUser"] cache is empty/stale.
    - When the cache goes stale. Global default staleTime is 1 min, but this query overrides it to 5 min. So a remount within 5 min serves the cached UserDetailOut with no network call; after 5 min it refetches in the background.
    - React Query default also refetches on window focus — but refetchOnWindowFocus: false is set globally in lib/queryClient.ts, so no refetch on focus.
*/

/**
 * ***Key concept: In TanStack Query, invalidateQueries matches by prefix. So: ***
  
```queryClient.invalidateQueries({ queryKey: ["currentUser"] })```
  
  matches all keys starting with ["currentUser", ...], i.e. every token-scoped variant. You do NOT need to provide the accessToken for this form of invalidation — it invalidates the cache for the current user (and any other cached variants) without you knowing the token.
  This is exactly why the bookKeys-style pattern works: ["books"] as a prefix invalidates ["books"] and ["books", <uid>].
  When you WOULD need the token: only if you wanted to target a specific token-scoped entry directly — e.g. using removeQueries/invalidateQueries with the exact key ["currentUser", accessToken], or query-functions like getQueryData(["currentUser", accessToken]). Those require the token value because the full key includes it.
*/
