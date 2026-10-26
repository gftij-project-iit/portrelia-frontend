import { lazy, Suspense } from "react";
import { Route } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";
import { SectionLoader } from "./RouteLoaders";

/* =========================================================
   PAGES ADMIN — chargées seulement quand on y va
========================================================= */

const adminPages = {
  home: () => import("../pages/Admin/dashboard/AdminDashboardHomePage"),
  companies: () => import("../pages/Admin/companies/AdminCompaniesPage"),
  companyDetails: () => import("../pages/Admin/companies/AdminCompanyDetailsPage"),
  demoRequests: () => import("../pages/Admin/DemoRequest/AdminDemoRequestsPage"),
  demoRequestDetails: () => import("../pages/Admin/DemoRequest/AdminDemoRequestDetailsPage"),
  campaigns: () => import("../pages/Admin/compagnes/AdminCampaignsPage"),
  campaignDetails: () => import("../pages/Admin/compagnes/AdminCampaignDetailsPage"),
  participantDetails: () => import("../pages/Admin/compagnes/AdminParticipantDetailsPage"),
  qaParticipant: () => import("../pages/Admin/adminQA/AdminQaParticipantPage"),
  generationParticipant: () => import("../pages/Admin/adminQA/AdminGenerationParticipantPage"),
  qaPortraits: () => import("../pages/Admin/adminQA/AdminQaPortraitsPage"),
  galleries: () => import("../pages/Admin/adminGalleries/AdminGalleriesPage"),
};

/* Précharge toutes les pages admin en arrière-plan */
const prefetchAdminPages = () => {
  const run = () => {
    Object.values(adminPages).forEach((load) => {
      load().catch(() => {});
    });
  };

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(run, { timeout: 1500 });
  } else {
    setTimeout(run, 800);
  }
};

/* Layout + accueil chargés ensemble, puis le reste en arrière-plan */
const AdminDashboardLayout = lazy(() =>
  Promise.all([
    import("../layouts/AdminDashboardLayout"),
    adminPages.home(),
  ]).then(([layoutModule]) => {
    prefetchAdminPages();
    return layoutModule;
  })
);

const AdminDashboardHomePage = lazy(adminPages.home);
const AdminCompaniesPage = lazy(adminPages.companies);
const AdminCompanyDetailsPage = lazy(adminPages.companyDetails);
const AdminDemoRequestsPage = lazy(adminPages.demoRequests);
const AdminDemoRequestDetailsPage = lazy(adminPages.demoRequestDetails);
const AdminCampaignsPage = lazy(adminPages.campaigns);
const AdminCampaignDetailsPage = lazy(adminPages.campaignDetails);
const AdminParticipantDetailsPage = lazy(adminPages.participantDetails);
const AdminQaParticipantPage = lazy(adminPages.qaParticipant);
const AdminGenerationParticipantPage = lazy(adminPages.generationParticipant);
const AdminQaPortraitsPage = lazy(adminPages.qaPortraits);
const AdminGalleriesPage = lazy(adminPages.galleries);

/* La sidebar et la barre du haut restent affichées ;
   seul le contenu affiche le skeleton de la page */
const page = (Component) => (
  <Suspense fallback={<SectionLoader />}>
    <Component />
  </Suspense>
);

/* =========================================================
   ROUTES ADMIN
========================================================= */

const AdminRoutes = (
  <>
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
      {/* DASHBOARD */}
      <Route index element={page(AdminDashboardHomePage)} />

      {/* ENTREPRISES */}
      <Route path="entreprises" element={page(AdminCompaniesPage)} />
      <Route path="entreprises/:id" element={page(AdminCompanyDetailsPage)} />

      {/* DEMANDES DE DÉMO */}
      <Route path="demandes-demo" element={page(AdminDemoRequestsPage)} />
      <Route path="demandes-demo/:id" element={page(AdminDemoRequestDetailsPage)} />

      {/* CAMPAGNES */}
      <Route path="campagnes" element={page(AdminCampaignsPage)} />
      <Route path="campagnes/:campaignId" element={page(AdminCampaignDetailsPage)} />

      {/* PARTICIPANTS */}
      <Route path="participants/:participantId" element={page(AdminParticipantDetailsPage)} />

      {/* QA PHOTOS SOURCE */}
      <Route path="qa/participants/:participantId" element={page(AdminQaParticipantPage)} />

      {/* GÉNÉRATION */}
      <Route path="generations/participants/:participantId" element={page(AdminGenerationParticipantPage)} />

      {/* QA PORTRAITS */}
      <Route path="qa-portraits/participants/:participantId" element={page(AdminQaPortraitsPage)} />

      {/* GALERIES */}
      <Route path="galeries" element={page(AdminGalleriesPage)} />
    </Route>
  </>
);

export default AdminRoutes;