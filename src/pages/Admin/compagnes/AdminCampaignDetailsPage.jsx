import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import "./AdminCampaignDetailsPage.css";
import api from "../../../services/api";

/*
 * =========================================================
 * PARTICIPANT STATUS
 * =========================================================
 */
const PARTICIPANT_STATUS_LABELS = {
  INVITED:
    "Invité",

  CONSENT_PENDING:
    "Consentement",

  PHOTOS_PENDING:
    "Photos attendues",

  PHOTOS_RECEIVED:
    "Photos reçues",

  GENERATION_PENDING:
    "Génération à lancer",

  GENERATION_IN_PROGRESS:
    "Génération en cours",

  QA_PENDING:
    "QA en attente",

  GALLERY_READY:
    "Galerie prête",

  VALIDATED:
    "Validé",

  REVISION_REQUESTED:
    "Reprise demandée",

  DELIVERED:
    "Livré",
};

/*
 * =========================================================
 * PARTICIPANT FILTER OPTIONS
 * =========================================================
 */
const PARTICIPANT_STATUS_OPTIONS = [
  {
    value:
      "ALL",

    label:
      "Tous les statuts",
  },

  {
    value:
      "INVITED",

    label:
      "Invité",
  },

  {
    value:
      "CONSENT_PENDING",

    label:
      "Consentement",
  },

  {
    value:
      "PHOTOS_PENDING",

    label:
      "Photos attendues",
  },

  {
    value:
      "PHOTOS_RECEIVED",

    label:
      "Photos reçues",
  },

  {
    value:
      "GENERATION_PENDING",

    label:
      "Génération à lancer",
  },

  {
    value:
      "GENERATION_IN_PROGRESS",

    label:
      "Génération en cours",
  },

  {
    value:
      "QA_PENDING",

    label:
      "QA en attente",
  },

  {
    value:
      "GALLERY_READY",

    label:
      "Galerie prête",
  },

  {
    value:
      "VALIDATED",

    label:
      "Validé",
  },

  {
    value:
      "REVISION_REQUESTED",

    label:
      "Reprise demandée",
  },

  {
    value:
      "DELIVERED",

    label:
      "Livré",
  },
];

/*
 * =========================================================
 * CAMPAIGN STATUS
 * =========================================================
 */
const CAMPAIGN_STATUS_LABELS = {
  DRAFT:
    "Brouillon",

  READY:
    "Prête",

  IN_PROGRESS:
    "En cours",

  QA:
    "QA",

  DELIVERY_READY:
    "Prête à livrer",

  COMPLETED:
    "Terminée",

  CANCELLED:
    "Annulée",
};

/*
 * =========================================================
 * DATE
 * =========================================================
 */
const formatDate =
  (value) => {
    if (!value) {
      return "—";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "—";
    }

    return new Intl.DateTimeFormat(
      "fr-FR",
      {
        day:
          "2-digit",

        month:
          "long",

        year:
          "numeric",
      }
    ).format(date);
  };

/*
 * =========================================================
 * NORMALIZE
 * =========================================================
 */
const normalizeValue =
  (value) =>
    String(
      value ||
        ""
    )
      .trim()
      .toLowerCase();

/*
 * =========================================================
 * PAGE
 * =========================================================
 */
