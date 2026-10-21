
import { useState } from "react";
import { Outlet } from "react-router-dom";

import CompanySidebar from "../pages/company/CompanySidebar";
import CompanyTopbar from "../pages/company/CompanyTopbar";

import "./CompanyDashboardLayout.css";

function CompanyDashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return (
        localStorage.getItem("company-sidebar-collapsed") ===
        "true"
      );
    } catch {
      return false;
    }
  });

  const handleSidebarToggle = () => {
    const next = !sidebarCollapsed;

    setSidebarCollapsed(next);

    try {
      localStorage.setItem(
        "company-sidebar-collapsed",
        String(next)
      );
    } catch {
      // Le menu reste fonctionnel sans localStorage.
    }
  };

  return (
    <div
      className={`company-dashboard-layout ${
        sidebarCollapsed
          ? "company-dashboard-layout-sidebar-collapsed"
          : ""
      }`}
    >
      <CompanySidebar
        collapsed={sidebarCollapsed}
        onToggle={handleSidebarToggle}
      />

      <div className="company-dashboard-main">
        <CompanyTopbar />

        <main className="company-dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default CompanyDashboardLayout;
