import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
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
  FiCheck,
  FiImage,
  FiPlus,
  FiRefreshCw,
  FiTrash2,
  FiUploadCloud,
} from "react-icons/fi";

import api from "../../services/api";
import "./PhotoUploadPage.css";

const MIN_PHOTOS = 6;
const MAX_PHOTOS = 12;

const MAX_FILE_SIZE =
  8 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

function PhotoUploadPage() {
  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();

  const token =
    searchParams.get("token");

  const fileInputRef =
    useRef(null);

  const [photos, setPhotos] =
    useState([]);

  const [loading, setLoading] =
    useState(Boolean(token));

  const [uploading, setUploading] =
    useState(false);

  const [
    deletingPhotoId,
    setDeletingPhotoId,
  ] = useState(null);

  const [locked, setLocked] =
    useState(false);

  const [error, setError] =
    useState("");

  const [
    brokenPhotos,
    setBrokenPhotos,
  ] = useState(
    () => new Set()
  );

  /*
   * =========================================================
   * CALCULS
   * =========================================================
   */

  const canContinue =
    photos.length >= MIN_PHOTOS &&
    photos.length <= MAX_PHOTOS &&
    !uploading &&
    !locked;

  const remainingPhotos =
    useMemo(
      () =>
        Math.max(
          MAX_PHOTOS -
            photos.length,
          0
        ),
      [photos.length]
    );

  /*
   * =========================================================
   * FETCH PHOTOS
   * =========================================================
   *
   * Important :
   * cette fonction ne fait AUCUN setState.
   *
   * Elle retourne seulement les données API.
   *
   * Ça évite le warning :
   * react-hooks/set-state-in-effect
   */
  const fetchPhotos =
    useCallback(
      async ({ signal } = {}) => {
        if (!token) {
          return {
            photos: [],
            locked: false,
          };
        }

        const response =
          await api.get(
            `/participant/invitations/${encodeURIComponent(
              token
            )}/photos`,
            signal
              ? {
                  signal,
                }
              : undefined
          );

        const data =
          response.data?.data ||
          {};

        return {
          photos:
            Array.isArray(
              data.photos
            )
              ? data.photos
              : [],

          locked:
            Boolean(
              data.locked
            ),
        };
      },
      [token]
    );

  /*
   * =========================================================
   * APPLICATION DES DONNÉES
   * =========================================================
   */
  const applyPhotosData =
    useCallback((data) => {
      setPhotos(
        Array.isArray(
          data?.photos
        )
          ? data.photos
          : []
      );

      setLocked(
        Boolean(
          data?.locked
        )
      );

      setBrokenPhotos(
        new Set()
      );
    }, []);

  /*
   * =========================================================
   * CHARGEMENT INITIAL
   * =========================================================
   */
  useEffect(() => {
    if (!token) {
      return undefined;
    }

    const controller =
      new AbortController();

    let active = true;

    fetchPhotos({
      signal:
        controller.signal,
    })
      .then((data) => {
        if (!active) {
          return;
        }

        applyPhotosData(data);

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
            "GET PHOTOS ERROR :",
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
  }, [
    token,
    fetchPhotos,
    applyPhotosData,
  ]);

  /*
   * =========================================================
   * REFRESH APRÈS UPLOAD / DELETE
   * =========================================================
   */
  const refreshPhotos =
    useCallback(async () => {
      const data =
        await fetchPhotos();

      applyPhotosData(data);

      return data;
    }, [
      fetchPhotos,
      applyPhotosData,
    ]);

  /*
   * =========================================================
   * NAVIGATION
   * =========================================================
   */

  const handleBack = () => {
    navigate(
      `/invitation/guide-photo?token=${encodeURIComponent(
        token
      )}`
    );
  };

  const handleNext = () => {
    if (
      photos.length <
      MIN_PHOTOS
    ) {
      setError(
        `Ajoutez au moins ${MIN_PHOTOS} photos pour continuer.`
      );

      return;
    }

    if (
      photos.length >
      MAX_PHOTOS
    ) {
      setError(
        `${MAX_PHOTOS} photos maximum sont autorisées.`
      );

      return;
    }

    navigate(
      `/invitation/validation?token=${encodeURIComponent(
        token
      )}`
    );
  };

  /*
   * =========================================================
   * FILE PICKER
   * =========================================================
   */

  const openFilePicker =
    () => {
      if (
        locked ||
        uploading
      ) {
        return;
      }

      fileInputRef.current?.click();
    };

  /*
   * =========================================================
   * UPLOAD
   * =========================================================
   */

  const handleFiles = async (
    fileList
  ) => {
    if (
      locked ||
      uploading
    ) {
      return;
    }

    const selectedFiles =
      Array.from(
        fileList || []
      );

    if (
      selectedFiles.length ===
      0
    ) {
      return;
    }

    setError("");

    const availableSlots =
      MAX_PHOTOS -
      photos.length;

    if (
      availableSlots <= 0
    ) {
      setError(
        `Vous pouvez envoyer jusqu'à ${MAX_PHOTOS} photos maximum.`
      );

      return;
    }

    const filesToCheck =
      selectedFiles.slice(
        0,
        availableSlots
      );

    const acceptedFiles = [];

    for (
      const file
      of filesToCheck
    ) {
      if (
        !ALLOWED_TYPES.includes(
          file.type
        )
      ) {
        setError(
          "Seuls les fichiers JPG, PNG et WEBP sont acceptés."
        );

        continue;
      }

      if (
        file.size >
        MAX_FILE_SIZE
      ) {
        setError(
          "Chaque photo doit faire moins de 8 Mo."
        );

        continue;
      }

      acceptedFiles.push(
        file
      );
    }

    if (
      acceptedFiles.length ===
      0
    ) {
      return;
    }

    const formData =
      new FormData();

    acceptedFiles.forEach(
      (file) => {
        formData.append(
          "photos",
          file
        );
      }
    );

    try {
      setUploading(true);

      await api.post(
        `/participant/invitations/${encodeURIComponent(
          token
        )}/photos`,
        formData
      );

      /*
       * On recharge immédiatement
       * les données serveur.
       *
       * Le backend renverra alors :
       * photo.imageUrl
       *
       * avec la signed URL Supabase.
       */
      await refreshPhotos();

      setError("");
    } catch (uploadError) {
      console.error(
        "UPLOAD ERROR :",
        uploadError
      );

      setError(
        uploadError.response
          ?.data?.message ||
          "Impossible d'envoyer les photos."
      );
    } finally {
      setUploading(false);
    }
  };

  /*
   * =========================================================
   * INPUT
   * =========================================================
   */

  const handleInputChange =
    async (event) => {
      /*
       * On copie d'abord
       * le FileList.
       *
       * Puis seulement
       * on vide l'input.
       */
      const files =
        Array.from(
          event.target.files ||
            []
        );

      event.target.value =
        "";

      await handleFiles(
        files
      );
    };

  /*
   * =========================================================
   * DRAG & DROP
   * =========================================================
   */

  const handleDrop =
    async (event) => {
      event.preventDefault();

      if (
        locked ||
        uploading
      ) {
        return;
      }

      const files =
        Array.from(
          event.dataTransfer
            .files || []
        );

      await handleFiles(
        files
      );
    };

  const handleDragOver =
    (event) => {
      event.preventDefault();
    };

  /*
   * =========================================================
   * SUPPRESSION PHOTO
   * =========================================================
   *
   * Le backend devra supprimer :
   *
   * - fichier Supabase Storage
   * - ligne PostgreSQL
   */
  const removePhoto =
    async (photoId) => {
      if (
        locked ||
        deletingPhotoId !==
          null
      ) {
        return;
      }

      try {
        setDeletingPhotoId(
          photoId
        );

        setError("");

        await api.delete(
          `/participant/invitations/${encodeURIComponent(
            token
          )}/photos/${photoId}`
        );

        /*
         * Recharge serveur
         * après suppression.
         */
        await refreshPhotos();
      } catch (deleteError) {
        console.error(
          "DELETE PHOTO ERROR :",
          deleteError
        );

        setError(
          deleteError.response
            ?.data?.message ||
            "Impossible de supprimer cette photo."
        );
      } finally {
        setDeletingPhotoId(
          null
        );
      }
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
            new Set(current);

          next.add(
            photoId
          );

          return next;
        }
      );
    };

  /*
   * =========================================================
   * TOKEN ABSENT
   * =========================================================
   */

  if (!token) {
    return (
      <div className="photo-upload-page photo-upload-centered">
        <div className="photo-upload-error-card">
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
      <div className="photo-upload-page photo-upload-centered">
        <div className="photo-upload-error-card">
          <FiRefreshCw className="photo-upload-loading-icon" />

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

  /*
   * =========================================================
   * PAGE
   * =========================================================
   */

  return (
    <div className="photo-upload-page">
      <div className="photo-upload-shell">

        {/* BRAND */}

        <header className="photo-upload-brand">
          <div className="photo-upload-brand-mark">
            P
          </div>

          <span>
            Portrélia
          </span>
        </header>

        <main className="photo-upload-card">

          {/* PROGRESS */}

          <div className="participant-progress">
            <div className="participant-progress-item completed">
              <div className="participant-progress-number">
                <FiCheck />
              </div>

              <span>
                Guide
              </span>
            </div>

            <div className="participant-progress-line completed" />

            <div className="participant-progress-item active">
              <div className="participant-progress-number">
                2
              </div>

              <span>
                Photos
              </span>
            </div>

            <div className="participant-progress-line" />

            <div className="participant-progress-item">
              <div className="participant-progress-number">
                3
              </div>

              <span>
                Validation
              </span>
            </div>
          </div>

          {/* HEADING */}

          <div className="photo-upload-heading">
            <span className="photo-upload-kicker">
              ÉTAPE 2 SUR 3
            </span>

            <h1>
              Ajoutez vos photos
            </h1>

            <p>
              Importez entre 6 et
              12 photos récentes.
              Choisissez des images
              nettes, naturelles et
              suffisamment
              différentes pour
              permettre la création
              d'un portrait fidèle et
              cohérent.
            </p>
          </div>

          <div className="photo-upload-layout">

            {/* LEFT */}

            <section className="photo-upload-main">

              {/* DROPZONE */}

              {!locked && (
                <div
                  className={`photo-upload-dropzone ${
                    uploading
                      ? "uploading"
                      : ""
                  }`}
                  onClick={
                    openFilePicker
                  }
                  onDrop={
                    handleDrop
                  }
                  onDragOver={
                    handleDragOver
                  }
                  role="button"
                  tabIndex={0}
                  onKeyDown={(
                    event
                  ) => {
                    if (
                      event.key ===
                        "Enter" ||
                      event.key ===
                        " "
                    ) {
                      openFilePicker();
                    }
                  }}
                >
                  <div className="photo-upload-dropzone-icon">
                    {uploading ? (
                      <FiRefreshCw className="photo-upload-spin" />
                    ) : (
                      <FiUploadCloud />
                    )}
                  </div>

                  <strong>
                    {uploading
                      ? "Envoi sécurisé en cours..."
                      : "Glissez vos photos ici"}
                  </strong>

                  {!uploading && (
                    <>
                      <span>
                        ou cliquez pour
                        parcourir vos
                        fichiers
                      </span>

                      <button
                        type="button"
                        className="photo-upload-select-btn"
                        onClick={(
                          event
                        ) => {
                          event.stopPropagation();

                          openFilePicker();
                        }}
                      >
                        <FiPlus />

                        Sélectionner
                        des photos
                      </button>
                    </>
                  )}

                  <small>
                    JPG, JPEG, PNG ou
                    WEBP • 8 Mo maximum
                    par photo
                  </small>

                  <input
                    ref={
                      fileInputRef
                    }
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="photo-upload-input"
                    onChange={
                      handleInputChange
                    }
                    disabled={
                      uploading
                    }
                  />
                </div>
              )}

              {/* LOCKED */}

              {locked && (
                <div className="photo-upload-message locked">
                  <FiCheck />

                  <span>
                    Vos photos ont
                    été confirmées.
                    Elles ne peuvent
                    plus être
                    modifiées.
                  </span>
                </div>
              )}

              {/* ERROR */}

              {error && (
                <div className="photo-upload-message error">
                  <FiAlertTriangle />

                  <span>
                    {error}
                  </span>
                </div>
              )}

              {/* PHOTOS */}

              {photos.length >
                0 && (
                <div className="photo-upload-selection">

                  <div className="photo-upload-selection-header">
                    <div>
                      <strong>
                        Vos photos
                      </strong>

                      <span>
                        {
                          photos.length
                        }{" "}
                        /{" "}
                        {
                          MAX_PHOTOS
                        }{" "}
                        ajoutées
                      </span>
                    </div>

                    {!locked &&
                      !uploading &&
                      remainingPhotos >
                        0 && (
                        <button
                          type="button"
                          className="photo-upload-add-more"
                          onClick={
                            openFilePicker
                          }
                        >
                          <FiPlus />

                          Ajouter
                        </button>
                      )}
                  </div>

                  <div className="photo-upload-grid">

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
                          !broken;

                        return (
                          <article
                            className="photo-upload-preview-card"
                            key={
                              photo.id
                            }
                          >
                            <div className="photo-upload-preview">

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
                                <div className="photo-upload-preview-unavailable">
                                  <FiImage />

                                  <span>
                                    Image
                                    indisponible
                                  </span>
                                </div>
                              )}

                              <span className="photo-upload-preview-number">
                                {index +
                                  1}
                              </span>

                              {!locked && (
                                <button
                                  type="button"
                                  className="photo-upload-remove"
                                  onClick={() =>
                                    removePhoto(
                                      photo.id
                                    )
                                  }
                                  disabled={
                                    deletingPhotoId ===
                                    photo.id
                                  }
                                  aria-label={`Supprimer la photo ${
                                    index +
                                    1
                                  }`}
                                >
                                  {deletingPhotoId ===
                                  photo.id ? (
                                    <FiRefreshCw className="photo-upload-spin" />
                                  ) : (
                                    <FiTrash2 />
                                  )}
                                </button>
                              )}

                              {photo.storageProvider ===
                                "SUPABASE" &&
                                imageAvailable && (
                                  <span className="photo-upload-storage-badge">
                                    Sécurisée
                                  </span>
                                )}
                            </div>
                          </article>
                        );
                      }
                    )}

                    {!locked &&
                      !uploading &&
                      remainingPhotos >
                        0 && (
                        <button
                          type="button"
                          className="photo-upload-empty-slot"
                          onClick={
                            openFilePicker
                          }
                        >
                          <FiPlus />

                          <span>
                            Ajouter
                          </span>
                        </button>
                      )}
                  </div>
                </div>
              )}
            </section>

            {/* RIGHT */}

            <aside className="photo-upload-sidebar">
              <span className="photo-upload-sidebar-title">
                Avant d'envoyer
              </span>

              <div className="photo-upload-rule">
                <FiImage />

                <div>
                  <strong>
                    6 à 12 photos
                  </strong>

                  <span>
                    Plusieurs angles
                    permettent
                    d'obtenir un
                    résultat plus
                    fidèle.
                  </span>
                </div>
              </div>

              <div className="photo-upload-rule">
                <FiCheck />

                <div>
                  <strong>
                    Visage bien
                    visible
                  </strong>

                  <span>
                    Le visage doit être
                    net, dégagé et
                    suffisamment grand.
                  </span>
                </div>
              </div>

              <div className="photo-upload-rule">
                <FiCheck />

                <div>
                  <strong>
                    Photos récentes
                  </strong>

                  <span>
                    Choisissez des
                    photos qui
                    correspondent à
                    votre apparence
                    actuelle.
                  </span>
                </div>
              </div>

              <div className="photo-upload-rule">
                <FiCheck />

                <div>
                  <strong>
                    Photos variées
                  </strong>

                  <span>
                    Mélangez vue de
                    face et légers
                    angles, sans
                    filtre.
                  </span>
                </div>
              </div>

              <div className="photo-upload-count-card">
                <span>
                  Progression
                </span>

                <strong>
                  {
                    photos.length
                  }
                  /
                  {MIN_PHOTOS}{" "}
                  minimum
                </strong>

                <div className="photo-upload-count-progress">
                  <div
                    className="photo-upload-count-progress-value"
                    style={{
                      width: `${Math.min(
                        (photos.length /
                          MIN_PHOTOS) *
                          100,
                        100
                      )}%`,
                    }}
                  />
                </div>

                <small>
                  {photos.length >=
                  MIN_PHOTOS
                    ? "Vous pouvez continuer."
                    : `${
                        MIN_PHOTOS -
                        photos.length
                      } photo(s) minimum restante(s).`}
                </small>
              </div>
            </aside>
          </div>

          {/* ACTIONS */}

          <div className="photo-upload-actions">
            <button
              type="button"
              className="photo-upload-back"
              onClick={
                handleBack
              }
              disabled={
                uploading
              }
            >
              <FiArrowLeft />

              Retour
            </button>

            <button
              type="button"
              className="photo-upload-next"
              onClick={
                handleNext
              }
              disabled={
                !canContinue
              }
            >
              Continuer

              <FiArrowRight />
            </button>
          </div>
        </main>

        <footer className="photo-upload-footer">
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

export default PhotoUploadPage;