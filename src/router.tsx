import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import LoginPage from "./features/auth/LoginPage";
import SignupPage from "./features/auth/SignupPage";
import VerifyEmailPage from "./features/auth/VerifyEmailPage";
import PasswordResetRequestPage from "./features/auth/PasswordResetRequestPage";
import ResetAccountPassword from "./features/auth/ResetAccountPassword";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      // Routes added in Phase 2
      { path: "login", element: <LoginPage /> },
      { path: "signup", element: <SignupPage /> },
      { path: "/api/v1/auth/verify/:token", element: <VerifyEmailPage /> },
      { path: "password-reset-request", element: <PasswordResetRequestPage /> },
      {
        path: "/api/v1/auth/password-reset-confirm/:token",
        element: <ResetAccountPassword />,
      },
    ],
  },
]);
