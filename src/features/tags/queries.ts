import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addTagsToBook, getTags, removeTagFromBook } from "./api";
import type { TagAdd } from "../../types/tags";
import { bookKeys } from "../books/queries";

export const tagKeys = { all: ["tags"] as const };

export const useTags = () =>
  useQuery({
    queryKey: tagKeys.all,
    queryFn: async () => {
      const { data } = await getTags();
      return data;
    },
  });

export const useAddTagsToBook = (book_uid: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tags: TagAdd) => addTagsToBook(book_uid, tags),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bookKeys.detail(book_uid) });
      qc.invalidateQueries({ queryKey: bookKeys.all }); // list-card chips
      qc.invalidateQueries({ queryKey: tagKeys.all }); // find-or-create may add a picker entry
    },
  });
};

export const useRemoveTagFromBook = (book_uid: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tag_uid: string) => removeTagFromBook(book_uid, tag_uid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bookKeys.detail(book_uid) });
      qc.invalidateQueries({ queryKey: bookKeys.all }); // the tag itself persists
    },
  });
};
