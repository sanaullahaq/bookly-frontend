import { Navigate, useParams } from "react-router-dom";
import { useBook } from "./queries";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import BookForm from "./BookForm";

export default function BookEditPage() {
  const { uid } = useParams<{ uid: string }>();
  const { data: book, isLoading, isError, error } = useBook(uid ?? "");
  if (!uid) return <Navigate to="/books" replace />;
  if (isLoading) return <Loading />;
  if (isError || !book) return <ErrorMessage error={error} />;
  return <BookForm mode="edit" bookUid={uid} initialData={book} />;
}
