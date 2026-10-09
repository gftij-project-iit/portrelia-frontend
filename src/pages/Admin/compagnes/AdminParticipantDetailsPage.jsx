import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import "./AdminParticipantDetailsPage.css";
import api from "../../../services/api";

const STATUS_LABELS = {
  INVITED: "Invité",
  CONSENT_PENDING: "Consentement",
  PHOTOS_PENDING: "Photos attendues",
  PHOTOS_RECEIVED: "Photos reçues",
  GENERATION_PENDING: "Génération à lancer",
  GENERATION_IN_PROGRESS: "Génération en cours",
  QA_PENDING: "QA en attente",
  GALLERY_READY: "Galerie prête",
  VALIDATED: "Portrait validé",
  REVISION_REQUESTED: "Reprise demandée",
  DELIVERED: "Livré",
};

const PHOTO_STATUS_LABELS = {
  UPLOADED: "Reçue",
  ACCEPTED: "Acceptée",
  REJECTED: "Rejetée",
};

const STORAGE_PROVIDER_LABELS = {
  SUPABASE: "Supabase Storage",
  LOCAL: "Stockage local",
};

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(date);
};

const formatBytes = (bytes) => {
  const value = Number(bytes);

  if (
    !Number.isFinite(value) ||
    value <= 0
  ) {
    return "—";
  }

  if (value < 1024) {
    return `${value} o`;
  }

  if (value < 1024 * 1024) {
    return `${Math.round(
      value / 1024
    )} Ko`;
  }

  return `${(
    value /
    (1024 * 1024)
  ).toFixed(1)} Mo`;
};

