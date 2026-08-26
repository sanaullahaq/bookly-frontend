import apiClient from "../../lib/apiClient";
import type {
  UserCreateResponse,
  UserCreate,
  LoginResponse,
  UserDetailOut,
  PasswordResetRequest,
  PasswordResetConfirm,
  UserLogin,
} from "../../types/users";

// Auth
export const signup = (data: UserCreate) =>
  apiClient.post<UserCreateResponse>("/auth/signup", data);

export const login = (data: UserLogin) =>
  apiClient.post<LoginResponse>("/auth/login", data);

export const logout = () => apiClient.get("/auth/logout");

export const verifyEmail = (token: string) =>
  apiClient.get(`/auth/verify/${token}`);

export const requestPasswordReset = (data: PasswordResetRequest) =>
  apiClient.post("/auth/password-reset-request", data);

export const resetPassword = (token: string, data: PasswordResetConfirm) =>
  apiClient.post(`/auth/password-reset-confirm/${token}`, data);

export const getCurrentUser = () => apiClient.get<UserDetailOut>("/auth/me");