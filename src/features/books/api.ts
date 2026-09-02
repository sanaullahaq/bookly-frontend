import apiClient from "../../lib/apiClient";
import type {
  BookCreate,
  BookDetailOut,
  BookOut,
  BookUpdate,
} from "../../types/books";

const PREFIX = "books";

// Books
export const getBooks = () => apiClient.get<BookOut[]>(`/${PREFIX}/`);

export const getBook = (uid: string) =>
  apiClient.get<BookDetailOut>(`/${PREFIX}/${uid}`);

export const createBook = (data: BookCreate) =>
  apiClient.post<BookOut>(`/${PREFIX}/`, data);

export const updateBook = (uid: string, data: BookUpdate) =>
  apiClient.patch<BookOut>(`/${PREFIX}/${uid}`, data);

export const deleteBook = (uid: string) =>
  apiClient.delete(`/${PREFIX}/${uid}`); // return 204, no body