function AdminParticipantDetailsPage() {
  const { participantId } =
    useParams();

  const navigate = useNavigate();

  const [
    participant,
    setParticipant,
  ] = useState(null);

  const [
    photos,
    setPhotos,
  ] = useState([]);

  const [
    photoStats,
    setPhotoStats,
  ] = useState({
    total: 0,
    available: 0,
    accepted: 0,
    rejected: 0,
    minimum: 6,
    maximum: 12,
  });

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    selectedPhoto,
    setSelectedPhoto,
  ] = useState(null);

  /*
   * Permet de masquer proprement
   * une signed URL devenue invalide
   * ou une image qui ne charge pas.
   */
  const [
    brokenPhotos,
    setBrokenPhotos,
  ] = useState(() => new Set());

  /*
   * =========================================================
   * CHARGEMENT PARTICIPANT + PHOTOS
   * =========================================================
   *
   * Une seule API :
   *
   * GET /api/v1/admin/participants/:participantId
   *
   * Le backend génère les signed URLs Supabase.
   */
  useEffect(() => {
    let mounted = true;

    const loadParticipant =
      async () => {
        try {
          setLoading(true);
          setError("");
          setBrokenPhotos(
            new Set()
          );

          const response =
            await api.get(
              `/admin/participants/${participantId}`
            );

          if (!mounted) {
            return;
          }

          const data =
            response.data?.data;

          if (
            !data?.participant
          ) {
            throw new Error(
              "Participant introuvable."
            );
          }

          setParticipant(
            data.participant
          );

          setPhotos(
            Array.isArray(
              data.photos
            )
              ? data.photos
              : []
          );

          setPhotoStats({
            total: Number(
              data.photoCount ||
                0
            ),

            available: Number(
              data.availablePhotoCount ||
                0
            ),

            accepted: Number(
              data.acceptedPhotoCount ||
                0
            ),

            rejected: Number(
              data.rejectedPhotoCount ||
                0
            ),

            minimum: Number(
              data
                .photoRequirements
                ?.minimum || 6
            ),

            maximum: Number(
              data
                .photoRequirements
                ?.maximum || 12
            ),
          });
        } catch (err) {
          console.error(
            "Erreur participant admin :",
            err
          );

          if (!mounted) {
            return;
          }

          setParticipant(null);
          setPhotos([]);

          setError(
            err.response?.data
              ?.message ||
              err.message ||
              "Impossible de charger le participant."
          );
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      };

    loadParticipant();

    return () => {
      mounted = false;
    };
  }, [participantId]);

  /*
   * =========================================================
   * FERMETURE MODALE AVEC ESCAPE
   * =========================================================
   */
  useEffect(() => {
    if (!selectedPhoto) {
      return undefined;
    }

    const handleKeyDown = (
      event
    ) => {
      if (
        event.key ===
        "Escape"
      ) {
        setSelectedPhoto(
          null
        );
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    document.body.style.overflow =
      "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.body.style.overflow =
        "";
    };
  }, [selectedPhoto]);

  /*
   * =========================================================
   * PHOTO CASSÉE
   * =========================================================
   */
  const handlePhotoError = (
    photoId
  ) => {
    setBrokenPhotos(
      (current) => {
        const next =
          new Set(current);

        next.add(photoId);

        return next;
      }
    );

    if (
      selectedPhoto?.id ===
      photoId
    ) {
      setSelectedPhoto(null);
    }
  };

  /*
   * =========================================================
   * LOADING
   * =========================================================
   */
  if (loading) {
    return (
      <div className="admin-participant-detail-page">
        <div className="admin-participant-loading">
          <div className="admin-participant-spinner" />

          <div>
            <strong>
              Chargement du participant
            </strong>

            <p>
              Récupération des
              informations et des
              photos...
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
    !participant
  ) {
    return (
      <div className="admin-participant-detail-page">
        <button
          type="button"
          className="admin-participant-back"
          onClick={() =>
            navigate(
              "/admin/campagnes"
            )
          }
        >
          ← Retour
        </button>

        <div className="admin-participant-error">
          <strong>
            Participant
            indisponible
          </strong>

          <p>
            {error ||
              "Participant introuvable."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-participant-detail-page">
      {/* =====================================================
          RETOUR
      ====================================================== */}

      <button
        type="button"
        className="admin-participant-back"
        onClick={() =>
          navigate(
            `/admin/campagnes/${participant.campaignId}`
          )
        }
      >
        ← Retour à la campagne
      </button>

      {/* =====================================================
          PARTICIPANT
      ====================================================== */}

      <section className="admin-participant-hero">
        <div className="admin-participant-identity">
          <div className="admin-participant-big-avatar">
            {participant.firstName
              ?.charAt(0)
              ?.toUpperCase()}

            {participant.lastName
              ?.charAt(0)
              ?.toUpperCase()}
          </div>

          <div>
            <span className="admin-participant-eyebrow">
              PARTICIPANT
            </span>

            <h1>
              {
                participant.firstName
              }{" "}
              {
                participant.lastName
              }
            </h1>

            <p>
              {
                participant.email
              }
            </p>
          </div>
        </div>

        <span
          className={`admin-participant-main-status status-${participant.status?.toLowerCase()}`}
        >
          {STATUS_LABELS[
            participant.status
          ] ||
            participant.status}
        </span>
      </section>

      {/* =====================================================
          INFORMATIONS
      ====================================================== */}

      <section className="admin-participant-info-grid">
        <article>
          <span>
            Entreprise
          </span>

          <strong>
            {
              participant.companyName
            }
          </strong>
        </article>

        <article>
          <span>
            Campagne
          </span>

          <strong>
            {
              participant.campaignName
            }
          </strong>
        </article>

        <article>
          <span>
            Style
          </span>

          <strong>
            {participant.styleName ||
              "Non défini"}
          </strong>
        </article>

        <article>
          <span>
            Photos reçues
          </span>

          <strong>
            {
              photoStats.total
            }{" "}
            /{" "}
            {
              photoStats.maximum
            }
          </strong>
        </article>
      </section>

      {/* =====================================================
          PHOTOS
      ====================================================== */}

      <section className="admin-participant-workspace">
        <div className="admin-participant-section-title">
          <div>
            <span>
              PHOTOS SOURCE
            </span>

            <h2>
              Photos envoyées
            </h2>

            <p>
              Contrôlez les photos
              transmises avant la
              génération des
              portraits.
            </p>
          </div>

          <div className="admin-participant-photo-total">
            <strong>
              {
                photoStats.total
              }
            </strong>

            <span>
              photo
              {photoStats.total >
              1
                ? "s"
                : ""}
            </span>
          </div>
        </div>

        {/* =================================================
            STATS PHOTOS
        ================================================== */}

        {photos.length >
          0 && (
          <div className="admin-photo-review-summary">
            <div>
              <span>
                Disponibles
              </span>

              <strong>
                {
                  photoStats.available
                }
              </strong>
            </div>

            <div>
              <span>
                Acceptées
              </span>

              <strong>
                {
                  photoStats.accepted
                }
              </strong>
            </div>

            <div>
              <span>
                Rejetées
              </span>

              <strong>
                {
                  photoStats.rejected
                }
              </strong>
            </div>
          </div>
        )}

        {/* =================================================
            AUCUNE PHOTO
        ================================================== */}

        {photos.length ===
        0 ? (
          <div className="admin-participant-no-photos">
            <div>
              P
            </div>

            <strong>
              Aucune photo reçue
            </strong>

            <p>
              Le participant n’a
              pas encore envoyé
              ses photos.
            </p>
          </div>
        ) : (
          /*
           * ===============================================
           * GRILLE PHOTOS
           * ===============================================
           */
          <div className="admin-source-photo-grid">
            {photos.map(
              (
                photo,
                index
              ) => {
                const isBroken =
                  brokenPhotos.has(
                    photo.id
                  );

                const isAvailable =
                  Boolean(
                    photo.imageUrl
                  ) &&
                  photo.fileAvailable !==
                    false &&
                  !isBroken;

                return (
                  <article
                    className="admin-source-photo-card"
                    key={
                      photo.id
                    }
                  >
                    <button
                      type="button"
                      className="admin-source-photo-visual"
                      disabled={
                        !isAvailable
                      }
                      onClick={() => {
                        if (
                          isAvailable
                        ) {
                          setSelectedPhoto(
                            photo
                          );
                        }
                      }}
                    >
                      {isAvailable ? (
                        <>
                          <img
                            src={
                              photo.imageUrl
                            }
                            alt={
                              photo.originalFilename ||
                              `Photo source ${
                                index +
                                1
                              }`
                            }
                            loading="lazy"
                            onError={() =>
                              handlePhotoError(
                                photo.id
                              )
                            }
                          />

                          <span className="admin-photo-hover-action">
                            Agrandir
                          </span>
                        </>
                      ) : (
                        <div className="admin-photo-unavailable">
                          <strong>
                            Image
                            indisponible
                          </strong>

                          <span>
                            {photo.storageProvider ===
                            "LOCAL"
                              ? "Ancien stockage local"
                              : "Fichier inaccessible"}
                          </span>
                        </div>
                      )}
                    </button>

                    {/* =====================================
                        NOM + STATUS
                    ====================================== */}

                    <div className="admin-source-photo-content">
                      <div>
                        <strong
                          title={
                            photo.originalFilename ||
                            ""
                          }
                        >
                          {photo.originalFilename ||
                            `Photo ${
                              index +
                              1
                            }`}
                        </strong>

                        <span>
                          {formatBytes(
                            photo.sizeBytes
                          )}
                        </span>
                      </div>

                      <span
                        className={`admin-photo-status photo-${photo.status?.toLowerCase()}`}
                      >
                        {PHOTO_STATUS_LABELS[
                          photo.status
                        ] ||
                          photo.status}
                      </span>
                    </div>

                    {/* =====================================
                        META
                    ====================================== */}

                    <div className="admin-source-photo-meta">
                      <span>
                        {photo.mimeType ||
                          "Image"}
                      </span>

                      {photo.width &&
                      photo.height ? (
                        <span>
                          {
                            photo.width
                          }{" "}
                          ×{" "}
                          {
                            photo.height
                          }
                        </span>
                      ) : (
                        <span>
                          Dimensions —
                        </span>
                      )}
                    </div>

                    <div className="admin-source-photo-date">
                      <span>
                        {STORAGE_PROVIDER_LABELS[
                          photo.storageProvider
                        ] ||
                          photo.storageProvider ||
                          "Stockage"}
                      </span>

                      <span>
                        Ajoutée le{" "}
                        {formatDate(
                          photo.createdAt
                        )}
                      </span>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}

        {/* =================================================
            NEXT STEP
        ================================================== */}

        <div className="admin-participant-process-card">
          <div className="admin-process-copy">
            <span>
              PROCHAINE ÉTAPE
            </span>

            <h3>
              Contrôle et
              génération
            </h3>

            {participant.status ===
            "PHOTOS_RECEIVED" ? (
              <p>
                Les photos ont bien
                été reçues. Portrélia
                peut maintenant
                effectuer le contrôle
                qualité avant de
                lancer la génération.
              </p>
            ) : (
              <p>
                Statut actuel :{" "}
                {STATUS_LABELS[
                  participant.status
                ] ||
                  participant.status}
                .
              </p>
            )}
          </div>

          <div className="admin-process-actions">
            {participant.status ===
              "PHOTOS_RECEIVED" && (
              <button
                type="button"
                className="admin-generation-button"
                disabled
              >
                Lancer la
                génération
              </button>
            )}

            {participant.status !==
              "PHOTOS_RECEIVED" && (
              <span className="admin-process-status">
                {STATUS_LABELS[
                  participant.status
                ] ||
                  participant.status}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          MODALE IMAGE
      ====================================================== */}

      {selectedPhoto && (
        <div
          className="admin-photo-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Aperçu de la photo"
          onClick={() =>
            setSelectedPhoto(
              null
            )
          }
        >
          <div
            className="admin-photo-modal-content"
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className="admin-photo-modal-close"
              onClick={() =>
                setSelectedPhoto(
                  null
                )
              }
              aria-label="Fermer l'aperçu"
            >
              ×
            </button>

            <img
              src={
                selectedPhoto.imageUrl
              }
              alt={
                selectedPhoto.originalFilename ||
                "Photo participant"
              }
              onError={() =>
                handlePhotoError(
                  selectedPhoto.id
                )
              }
            />

            <div className="admin-photo-modal-footer">
              <div>
                <strong>
                  {selectedPhoto.originalFilename ||
                    "Photo participant"}
                </strong>

                <span>
                  {STORAGE_PROVIDER_LABELS[
                    selectedPhoto.storageProvider
                  ] ||
                    selectedPhoto.storageProvider ||
                    ""}
                </span>
              </div>

              <span>
                {formatBytes(
                  selectedPhoto.sizeBytes
                )}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminParticipantDetailsPage;