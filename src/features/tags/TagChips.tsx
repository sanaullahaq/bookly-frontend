import type { TagOut } from "../../types/tags";

export default function TagChips({ tags }: { tags: TagOut[] }) {
  if (tags.length === 0) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-1">
      {tags.map((tag) => (
        <span
          key={tag.uid}
          className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700"
        >
          {tag.name}
        </span>
      ))}
    </div>
  );
}

// Add Tag to a book, tag already existed
// Remove a tag from a book but keep it in the db
