import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./AdminCampaignsPage.css";
import api from "../../../services/api";

const CAMPAIGN_STATUS_LABELS = {
  DRAFT: "Brouillon",
  READY: "Prête",
  IN_PROGRESS: "En cours",
  QA: "QA",
  DELIVERY_READY: "Prête à livrer",
  COMPLETED: "Terminée",
  CANCELLED: "Annulée",
};

const STATUS_OPTIONS = [
  { value: "ALL", label: "Tous les statuts" },
  { value: "DRAFT", label: "Brouillon" },
  { value: "READY", label: "Prête" },
  { value: "IN_PROGRESS", label: "En cours" },
  { value: "QA", label: "QA" },
  {
    value: "DELIVERY_READY",
    label: "Prête à livrer",
  },
  { value: "COMPLETED", label: "Terminée" },
  { value: "CANCELLED", label: "Annulée" },
];

const SORT_OPTIONS = [
  {
    value: "NEWEST",
    label: "Plus récentes",
  },
  {
    value: "OLDEST",
    label: "Plus anciennes",
  },
  {
    value: "DEADLINE_ASC",
    label: "Deadline la plus proche",
  },
  {
    value: "DEADLINE_DESC",
    label: "Deadline la plus éloignée",
  },
  {
    value: "PARTICIPANTS_DESC",
    label: "Plus de participants",
  },
  {
    value: "NAME_ASC",
    label: "Nom A → Z",
  },
];

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const normalizeValue = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

