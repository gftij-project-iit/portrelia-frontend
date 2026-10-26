import { useContext } from "react";
import { Navigate } from "react-router-dom";

import { AuthContext } from "../context/AuthContext";
import { PageLoader } from "./RouteLoaders";

/* =========================================================
   ROUTE PROTÉGÉE — réservée aux utilisateurs connectés
========================================================= */

export default function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  // Vérification de la session en cours :
  // on affiche déjà le skeleton de la page demandée
  if (loading) {
    return <PageLoader />;
  }

  // Pas connecté → retour à l'accueil
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Connecté → la page s'affiche
  return children;
}