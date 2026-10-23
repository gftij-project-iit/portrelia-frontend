
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  FiArrowLeft,
  FiUsers,
  FiImage,
  FiCheckCircle,
  FiGrid,
  FiCalendar,
  FiClock,
  FiEdit2,
  FiPlus,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiMail,
  FiAlertTriangle,
  FiX,
  FiTrash2,
  FiUser,
  FiSend,
  FiChevronDown,
  FiActivity,
  FiBriefcase,
} from "react-icons/fi";

import { ClipLoader } from "react-spinners";
import api from "../../../services/api";
import "./CampaignDetailPage.css";

/*
 * =========================================================
 * GESTION DES DATES - HEURE DE PARIS
 * =========================================================
 */

function getParisDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value])
  );

  return `${values.year}-${values.month}-${values.day}`;
}

function getTomorrowParis() {
  const today = getParisDate();

  const tomorrow = new Date(
    `${today}T12:00:00Z`
  );

  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

  return tomorrow.toISOString().slice(0, 10);
}

function toParisDateInputValue(value) {
  if (!value) return "";

  // Date simple reçue de l'API.
  if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return value;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return getParisDate(date);
}

function isValidFutureDate(value) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false;
  }

  const date = new Date(`${value}T12:00:00Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value &&
    value >= getTomorrowParis()
  );
}

const DATE_ERROR =
  "La date limite de participation est dépassée. Prolongez la campagne pour ajouter des collaborateurs ou relancer des invitations.";

function CampaignDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [campaignData, setCampaignData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [search, setSearch] = useState("");
  const [participantFilter, setParticipantFilter] =
    useState("ALL");
  const [filterOpen, setFilterOpen] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [addParticipantsOpen, setAddParticipantsOpen] =
    useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [resendingInvitationId, setResendingInvitationId] =
    useState(null);

  // Actualisation périodique pour détecter
  // le changement de jour sans rechargement.
  const [currentTime, setCurrentTime] = useState(
    () => Date.now()
  );

  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    deadline: "",
    targetDelay: "72",
    portraitStyle: "MODERN_OFFICE",
  });

  const [newParticipants, setNewParticipants] = useState([
    {
      id: 1,
      firstName: "",
      lastName: "",
      email: "",
      jobTitle: "",
    },
  ]);

  /*
   * =========================================================
   * HORLOGE
   * =========================================================
   */

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  /*
   * =========================================================
   * CHARGEMENT CAMPAGNE
   * =========================================================
   */

  useEffect(() => {
    const controller = new AbortController();

    

    api
      .get(`/company/campaigns/${id}`, {
        signal: controller.signal,
      })
      .then((response) => {
        setCampaignData(response.data?.data || null);
        setError("");
      })
      .catch((requestError) => {
        if (
          requestError.code === "ERR_CANCELED" ||
          requestError.name === "CanceledError"
        ) {
          return;
        }

        console.error(
          "Erreur chargement campagne :",
          requestError
        );

        setError(
          requestError.response?.data?.message ||
            "Impossible de charger la campagne."
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [id]);

  const reloadCampaign = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/company/campaigns/${id}`
      );

      setCampaignData(response.data?.data || null);
    } catch (requestError) {
      console.error(
        "Erreur rechargement campagne :",
        requestError
      );

      setError(
        requestError.response?.data?.message ||
          "Impossible de charger la campagne."
      );
    } finally {
      setLoading(false);
    }
  };

  const campaign = campaignData?.campaign || null;

  const stats = campaignData?.stats || {
    participants: 0,
    photosReceived: 0,
    galleriesReady: 0,
    validated: 0,
    delivered: 0,
    progress: 0,
  };

  const attention = campaignData?.attention || {
    withoutPhotos: 0,
    invitationsNotOpened: 0,
    expiredInvitations: 0,
    revisionRequested: 0,
    photosToRedo: 0,
  };

  const participants = campaignData?.participants || [];
  const activity = campaignData?.activity || [];

  /*
   * =========================================================
   * CONTRÔLE D'EXPIRATION
   * =========================================================
   *
   * Une campagne est ouverte toute la journée
   * de sa date limite, jusqu'à 23h59 à Paris.
   *
   * Si deadline_at contient un horodatage précis
   * en fin de journée, on utilise cet instant.
   *
   * Le backend reste l'autorité définitive.
   */

  const isFinalCampaign =
    campaign?.status === "COMPLETED" ||
    campaign?.status === "CANCELLED";

  const deadlineDate = toParisDateInputValue(
    campaign?.deadlineAt
  );

  const todayParis = getParisDate(
    new Date(currentTime)
  );

  const isCampaignExpired =
    !deadlineDate || deadlineDate < todayParis;

  const canSendInvitations =
    Boolean(campaign) &&
    !isFinalCampaign &&
    !isCampaignExpired;

  const cannotInviteReason = isFinalCampaign
    ? "Cette campagne est terminée ou annulée."
    : DATE_ERROR;

  const validateInvitationAction = () => {
    const deadline = toParisDateInputValue(
      campaign?.deadlineAt
    );

    if (
      !campaign ||
      campaign.status === "COMPLETED" ||
      campaign.status === "CANCELLED"
    ) {
      setError(
        "Cette campagne n'accepte plus de nouvelles invitations."
      );
      return false;
    }

    if (
      !deadline ||
      deadline < getParisDate()
    ) {
      setError(DATE_ERROR);
      setAddParticipantsOpen(false);
      return false;
    }

    return true;
  };

  /*
   * =========================================================
   * FILTRES
   * =========================================================
   */

  const filteredParticipants = useMemo(() => {
    return participants.filter((participant) => {
      const query = search.trim().toLowerCase();

      const fullName =
        `${participant.firstName || ""} ${participant.lastName || ""}`
          .trim()
          .toLowerCase();

      const email = String(
        participant.email || ""
      ).toLowerCase();

      const matchesSearch =
        !query ||
        fullName.includes(query) ||
        email.includes(query);

      const matchesFilter =
        participantFilter === "ALL" ||
        participant.status === participantFilter;

      return matchesSearch && matchesFilter;
    });
  }, [participants, search, participantFilter]);

  /*
   * =========================================================
   * STATUTS
   * =========================================================
   */

  const getCampaignStatusLabel = (status) => {
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

  const getCampaignStatusClass = (status) => {
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
        return "delivery";
      case "COMPLETED":
        return "completed";
      case "CANCELLED":
        return "cancelled";
      default:
        return "draft";
    }
  };

  const getParticipantStatusLabel = (status) => {
    switch (status) {
      case "INVITED":
        return "Invité";
      case "CONSENT_PENDING":
        return "Consentement";
      case "PHOTOS_PENDING":
        return "Photos attendues";
      case "PHOTOS_RECEIVED":
        return "Photos reçues";
      case "GENERATION_PENDING":
        return "En attente";
      case "GENERATION_IN_PROGRESS":
        return "Génération";
      case "QA_PENDING":
        return "En QA";
      case "GALLERY_READY":
        return "Galerie prête";
      case "VALIDATED":
        return "Validé";
      case "REVISION_REQUESTED":
        return "Reprise demandée";
      case "DELIVERED":
        return "Livré";
      default:
        return status || "-";
    }
  };

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

  /*
   * =========================================================
   * FORMATAGE
   * =========================================================
   */

  const formatDate = (date) => {
    if (!date) return "Non définie";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Non définie";
    }

    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "Europe/Paris",
    }).format(parsedDate);
  };

  const formatDateTime = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Paris",
    }).format(parsedDate);
  };

  const getPortraitStyleValue = (slug) => {
    switch (slug) {
      case "moderne":
        return "MODERN_OFFICE";
      case "studio-neutre":
        return "LIGHT_STUDIO";
      case "executive":
        return "EXECUTIVE";
      case "corporate-clair":
        return "LINKEDIN";
      default:
        return "MODERN_OFFICE";
    }
  };

  /*
   * =========================================================
   * MODIFICATION CAMPAGNE
   * =========================================================
   */

  const openEditModal = () => {
    if (!campaign) return;

    setEditForm({
      name: campaign.name || "",
      description: campaign.description || "",
      deadline: toParisDateInputValue(
        campaign.deadlineAt
      ),
      targetDelay: String(
        campaign.targetDelayHours || 72
      ),
      portraitStyle: getPortraitStyleValue(
        campaign.style?.slug
      ),
    });

    setError("");
    setSuccessMessage("");
    setEditOpen(true);
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const updateCampaign = async (event) => {
    event.preventDefault();

    if (saving) return;

    if (!isValidFutureDate(editForm.deadline)) {
      setError(
        "La nouvelle date limite doit être à partir de demain."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      await api.patch(
        `/company/campaigns/${id}`,
        {
          name: editForm.name.trim(),
          description:
            editForm.description.trim() || null,
          deadline: editForm.deadline,
          targetDelay: Number(editForm.targetDelay),
          portraitStyle: editForm.portraitStyle,
        }
      );

      setEditOpen(false);

      // Recharge la campagne pour recalculer
      // l'état des invitations après prolongation.
      await reloadCampaign();

      setSuccessMessage(
        "Campagne modifiée avec succès."
      );
    } catch (requestError) {
      console.error(
        "Erreur modification campagne :",
        requestError
      );

      setError(
        requestError.response?.data?.message ||
          "Impossible de modifier la campagne."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * =========================================================
   * AJOUT COLLABORATEURS
   * =========================================================
   */

  const openAddParticipants = () => {
    if (!validateInvitationAction()) return;

    setError("");
    setAddParticipantsOpen(true);
  };

  const addParticipantRow = () => {
    setNewParticipants((previous) => [
      ...previous,
      {
        id: Date.now() + Math.random(),
        firstName: "",
        lastName: "",
        email: "",
        jobTitle: "",
      },
    ]);
  };

  const removeParticipantRow = (participantId) => {
    if (newParticipants.length === 1) return;

    setNewParticipants((previous) =>
      previous.filter(
        (participant) =>
          participant.id !== participantId
      )
    );
  };

  const handleNewParticipantChange = (
    participantId,
    event
  ) => {
    const { name, value } = event.target;

    setNewParticipants((previous) =>
      previous.map((participant) =>
        participant.id === participantId
          ? {
              ...participant,
              [name]: value,
            }
          : participant
      )
    );
  };

  const resetNewParticipants = () => {
    setNewParticipants([
      {
        id: 1,
        firstName: "",
        lastName: "",
        email: "",
        jobTitle: "",
      },
    ]);
  };

  const submitParticipants = async (event) => {
    event.preventDefault();

    if (saving) return;

    // Ne jamais envoyer une invitation
    // si la campagne a déjà expiré.
    if (!validateInvitationAction()) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      const payload = {
        participants: newParticipants.map(
          (participant) => ({
            firstName: participant.firstName.trim(),
            lastName: participant.lastName.trim(),
            email: participant.email
              .trim()
              .toLowerCase(),
            jobTitle:
              participant.jobTitle.trim() || null,
          })
        ),
      };

      await api.post(
        `/company/campaigns/${id}/participants`,
        payload
      );

      resetNewParticipants();
      setAddParticipantsOpen(false);

      await reloadCampaign();

      setSuccessMessage(
        "Collaborateurs ajoutés et invitations préparées."
      );
    } catch (requestError) {
      console.error(
        "Erreur ajout collaborateurs :",
        requestError
      );

      setError(
        requestError.response?.data?.message ||
          "Impossible d'ajouter les collaborateurs."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * =========================================================
   * RELANCE INVITATIONS
   * =========================================================
   */

  const canResendParticipant = (participant) => {
    return (
      canSendInvitations &&
      Boolean(participant.invitationId) &&
      !["REVOKED", "EXPIRED"].includes(
        participant.invitationStatus
      )
    );
  };

  const resendInvitation = async (participant) => {
    const invitationId = participant?.invitationId;

    if (!invitationId || resendingInvitationId) {
      return;
    }

    if (!validateInvitationAction()) {
      return;
    }

    if (
      ["REVOKED", "EXPIRED"].includes(
        participant.invitationStatus
      )
    ) {
      setError(
        "Cette invitation est expirée ou révoquée. Une nouvelle invitation valide doit être créée avant toute relance."
      );
      return;
    }

    try {
      setResendingInvitationId(invitationId);
      setError("");
      setSuccessMessage("");

      await api.post(
        `/company/campaigns/${id}/invitations/${invitationId}/resend`
      );

      await reloadCampaign();

      setSuccessMessage(
        "Invitation renvoyée avec succès."
      );
    } catch (requestError) {
      console.error(
        "Erreur renvoi invitation :",
        requestError
      );

      setError(
        requestError.response?.data?.message ||
          "Impossible de renvoyer l'invitation."
      );
    } finally {
      setResendingInvitationId(null);
    }
  };

  /*
   * =========================================================
   * ANNULATION
   * =========================================================
   */

  const cancelCampaign = async () => {
    if (cancelling) return;

    try {
      setCancelling(true);
      setError("");
      setSuccessMessage("");

      await api.post(
        `/company/campaigns/${id}/cancel`
      );

      setCancelOpen(false);

      await reloadCampaign();

      setSuccessMessage(
        "La campagne a été annulée."
      );
    } catch (requestError) {
      console.error(
        "Erreur annulation campagne :",
        requestError
      );

      setError(
        requestError.response?.data?.message ||
          "Impossible d'annuler la campagne."
      );
    } finally {
      setCancelling(false);
    }
  };

  /*
   * =========================================================
   * CHARGEMENT
   * =========================================================
   */

  if (loading) {
    return (
      <div className="campaign-detail-loading">
        <ClipLoader size={30} color="#4f2e94" />
        <span>Chargement de la campagne...</span>
      </div>
    );
  }

  if (error && !campaignData) {
    return (
      <div className="campaign-detail-error-page">
        <FiAlertTriangle />

        <h2>Campagne indisponible</h2>
        <p>{error}</p>

        <div>
          <button
            type="button"
            onClick={() =>
              navigate("/dashboard/campagnes")
            }
          >
            <FiArrowLeft />
            Retour
          </button>

          <button
            type="button"
            onClick={reloadCampaign}
          >
            <FiRefreshCw />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!campaign) return null;

  const attentionTotal =
    Number(attention.withoutPhotos || 0) +
    Number(attention.invitationsNotOpened || 0) +
    Number(attention.expiredInvitations || 0) +
    Number(attention.revisionRequested || 0) +
    Number(attention.photosToRedo || 0);

  /*
   * =========================================================
   * INTERFACE
   * =========================================================
   */

  return (
    <div className="campaign-detail-page">

      {/* RETOUR */}
      <button
        type="button"
        className="campaign-detail-back"
        onClick={() =>
          navigate("/dashboard/campagnes")
        }
      >
        <FiArrowLeft />
        Toutes les campagnes
      </button>

      {/* MESSAGES */}
      {error && (
        <div
          className="campaign-detail-message campaign-detail-message-error"
          role="alert"
        >
          <FiAlertTriangle />
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Fermer le message"
          >
            <FiX />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="campaign-detail-message campaign-detail-message-success">
          <FiCheckCircle />
          <span>{successMessage}</span>

          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            aria-label="Fermer le message"
          >
            <FiX />
          </button>
        </div>
      )}

      {/* HEADER */}
      <section className="campaign-detail-header">
        <div className="campaign-detail-header-main">
          <span
            className={`campaign-detail-status campaign-detail-status-${getCampaignStatusClass(
              campaign.status
            )}`}
          >
            {getCampaignStatusLabel(campaign.status)}
          </span>

          <h1>{campaign.name}</h1>

          <p>
            {campaign.description ||
              "Aucune description renseignée pour cette campagne."}
          </p>
        </div>

        <div className="campaign-detail-header-actions">
          {!isFinalCampaign && (
            <>
              <button
                type="button"
                className="campaign-detail-secondary-btn"
                onClick={openEditModal}
              >
                <FiEdit2 />
                Modifier
              </button>

              <button
                type="button"
                className="campaign-detail-primary-btn"
                onClick={openAddParticipants}
                disabled={!canSendInvitations}
                title={
                  canSendInvitations
                    ? "Ajouter des collaborateurs"
                    : cannotInviteReason
                }
              >
                <FiPlus />
                Ajouter
              </button>
            </>
          )}
        </div>
      </section>

      {/* AVERTISSEMENT EXPIRATION */}
      {isCampaignExpired && !isFinalCampaign && (
        <div
          className="campaign-detail-message campaign-detail-message-error"
          role="status"
        >
          <FiAlertTriangle />

          <span>
            La date limite de participation est dépassée.
            Vous ne pouvez plus ajouter de collaborateurs
            ni relancer les invitations.
            Cliquez sur « Modifier » pour prolonger la campagne.
          </span>
        </div>
      )}

      {/* INFORMATIONS */}
      <section className="campaign-detail-meta">
        <div>
          <FiCalendar />
          <span>Date limite</span>
          <strong>
            {formatDate(campaign.deadlineAt)}
          </strong>
        </div>

        <div>
          <FiClock />
          <span>Délai souhaité</span>
          <strong>
            {campaign.targetDelayHours
              ? campaign.targetDelayHours === 120
                ? "5 jours ouvrés"
                : `${campaign.targetDelayHours} h`
              : "Non défini"}
          </strong>
        </div>

        <div>
          <FiImage />
          <span>Style</span>
          <strong>
            {campaign.style?.name || "Non défini"}
          </strong>
        </div>

        <div>
          <FiCalendar />
          <span>Créée le</span>
          <strong>
            {formatDate(campaign.createdAt)}
          </strong>
        </div>
      </section>

      {/* KPI */}
      <section className="campaign-detail-kpis">
        <div className="campaign-detail-kpi">
          <div className="campaign-detail-kpi-icon">
            <FiUsers />
          </div>
          <div>
            <span>Participants</span>
            <strong>{stats.participants || 0}</strong>
          </div>
        </div>

        <div className="campaign-detail-kpi">
          <div className="campaign-detail-kpi-icon">
            <FiImage />
          </div>
          <div>
            <span>Photos reçues</span>
            <strong>
              {stats.photosReceived || 0}
            </strong>
          </div>
        </div>

        <div className="campaign-detail-kpi">
          <div className="campaign-detail-kpi-icon">
            <FiGrid />
          </div>
          <div>
            <span>Galeries prêtes</span>
            <strong>
              {stats.galleriesReady || 0}
            </strong>
          </div>
        </div>

        <div className="campaign-detail-kpi">
          <div className="campaign-detail-kpi-icon">
            <FiCheckCircle />
          </div>
          <div>
            <span>Validés</span>
            <strong>{stats.validated || 0}</strong>
          </div>
        </div>
      </section>

      {/* PROGRESSION + ATTENTION */}
      <section className="campaign-detail-overview-grid">
        <div className="campaign-detail-card">
          <div className="campaign-detail-card-header">
            <div>
              <h2>Progression de la campagne</h2>
              <p>
                Avancement global des portraits validés.
              </p>
            </div>

            <strong className="campaign-detail-progress-percent">
              {stats.progress || 0} %
            </strong>
          </div>

          <div className="campaign-detail-progress-track">
            <div
              className="campaign-detail-progress-fill"
              style={{
                width: `${Math.min(
                  100,
                  Math.max(
                    0,
                    Number(stats.progress || 0)
                  )
                )}%`,
              }}
            />
          </div>

          <div className="campaign-detail-progress-stats">
            <span>
              {stats.validated || 0}
              {" / "}
              {stats.participants || 0}
              {" "}portraits validés
            </span>

            <span>
              {stats.delivered || 0}
              {" "}livrés
            </span>
          </div>
        </div>

        <div className="campaign-detail-card">
          <div className="campaign-detail-card-header">
            <div>
              <h2>Points d’attention</h2>
              <p>
                Éléments nécessitant une action.
              </p>
            </div>

            {attentionTotal > 0 && (
              <span className="campaign-detail-attention-count">
                {attentionTotal}
              </span>
            )}
          </div>

          <div className="campaign-detail-attention-list">
            <div>
              <span>Sans photo</span>
              <strong>
                {attention.withoutPhotos || 0}
              </strong>
            </div>

            <div>
              <span>Invitations non ouvertes</span>
              <strong>
                {attention.invitationsNotOpened || 0}
              </strong>
            </div>

            <div>
              <span>Invitations expirées</span>
              <strong>
                {attention.expiredInvitations || 0}
              </strong>
            </div>

            <div>
              <span>Photos à refaire</span>
              <strong>
                {attention.photosToRedo || 0}
              </strong>
            </div>

            <div>
              <span>Reprises demandées</span>
              <strong>
                {attention.revisionRequested || 0}
              </strong>
            </div>
          </div>
        </div>
      </section>

      {/* COLLABORATEURS */}
      <section className="campaign-detail-card">
        <div className="campaign-detail-participants-header">
          <div>
            <h2>Collaborateurs</h2>

            <p>
              Suivez les invitations et l’avancement
              de chaque participant.
            </p>
          </div>

          {!isFinalCampaign && (
            <button
              type="button"
              className="campaign-detail-primary-btn"
              onClick={openAddParticipants}
              disabled={!canSendInvitations}
              title={
                canSendInvitations
                  ? "Ajouter un collaborateur"
                  : cannotInviteReason
              }
            >
              <FiPlus />
              Ajouter un collaborateur
            </button>
          )}
        </div>

        {/* RECHERCHE + FILTRE */}
        <div className="campaign-detail-toolbar">
          <div className="campaign-detail-search">
            <FiSearch />

            <input
              type="text"
              placeholder="Rechercher un collaborateur..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          <div className="campaign-detail-filter-wrapper">
            <button
              type="button"
              className="campaign-detail-filter-btn"
              onClick={() =>
                setFilterOpen((previous) => !previous)
              }
            >
              <FiFilter />
              Filtrer
              <FiChevronDown />
            </button>

            {filterOpen && (
              <div className="campaign-detail-filter-menu">
                {[
                  ["ALL", "Tous"],
                  ["INVITED", "Invités"],
                  ["PHOTOS_RECEIVED", "Photos reçues"],
                  ["GALLERY_READY", "Galerie prête"],
                  ["VALIDATED", "Validés"],
                ].map(([value, label]) => (
                  <button
                    type="button"
                    key={value}
                    onClick={() => {
                      setParticipantFilter(value);
                      setFilterOpen(false);
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="campaign-detail-participants-count">
          {filteredParticipants.length}
          {" "}
          {filteredParticipants.length > 1
            ? "collaborateurs"
            : "collaborateur"}
        </div>

        {/* TABLE DESKTOP */}
        <div className="campaign-detail-table-wrapper">
          <table className="campaign-detail-table">
            <thead>
              <tr>
                <th>Collaborateur</th>
                <th>Statut</th>
                <th>Invitation</th>
                <th>Photos</th>
                <th>Galerie</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredParticipants.map((participant) => (
                <tr key={participant.id}>
                  <td>
                    <div className="campaign-detail-person">
                      <div className="campaign-detail-person-avatar">
                        {participant.firstName
                          ?.charAt(0)
                          ?.toUpperCase() || "?"}
                      </div>

                      <div>
                        <strong>
                          {participant.firstName}
                          {" "}
                          {participant.lastName}
                        </strong>

                        <span>
                          {participant.email}
                        </span>

                        {participant.jobTitle && (
                          <small>
                            {participant.jobTitle}
                          </small>
                        )}
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="campaign-detail-participant-status">
                      {getParticipantStatusLabel(
                        participant.status
                      )}
                    </span>
                  </td>

                  <td>
                    <div className="campaign-detail-invitation-cell">
                      <span>
                        {getInvitationLabel(
                          participant.invitationStatus
                        )}
                      </span>

                      {participant.invitationSentAt && (
                        <small>
                          {formatDateTime(
                            participant.invitationSentAt
                          )}
                        </small>
                      )}
                    </div>
                  </td>

                  <td>
                    <strong>
                      {participant.photoCount || 0}
                    </strong>
                  </td>

                  <td>
                    {participant.galleryId ? (
                      <span className="campaign-detail-ready-badge">
                        Prête
                      </span>
                    ) : (
                      <span className="campaign-detail-muted">
                        —
                      </span>
                    )}
                  </td>

                  <td>
                    {!isFinalCampaign &&
                    participant.invitationId ? (
                      <button
                        type="button"
                        className="campaign-detail-resend-btn"
                        onClick={() =>
                          resendInvitation(participant)
                        }
                        disabled={
                          !canResendParticipant(participant) ||
                          Boolean(resendingInvitationId)
                        }
                        title={
                          isCampaignExpired
                            ? DATE_ERROR
                            : !canResendParticipant(participant)
                            ? "Cette invitation ne peut pas être relancée."
                            : "Renvoyer l'invitation"
                        }
                      >
                        {resendingInvitationId ===
                        participant.invitationId ? (
                          <ClipLoader
                            size={13}
                            color="#4f2e94"
                          />
                        ) : (
                          <FiSend />
                        )}

                        Relancer
                      </button>
                    ) : (
                      <span className="campaign-detail-muted">
                        —
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CARTES MOBILE */}
        <div className="campaign-detail-mobile-participants">
          {filteredParticipants.map((participant) => (
            <article
              key={participant.id}
              className="campaign-detail-mobile-person"
            >
              <div className="campaign-detail-person">
                <div className="campaign-detail-person-avatar">
                  {participant.firstName
                    ?.charAt(0)
                    ?.toUpperCase() || "?"}
                </div>

                <div>
                  <strong>
                    {participant.firstName}
                    {" "}
                    {participant.lastName}
                  </strong>

                  <span>{participant.email}</span>
                </div>
              </div>

              <div className="campaign-detail-mobile-person-info">
                <div>
                  <span>Statut</span>

                  <strong>
                    {getParticipantStatusLabel(
                      participant.status
                    )}
                  </strong>
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

                  <strong>
                    {participant.photoCount || 0}
                  </strong>
                </div>
              </div>

              {!isFinalCampaign &&
                participant.invitationId && (
                  <button
                    type="button"
                    className="campaign-detail-resend-btn"
                    onClick={() =>
                      resendInvitation(participant)
                    }
                    disabled={
                      !canResendParticipant(participant) ||
                      Boolean(resendingInvitationId)
                    }
                    title={
                      isCampaignExpired
                        ? DATE_ERROR
                        : "Relancer l'invitation"
                    }
                  >
                    {resendingInvitationId ===
                    participant.invitationId ? (
                      <ClipLoader
                        size={13}
                        color="#4f2e94"
                      />
                    ) : (
                      <FiSend />
                    )}

                    Relancer l'invitation
                  </button>
                )}
            </article>
          ))}
        </div>

        {filteredParticipants.length === 0 && (
          <div className="campaign-detail-empty">
            <FiUsers />

            <strong>
              Aucun collaborateur trouvé
            </strong>

            <span>
              Modifiez votre recherche ou ajoutez un collaborateur.
            </span>
          </div>
        )}
      </section>

      {/* ACTIVITÉ */}
      <section className="campaign-detail-card">
        <div className="campaign-detail-card-header">
          <div>
            <h2>Activité récente</h2>
            <p>
              Dernières actions liées à cette campagne.
            </p>
          </div>

          <FiActivity />
        </div>

        {activity.length > 0 ? (
          <div className="campaign-detail-activity-list">
            {activity.map((item) => (
              <div
                key={item.id}
                className="campaign-detail-activity-item"
              >
                <div className="campaign-detail-activity-dot" />

                <div>
                  <strong>{item.action}</strong>
                  <span>
                    {formatDateTime(item.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="campaign-detail-activity-empty">
            Aucune activité récente.
          </div>
        )}
      </section>

      {/* ANNULATION */}
      {!isFinalCampaign && (
        <section className="campaign-detail-danger-zone">
          <div>
            <strong>Annuler la campagne</strong>
            <span>
              Les invitations encore actives seront révoquées.
            </span>
          </div>

          <button
            type="button"
            onClick={() => setCancelOpen(true)}
          >
            Annuler la campagne
          </button>
        </section>
      )}

      {/* =====================================================
          MODAL MODIFICATION
          ===================================================== */}
      {editOpen && (
        <div className="campaign-detail-modal-overlay">
          <div className="campaign-detail-modal">
            <div className="campaign-detail-modal-header">
              <div>
                <h2>Modifier la campagne</h2>

                <p>
                  Mettez à jour les paramètres principaux.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditOpen(false)}
                aria-label="Fermer"
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={updateCampaign}>
              <div className="campaign-detail-form-field">
                <label htmlFor="editName">
                  Nom
                </label>

                <input
                  id="editName"
                  name="name"
                  type="text"
                  value={editForm.name}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="campaign-detail-form-field">
                <label htmlFor="editDescription">
                  Description
                </label>

                <textarea
                  id="editDescription"
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  rows="4"
                />
              </div>

              <div className="campaign-detail-form-grid">
                <div className="campaign-detail-form-field">
                  <label htmlFor="editDeadline">
                    Date limite
                  </label>

                  <input
                    id="editDeadline"
                    name="deadline"
                    type="date"
                    min={getTomorrowParis()}
                    value={editForm.deadline}
                    onChange={handleEditChange}
                    required
                  />

                  <small>
                    Nouvelle date à partir de demain.
                  </small>
                </div>

                <div className="campaign-detail-form-field">
                  <label htmlFor="editDelay">
                    Délai souhaité
                  </label>

                  <select
                    id="editDelay"
                    name="targetDelay"
                    value={editForm.targetDelay}
                    onChange={handleEditChange}
                  >
                    <option value="48">
                      48 heures
                    </option>

                    <option value="72">
                      72 heures
                    </option>

                    <option value="120">
                      5 jours ouvrés
                    </option>
                  </select>
                </div>
              </div>

              <div className="campaign-detail-form-field">
                <label htmlFor="editStyle">
                  Style
                </label>

                <select
                  id="editStyle"
                  name="portraitStyle"
                  value={editForm.portraitStyle}
                  onChange={handleEditChange}
                >
                  <option value="MODERN_OFFICE">
                    Bureau moderne
                  </option>

                  <option value="LIGHT_STUDIO">
                    Studio clair
                  </option>

                  <option value="EXECUTIVE">
                    Direction / Executive
                  </option>

                  <option value="LINKEDIN">
                    Corporate LinkedIn
                  </option>
                </select>
              </div>

              <div className="campaign-detail-modal-actions">
                <button
                  type="button"
                  className="campaign-detail-secondary-btn"
                  onClick={() => setEditOpen(false)}
                  disabled={saving}
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="campaign-detail-primary-btn"
                  disabled={
                    saving ||
                    !isValidFutureDate(editForm.deadline)
                  }
                >
                  {saving ? (
                    <>
                      <ClipLoader
                        size={14}
                        color="#ffffff"
                      />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <FiCheckCircle />
                      Enregistrer
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          MODAL AJOUT DE COLLABORATEURS
          ===================================================== */}
      {addParticipantsOpen && canSendInvitations && (
        <div className="campaign-detail-modal-overlay">
          <div className="campaign-detail-modal campaign-detail-modal-large">
            <div className="campaign-detail-modal-header">
              <div>
                <h2>Ajouter des collaborateurs</h2>

                <p>
                  Une invitation sera envoyée sur leur adresse email.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setAddParticipantsOpen(false);
                  resetNewParticipants();
                }}
                aria-label="Fermer"
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={submitParticipants}>
              <div className="campaign-detail-new-participants">
                {newParticipants.map(
                  (participant, index) => (
                    <div
                      key={participant.id}
                      className="campaign-detail-new-participant"
                    >
                      <div className="campaign-detail-new-participant-number">
                        {index + 1}
                      </div>

                      <div className="campaign-detail-new-participant-fields">
                        <div className="campaign-detail-form-field">
                          <label>Prénom</label>

                          <div className="campaign-detail-input-icon">
                            <FiUser />

                            <input
                              type="text"
                              name="firstName"
                              value={participant.firstName}
                              onChange={(event) =>
                                handleNewParticipantChange(
                                  participant.id,
                                  event
                                )
                              }
                              required
                            />
                          </div>
                        </div>

                        <div className="campaign-detail-form-field">
                          <label>Nom</label>

                          <input
                            type="text"
                            name="lastName"
                            value={participant.lastName}
                            onChange={(event) =>
                              handleNewParticipantChange(
                                participant.id,
                                event
                              )
                            }
                            required
                          />
                        </div>

                        <div className="campaign-detail-form-field">
                          <label>Email</label>

                          <div className="campaign-detail-input-icon">
                            <FiMail />

                            <input
                              type="email"
                              name="email"
                              value={participant.email}
                              onChange={(event) =>
                                handleNewParticipantChange(
                                  participant.id,
                                  event
                                )
                              }
                              required
                            />
                          </div>
                        </div>

                        <div className="campaign-detail-form-field">
                          <label>Poste</label>

                          <div className="campaign-detail-input-icon">
                            <FiBriefcase />

                            <input
                              type="text"
                              name="jobTitle"
                              value={participant.jobTitle}
                              onChange={(event) =>
                                handleNewParticipantChange(
                                  participant.id,
                                  event
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="campaign-detail-remove-participant"
                        onClick={() =>
                          removeParticipantRow(
                            participant.id
                          )
                        }
                        disabled={
                          newParticipants.length === 1
                        }
                        aria-label="Supprimer ce collaborateur"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  )
                )}
              </div>

              <button
                type="button"
                className="campaign-detail-add-row"
                onClick={addParticipantRow}
              >
                <FiPlus />
                Ajouter une ligne
              </button>

              <div className="campaign-detail-modal-actions">
                <button
                  type="button"
                  className="campaign-detail-secondary-btn"
                  onClick={() => {
                    setAddParticipantsOpen(false);
                    resetNewParticipants();
                  }}
                  disabled={saving}
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="campaign-detail-primary-btn"
                  disabled={
                    saving ||
                    !canSendInvitations
                  }
                >
                  {saving ? (
                    <>
                      <ClipLoader
                        size={14}
                        color="#ffffff"
                      />
                      Ajout...
                    </>
                  ) : (
                    <>
                      <FiMail />
                      Ajouter et inviter
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          MODAL ANNULATION
          ===================================================== */}
      {cancelOpen && (
        <div className="campaign-detail-modal-overlay">
          <div className="campaign-detail-modal campaign-detail-confirm-modal">
            <div className="campaign-detail-confirm-icon">
              <FiAlertTriangle />
            </div>

            <h2>Annuler cette campagne ?</h2>

            <p>
              Cette action passera la campagne au statut annulé
              et révoquera les invitations encore actives.
            </p>

            <div className="campaign-detail-modal-actions">
              <button
                type="button"
                className="campaign-detail-secondary-btn"
                onClick={() => setCancelOpen(false)}
                disabled={cancelling}
              >
                Retour
              </button>

              <button
                type="button"
                className="campaign-detail-danger-btn"
                onClick={cancelCampaign}
                disabled={cancelling}
              >
                {cancelling ? (
                  <ClipLoader
                    size={14}
                    color="#ffffff"
                  />
                ) : (
                  <FiAlertTriangle />
                )}

                Confirmer l'annulation
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default CampaignDetailPage;
