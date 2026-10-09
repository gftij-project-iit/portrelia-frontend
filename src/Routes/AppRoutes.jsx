import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import DemoRequestPage from "../pages/DemoRequestPage";

import AdminRoutes from "./AdminRoutes";
import PublicRoute from "./PublicRoutes";
import AccountActivationPage from "../pages/Admin/AccountActivationPage";
import CompanyRoutes from "./companyRoutes";

import ParticipantRoutes from "./ParticipantRoutes";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<PublicRoute><HomePage /></PublicRoute>} />
        <Route path="/connexion" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/demande-demo" element={<PublicRoute><DemoRequestPage /></PublicRoute>} />
        <Route path="/activation-compte" element={<PublicRoute><AccountActivationPage /></PublicRoute>} />

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