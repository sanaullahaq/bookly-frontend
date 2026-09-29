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

// --- Agent prefill (GET /books/agent/get_book/{title}) ---
// Only title/author are guaranteed; the rest are nullable (agent may miss them).
export interface BookInfoOut {
  title: string;
  author: string;
  publisher?: string | null;
  page_count?: number | null;
  language?: string | null;
  published_date?: string | null; // "YYYY-MM-DD"
}
