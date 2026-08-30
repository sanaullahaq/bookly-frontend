import {
  useEffect,
  useState,
  type ChangeEvent,
  type SyntheticEvent,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import type { UserCreate } from "../../types/users";
import { useMutation } from "@tanstack/react-query";
import { signup } from "./api";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";
import ErrorMessage from "../../components/ErrorMessage";

const initialForm: UserCreate & { confirm_password: string } = {
  first_name: "",
  last_name: "",
  username: "",
  email: "",
  password: "",
  confirm_password: "",
};

const SECONDS_BEFORE_REDIRECT_TO_LOGIN = 10;

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordMisMatchError, setPasswordMisMatchError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(
    SECONDS_BEFORE_REDIRECT_TO_LOGIN,
  );

  const mutation = useMutation({
    mutationFn: async (userCreate: UserCreate) => {
      const { data } = await signup(userCreate);
      return data;
    },
  });

  useEffect(() => {
    if (!mutation.isSuccess) return;
    const interval = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    const timeout = setTimeout(
      () => navigate("/login", { replace: true }),
      SECONDS_BEFORE_REDIRECT_TO_LOGIN * 1000,
    );
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [mutation.isSuccess, navigate]);

  /**
   *
   * if (!mutation.isSuccess) return;
   *  - This effect runs on every render where mutation.isSuccess or navigate change (per the dependency array). Most of the time signup hasn't succeeded yet,
   *    so this guard bails out immediately — no interval/timeout gets created until the mutation actually succeeds.
   *
   * const interval = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
   *  - Once isSuccess becomes true, this starts a repeating timer that fires every 1000ms (1 second), each time decrementing secondsLeft by 1.
   *    This is what drives the visible {Math.max(secondsLeft, 0)}s… countdown text in the success panel.
   *  - Note the functional updater (s) => s - 1 rather than setSecondsLeft(secondsLeft - 1) — this matters because secondsLeft inside this closure would
   *    otherwise be "stale" (frozen at whatever value it had when the effect last ran). Since the effect only re-runs
   *    when isSuccess/navigate change — not every second — using the functional form guarantees each tick decrements from the actual current state value,
   *    not a stale closure snapshot.
   *
   * const timeout = setTimeout(() => navigate("/login", { replace: true }), 10000);
   *  - Independently of the countdown display, this schedules a one-time redirect exactly 10 seconds after success — navigate("/login", { replace: true })
   *    sends the user to the login page. { replace: true } replaces the current history entry rather than pushing a new one, so clicking "back" after
   *    redirect won't take the user back to the (already-submitted) signup form.
   *
   * return () => { clearInterval(interval); clearTimeout(timeout); };
   *  - This is the effect's cleanup function. React calls it in two situations:
   *
   *  - Before the effect re-runs (if dependencies change again)
   *  - When the component unmounts
   *
   *  - Without this cleanup, if the user navigated away from the page manually before the 10 seconds finished, the interval would keep ticking and
   *    setSecondsLeft would be called on an unmounted component — a memory leak / React warning. clearInterval/clearTimeout cancel both timers
   *    so they never fire after the component is gone.
   *
   * [mutation.isSuccess, navigate] — the dependency array
   *  - The effect only re-executes when either value changes. navigate from useNavigate() is stable across renders (React Router memoizes it),
   *    so in practice this effect really only "restarts" meaningfully when mutation.isSuccess flips from false to true.
   */

  // const update =
  //   (field: keyof typeof initialForm) => (e: ChangeEvent<HTMLInputElement>) =>
  //     setForm((f) => ({ ...f, [field]: e.target.value }));

  // --- Same as above ---
  function update(field: keyof typeof initialForm) {
    return function (e: ChangeEvent<HTMLInputElement>) {
      setForm((f) => ({ ...f, [field]: e.target.value }));
    };
  }

  /**
   * (f) => (...) — again, the functional updater form, avoiding stale-closure bugs on rapid typing.
   * { ...f, [field]: e.target.value } — spreads all existing form values into a new object,
   * then overwrites just the one property named by field (computed property syntax) with the input's new value.
   * This produces a brand-new object (required for React to detect the state change) while leaving every other field untouched.
   *
   * Type safety: field: keyof typeof initialForm restricts the argument to only valid keys of the
   * form shape ("first_name" | "last_name" | "username" | "email" | "password" | "confirm_password") — so update("nonexistent_field") would be a compile-time error.
   *
   *
   * The one exception in the file — confirm_password's onChange doesn't use update(...) alone:
   * Here update("confirm_password") returns the handler function,
   * which is then immediately invoked with (e) — same underlying mechanism — but wrapped in an extra arrow function,
   * so a second side effect (clearing the mismatch error as soon as the user retypes) can run alongside it.
   *
   */

  const onSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (form.password != form.confirm_password) {
      setPasswordMisMatchError("Passwords do not match");
      return;
    }
    setPasswordMisMatchError(null);
    // Explicit field map -> exact UserCreate shape; confirm password never sent
    const data: UserCreate = {
      first_name: form.first_name,
      last_name: form.last_name,
      username: form.username,
      email: form.email,
      password: form.password,
    };
    mutation.mutate(data);
  };

  // --- Success panel ---
  if (mutation.isSuccess) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-md">
          <CheckCircle2 size={48} className="mx-auto text-green-600" />
          <h1 className="mb-2 mt-4 text-2xl font-semibold text-gray-900">
            Account created!
          </h1>
          <p className="text-sm text-gray-600">
            {mutation.data?.message} Please check your inbox (and spam folder).
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Redirecting to login in {Math.max(secondsLeft, 0)}s…
          </p>
          <Link
            to="/login"
            className="mt-6 inline-block rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // --- Signup form ---
  return (
    <div className="flex min-h-svh items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-2xl font-semibold text-gray-900">
          Create your account
        </h1>

        {mutation.isError && (
          <div className="mb-4">
            <ErrorMessage error={mutation.error} />
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="first_name"
                className="block text-sm font-medium text-gray-700"
              >
                First name
              </label>
              <input
                id="first_name"
                required
                maxLength={25}
                autoComplete="given-name"
                value={form.first_name}
                onChange={update("first_name")}
                placeholder="Jane"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <div>
              <label
                htmlFor="last_name"
                className="block text-sm font-medium text-gray-700"
              >
                Last name
              </label>
              <input
                id="last_name"
                required
                maxLength={25}
                autoComplete="family-name"
                value={form.last_name}
                onChange={update("last_name")}
                placeholder="Doe"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              id="username"
              required
              maxLength={8}
              autoComplete="username"
              value={form.username}
              onChange={update("username")}
              placeholder="janedoe"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

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
              maxLength={40}
              autoComplete="email"
              value={form.email}
              onChange={update("email")}
              placeholder="you@example.com"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="relative mt-1">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                autoComplete="new-password"
                value={form.password}
                onChange={update("password")}
                placeholder="At least 6 characters"
                className="w-full rounded-md border border-gray-300 px-3 py-2 pr-16 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-2 text-xs font-medium text-purple-600 hover:text-purple-800"
              >
                {form.password && (
                  <span>
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirm_password"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm password
            </label>
            <input
              id="confirm_password"
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              autoComplete="new-password"
              value={form.confirm_password}
              aria-invalid={!!passwordMisMatchError}
              // aria-invalid={!!confirmError} marks the input as invalid for assistive technology (screen readers) when there's a validation error — let's break down both parts.
              onChange={(e) => {
                update("confirm_password")(e);
                setPasswordMisMatchError(null); // clear error as soon as user retypes
              }}
              placeholder="Repeat password"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            {passwordMisMatchError && (
              <p className="mt-1 text-xs text-red-600">{passwordMisMatchError}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            aria-busy={mutation.isPending}
            className="w-full rounded-md bg-purple-600 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {mutation.isPending ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-purple-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
