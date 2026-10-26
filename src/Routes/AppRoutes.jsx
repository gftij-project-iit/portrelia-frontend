import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

/* La landing page reste chargée tout de suite (c'est la 1re page vue) */
import HomePage from "../pages/HomePage";
import PublicRoute from "./PublicRoutes";
import CookieConsent from "../components/CookieConsent";

import AdminRoutes from "./AdminRoutes";
import CompanyRoutes from "./companyRoutes";
import ParticipantRoutes from "./ParticipantRoutes";

/* Toutes les autres pages sont chargées SEULEMENT quand on y va */
const LoginPage = lazy(() => import("../pages/LoginPage"));
const DemoRequestPage = lazy(() => import("../pages/DemoRequestPage"));
const ContactPage = lazy(() => import("../pages/ContactPage"));
const AccountActivationPage = lazy(() => import("../pages/Admin/AccountActivationPage"));
const PublicGalleryPage = lazy(() => import("../pages/company/gallery/PublicGalleryPage"));
const ForgotPasswordPage = lazy(() => import("../pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("../pages/ResetPasswordPage"));
const LegalPage = lazy(() => import("../pages/legal/LegalPage"));

/* Affiché pendant le chargement d'une page (quelques millisecondes) */
function PageLoader() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      aria-busy="true"
      aria-label="Chargement"
    >
      <div
        style={{
          width: 36,
          height: 36,
          border: "3px solid #e5e7eb",
          borderTopColor: "#111827",
          borderRadius: "50%",
          animation: "portrelia-spin 0.8s linear infinite",
        }}
      />
      <style>{"@keyframes portrelia-spin{to{transform:rotate(360deg)}}"}</style>
    </div>
  );
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <CookieConsent />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* PUBLIC */}
          <Route path="/" element={<PublicRoute><HomePage /></PublicRoute>} />
          <Route path="/connexion" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/demande-demo" element={<PublicRoute><DemoRequestPage /></PublicRoute>} />
          <Route path="/contact" element={<PublicRoute><ContactPage /></PublicRoute>} />
          <Route path="/activation-compte" element={<PublicRoute><AccountActivationPage /></PublicRoute>} />
          <Route path="/galerie-partagee/:token" element={<PublicGalleryPage />} />
          <Route path="/mot-de-passe-oublie" element={<ForgotPasswordPage />} />
          <Route path="/reinitialiser-mot-de-passe" element={<ResetPasswordPage />} />

          {/* PAGES LÉGALES PUBLIQUES */}
          <Route path="/politique-confidentialite" element={<LegalPage />} />
          <Route path="/mentions-legales" element={<LegalPage />} />
          <Route path="/cgu" element={<LegalPage />} />
          <Route path="/cgv" element={<LegalPage />} />
          <Route path="/politique-cookies" element={<LegalPage />} />

          {/* ADMIN */}
          {AdminRoutes}
          {/* ENTREPRISE */}
          {CompanyRoutes}
          {/* PARTICIPANT */}
          {ParticipantRoutes}
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default AppRoutes;