import { Outlet } from "react-router-dom";




import "./AdminDashboardLayout.css";
import AdminSidebar from "../pages/Admin/AdminSidebar";
import AdminTopbar from "../pages/Admin/AdminTopbar";

function AdminDashboardLayout() {
  return (
    <div className="admin-dashboard-layout">

      <AdminSidebar />

      <div className="admin-dashboard-main">

        <AdminTopbar />

        <main className="admin-dashboard-content">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default AdminDashboardLayout;