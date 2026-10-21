
import { Route } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

import CompanyDashboardLayout from "../layouts/CompanyDashboardLayout";

import CompanyDashboardHomePage from "../pages/company/CompanyDashboardHomePage";

import CampaignsPage from "../pages/company/campaigns/CampaignsPage";
import CreateCampaignPage from "../pages/company/campaigns/CreateCampaignPage";
import CampaignDetailPage from "../pages/company/campaigns/CampaignDetailPage";

import RequiredActionGuard from "../context/RequiredActionGuard";
import RequiredActionPage from "../pages/RequiredActionPage";

import SubscriptionGuard from "../context/SubscriptionGuard";
import ChoosePlanPage from "../pages/company/subscription/ChoosePlanPage";
import SubscriptionPage from "../pages/company/subscription/SubscriptionPage";
import BillingPage from "../pages/company/billing/BillingPage";
import CollaboratorsPage from "../pages/company/collaborators/CollaboratorsPage";
import GalleryPage from "../pages/company/gallery/GalleryPage";
import SettingsPage from "../pages/company/settings/SettingsPage";

const CompanyRoutes = (
  <>
    {/* ==========================================
        ACTIONS OBLIGATOIRES
    ========================================== */}

    <Route
      path="/required-actions/:code"
      element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={["COMPANY_ADMIN"]}>
            <RequiredActionPage />
          </RoleRoute>
        </ProtectedRoute>
      }
    />

    {/* ==========================================
        CHOIX ABONNEMENT
        Accessible sans abonnement actif
    ========================================== */}

    <Route
      path="/dashboard/abonnement/choisir"
      element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={["COMPANY_ADMIN"]}>
            <RequiredActionGuard>
              <ChoosePlanPage />
            </RequiredActionGuard>
          </RoleRoute>
        </ProtectedRoute>
      }
    />

    {/* ==========================================
        DASHBOARD ENTREPRISE
        Abonnement actif obligatoire
    ========================================== */}

    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={["COMPANY_ADMIN"]}>
            <RequiredActionGuard>
              <SubscriptionGuard>
                <CompanyDashboardLayout />
              </SubscriptionGuard>
            </RequiredActionGuard>
          </RoleRoute>
        </ProtectedRoute>
      }
    >
      {/* DASHBOARD */}

      <Route
        index
        element={<CompanyDashboardHomePage />}
      />

      {/* CAMPAGNES */}

      <Route
        path="campagnes"
        element={<CampaignsPage />}
      />

      <Route
        path="campagnes/creer"
        element={<CreateCampaignPage />}
      />

      <Route
        path="campagnes/:id"
        element={<CampaignDetailPage />}
      />

      <Route
        path="collaborateurs"
        element={<CollaboratorsPage />}
      />
      <Route
        path="galerie"
        element={<GalleryPage />}
      />

      <Route
        path="abonnement"
        element={<SubscriptionPage />}
      />
      <Route
        path="facturation"
        element={<BillingPage />}
      />
       <Route
        path="parametres"
        element={<SettingsPage />}
      />
    </Route>
  </>
);

export default CompanyRoutes;
