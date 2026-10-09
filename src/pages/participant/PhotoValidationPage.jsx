import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  FiAlertTriangle,
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiImage,
  FiRefreshCw,
  FiShield,
} from "react-icons/fi";

import api from "../../services/api";
import "./PhotoValidationPage.css";

const MIN_PHOTOS = 6;
const MAX_PHOTOS = 12;

function PhotoValidationPage() {
  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();

  const token =
    searchParams.get("token");

  const [photos, setPhotos] =
    useState([]);

  const [
    participant,
    setParticipant,
  ] = useState(null);

  const [loading, setLoading] =
    useState(Boolean(token));

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [
    brokenPhotos,
    setBrokenPhotos,
  ] = useState(
    () => new Set()
  );

  const validPhotoCount =
    photos.length >= MIN_PHOTOS &&
    photos.length <= MAX_PHOTOS;

  /*
   * =========================================================
   * CHARGEMENT DES PHOTOS
   * =========================================================
   *
   * L'API renvoie maintenant directement :
   *
   * photo.imageUrl
   *
   * avec une signed URL Supabase privée.
   */
  useEffect(() => {
    if (!token) {
      return undefined;
    }

    const controller =
      new AbortController();

    let active = true;

    api
      .get(
        `/participant/invitations/${encodeURIComponent(
          token
        )}/photos`,
        {
          signal:
            controller.signal,
        }
      )
      .then((response) => {
        if (!active) {
          return;
        }

        const data =
          response.data?.data ||
          {};

        setPhotos(
          Array.isArray(
            data.photos
          )
            ? data.photos
            : []
        );

        setParticipant(
          data.participant ||
            null
        );

        setBrokenPhotos(
          new Set()
        );

        setError("");
      })
      .catch(
        (requestError) => {
          if (
            requestError.code ===
              "ERR_CANCELED" ||
            requestError.name ===
              "CanceledError"
          ) {
            return;
          }

          console.error(
            "Erreur chargement validation :",
            requestError
          );

          if (!active) {
            return;
          }

          setError(
            requestError.response
              ?.data?.message ||
              "Impossible de charger vos photos."
          );
        }
      )
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [token]);

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
            new Set(current);

          next.add(photoId);

          return next;
        }
      );
    };

  /*
   * =========================================================
   * RETOUR ÉTAPE 2
   * =========================================================
   */
  const handleBack = () => {
    navigate(
      `/invitation/photos?token=${encodeURIComponent(
        token
      )}`
    );
  };

  /*
   * =========================================================
   * CONFIRMATION FINALE
   * =========================================================
   */
  const handleConfirm =
    async () => {
      if (
        !token ||
        submitting
      ) {
        return;
      }

      if (!validPhotoCount) {
        setError(
          "Vous devez avoir entre 6 et 12 photos pour confirmer."
        );

        return;
      }

      try {
        setSubmitting(true);
        setError("");

        await api.post(
          `/participant/invitations/${encodeURIComponent(
            token
          )}/photos/submit`
        );

        navigate(
          `/invitation/envoi-termine?token=${encodeURIComponent(
            token
          )}`
        );
      } catch (
        submitError
      ) {
        console.error(
          "Erreur validation finale :",
          submitError
        );

        setError(
          submitError.response
            ?.data?.message ||
            "Impossible de confirmer l'envoi de vos photos."
        );
      } finally {
        setSubmitting(false);
      }
    };

  /*
   * =========================================================
   * TOKEN ABSENT
   * =========================================================
   */
  if (!token) {
    return (
      <div className="photo-validation-page photo-validation-centered">
        <div className="photo-validation-error">
          <FiAlertTriangle />

          <h1>
            Lien invalide
          </h1>

          <p>
            Le token
            d'invitation est
            manquant.
          </p>
        </div>
      </div>
    );
  }

  /*
   * =========================================================
   * LOADING
   * =========================================================
   */
  if (loading) {
    return (
      <div className="photo-validation-page photo-validation-centered">
        <div className="photo-validation-error">
          <FiRefreshCw className="photo-validation-spin" />

          <h1>
            Chargement...
          </h1>

          <p>
            Nous récupérons vos
            photos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="photo-validation-page">
      <div className="photo-validation-shell">

        {/* BRAND */}

        <header className="photo-validation-brand">
          <div className="photo-validation-brand-mark">
            P
          </div>

          <span>
            Portrélia
          </span>
        </header>

        <main className="photo-validation-card">

          {/* PROGRESS */}

          <div className="participant-progress">
            <div className="participant-progress-item completed">
              <div className="participant-progress-number">
                <FiCheckCircle />
              </div>

              <span>
                Guide
              </span>
            </div>

            <div className="participant-progress-line completed" />

            <div className="participant-progress-item completed">
              <div className="participant-progress-number">
                <FiCheckCircle />
              </div>

              <span>
                Photos
              </span>
            </div>

            <div className="participant-progress-line completed" />

            <div className="participant-progress-item active">
              <div className="participant-progress-number">
                3
              </div>

              <span>
                Validation
              </span>
            </div>
          </div>

          {/* HERO */}

          <section className="photo-validation-hero">
            <div className="photo-validation-icon">
              <FiCheckCircle />
            </div>

            <span className="photo-validation-kicker">
              ÉTAPE 3 SUR 3
            </span>

            <h1>
              Vérifiez avant l'envoi
            </h1>

            <p>
              Vérifiez une dernière
              fois vos photos avant
              de confirmer. Après
              validation, elles seront
              contrôlées par Portrélia
              avant le lancement de
              la génération de vos
              portraits.
            </p>

            {participant?.firstName && (
              <span className="photo-validation-participant">
                Parcours de{" "}

                <strong>
                  {
                    participant.firstName
                  }{" "}
                  {
                    participant.lastName ||
                    ""
                  }
                </strong>
              </span>
            )}
          </section>

          {/* ERROR */}

          {error && (
            <div className="photo-validation-inline-error">
              <FiAlertTriangle />

              <span>
                {error}
              </span>
            </div>
          )}

          {/* PHOTOS */}

          <section className="photo-validation-photos">
            <div className="photo-validation-photos-header">
              <div>
                <span className="photo-validation-section-label">
                  VOS PHOTOS
                </span>

                <h2>
                  {photos.length} photo
                  {photos.length > 1
                    ? "s"
                    : ""}{" "}
                  sélectionnée
                  {photos.length > 1
                    ? "s"
                    : ""}
                </h2>
              </div>

              <div
                className={`photo-validation-count ${
                  validPhotoCount
                    ? "valid"
                    : "invalid"
                }`}
              >
                {validPhotoCount ? (
                  <FiCheckCircle />
                ) : (
                  <FiAlertTriangle />
                )}

                <span>
                  {photos.length}/
                  {MIN_PHOTOS} minimum
                </span>
              </div>
            </div>

            {photos.length > 0 ? (
              <div className="photo-validation-photo-grid">
                {photos.map(
                  (
                    photo,
                    index
                  ) => {
                    const broken =
                      brokenPhotos.has(
                        photo.id
                      );

                    const imageAvailable =
                      Boolean(
                        photo.imageUrl
                      ) &&
                      photo.fileAvailable !==
                        false &&
                      !broken;

                    return (
                      <article
                        key={
                          photo.id
                        }
                        className="photo-validation-photo-card"
                      >
                        <div className="photo-validation-photo">

                          {imageAvailable ? (
                            <img
                              src={
                                photo.imageUrl
                              }
                              alt={`Photo ${
                                index +
                                1
                              }`}
                              loading="lazy"
                              onError={() =>
                                handleImageError(
                                  photo.id
                                )
                              }
                            />
                          ) : (
                            <div className="photo-validation-photo-unavailable">
                              <FiImage />

                              <span>
                                Image
                                indisponible
                              </span>
                            </div>
                          )}

                          <span className="photo-validation-photo-number">
                            {index +
                              1}
                          </span>

                          {photo.storageProvider ===
                            "SUPABASE" &&
                            imageAvailable && (
                              <span className="photo-validation-storage-badge">
                                Sécurisée
                              </span>
                            )}
                        </div>
                      </article>
                    );
                  }
                )}
              </div>
            ) : (
              <div className="photo-validation-no-photos">
                <FiImage />

                <strong>
                  Aucune photo
                  enregistrée
                </strong>

                <span>
                  Revenez à l'étape
                  précédente pour
                  ajouter vos photos.
                </span>
              </div>
            )}
          </section>

          {/* CONTENT */}

          <div className="photo-validation-layout">

            {/* LEFT */}

            <section className="photo-validation-summary">
              <h2>
                Votre parcours
              </h2>

              <div className="photo-validation-row">
                <div className="photo-validation-row-icon completed">
                  <FiCheckCircle />
                </div>

                <div>
                  <strong>
                    Guide photo
                    consulté
                  </strong>

                  <span>
                    Vous avez pris
                    connaissance des
                    recommandations
                    Portrélia.
                  </span>
                </div>
              </div>

              <div className="photo-validation-row">
                <div
                  className={`photo-validation-row-icon ${
                    validPhotoCount
                      ? "completed"
                      : "pending"
                  }`}
                >
                  {validPhotoCount ? (
                    <FiCheckCircle />
                  ) : (
                    <FiImage />
                  )}
                </div>

                <div>
                  <strong>
                    Photos sélectionnées
                  </strong>

                  <span>
                    {photos.length} photo
                    {photos.length > 1
                      ? "s"
                      : ""}{" "}
                    enregistrée
                    {photos.length > 1
                      ? "s"
                      : ""}
                    . Entre{" "}
                    {MIN_PHOTOS} et{" "}
                    {MAX_PHOTOS} sont
                    nécessaires.
                  </span>
                </div>
              </div>

              <div className="photo-validation-row">
                <div className="photo-validation-row-icon pending">
                  <FiClock />
                </div>

                <div>
                  <strong>
                    Contrôle des
                    entrées
                  </strong>

                  <span>
                    Après confirmation,
                    les photos seront
                    vérifiées avant le
                    lancement de la
                    génération.
                  </span>
                </div>
              </div>

              <div className="photo-validation-row">
                <div className="photo-validation-row-icon pending">
                  <FiShield />
                </div>

                <div>
                  <strong>
                    Génération et QA
                    Portrélia
                  </strong>

                  <span>
                    Les portraits seront
                    générés dans le style
                    choisi puis contrôlés
                    avant publication.
                  </span>
                </div>
              </div>
            </section>

            {/* RIGHT */}

            <aside className="photo-validation-info">
              <span className="photo-validation-info-title">
                Après votre envoi
              </span>

              <div className="photo-validation-info-item">
                <strong>
                  1. Contrôle des
                  photos
                </strong>

                <span>
                  Nous vérifions que vos
                  photos sont suffisamment
                  nettes et exploitables.
                </span>
              </div>

              <div className="photo-validation-info-item">
                <strong>
                  2. Génération
                </strong>

                <span>
                  Vos portraits sont
                  générés selon le style
                  défini par votre
                  entreprise.
                </span>
              </div>

              <div className="photo-validation-info-item">
                <strong>
                  3. Contrôle qualité
                </strong>

                <span>
                  L'équipe Portrélia
                  vérifie la ressemblance,
                  les artefacts, le teint
                  et la cohérence.
                </span>
              </div>

              <div className="photo-validation-info-item">
                <strong>
                  4. Galerie privée
                </strong>

                <span>
                  Seuls les portraits
                  validés par le QA seront
                  publiés dans votre
                  galerie privée.
                </span>
              </div>

              <div className="photo-validation-info-item">
                <strong>
                  5. Choix final
                </strong>

                <span>
                  Vous choisirez ensuite
                  votre portrait final
                  parmi les propositions
                  validées.
                </span>
              </div>
            </aside>
          </div>

          {/* PRIVACY */}

          <div className="photo-validation-notice">
            <FiShield />

            <div>
              <strong>
                Vos photos restent
                privées
              </strong>

              <span>
                Elles sont utilisées
                uniquement pour la
                création, le contrôle
                et la livraison de vos
                portraits Portrélia.
              </span>
            </div>
          </div>

          {/* ACTIONS */}

          <div className="photo-validation-actions">
            <button
              type="button"
              className="photo-validation-back"
              onClick={
                handleBack
              }
              disabled={
                submitting
              }
            >
              <FiArrowLeft />

              Modifier mes photos
            </button>

            <button
              type="button"
              className="photo-validation-confirm"
              onClick={
                handleConfirm
              }
              disabled={
                submitting ||
                !validPhotoCount
              }
            >
              {submitting
                ? "Envoi en cours..."
                : "Confirmer et envoyer"}

              {!submitting && (
                <FiArrowRight />
              )}
            </button>
          </div>
        </main>

        <footer className="photo-validation-footer">
          <span>
            © 2026 Portrélia
          </span>

          <span>
            Portraits professionnels
            pour les équipes.
          </span>
        </footer>
      </div>
    </div>
  );
}

export default PhotoValidationPage;