
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUsers,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiArrowRight,
  FiMail,
  FiSend,
  FiCheckCircle,
  FiImage,
  FiGrid,
  FiAlertCircle,
  FiPlus,
  FiBriefcase,
} from "react-icons/fi";
import { ClipLoader } from "react-spinners";

import api from "../../../services/api";
import "./CollaboratorsPage.css";

// Les statuts sont les mêmes que dans CampaignDetailPage.
const STATUS_LABELS = {
  INVITED: "Invité",
  CONSENT_PENDING: "Consentement",
  PHOTOS_PENDING: "Photos attendues",
  PHOTOS_RECEIVED: "Photos reçues",
  GENERATION_PENDING: "En attente",
  GENERATION_IN_PROGRESS: "Génération",
  QA_PENDING: "En QA",
  GALLERY_READY: "Galerie prête",
  VALIDATED: "Validé",
  REVISION_REQUESTED: "Reprise demandée",
  DELIVERED: "Livré",
};

const STATUS_GROUPS = {
  INVITED: "waiting",
  CONSENT_PENDING: "waiting",
  PHOTOS_PENDING: "waiting",
  PHOTOS_RECEIVED: "progress",
  GENERATION_PENDING: "progress",
  GENERATION_IN_PROGRESS: "progress",
  QA_PENDING: "progress",
  REVISION_REQUESTED: "warning",
  GALLERY_READY: "ready",
  VALIDATED: "ready",
  DELIVERED: "ready",
};

const getStatusLabel = (status) =>
  STATUS_LABELS[status] || status || "Non défini";

const getStatusClass = (status) =>
  STATUS_GROUPS[status] || "waiting";

const getInvitationLabel = (status) => {
  switch (status) {
    case "PENDING":
      return "À envoyer";
    case "SENT":
      return "Envoyée";
    case "OPENED":
      return "Ouverte";
    case "EXPIRED":
      return "Expirée";
    case "REVOKED":
      return "Révoquée";
    default:
      return "Aucune";
  }
};

