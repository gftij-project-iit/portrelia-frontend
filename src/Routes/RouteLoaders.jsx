import { Suspense } from "react";
import { useLocation } from "react-router-dom";

import "./RouteLoaders.css";

/* =========================================================
   SKELETONS DE CHARGEMENT — PORTRÉLIA
   Des formes qui brillent, à la forme de la page affichée
========================================================= */

const range = (count) => Array.from({ length: count }, (_, index) => index);

const KPI_ITEMS = range(4);
const STAT_ITEMS = range(3);
const STEP_ITEMS = range(3);
const LIST_ITEMS = range(3);
const CARD_ITEMS = range(3);
const TILE_ITEMS = range(3);
const TABLE_ROWS = range(6);
const DETAIL_ROWS = range(4);
const PHOTO_ITEMS = range(8);
const FIELD_ITEMS = range(4);
const FORM_CARDS = range(2);
const FEATURE_ITEMS = range(6);
const NAV_ITEMS = range(7);
const PUBLIC_FIELDS = range(2);

const isDashboardPath = (pathname) =>
  pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

/* Choisit le skeleton selon l'adresse de la page */
const getVariantFromPath = (pathname) => {
  const path = pathname.replace(/\/+$/, "");

  if (path === "/dashboard" || path === "/admin") return "home";
  if (/\/(galerie|galeries)$/.test(path)) return "gallery";
  if (/\/campagnes\/creer$/.test(path) || /\/parametres$/.test(path)) return "form";
  if (/\/(collaborateurs|facturation|entreprises|demandes-demo)$/.test(path)) return "table";
  if (/\/campagnes$/.test(path)) return "cards";
  if (/\/abonnement$/.test(path)) return "plan";

  return "detail";
};

const readSidebarCollapsed = () => {
  try {
    return localStorage.getItem("company-sidebar-collapsed") === "true";
  } catch {
    return false;
  }
};

function Bone({ className = "" }) {
  return <span className={`sk ${className}`} aria-hidden="true" />;
}

/* =========================================================
   BRIQUES COMMUNES
========================================================= */

function SkHead({ withAction = true }) {
  return (
    <div className="sk-head-row">
      <div className="sk-head">
        <Bone className="sk-line sk-h-10 sk-w-20" />
        <Bone className="sk-line sk-h-28 sk-w-40" />
        <Bone className="sk-line sk-w-55" />
      </div>

      {withAction && <Bone className="sk-btn" />}
    </div>
  );
}

function SkToolbar() {
  return (
    <div className="sk-toolbar">
      <Bone className="sk-search" />
      <Bone className="sk-filter" />
    </div>
  );
}

