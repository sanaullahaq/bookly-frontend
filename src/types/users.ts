import type { BookOut } from "./books";
import type { ReviewOut } from "./reviews";

// --- Users ---
export interface UserOut {
  uid: string; // uuid serialized as string
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_verified: boolean;
  created_at: string; // ISO datetime string
  updated_at: string;
  // password_hash is excluded by Field(exclude=True) — never sent to frontend
}

export interface UserCreateResponse {
  message: string;
  user: UserOut;
}

export interface UserCreate {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  access_token: string;
  refresh_token: string;
  user: {
    user: string; // email
    uid: string;
  };
}

export interface RefreshResponse {
  access_token: string;
}

export interface UserDetailOut extends UserOut {
  books: BookOut[];
  reviews: ReviewOut[];
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  new_password: string;
  confirm_new_password: string;
}