function AdminCampaignsPage() {
  const navigate = useNavigate();

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("ALL");
  const [companyFilter, setCompanyFilter] =
    useState("ALL");
  const [sortBy, setSortBy] = useState("NEWEST");

  useEffect(() => {
    let mounted = true;

    const loadCampaigns = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          "/admin/campaigns"
        );

        if (!mounted) return;

        setCampaigns(
          Array.isArray(response.data?.data)
            ? response.data.data
            : []
        );
      } catch (err) {
        console.error(
          "Erreur chargement campagnes admin :",
          err
        );

        if (!mounted) return;

        setError(
          err.response?.data?.message ||
            "Impossible de charger les campagnes."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadCampaigns();

    return () => {
      mounted = false;
    };
  }, []);

  const companies = useMemo(() => {
    const uniqueCompanies = new Map();

    campaigns.forEach((campaign) => {
      if (!campaign.companyName) return;

      const key =
        campaign.companyId ||
        campaign.companyName;

      if (!uniqueCompanies.has(key)) {
        uniqueCompanies.set(key, {
          id: key,
          name: campaign.companyName,
        });
      }
    });

    return Array.from(
      uniqueCompanies.values()
    ).sort((a, b) =>
      a.name.localeCompare(b.name, "fr", {
        sensitivity: "base",
      })
    );
  }, [campaigns]);

  const stats = useMemo(() => {
    const totalParticipants =
      campaigns.reduce(
        (total, campaign) =>
          total +
          Number(
            campaign.participantCount || 0
          ),
        0
      );

    const photosReceived =
      campaigns.reduce(
        (total, campaign) =>
          total +
          Number(
            campaign.photosReceivedCount || 0
          ),
        0
      );

    const activeCampaigns =
      campaigns.filter(
        (campaign) =>
          ![
            "COMPLETED",
            "CANCELLED",
          ].includes(campaign.status)
      ).length;

    return {
      campaigns: campaigns.length,
      activeCampaigns,
      totalParticipants,
      photosReceived,
    };
  }, [campaigns]);

  const filteredCampaigns = useMemo(() => {
    const normalizedSearch =
      normalizeValue(search);

    let result = campaigns.filter(
      (campaign) => {
        const matchesSearch =
          !normalizedSearch ||
          [
            campaign.name,
            campaign.companyName,
            campaign.description,
            CAMPAIGN_STATUS_LABELS[
              campaign.status
            ],
            campaign.status,
          ]
            .filter(Boolean)
            .some((value) =>
              normalizeValue(value).includes(
                normalizedSearch
              )
            );

        const matchesStatus =
          statusFilter === "ALL" ||
          campaign.status === statusFilter;

        const campaignCompanyKey = String(
          campaign.companyId ||
            campaign.companyName ||
            ""
        );

        const matchesCompany =
          companyFilter === "ALL" ||
          campaignCompanyKey ===
            companyFilter;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesCompany
        );
      }
    );

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "OLDEST":
          return (
            new Date(a.createdAt || 0) -
            new Date(b.createdAt || 0)
          );

        case "DEADLINE_ASC": {
          if (!a.deadlineAt) return 1;
          if (!b.deadlineAt) return -1;

          return (
            new Date(a.deadlineAt) -
            new Date(b.deadlineAt)
          );
        }

        case "DEADLINE_DESC": {
          if (!a.deadlineAt) return 1;
          if (!b.deadlineAt) return -1;

          return (
            new Date(b.deadlineAt) -
            new Date(a.deadlineAt)
          );
        }

        case "PARTICIPANTS_DESC":
          return (
            Number(
              b.participantCount || 0
            ) -
            Number(
              a.participantCount || 0
            )
          );

        case "NAME_ASC":
          return String(
            a.name || ""
          ).localeCompare(
            String(b.name || ""),
            "fr",
            {
              sensitivity: "base",
            }
          );

        case "NEWEST":
        default:
          return (
            new Date(b.createdAt || 0) -
            new Date(a.createdAt || 0)
          );
      }
    });

    return result;
  }, [
    campaigns,
    search,
    statusFilter,
    companyFilter,
    sortBy,
  ]);

  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (search.trim()) count += 1;
    if (statusFilter !== "ALL") count += 1;
    if (companyFilter !== "ALL") count += 1;
    if (sortBy !== "NEWEST") count += 1;

    return count;
  }, [
    search,
    statusFilter,
    companyFilter,
    sortBy,
  ]);

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setCompanyFilter("ALL");
    setSortBy("NEWEST");
  };

  if (loading) {
    return (
      <div className="admin-campaigns-page">
        <div className="admin-campaigns-loading">
          <div className="admin-spinner" />

          <div>
            <strong>
              Chargement des campagnes
            </strong>

            <p>
              Récupération des données
              Portrélia...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-campaigns-page">
      <header className="admin-campaigns-header">
        <div>
          <span className="admin-page-eyebrow">
            CAMPAGNES
          </span>

          <h1>Suivi des campagnes</h1>

          <p>
            Pilotez les campagnes entreprises,
            suivez leurs participants et
            identifiez rapidement les dossiers
            nécessitant une action.
          </p>
        </div>
      </header>

      {error ? (
        <div className="admin-alert admin-alert-error">
          <div>
            <strong>
              Impossible de charger les
              campagnes
            </strong>

            <p>{error}</p>
          </div>
        </div>
      ) : (
        <>
          <section className="admin-campaign-stats-grid">
            <article className="admin-stat-card">
              <div className="admin-stat-top">
                <span>Campagnes</span>

                <div className="admin-stat-icon">
                  C
                </div>
              </div>

              <strong>
                {stats.campaigns}
              </strong>

              <p>Total créé</p>
            </article>

            <article className="admin-stat-card">
              <div className="admin-stat-top">
                <span>Actives</span>

                <div className="admin-stat-icon">
                  A
                </div>
              </div>

              <strong>
                {stats.activeCampaigns}
              </strong>

              <p>En cours de traitement</p>
            </article>

            <article className="admin-stat-card">
              <div className="admin-stat-top">
                <span>Participants</span>

                <div className="admin-stat-icon">
                  P
                </div>
              </div>

              <strong>
                {stats.totalParticipants}
              </strong>

              <p>Toutes campagnes</p>
            </article>

            <article className="admin-stat-card">
              <div className="admin-stat-top">
                <span>Photos reçues</span>

                <div className="admin-stat-icon">
                  ✓
                </div>
              </div>

              <strong>
                {stats.photosReceived}
              </strong>

              <p>Participants avancés</p>
            </article>
          </section>

          <section className="admin-campaigns-content">
            <div className="admin-campaigns-content-head">
              <div>
                <span className="admin-section-eyebrow">
                  LISTE
                </span>

                <h2>
                  Toutes les campagnes
                </h2>

                <p>
                  Retrouvez et filtrez les
                  campagnes disponibles.
                </p>
              </div>

              <div className="admin-result-counter">
                <strong>
                  {filteredCampaigns.length}
                </strong>

                <span>
                  sur {campaigns.length}
                </span>
              </div>
            </div>

            <div className="admin-filters-panel">
              <div className="admin-campaign-search">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>

                <input
                  type="search"
                  value={search}
                  placeholder="Nom, entreprise, statut..."
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  aria-label="Rechercher une campagne"
                />

                {search && (
                  <button
                    type="button"
                    className="admin-search-clear"
                    onClick={() =>
                      setSearch("")
                    }
                    aria-label="Effacer la recherche"
                  >
                    ×
                  </button>
                )}
              </div>

              <div className="admin-filter-field">
                <span>Statut</span>

                <div className="admin-select-wrapper">
                  <select
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(
                        event.target.value
                      )
                    }
                  >
                    {STATUS_OPTIONS.map(
                      (option) => (
                        <option
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </option>
                      )
                    )}
                  </select>

                  <span className="admin-select-arrow">
                    ↓
                  </span>
                </div>
              </div>

              <div className="admin-filter-field">
                <span>Entreprise</span>

                <div className="admin-select-wrapper">
                  <select
                    value={companyFilter}
                    onChange={(event) =>
                      setCompanyFilter(
                        event.target.value
                      )
                    }
                  >
                    <option value="ALL">
                      Toutes les entreprises
                    </option>

                    {companies.map(
                      (company) => (
                        <option
                          key={company.id}
                          value={String(
                            company.id
                          )}
                        >
                          {company.name}
                        </option>
                      )
                    )}
                  </select>

                  <span className="admin-select-arrow">
                    ↓
                  </span>
                </div>
              </div>

              <div className="admin-filter-field">
                <span>Trier par</span>

                <div className="admin-select-wrapper">
                  <select
                    value={sortBy}
                    onChange={(event) =>
                      setSortBy(
                        event.target.value
                      )
                    }
                  >
                    {SORT_OPTIONS.map(
                      (option) => (
                        <option
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </option>
                      )
                    )}
                  </select>

                  <span className="admin-select-arrow">
                    ↓
                  </span>
                </div>
              </div>
            </div>

            <div className="admin-filter-summary">
              <div className="admin-filter-summary-left">
                <span>
                  {filteredCampaigns.length}{" "}
                  campagne
                  {filteredCampaigns.length >
                  1
                    ? "s"
                    : ""}
                </span>

                {activeFilterCount > 0 && (
                  <span className="admin-active-filter-badge">
                    {activeFilterCount} filtre
                    {activeFilterCount > 1
                      ? "s"
                      : ""}{" "}
                    actif
                    {activeFilterCount > 1
                      ? "s"
                      : ""}
                  </span>
                )}
              </div>

              {activeFilterCount > 0 && (
                <button
                  type="button"
                  className="admin-reset-filters"
                  onClick={resetFilters}
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>

            {filteredCampaigns.length === 0 ? (
              <div className="admin-empty-state">
                <div className="admin-empty-icon">
                  C
                </div>

                <h3>
                  Aucune campagne trouvée
                </h3>

                <p>
                  Modifiez vos filtres ou votre
                  recherche pour afficher
                  d’autres campagnes.
                </p>

                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={resetFilters}
                  >
                    Effacer les filtres
                  </button>
                )}
              </div>
            ) : (
              <div className="admin-campaign-list">
                {filteredCampaigns.map(
                  (campaign) => {
                    const participantCount =
                      Number(
                        campaign.participantCount ||
                          0
                      );

                    const photosReceivedCount =
                      Number(
                        campaign.photosReceivedCount ||
                          0
                      );

                    const progress =
                      participantCount > 0
                        ? Math.min(
                            100,
                            Math.round(
                              (photosReceivedCount /
                                participantCount) *
                                100
                            )
                          )
                        : 0;

                    return (
                      <article
                        className="admin-campaign-card"
                        key={campaign.id}
                      >
                        <div className="admin-campaign-card-top">
                          <div className="admin-campaign-company-block">
                            <div className="admin-company-avatar">
                              {campaign.companyName
                                ?.charAt(0)
                                ?.toUpperCase() ||
                                "P"}
                            </div>

                            <div>
                              <span>
                                Entreprise
                              </span>

                              <strong>
                                {
                                  campaign.companyName
                                }
                              </strong>
                            </div>
                          </div>

                          <span
                            className={`admin-campaign-status status-${campaign.status?.toLowerCase()}`}
                          >
                            {CAMPAIGN_STATUS_LABELS[
                              campaign.status
                            ] ||
                              campaign.status}
                          </span>
                        </div>

                        <div className="admin-campaign-card-body">
                          <div className="admin-campaign-main-copy">
                            <h3>
                              {campaign.name}
                            </h3>

                            <p>
                              {campaign.description ||
                                "Campagne de portraits professionnels."}
                            </p>
                          </div>

                          <div className="admin-campaign-mini-stats">
                            <div>
                              <span>
                                Participants
                              </span>

                              <strong>
                                {
                                  participantCount
                                }
                              </strong>
                            </div>

                            <div>
                              <span>
                                Photos reçues
                              </span>

                              <strong>
                                {
                                  photosReceivedCount
                                }
                              </strong>
                            </div>

                            <div>
                              <span>
                                Deadline
                              </span>

                              <strong>
                                {formatDate(
                                  campaign.deadlineAt
                                )}
                              </strong>
                            </div>
                          </div>
                        </div>

                        <div className="admin-campaign-progress">
                          <div className="admin-campaign-progress-head">
                            <span>
                              Progression des
                              participants
                            </span>

                            <strong>
                              {progress}%
                            </strong>
                          </div>

                          <div className="admin-progress-track">
                            <div
                              className="admin-progress-value"
                              style={{
                                width: `${progress}%`,
                              }}
                            />
                          </div>
                        </div>

                        <div className="admin-campaign-card-footer">
                          <span>
                            Créée le{" "}
                            {formatDate(
                              campaign.createdAt
                            )}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/admin/campagnes/${campaign.id}`
                              )
                            }
                          >
                            Ouvrir la campagne

                            <span>→</span>
                          </button>
                        </div>
                      </article>
                    );
                  }
                )}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default AdminCampaignsPage;