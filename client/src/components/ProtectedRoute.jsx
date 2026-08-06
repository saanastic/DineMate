import { Navigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";

// roles: optional array of allowed roles e.g. ['manager','admin']
export default function ProtectedRoute({ children, roles } = {}) {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const user = useAppStore((state) => state.user);
  const isLoggedIn = typeof window !== "undefined" ? localStorage.getItem("isLoggedIn") : null;

  if (!isAuthenticated && !isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  if (roles && roles.length) {
    const role = user?.role || null;
    if (!role || !roles.includes(role)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}