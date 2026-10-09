import { Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";
import CompanyDashboardLayout from "../layouts/CompanyDashboardLayout";
import CompanyDashboardHomePage from "../pages/company/CompanyDashboardHomePage";
import CampaignsPage from "../pages/company/campaigns/CampaignsPage";
import CreateCampaignPage from "../pages/company/campaigns/CreateCampaignPage";
import CampaignDetailPage from "../pages/company/campaigns/CampaignDetailPage";





const CompanyRoutes = (
  <>
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={["COMPANY_ADMIN"]}>
            <CompanyDashboardLayout />
          </RoleRoute>
        </ProtectedRoute>
      }
    >
      <Route index element={<CompanyDashboardHomePage />} />
      <Route path="campagnes" element={<CampaignsPage />} />
      <Route path="campagnes/creer" element={<CreateCampaignPage />} />
      <Route path="campagnes/:id" element={<CampaignDetailPage />} />
    </Route>
  </>
);

export default CompanyRoutes;