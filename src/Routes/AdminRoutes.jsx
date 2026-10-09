import { Route } from "react-router-dom";

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


const AdminRoutes = (
  <>
    {/* Admin */}
    <Route
      path="/admin"
      element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={["ADMIN"]}>
            <AdminDashboardLayout />
          </RoleRoute>
        </ProtectedRoute>
      }
    >
      <Route
        index
        element={<AdminDashboardHomePage />}
      />
      <Route
        path="entreprises"
        element={<AdminCompaniesPage />}
      />
      <Route
        path="entreprises/:id"
        element={<AdminCompanyDetailsPage />}
      />
      <Route
  path="demandes-demo"
  element={<AdminDemoRequestsPage />}
/>

<Route
  path="demandes-demo/:id"
  element={<AdminDemoRequestDetailsPage />}
/>

<Route
  path="/admin/campagnes"
  element={<AdminCampaignsPage />}
/>

<Route
  path="/admin/campagnes/:campaignId"
  element={<AdminCampaignDetailsPage />}
/>

<Route
  path="/admin/participants/:participantId"
  element={<AdminParticipantDetailsPage />}
/>
<Route
  path="/admin/qa/participants/:participantId"
  element={
    <AdminQaParticipantPage />
  }
/>
    </Route>
  </>
);

export default AdminRoutes;