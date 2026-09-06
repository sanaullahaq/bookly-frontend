import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import LoginPage from "./features/auth/LoginPage";
import SignupPage from "./features/auth/SignupPage";
import VerifyEmailPage from "./features/auth/VerifyEmailPage";
import PasswordResetRequestPage from "./features/auth/PasswordResetRequestPage";
import ResetAccountPassword from "./features/auth/ResetAccountPassword";
import BooksListPage from "./features/books/BooksListPage";
import BookDetailPage from "./features/books/BookDetailPage";
import BookForm from "./features/books/BookForm";
import ProtectedRoute from "./components/ProtectedRoute";
import BookEditPage from "./features/books/BookEditPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      // Public auth routes
      { path: "login", element: <LoginPage /> },
      { path: "signup", element: <SignupPage /> },
      { path: "/api/v1/auth/verify/:token", element: <VerifyEmailPage /> },
      { path: "password-reset-request", element: <PasswordResetRequestPage /> },
      {
        path: "/api/v1/auth/password-reset-confirm/:token",
        element: <ResetAccountPassword />,
      },

      //Protected books routes
      {
        element: <ProtectedRoute />,
        children: [
          { path: "/books", element: <BooksListPage /> },
          { path: "/books/new", element: <BookForm mode="create" /> },
          { path: "/books/:uid", element: <BookDetailPage /> },
          { path: "/books/:uid/edit", element: <BookEditPage /> },
        ],
      },
    ],
  },
]);
