import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";



export default function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  // ⏳ attend check auth
  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  // ❌ pas connecté → login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // ✅ connecté
  return children;
}