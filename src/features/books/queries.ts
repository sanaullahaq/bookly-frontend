import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createBook, deleteBook, getBook, getBooks, updateBook } from "./api";
import type { BookCreate, BookUpdate } from "../../types/books";

export const bookKeys = {
  all: ["books"] as const,
  detail: (uid: string) => ["books", uid] as const,
};

export const useBooks = () =>
  useQuery({
    queryKey: bookKeys.all,
    queryFn: async () => {
      const { data } = await getBooks();
      return data;
    },
  });

export const useBook = (uid: string) =>
  useQuery({
    queryKey: bookKeys.detail(uid),
    queryFn: async () => {
      const { data } = await getBook(uid);
      return data;
    },
    enabled: !!uid,
    retry: false, // a 404 here is deterministic (book deleted/not found) — retrying won't fix it
  });

// Mutations will be called with mutateAsync
export const useCreateBook = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BookCreate) => createBook(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: bookKeys.all }),
  });
};

export const useUpdateBook = (uid: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BookUpdate) => updateBook(uid, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bookKeys.all });
      qc.invalidateQueries({ queryKey: bookKeys.detail(uid) });
    },
  });
};

export const useDeleteBook = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uid: string) => deleteBook(uid),
    // refetchType: "none" marks matched queries stale WITHOUT fetching them.
    // We're still on the detail page when this fires, so refetching the just-deleted
    // ["books", uid] would 404 for no value; the list refetches on next mount anyway.
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: bookKeys.all, refetchType: "none" }),
  });
};
