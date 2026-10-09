import { useEffect, useMemo, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import "./AdminCampaignDetailsPage.css";
import api from "../../../services/api";

const PARTICIPANT_STATUS_LABELS = {
  INVITED: "Invité",
  CONSENT_PENDING: "Consentement",
  PHOTOS_PENDING: "Photos attendues",
  PHOTOS_RECEIVED: "Photos reçues",
  GENERATION_PENDING: "Génération à lancer",
  GENERATION_IN_PROGRESS: "Génération",
  QA_PENDING: "QA en attente",
  GALLERY_READY: "Galerie prête",
  VALIDATED: "Validé",
  REVISION_REQUESTED: "Reprise demandée",
  DELIVERED: "Livré",
};

const CAMPAIGN_STATUS_LABELS = {
  DRAFT: "Brouillon",
  READY: "Prête",
  IN_PROGRESS: "En cours",
  QA: "QA",
  DELIVERY_READY: "Prête à livrer",
  COMPLETED: "Terminée",
  CANCELLED: "Annulée",
};

const formatDate = (value) => {
  if (!value) return "—";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
};

function AdminCampaignDetailsPage() {
  const { campaignId } = useParams();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState(null);
  const [participants, setParticipants] =
    useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadCampaign = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/admin/campaigns/${campaignId}`
        );

        if (!mounted) return;

        setCampaign(
          response.data?.data?.campaign || null
        );

        setParticipants(
          response.data?.data?.participants || []
        );
      } catch (err) {
        console.error(
          "Erreur détail campagne admin :",
          err
        );

        if (!mounted) return;

        setError(
          err.response?.data?.message ||
            "Impossible de charger cette campagne."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadCampaign();

    return () => {
      mounted = false;
    };
  }, [campaignId]);

  const filteredParticipants = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return participants;
    }

    return participants.filter((participant) => {
      const fullName =
        `${participant.firstName || ""} ${
          participant.lastName || ""
        }`.toLowerCase();

      return (
        fullName.includes(normalizedSearch) ||
        participant.email
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        participant.status
          ?.toLowerCase()
          .includes(normalizedSearch)
      );
    });
  }, [participants, search]);

  const statistics = useMemo(() => {
    const photosReceived = participants.filter(
      (participant) =>
        Number(participant.photoCount || 0) > 0
    ).length;

    const waitingGeneration = participants.filter(
      (participant) =>
        participant.status === "PHOTOS_RECEIVED"
    ).length;

    const inQA = participants.filter(
      (participant) =>
        participant.status === "QA_PENDING"
    ).length;

    return {
      photosReceived,
      waitingGeneration,
      inQA,
    };
  }, [participants]);

  if (loading) {
    return (
      <div className="admin-campaign-detail-page">
        <div className="admin-detail-loading">
          <div className="admin-detail-spinner" />

          <div>
            <strong>Chargement de la campagne</strong>
            <p>Récupération des participants...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="admin-campaign-detail-page">
        <button
          type="button"
          className="admin-detail-back"
          onClick={() =>
            navigate("/admin/campagnes")
          }
        >
          ← Retour aux campagnes
        </button>

        <div className="admin-detail-error">
          <strong>Campagne indisponible</strong>
          <p>
            {error || "Campagne introuvable."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-campaign-detail-page">
      <button
        type="button"
        className="admin-detail-back"
        onClick={() =>
          navigate("/admin/campagnes")
        }
      >
        ← Retour aux campagnes
      </button>

      <section className="admin-detail-hero">
        <div className="admin-detail-hero-main">
          <div className="admin-detail-company-line">
            <span className="admin-detail-company-avatar">
              {campaign.companyName
                ?.charAt(0)
                ?.toUpperCase() || "P"}
            </span>

            <div>
              <span>Entreprise</span>
              <strong>
                {campaign.companyName}
              </strong>
            </div>
          </div>

          <div className="admin-detail-title-row">
            <div>
              <span className="admin-detail-eyebrow">
                CAMPAGNE
              </span>

              <h1>{campaign.name}</h1>

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
              ] || campaign.status}
            </span>
          </div>
        </div>

        <div className="admin-detail-information-grid">
          <div>
            <span>Style portrait</span>
            <strong>
              {campaign.styleName || "Non défini"}
            </strong>
          </div>

          <div>
            <span>Deadline</span>
            <strong>
              {formatDate(campaign.deadlineAt)}
            </strong>
          </div>

          <div>
            <span>Création</span>
            <strong>
              {formatDate(campaign.createdAt)}
            </strong>
          </div>
        </div>
      </section>

      <section className="admin-detail-stats">
        <article>
          <span>Participants</span>
          <strong>{participants.length}</strong>
        </article>

        <article>
          <span>Avec photos</span>
          <strong>
            {statistics.photosReceived}
          </strong>
        </article>

        <article>
          <span>À générer</span>
          <strong>
            {statistics.waitingGeneration}
          </strong>
        </article>

        <article>
          <span>En QA</span>
          <strong>{statistics.inQA}</strong>
        </article>
      </section>

      <section className="admin-detail-participants">
        <div className="admin-detail-section-header">
          <div>
            <span>PARTICIPANTS</span>
            <h2>Suivi des collaborateurs</h2>
            <p>
              Consultez les statuts et les photos
              reçues pour chaque participant.
            </p>
          </div>

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
              placeholder="Rechercher..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>
        </div>

        <div className="admin-participant-table-wrap">
          <table className="admin-participant-table">
            <thead>
              <tr>
                <th>Participant</th>
                <th>Email</th>
                <th>Statut</th>
                <th>Photos</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {filteredParticipants.map(
                (participant) => (
                  <tr key={participant.id}>
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
                            {participant.firstName}{" "}
                            {participant.lastName}
                          </strong>

                          <span>
                            {participant.jobTitle ||
                              "Collaborateur"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="admin-email-cell">
                      {participant.email}
                    </td>

                    <td>
                      <span
                        className={`admin-participant-status status-${participant.status?.toLowerCase()}`}
                      >
                        {PARTICIPANT_STATUS_LABELS[
                          participant.status
                        ] || participant.status}
                      </span>
                    </td>

                    <td>
                      <div className="admin-photo-count-cell">
                        <strong>
                          {participant.photoCount || 0}
                        </strong>
                        <span>/ 12</span>
                      </div>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="admin-open-participant"
                        onClick={() =>
                          navigate(
                            `/admin/participants/${participant.id}`
                          )
                        }
                      >
                        Ouvrir
                        <span>→</span>
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>

          {filteredParticipants.length === 0 && (
            <div className="admin-participant-empty">
              <strong>
                Aucun participant trouvé
              </strong>
              <p>
                Aucun participant ne correspond à
                votre recherche.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default AdminCampaignDetailsPage;