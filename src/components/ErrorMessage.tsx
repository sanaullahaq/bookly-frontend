import { parseApiError } from "../lib/errors";

export default function ErrorMessage({ error }: { error: unknown }) {
  const { message, resolution } = parseApiError(error);

  return (
    <div
      role="alert"
      className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      <p>{message}</p>
      {resolution && <p className="mt-1 text-red-600">{resolution}</p>}
    </div>
  );
}
