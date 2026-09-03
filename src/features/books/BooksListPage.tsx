import { Link } from "react-router-dom";
import ErrorMessage from "../../components/ErrorMessage";
import Loading from "../../components/Loading";
import { useBooks } from "./queries";
import { Plus } from "lucide-react";

export default function BooksListPage() {
  const { data: books, isLoading, isError, error } = useBooks();

  if (isLoading) return <Loading />;
  if (isError) return <ErrorMessage error={error} />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Books</h1>
        <Link
          to="/books/new"
          className="inline-flex items-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
        >
          <Plus size={16} /> Create Book
        </Link>
      </div>

      {books && books.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-600">No books yet. Create your first book!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {books?.map((book) => (
            <Link
              key={book.uid}
              to={`/books/${book.uid}`}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <h2 className="mb-1 font-semibold text-gray-900">{book.title}</h2>
              <p className="text-sm text-gray-600">by {book.author}</p>
              <p className="mt-2 text-xs text-gray-500">
                {book.publisher} · {book.language}
              </p>
              {book.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {book.tags.map((tag) => (
                    <span
                      key={tag.uid}
                      className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
