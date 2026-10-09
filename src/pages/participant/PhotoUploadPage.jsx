import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiImage,
  FiPlus,
  FiTrash2,
  FiUploadCloud,
  FiAlertTriangle,
  FiRefreshCw,
} from "react-icons/fi";

import api from "../../services/api";
import "./PhotoUploadPage.css";

function PhotoUploadPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const fileInputRef = useRef(null);

  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(() => Boolean(token));
  const [uploading, setUploading] = useState(false);
  const [deletingPhotoId, setDeletingPhotoId] = useState(null);
  const [locked, setLocked] = useState(false);
  const [error, setError] = useState("");

  const MIN_PHOTOS = 6;
  const MAX_PHOTOS = 12;
  const MAX_FILE_SIZE = 8 * 1024 * 1024;

  /*
   * Base URL utilisée pour afficher
   * les photos privées via le backend.
   */
  const apiBaseUrl = (
    api.defaults.baseURL ||
    "http://localhost:5001"
  ).replace(/\/$/, "");

  const canContinue =
    photos.length >= MIN_PHOTOS &&
    photos.length <= MAX_PHOTOS &&
    !uploading &&
    !locked;

  const remainingPhotos = useMemo(() => {
    return Math.max(MAX_PHOTOS - photos.length, 0);
  }, [photos.length]);

  /*
   * =========================================================
   * CHARGEMENT DES PHOTOS EXISTANTES
   * =========================================================
   *
   * Les photos sont récupérées depuis la base.
   * Un refresh ne les fait donc plus disparaître.
   */
  useEffect(() => {
    if (!token) {
      return;
    }

    console.log("GET PHOTOS START :", token);

    const controller = new AbortController();

    api
      .get(
        `/participant/invitations/${token}/photos`,
        {
          signal: controller.signal,
        }
      )
      .then((response) => {
        console.log(
          "GET PHOTOS SUCCESS :",
          response.data
        );

        const data = response.data?.data || {};

        setPhotos(
          Array.isArray(data.photos)
            ? data.photos
            : []
        );

        setLocked(Boolean(data.locked));
        setError("");
      })
      .catch((error) => {
        if (
          error.code === "ERR_CANCELED" ||
          error.name === "CanceledError"
        ) {
          return;
        }

        console.error(
          "GET PHOTOS ERROR :",
          error
        );

        console.error(
          "GET PHOTOS ERROR RESPONSE :",
          error.response?.data
        );

        setError(
          error.response?.data?.message ||
          "Impossible de charger vos photos."
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [token]);

  /*
   * URL sécurisée d'une photo.
   */
  const getPhotoUrl = (photoId) => {
    return `${apiBaseUrl}/participant/invitations/${encodeURIComponent(
      token
    )}/photos/${photoId}/file`;
  };

  /*
   * =========================================================
   * NAVIGATION
   * =========================================================
   */
  const handleBack = () => {
    navigate(
      `/invitation/guide-photo?token=${token}`
    );
  };

  const handleNext = () => {
    if (photos.length < MIN_PHOTOS) {
      setError(
        `Ajoutez au moins ${MIN_PHOTOS} photos pour continuer.`
      );
      return;
    }

    if (photos.length > MAX_PHOTOS) {
      setError(
        `${MAX_PHOTOS} photos maximum sont autorisées.`
      );
      return;
    }

    navigate(
      `/invitation/validation?token=${token}`
    );
  };

  /*
   * =========================================================
   * OUVERTURE DU SÉLECTEUR
   * =========================================================
   */
  const openFilePicker = () => {
    if (locked || uploading) {
      return;
    }

    fileInputRef.current?.click();
  };

  /*
   * =========================================================
   * VRAI UPLOAD API
   * =========================================================
   *
   * Les fichiers arrivent ici déjà copiés
   * dans un tableau JavaScript.
   */
  const handleFiles = async (fileList) => {
    if (locked || uploading) {
      return;
    }

    /*
     * IMPORTANT :
     * on transforme immédiatement le FileList
     * en Array afin qu'il ne soit plus lié
     * à l'input HTML.
     */
    const selectedFiles = Array.from(
      fileList || []
    );

    console.log(
      "SELECTED FILES :",
      selectedFiles
    );

    if (selectedFiles.length === 0) {
      return;
    }

    setError("");

    const availableSlots =
      MAX_PHOTOS - photos.length;

    if (availableSlots <= 0) {
      setError(
        `Vous pouvez envoyer jusqu'à ${MAX_PHOTOS} photos maximum.`
      );
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    const acceptedFiles = [];

    for (
      const file of selectedFiles.slice(
        0,
        availableSlots
      )
    ) {
      console.log(
        "CHECK FILE :",
        {
          name: file.name,
          type: file.type,
          size: file.size,
        }
      );

      if (!allowedTypes.includes(file.type)) {
        setError(
          "Seuls les fichiers JPG, PNG et WEBP sont acceptés."
        );
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError(
          "Chaque photo doit faire moins de 8 Mo."
        );
        continue;
      }

      acceptedFiles.push(file);
    }

    console.log(
      "ACCEPTED FILES :",
      acceptedFiles
    );

    if (acceptedFiles.length === 0) {
      return;
    }

    const formData = new FormData();

    acceptedFiles.forEach((file) => {
      formData.append(
        "photos",
        file
      );
    });

    const uploadUrl =
      `/participant/invitations/${token}/photos`;

    console.log(
      "UPLOAD URL :",
      uploadUrl
    );

    try {
      setUploading(true);

      const response = await api.post(
        uploadUrl,
        formData
      );

      console.log(
        "UPLOAD SUCCESS :",
        response.data
      );

      const createdPhotos =
        response.data?.data?.photos || [];

      if (!Array.isArray(createdPhotos)) {
        throw new Error(
          "Réponse upload invalide"
        );
      }

      setPhotos((currentPhotos) => [
        ...currentPhotos,
        ...createdPhotos,
      ]);

      setError("");
    } catch (error) {
      console.error(
        "UPLOAD ERROR :",
        error
      );

      console.error(
        "UPLOAD ERROR STATUS :",
        error.response?.status
      );

      console.error(
        "UPLOAD ERROR RESPONSE :",
        error.response?.data
      );

      setError(
        error.response?.data?.message ||
        "Impossible d'envoyer les photos."
      );
    } finally {
      setUploading(false);
    }
  };

  /*
   * =========================================================
   * INPUT FILE
   * =========================================================
   *
   * CORRECTION IMPORTANTE :
   *
   * On copie d'abord event.target.files
   * dans un vrai Array.
   *
   * Ensuite seulement on vide l'input.
   *
   * Avant, l'input était vidé avant l'upload,
   * ce qui transformait le FileList en liste vide.
   */
  const handleInputChange = async (event) => {
    const files = Array.from(
      event.target.files || []
    );

    console.log(
      "INPUT CHANGE FILES :",
      files
    );

    /*
     * On peut maintenant vider l'input
     * sans perdre les fichiers.
     */
    event.target.value = "";

    await handleFiles(files);
  };

  /*
   * Drag & drop.
   */
  const handleDrop = async (event) => {
    event.preventDefault();

    const files = Array.from(
      event.dataTransfer.files || []
    );

    console.log(
      "DROP FILES :",
      files
    );

    await handleFiles(files);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  /*
   * =========================================================
   * VRAIE SUPPRESSION API
   * =========================================================
   *
   * La corbeille supprime réellement :
   * - la ligne input_photos
   * - le fichier physique
   */
  const removePhoto = async (photoId) => {
    if (
      locked ||
      deletingPhotoId !== null
    ) {
      return;
    }

    try {
      setDeletingPhotoId(photoId);
      setError("");

      const response =
        await api.delete(
          `/participant/invitations/${token}/photos/${photoId}`
        );

      console.log(
        "DELETE SUCCESS :",
        response.data
      );

      setPhotos((currentPhotos) =>
        currentPhotos.filter(
          (photo) =>
            photo.id !== photoId
        )
      );
    } catch (error) {
      console.error(
        "DELETE ERROR :",
        error
      );

      console.error(
        "DELETE ERROR RESPONSE :",
        error.response?.data
      );

      setError(
        error.response?.data?.message ||
        "Impossible de supprimer cette photo."
      );
    } finally {
      setDeletingPhotoId(null);
    }
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
            Le token d'invitation est manquant.
          </p>
        </div>
      </div>
    );
  }

  /*
   * =========================================================
   * CHARGEMENT
   * =========================================================
   */
  if (loading) {
    return (
      <div className="photo-upload-page photo-upload-centered">
        <div className="photo-upload-error-card">
          <FiRefreshCw />

          <h1>
            Chargement...
          </h1>

          <p>
            Nous récupérons vos photos.
          </p>
        </div>
      </div>
    );
  }

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
              Importez entre 6 et 12 photos récentes. Choisissez des images
              nettes, naturelles et suffisamment différentes pour permettre
              la création d'un portrait fidèle et cohérent.
            </p>
          </div>

          <div className="photo-upload-layout">

            {/* LEFT */}
            <section className="photo-upload-main">

              {/* DROPZONE */}
              {!locked && (
                <div
                  className="photo-upload-dropzone"
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
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" ||
                      event.key === " "
                    ) {
                      openFilePicker();
                    }
                  }}
                >
                  <div className="photo-upload-dropzone-icon">
                    <FiUploadCloud />
                  </div>

                  <strong>
                    {uploading
                      ? "Envoi en cours..."
                      : "Glissez vos photos ici"}
                  </strong>

                  {!uploading && (
                    <>
                      <span>
                        ou cliquez pour parcourir vos fichiers
                      </span>

                      <button
                        type="button"
                        className="photo-upload-select-btn"
                        onClick={(event) => {
                          event.stopPropagation();
                          openFilePicker();
                        }}
                      >
                        <FiPlus />
                        Sélectionner des photos
                      </button>
                    </>
                  )}

                  <small>
                    JPG, JPEG, PNG ou WEBP • 8 Mo maximum par photo
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
                <div className="photo-upload-message error">
                  <FiAlertTriangle />

                  <span>
                    Vos photos ont déjà été confirmées et ne peuvent plus être modifiées.
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
              {photos.length > 0 && (
                <div className="photo-upload-selection">

                  <div className="photo-upload-selection-header">
                    <div>
                      <strong>
                        Vos photos
                      </strong>

                      <span>
                        {photos.length} / {MAX_PHOTOS} ajoutées
                      </span>
                    </div>

                    {!locked &&
                      !uploading &&
                      remainingPhotos > 0 && (
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
                      ) => (
                        <article
                          className="photo-upload-preview-card"
                          key={
                            photo.id
                          }
                        >
                          <div className="photo-upload-preview">

                            <img
                              src={getPhotoUrl(
                                photo.id
                              )}
                              alt={`Photo ${index + 1}`}
                              onLoad={() => {
                                console.log(
                                  "PHOTO LOADED :",
                                  photo.id
                                );
                              }}
                              onError={() => {
                                console.error(
                                  "PHOTO DISPLAY ERROR :",
                                  photo.id
                                );
                              }}
                            />

                            <span className="photo-upload-preview-number">
                              {index + 1}
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
                                aria-label={`Supprimer la photo ${index + 1}`}
                              >
                                <FiTrash2 />
                              </button>
                            )}

                          </div>
                        </article>
                      )
                    )}

                    {!locked &&
                      !uploading &&
                      remainingPhotos > 0 && (
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
                    Plusieurs angles permettent d'obtenir un résultat plus fidèle.
                  </span>
                </div>
              </div>

              <div className="photo-upload-rule">
                <FiCheck />

                <div>
                  <strong>
                    Visage bien visible
                  </strong>

                  <span>
                    Le visage doit être net, dégagé et suffisamment grand.
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
                    Choisissez des photos qui correspondent à votre apparence actuelle.
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
                    Mélangez vue de face et légers angles, sans filtre.
                  </span>
                </div>
              </div>

              <div className="photo-upload-count-card">
                <span>
                  Progression
                </span>

                <strong>
                  {photos.length}/{MIN_PHOTOS} minimum
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
                  {photos.length >= MIN_PHOTOS
                    ? "Vous pouvez continuer."
                    : `${MIN_PHOTOS - photos.length} photo(s) minimum restante(s).`}
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
            Portraits professionnels pour les équipes.
          </span>
        </footer>

      </div>
    </div>
  );
}

export default PhotoUploadPage;