import { useAuthStore } from "./authStore";

export function useAuth() {
  return {
    user: useAuthStore((s) => s.user),
    isAuthenticated: useAuthStore((s) => s.isAuthenticated),
    accessToken: useAuthStore((s) => s.accessToken),
  };
}
/*
 * useAuthStore((s) => s.user) — reactive subscription
 * 
 * This is calling the Zustand hook with a selector function. It does two things:
 * 
 *  - Reads the current user value
 *  - Subscribes the component to changes in user specifically — whenever setUser(...) is called anywhere in the app, any component using this hook automatically re-renders with the new value
 * 
 * This is the correct way to read state inside a React component when you want the UI to update reactively. It's a live binding — user in your component always reflects the current store value, and React re-renders when it changes.
 * 
 * 
 * 
 * -- useAuthStore.getState().user — one-time snapshot, non-reactive ---
*/
