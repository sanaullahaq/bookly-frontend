import apiClient from "../../lib/apiClient";
import type { BookOut } from "../../types/books";
import type { TagAdd, TagOut } from "../../types/tags";

const PREFIX = "tags";

export const getTags = () => apiClient.get<TagOut[]>(`/${PREFIX}/`);

export const addTagsToBook = (book_uid: string, tags: TagAdd) =>
  apiClient.post<BookOut>(`/${PREFIX}/book/${book_uid}/tags`, tags);

export const removeTagFromBook = (book_uid: string, tag_uid: string) =>
  apiClient.delete<BookOut>(`/${PREFIX}/book/${book_uid}/tags/${tag_uid}`);
