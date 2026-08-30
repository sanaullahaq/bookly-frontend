import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { verifyEmail } from "./api";
import { CheckCircle2, XCircle } from "lucide-react";
import ErrorMessage from "../../components/ErrorMessage";
import Loading from "../../components/Loading";

export default function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>();
  /**
  * 1. React Router can't infer params from your router config. TypeScript has no way to look at router.tsx and know that verify/:token defines a token param. Without the generic, useParams() returns { [key: string]: string | undefined } — a generic dictionary where every key is optional. With <{ token: string }>, you're explicitly telling TypeScript "this route has a param called token, and it's a string."
  * 2. It makes the rest of the code type-safe. Without it:
  * const { token } = useParams();
  * // token: string | undefined
  * 
  * // Every usage becomes a type error:
  * verifyEmail(token);   // ❌ Argument of type 'string | undefined' is not assignable to parameter of type 'string'
  * With it:
  * const { token } = useParams<{ token: string }>();
  * // token: string | undefined  (still optional! TypeScript knows route params can be absent)
  * 
  * // Still needs non-null assertion because the generic doesn't make it required:
  * verifyEmail(token!);  // ✅ you assert it exists
  * The <{ token: string }> generic doesn't remove undefined — it just gives the param a name and a type. The param is still optional because TypeScript correctly reasons that someone could navigate to /verify without a token. The enabled: !!token guard + token! assertion are what close the gap at runtime.
  * This is a known limitation in React Router v7 — type-safe routing from the router definition isn't built in. Libraries like TanStack Router solve this by making the router itself carry type information, but that requires a different architecture.
  * */ 

  
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
            {/* <Loader2
              size={48}
              className="mx-auto animate-spin text-purple-600"
            /> */}
            <Loading />
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
            {/* {console.log(isError)} */}
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
