import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";


function RequiredActionGuard({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/connexion" replace />;
  }

  if (user.role !== "COMPANY_ADMIN") {
    return children;
  }

  const requiredAction = user.requiredActions?.[0];

  if (!requiredAction) {
    return children;
  }

  if (location.pathname.startsWith("/required-actions/")) {
    return children;
  }

  return (
    <Navigate
      to={`/required-actions/${requiredAction.code}`}
      replace
    />
  );
}

export default RequiredActionGuard;