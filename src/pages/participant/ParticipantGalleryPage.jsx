import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useParams,
} from "react-router-dom";

import {
  FiAlertTriangle,
  FiCheck,
  FiCheckCircle,
  FiImage,
  FiRefreshCw,
  FiShield,
} from "react-icons/fi";

import api from "../../services/api";

import "./ParticipantGalleryPage.css";

function ParticipantGalleryPage() {
  const {
    token,
  } = useParams();

  const [
    gallery,
    setGallery,
  ] = useState(null);

  const [
    participant,
    setParticipant,
  ] = useState(null);

  const [
    campaign,
    setCampaign,
  ] = useState(null);

  const [
    company,
    setCompany,
  ] = useState(null);

  const [
    portraits,
    setPortraits,
  ] = useState([]);

  const [
    selectedPortraitId,
    setSelectedPortraitId,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [
    brokenPortraits,
    setBrokenPortraits,
  ] = useState(
    () => new Set()
  );

  /*
   * =========================================================
   * FINAL STATE
   * =========================================================
   */

  const selectionConfirmed =
    participant
      ?.status ===
    "VALIDATED";

  /*
   * =========================================================
   * SELECTED PORTRAIT
   * =========================================================
   */

  const selectedPortrait =
    useMemo(
      () =>
        portraits.find(
          (
            portrait
          ) =>
            String(
              portrait.id
            ) ===
            String(
              selectedPortraitId
            )
        ) ||
        null,
      [
        portraits,
        selectedPortraitId,
      ]
    );

  /*
   * =========================================================
   * FINAL PORTRAIT
   * =========================================================
   */

  const finalPortrait =
    useMemo(
      () =>
        portraits.find(
          (
            portrait
          ) =>
            portrait
              .isSelectedByParticipant
        ) ||
        null,
      [
        portraits,
      ]
    );

  /*
   * =========================================================
   * APPLY DATA
   * =========================================================
   */

  const applyGalleryData =
    (
      data
    ) => {
      const loadedPortraits =
        Array.isArray(
          data
            ?.portraits
        )
          ? data.portraits
          : [];

      setGallery(
        data.gallery
      );

      setParticipant(
        data.participant ||
          null
      );

      setCampaign(
        data.campaign ||
          null
      );

      setCompany(
        data.company ||
          null
      );

      setPortraits(
        loadedPortraits
      );

      const existingSelection =
        loadedPortraits.find(
          (
            portrait
          ) =>
            portrait
              .isSelectedByParticipant
        );

      setSelectedPortraitId(
        existingSelection
          ?.id ||
          null
      );

      setBrokenPortraits(
        new Set()
      );
    };

  /*
   * =========================================================
   * INITIAL LOAD
   * =========================================================
   */

  useEffect(() => {
    let active =
      true;

    if (
      !token
    ) {
      return () => {
        active =
          false;
      };
    }

    api
      .get(
        `/participant/gallery/${token}`
      )
      .then(
        (
          response
        ) => {
          if (
            !active
          ) {
            return;
          }

          const data =
            response.data
              ?.data;

          if (
            !data
              ?.gallery
          ) {
            throw new Error(
              "Galerie introuvable."
            );
          }

          const loadedPortraits =
            Array.isArray(
              data
                .portraits
            )
              ? data.portraits
              : [];

          setGallery(
            data.gallery
          );

          setParticipant(
            data.participant ||
              null
          );

          setCampaign(
            data.campaign ||
              null
          );

          setCompany(
            data.company ||
              null
          );

          setPortraits(
            loadedPortraits
          );

          const existingSelection =
            loadedPortraits.find(
              (
                portrait
              ) =>
                portrait
                  .isSelectedByParticipant
            );

          setSelectedPortraitId(
            existingSelection
              ?.id ||
              null
          );

          setBrokenPortraits(
            new Set()
          );

          setError("");
        }
      )
      .catch(
        (
          requestError
        ) => {
          if (
            !active
          ) {
            return;
          }

          console.error(
            "PARTICIPANT GALLERY LOAD ERROR :",
            requestError
          );

          setError(
            requestError
              .response
              ?.data
              ?.message ||
              requestError
                .message ||
              "Impossible de charger votre galerie."
          );
        }
      )
      .finally(
        () => {
          if (
            active
          ) {
            setLoading(
              false
            );
          }
        }
      );

    return () => {
      active =
        false;
    };
  }, [
    token,
  ]);

  /*
   * =========================================================
   * RELOAD
   * =========================================================
   */

  const reloadGallery =
    async () => {
      if (
        !token
      ) {
        return;
      }

      try {
        setLoading(
          true
        );

        setError("");

        const response =
          await api.get(
            `/participant/gallery/${token}`
          );

        const data =
          response.data
            ?.data;

        if (
          !data
            ?.gallery
        ) {
          throw new Error(
            "Galerie introuvable."
          );
        }

        applyGalleryData(
          data
        );
      } catch (
        requestError
      ) {
        console.error(
          "PARTICIPANT GALLERY RELOAD ERROR :",
          requestError
        );

        setError(
          requestError
            .response
            ?.data
            ?.message ||
            "Impossible de charger votre galerie."
        );
      } finally {
        setLoading(
          false
        );
      }
    };

  /*
   * =========================================================
   * IMAGE ERROR
   * =========================================================
   */

  const handleImageError =
    (
      portraitId
    ) => {
      setBrokenPortraits(
        (
          current
        ) => {
          const next =
            new Set(
              current
            );

          next.add(
            portraitId
          );

          return next;
        }
      );
    };

  /*
   * =========================================================
   * SELECT PORTRAIT
   * =========================================================
   */

  const handleSelectPortrait =
    (
      portrait
    ) => {
      if (
        selectionConfirmed
      ) {
        return;
      }

      setSelectedPortraitId(
        portrait.id
      );
    };

  /*
   * =========================================================
   * CONFIRM
   * =========================================================
   */

  const confirmSelection =
    async () => {
      if (
        !selectedPortrait ||
        !token ||
        selectionConfirmed ||
        submitting
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          "Confirmer définitivement ce portrait ?"
        );

      if (
        !confirmed
      ) {
        return;
      }

      try {
        setSubmitting(
          true
        );

        setError("");

        const response =
          await api.post(
            `/participant/gallery/${token}/select`,
            {
              portraitId:
                selectedPortrait.id,
            }
          );

        if (
          !response.data
            ?.success
        ) {
          throw new Error(
            "La sélection n'a pas pu être enregistrée."
          );
        }

        /*
         * Mise à jour locale.
         */

        setPortraits(
          (
            current
          ) =>
            current.map(
              (
                portrait
              ) => ({
                ...portrait,

                isSelectedByParticipant:
                  String(
                    portrait.id
                  ) ===
                  String(
                    selectedPortrait.id
                  ),

                status:
                  String(
                    portrait.id
                  ) ===
                  String(
                    selectedPortrait.id
                  )
                    ? "SELECTED"
                    : portrait.status,
              })
            )
        );

        setParticipant(
          (
            current
          ) => ({
            ...current,

            status:
              "VALIDATED",
          })
        );

        setSuccessMessage(
          "Votre portrait final a bien été confirmé."
        );
      } catch (
        requestError
      ) {
        console.error(
          "PARTICIPANT SELECTION ERROR :",
          requestError
        );

        setError(
          requestError
            .response
            ?.data
            ?.message ||
            requestError
              .message ||
            "Impossible d'enregistrer votre choix."
        );
      } finally {
        setSubmitting(
          false
        );
      }
    };

  /*
   * =========================================================
   * FORMAT DATE
   * =========================================================
   */

  const formatDate =
    (
      value
    ) => {
      if (
        !value
      ) {
        return null;
      }

      try {
        return new Intl
          .DateTimeFormat(
            "fr-FR",
            {
              day:
                "2-digit",

              month:
                "long",

              year:
                "numeric",
            }
          )
          .format(
            new Date(
              value
            )
          );
      } catch {
        return null;
      }
    };

  /*
   * =========================================================
   * INVALID TOKEN
   * =========================================================
   */

  if (
    !token
  ) {
    return (
      <div className="participant-gallery-page participant-gallery-centered">

        <div className="participant-gallery-state-card">

          <FiAlertTriangle />

          <h1>
            Galerie invalide
          </h1>

          <p>
            Ce lien de galerie n'est pas valide.
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

  if (
    loading
  ) {
    return (
      <div className="participant-gallery-page participant-gallery-centered">

        <div className="participant-gallery-state-card">

          <FiRefreshCw className="participant-gallery-spinner" />

          <h1>
            Chargement de votre galerie
          </h1>

          <p>
            Nous préparons vos portraits.
          </p>

        </div>

      </div>
    );
  }

  /*
   * =========================================================
   * ERROR PAGE
   * =========================================================
   */

  if (
    error &&
    !gallery
  ) {
    return (
      <div className="participant-gallery-page participant-gallery-centered">

        <div className="participant-gallery-state-card">

          <FiAlertTriangle />

          <h1>
            Galerie indisponible
          </h1>

          <p>
            {
              error
            }
          </p>

          <button
            type="button"
            className="participant-gallery-retry"
            onClick={
              reloadGallery
            }
          >
            <FiRefreshCw />

            Réessayer
          </button>

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
    <div className="participant-gallery-page">

      <div className="participant-gallery-shell">

        {/* BRAND */}

        <header className="participant-gallery-brand">

          <div className="participant-gallery-brand-mark">
            P
          </div>

          <span>
            Portrélia
          </span>

        </header>

        {/* HERO */}

        <section className="participant-gallery-hero">

          <div>

            <span className="participant-gallery-kicker">

              {selectionConfirmed
                ? "VOTRE PORTRAIT FINAL"
                : "VOTRE GALERIE PERSONNELLE"}

            </span>

            <h1>
              Bonjour{" "}
              {
                participant
                  ?.firstName ||
                ""
              }
            </h1>

            <p>

              {selectionConfirmed
                ? "Votre choix final a bien été enregistré. Vous pouvez retrouver votre portrait sélectionné ci-dessous."
                : "Vos portraits professionnels sont prêts. Découvrez les propositions retenues et choisissez celle que vous préférez."}

            </p>

          </div>

          <div className="participant-gallery-secure">

            {selectionConfirmed ? (
              <>
                <FiCheckCircle />

                Choix confirmé
              </>
            ) : (
              <>
                <FiShield />

                Galerie sécurisée
              </>
            )}

          </div>

        </section>

        {/* INFO */}

        <section className="participant-gallery-info">

          <div>

            <span>
              Entreprise
            </span>

            <strong>
              {
                company
                  ?.name ||
                "Votre entreprise"
              }
            </strong>

          </div>

          <div>

            <span>
              Campagne
            </span>

            <strong>
              {
                campaign
                  ?.name ||
                "Portrait professionnel"
              }
            </strong>

          </div>

          <div>

            <span>
              Galerie disponible jusqu'au
            </span>

            <strong>
              {
                formatDate(
                  gallery
                    ?.expiresAt
                ) ||
                "—"
              }
            </strong>

          </div>

        </section>

        {/* SUCCESS */}

        {successMessage && (
          <div className="participant-gallery-success">

            <FiCheckCircle />

            <div>

              <strong>
                Choix confirmé
              </strong>

              <span>
                {
                  successMessage
                }
              </span>

            </div>

          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="participant-gallery-inline-error">

            <FiAlertTriangle />

            {
              error
            }

          </div>
        )}

        {/* ===================================================
            VALIDATED
        ==================================================== */}

        {selectionConfirmed ? (

          <section className="participant-gallery-final">

            <div className="participant-gallery-final-heading">

              <span>
                CHOIX CONFIRMÉ
              </span>

              <h2>
                Votre portrait sélectionné
              </h2>

              <p>
                Votre choix a été enregistré définitivement.
                Aucune autre action n'est nécessaire.
              </p>

            </div>

            {finalPortrait ? (

              <div className="participant-gallery-final-card">

                <div className="participant-gallery-final-image">

                  {
                    finalPortrait
                      .imageUrl &&
                    !brokenPortraits.has(
                      finalPortrait.id
                    ) ? (

                      <img
                        src={
                          finalPortrait
                            .imageUrl
                        }
                        alt="Portrait final sélectionné"
                        onError={() =>
                          handleImageError(
                            finalPortrait.id
                          )
                        }
                      />

                    ) : (

                      <div className="participant-gallery-no-image">

                        <FiImage />

                        <span>
                          Image indisponible
                        </span>

                      </div>

                    )
                  }

                  <div className="participant-gallery-final-badge">

                    <FiCheck />

                    Portrait final

                  </div>

                </div>

                <div className="participant-gallery-final-footer">

                  <FiCheckCircle />

                  <div>

                    <strong>
                      Sélection confirmée
                    </strong>

                    <span>
                      Ce portrait a été enregistré comme votre choix final.
                    </span>

                  </div>

                </div>

              </div>

            ) : (

              <div className="participant-gallery-empty">

                <FiAlertTriangle />

                <strong>
                  Portrait sélectionné indisponible
                </strong>

              </div>

            )}

          </section>

        ) : (

          <>
            {/* =================================================
                CHOICE MODE
            ================================================== */}

            <section className="participant-gallery-intro">

              <div>

                <span>
                  VOTRE SÉLECTION
                </span>

                <h2>
                  Choisissez votre portrait préféré
                </h2>

                <p>
                  Cliquez sur un portrait puis confirmez votre choix final.
                </p>

              </div>

              <strong>
                {
                  portraits.length
                }{" "}
                portrait
                {
                  portraits.length >
                  1
                    ? "s"
                    : ""
                }
              </strong>

            </section>

            {portraits.length ===
            0 ? (

              <div className="participant-gallery-empty">

                <FiImage />

                <strong>
                  Aucun portrait disponible
                </strong>

              </div>

            ) : (

              <section className="participant-gallery-grid">

                {portraits.map(
                  (
                    portrait,
                    index
                  ) => {
                    const selected =
                      String(
                        selectedPortraitId
                      ) ===
                      String(
                        portrait.id
                      );

                    const broken =
                      brokenPortraits.has(
                        portrait.id
                      );

                    const available =
                      Boolean(
                        portrait
                          .imageUrl
                      ) &&
                      !broken;

                    return (
                      <button
                        key={
                          portrait.id
                        }
                        type="button"
                        className={`participant-gallery-card ${
                          selected
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          handleSelectPortrait(
                            portrait
                          )
                        }
                      >

                        <div className="participant-gallery-image">

                          {available ? (

                            <img
                              src={
                                portrait
                                  .imageUrl
                              }
                              alt={`Portrait ${
                                index +
                                1
                              }`}
                              onError={() =>
                                handleImageError(
                                  portrait.id
                                )
                              }
                            />

                          ) : (

                            <div className="participant-gallery-no-image">

                              <FiImage />

                              <span>
                                Image indisponible
                              </span>

                            </div>

                          )}

                          {selected && (

                            <div className="participant-gallery-selected-badge">

                              <FiCheck />

                              Sélectionné

                            </div>

                          )}

                        </div>

                        <div className="participant-gallery-card-footer">

                          <div>

                            <strong>
                              Portrait{" "}
                              {
                                index +
                                1
                              }
                            </strong>

                            <span>

                              {selected
                                ? "Votre choix actuel"
                                : "Sélectionner ce portrait"}

                            </span>

                          </div>

                          <span
                            className={`participant-gallery-radio ${
                              selected
                                ? "active"
                                : ""
                            }`}
                          >

                            {
                              selected &&
                              <FiCheck />
                            }

                          </span>

                        </div>

                      </button>
                    );
                  }
                )}

              </section>
            )}

            {/* CONFIRM */}

            {selectedPortrait && (

              <section className="participant-gallery-selection">

                <div className="participant-gallery-selection-icon">

                  <FiCheckCircle />

                </div>

                <div className="participant-gallery-selection-copy">

                  <span>
                    PORTRAIT SÉLECTIONNÉ
                  </span>

                  <h2>
                    Votre choix est prêt
                  </h2>

                  <p>
                    Vérifiez votre portrait puis confirmez votre choix.
                  </p>

                </div>

                <button
                  type="button"
                  className="participant-gallery-confirm"
                  disabled={
                    submitting
                  }
                  onClick={
                    confirmSelection
                  }
                >

                  {submitting ? (
                    <>
                      <FiRefreshCw className="participant-gallery-spinner-small" />

                      Confirmation...
                    </>
                  ) : (
                    <>
                      <FiCheck />

                      Confirmer mon choix
                    </>
                  )}

                </button>

              </section>

            )}

          </>

        )}

        {/* FOOTER */}

        <footer className="participant-gallery-footer">

          <FiShield />

          <span>
            Cette galerie est personnelle.
            Ne partagez pas ce lien publiquement.
          </span>

        </footer>

      </div>

    </div>
  );
}

export default ParticipantGalleryPage;