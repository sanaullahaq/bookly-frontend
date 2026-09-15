import axios from "axios";
import type { ApiErrorPayload } from "../types/apiErrorPayload";

export function parseApiError(error: unknown): ApiErrorPayload {
  if (axios.isAxiosError(error) && error.response) {
    const data = error.response.data; // typed as `any` by axios, but at least response.data is guaranteed to exist

    if (
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      "error_code" in data
    ) {
      return data as ApiErrorPayload;
    }
  }
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    "error_code" in error
  ) {
    return error as ApiErrorPayload;
  }
  return {
    message: "An unexpected error occurred",
    error_code: "unknown",
  };
}
