import {
  Route,
} from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

import AdminDashboardLayout from "../layouts/AdminDashboardLayout";

import AdminCompaniesPage from "../pages/Admin/companies/AdminCompaniesPage";
import AdminCompanyDetailsPage from "../pages/Admin/companies/AdminCompanyDetailsPage";

import AdminDemoRequestDetailsPage from "../pages/Admin/DemoRequest/AdminDemoRequestDetailsPage";
import AdminDemoRequestsPage from "../pages/Admin/DemoRequest/AdminDemoRequestsPage";

import AdminDashboardHomePage from "../pages/Admin/dashboard/AdminDashboardHomePage";

import AdminCampaignsPage from "../pages/Admin/compagnes/AdminCampaignsPage";
import AdminCampaignDetailsPage from "../pages/Admin/compagnes/AdminCampaignDetailsPage";
import AdminParticipantDetailsPage from "../pages/Admin/compagnes/AdminParticipantDetailsPage";

import AdminQaParticipantPage from "../pages/Admin/adminQA/AdminQaParticipantPage";
import AdminGenerationParticipantPage from "../pages/Admin/adminQA/AdminGenerationParticipantPage";
import AdminQaPortraitsPage from "../pages/Admin/adminQA/AdminQaPortraitsPage";
import AdminGalleriesPage from "../pages/Admin/adminGalleries/AdminGalleriesPage";


const AdminRoutes = (
  <>
    <Route
      path="/admin"
      element={
        <ProtectedRoute>
          <RoleRoute
            allowedRoles={[
              "ADMIN",
            ]}
          >
            <AdminDashboardLayout />
          </RoleRoute>
        </ProtectedRoute>
      }
    >

      {/* =====================================================
          DASHBOARD
      ====================================================== */}

      <Route
        index
        element={
          <AdminDashboardHomePage />
        }
      />

      {/* =====================================================
          ENTREPRISES
      ====================================================== */}

      <Route
        path="entreprises"
        element={
          <AdminCompaniesPage />
        }
      />

      <Route
        path="entreprises/:id"
        element={
          <AdminCompanyDetailsPage />
        }
      />

      {/* =====================================================
          DEMANDES DEMO
      ====================================================== */}

      <Route
        path="demandes-demo"
        element={
          <AdminDemoRequestsPage />
        }
      />

      <Route
        path="demandes-demo/:id"
        element={
          <AdminDemoRequestDetailsPage />
        }
      />

      {/* =====================================================
          CAMPAGNES
      ====================================================== */}

      <Route
        path="campagnes"
        element={
          <AdminCampaignsPage />
        }
      />

      <Route
        path="campagnes/:campaignId"
        element={
          <AdminCampaignDetailsPage />
        }
      />

      {/* =====================================================
          PARTICIPANTS
      ====================================================== */}

      <Route
        path="participants/:participantId"
        element={
          <AdminParticipantDetailsPage />
        }
      />

      {/* =====================================================
          QA PHOTOS SOURCE
      ====================================================== */}

      <Route
        path="qa/participants/:participantId"
        element={
          <AdminQaParticipantPage />
        }
      />

      {/* =====================================================
          GENERATION
      ====================================================== */}

      <Route
        path="generations/participants/:participantId"
        element={
          <AdminGenerationParticipantPage />
        }
      />
      <Route
        path="qa-portraits/participants/:participantId"
        element={
        <AdminQaPortraitsPage />
       }
      />
       <Route
          path="galeries"
          element={<AdminGalleriesPage />}
        />

    </Route>
  </>
);

export default AdminRoutes;