import { useNavigate } from "react-router-dom";
import type { BookCreate, BookUpdate } from "../../types/books";
import { useState, type ChangeEvent, type SyntheticEvent } from "react";
import { useCreateBook, useUpdateBook } from "./queries";
import ErrorMessage from "../../components/ErrorMessage";

export default function BookForm({
  mode,
  bookUid,
  initialData,
}: {
  mode: "create" | "edit";
  bookUid?: string;
  initialData?: BookUpdate;
}) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: initialData?.title ?? "",
    author: initialData?.author ?? "",
    publisher: initialData?.publisher ?? "",
    page_count: initialData?.page_count?.toString() ?? "",
    language: initialData?.language ?? "",
    published_date: initialData?.published_date ?? "",
  });

  const [validationError, setValidationError] = useState<string | null>(null);
  const createMutation = useCreateBook();
  const updateMutation = useUpdateBook(bookUid ?? "");
  const mutation = mode === "create" ? createMutation : updateMutation;

  function castCreate(): BookCreate {
    return {
      ...form,
      page_count: Number(form.page_count),
      published_date: form.published_date,
    };
  }

  //   This method will be scaled later
  function castUpdate(): BookUpdate {
    return {
      ...(form.title ? { title: form.title } : {}),
      ...(form.author ? { author: form.author } : {}),
      ...(form.publisher ? { publisher: form.publisher } : {}),
      ...(form.page_count ? { page_count: Number(form.page_count) } : {}),
      ...(form.language ? { language: form.language } : {}),
      ...(form.published_date ? { published_date: form.published_date } : {}),
    };
  }

  function update(field: keyof typeof form) {
    return (e: ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();

    const pageCount = Number(form.page_count);

    if (!form.title || !form.author || !form.publisher || !form.language) {
      setValidationError("All fields are required.");
      return;
    }

    if (!Number.isInteger(pageCount) || pageCount <= 0) {
      setValidationError("Page count must be a positive integer");
      return
    }

    setValidationError(null);

    const res = await (mode === "create"
      ? createMutation.mutateAsync(castCreate())
      : updateMutation.mutateAsync(castUpdate()));

    // *** Why the alias can't be used for the submit call (why we can't use the `mutation` variable declared above) ***
    //
    //  createMutation and updateMutation have different payload types (BookCreate vs BookUpdate). mutation is their union:
    //
    //  UseMutationResult<AxiosResponse<BookOut>, Error, BookCreate>
    //   | UseMutationResult<AxiosResponse<BookOut>, Error, BookUpdate>
    //
    // When you call a method on a union, TypeScript requires the argument to satisfy both signatures — i.e. BookCreate & BookUpdate.
    // So mutation.mutateAsync(castCreate()) and mutation.mutateAsync(castUpdate()) both fail to typecheck (or silently coerce in unhappy ways).
    // That's precisely why handleSubmit must branch and call each mutateAsync with its own typed payload.

    const uid = mode === "create" ? res.data?.uid : bookUid!;
    navigate(`/books/${uid}`);
  }

  return (
    <div className="mx-auto max-w-lg rounded-lg bg-white p-6 shadow-md">
      <h1 className="mb-4 text-xl font-semibold text-gray-900">
        {mode === "create" ? "Create Book" : "Edit Book"}
      </h1>

      {mutation.isError && (
        <div className="mb-4">
          <ErrorMessage error={mutation.error} />
        </div>
      )}
      {validationError && (
        <div className="mb-4">
          <ErrorMessage
            error={{ message: validationError, error_code: "validation" }}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {(
          [
            ["title", "Title"],
            ["author", "Author"],
            ["publisher", "Publisher"],
            ["language", "Language"],
          ] as const
        ).map(([field, label]) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700">
              {label}
            </label>
            <input
              value={form[field]}
              onChange={update(field)}
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Page Count
          </label>
          <input
            type="number"
            min={1}
            value={form["page_count"]}
            onChange={update("page_count")}
            required
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Published Date
          </label>
          <input
            type="date"
            value={form["published_date"]}
            onChange={update("published_date")}
            required
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          aria-busy={mutation.isPending}
          className="w-full rounded-md bg-purple-600 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {mutation.isPending
            ? mode === "create"
              ? "Creating..."
              : "Saving..."
            : mode === "create"
              ? "Create Book"
              : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
