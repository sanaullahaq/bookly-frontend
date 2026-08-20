// --- API Error shape (matches errors.py register_all_errors) ---
export interface ApiErrorPayload {
  message: string;
  resolution?: string;
  error_code: string;
}