function SkStats({ items = STAT_ITEMS }) {
  return (
    <div className={`sk-stats sk-stats-${items.length}`}>
      {items.map((item) => (
        <div className="sk-card sk-stat" key={item}>
          <Bone className="sk-icon" />

          <div className="sk-stat-text">
            <Bone className="sk-line sk-h-24 sk-w-40" />
            <Bone className="sk-line sk-h-10 sk-w-70" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* Ligne "rond + barres" (personne, entreprise, facture…) */
function SkPersonRow() {
  return (
    <div className="sk-table-row">
      <div className="sk-person">
        <Bone className="sk-circle sk-avatar-lg" />

        <div className="sk-person-text">
          <Bone className="sk-line sk-w-70" />
          <Bone className="sk-line sk-h-10 sk-w-50" />
        </div>
      </div>

      <Bone className="sk-line sk-w-60 sk-hide-mobile" />
      <Bone className="sk-pill sk-hide-mobile" />
      <Bone className="sk-btn sk-btn-sm" />
    </div>
  );
}

function SkTable({ rows = TABLE_ROWS }) {
  return (
    <div className="sk-card sk-table">
      <div className="sk-table-head">
        <Bone className="sk-line sk-h-10 sk-w-20" />
        <Bone className="sk-line sk-h-10 sk-w-20 sk-hide-mobile" />
        <Bone className="sk-line sk-h-10 sk-w-20 sk-hide-mobile" />
        <Bone className="sk-line sk-h-10 sk-w-20" />
      </div>

      {rows.map((row) => (
        <SkPersonRow key={row} />
      ))}
    </div>
  );
}

/* =========================================================
   SKELETONS PAR TYPE DE PAGE
========================================================= */

/* Accueil du dashboard : KPI + progression + points d'attention */
function HomeSkeleton() {
  return (
    <>
      <SkHead />

      <div className="sk-kpis">
        {KPI_ITEMS.map((item) => (
          <div className="sk-card sk-kpi" key={item}>
            <Bone className="sk-line sk-w-50" />
            <Bone className="sk-line sk-h-26 sk-w-30" />
            <Bone className="sk-pill" />
          </div>
        ))}
      </div>

      <div className="sk-grid">
        <div className="sk-card sk-card-tall">
          <Bone className="sk-line sk-h-16 sk-w-45" />
          <Bone className="sk-bar" />

          <div className="sk-steps">
            {STEP_ITEMS.map((item) => (
              <Bone className="sk-step" key={item} />
            ))}
          </div>
        </div>

        <div className="sk-card sk-card-tall">
          <Bone className="sk-line sk-h-16 sk-w-40" />

          {LIST_ITEMS.map((item) => (
            <div className="sk-list-item" key={item}>
              <Bone className="sk-icon" />

              <div className="sk-list-text">
                <Bone className="sk-line sk-w-70" />
                <Bone className="sk-line sk-h-10 sk-w-45" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* Liste de campagnes : cartes avec infos + progression */
function CardsSkeleton() {
  return (
    <>
      <SkHead />
      <SkStats />
      <SkToolbar />

      {CARD_ITEMS.map((item) => (
        <div className="sk-card sk-list-card" key={item}>
          <div className="sk-list-card-top">
            <div className="sk-list-card-title">
              <Bone className="sk-pill sk-pill-sm" />
              <Bone className="sk-line sk-h-16 sk-w-40" />
              <Bone className="sk-line sk-w-70" />
            </div>

            <Bone className="sk-btn sk-btn-sm" />
          </div>

          <div className="sk-tiles">
            {TILE_ITEMS.map((tile) => (
              <Bone className="sk-tile" key={tile} />
            ))}
          </div>

          <Bone className="sk-bar" />
        </div>
      ))}
    </>
  );
}

/* Tableau : collaborateurs, factures, entreprises, demandes */
function TableSkeleton() {
  return (
    <>
      <SkHead />
      <SkStats items={KPI_ITEMS} />
      <SkToolbar />
      <SkTable />
    </>
  );
}

/* Galerie : grille de portraits */
function GallerySkeleton() {
  return (
    <>
      <SkHead />
      <SkStats />
      <SkToolbar />

      <div className="sk-gallery-grid">
        {PHOTO_ITEMS.map((item) => (
          <div className="sk-card sk-photo-card" key={item}>
            <Bone className="sk-photo" />

            <div className="sk-photo-body">
              <Bone className="sk-line sk-w-70" />
              <Bone className="sk-line sk-h-10 sk-w-45" />

              <div className="sk-photo-actions">
                <Bone className="sk-btn-flex" />
                <Bone className="sk-btn-flex" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* Formulaire : création de campagne, paramètres */
function FormSkeleton() {
  return (
    <>
      <SkHead withAction={false} />

      {FORM_CARDS.map((card) => (
        <div className="sk-card sk-form-card" key={card}>
          <div className="sk-list-item">
            <Bone className="sk-icon sk-icon-lg" />

            <div className="sk-list-text">
              <Bone className="sk-line sk-h-16 sk-w-40" />
              <Bone className="sk-line sk-h-10 sk-w-60" />
            </div>
          </div>

          <div className="sk-form-grid">
            {FIELD_ITEMS.map((field) => (
              <div className="sk-field" key={field}>
                <Bone className="sk-line sk-h-10 sk-w-30" />
                <Bone className="sk-input" />
              </div>
            ))}
          </div>

          <div className="sk-form-footer">
            <Bone className="sk-btn" />
          </div>
        </div>
      ))}
    </>
  );
}

/* Détail : campagne, entreprise, demande, participant */
function DetailSkeleton() {
  return (
    <>
      <Bone className="sk-line sk-h-10 sk-back" />

      <div className="sk-card sk-detail-head">
        <div className="sk-list-card-title">
          <Bone className="sk-pill sk-pill-sm" />
          <Bone className="sk-line sk-h-26 sk-w-40" />
          <Bone className="sk-line sk-w-60" />
        </div>

        <div className="sk-detail-actions">
          <Bone className="sk-btn sk-btn-sm" />
          <Bone className="sk-btn sk-btn-sm" />
        </div>
      </div>

      <div className="sk-meta">
        {KPI_ITEMS.map((item) => (
          <Bone className="sk-tile" key={item} />
        ))}
      </div>

      <SkTable rows={DETAIL_ROWS} />
    </>
  );
}

/* Abonnement : offre + limites + fonctionnalités */
function PlanSkeleton() {
  return (
    <>
      <SkHead />

      <div className="sk-card sk-plan">
        <div className="sk-list-item">
          <Bone className="sk-icon sk-icon-lg" />

          <div className="sk-list-text">
            <Bone className="sk-line sk-h-10 sk-w-30" />
            <Bone className="sk-line sk-h-24 sk-w-50" />
            <Bone className="sk-line sk-w-80" />
          </div>
        </div>

        <div className="sk-plan-side">
          <Bone className="sk-line sk-h-28 sk-w-full" />
          <Bone className="sk-btn" />
        </div>
      </div>

      <SkStats />

      <div className="sk-features">
        {FEATURE_ITEMS.map((item) => (
          <div className="sk-card sk-feature" key={item}>
            <Bone className="sk-icon" />
            <Bone className="sk-line sk-w-60" />
          </div>
        ))}
      </div>
    </>
  );
}

const VARIANTS = {
  home: HomeSkeleton,
  cards: CardsSkeleton,
  table: TableSkeleton,
  gallery: GallerySkeleton,
  form: FormSkeleton,
  detail: DetailSkeleton,
  plan: PlanSkeleton,
};

/* =========================================================
   DASHBOARD COMPLET ET PAGE PUBLIQUE
========================================================= */

function DashboardShellSkeleton({ variant }) {
  const { pathname } = useLocation();
  const collapsed =
    pathname.startsWith("/dashboard") && readSidebarCollapsed();

  return (
    <div
      className={`sk-root sk-shell${collapsed ? " is-collapsed" : ""}`}
      role="status"
      aria-label="Chargement"
    >
      <aside className="sk-sidebar">
        <Bone className="sk-sidebar-logo" />

        {NAV_ITEMS.map((item) => (
          <Bone className="sk-sidebar-link" key={item} />
        ))}
      </aside>

      <div className="sk-main">
        <div className="sk-topbar">
          <Bone className="sk-circle sk-topbar-btn" />
          <Bone className="sk-circle sk-topbar-btn" />

          <div className="sk-topbar-user">
            <Bone className="sk-circle sk-avatar" />

            <div className="sk-topbar-user-text">
              <Bone className="sk-line sk-w-full" />
              <Bone className="sk-line sk-h-10 sk-w-60" />
            </div>
          </div>
        </div>

        <div className="sk-main-content">
          <PageSkeleton variant={variant} />
        </div>
      </div>
    </div>
  );
}

function PublicPageSkeleton() {
  return (
    <div className="sk-root sk-public" role="status" aria-label="Chargement">
      <div className="sk-public-nav">
        <div className="sk-public-brand">
          <Bone className="sk-logo" />
          <Bone className="sk-line sk-h-16 sk-w-brand" />
        </div>

        <Bone className="sk-btn" />
      </div>

      <div className="sk-public-body">
        <div className="sk-card sk-public-card">
          <Bone className="sk-public-logo" />
          <Bone className="sk-line sk-h-24 sk-w-60 sk-center" />
          <Bone className="sk-line sk-w-80 sk-center" />

          {PUBLIC_FIELDS.map((item) => (
            <div className="sk-field" key={item}>
              <Bone className="sk-line sk-h-10 sk-w-30" />
              <Bone className="sk-input" />
            </div>
          ))}

          <Bone className="sk-input sk-input-submit" />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   EXPORTS
========================================================= */

/* Skeleton d'une page, réutilisable dans les pages elles-mêmes
   pendant le chargement de leurs données :
   <PageSkeleton variant="gallery" />
   Variantes : home, cards, table, gallery, form, detail, plan */
export function PageSkeleton({ variant = "home" }) {
  const Variant = VARIANTS[variant] ?? HomeSkeleton;

  return (
    <div className="sk-root sk-content" role="status" aria-label="Chargement">
      <Variant />
    </div>
  );
}

/* Plein écran : dashboard (forme selon la page) ou page publique */
export function PageLoader() {
  const { pathname } = useLocation();

  return isDashboardPath(pathname) ? (
    <DashboardShellSkeleton variant={getVariantFromPath(pathname)} />
  ) : (
    <PublicPageSkeleton />
  );
}

/* Dans un dashboard : la vraie sidebar reste, seul le contenu charge */
export function SectionLoader() {
  const { pathname } = useLocation();

  return <PageSkeleton variant={getVariantFromPath(pathname)} />;
}

/* Enveloppe une page chargée à la demande dans un dashboard */
export function LazyPage({ children }) {
  return <Suspense fallback={<SectionLoader />}>{children}</Suspense>;
}