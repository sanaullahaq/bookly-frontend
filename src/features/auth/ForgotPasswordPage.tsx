import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import type { PasswordResetRequest } from "../../types/users";
import { requestPasswordReset } from "./api";
import ErrorMessage from "../../components/ErrorMessage";
import { CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  // const navigate = useNavigate();
  const [email, setEmail] = useState("");

  // define the mutation
  const mutation = useMutation({
    mutationFn: async ({ email }: PasswordResetRequest) => {
      const { data } = await requestPasswordReset({ email });
      return data;
    },
  });

  // --- After email send ---
  if (mutation.isSuccess) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-md">
          <CheckCircle2 size={48} className="mx-auto text-green-600" />
          <h1 className="mb-2 mt-4 text-2xl font-semibold text-gray-900">
            Link sent!
          </h1>
          <p className="text-sm text-gray-600">
            {mutation.data?.message}
            <br />
            Please check your inbox (and spam folder).
          </p>
          <Link
            to="/login"
            className="mt-6 inline-block rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        {mutation.isError && (
          <div className="mb-4">
            <ErrorMessage error={mutation.error} />
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate({ email: email.trim() });
          }}
          className="space-y-4"
        >
          <div className="grid gap-4">
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
            <button
              type="submit"
              disabled={mutation.isPending}
              aria-busy={mutation.isPending}
              className="w-full rounded-md bg-purple-600 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {mutation.isPending ? "Sending..." : "Sent Password Reset Link"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
