import type { ReviewOut } from "./reviews";
import type { TagOut } from "./tags";

// --- Books ---

export interface BookBase {
  title: string;
  author: string;
  publisher: string;
  page_count: number;
  language: string;
}

export interface BookCreate extends BookBase {
  published_date: string;
}

export interface BookUpdate {
  title?: string;
  author?: string;
  publisher?: string;
  page_count?: number;
  language?: string;
  published_date?: string;
}

export interface BookOut extends BookBase {
  uid: string;
  published_date: string; // "YYYY-MM-DD"
  tags: TagOut[];
  created_at: string;
  updated_at: string;
}

export interface BookDetailOut extends BookOut {
  reviews: ReviewOut[];
}
