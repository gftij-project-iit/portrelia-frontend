import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiAlertCircle,
  FiArrowRight,
  FiCheck,
  FiClock,
  FiLayers,
  FiLoader,
  FiPlus,
  FiRefreshCw,
  FiUserPlus,
} from "react-icons/fi";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";


import "./CompanyDashboardHomePage.css";
import { PageSkeleton } from "../../Routes/RouteLoaders";

/* =========================================================
   HELPERS
========================================================= */

const ALL = "ALL";

/* Adresse de la page de création (route "campagnes/creer") */
const CREATE_CAMPAIGN_PATH = "/dashboard/campagnes/creer";

const pct = (part, total) =>
  total > 0 ? Math.round((part / total) * 100) : 0;

const plural = (count, singular, pluralForm) =>
  `${count} ${count > 1 ? pluralForm : singular}`;

const formatNumber = (value) =>
  typeof value === "number"
    ? new Intl.NumberFormat("fr-FR").format(value)
    : "—";

const EMPTY_STATS = {
  participants: 0,
  galleriesReady: 0,
  finalSelected: 0,
  waitingChoice: 0,
  expiredWithoutChoice: 0,
  inProgress: 0,
};

const sumStats = (campaigns) =>
  campaigns.reduce(
    (total, campaign) => ({
      participants: total.participants + campaign.participants,
      galleriesReady: total.galleriesReady + campaign.galleriesReady,
      finalSelected: total.finalSelected + campaign.finalSelected,
      waitingChoice: total.waitingChoice + campaign.waitingChoice,
      expiredWithoutChoice:
        total.expiredWithoutChoice + campaign.expiredWithoutChoice,
      inProgress: total.inProgress + campaign.inProgress,
    }),
    { ...EMPTY_STATS }
  );

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

/* =========================================================
   PAGE
========================================================= */

function CompanyDashboardHomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const firstName = user?.firstName?.trim() || "";

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  /* API */

  const fetchDashboard = useCallback(async (signal) => {
    const response = await api.get("/company/dashboard", {
      signal,
      timeout: 60000,
    });

    if (response.data?.success !== true) {
      throw new Error(
        response.data?.message ||
          "Impossible de charger le tableau de bord."
      );
    }

    return response.data.data;
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const initialize = async () => {
      try {
        const result = await fetchDashboard(controller.signal);

        if (controller.signal.aborted) return;

        setData(result);
        setError("");
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(
          getErrorMessage(err, "Impossible de charger le tableau de bord.")
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    initialize();

    return () => controller.abort();
  }, [fetchDashboard]);

  const handleRefresh = async () => {
    if (loading || refreshing) return;

    setRefreshing(true);

    try {
      const result = await fetchDashboard();
      setData(result);
      setError("");
    } catch (err) {
      setError(
        getErrorMessage(err, "Impossible d'actualiser le tableau de bord.")
      );
    } finally {
      setRefreshing(false);
    }
  };

  /* CAMPAGNE AFFICHÉE */

  const campaigns = useMemo(() => data?.campaigns ?? [], [data]);

  const defaultId = useMemo(() => {
    const active = campaigns.find((campaign) => !campaign.isCancelled);

    if (active) return String(active.id);
    if (campaigns[0]) return String(campaigns[0].id);

    return ALL;
  }, [campaigns]);

  const currentId =
    selectedId &&
    (selectedId === ALL ||
      campaigns.some((campaign) => String(campaign.id) === selectedId))
      ? selectedId
      : defaultId;

  const currentCampaign =
    currentId === ALL
      ? null
      : campaigns.find((campaign) => String(campaign.id) === currentId) ||
        null;

  const stats = useMemo(
    () => (currentCampaign ? currentCampaign : sumStats(campaigns)),
    [currentCampaign, campaigns]
  );

  const progress = pct(stats.finalSelected, stats.participants);
  const readyPct = pct(stats.galleriesReady, stats.participants);
  const hasCampaigns = campaigns.length > 0;

  const campaignLink = currentCampaign
    ? `/dashboard/campagnes/${currentCampaign.id}`
    : "/dashboard/campagnes";

  /* POINTS D'ATTENTION (calculés) */

  const attentionItems = useMemo(() => {
    const items = [];

    if (stats.participants === 0) {
      items.push({
        key: "no-participants",
        tone: "info",
        icon: <FiUserPlus />,
        title: "Aucun collaborateur invité",
        text: "Ajoutez des collaborateurs pour lancer la campagne.",
      });
    }

    if (stats.waitingChoice > 0) {
      items.push({
        key: "waiting",
        tone: "warning",
        icon: <FiClock />,
        title: `${plural(
          stats.waitingChoice,
          "collaborateur n'a",
          "collaborateurs n'ont"
        )} pas encore choisi`,
        text: "Leur galerie est prête : une relance peut les aider à finaliser.",
      });
    }

    if (stats.inProgress > 0) {
      items.push({
        key: "in-progress",
        tone: "info",
        icon: <FiLoader />,
        title: plural(
          stats.inProgress,
          "portrait en préparation",
          "portraits en préparation"
        ),
        text: "Photo en attente ou portraits en cours de création.",
      });
    }

    if (stats.expiredWithoutChoice > 0) {
      items.push({
        key: "expired",
        tone: "danger",
        icon: <FiAlertCircle />,
        title: `${plural(
          stats.expiredWithoutChoice,
          "galerie expirée",
          "galeries expirées"
        )} sans choix`,
        text: "Ces collaborateurs n'ont plus accès à leur galerie.",
      });
    }

    if (
      stats.participants > 0 &&
      stats.finalSelected === stats.participants
    ) {
      items.push({
        key: "done",
        tone: "success",
        icon: <FiCheck />,
        title: "Tous les portraits ont été choisis",
        text: "Retrouvez-les dans votre galerie.",
      });
    }

    if (currentCampaign?.styleName) {
      items.push({
        key: "style",
        tone: "success",
        icon: <FiCheck />,
        title: "Style de la campagne",
        text: currentCampaign.styleName,
      });
    }

    if (items.length === 0) {
      items.push({
        key: "ok",
        tone: "success",
        icon: <FiCheck />,
        title: "Tout est en ordre",
        text: "Aucune action n'est nécessaire pour le moment.",
      });
    }

    return items;
  }, [stats, currentCampaign]);

  /* =========================================================
     CHARGEMENT
     - premier chargement
     - « Réessayer » après un échec (aucune donnée à afficher)
     Même skeleton que le router : pas de saut visuel
  ========================================================= */

  if (loading || (refreshing && !data)) {
    return <PageSkeleton variant="home" />;
  }

  /* TEXTE D'INTRO */

  const intro = !data
    ? "Votre activité n'a pas pu être chargée."
    : !hasCampaigns
      ? "Créez votre première campagne pour commencer."
      : currentCampaign
        ? `Voici l’avancement de votre campagne « ${currentCampaign.name} ».`
        : `Voici l’avancement de vos ${plural(
            campaigns.length,
            "campagne",
            "campagnes"
          )}.`;

  /* RENDU */

  return (
    <div className="company-home-page">

      {/* HEADER */}
      <div className="company-home-header">
        <div className="company-home-header-copy">
          <span className="company-home-kicker">
            PORTAIL ENTREPRISE
          </span>

          <h1>{firstName ? `Bonjour, ${firstName}` : "Bonjour"}</h1>

          <p>{intro}</p>

          {hasCampaigns && (
            <label className="company-home-select">
              <FiLayers />

              <select
                value={currentId}
                onChange={(event) => setSelectedId(event.target.value)}
                aria-label="Choisir la campagne affichée"
              >
                <option value={ALL}>Toutes les campagnes</option>

                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={String(campaign.id)}>
                    {campaign.name}
                    {campaign.isCancelled ? " (annulée)" : ""}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        <div className="company-home-header-actions">
          <button
            type="button"
            className="company-home-refresh-btn"
            onClick={handleRefresh}
            disabled={refreshing}
            aria-busy={refreshing}
            aria-label="Actualiser"
            title="Actualiser"
          >
            <FiRefreshCw
              className={refreshing ? "company-home-spin" : ""}
            />
          </button>

          {/* Si tu préfères passer par la liste : "/dashboard/campagnes" */}
          <button
            type="button"
            className="company-home-create-btn"
            onClick={() => navigate(CREATE_CAMPAIGN_PATH)}
          >
            <FiPlus />
            Créer une campagne
          </button>
        </div>
      </div>

      {/* ERREUR */}
      {error && (
        <div className="company-home-error" role="alert">
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

      {/* AUCUNE CAMPAGNE */}
      {data && !hasCampaigns && (
        <section className="company-home-empty">
          <div className="company-home-empty-icon">
            <FiLayers />
          </div>

          <h2>Aucune campagne pour le moment</h2>

          <p>
            Lancez votre première campagne de portraits et invitez
            vos collaborateurs en quelques minutes.
          </p>

          <button
            type="button"
            className="company-home-create-btn"
            onClick={() => navigate(CREATE_CAMPAIGN_PATH)}
          >
            <FiPlus />
            Créer une campagne
          </button>
        </section>
      )}

      {hasCampaigns && (
        <>
          {/* KPI */}
          <div className="company-home-kpis">

            <div className="company-home-kpi-card">
              <span>Participants</span>
              <strong>{formatNumber(stats.participants)}</strong>
              <div className="company-home-kpi-badge company-home-kpi-purple">
                {currentCampaign
                  ? currentCampaign.isCancelled
                    ? "Campagne annulée"
                    : "Campagne sélectionnée"
                  : plural(campaigns.length, "campagne", "campagnes")}
              </div>
            </div>

            <div className="company-home-kpi-card">
              <span>Galeries prêtes</span>
              <strong>{formatNumber(stats.galleriesReady)}</strong>
              <div className="company-home-kpi-badge company-home-kpi-green">
                {readyPct} %
              </div>
            </div>

            <div className="company-home-kpi-card">
              <span>Portraits choisis</span>
              <strong>{formatNumber(stats.finalSelected)}</strong>
              <div className="company-home-kpi-badge company-home-kpi-purple">
                {progress} %
              </div>
            </div>

            <div className="company-home-kpi-card">
              <span>En attente du choix</span>
              <strong>{formatNumber(stats.waitingChoice)}</strong>
              <div
                className={`company-home-kpi-badge ${
                  stats.waitingChoice > 0
                    ? "company-home-kpi-orange"
                    : "company-home-kpi-green"
                }`}
              >
                {stats.waitingChoice > 0 ? "À relancer" : "Rien à relancer"}
              </div>
            </div>

          </div>

          {/* LOWER GRID */}
          <div className="company-home-bottom-grid">

            {/* PROGRESSION */}
            <section className="company-home-progress-card">
              <div className="company-home-section-header">
                <h2>
                  {currentCampaign
                    ? "Progression de la campagne"
                    : "Progression globale"}
                </h2>

                <span>Livraison sous 48 à 72 h</span>
              </div>

              <div className="company-home-progress-track">
                <div
                  className="company-home-progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="company-home-progress-meta">
                <strong>{progress} % terminé</strong>

                <span>
                  {formatNumber(stats.finalSelected)} /{" "}
                  {formatNumber(stats.participants)} portraits choisis
                </span>
              </div>

              <div className="company-home-progress-steps">
                <div>
                  <span>En préparation</span>
                  <strong>{formatNumber(stats.inProgress)}</strong>
                </div>

                <div>
                  <span>Galeries prêtes</span>
                  <strong>{formatNumber(stats.galleriesReady)}</strong>
                </div>

                <div>
                  <span>Choisis</span>
                  <strong>{formatNumber(stats.finalSelected)}</strong>
                </div>
              </div>

              <div className="company-home-progress-actions">
                <button
                  type="button"
                  className="company-home-primary-action"
                  onClick={() => navigate("/dashboard/collaborateurs")}
                >
                  Voir les participants
                </button>

                <button
                  type="button"
                  className="company-home-secondary-action"
                  onClick={() => navigate(campaignLink)}
                >
                  {currentCampaign
                    ? "Relancer les collaborateurs"
                    : "Voir les campagnes"}
                  <FiArrowRight />
                </button>
              </div>
            </section>

            {/* POINTS D'ATTENTION */}
            <section className="company-home-attention-card">
              <h2>Points d’attention</h2>

              <div className="company-home-attention-list">
                {attentionItems.map((item) => (
                  <div className="company-home-attention-item" key={item.key}>
                    <div
                      className={`company-home-attention-icon is-${item.tone}`}
                    >
                      {item.icon}
                    </div>

                    <div>
                      <strong>{item.title}</strong>
                      <span>{item.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>
        </>
      )}

    </div>
  );
}

export default CompanyDashboardHomePage;