import apiClient from "../../lib/apiClient";
import type { ReviewCreate, ReviewOut } from "../../types/reviews";

const PREFIX = "reviews";

//Reviews
export const getReviews = () => apiClient.get<ReviewOut[]>(`/${PREFIX}/`);

export const getReview = (uid: string) =>
  apiClient.get<ReviewOut>(`/${PREFIX}/${uid}`);

export const addReview = (book_uid: string, review_data: ReviewCreate) =>
  apiClient.post<ReviewOut>(`/${PREFIX}/book/${book_uid}`, review_data);

export const deleteReview = (uid: string) =>
  apiClient.delete(`/${PREFIX}/${uid}`); // return 204, no body
