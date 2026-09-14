// --- Reviews ---

export interface ReviewBase {
  rating: number;
  review_text: string;
}
export interface ReviewOut extends ReviewBase {
  uid: string;
  user_uid: string | null;
  book_uid: string | null;
  created_at: string;
  updated_at: string;
}

export type ReviewCreate = ReviewBase;
// ReviewCreate is nothing but ReviewBase
