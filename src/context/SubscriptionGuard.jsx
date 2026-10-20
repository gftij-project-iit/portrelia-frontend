
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

function SubscriptionGuard({ children }) {
  const { user, loading } = useAuth();

  // Attendre la vérification de session
  if (loading) {
    return null;
  }

  // Utilisateur non connecté
  if (!user) {
    return <Navigate to="/connexion" replace />;
  }

  // Seuls les administrateurs d'entreprise
  // sont concernés par les abonnements
  if (user.role !== "COMPANY_ADMIN") {
    return children;
  }

  const subscription = user.subscription;

  // Aucun abonnement ou abonnement non actif
  if (!subscription || subscription.status !== "ACTIVE") {
    return (
      <Navigate
        to="/dashboard/abonnement/choisir"
        replace
      />
    );
  }

  // Abonnement actif : accès autorisé
  return children;
}

export default SubscriptionGuard;
