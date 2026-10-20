import { useState } from "react";
import { Outlet } from "react-router-dom";

import AdminSidebar from "../pages/Admin/AdminSidebar";
import AdminTopbar from "../pages/Admin/AdminTopbar";

import "./AdminDashboardLayout.css";

function AdminDashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () =>
      localStorage.getItem("admin-sidebar-collapsed") ===
      "true"
  );

  const handleSidebarToggle = () => {
    setSidebarCollapsed((current) => {
      const next = !current;

      localStorage.setItem(
        "admin-sidebar-collapsed",
        String(next)
      );

      return next;
    });
  };

  return (
    <div
      className={`admin-dashboard-layout ${
        sidebarCollapsed
          ? "admin-dashboard-layout-sidebar-collapsed"
          : ""
      }`}
    >
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={handleSidebarToggle}
      />

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