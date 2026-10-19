import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  FiArrowLeft,
  FiCheckCircle,
  FiImage,
  FiPlay,
  FiRefreshCw,
  FiShield,
  FiXCircle,
} from "react-icons/fi";

import api from "../../../services/api";
import "./AdminGenerationParticipantPage.css";

const MIN_ACCEPTED_PHOTOS = 6;

const STATUS_LABELS = {
  GENERATION_PENDING:
    "Prête à générer",

  GENERATION_IN_PROGRESS:
    "Génération en cours",

  QA_PENDING:
    "Portraits à contrôler",

  GALLERY_READY:
    "Galerie prête",

  VALIDATED:
    "Portrait validé",

  DELIVERED:
    "Livré",
};

function AdminGenerationParticipantPage() {
  const {
    participantId,
  } = useParams();

  const navigate =
    useNavigate();

  const [
    participant,
    setParticipant,
  ] = useState(null);

  const [
    photos,
    setPhotos,
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
    starting,
    setStarting,
  ] = useState(false);

  const [
    brokenPhotos,
    setBrokenPhotos,
  ] = useState(
    () => new Set()
  );

  /*
   * =========================================================
   * ACCEPTED PHOTOS
   * =========================================================
   */
  const acceptedPhotos =
    useMemo(
      () =>
        photos.filter(
          (photo) =>
            photo.status ===
            "ACCEPTED"
        ),
      [photos]
    );

  /*
   * =========================================================
   * GENERATION READY
   * =========================================================
   */
  const canStartGeneration =
    participant?.status ===
      "GENERATION_PENDING" &&
    acceptedPhotos.length >=
      MIN_ACCEPTED_PHOTOS;

  /*
   * =========================================================
   * INITIAL LOAD
   * =========================================================
   */
  useEffect(() => {
    let active = true;

    const run =
      async () => {
        try {
          const response =
            await api.get(
              `/admin/participants/${participantId}`
            );

          if (!active) {
            return;
          }

          const data =
            response.data
              ?.data;

          if (
            !data
              ?.participant
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

          setBrokenPhotos(
            new Set()
          );

          setError("");
        } catch (
          requestError
        ) {
          if (!active) {
            return;
          }

          console.error(
            "GENERATION LOAD ERROR :",
            requestError
          );

          setParticipant(
            null
          );

          setPhotos([]);

          setError(
            requestError
              .response
              ?.data
              ?.message ||
              requestError.message ||
              "Impossible de charger les informations de génération."
          );
        } finally {
          if (active) {
            setLoading(
              false
            );
          }
        }
      };

    run();

    return () => {
      active = false;
    };
  }, [participantId]);

  /*
   * =========================================================
   * REFRESH PARTICIPANT
   * =========================================================
   */
  const refreshParticipant =
    async () => {
      const response =
        await api.get(
          `/admin/participants/${participantId}`
        );

      const data =
        response.data
          ?.data;

      if (
        !data
          ?.participant
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

      setBrokenPhotos(
        new Set()
      );

      setError("");
    };

  /*
   * =========================================================
   * IMAGE ERROR
   * =========================================================
   */
  const handleImageError =
    (photoId) => {
      setBrokenPhotos(
        (current) => {
          const next =
            new Set(
              current
            );

          next.add(
            photoId
          );

          return next;
        }
      );
    };

  /*
   * =========================================================
   * START GENERATION
   * =========================================================
   */
  const startGeneration =
    async () => {
      if (
        !canStartGeneration ||
        starting
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          `Lancer la génération des portraits pour ${participant.firstName} ${participant.lastName} avec ${acceptedPhotos.length} photo(s) validée(s) ?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setStarting(
          true
        );

        setError("");

        await api.post(
          `/admin/participants/${participantId}/generation/start`
        );

        await refreshParticipant();
      } catch (
        requestError
      ) {
        console.error(
          "START GENERATION ERROR :",
          requestError
        );

        setError(
          requestError
            .response
            ?.data
            ?.message ||
            "Impossible de lancer la génération."
        );
      } finally {
        setStarting(
          false
        );
      }
    };

  /*
   * =========================================================
   * LOADING
   * =========================================================
   */
  if (loading) {
    return (
      <div className="generation-page generation-centered">

        <FiRefreshCw className="generation-spinner" />

        <strong>
          Chargement de la génération...
        </strong>

      </div>
    );
  }

  /*
   * =========================================================
   * ERROR
   * =========================================================
   */
  if (
    error &&
    !participant
  ) {
    return (
      <div className="generation-page generation-centered">

        <FiXCircle className="generation-error-icon" />

        <strong>
          Génération indisponible
        </strong>

        <p>
          {error}
        </p>

        <button
          type="button"
          className="generation-secondary-button"
          onClick={() =>
            navigate(
              `/admin/participants/${participantId}`
            )
          }
        >
          <FiArrowLeft />

          Retour au participant
        </button>

      </div>
    );
  }

  return (
    <div className="generation-page">

      {/* =====================================================
          BACK
      ====================================================== */}

      <button
        type="button"
        className="generation-back"
        onClick={() =>
          navigate(
            `/admin/participants/${participantId}`
          )
        }
      >
        <FiArrowLeft />

        Retour au participant
      </button>

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="generation-header">

        <div>

          <span className="generation-eyebrow">
            GÉNÉRATION DE PORTRAITS
          </span>

          <h1>
            Préparer la génération
          </h1>

          <p>
            Vérifiez les photos validées et
            les paramètres avant de lancer
            la génération des portraits.
          </p>

        </div>

        <div className="generation-participant">

          <div className="generation-avatar">

            {participant
              ?.firstName
              ?.charAt(0)
              ?.toUpperCase()}

            {participant
              ?.lastName
              ?.charAt(0)
              ?.toUpperCase()}

          </div>

          <div>

            <strong>
              {
                participant
                  ?.firstName
              }{" "}
              {
                participant
                  ?.lastName
              }
            </strong>

            <span>
              {
                participant
                  ?.email
              }
            </span>

          </div>

        </div>

      </header>

      {/* =====================================================
          STATUS
      ====================================================== */}

      <section className="generation-status-card">

        <div className="generation-status-icon">

          {participant.status ===
          "GENERATION_PENDING" ? (
            <FiPlay />
          ) : participant.status ===
            "GENERATION_IN_PROGRESS" ? (
            <FiRefreshCw className="generation-spinner-small" />
          ) : (
            <FiCheckCircle />
          )}

        </div>

        <div>

          <span>
            STATUT
          </span>

          <h2>
            {STATUS_LABELS[
              participant.status
            ] ||
              participant.status}
          </h2>

          <p>
            {participant.status ===
            "GENERATION_PENDING"
              ? "Le contrôle qualité des photos source est terminé. La génération peut être lancée."
              : participant.status ===
                "GENERATION_IN_PROGRESS"
              ? "La génération des portraits est actuellement en cours."
              : participant.status ===
                "QA_PENDING"
              ? "Les portraits ont été générés et doivent maintenant être contrôlés."
              : "Le participant a déjà dépassé l'étape de génération."}
          </p>

        </div>

      </section>

      {/* =====================================================
          INFO GRID
      ====================================================== */}

      <section className="generation-info-grid">

        <article>

          <span>
            Entreprise
          </span>

          <strong>
            {
              participant.companyName ||
              "—"
            }
          </strong>

        </article>

        <article>

          <span>
            Campagne
          </span>

          <strong>
            {
              participant.campaignName ||
              "—"
            }
          </strong>

        </article>

        <article>

          <span>
            Style
          </span>

          <strong>
            {
              participant.styleName ||
              "Non défini"
            }
          </strong>

        </article>

        <article>

          <span>
            Photos validées
          </span>

          <strong>
            {acceptedPhotos.length}
          </strong>

        </article>

      </section>

      {/* =====================================================
          WORKSPACE
      ====================================================== */}

      <main className="generation-workspace">

        {/* =================================================
            PHOTOS
        ================================================== */}

        <section className="generation-photo-section">

          <div className="generation-section-header">

            <div>

              <span>
                PHOTOS D'ENTRÉE
              </span>

              <h2>
                Photos acceptées
              </h2>

              <p>
                Seules les photos validées
                par le contrôle qualité
                seront utilisées pour la
                génération.
              </p>

            </div>

            <div className="generation-photo-count">

              <strong>
                {
                  acceptedPhotos.length
                }
              </strong>

              <span>
                validée
                {acceptedPhotos.length >
                1
                  ? "s"
                  : ""}
              </span>

            </div>

          </div>

          {/* MINIMUM */}

          <div
            className={`generation-readiness ${
              acceptedPhotos.length >=
              MIN_ACCEPTED_PHOTOS
                ? "ready"
                : "not-ready"
            }`}
          >

            {acceptedPhotos.length >=
            MIN_ACCEPTED_PHOTOS ? (
              <FiCheckCircle />
            ) : (
              <FiXCircle />
            )}

            <div>

              <strong>
                {acceptedPhotos.length >=
                MIN_ACCEPTED_PHOTOS
                  ? "Photos suffisantes"
                  : "Photos insuffisantes"}
              </strong>

              <span>
                Minimum{" "}
                {
                  MIN_ACCEPTED_PHOTOS
                }{" "}
                photos acceptées
                nécessaires.
              </span>

            </div>

          </div>

          {/* PHOTO GRID */}

          {acceptedPhotos.length ===
          0 ? (
            <div className="generation-empty">

              <FiImage />

              <strong>
                Aucune photo acceptée
              </strong>

              <p>
                Le participant doit
                disposer de photos
                acceptées avant la
                génération.
              </p>

            </div>
          ) : (
            <div className="generation-photo-grid">

              {acceptedPhotos.map(
                (
                  photo,
                  index
                ) => {
                  const broken =
                    brokenPhotos.has(
                      photo.id
                    );

                  const available =
                    Boolean(
                      photo.imageUrl
                    ) &&
                    !broken;

                  return (
                    <article
                      key={
                        photo.id
                      }
                      className="generation-photo-card"
                    >

                      <div className="generation-photo-image">

                        {available ? (
                          <img
                            src={
                              photo.imageUrl
                            }
                            alt={`Photo validée ${
                              index +
                              1
                            }`}
                            onError={() =>
                              handleImageError(
                                photo.id
                              )
                            }
                          />
                        ) : (
                          <div className="generation-photo-placeholder">

                            <FiImage />

                            <span>
                              Image
                              indisponible
                            </span>

                          </div>
                        )}

                        <span className="generation-photo-approved">

                          <FiCheckCircle />

                          Acceptée

                        </span>

                      </div>

                      <div className="generation-photo-footer">

                        <strong>
                          Photo{" "}
                          {
                            index +
                            1
                          }
                        </strong>

                        <span>
                          {photo.originalFilename ||
                            "Photo source"}
                        </span>

                      </div>

                    </article>
                  );
                }
              )}

            </div>
          )}

        </section>

        {/* =================================================
            GENERATION PANEL
        ================================================== */}

        <aside className="generation-control-panel">

          <div className="generation-control-icon">
            <FiShield />
          </div>

          <span className="generation-control-eyebrow">
            PARAMÈTRES
          </span>

          <h2>
            Génération
          </h2>

          <p>
            La génération utilisera uniquement
            les photos acceptées et le style
            défini pour cette campagne.
          </p>

          {/* STYLE */}

          <div className="generation-control-row">

            <span>
              Style
            </span>

            <strong>
              {
                participant.styleName ||
                "Non défini"
              }
            </strong>

          </div>

          {/* PHOTOS */}

          <div className="generation-control-row">

            <span>
              Photos utilisées
            </span>

            <strong>
              {
                acceptedPhotos.length
              }
            </strong>

          </div>

          {/* PARTICIPANT */}

          <div className="generation-control-row">

            <span>
              Participant
            </span>

            <strong>
              {
                participant.firstName
              }{" "}
              {
                participant.lastName
              }
            </strong>

          </div>

          {/* CAMPAIGN */}

          <div className="generation-control-row">

            <span>
              Campagne
            </span>

            <strong>
              {
                participant.campaignName ||
                "—"
              }
            </strong>

          </div>

          {/* ERROR */}

          {error && (
            <div className="generation-error">
              {error}
            </div>
          )}

          {/* START */}

          {participant.status ===
            "GENERATION_PENDING" && (
            <button
              type="button"
              className="generation-start-button"
              disabled={
                !canStartGeneration ||
                starting
              }
              onClick={
                startGeneration
              }
            >

              {starting ? (
                <>
                  <FiRefreshCw className="generation-spinner-small" />

                  Lancement...
                </>
              ) : (
                <>
                  <FiPlay />

                  Lancer la génération
                </>
              )}

            </button>
          )}

          {/* IN PROGRESS */}

          {participant.status ===
            "GENERATION_IN_PROGRESS" && (
            <div className="generation-progress-box">

              <FiRefreshCw className="generation-spinner-small" />

              <div>

                <strong>
                  Génération en cours
                </strong>

                <span>
                  Les portraits sont en
                  cours de création.
                </span>

              </div>

            </div>
          )}

          {/* NEXT STEP */}

          {participant.status ===
            "QA_PENDING" && (
            <div className="generation-complete-box">

              <FiCheckCircle />

              <div>

                <strong>
                  Génération terminée
                </strong>

                <span>
                  Les portraits sont prêts
                  pour le contrôle QA.
                </span>

              </div>

            </div>
          )}

          <div className="generation-security-note">

            <FiShield />

            <span>
              Aucune génération ne démarre
              automatiquement. Une validation
              administrateur est nécessaire.
            </span>

          </div>

        </aside>

      </main>

    </div>
  );
}

export default AdminGenerationParticipantPage;