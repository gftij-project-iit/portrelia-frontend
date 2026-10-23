import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import DemoRequestPage from "../pages/DemoRequestPage";

import AdminRoutes from "./AdminRoutes";
import PublicRoute from "./PublicRoutes";
import AccountActivationPage from "../pages/Admin/AccountActivationPage";
import CompanyRoutes from "./companyRoutes";

import ParticipantRoutes from "./ParticipantRoutes";
import PublicGalleryPage from "../pages/company/gallery/PublicGalleryPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import CookieConsent from "../components/CookieConsent";
import LegalPage from "../pages/legal/LegalPage";
import ContactPage from "../pages/ContactPage";

function AppRoutes() {
  return (
    <BrowserRouter>
    <CookieConsent />
      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<PublicRoute><HomePage /></PublicRoute>} />
        <Route path="/connexion" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/demande-demo" element={<PublicRoute><DemoRequestPage /></PublicRoute>} />
        <Route path="/contact" element={<PublicRoute><ContactPage /></PublicRoute>} />
        <Route path="/activation-compte" element={<PublicRoute><AccountActivationPage /></PublicRoute>} />
        <Route path="/galerie-partagee/:token" element={<PublicGalleryPage />} />
        <Route
          path="/mot-de-passe-oublie"
          element={<ForgotPasswordPage />}
        />

      <Route
        path="/reinitialiser-mot-de-passe"
        element={<ResetPasswordPage />}
      />

      {/* PAGES LÉGALES PUBLIQUES */}
      <Route
        path="/politique-confidentialite"
        element={<LegalPage />}
      />

      <Route
        path="/mentions-legales"
        element={<LegalPage />}
      />

      <Route
        path="/cgu"
        element={<LegalPage />}
      />

      <Route
        path="/cgv"
        element={<LegalPage />}
      />

      <Route
        path="/politique-cookies"
        element={<LegalPage />}
      />
        {/* ADMIN */}
        {AdminRoutes}
        {/* ENTREPRISE */}
        {CompanyRoutes}
        {/* PARTICIPANT */}
        {ParticipantRoutes}
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;