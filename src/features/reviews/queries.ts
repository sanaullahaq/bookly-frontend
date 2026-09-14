import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ReviewCreate } from "../../types/reviews";
import { addReview, deleteReview } from "./api";
import { bookKeys } from "../books/queries";

export const useAddReview = (bookUid: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ReviewCreate) => addReview(bookUid, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bookKeys.detail(bookUid) });
    },
  });
};

export const useDeleteReview = (bookUid: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reviewUid: string) => deleteReview(reviewUid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bookKeys.detail(bookUid) });
    },
  });
};