function AdminCampaignDetailsPage() {
  const {
    campaignId,
  } = useParams();

  const navigate =
    useNavigate();

  const [
    campaign,
    setCampaign,
  ] = useState(null);

  const [
    participants,
    setParticipants,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  /*
   * =========================================================
   * FILTERS
   * =========================================================
   */
  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState(
    "ALL"
  );

  /*
   * =========================================================
   * LOAD CAMPAIGN
   * =========================================================
   */
  useEffect(() => {
    let mounted =
      true;

    const loadCampaign =
      async () => {
        try {
          setLoading(
            true
          );

          setError("");

          const response =
            await api.get(
              `/admin/campaigns/${campaignId}`
            );

          if (
            !mounted
          ) {
            return;
          }

          setCampaign(
            response.data
              ?.data
              ?.campaign ||
              null
          );

          setParticipants(
            Array.isArray(
              response.data
                ?.data
                ?.participants
            )
              ? response.data
                  .data
                  .participants
              : []
          );
        } catch (
          requestError
        ) {
          console.error(
            "Erreur détail campagne admin :",
            requestError
          );

          if (
            !mounted
          ) {
            return;
          }

          setError(
            requestError
              .response
              ?.data
              ?.message ||
              "Impossible de charger cette campagne."
          );
        } finally {
          if (
            mounted
          ) {
            setLoading(
              false
            );
          }
        }
      };

    loadCampaign();

    return () => {
      mounted =
        false;
    };
  }, [campaignId]);

  /*
   * =========================================================
   * FILTER PARTICIPANTS
   * =========================================================
   */
  const filteredParticipants =
    useMemo(() => {
      const normalizedSearch =
        normalizeValue(
          search
        );

      return participants.filter(
        (
          participant
        ) => {
          const fullName =
            normalizeValue(
              `${participant.firstName || ""} ${participant.lastName || ""}`
            );

          const email =
            normalizeValue(
              participant.email
            );

          const jobTitle =
            normalizeValue(
              participant.jobTitle
            );

          const rawStatus =
            normalizeValue(
              participant.status
            );

          const translatedStatus =
            normalizeValue(
              PARTICIPANT_STATUS_LABELS[
                participant
                  .status
              ]
            );

          const matchesSearch =
            !normalizedSearch ||
            [
              fullName,
              email,
              jobTitle,
              rawStatus,
              translatedStatus,
            ].some(
              (value) =>
                value.includes(
                  normalizedSearch
                )
            );

          const matchesStatus =
            statusFilter ===
              "ALL" ||
            participant.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      participants,
      search,
      statusFilter,
    ]);

  /*
   * =========================================================
   * STATISTICS
   * =========================================================
   */
  const statistics =
    useMemo(() => {
      const photosReceived =
        participants.filter(
          (
            participant
          ) =>
            Number(
              participant.photoCount ||
                0
            ) > 0
        ).length;

      const waitingGeneration =
        participants.filter(
          (
            participant
          ) =>
            participant.status ===
            "GENERATION_PENDING"
        ).length;

      const generationInProgress =
        participants.filter(
          (
            participant
          ) =>
            participant.status ===
            "GENERATION_IN_PROGRESS"
        ).length;

      const inQA =
        participants.filter(
          (
            participant
          ) =>
            participant.status ===
            "QA_PENDING"
        ).length;

      return {
        photosReceived,

        waitingGeneration,

        generationInProgress,

        inQA,
      };
    }, [
      participants,
    ]);

  /*
   * =========================================================
   * ACTIVE FILTERS
   * =========================================================
   */
  const activeFilterCount =
    useMemo(() => {
      let count = 0;

      if (
        search.trim()
      ) {
        count += 1;
      }

      if (
        statusFilter !==
        "ALL"
      ) {
        count += 1;
      }

      return count;
    }, [
      search,
      statusFilter,
    ]);

  /*
   * =========================================================
   * RESET FILTERS
   * =========================================================
   */
  const resetFilters =
    () => {
      setSearch(
        ""
      );

      setStatusFilter(
        "ALL"
      );
    };

  /*
   * =========================================================
   * QUICK FILTER
   * =========================================================
   */
  const filterByStatus =
    (status) => {
      setStatusFilter(
        status
      );

      window.requestAnimationFrame(
        () => {
          document
            .getElementById(
              "campaign-participants"
            )
            ?.scrollIntoView({
              behavior:
                "smooth",

              block:
                "start",
            });
        }
      );
    };

  /*
   * =========================================================
   * OPEN PARTICIPANT / QA PORTRAITS
   * =========================================================
   */
  const openParticipant =
    (participant) => {
      if (
        participant.status ===
        "QA_PENDING"
      ) {
        navigate(
          `/admin/qa-portraits/participants/${participant.id}`
        );

        return;
      }

      navigate(
        `/admin/participants/${participant.id}`
      );
    };

  /*
   * =========================================================
   * LOADING
   * =========================================================
   */
  if (loading) {
    return (
      <div className="admin-campaign-detail-page">

        <div className="admin-detail-loading">

          <div className="admin-detail-spinner" />

          <div>

            <strong>
              Chargement de la campagne
            </strong>

            <p>
              Récupération des participants...
            </p>

          </div>

        </div>

      </div>
    );
  }

  /*
   * =========================================================
   * ERROR
   * =========================================================
   */
  if (
    error ||
    !campaign
  ) {
    return (
      <div className="admin-campaign-detail-page">

        <button
          type="button"
          className="admin-detail-back"
          onClick={() =>
            navigate(
              "/admin/campagnes"
            )
          }
        >
          ← Retour aux campagnes
        </button>

        <div className="admin-detail-error">

          <strong>
            Campagne indisponible
          </strong>

          <p>
            {error ||
              "Campagne introuvable."}
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="admin-campaign-detail-page">

      {/* =====================================================
          BACK
      ====================================================== */}

      <button
        type="button"
        className="admin-detail-back"
        onClick={() =>
          navigate(
            "/admin/campagnes"
          )
        }
      >
        ← Retour aux campagnes
      </button>

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="admin-detail-hero">

        <div className="admin-detail-hero-main">

          <div className="admin-detail-company-line">

            <span className="admin-detail-company-avatar">
              {campaign.companyName
                ?.charAt(0)
                ?.toUpperCase() ||
                "P"}
            </span>

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

          <div className="admin-detail-title-row">

            <div>

              <span className="admin-detail-eyebrow">
                CAMPAGNE
              </span>

              <h1>
                {campaign.name}
              </h1>

              <p>
                {campaign.description ||
                  "Suivi opérationnel de la campagne Portrélia."}
              </p>

            </div>

            <span
              className={`admin-detail-status status-${campaign.status?.toLowerCase()}`}
            >
              {CAMPAIGN_STATUS_LABELS[
                campaign.status
              ] ||
                campaign.status}
            </span>

          </div>

        </div>

        {/* =================================================
            CAMPAIGN INFOS
        ================================================== */}

        <div className="admin-detail-information-grid">

          <div>

            <span>
              Style portrait
            </span>

            <strong>
              {campaign.styleName ||
                "Non défini"}
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

          <div>

            <span>
              Création
            </span>

            <strong>
              {formatDate(
                campaign.createdAt
              )}
            </strong>

          </div>

        </div>

      </section>

      {/* =====================================================
          STATS
      ====================================================== */}

      <section className="admin-detail-stats">

        <article>

          <span>
            Participants
          </span>

          <strong>
            {
              participants.length
            }
          </strong>

        </article>

        <article>

          <span>
            Avec photos
          </span>

          <strong>
            {
              statistics
                .photosReceived
            }
          </strong>

        </article>

        <article
          className={
            statistics
              .waitingGeneration >
            0
              ? "admin-stat-actionable"
              : ""
          }
          onClick={() => {
            if (
              statistics
                .waitingGeneration >
              0
            ) {
              filterByStatus(
                "GENERATION_PENDING"
              );
            }
          }}
        >

          <span>
            À générer
          </span>

          <strong>
            {
              statistics
                .waitingGeneration
            }
          </strong>

        </article>

        <article
          className={
            statistics.inQA >
            0
              ? "admin-stat-actionable admin-stat-qa"
              : ""
          }
          onClick={() => {
            if (
              statistics.inQA >
              0
            ) {
              filterByStatus(
                "QA_PENDING"
              );
            }
          }}
        >

          <span>
            En QA
          </span>

          <strong>
            {
              statistics.inQA
            }
          </strong>

        </article>

      </section>

      {/* =====================================================
          PARTICIPANTS
      ====================================================== */}

      <section
        id="campaign-participants"
        className="admin-detail-participants"
      >

        {/* =================================================
            TITLE
        ================================================== */}

        <div className="admin-detail-section-header">

          <div>

            <span>
              PARTICIPANTS
            </span>

            <h2>
              Suivi des collaborateurs
            </h2>

            <p>
              Consultez les statuts,
              filtrez les dossiers et
              accédez rapidement aux
              participants nécessitant
              une action.
            </p>

          </div>

          <div className="admin-detail-result-counter">

            <strong>
              {
                filteredParticipants
                  .length
              }
            </strong>

            <span>
              sur{" "}
              {
                participants.length
              }
            </span>

          </div>

        </div>

        {/* =================================================
            FILTERS
        ================================================== */}

        <div className="admin-participant-filters">

          {/* SEARCH */}

          <div className="admin-detail-search">

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
              placeholder="Nom, email, statut..."
              value={
                search
              }
              onChange={(
                event
              ) =>
                setSearch(
                  event.target
                    .value
                )
              }
            />

            {search && (
              <button
                type="button"
                className="admin-detail-search-clear"
                onClick={() =>
                  setSearch(
                    ""
                  )
                }
                aria-label="Effacer la recherche"
              >
                ×
              </button>
            )}

          </div>

          {/* STATUS */}

          <div className="admin-participant-filter-field">

            <span>
              Statut
            </span>

            <div className="admin-participant-select-wrapper">

              <select
                value={
                  statusFilter
                }
                onChange={(
                  event
                ) =>
                  setStatusFilter(
                    event.target
                      .value
                  )
                }
              >

                {PARTICIPANT_STATUS_OPTIONS.map(
                  (
                    option
                  ) => (
                    <option
                      key={
                        option.value
                      }
                      value={
                        option.value
                      }
                    >
                      {
                        option.label
                      }
                    </option>
                  )
                )}

              </select>

              <span className="admin-participant-select-arrow">
                ↓
              </span>

            </div>

          </div>

        </div>

        {/* =================================================
            FILTER SUMMARY
        ================================================== */}

        <div className="admin-participant-filter-summary">

          <div className="admin-participant-filter-summary-left">

            <span>
              {
                filteredParticipants
                  .length
              }{" "}
              participant
              {
                filteredParticipants
                  .length >
                1
                  ? "s"
                  : ""
              }
            </span>

            {activeFilterCount >
              0 && (
              <span className="admin-participant-filter-badge">
                {
                  activeFilterCount
                }{" "}
                filtre
                {
                  activeFilterCount >
                  1
                    ? "s"
                    : ""
                }{" "}
                actif
                {
                  activeFilterCount >
                  1
                    ? "s"
                    : ""
                }
              </span>
            )}

            {statusFilter ===
              "QA_PENDING" && (
              <span className="admin-participant-qa-filter-badge">
                Portraits à contrôler
              </span>
            )}

          </div>

          {activeFilterCount >
            0 && (
            <button
              type="button"
              className="admin-participant-reset-filters"
              onClick={
                resetFilters
              }
            >
              Réinitialiser les filtres
            </button>
          )}

        </div>

        {/* =================================================
            TABLE
        ================================================== */}

        <div className="admin-participant-table-wrap">

          <table className="admin-participant-table">

            <thead>

              <tr>

                <th>
                  Participant
                </th>

                <th>
                  Email
                </th>

                <th>
                  Statut
                </th>

                <th>
                  Photos
                </th>

                <th />

              </tr>

            </thead>

            <tbody>

              {filteredParticipants.map(
                (
                  participant
                ) => (
                  <tr
                    key={
                      participant.id
                    }
                    className={
                      participant.status ===
                      "QA_PENDING"
                        ? "admin-participant-row-qa"
                        : ""
                    }
                  >

                    {/* PARTICIPANT */}

                    <td>

                      <div className="admin-person-cell">

                        <span className="admin-person-avatar">

                          {participant.firstName
                            ?.charAt(0)
                            ?.toUpperCase()}

                          {participant.lastName
                            ?.charAt(0)
                            ?.toUpperCase()}

                        </span>

                        <div>

                          <strong>
                            {
                              participant.firstName
                            }{" "}
                            {
                              participant.lastName
                            }
                          </strong>

                          <span>
                            {participant.jobTitle ||
                              "Collaborateur"}
                          </span>

                        </div>

                      </div>

                    </td>

                    {/* EMAIL */}

                    <td className="admin-email-cell">
                      {
                        participant.email
                      }
                    </td>

                    {/* STATUS */}

                    <td>

                      <span
                        className={`admin-participant-status status-${participant.status?.toLowerCase()}`}
                      >
                        {PARTICIPANT_STATUS_LABELS[
                          participant.status
                        ] ||
                          participant.status}
                      </span>

                    </td>

                    {/* PHOTOS */}

                    <td>

                      <div className="admin-photo-count-cell">

                        <strong>
                          {
                            participant.photoCount ||
                            0
                          }
                        </strong>

                        <span>
                          / 12
                        </span>

                      </div>

                    </td>

                    {/* ACTION */}

                    <td>

                      <button
                        type="button"
                        className={`admin-open-participant ${
                          participant.status ===
                          "QA_PENDING"
                            ? "admin-open-participant-qa"
                            : ""
                        }`}
                        onClick={() =>
                          openParticipant(
                            participant
                          )
                        }
                      >

                        {participant.status ===
                        "QA_PENDING"
                          ? "Contrôler"
                          : "Ouvrir"}

                        <span>
                          →
                        </span>

                      </button>

                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

          {/* EMPTY */}

          {filteredParticipants.length ===
            0 && (
            <div className="admin-participant-empty">

              <strong>
                Aucun participant trouvé
              </strong>

              <p>
                Aucun participant
                ne correspond à
                votre recherche ou
                aux filtres sélectionnés.
              </p>

              {activeFilterCount >
                0 && (
                <button
                  type="button"
                  className="admin-empty-reset-button"
                  onClick={
                    resetFilters
                  }
                >
                  Effacer les filtres
                </button>
              )}

            </div>
          )}

        </div>

      </section>

    </div>
  );
}

export default AdminCampaignDetailsPage;