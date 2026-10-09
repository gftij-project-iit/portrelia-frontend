import { Route } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

import AdminDashboardLayout from "../layouts/AdminDashboardLayout";
import AdminDashboardHomePage from "../pages/Admin/AdminDashboardHomePage";
import AdminCompaniesPage from "../pages/Admin/AdminCompaniesPage";
import AdminCompanyDetailsPage from "../pages/Admin/AdminCompanyDetailsPage";
import AdminDemoRequestDetailsPage from "../pages/Admin/AdminDemoRequestDetailsPage";
import AdminDemoRequestsPage from "../pages/Admin/AdminDemoRequestsPage";


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
    </Route>
  </>
);

export default AdminRoutes;