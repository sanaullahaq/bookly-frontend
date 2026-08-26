import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { verifyEmail } from "./api";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import ErrorMessage from "../../components/ErrorMessage";

export default function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>();

  // useQuery auto-fires on mount — no user action needed.
  // enabled: !!token guards against /verify without a token param.
  // retry: false — a bad/expired token will always fail, no point retrying.
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["verifyEmail", token],
    queryFn: async () => {
      const { data } = await verifyEmail(token!);
      // placing an exclamation mark (!) after a variable is called the Non-null Assertion Operator.
      // It tells the TypeScript compiler that the variable is definitely not null or undefined, overriding the compiler's strict null-checking warnings.
      return data; // {message: "Account verified successfully"}
    },
    enabled: !!token,
    retry: false,
  });

  return (
    <div className="flex min-h-svh items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-md">
        {/* --- Loading state --- */}
        {isLoading && (
          <>
            <Loader2
              size={48}
              className="mx-auto animate-spin text-purple-600"
            />
            <h1 className="mb-2 mt-4 text-2xl font-semibold text-gray-900">
              Verifying your email…
            </h1>
            <p className="text-sm text-gray-600">This only takes a moment.</p>
          </>
        )}

        {/* --- Success state --- */}
        {!isLoading && !isError && data && (
          <>
            <CheckCircle2 size={48} className="mx-auto text-green-600" />
            <h1 className="mb-2 mt-4 text-2xl font-semibold text-gray-900">
              Email verified!
            </h1>
            <p className="text-sm text-gray-600">{data.message}</p>
            <Link
              to="/login"
              className="mt-6 inline-block rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
            >
              Log in
            </Link>
          </>
        )}

        {/* --- Error state --- */}
        {!isLoading && isError && (
          <>
            {console.log(isError)}
            <XCircle size={48} className="mx-auto text-red-600" />
            <h1 className="mb-2 mt-4 text-2xl font-semibold text-gray-900">
              Verification failed
            </h1>
            <div className="mb-4">
              <ErrorMessage error={error} />
            </div>
            <p className="text-sm text-gray-500">
              The link may be expired or invalid or already used.
            </p>
            <Link
              to="/login"
              className="mt-4 inline-block rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
            >
              Go to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
