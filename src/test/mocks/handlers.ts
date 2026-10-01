import { http, HttpResponse } from "msw";
import type { LoginResponse, UserDetailOut } from "../../types/users";
import type { BookDetailOut, BookOut } from "../../types/books";
import type { ReviewOut } from "../../types/reviews";
import type { TagOut } from "../../types/tags";

const BASE = import.meta.env.VITE_API_BASE_URL as string;

export const bookDetail = (uid: string): BookDetailOut => ({
  uid,
  title: "The Great Gatsby",
  author: "F. Scott Fitzgerald",
  publisher: "Scribner",
  page_count: 180,
  language: "English",
  published_date: "1925-04-10",
  tags: [{ uid: "tag-1", name: "classic", created_at: "2024-01-01T00:00:00" }],
  created_at: "2024-01-01T00:00:00",
  updated_at: "2024-01-01T00:00:00",
  reviews: [],
});

export const tagList: TagOut[] = [
  { uid: "tag-1", name: "classic", created_at: "2024-01-01T00:00:00" },
  { uid: "tag-2", name: "sci-fi", created_at: "2024-01-01T00:00:00" },
];

export const review: ReviewOut = {
  uid: "review-1",
  user_uid: "user-1",
  book_uid: "book-1",
  rating: 4,
  review_text: "Great read.",
  created_at: "2024-01-01T00:00:00",
  updated_at: "2024-01-01T00:00:00",
};

export const handlers = [
  // --- auth ---
  http.post(`${BASE}/auth/login`, async () => {
    const body: LoginResponse = {
      message: "Login successful",
      access_token: "mock-access-token",
      refresh_token: "mock-refresh-token",
      user: { user: "test@example.com", uid: "user-1" },
    };
    return HttpResponse.json(body);
  }),
  // LoginPage's mutationFn calls getCurrentUser() immediately after login,
  // so a login test needs this handler or the flow stalls on it.
  http.get(`${BASE}/auth/me`, () =>
    HttpResponse.json<UserDetailOut>({
      ...bookDetail("book-1"),
      uid: "user-1",
      username: "testuser",
      email: "test@example.com",
      first_name: "Test",
      last_name: "User",
      is_verified: true,
      created_at: "2024-01-01T00:00:00",
      updated_at: "2024-01-01T00:00:00",
      books: [],
      reviews: [],
    })
  ),

  // --- books ---
  http.get(`${BASE}/books/`, () => {
    const books: BookOut[] = [bookDetail("book-1")];
    return HttpResponse.json(books);
  }),
  http.get(`${BASE}/books/:uid`, ({ params }) =>
    HttpResponse.json(bookDetail(String(params.uid)))
  ),

  // --- reviews ---
  http.post(`${BASE}/reviews/`, () => HttpResponse.json(review, { status: 201 })),
  http.delete(`${BASE}/reviews/:uid`, () => new HttpResponse(null, { status: 204 })),

  // --- tags ---
  http.get(`${BASE}/tags/`, () => HttpResponse.json(tagList)),
  http.post(`${BASE}/tags/book/:book_uid/tags`, ({ params }) =>
    HttpResponse.json(bookDetail(String(params.book_uid)))
  ),
  http.delete(`${BASE}/tags/book/:book_uid/tags/:tag_uid`, ({ params }) =>
    HttpResponse.json(bookDetail(String(params.book_uid)))
  ),
];
