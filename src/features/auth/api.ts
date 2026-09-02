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

const PREFIX = "auth";

// Auth
export const signup = (data: UserCreate) =>
  apiClient.post<UserCreateResponse>(`/${PREFIX}/signup`, data);

export const login = (data: UserLogin) =>
  apiClient.post<LoginResponse>(`/${PREFIX}/login`, data);

export const logout = () => apiClient.get(`/${PREFIX}/logout`);

export const verifyEmail = (token: string) =>
  apiClient.get(`/${PREFIX}/verify/${token}`);

export const requestPasswordReset = (data: PasswordResetRequest) =>
  apiClient.post(`/${PREFIX}/password-reset-request`, data);

export const resetPassword = (token: string, data: PasswordResetConfirm) =>
  apiClient.post(`/${PREFIX}/password-reset-confirm/${token}`, data);

export const getCurrentUser = () =>
  apiClient.get<UserDetailOut>(`/${PREFIX}/me`);
