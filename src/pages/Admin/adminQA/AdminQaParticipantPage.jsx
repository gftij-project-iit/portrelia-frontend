import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  FiArrowLeft,
  FiCheck,
  FiCheckCircle,
  FiImage,
  FiRefreshCw,
  FiShield,
  FiX,
  FiXCircle,
} from "react-icons/fi";

import api from "../../../services/api";
import "./AdminQaParticipantPage.css";

const MIN_ACCEPTED = 6;

function AdminQaParticipantPage() {
  const {
    participantId,
  } = useParams();

  const navigate =
    useNavigate();

  const reviewPanelRef =
    useRef(null);

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
    selectedPhoto,
    setSelectedPhoto,
  ] = useState(null);

  const [
    processingPhotoId,
    setProcessingPhotoId,
  ] = useState(null);

  const [
    bulkProcessing,
    setBulkProcessing,
  ] = useState(false);

  const [
    completing,
    setCompleting,
  ] = useState(false);

  const [
    rejectionReason,
    setRejectionReason,
  ] = useState("");

  const [
    brokenPhotos,
    setBrokenPhotos,
  ] = useState(
    () => new Set()
  );

  /*
   * =========================================================
   * STATS
   * =========================================================
   */
  const stats =
    useMemo(() => {
      const accepted =
        photos.filter(
          (photo) =>
            photo.status ===
            "ACCEPTED"
        ).length;

      const rejected =
        photos.filter(
          (photo) =>
            photo.status ===
            "REJECTED"
        ).length;

      const pending =
        photos.filter(
          (photo) =>
            photo.status ===
            "UPLOADED"
        ).length;

      return {
        total:
          photos.length,

        accepted,

        rejected,

        pending,
      };
    }, [photos]);

  /*
   * QA terminé seulement si :
   *
   * - minimum 6 photos acceptées
   * - aucune photo encore UPLOADED
   */
  const canComplete =
    stats.accepted >=
      MIN_ACCEPTED &&
    stats.pending === 0;

  /*
   * =========================================================
   * LOAD PARTICIPANT
   * =========================================================
   */
  const loadParticipant =
    async () => {
      try {
        setError("");

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

        const loadedPhotos =
          Array.isArray(
            data.photos
          )
            ? data.photos
            : [];

        setParticipant(
          data.participant
        );

        setPhotos(
          loadedPhotos
        );

        setBrokenPhotos(
          new Set()
        );

        /*
         * Garde la photo sélectionnée
         * après acceptation / rejet.
         */
        setSelectedPhoto(
          (current) => {
            if (
              !current
            ) {
              return null;
            }

            return (
              loadedPhotos.find(
                (photo) =>
                  photo.id ===
                  current.id
              ) ||
              null
            );
          }
        );
      } catch (
        requestError
      ) {
        console.error(
          "QA LOAD ERROR :",
          requestError
        );

        setError(
          requestError
            .response
            ?.data
            ?.message ||
            requestError.message ||
            "Impossible de charger le contrôle QA."
        );
      }
    };

  /*
   * =========================================================
   * INITIAL LOAD
   * =========================================================
   */
  useEffect(() => {
    let active =
      true;

    const run =
      async () => {
        try {
          setLoading(
            true
          );

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

          const loadedPhotos =
            Array.isArray(
              data.photos
            )
              ? data.photos
              : [];

          setParticipant(
            data.participant
          );

          setPhotos(
            loadedPhotos
          );

          /*
           * Au départ :
           * aucune photo sélectionnée.
           */
          setSelectedPhoto(
            null
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
            "QA INITIAL LOAD ERROR :",
            requestError
          );

          setError(
            requestError
              .response
              ?.data
              ?.message ||
              requestError.message ||
              "Impossible de charger le contrôle QA."
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
   * SELECT PHOTO
   * =========================================================
   *
   * Sur mobile/tablette :
   *
   * clic photo
   * ↓
   * scroll automatique
   * ↓
   * panneau validation
   */
  const handleSelectPhoto =
    (photo) => {
      setSelectedPhoto(
        photo
      );

      setRejectionReason(
        photo.rejectionReason ||
          ""
      );

      const shouldScroll =
        window.matchMedia(
          "(max-width: 1050px)"
        ).matches;

      if (shouldScroll) {
        window.requestAnimationFrame(
          () => {
            setTimeout(
              () => {
                reviewPanelRef
                  .current
                  ?.scrollIntoView({
                    behavior:
                      "smooth",

                    block:
                      "start",
                  });
              },
              50
            );
          }
        );
      }
    };

  /*
   * =========================================================
   * ACCEPT PHOTO
   * =========================================================
   */
  const acceptPhoto =
    async (photoId) => {
      try {
        setProcessingPhotoId(
          photoId
        );

        setError("");

        await api.patch(
          `/admin/photos/${photoId}/review`,
          {
            status:
              "ACCEPTED",

            rejectionReason:
              null,
          }
        );

        setRejectionReason(
          ""
        );

        await loadParticipant();
      } catch (
        requestError
      ) {
        console.error(
          "QA ACCEPT ERROR :",
          requestError
        );

        setError(
          requestError
            .response
            ?.data
            ?.message ||
            "Impossible d'accepter cette photo."
        );
      } finally {
        setProcessingPhotoId(
          null
        );
      }
    };

  /*
   * =========================================================
   * REJECT PHOTO
   * =========================================================
   */
  const rejectPhoto =
    async (photoId) => {
      const reason =
        rejectionReason
          .trim();

      if (!reason) {
        setError(
          "Indiquez un motif de rejet."
        );

        return;
      }

      try {
        setProcessingPhotoId(
          photoId
        );

        setError("");

        await api.patch(
          `/admin/photos/${photoId}/review`,
          {
            status:
              "REJECTED",

            rejectionReason:
              reason,
          }
        );

        setRejectionReason(
          ""
        );

        await loadParticipant();
      } catch (
        requestError
      ) {
        console.error(
          "QA REJECT ERROR :",
          requestError
        );

        setError(
          requestError
            .response
            ?.data
            ?.message ||
            "Impossible de rejeter cette photo."
        );
      } finally {
        setProcessingPhotoId(
          null
        );
      }
    };

  /*
   * =========================================================
   * ACCEPT ALL PHOTOS
   * =========================================================
   *
   * Accepte toutes les photos
   * encore en statut UPLOADED.
   */
  const acceptAllPendingPhotos =
    async () => {
      const pendingPhotos =
        photos.filter(
          (photo) =>
            photo.status ===
            "UPLOADED"
        );

      if (
        pendingPhotos.length ===
        0
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          `Confirmer l'acceptation des ${pendingPhotos.length} photo(s) encore à contrôler ?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setBulkProcessing(
          true
        );

        setError("");

        await Promise.all(
          pendingPhotos.map(
            (photo) =>
              api.patch(
                `/admin/photos/${photo.id}/review`,
                {
                  status:
                    "ACCEPTED",

                  rejectionReason:
                    null,
                }
              )
          )
        );

        setSelectedPhoto(
          null
        );

        setRejectionReason(
          ""
        );

        await loadParticipant();
      } catch (
        requestError
      ) {
        console.error(
          "QA ACCEPT ALL ERROR :",
          requestError
        );

        setError(
          requestError
            .response
            ?.data
            ?.message ||
            "Impossible d'accepter toutes les photos."
        );
      } finally {
        setBulkProcessing(
          false
        );
      }
    };

  /*
   * =========================================================
   * COMPLETE QA
   * =========================================================
   */
  const completeQa =
    async () => {
      if (
        !canComplete
      ) {
        return;
      }

      try {
        setCompleting(
          true
        );

        setError("");

        await api.post(
          `/admin/participants/${participantId}/qa/complete`
        );

        navigate(
          `/admin/participants/${participantId}`
        );
      } catch (
        requestError
      ) {
        console.error(
          "COMPLETE QA ERROR :",
          requestError
        );

        setError(
          requestError
            .response
            ?.data
            ?.message ||
            "Impossible de terminer le contrôle qualité."
        );
      } finally {
        setCompleting(
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
      <div className="qa-page qa-centered">

        <FiRefreshCw className="qa-spinner" />

        <strong>
          Chargement du contrôle
          qualité...
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
      <div className="qa-page qa-centered">

        <FiXCircle />

        <strong>
          QA indisponible
        </strong>

        <p>
          {error}
        </p>

      </div>
    );
  }

  return (
    <div className="qa-page">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="qa-header">

        <div>

          <button
            type="button"
            className="qa-back"
            onClick={() =>
              navigate(
                `/admin/participants/${participantId}`
              )
            }
          >
            <FiArrowLeft />

            Retour au participant
          </button>

          <span className="qa-eyebrow">
            CONTRÔLE QUALITÉ
          </span>

          <h1>
            Photos source
          </h1>

          <p>
            Vérifiez les photos
            avant de lancer la
            génération.
          </p>

        </div>

        <div className="qa-participant">

          <div className="qa-avatar">
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
          STATS
      ====================================================== */}

      <section className="qa-stats">

        <article>

          <span>
            Photos
          </span>

          <strong>
            {stats.total}
          </strong>

        </article>

        <article>

          <span>
            À contrôler
          </span>

          <strong>
            {stats.pending}
          </strong>

        </article>

        <article className="qa-stat-success">

          <span>
            Acceptées
          </span>

          <strong>
            {stats.accepted}
          </strong>

        </article>

        <article className="qa-stat-danger">

          <span>
            Rejetées
          </span>

          <strong>
            {stats.rejected}
          </strong>

        </article>

      </section>

      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="qa-error">
          {error}
        </div>
      )}

      {/* =====================================================
          WORKSPACE
      ====================================================== */}

      <main className="qa-workspace">

        {/* =================================================
            PHOTO LIST
        ================================================== */}

        <section className="qa-photo-list">

          <div className="qa-section-head">

            <div>

              <span>
                FILE DE CONTRÔLE
              </span>

              <h2>
                Photos reçues
              </h2>

            </div>

            <strong className="qa-minimum-badge">
              {
                stats.accepted
              }
              /
              {
                MIN_ACCEPTED
              }{" "}
              minimum
            </strong>

          </div>

          {/* =================================================
              ACCEPT ALL
          ================================================== */}

          <div className="qa-bulk-actions">

            <div>

              <strong>
                Validation rapide
              </strong>

              <span>
                {stats.pending >
                0
                  ? `${stats.pending} photo(s) restent à contrôler`
                  : "Toutes les photos ont été contrôlées"}
              </span>

            </div>

            <button
              type="button"
              className="qa-accept-all-button"
              disabled={
                stats.pending ===
                  0 ||
                bulkProcessing ||
                processingPhotoId !==
                  null
              }
              onClick={
                acceptAllPendingPhotos
              }
            >
              {bulkProcessing ? (
                <>
                  <FiRefreshCw className="qa-button-spinner" />

                  Validation en cours...
                </>
              ) : (
                <>
                  <FiCheck />

                  Accepter toutes
                  les photos
                </>
              )}
            </button>

          </div>

          {/* =================================================
              GRID
          ================================================== */}

          <div className="qa-grid">

            {photos.map(
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

                const selected =
                  selectedPhoto
                    ?.id ===
                  photo.id;

                return (
                  <button
                    key={
                      photo.id
                    }
                    type="button"
                    className={`qa-photo-card ${
                      selected
                        ? "selected"
                        : ""
                    } status-${photo.status?.toLowerCase()}`}
                    onClick={() =>
                      handleSelectPhoto(
                        photo
                      )
                    }
                  >

                    <div className="qa-photo-image">

                      {available ? (
                        <img
                          src={
                            photo.imageUrl
                          }
                          alt={`Photo ${
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
                        <div className="qa-photo-empty">
                          <FiImage />
                        </div>
                      )}

                      {photo.status ===
                        "ACCEPTED" && (
                        <span className="qa-photo-state accepted">
                          <FiCheck />
                        </span>
                      )}

                      {photo.status ===
                        "REJECTED" && (
                        <span className="qa-photo-state rejected">
                          <FiX />
                        </span>
                      )}

                    </div>

                    <div className="qa-photo-footer">

                      <strong>
                        Photo{" "}
                        {
                          index +
                          1
                        }
                      </strong>

                      <span>
                        {photo.status ===
                        "ACCEPTED"
                          ? "Acceptée"
                          : photo.status ===
                            "REJECTED"
                          ? "Rejetée"
                          : "À contrôler"}
                      </span>

                    </div>

                  </button>
                );
              }
            )}

          </div>

        </section>

        {/* =================================================
            REVIEW PANEL
        ================================================== */}

        <aside
          ref={
            reviewPanelRef
          }
          className="qa-review-panel"
        >

          {selectedPhoto ? (
            <>

              <div className="qa-mobile-review-marker">
                Contrôle de la photo
              </div>

              <div className="qa-review-header">

                <div>

                  <span>
                    PHOTO
                    SÉLECTIONNÉE
                  </span>

                  <h2>
                    {
                      selectedPhoto
                        .originalFilename ||
                      "Photo source"
                    }
                  </h2>

                </div>

                <span
                  className={`qa-review-status status-${selectedPhoto.status?.toLowerCase()}`}
                >
                  {selectedPhoto.status ===
                  "ACCEPTED"
                    ? "Acceptée"
                    : selectedPhoto.status ===
                      "REJECTED"
                    ? "Rejetée"
                    : "À contrôler"}
                </span>

              </div>

              {/* IMAGE */}

              <div className="qa-review-image">

                {selectedPhoto
                  .imageUrl &&
                !brokenPhotos.has(
                  selectedPhoto.id
                ) ? (
                  <img
                    src={
                      selectedPhoto.imageUrl
                    }
                    alt="Photo à contrôler"
                    onError={() =>
                      handleImageError(
                        selectedPhoto.id
                      )
                    }
                  />
                ) : (
                  <div className="qa-review-no-image">

                    <FiImage />

                    Image
                    indisponible

                  </div>
                )}

              </div>

              {/* CHECKLIST */}

              <div className="qa-checklist">

                <h3>
                  Points de contrôle
                </h3>

                <div>
                  <FiCheckCircle />

                  Visage net et
                  visible
                </div>

                <div>
                  <FiCheckCircle />

                  Éclairage
                  exploitable
                </div>

                <div>
                  <FiCheckCircle />

                  Cadrage correct
                </div>

                <div>
                  <FiCheckCircle />

                  Pas de filtre ou
                  artefact gênant
                </div>

                <div>
                  <FiCheckCircle />

                  Apparence récente
                </div>

              </div>

              {/* REJECTION REASON */}

              <div className="qa-rejection">

                <label htmlFor="qa-rejection-reason">
                  Motif de rejet
                </label>

                <textarea
                  id="qa-rejection-reason"
                  value={
                    rejectionReason
                  }
                  onChange={(event) =>
                    setRejectionReason(
                      event.target.value
                    )
                  }
                  placeholder="Ex. photo floue, visage masqué, contre-jour..."
                  rows={4}
                />

              </div>

              {/* ACTIONS */}

              <div className="qa-review-actions">

                <button
                  type="button"
                  className="qa-reject-button"
                  disabled={
                    processingPhotoId ===
                      selectedPhoto.id ||
                    bulkProcessing
                  }
                  onClick={() =>
                    rejectPhoto(
                      selectedPhoto.id
                    )
                  }
                >
                  {processingPhotoId ===
                  selectedPhoto.id ? (
                    <FiRefreshCw className="qa-button-spinner" />
                  ) : (
                    <FiX />
                  )}

                  Rejeter
                </button>

                <button
                  type="button"
                  className="qa-accept-button"
                  disabled={
                    processingPhotoId ===
                      selectedPhoto.id ||
                    bulkProcessing
                  }
                  onClick={() =>
                    acceptPhoto(
                      selectedPhoto.id
                    )
                  }
                >
                  {processingPhotoId ===
                  selectedPhoto.id ? (
                    <FiRefreshCw className="qa-button-spinner" />
                  ) : (
                    <FiCheck />
                  )}

                  Accepter
                </button>

              </div>

            </>
          ) : (
            <div className="qa-empty-review">

              <FiShield />

              <strong>
                Sélectionnez une
                photo
              </strong>

              <span>
                Cliquez sur une
                photo pour afficher
                la zone de contrôle.
              </span>

            </div>
          )}

        </aside>

      </main>

      {/* =====================================================
          FINAL VALIDATION
      ====================================================== */}

      <section className="qa-final-card">

        <div>

          <span>
            VALIDATION DU
            CONTRÔLE
          </span>

          <h2>
            {canComplete
              ? "Contrôle prêt à être validé"
              : "Contrôle en cours"}
          </h2>

          <p>
            {stats.accepted <
            MIN_ACCEPTED
              ? `Il faut au moins ${MIN_ACCEPTED} photos acceptées.`
              : stats.pending >
                0
              ? `${stats.pending} photo(s) restent à contrôler.`
              : "Toutes les photos ont été contrôlées."}
          </p>

        </div>

        <button
          type="button"
          className="qa-complete-button"
          disabled={
            !canComplete ||
            completing
          }
          onClick={
            completeQa
          }
        >
          {completing ? (
            <FiRefreshCw className="qa-button-spinner" />
          ) : (
            <FiShield />
          )}

          {completing
            ? "Validation..."
            : "Valider le contrôle qualité"}
        </button>

      </section>

    </div>
  );
}

export default AdminQaParticipantPage;