import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useBook, useDeleteBook } from "./queries";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import { Pencil, Trash2 } from "lucide-react";
import ConfirmDialog from "../../components/ConfirmDialog";

export default function BookDetailPage() {
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const [showDeleteConfirmDialog, setShowDeleteConfirm] = useState(false);

  const { data: book, isLoading, isError, error } = useBook(uid ?? "");

  const deleteMutation = useDeleteBook();

  async function handleDelete() {
    setShowDeleteConfirm(false);
    await deleteMutation.mutateAsync(uid!);
    navigate("/books");
  }

  if (isLoading) return <Loading />;
  if (isError || !book) return <ErrorMessage error={error} />;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">{book?.title}</h1>
        <div className="flex gap-2">
          <Link
            to={`/books/${book?.uid}/edit`}
            className="inline-flex items-center gap-1 rounded-md bg-purple-600 px-3 py-2 text-sm font-semibold text-white hover:bg-purple-700"
          >
            <Pencil size={14} /> Edit
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-1 rounded-md border border-red-300 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>
      <div className="space-y-2 rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-700">
        <p>
          <span className="font-medium">Author: </span>
          {book?.author}
        </p>
        <p>
          <span className="font-medium">Publisher: </span>
          {book?.publisher}
        </p>
        <p>
          <span className="font-medium">Pages: </span>
          {book?.page_count}
        </p>
        <p>
          <span className="font-medium">Language: </span>
          {book?.language}
        </p>
        <p>
          <span className="font-medium">Published: </span>
          {book?.published_date}
        </p>
      </div>
      {/* -- Phase 4: <TagChips bookUid={uid} tags={book.tags} /> -- */}
      {/* -- Phase 4: <ReviewList reviews={book.reviews} -- /> */}
      {/* -- Phase 4: <ReviewForm bookUid={uid} /> -- */}

      <ConfirmDialog
        open={showDeleteConfirmDialog}
        title="Delete book?"
        message={`Are you sure you want to delete "${book?.title}"? This can't be undone.`}
        confirmLabel="Delete"
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
