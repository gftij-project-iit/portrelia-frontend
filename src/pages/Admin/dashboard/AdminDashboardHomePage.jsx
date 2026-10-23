import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  FiUsers,
  FiBriefcase,
  FiCamera,
  FiCheckCircle,
  FiArrowRight,
  FiRefreshCw,
  FiAlertCircle,
  FiInbox,
  FiImage,
} from "react-icons/fi";

import api from "../../../services/api";
import "./adminDashboard.css";

/* =========================================================
   LIENS VERS LES PAGES ADMIN (à adapter à ton router)
========================================================= */

const ADMIN_LINKS = {
  demoRequests: "/admin/demandes-demo",
  qa: "/admin/qa",
  campaigns: "/admin/campagnes",
  galleries: "/admin/galeries",
};

/* =========================================================
   LIBELLÉS
========================================================= */

const DEMO_STATUS = {
  PENDING: { label: "En attente", tone: "pending" },
  NEW: { label: "Nouvelle", tone: "pending" },
  EN_ATTENTE: { label: "En attente", tone: "pending" },
  WAITING: { label: "En attente", tone: "pending" },
  CONTACTED: { label: "Contactée", tone: "contacted" },
  IN_PROGRESS: { label: "En cours", tone: "contacted" },
  ACCEPTED: { label: "Acceptée", tone: "accepted" },
  APPROVED: { label: "Acceptée", tone: "accepted" },
  CONVERTED: { label: "Convertie", tone: "accepted" },
  REJECTED: { label: "Refusée", tone: "rejected" },
  DECLINED: { label: "Refusée", tone: "rejected" },
  ARCHIVED: { label: "Archivée", tone: "other" },
};

const PENDING_DEMO_KEYS = new Set([
  "PENDING",
  "NEW",
  "EN_ATTENTE",
  "WAITING",
]);

const PORTRAIT_STATUS_LABELS = {
  PENDING: "En attente",
  QUEUED: "En file d'attente",
  GENERATING: "En génération",
  PROCESSING: "En traitement",
  GENERATED: "Générés",
  PENDING_REVIEW: "À valider",
  TO_REVIEW: "À valider",
  IN_REVIEW: "En revue",
  APPROVED: "Validés",
  VALIDATED: "Validés",
  REJECTED: "Refusés",
  FAILED: "En échec",
  ERROR: "En erreur",
  SELECTED: "Sélectionnés",
  UNKNOWN: "Sans statut",
};

/* =========================================================
   HELPERS
========================================================= */

const extractArray = (response, names = []) => {
  const root = response?.data ?? response ?? {};

  const containers = [
    root,
    root.data,
    root.data?.data,
    root.result,
    root.results,
  ];

  for (const container of containers) {
    if (Array.isArray(container)) return container;
    if (!container || typeof container !== "object") continue;

    for (const name of names) {
      if (Array.isArray(container[name])) return container[name];
    }

    if (Array.isArray(container.items)) return container.items;
    if (Array.isArray(container.rows)) return container.rows;
  }

  return [];
};

const getDemoCompany = (request) =>
  request?.companyName ??
  request?.company_name ??
  request?.company ??
  request?.entreprise ??
  "Entreprise";

const getDemoContact = (request) => {
  const first =
    request?.firstName ??
    request?.first_name ??
    request?.contactFirstName ??
    "";

  const last =
    request?.lastName ??
    request?.last_name ??
    request?.contactLastName ??
    "";

  const full = `${first} ${last}`.trim();

  return (
    full ||
    request?.contactName ||
    request?.fullName ||
    request?.name ||
    request?.email ||
    "Contact"
  );
};

const getDemoStatusKey = (request) =>
  String(request?.status ?? "").trim().toUpperCase();

const getDemoDate = (request) =>
  Date.parse(request?.createdAt ?? request?.created_at ?? "") || 0;

const getDemoStatus = (request) => {
  const key = getDemoStatusKey(request);

  return (
    DEMO_STATUS[key] || {
      label: key ? key.toLowerCase() : "—",
      tone: "other",
    }
  );
};

const formatNumber = (value) =>
  typeof value === "number"
    ? new Intl.NumberFormat("fr-FR").format(value)
    : "—";

