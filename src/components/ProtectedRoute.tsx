import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  //   Either /login or Outlet
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  return <Outlet />;
}
