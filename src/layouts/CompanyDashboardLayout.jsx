import { Outlet } from "react-router-dom";

import CompanySidebar from "../pages/company/CompanySidebar";
import CompanyTopbar from "../pages/company/CompanyTopbar";

import "./CompanyDashboardLayout.css";

function CompanyDashboardLayout() {
  return (
    <div className="company-dashboard-layout">
      <CompanySidebar />

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