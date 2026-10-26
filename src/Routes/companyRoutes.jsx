import { lazy, Suspense } from "react";
import { Route } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";
import { SectionLoader } from "./RouteLoaders";

import RequiredActionGuard from "../context/RequiredActionGuard";
import SubscriptionGuard from "../context/SubscriptionGuard";

/* =========================================================
   PAGES ENTREPRISE — chargées seulement quand on y va
========================================================= */

const companyPages = {
  home: () => import("../pages/company/CompanyDashboardHomePage"),
  campaigns: () => import("../pages/company/campaigns/CampaignsPage"),
  createCampaign: () => import("../pages/company/campaigns/CreateCampaignPage"),
  campaignDetail: () => import("../pages/company/campaigns/CampaignDetailPage"),
  collaborators: () => import("../pages/company/collaborators/CollaboratorsPage"),
  gallery: () => import("../pages/company/gallery/GalleryPage"),
  subscription: () => import("../pages/company/subscription/SubscriptionPage"),
  billing: () => import("../pages/company/billing/BillingPage"),
  settings: () => import("../pages/company/settings/SettingsPage"),
};

/* Précharge toutes les pages du dashboard en arrière-plan */
const prefetchCompanyPages = () => {
  const run = () => {
    Object.values(companyPages).forEach((load) => {
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
const CompanyDashboardLayout = lazy(() =>
  Promise.all([
    import("../layouts/CompanyDashboardLayout"),
    companyPages.home(),
  ]).then(([layoutModule]) => {
    prefetchCompanyPages();
    return layoutModule;
  })
);

/* Pages plein écran (hors dashboard) */
const RequiredActionPage = lazy(() => import("../pages/RequiredActionPage"));
const ChoosePlanPage = lazy(() =>
  import("../pages/company/subscription/ChoosePlanPage")
);

/* Pages du dashboard */
const CompanyDashboardHomePage = lazy(companyPages.home);
const CampaignsPage = lazy(companyPages.campaigns);
const CreateCampaignPage = lazy(companyPages.createCampaign);
const CampaignDetailPage = lazy(companyPages.campaignDetail);
const CollaboratorsPage = lazy(companyPages.collaborators);
const GalleryPage = lazy(companyPages.gallery);
const SubscriptionPage = lazy(companyPages.subscription);
const BillingPage = lazy(companyPages.billing);
const SettingsPage = lazy(companyPages.settings);

/* La sidebar et la barre du haut restent affichées ;
   seul le contenu affiche le skeleton de la page */
const page = (Component) => (
  <Suspense fallback={<SectionLoader />}>
    <Component />
  </Suspense>
);

/* =========================================================
   ROUTES ENTREPRISE
========================================================= */

const CompanyRoutes = (
  <>
    {/* ACTIONS OBLIGATOIRES */}
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

    {/* CHOIX ABONNEMENT — accessible sans abonnement actif */}
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

    {/* DASHBOARD ENTREPRISE — abonnement actif obligatoire */}
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
      <Route index element={page(CompanyDashboardHomePage)} />

      {/* CAMPAGNES */}
      <Route path="campagnes" element={page(CampaignsPage)} />
      <Route path="campagnes/creer" element={page(CreateCampaignPage)} />
      <Route path="campagnes/:id" element={page(CampaignDetailPage)} />

      {/* COLLABORATEURS / GALERIE */}
      <Route path="collaborateurs" element={page(CollaboratorsPage)} />
      <Route path="galerie" element={page(GalleryPage)} />

      {/* ABONNEMENT / FACTURATION / PARAMÈTRES */}
      <Route path="abonnement" element={page(SubscriptionPage)} />
      <Route path="facturation" element={page(BillingPage)} />
      <Route path="parametres" element={page(SettingsPage)} />
    </Route>
  </>
);

export default CompanyRoutes;