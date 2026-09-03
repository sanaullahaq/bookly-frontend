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
  });

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
      (qc.invalidateQueries({ queryKey: bookKeys.all }),
        qc.invalidateQueries({ queryKey: bookKeys.detail(uid) }));
    },
  });
};

export const useDeleteBook = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uid: string) => deleteBook(uid),
    onSuccess: () => qc.invalidateQueries({ queryKey: bookKeys.all }),
  });
};
