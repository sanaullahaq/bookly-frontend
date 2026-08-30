import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";
import { useAuthStore } from "../features/auth/authStore";
import { logout } from "../features/auth/api";

export default function NavBar() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      useAuthStore.getState().logout();
      navigate("/login");
    }
  };

  return (
    <nav className="flex items-center justify-between bg-purple-700 px-6 py-3 text-white">
      <div className="text-lg font-semibold">
        <Link to="/">Bookly</Link>
      </div>

      {isAuthenticated() ? (
        <div className="flex items-center gap-4 text-sm">
          <Link to="/books" className="hover:underline">
            Books
          </Link>
          <span>{user?.first_name} {user?.last_name}</span>
          <button
            onClick={handleLogout}
            className="rounded bg-purple-900 px-3 py-1 text-xs font-semibold hover:bg-purple-800"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-4 text-sm">
          <Link to="/login" className="hover:underline">
            Login
          </Link>
          <Link to="/signup" className="hover:underline">
            Signup
          </Link>
        </div>
      )}
    </nav>
  );
}