const formatTime = (date) =>
  date
    ? new Intl.DateTimeFormat("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(date)
    : "";

const getErrorMessage = (reason, fallback) =>
  reason?.response?.data?.message || reason?.message || fallback;

/* =========================================================
   PAGE
========================================================= */

function AdminDashboardHomePage() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [demoRequests, setDemoRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);

  /* API */

  const fetchAll = useCallback(async (signal) => {
    const [dashboardResult, demoResult] = await Promise.allSettled([
      api.get("/admin/dashboard", { signal, timeout: 60000 }),
      api.get("/admin/demo-requests", { signal, timeout: 60000 }),
    ]);

    return { dashboardResult, demoResult };
  }, []);

  const applyResults = useCallback(({ dashboardResult, demoResult }) => {
    const messages = [];

    if (
      dashboardResult.status === "fulfilled" &&
      dashboardResult.value?.data?.success !== false
    ) {
      setDashboard(dashboardResult.value.data?.data ?? null);
    } else {
      messages.push(
        getErrorMessage(
          dashboardResult.reason,
          "Statistiques indisponibles."
        )
      );
    }

    if (demoResult.status === "fulfilled") {
      setDemoRequests(
        extractArray(demoResult.value, [
          "demoRequests",
          "requests",
          "demandes",
        ])
      );
    } else {
      messages.push(
        getErrorMessage(
          demoResult.reason,
          "Demandes de démo indisponibles."
        )
      );
    }

    setError(messages.join(" "));
    setUpdatedAt(new Date());
  }, []);

  /* CHARGEMENT INITIAL */

  useEffect(() => {
    const controller = new AbortController();

    const initialize = async () => {
      const results = await fetchAll(controller.signal);

      if (controller.signal.aborted) return;

      applyResults(results);
      setLoading(false);
    };

    initialize();

    return () => controller.abort();
  }, [fetchAll, applyResults]);

  /* ACTUALISATION */

  const handleRefresh = async () => {
    if (loading || refreshing) return;

    setRefreshing(true);

    try {
      applyResults(await fetchAll());
    } finally {
      setRefreshing(false);
    }
  };

  /* DONNÉES DÉRIVÉES */

  const demoStats = useMemo(() => {
    const sorted = [...demoRequests].sort(
      (a, b) => getDemoDate(b) - getDemoDate(a)
    );

    return {
      total: demoRequests.length,
      pending: demoRequests.filter((request) =>
        PENDING_DEMO_KEYS.has(getDemoStatusKey(request))
      ).length,
      recent: sorted.slice(0, 5),
    };
  }, [demoRequests]);

  const portraitBreakdown = useMemo(() => {
    const rows = dashboard?.portraits?.byStatus ?? [];
    const total = dashboard?.portraits?.generatedTotal ?? 0;

    return rows.map((row) => ({
      key: row.status,
      label: PORTRAIT_STATUS_LABELS[row.status] || row.status,
      count: row.count,
      percent: total > 0 ? Math.round((row.count / total) * 100) : 0,
    }));
  }, [dashboard]);

  const companies = dashboard?.companies;
  const campaigns = dashboard?.campaigns;
  const participants = dashboard?.participants;
  const galleries = dashboard?.galleries;
  const portraits = dashboard?.portraits;
  const topCampaigns = dashboard?.topCampaigns ?? [];

  const show = (value) => (loading ? "—" : formatNumber(value));

  /* RENDU */

  return (
    <div className="admin-home">

      {/* HEADER */}
      <div className="admin-home-header">
        <div>
          <h1>Bonjour Admin,</h1>
          <p>Voici l’activité globale de Portrélia.</p>
        </div>

        <div className="admin-home-actions">
          {updatedAt && !loading && (
            <span className="admin-home-updated">
              Mis à jour à {formatTime(updatedAt)}
            </span>
          )}

          <button
            type="button"
            className="admin-home-refresh"
            onClick={handleRefresh}
            disabled={loading || refreshing}
          >
            <FiRefreshCw
              className={
                loading || refreshing ? "admin-home-spin" : ""
              }
            />
            Actualiser
          </button>
        </div>
      </div>

      {/* ERREUR */}
      {error && (
        <div className="admin-home-error" role="alert">
          <FiAlertCircle />
          <span>{error}</span>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            Réessayer
          </button>
        </div>
      )}

      {/* STATS */}
      <div className="admin-stats-grid">

        <div className={`admin-stat-card${loading ? " is-loading" : ""}`}>
          <div className="admin-stat-icon">
            <FiUsers />
          </div>
          <strong>{show(demoStats.total)}</strong>
          <span>Demandes de démo</span>
          <small>
            {loading
              ? "Chargement..."
              : `${formatNumber(demoStats.pending)} en attente`}
          </small>
        </div>

        <div className={`admin-stat-card${loading ? " is-loading" : ""}`}>
          <div className="admin-stat-icon">
            <FiBriefcase />
          </div>
          <strong>{show(companies?.active)}</strong>
          <span>Entreprises actives</span>
          <small>
            {loading
              ? "Chargement..."
              : companies?.newThisMonth != null
                ? `+${formatNumber(companies.newThisMonth)} ce mois`
                : `${formatNumber(companies?.total)} au total`}
          </small>
        </div>

        <div className={`admin-stat-card${loading ? " is-loading" : ""}`}>
          <div className="admin-stat-icon">
            <FiCamera />
          </div>
          <strong>{show(campaigns?.total)}</strong>
          <span>Campagnes</span>
          <small>
            {loading
              ? "Chargement..."
              : `${formatNumber(participants?.total)} participants`}
          </small>
        </div>

        <div className={`admin-stat-card${loading ? " is-loading" : ""}`}>
          <div className="admin-stat-icon">
            <FiCheckCircle />
          </div>
          <strong>{show(portraits?.finalSelected)}</strong>
          <span>Portraits finaux choisis</span>
          <small>
            {loading
              ? "Chargement..."
              : `${formatNumber(galleries?.waitingChoice)} galeries en attente du choix`}
          </small>
        </div>

      </div>

      {/* CONTENT */}
      <div className="admin-home-grid">

        {/* DEMANDES DE DÉMO */}
        <section className="admin-dashboard-card">
          <div className="admin-card-header">
            <div>
              <h2>Demandes de démo récentes</h2>
              <p>Les dernières demandes reçues</p>
            </div>

            <button
              type="button"
              onClick={() => navigate(ADMIN_LINKS.demoRequests)}
            >
              Voir toutes
              <FiArrowRight />
            </button>
          </div>

          {loading ? (
            <div className="admin-skeleton-list">
              <span />
              <span />
              <span />
            </div>
          ) : demoStats.recent.length === 0 ? (
            <div className="admin-home-empty">
              <FiInbox />
              <p>Aucune demande de démo pour le moment.</p>
            </div>
          ) : (
            <div className="admin-request-list">
              {demoStats.recent.map((request, index) => {
                const status = getDemoStatus(request);

                return (
                  <div
                    className="admin-request-row"
                    key={request?.id ?? `demo-${index}`}
                  >
                    <div>
                      <strong>{getDemoCompany(request)}</strong>
                      <span>{getDemoContact(request)}</span>
                    </div>

                    <span
                      className={`admin-status admin-status-${status.tone}`}
                    >
                      {status.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* PORTRAITS GÉNÉRÉS */}
        <section className="admin-dashboard-card">
          <div className="admin-card-header">
            <div>
              <h2>Portraits générés</h2>
              <p>Répartition par statut</p>
            </div>

            <button
              type="button"
              onClick={() => navigate(ADMIN_LINKS.qa)}
            >
              Voir la QA
              <FiArrowRight />
            </button>
          </div>

          {loading ? (
            <div className="admin-skeleton-list">
              <span />
              <span />
              <span />
            </div>
          ) : (
            <div className="admin-qa-summary">
              <div className="admin-qa-number">
                {formatNumber(portraits?.generatedTotal ?? 0)}
              </div>

              <p>portraits générés au total.</p>

              {portraitBreakdown.length === 0 ? (
                <div className="admin-home-empty admin-home-empty-compact">
                  <FiImage />
                  <p>Aucun portrait généré pour le moment.</p>
                </div>
              ) : (
                <div className="admin-breakdown">
                  {portraitBreakdown.map((row) => (
                    <div className="admin-breakdown-row" key={row.key}>
                      <div className="admin-breakdown-top">
                        <span>{row.label}</span>
                        <strong>
                          {formatNumber(row.count)}
                          <small>{row.percent}%</small>
                        </strong>
                      </div>

                      <div className="admin-progress">
                        <div
                          className="admin-progress-bar"
                          style={{ width: `${row.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

      </div>

      {/* CAMPAGNES */}
      <section className="admin-dashboard-card admin-campaign-section">
        <div className="admin-card-header">
          <div>
            <h2>Campagnes actives</h2>
            <p>Avancement des choix de portraits finaux</p>
          </div>

          <button
            type="button"
            onClick={() => navigate(ADMIN_LINKS.campaigns)}
          >
            Voir les campagnes
            <FiArrowRight />
          </button>
        </div>

        {loading ? (
          <div className="admin-skeleton-list">
            <span />
            <span />
          </div>
        ) : topCampaigns.length === 0 ? (
          <div className="admin-home-empty">
            <FiCamera />
            <p>Aucune campagne active pour le moment.</p>
          </div>
        ) : (
          <div className="admin-campaign-list">
            {topCampaigns.map((campaign) => (
              <div className="admin-campaign-row" key={campaign.id}>
                <div className="admin-campaign-info">
                  <strong>{campaign.name}</strong>
                  <span>{campaign.companyName}</span>
                </div>

                <div className="admin-campaign-progress">
                  <span>
                    {formatNumber(campaign.finalSelected)} /{" "}
                    {formatNumber(campaign.participants)} portraits choisis
                  </span>

                  <div className="admin-progress">
                    <div
                      className="admin-progress-bar"
                      style={{ width: `${campaign.progress}%` }}
                    />
                  </div>
                </div>

                <strong>{campaign.progress}%</strong>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}

export default AdminDashboardHomePage;