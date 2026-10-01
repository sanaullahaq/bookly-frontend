import { useState, type SyntheticEvent } from "react";
import type { TagAdd, TagCreate, TagOut } from "../../types/tags";
import { useAddTagsToBook, useRemoveTagFromBook, useTags } from "./queries";
import ErrorMessage from "../../components/ErrorMessage";
import { X } from "lucide-react";

export default function TagEditor({
  bookUid: bookUid,
  tags,
}: {
  bookUid: string;
  tags: TagOut[];
}) {
  const { data: allTags } = useTags();
  const addMutation = useAddTagsToBook(bookUid);
  const removeMutation = useRemoveTagFromBook(bookUid);
  const [newTag, setNewTag] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const name = newTag.trim();
  const alreadyAttached = tags.some((t) => t.name === name);
  // checks whether at least one element in an array passes a specific test implemented by a provided callback function.
  // It evaluates the array elements and immediately returns a boolean (true or false).

  async function handleAdd(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name) {
      setValidationError("Enter a tag name");
      return;
    }
    if (alreadyAttached) return;
    setValidationError(null);

    const tagCreate: TagCreate = {
      name: name,
    };
    const tagAdd: TagAdd = {
      tags: [tagCreate],
    };

    await addMutation.mutateAsync(tagAdd);
    setNewTag("");
  }

  async function handleRemove(tagUid: string) {
    await removeMutation.mutateAsync(tagUid);
  }

  return (
    <section className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
      <h2 className="mb-3 text-sm font-semibold text-gray-900">Tags</h2>
      {(addMutation.isError || removeMutation.isError || validationError) && (
        <div className="mb-4">
          <ErrorMessage
            error={
              addMutation.isError
                ? addMutation.error
                : removeMutation.isError
                  ? removeMutation.error
                  : { message: validationError ?? "", error_code: "validation" }
            }
          />
        </div>
      )}
      {tags.length === 0 && (
        <p className="mb-2 text-sm text-gray-500">
          No tags yet — add one below.
        </p>
      )}

      <div className="mb-3 flex flex-wrap gap-1">
        {tags.map((tag) => (
          <span
            key={tag.uid}
            className="group relative inline-flex items-center rounded-full bg-purple-100 py-0.5 pl-2 pr-2 text-xs text-purple-700"
          >
            {tag.name}
            <button
              type="button"
              onClick={() => handleRemove(tag.uid)}
              disabled={removeMutation.isPending}
              aria-label={`Remove tag ${tag.name}`}
              className="absolute -right-1 -top-1 rounded-full bg-white p-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-visible:opacity-100 hover:bg-purple-200 hover:text-purple-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X size={12} />
            </button>
          </span>
        ))}
      </div>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          list="existing-tags"
          placeholder="Add a tag..."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
        />
        <datalist id="existing-tags">
          {allTags
            ?.filter((t) => !tags.some((attached) => attached.name === t.name))
            .map((t) => (
              <option key={t.uid} value={t.name} />
            ))}
            {/* - Already attached (saved in db) tags to the book are being compared to the entire list of tags from db.
                - if true then it becomes false by negating (!) thus filtering out from being mapped as an <option />
            */}
        </datalist>
        <button
          type="submit"
          disabled={addMutation.isPending || !name || alreadyAttached}
          aria-busy={addMutation.isPending}
          className="rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {addMutation.isPending ? "Adding..." : "Add"}
        </button>
      </form>
    </section>
  );
}
