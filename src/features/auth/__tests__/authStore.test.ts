import { beforeEach, describe, expect, it } from "vitest";
import { useAuthStore } from "../authStore";

describe("authStore", () => {
  beforeEach(() => {
    // logout() also clears cached ["currentUser"] queries via queryClient,
    // and partialize persists only { accessToken, refreshToken, user }.
    useAuthStore.getState().logout();
    localStorage.clear();
  });

  it("starts unauthenticated", () => {
    expect(useAuthStore.getState().isAuthenticated()).toBe(false);
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  it("sets tokens and marks as authenticated", () => {
    useAuthStore.getState().setTokens("access-123", "refresh-456");
    expect(useAuthStore.getState().isAuthenticated()).toBe(true);
    expect(useAuthStore.getState().accessToken).toBe("access-123");
    expect(useAuthStore.getState().refreshToken).toBe("refresh-456");
  });

  it("persists tokens and user to localStorage", () => {
    useAuthStore.getState().setTokens("access-123", "refresh-456");
    const stored = JSON.parse(localStorage.getItem("bookly-auth")!);
    // partialize means actions are NOT serialised — only the three data fields.
    expect(stored.state.accessToken).toBe("access-123");
    expect(stored.state.setTokens).toBeUndefined();
  });

  it("rehydrates from localStorage", () => {
    localStorage.setItem(
      "bookly-auth",
      JSON.stringify({ state: { accessToken: "a", refreshToken: "b", user: null }, version: 0 })
    );
    expect(useAuthStore.persist.rehydrate()).toBeDefined();
  });

  it("clears state on logout", () => {
    useAuthStore.getState().setTokens("a", "b");
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().isAuthenticated()).toBe(false);
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });

  it("updates only the access token on refresh", () => {
    useAuthStore.getState().setTokens("old-access", "refresh-456");
    useAuthStore.getState().setAccessToken("new-access");
    expect(useAuthStore.getState().accessToken).toBe("new-access");
    expect(useAuthStore.getState().refreshToken).toBe("refresh-456");
  });
});
