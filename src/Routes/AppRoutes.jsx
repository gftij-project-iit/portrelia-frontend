import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

/* La landing page reste chargée tout de suite (c'est la 1re page vue) */
import HomePage from "../pages/HomePage";
import PublicRoute from "./PublicRoutes";
import CookieConsent from "../components/CookieConsent";
import { PageLoader } from "./RouteLoaders";

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

function AppRoutes() {
  return (
    <BrowserRouter>
      <CookieConsent />

      {/* Skeleton pendant le chargement d'une page (plus de spinner) */}
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