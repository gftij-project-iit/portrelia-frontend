import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  FiPlus,
  FiUsers,
  FiCalendar,
  FiArrowRight,
  FiImage,
  FiSearch,
  FiFilter,
  FiX,
  FiChevronDown,
  FiRefreshCw,
  FiAlertCircle,
} from "react-icons/fi";

import {
  ClipLoader,
} from "react-spinners";




import "./CampaignsPage.css";
import api from "../../../services/api";

const normalizeCampaignsResponse = (
  response
) => {
  const data =
    response?.data?.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (
    Array.isArray(
      data?.campaigns
    )
  ) {
    return data.campaigns;
  }

  return [];
};

function CampaignsPage() {
  const navigate =
    useNavigate();

  const [
    campaigns,
    setCampaigns,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    filtersOpen,
    setFiltersOpen,
  ] = useState(false);

  const [
    draftFilters,
    setDraftFilters,
  ] = useState({
    status: "ALL",
    progress: "ALL",
  });

  const [
    filters,
    setFilters,
  ] = useState({
    status: "ALL",
    progress: "ALL",
  });

  /*
   * Chargement initial.
   *
   * Pas d'appel à une fonction
   * contenant directement setState
   * depuis le useEffect.
   *
   * Cela évite :
   * react-hooks/set-state-in-effect
   */
  useEffect(() => {
    const controller =
      new AbortController();

    api
      .get(
        "/company/campaigns",
        {
          signal:
            controller.signal,
        }
      )
      .then((response) => {
        const campaignsData =
          normalizeCampaignsResponse(
            response
          );

        setCampaigns(
          campaignsData
        );

        setError("");
      })
      .catch((error) => {
        if (
          error.code ===
            "ERR_CANCELED" ||
          error.name ===
            "CanceledError"
        ) {
          return;
        }

        console.error(
          "Erreur chargement campagnes :",
          error
        );

        setError(
          error.response?.data
            ?.message ||
            "Impossible de charger les campagnes."
        );
      })
      .finally(() => {
        if (
          !controller.signal
            .aborted
        ) {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, []);

  /*
   * Recharge manuelle.
   *
   * Cette fonction est appelée
   * depuis un clic utilisateur,
   * donc aucun problème ESLint.
   */
  const reloadCampaigns =
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get(
            "/company/campaigns"
          );

        const campaignsData =
          normalizeCampaignsResponse(
            response
          );

        setCampaigns(
          campaignsData
        );
      } catch (error) {
        console.error(
          "Erreur rechargement campagnes :",
          error
        );

        setError(
          error.response?.data
            ?.message ||
            "Impossible de charger les campagnes."
        );
      } finally {
        setLoading(false);
      }
    };

  /*
   * Recherche + filtres
   */
  const filteredCampaigns =
    useMemo(() => {
      return campaigns.filter(
        (campaign) => {
          const query =
            search
              .trim()
              .toLowerCase();

          const name =
            String(
              campaign.name ||
                ""
            ).toLowerCase();

          const description =
            String(
              campaign.description ||
                ""
            ).toLowerCase();

          const matchesSearch =
            !query ||
            name.includes(
              query
            ) ||
            description.includes(
              query
            );

          const matchesStatus =
            filters.status ===
              "ALL" ||
            campaign.status ===
              filters.status;

          const progress =
            Number(
              campaign.progress ??
                0
            );

          let matchesProgress =
            true;

          if (
            filters.progress ===
            "0-25"
          ) {
            matchesProgress =
              progress >= 0 &&
              progress <= 25;
          }

          if (
            filters.progress ===
            "26-75"
          ) {
            matchesProgress =
              progress >= 26 &&
              progress <= 75;
          }

          if (
            filters.progress ===
            "76-99"
          ) {
            matchesProgress =
              progress >= 76 &&
              progress <= 99;
          }

          if (
            filters.progress ===
            "100"
          ) {
            matchesProgress =
              progress === 100;
          }

          return (
            matchesSearch &&
            matchesStatus &&
            matchesProgress
          );
        }
      );
    }, [
      campaigns,
      search,
      filters,
    ]);

  const handleFilterChange =
    (event) => {
      const {
        name,
        value,
      } = event.target;

      setDraftFilters(
        (previous) => ({
          ...previous,
          [name]: value,
        })
      );
    };

  const applyFilters = () => {
    setFilters({
      ...draftFilters,
    });

    setFiltersOpen(false);
  };

  const resetFilters = () => {
    const initialFilters = {
      status: "ALL",
      progress: "ALL",
    };

    setDraftFilters(
      initialFilters
    );

    setFilters(
      initialFilters
    );

    setFiltersOpen(false);
  };

  const getStatusLabel =
    (status) => {
      switch (status) {
        case "DRAFT":
          return "Brouillon";

        case "READY":
          return "Prête";

        case "IN_PROGRESS":
          return "En cours";

        case "QA":
          return "En QA";

        case "DELIVERY_READY":
          return "Prête à livrer";

        case "COMPLETED":
          return "Terminée";

        case "CANCELLED":
          return "Annulée";

        default:
          return status || "-";
      }
    };

  const getStatusClass =
    (status) => {
      switch (status) {
        case "DRAFT":
          return "draft";

        case "READY":
          return "ready";

        case "IN_PROGRESS":
          return "active";

        case "QA":
          return "qa";

        case "DELIVERY_READY":
          return "delivery-ready";

        case "COMPLETED":
          return "completed";

        case "CANCELLED":
          return "cancelled";

        default:
          return "draft";
      }
    };

  const formatDate = (
    date
  ) => {
    if (!date) {
      return "Non définie";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "Non définie";
    }

    return new Intl
      .DateTimeFormat(
        "fr-FR",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      )
      .format(
        parsedDate
      );
  };

  const getParticipantsCount =
    (campaign) =>
      Number(
        campaign.participants ??
          campaign.participantsCount ??
          campaign.participants_count ??
          campaign.targetParticipantCount ??
          campaign.target_participant_count ??
          0
      );

  const getPhotosReceived =
    (campaign) =>
      Number(
        campaign.photosReceived ??
          campaign.photos_received ??
          0
      );

  const getValidated =
    (campaign) =>
      Number(
        campaign.validated ??
          campaign.validatedCount ??
          campaign.validated_count ??
          0
      );

  const getProgress =
    (campaign) => {
      const explicitProgress =
        campaign.progress;

      if (
        explicitProgress !==
          undefined &&
        explicitProgress !== null
      ) {
        return Math.min(
          100,
          Math.max(
            0,
            Number(
              explicitProgress
            ) || 0
          )
        );
      }

      const participants =
        getParticipantsCount(
          campaign
        );

      const validated =
        getValidated(
          campaign
        );

      if (
        participants === 0
      ) {
        return 0;
      }

      return Math.min(
        100,
        Math.round(
          (
            validated /
            participants
          ) * 100
        )
      );
    };

  const totalParticipants =
    campaigns.reduce(
      (
        total,
        campaign
      ) =>
        total +
        getParticipantsCount(
          campaign
        ),
      0
    );

  const activeCampaigns =
    campaigns.filter(
      (campaign) =>
        campaign.status ===
          "READY" ||
        campaign.status ===
          "IN_PROGRESS" ||
        campaign.status ===
          "QA" ||
        campaign.status ===
          "DELIVERY_READY"
    ).length;

  return (
    <div className="company-campaigns-page">

      {/* HEADER */}
      <div className="company-campaigns-header">

        <div>
          <span className="company-campaigns-kicker">
            CAMPAGNES
          </span>

          <h1>
            Vos campagnes
          </h1>

          <p>
            Suivez et gérez l'ensemble de vos campagnes de portraits.
          </p>
        </div>

        <button
          type="button"
          className="company-campaigns-create-btn"
          onClick={() =>
            navigate(
              "/dashboard/campagnes/creer"
            )
          }
        >
          <FiPlus />

          Créer une campagne
        </button>

      </div>

      {/* ERROR */}
      {error && (
        <div
          className="company-campaigns-error"
          role="alert"
        >
          <FiAlertCircle />

          <div>
            <strong>
              Chargement impossible
            </strong>

            <span>
              {error}
            </span>
          </div>

          <button
            type="button"
            onClick={
              reloadCampaigns
            }
            disabled={
              loading
            }
          >
            <FiRefreshCw />

            Réessayer
          </button>

        </div>
      )}

      {/* SUMMARY */}
      <div className="company-campaigns-summary">

        <div>
          <strong>
            {loading
              ? "-"
              : campaigns.length}
          </strong>

          <span>
            Campagnes
          </span>
        </div>

        <div>
          <strong>
            {loading
              ? "-"
              : activeCampaigns}
          </strong>

          <span>
            En cours
          </span>
        </div>

        <div>
          <strong>
            {loading
              ? "-"
              : totalParticipants}
          </strong>

          <span>
            Participants
          </span>
        </div>

      </div>

      {/* TOOLBAR */}
      <div className="company-campaigns-toolbar">

        <div className="company-campaigns-search">
          <FiSearch />

          <input
            type="text"
            placeholder="Rechercher une campagne..."
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
        </div>

        <div className="company-campaigns-filter-wrapper">

          <button
            type="button"
            className={`company-campaigns-filter-btn ${
              filtersOpen
                ? "company-campaigns-filter-btn-active"
                : ""
            }`}
            onClick={() =>
              setFiltersOpen(
                (previous) =>
                  !previous
              )
            }
          >
            <FiFilter />

            Filtres

            <FiChevronDown />
          </button>

          {filtersOpen && (
            <div className="company-campaigns-filter-panel">

              <div className="company-campaigns-filter-header">

                <div>
                  <strong>
                    Filtres
                  </strong>

                  <span>
                    Affinez la liste des campagnes
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setFiltersOpen(
                      false
                    )
                  }
                  aria-label="Fermer les filtres"
                >
                  <FiX />
                </button>

              </div>

              <div className="company-campaigns-filter-field">

                <label htmlFor="status">
                  Statut
                </label>

                <select
                  id="status"
                  name="status"
                  value={
                    draftFilters.status
                  }
                  onChange={
                    handleFilterChange
                  }
                >
                  <option value="ALL">
                    Tous les statuts
                  </option>

                  <option value="DRAFT">
                    Brouillon
                  </option>

                  <option value="READY">
                    Prête
                  </option>

                  <option value="IN_PROGRESS">
                    En cours
                  </option>

                  <option value="QA">
                    En QA
                  </option>

                  <option value="DELIVERY_READY">
                    Prête à livrer
                  </option>

                  <option value="COMPLETED">
                    Terminée
                  </option>

                  <option value="CANCELLED">
                    Annulée
                  </option>
                </select>

              </div>

              <div className="company-campaigns-filter-field">

                <label htmlFor="progress">
                  Progression
                </label>

                <select
                  id="progress"
                  name="progress"
                  value={
                    draftFilters.progress
                  }
                  onChange={
                    handleFilterChange
                  }
                >
                  <option value="ALL">
                    Toutes
                  </option>

                  <option value="0-25">
                    0 à 25 %
                  </option>

                  <option value="26-75">
                    26 à 75 %
                  </option>

                  <option value="76-99">
                    76 à 99 %
                  </option>

                  <option value="100">
                    100 %
                  </option>
                </select>

              </div>

              <div className="company-campaigns-filter-actions">

                <button
                  type="button"
                  className="company-campaigns-reset-btn"
                  onClick={
                    resetFilters
                  }
                >
                  Réinitialiser
                </button>

                <button
                  type="button"
                  className="company-campaigns-apply-btn"
                  onClick={
                    applyFilters
                  }
                >
                  Appliquer
                </button>

              </div>

            </div>
          )}

        </div>

      </div>

      {/* LOADING */}
      {loading ? (
        <div className="company-campaigns-loading">

          <ClipLoader
            size={28}
            color="#4f2e94"
          />

          <span>
            Chargement des campagnes...
          </span>

        </div>
      ) : (
        <>
          {/* RESULTS */}
          <div className="company-campaigns-results">

            {filteredCampaigns.length}

            {" "}

            {filteredCampaigns.length >
            1
              ? "campagnes"
              : "campagne"}

          </div>

          {/* LIST */}
          <div className="company-campaigns-list">

            {filteredCampaigns.length >
            0 ? (
              filteredCampaigns.map(
                (campaign) => {
                  const participants =
                    getParticipantsCount(
                      campaign
                    );

                  const photosReceived =
                    getPhotosReceived(
                      campaign
                    );

                  const validated =
                    getValidated(
                      campaign
                    );

                  const progress =
                    getProgress(
                      campaign
                    );

                  const deadline =
                    campaign.deadlineAt ??
                    campaign.deadline_at ??
                    campaign.deadline;

                  return (
                    <article
                      key={
                        campaign.id
                      }
                      className="company-campaign-card"
                    >

                      <div className="company-campaign-card-header">

                        <div>

                          <span
                            className={`company-campaign-status company-campaign-status-${getStatusClass(
                              campaign.status
                            )}`}
                          >
                            {getStatusLabel(
                              campaign.status
                            )}
                          </span>

                          <h2>
                            {campaign.name}
                          </h2>

                          <p>
                            {campaign.description ||
                              "Aucune description renseignée."}
                          </p>

                        </div>

                        <button
                          type="button"
                          className="company-campaign-open-btn"
                          onClick={() =>
                            navigate(
                              `/dashboard/campagnes/${campaign.id}`
                            )
                          }
                        >
                          Voir

                          <FiArrowRight />
                        </button>

                      </div>

                      <div className="company-campaign-infos">

                        <div>
                          <FiUsers />

                          <span>
                            Participants
                          </span>

                          <strong>
                            {participants}
                          </strong>
                        </div>

                        <div>
                          <FiImage />

                          <span>
                            Photos reçues
                          </span>

                          <strong>
                            {photosReceived}
                          </strong>
                        </div>

                        <div>
                          <FiCalendar />

                          <span>
                            Date limite
                          </span>

                          <strong>
                            {formatDate(
                              deadline
                            )}
                          </strong>
                        </div>

                      </div>

                      <div className="company-campaign-progress">

                        <div className="company-campaign-progress-top">

                          <span>
                            Progression
                          </span>

                          <strong>
                            {progress} %
                          </strong>

                        </div>

                        <div className="company-campaign-progress-track">

                          <div
                            className="company-campaign-progress-fill"
                            style={{
                              width:
                                `${progress}%`,
                            }}
                          />

                        </div>

                        <span className="company-campaign-progress-detail">

                          {validated}

                          {" / "}

                          {participants}

                          {" "}

                          portraits validés

                        </span>

                      </div>

                    </article>
                  );
                }
              )
            ) : (
              <div className="company-campaigns-empty">

                <strong>
                  {campaigns.length ===
                  0
                    ? "Aucune campagne pour le moment"
                    : "Aucune campagne trouvée"}
                </strong>

                <span>
                  {campaigns.length ===
                  0
                    ? "Créez votre première campagne pour commencer."
                    : "Modifiez votre recherche ou vos filtres."}
                </span>

                {campaigns.length ===
                  0 && (
                  <button
                    type="button"
                    className="company-campaigns-empty-create"
                    onClick={() =>
                      navigate(
                        "/dashboard/campagnes/creer"
                      )
                    }
                  >
                    <FiPlus />

                    Créer une campagne
                  </button>
                )}

              </div>
            )}

          </div>
        </>
      )}

    </div>
  );
}

export default CampaignsPage;