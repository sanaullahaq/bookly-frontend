import { useMutation } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { resetPassword } from "./api";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";
import ErrorMessage from "../../components/ErrorMessage";
import { useState, type ChangeEvent } from "react";
import type { PasswordResetConfirm } from "../../types/users";

const initialForm: PasswordResetConfirm = {
  new_password: "",
  confirm_new_password: "",
};

export default function ResetAccountPassword() {
  const { token } = useParams<{ token: string }>();
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordMisMatchError, setPasswordMisMatchError] = useState<
    string | null
  >(null);

  // define the mutation
  const mutation = useMutation({
    mutationFn: async (passwordResetConfirm: PasswordResetConfirm) => {
      const { data } = await resetPassword(token!, passwordResetConfirm);
      return data;
    },
  });

  function update(field: keyof typeof initialForm) {
    return function (e: ChangeEvent<HTMLInputElement>) {
      setForm((f) => ({ ...f, [field]: e.target.value }));
    };
  }

  // --- After email send ---
  if (mutation.isSuccess) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-md">
          <CheckCircle2 size={48} className="mx-auto text-green-600" />
          <h1 className="mb-2 mt-4 text-2xl font-semibold text-gray-900">
            Complete!
          </h1>
          <p className="text-sm text-gray-600">
            {mutation.data?.message}
            {/* <br /> */}
            {/* Please check your inbox (and spam folder). */}
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
        <h1 className="mb-6 text-2xl font-semibold text-gray-900">
          Enter new password
        </h1>

        {mutation.isError && (
          <div className="mb-4">
            <ErrorMessage error={mutation.error} />
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();

            if (form.new_password != form.confirm_new_password) {
              setPasswordMisMatchError("Passwords did not match");
              return;
            }

            setPasswordMisMatchError(null);

            const data: PasswordResetConfirm = {
              new_password: form.new_password,
              confirm_new_password: form.confirm_new_password,
            };

            mutation.mutate(data);
          }}
          className="space-y-4"
        >
          <div className="grid gap-4">
            <div>
              <label
                htmlFor="new_password"
                className="block text-sm font-medium text-gray-700"
              >
                New Password
              </label>
              <div className="relative mt-1">
                <input
                  id="new_password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  autoComplete="new_password"
                  value={form.new_password}
                  onChange={update("new_password")}
                  placeholder="At least 6 characters"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-2 text-xs font-medium text-purple-600 hover:text-purple-800"
                >
                  {form.new_password && (
                    <span>
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirm_new_password"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm New Password
              </label>
              <input
                id="confirm_new_password"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                autoComplete="new_password"
                value={form.confirm_new_password}
                aria-invalid={!!passwordMisMatchError}
                onChange={(e) => {
                  update("confirm_new_password")(e);
                  setPasswordMisMatchError(null); // clear error as soon as user retypes
                }}
                placeholder="Repeat password"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              {passwordMisMatchError && (
                <p className="mt-1 text-xs text-red-600">
                  {passwordMisMatchError}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={mutation.isPending}
              aria-busy={mutation.isPending}
              className="w-full rounded-md bg-purple-600 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {/* {mutation.isPending ? "Sending..." : "Sent Password Reset Link"} */}
              Change password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
