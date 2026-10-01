import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import ErrorMessage from "./ErrorMessage";

export default function ErrorBoundary() {
  const error = useRouteError();

  // Thrown/returned Response (e.g. a loader error) — has a real status.
  if (isRouteErrorResponse(error)) {
    return (
      <div className="mx-auto max-w-md p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900">
          {error.status} {error.statusText}
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          {typeof error.data === "string"
            ? error.data
            : "Something went wrong loading this page."}
        </p>
      </div>
    );
  }

  // Render-time throw — an Error instance.
  const message = error instanceof Error ? error.message : String(error);
  return (
    <div className="mx-auto max-w-md p-8 text-center">
      <h2 className="text-xl font-semibold text-gray-900">Something went wrong</h2>
      <ErrorMessage
        error={{ message, resolution: "Try reloading the page.", error_code: "ui_error" }}
      />
    </div>
  );
}