const getFullName = (participant) => {
  const name = [
    participant.firstName,
    participant.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return name || "Collaborateur sans nom";
};

const formatDate = (value) => {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

// Réutilise les deux routes entreprise qui existent déjà.
//
// GET /company/campaigns
// GET /company/campaigns/:id
//
// On charge les détails par lots de cinq pour ne pas envoyer
// toutes les requêtes au même instant.
const fetchCollaborators = async () => {
  const response = await api.get("/company/campaigns", {
    timeout: 60000,
  });

  const campaigns = response.data?.data?.campaigns;

  if (!Array.isArray(campaigns)) {
    throw new Error("Liste des campagnes invalide.");
  }

  const collaborators = [];
  let failedCampaigns = 0;

  for (let index = 0; index < campaigns.length; index += 5) {
    const batch = campaigns.slice(index, index + 5);

    const results = await Promise.allSettled(
      batch.map((campaign) =>
        api.get(`/company/campaigns/${campaign.id}`, {
          timeout: 60000,
        })
      )
    );

    results.forEach((result, position) => {
      const campaign = batch[position];

      if (result.status !== "fulfilled") {
        failedCampaigns += 1;
        console.error(
          "Erreur collaborateurs campagne :",
          campaign.id,
          result.reason
        );
        return;
      }

      const data = result.value.data?.data;

      if (!Array.isArray(data?.participants)) {
        failedCampaigns += 1;
        return;
      }

      data.participants.forEach((participant) => {
        collaborators.push({
          ...participant,
          campaignId: campaign.id,
          campaignName: campaign.name,
          campaignStatus: campaign.status,
          recordKey: `${campaign.id}-${participant.id}`,
        });
      });
    });
  }

  return {
    campaigns,
    collaborators,
    failedCampaigns,
  };
};

function CollaboratorsPage() {
  const navigate = useNavigate();

  const [campaigns, setCampaigns] = useState([]);
  const [collaborators, setCollaborators] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [reloadKey] = useState(0);

  const [search, setSearch] = useState("");
  const [campaignFilter, setCampaignFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [resendingId, setResendingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const applyResponse = useCallback((result) => {
    setCampaigns(result.campaigns);
    setCollaborators(result.collaborators);

    setWarning(
      result.failedCampaigns > 0
        ? `${result.failedCampaigns} campagne(s) n'ont pas pu être chargées. La liste peut être incomplète.`
        : ""
    );
  }, []);

  useEffect(() => {
    let active = true;

    fetchCollaborators()
      .then((result) => {
        if (!active) return;

        applyResponse(result);
        setError("");
      })
      .catch((err) => {
        if (!active) return;

        console.error("Chargement collaborateurs :", err);

        setError(
          err.response?.data?.message ||
          err.message ||
          "Impossible de récupérer les collaborateurs."
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [applyResponse, reloadKey]);

  const handleRefresh = async () => {
    if (refreshing || loading) return;

    try {
      setRefreshing(true);
      setError("");
      setSuccessMessage("");

      const result = await fetchCollaborators();
      applyResponse(result);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Impossible d'actualiser les collaborateurs."
      );
    } finally {
      setRefreshing(false);
    }
  };

  const filteredCollaborators = useMemo(() => {
    const query = search.trim().toLowerCase();

    return collaborators.filter((participant) => {
      const content = [
        participant.firstName,
        participant.lastName,
        participant.email,
        participant.jobTitle,
        participant.campaignName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || content.includes(query);

      const matchesCampaign =
        campaignFilter === "ALL" ||
        String(participant.campaignId) === campaignFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        participant.status === statusFilter;

      return matchesSearch && matchesCampaign && matchesStatus;
    });
  }, [collaborators, search, campaignFilter, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: collaborators.length,
      waiting: collaborators.filter((participant) =>
        ["INVITED", "CONSENT_PENDING", "PHOTOS_PENDING"].includes(
          participant.status
        )
      ).length,
      photos: collaborators.filter(
        (participant) => Number(participant.photoCount || 0) > 0
      ).length,
      ready: collaborators.filter(
        (participant) =>
          participant.galleryId ||
          ["GALLERY_READY", "VALIDATED", "DELIVERED"].includes(
            participant.status
          )
      ).length,
    };
  }, [collaborators]);

  const handleResendInvitation = async (participant) => {
    if (
      !participant.invitationId ||
      resendingId ||
      ["COMPLETED", "CANCELLED"].includes(participant.campaignStatus)
    ) {
      return;
    }

    try {
      setResendingId(participant.recordKey);
      setError("");
      setSuccessMessage("");

      await api.post(
        `/company/campaigns/${participant.campaignId}/invitations/${participant.invitationId}/resend`
      );

      setSuccessMessage(
        `Invitation renvoyée à ${getFullName(participant)}.`
      );

      // Recharge les statuts depuis PostgreSQL.
      const result = await fetchCollaborators();
      applyResponse(result);
    } catch (err) {
      console.error("Relance invitation :", err);

      setError(
        err.response?.data?.message ||
        "Impossible de renvoyer cette invitation."
      );
    } finally {
      setResendingId(null);
    }
  };

  const openCampaign = (participant) => {
    navigate(`/dashboard/campagnes/${participant.campaignId}`);
  };

  const hasFilters =
    search !== "" ||
    campaignFilter !== "ALL" ||
    statusFilter !== "ALL";

  return (
    <div className="company-collaborators-page">
      {/* HEADER */}
      <header className="company-collaborators-header">
        <div>
          <span className="company-collaborators-kicker">
            ESPACE ENTREPRISE
          </span>

          <h1>Collaborateurs</h1>

          <p>
            Retrouvez tous les collaborateurs de vos campagnes,
            leurs invitations et leur progression.
          </p>
        </div>

        <button
          type="button"
          className="company-collaborators-refresh"
          onClick={handleRefresh}
          disabled={loading || refreshing}
        >
          <FiRefreshCw
            className={refreshing ? "company-collaborators-spin" : ""}
          />
          {refreshing ? "Actualisation..." : "Actualiser"}
        </button>
      </header>

      {/* MESSAGES */}
      {error && (
        <div className="company-collaborators-alert" role="alert">
          <FiAlertCircle />
          <span>{error}</span>
          <button type="button" onClick={handleRefresh}>
            Réessayer
          </button>
        </div>
      )}

      {warning && (
        <div className="company-collaborators-warning" role="status">
          <FiAlertCircle />
          <span>{warning}</span>
        </div>
      )}

      {successMessage && (
        <div className="company-collaborators-success" role="status">
          <FiCheckCircle />
          <span>{successMessage}</span>
          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            aria-label="Fermer"
          >
            ×
          </button>
        </div>
      )}

      {/* STATISTIQUES */}
      <section className="company-collaborators-stats">
        <article>
          <span className="company-collaborators-stat-icon purple">
            <FiUsers />
          </span>
          <div>
            <strong>{loading ? "—" : stats.total}</strong>
            <span>Participations</span>
          </div>
        </article>

        <article>
          <span className="company-collaborators-stat-icon orange">
            <FiMail />
          </span>
          <div>
            <strong>{loading ? "—" : stats.waiting}</strong>
            <span>En attente</span>
          </div>
        </article>

        <article>
          <span className="company-collaborators-stat-icon blue">
            <FiImage />
          </span>
          <div>
            <strong>{loading ? "—" : stats.photos}</strong>
            <span>Avec photos</span>
          </div>
        </article>

        <article>
          <span className="company-collaborators-stat-icon green">
            <FiGrid />
          </span>
          <div>
            <strong>{loading ? "—" : stats.ready}</strong>
            <span>Galeries / portraits prêts</span>
          </div>
        </article>
      </section>

      {/* LISTE */}
      <section className="company-collaborators-section">
        <div className="company-collaborators-section-heading">
          <div>
            <h2>Tous les collaborateurs</h2>
            <p>
              Une vue centralisée de l'ensemble de vos campagnes.
            </p>
          </div>

          <button
            type="button"
            className="company-collaborators-add-btn"
            onClick={() => navigate("/dashboard/campagnes")}
          >
            <FiPlus />
            Ajouter via une campagne
          </button>
        </div>

        {/* RECHERCHE ET FILTRES */}
        <div className="company-collaborators-toolbar">
          <label className="company-collaborators-search">
            <FiSearch />
            <input
              type="search"
              placeholder="Nom, email, poste..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Rechercher un collaborateur"
            />
          </label>

          <label className="company-collaborators-filter">
            <FiFilter />
            <select
              value={campaignFilter}
              onChange={(event) =>
                setCampaignFilter(event.target.value)
              }
              aria-label="Filtrer par campagne"
            >
              <option value="ALL">Toutes les campagnes</option>
              {campaigns.map((campaign) => (
                <option key={campaign.id} value={String(campaign.id)}>
                  {campaign.name}
                </option>
              ))}
            </select>
          </label>

          <label className="company-collaborators-filter">
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              aria-label="Filtrer par statut"
            >
              <option value="ALL">Tous les statuts</option>
              {Object.entries(STATUS_LABELS).map(([code, label]) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="company-collaborators-results">
          <span>
            {loading
              ? "Chargement..."
              : `${filteredCollaborators.length} participation(s)`}
          </span>

          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCampaignFilter("ALL");
                setStatusFilter("ALL");
              }}
            >
              Effacer les filtres
            </button>
          )}
        </div>

        {loading ? (
          <div className="company-collaborators-empty">
            <ClipLoader size={30} color="#56319a" />
            <p>Chargement des collaborateurs...</p>
          </div>
        ) : filteredCollaborators.length === 0 ? (
          <div className="company-collaborators-empty">
            <FiUsers size={35} />
            <h3>
              {hasFilters
                ? "Aucun résultat"
                : "Aucun collaborateur pour le moment"}
            </h3>
            <p>
              {hasFilters
                ? "Modifiez vos critères de recherche."
                : "Ajoutez des collaborateurs à une campagne pour les retrouver ici."}
            </p>
            {!hasFilters && (
              <button
                type="button"
                onClick={() => navigate("/dashboard/campagnes")}
              >
                Voir les campagnes
                <FiArrowRight />
              </button>
            )}
          </div>
        ) : (
          <div className="company-collaborators-list">
            {/* TABLEAU DESKTOP */}
            <div className="company-collaborators-table-wrap">
              <table className="company-collaborators-table">
                <thead>
                  <tr>
                    <th>Collaborateur</th>
                    <th>Campagne</th>
                    <th>Statut</th>
                    <th>Invitation</th>
                    <th>Photos</th>
                    <th>Galerie</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCollaborators.map((participant) => (
                    <tr key={participant.recordKey}>
                      <td>
                        <div className="company-collaborators-person">
                          <div className="company-collaborators-avatar">
                            {participant.firstName
                              ?.charAt(0)
                              ?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <strong>{getFullName(participant)}</strong>
                            <span>{participant.email}</span>
                            {participant.jobTitle && (
                              <small>
                                <FiBriefcase />
                                {participant.jobTitle}
                              </small>
                            )}
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="company-collaborators-campaign">
                          {participant.campaignName}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`company-collaborators-status ${getStatusClass(
                            participant.status
                          )}`}
                        >
                          {getStatusLabel(participant.status)}
                        </span>
                      </td>

                      <td>
                        <div className="company-collaborators-invitation">
                          <span>
                            {getInvitationLabel(
                              participant.invitationStatus
                            )}
                          </span>
                          <small>
                            {formatDate(participant.invitationSentAt) || "—"}
                          </small>
                        </div>
                      </td>

                      <td>
                        <strong>{participant.photoCount || 0}</strong>
                      </td>

                      <td>
                        {participant.galleryId ? (
                          <span className="company-collaborators-gallery-ready">
                            <FiCheckCircle />
                            Disponible
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td>
                        <div className="company-collaborators-actions">
                          <button
                            type="button"
                            onClick={() => openCampaign(participant)}
                            title="Voir la campagne"
                          >
                            <FiArrowRight />
                            Voir
                          </button>

                          {participant.invitationId &&
                            !["COMPLETED", "CANCELLED"].includes(
                              participant.campaignStatus
                            ) && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleResendInvitation(participant)
                                }
                                disabled={Boolean(resendingId)}
                                title="Renvoyer l'invitation"
                              >
                                {resendingId === participant.recordKey ? (
                                  <ClipLoader size={13} color="#56319a" />
                                ) : (
                                  <FiSend />
                                )}
                                Relancer
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* CARTES MOBILE */}
            <div className="company-collaborators-mobile-list">
              {filteredCollaborators.map((participant) => (
                <article
                  key={participant.recordKey}
                  className="company-collaborators-mobile-card"
                >
                  <div className="company-collaborators-person">
                    <div className="company-collaborators-avatar">
                      {participant.firstName
                        ?.charAt(0)
                        ?.toUpperCase() || "?"}
                    </div>

                    <div>
                      <strong>{getFullName(participant)}</strong>
                      <span>{participant.email}</span>
                      {participant.jobTitle && (
                        <small>{participant.jobTitle}</small>
                      )}
                    </div>
                  </div>

                  <div className="company-collaborators-mobile-meta">
                    <div>
                      <span>Campagne</span>
                      <strong>{participant.campaignName}</strong>
                    </div>
                    <div>
                      <span>Statut</span>
                      <span
                        className={`company-collaborators-status ${getStatusClass(
                          participant.status
                        )}`}
                      >
                        {getStatusLabel(participant.status)}
                      </span>
                    </div>
                    <div>
                      <span>Invitation</span>
                      <strong>
                        {getInvitationLabel(
                          participant.invitationStatus
                        )}
                      </strong>
                    </div>
                    <div>
                      <span>Photos</span>
                      <strong>{participant.photoCount || 0}</strong>
                    </div>
                  </div>

                  <div className="company-collaborators-mobile-actions">
                    <button
                      type="button"
                      onClick={() => openCampaign(participant)}
                    >
                      <FiArrowRight />
                      Voir la campagne
                    </button>

                    {participant.invitationId &&
                      !["COMPLETED", "CANCELLED"].includes(
                        participant.campaignStatus
                      ) && (
                        <button
                          type="button"
                          onClick={() =>
                            handleResendInvitation(participant)
                          }
                          disabled={Boolean(resendingId)}
                        >
                          {resendingId === participant.recordKey ? (
                            <ClipLoader size={13} color="#56319a" />
                          ) : (
                            <FiSend />
                          )}
                          Relancer
                        </button>
                      )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default CollaboratorsPage;
