import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import LoginPage from "./features/auth/LoginPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      // Routes added in Phase 2
      { path: "login", element: <LoginPage /> },
    ],
  },
]);
