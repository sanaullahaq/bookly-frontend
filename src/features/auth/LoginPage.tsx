import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser, login } from "./api";
import { useAuthStore } from "./authStore";
import ErrorMessage from "../../components/ErrorMessage";
import { Eye, EyeOff } from "lucide-react";
import type { UserOut } from "../../types/users";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  /**
   * In TanStack Query, useMutation is a custom hook used to create, update, or delete data, or perform any server-side side effects.
   * While useQuery is built exclusively for fetching and reading data, useMutation handles the Create, Update, and Delete parts of CRUD operations.
   * Unlike queries, mutations do not run automatically when a component mounts.
   * They wait for you to explicitly trigger them (e.g., when a user submits a form or clicks a delete button).
   */

  // define the mutation
  const mutation = useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      // 1) authenticate -> tokens
      const { data } = await login({ email, password });

      // 2) store tokens (persist middleware writes localStorage automatically)
      useAuthStore.getState().setTokens(data.access_token, data.refresh_token);

      // 3) fetch full profile and cache it in the store
      const me = await getCurrentUser();
      const userOnly: UserOut = {
        uid: me.data.uid,
        username: me.data.username,
        email: me.data.email,
        first_name: me.data.first_name,
        last_name: me.data.last_name,
        is_verified: me.data.is_verified,
        created_at: me.data.created_at,
        updated_at: me.data.updated_at,
      };
      useAuthStore.getState().setUser(userOnly);
    },
    onSuccess: () => navigate("/", { replace: true }),

    // on error: mutation.error is rendered by <ErrorMessage /> below
  });

  return (
    <div className="flex min-h-svh items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-2xl font-semibold text-gray-900">
          Log in to Bookly
        </h1>

        {mutation.isError && (
          <div className="mb-4">
            <ErrorMessage error={mutation.error} />
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate({ email: email.trim(), password });
          }}
          // The argument you pass becomes the argument passed to your mutationFn.
          // It's fire-and-forget — mutate doesn't return a promise, so you can't await it or .then() it directly.
          // It runs the mutation and updates the mutation object's state (isPending → isSuccess/isError) as it progresses.
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <div className="relative mt-1">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full rounded-md border border-gray-300 px-3 py-2 pr-16 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                // aria-label on a <button> is an accessibility attribute that provides an accessible name for the button — text that screen readers announce, even if it's not visually displayed (or differs from what's visually displayed).
                className="absolute inset-y-0 right-2 text-xs font-medium text-purple-600 hover:text-purple-800"
              >
                {/* {password && <span>{showPassword ? "Hide" : "Show"}</span>} */}
                {password && (
                  <span>
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </span>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            aria-busy={mutation.isPending}
            className="w-full rounded-md bg-purple-600 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {mutation.isPending ? "Signing in..." : "Log in"}
          </button>
        </form>

        <div className="mt-4 flex justify-between text-sm">
          <Link
            to="/forget-password"
            className="text-purple-600 hover:underline"
          >
            Forgot password?
          </Link>
          <span className="text-gray-600">
            No account?{" "}
            <Link to="/signup" className="text-purple-600 hover:underline">
              Sign up
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
