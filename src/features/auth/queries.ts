import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "./authStore";
import { getCurrentUser } from "./api";

export function useCurrentUser() {
  const accessToken = useAuthStore((s) => s.accessToken); // primitive — identity changes on login/logout
  return useQuery({
    queryKey: ["currentUser"],
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
