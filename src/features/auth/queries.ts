import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "./authStore";
import { useAuth } from "./useAuth";

export function useCurrentUser() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

}
