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
  FiRotateCcw,
  FiShield,
  FiX,
  FiXCircle,
} from "react-icons/fi";

import api from "../../../services/api";
import "./AdminQaPortraitsPage.css";

const PORTRAIT_STATUS_LABELS = {
  GENERATED: "À contrôler",
  QA_PENDING: "À contrôler",
  QA_APPROVED: "Approuvé",
  QA_REJECTED: "Rejeté",
  RETOUCH_REQUIRED: "Retouche",
  PUBLISHED: "Publié",
  SELECTED: "Sélectionné",
  DELIVERED: "Livré",
};

function AdminQaPortraitsPage() {
  const {
    participantId,
  } = useParams();

  const navigate =
    useNavigate();

  const reviewPanelRef =
    useRef(null);

  const regenerationIntervalRef =
    useRef(null);

  const regenerationSuccessTimerRef =
    useRef(null);

  const [
    participant,
    setParticipant,
  ] = useState(null);

  const [
    portraits,
    setPortraits,
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
    selectedPortrait,
    setSelectedPortrait,
  ] = useState(null);

  const [
    processingPortraitId,
    setProcessingPortraitId,
  ] = useState(null);

  const [
    processingAction,
    setProcessingAction,
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
    notes,
    setNotes,
  ] = useState("");

  const [
    brokenPortraits,
    setBrokenPortraits,
  ] = useState(
    () => new Set()
  );

  /*
   * =========================================================
   * REGENERATION UI
   * =========================================================
   */

  const [
    regenerationProgress,
    setRegenerationProgress,
  ] = useState(0);

  const [
    regenerationSuccess,
    setRegenerationSuccess,
  ] = useState(false);

  const [
    regeneratedPortraitId,
    setRegeneratedPortraitId,
  ] = useState(null);

  const isRegenerating =
    processingAction ===
      "REGENERATE" &&
    processingPortraitId !==
      null;

  /*
   * =========================================================
   * CLEAN TIMERS
   * =========================================================
   */

  useEffect(() => {
    return () => {
      if (
        regenerationIntervalRef
          .current
      ) {
        clearInterval(
          regenerationIntervalRef
            .current
        );
      }

      if (
        regenerationSuccessTimerRef
          .current
      ) {
        clearTimeout(
          regenerationSuccessTimerRef
            .current
        );
      }
    };
  }, []);

  /*
   * =========================================================
   * STATS
   * =========================================================
   */

  const stats =
    useMemo(() => {
      const approved =
        portraits.filter(
          (portrait) =>
            portrait.status ===
            "QA_APPROVED"
        ).length;

      const rejected =
        portraits.filter(
          (portrait) =>
            portrait.status ===
            "QA_REJECTED"
        ).length;

      const retouch =
        portraits.filter(
          (portrait) =>
            portrait.status ===
            "RETOUCH_REQUIRED"
        ).length;

      const pending =
        portraits.filter(
          (portrait) =>
            [
              "GENERATED",
              "QA_PENDING",
            ].includes(
              portrait.status
            )
        ).length;

      return {
        total:
          portraits.length,

        approved,
        rejected,
        retouch,
        pending,
      };
    }, [
      portraits,
    ]);

  /*
   * =========================================================
   * PENDING PORTRAITS
   * =========================================================
   */

  const pendingPortraits =
    useMemo(
      () =>
        portraits.filter(
          (portrait) =>
            [
              "GENERATED",
              "QA_PENDING",
            ].includes(
              portrait.status
            )
        ),
      [
        portraits,
      ]
    );

  /*
   * =========================================================
   * COMPLETE ALLOWED
   * =========================================================
   */

  const canComplete =
    stats.approved > 0 &&
    stats.pending === 0;

  /*
   * =========================================================
   * REFRESH QA
   * =========================================================
   */

  const refreshQa =
    async ({
      preserveSelection = true,
    } = {}) => {
      const response =
        await api.get(
          `/admin/participants/${participantId}/generated-portraits`
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

      const loadedPortraits =
        Array.isArray(
          data.portraits
        )
          ? data.portraits
          : [];

      setParticipant(
        data.participant
      );

      setPortraits(
        loadedPortraits
      );

      if (
        preserveSelection
      ) {
        setSelectedPortrait(
          (current) => {
            if (!current) {
              return null;
            }

            return (
              loadedPortraits.find(
                (portrait) =>
                  String(
                    portrait.id
                  ) ===
                  String(
                    current.id
                  )
              ) ||
              null
            );
          }
        );
      }

      setBrokenPortraits(
        new Set()
      );

      return loadedPortraits;
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

          setError("");

          const response =
            await api.get(
              `/admin/participants/${participantId}/generated-portraits`
            );

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
              ?.participant
          ) {
            throw new Error(
              "Participant introuvable."
            );
          }

          setParticipant(
            data.participant
          );

          setPortraits(
            Array.isArray(
              data.portraits
            )
              ? data.portraits
              : []
          );

          setSelectedPortrait(
            null
          );

          setBrokenPortraits(
            new Set()
          );
        } catch (
          requestError
        ) {
          if (
            !active
          ) {
            return;
          }

          console.error(
            "QA PORTRAITS LOAD ERROR :",
            requestError
          );

          setError(
            requestError
              .response
              ?.data
              ?.message ||
              requestError.message ||
              "Impossible de charger les portraits générés."
          );
        } finally {
          if (
            active
          ) {
            setLoading(
              false
            );
          }
        }
      };

    run();

    return () => {
      active =
        false;
    };
  }, [
    participantId,
  ]);

  /*
   * =========================================================
   * IMAGE ERROR
   * =========================================================
   */

  const handleImageError =
    (portraitId) => {
      setBrokenPortraits(
        (current) => {
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
    (portrait) => {
      if (
        isRegenerating
      ) {
        return;
      }

      setSelectedPortrait(
        portrait
      );

      setNotes(
        portrait.notes ||
          ""
      );

      const shouldScroll =
        window.matchMedia(
          "(max-width: 1050px)"
        ).matches;

      if (
        shouldScroll
      ) {
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
   * REVIEW INDIVIDUEL
   * =========================================================
   */

  const reviewPortrait =
    async (
      portraitId,
      decision
    ) => {
      if (
        bulkProcessing ||
        processingPortraitId !==
          null
      ) {
        return;
      }

      try {
        setProcessingPortraitId(
          portraitId
        );

        setProcessingAction(
          decision
        );

        setError("");

        await api.patch(
          `/admin/generated-portraits/${portraitId}/review`,
          {
            decision,

            notes:
              notes.trim() ||
              null,
          }
        );

        setNotes("");

        await refreshQa();
      } catch (
        requestError
      ) {
        console.error(
          "QA PORTRAIT REVIEW ERROR :",
          requestError
        );

        setError(
          requestError
            .response
            ?.data
            ?.message ||
            "Impossible d'enregistrer la décision QA."
        );
      } finally {
        setProcessingPortraitId(
          null
        );

        setProcessingAction(
          null
        );
      }
    };

  /*
   * =========================================================
   * START FAKE PROGRESS
   * =========================================================
   *
   * Gemini ne fournit pas un vrai %
   * pendant cette requête.
   *
   * On monte progressivement
   * jusqu'à 92%.
   *
   * 100% = uniquement quand
   * le backend confirme le succès.
   */

  const startRegenerationProgress =
    () => {
      if (
        regenerationIntervalRef
          .current
      ) {
        clearInterval(
          regenerationIntervalRef
            .current
        );
      }

      setRegenerationProgress(
        8
      );

      regenerationIntervalRef.current =
        setInterval(
          () => {
            setRegenerationProgress(
              (current) => {
                if (
                  current >=
                  92
                ) {
                  return 92;
                }

                if (
                  current <
                  30
                ) {
                  return Math.min(
                    current +
                      7,
                    92
                  );
                }

                if (
                  current <
                  65
                ) {
                  return Math.min(
                    current +
                      4,
                    92
                  );
                }

                return Math.min(
                  current +
                    2,
                  92
                );
              }
            );
          },
          900
        );
    };

  /*
   * =========================================================
   * STOP PROGRESS
   * =========================================================
   */

  const stopRegenerationProgress =
    () => {
      if (
        regenerationIntervalRef
          .current
      ) {
        clearInterval(
          regenerationIntervalRef
            .current
        );

        regenerationIntervalRef.current =
          null;
      }
    };

  /*
   * =========================================================
   * SUCCESS MESSAGE
   * =========================================================
   */

  const showRegenerationSuccess =
    (
      newPortraitId
    ) => {
      setRegeneratedPortraitId(
        newPortraitId ||
          null
      );

      setRegenerationSuccess(
        true
      );

      if (
        regenerationSuccessTimerRef
          .current
      ) {
        clearTimeout(
          regenerationSuccessTimerRef
            .current
        );
      }

      regenerationSuccessTimerRef.current =
        setTimeout(
          () => {
            setRegenerationSuccess(
              false
            );

            setRegeneratedPortraitId(
              null
            );
          },
          4000
        );
    };

  /*
   * =========================================================
   * REGENERATE PORTRAIT
   * =========================================================
   */

  const regeneratePortrait =
    async (
      portraitId
    ) => {
      if (
        bulkProcessing ||
        processingPortraitId !==
          null
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          "Régénérer ce portrait ? L'ancien portrait sera conservé dans l'historique."
        );

      if (
        !confirmed
      ) {
        return;
      }

      try {
        setProcessingPortraitId(
          portraitId
        );

        setProcessingAction(
          "REGENERATE"
        );

        setRegenerationSuccess(
          false
        );

        setRegeneratedPortraitId(
          null
        );

        setError("");

        startRegenerationProgress();

        const response =
          await api.post(
            `/admin/generated-portraits/${portraitId}/regenerate`,
            {
              notes:
                notes.trim() ||
                null,
            }
          );

        const newPortraitId =
          response.data
            ?.data
            ?.newPortrait
            ?.id;

        /*
         * Gemini terminé.
         */
        stopRegenerationProgress();

        setRegenerationProgress(
          100
        );

        setNotes("");

        /*
         * Petite pause pour rendre
         * le 100% visible.
         */
        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              350
            )
        );

        /*
         * GET :
         *
         * l'ancien portrait ayant
         * une qa_review REGENERATE
         * ne sera plus renvoyé.
         */
        const loadedPortraits =
          await refreshQa({
            preserveSelection:
              false,
          });

        let regeneratedPortrait =
          null;

        if (
          newPortraitId
        ) {
          regeneratedPortrait =
            loadedPortraits.find(
              (portrait) =>
                String(
                  portrait.id
                ) ===
                String(
                  newPortraitId
                )
            );
        }

        /*
         * Sécurité si jamais
         * l'API ne renvoie pas l'ID.
         */
        if (
          !regeneratedPortrait
        ) {
          regeneratedPortrait =
            [...loadedPortraits]
              .reverse()
              .find(
                (portrait) =>
                  portrait.status ===
                  "QA_PENDING"
              );
        }

        if (
          regeneratedPortrait
        ) {
          setSelectedPortrait(
            regeneratedPortrait
          );

          showRegenerationSuccess(
            regeneratedPortrait.id
          );

          const shouldScroll =
            window.matchMedia(
              "(max-width: 1050px)"
            ).matches;

          if (
            shouldScroll
          ) {
            window.requestAnimationFrame(
              () => {
                reviewPanelRef
                  .current
                  ?.scrollIntoView({
                    behavior:
                      "smooth",

                    block:
                      "start",
                  });
              }
            );
          }
        } else {
          setSelectedPortrait(
            null
          );

          showRegenerationSuccess(
            newPortraitId
          );
        }
      } catch (
        requestError
      ) {
        stopRegenerationProgress();

        setRegenerationProgress(
          0
        );

        console.error(
          "PORTRAIT REGENERATION ERROR :",
          requestError
        );

        setError(
          requestError
            .response
            ?.data
            ?.message ||
            "Impossible de régénérer le portrait."
        );
      } finally {
        setProcessingPortraitId(
          null
        );

        setProcessingAction(
          null
        );

        setTimeout(
          () => {
            setRegenerationProgress(
              0
            );
          },
          500
        );
      }
    };

  /*
   * =========================================================
   * APPROVE ALL
   * =========================================================
   */

  const approveAllPendingPortraits =
    async () => {
      if (
        pendingPortraits.length ===
        0 ||
        processingPortraitId !==
          null
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          `Confirmer l'approbation des ${pendingPortraits.length} portrait(s) encore à contrôler ?`
        );

      if (
        !confirmed
      ) {
        return;
      }

      try {
        setBulkProcessing(
          true
        );

        setError("");

        await Promise.all(
          pendingPortraits.map(
            (portrait) =>
              api.patch(
                `/admin/generated-portraits/${portrait.id}/review`,
                {
                  decision:
                    "APPROVE",

                  notes:
                    null,
                }
              )
          )
        );

        setSelectedPortrait(
          null
        );

        setNotes("");

        await refreshQa({
          preserveSelection:
            false,
        });
      } catch (
        requestError
      ) {
        console.error(
          "QA PORTRAITS APPROVE ALL ERROR :",
          requestError
        );

        setError(
          requestError
            .response
            ?.data
            ?.message ||
            "Impossible d'approuver tous les portraits."
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
        !canComplete ||
        bulkProcessing ||
        processingPortraitId !==
          null
      ) {
        return;
      }

      try {
        setCompleting(
          true
        );

        setError("");

        await api.post(
          `/admin/participants/${participantId}/portraits-qa/complete`
        );

        navigate(
          `/admin/participants/${participantId}`
        );
      } catch (
        requestError
      ) {
        console.error(
          "QA PORTRAITS COMPLETE ERROR :",
          requestError
        );

        setError(
          requestError
            .response
            ?.data
            ?.message ||
            "Impossible de publier la galerie."
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

  if (
    loading
  ) {
    return (
      <div className="qa-portraits-page qa-portraits-centered">

        <FiRefreshCw className="qa-portraits-spinner" />

        <strong>
          Chargement des portraits...
        </strong>

      </div>
    );
  }

  /*
   * =========================================================
   * FATAL ERROR
   * =========================================================
   */

  if (
    error &&
    !participant
  ) {
    return (
      <div className="qa-portraits-page qa-portraits-centered">

        <FiXCircle />

        <strong>
          QA portraits indisponible
        </strong>

        <p>
          {error}
        </p>

      </div>
    );
  }

  return (
    <div className="qa-portraits-page">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="qa-portraits-header">

        <div>

          <button
            type="button"
            className="qa-portraits-back"
            onClick={() =>
              navigate(
                `/admin/participants/${participantId}`
              )
            }
          >
            <FiArrowLeft />

            Retour au participant
          </button>

          <span className="qa-portraits-eyebrow">
            QA PORTRAITS
          </span>

          <h1>
            Portraits générés
          </h1>

          <p>
            Contrôlez les portraits générés
            avant de les publier dans la
            galerie du participant.
          </p>

        </div>

        <div className="qa-portraits-participant">

          <div className="qa-portraits-avatar">

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
          SUCCESS
      ====================================================== */}

      {regenerationSuccess && (
        <div className="qa-regeneration-success">

          <span className="qa-regeneration-success-icon">
            <FiCheck />
          </span>

          <div>

            <strong>
              Portrait régénéré avec succès
            </strong>

            <span>
              Le nouveau résultat est prêt
              à être contrôlé.
            </span>

          </div>

        </div>
      )}

      {/* =====================================================
          STATS
      ====================================================== */}

      <section className="qa-portraits-stats">

        <article>

          <span>
            Portraits
          </span>

          <strong>
            {
              stats.total
            }
          </strong>

        </article>

        <article>

          <span>
            À contrôler
          </span>

          <strong>
            {
              stats.pending
            }
          </strong>

        </article>

        <article className="qa-portraits-stat-success">

          <span>
            Approuvés
          </span>

          <strong>
            {
              stats.approved
            }
          </strong>

        </article>

        <article className="qa-portraits-stat-danger">

          <span>
            Rejetés
          </span>

          <strong>
            {
              stats.rejected
            }
          </strong>

        </article>

      </section>

      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="qa-portraits-error">
          {error}
        </div>
      )}

      {/* =====================================================
          WORKSPACE
      ====================================================== */}

      <main className="qa-portraits-workspace">

        <section className="qa-portraits-list">

          <div className="qa-portraits-section-head">

            <div>

              <span>
                PORTRAITS GEMINI
              </span>

              <h2>
                Résultats générés
              </h2>

              <p>
                Sélectionnez un portrait
                pour effectuer son contrôle.
              </p>

            </div>

            <strong>
              {
                stats.approved
              }{" "}
              approuvé
              {
                stats.approved >
                1
                  ? "s"
                  : ""
              }
            </strong>

          </div>

          {/* BULK */}

          <div className="qa-portraits-bulk">

            <div className="qa-portraits-bulk-copy">

              <span className="qa-portraits-bulk-icon">
                <FiCheckCircle />
              </span>

              <div>

                <strong>
                  Validation rapide
                </strong>

                <span>
                  {stats.pending >
                  0
                    ? `${stats.pending} portrait(s) restent à contrôler`
                    : "Tous les portraits ont été contrôlés"}
                </span>

              </div>

            </div>

            <button
              type="button"
              className="qa-portraits-approve-all"
              disabled={
                stats.pending ===
                  0 ||
                bulkProcessing ||
                processingPortraitId !==
                  null
              }
              onClick={
                approveAllPendingPortraits
              }
            >

              {bulkProcessing ? (
                <>
                  <FiRefreshCw className="qa-portraits-spinner-small" />

                  Approbation...
                </>
              ) : (
                <>
                  <FiCheck />

                  Approuver tous les portraits
                </>
              )}

            </button>

          </div>

          {/* GRID */}

          {portraits.length ===
          0 ? (
            <div className="qa-portraits-empty">

              <FiImage />

              <strong>
                Aucun portrait généré
              </strong>

            </div>
          ) : (
            <div className="qa-portraits-grid">

              {portraits.map(
                (
                  portrait,
                  index
                ) => {
                  const broken =
                    brokenPortraits.has(
                      portrait.id
                    );

                  const available =
                    Boolean(
                      portrait.imageUrl
                    ) &&
                    !broken;

                  const selected =
                    selectedPortrait
                      ?.id ===
                    portrait.id;

                  const regeneratingThis =
                    processingAction ===
                      "REGENERATE" &&
                    String(
                      processingPortraitId
                    ) ===
                      String(
                        portrait.id
                      );

                  const justRegenerated =
                    regenerationSuccess &&
                    String(
                      regeneratedPortraitId
                    ) ===
                      String(
                        portrait.id
                      );

                  return (
                    <button
                      key={
                        portrait.id
                      }
                      type="button"
                      className={`qa-portrait-card ${
                        selected
                          ? "selected"
                          : ""
                      } ${
                        justRegenerated
                          ? "just-regenerated"
                          : ""
                      } status-${portrait.status?.toLowerCase()}`}
                      disabled={
                        bulkProcessing ||
                        (
                          processingPortraitId !==
                            null &&
                          !regeneratingThis
                        )
                      }
                      onClick={() =>
                        handleSelectPortrait(
                          portrait
                        )
                      }
                    >

                      <div className="qa-portrait-image">

                        {available ? (
                          <img
                            src={
                              portrait.imageUrl
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
                          <div className="qa-portrait-no-image">

                            <FiImage />

                          </div>
                        )}

                        {portrait.status ===
                          "QA_APPROVED" && (
                          <span className="qa-portrait-state approved">
                            <FiCheck />
                          </span>
                        )}

                        {portrait.status === "QA_REJECTED" && (
                            <span
                                className="
                                position-absolute
                                top-0
                                end-0
                                m-2
                                badge
                                rounded-pill
                                bg-danger
                                d-inline-flex
                                align-items-center
                                gap-1
                                px-3
                                py-2
                                shadow-sm
                                "
                            >
                            <FiX size={14} />
                            Portrait rejeté
                        </span>
                        )}

                        {portrait.status ===
                          "RETOUCH_REQUIRED" && (
                          <span className="qa-portrait-state retouch">
                            <FiRotateCcw />
                          </span>
                        )}

                        {/* REGENERATION OVERLAY */}

                        {regeneratingThis && (
                          <div className="qa-regeneration-overlay">

                            <div className="qa-regeneration-spinner">
                              <FiRefreshCw />
                            </div>

                            <strong>
                              Régénération en cours
                            </strong>

                            <span>
                              {
                                regenerationProgress
                              }%
                            </span>

                            <div className="qa-regeneration-progress-track">

                              <div
                                className="qa-regeneration-progress-value"
                                style={{
                                  width:
                                    `${regenerationProgress}%`,
                                }}
                              />

                            </div>

                            <small>
                              Création d'un nouveau portrait…
                            </small>

                          </div>
                        )}

                        {justRegenerated && (
                          <div className="qa-regenerated-badge">

                            <FiCheck />

                            Nouveau portrait

                          </div>
                        )}

                      </div>

                      <div className="qa-portrait-footer">

                        <strong>
                          Portrait{" "}
                          {
                            index +
                            1
                          }
                        </strong>

                        <span>
                          {PORTRAIT_STATUS_LABELS[
                            portrait.status
                          ] ||
                            portrait.status}
                        </span>

                      </div>

                    </button>
                  );
                }
              )}

            </div>
          )}

        </section>

        {/* =================================================
            REVIEW PANEL
        ================================================== */}

        <aside
          ref={
            reviewPanelRef
          }
          className="qa-portrait-review-panel"
        >

          {selectedPortrait ? (
            <>

              <div className="qa-portrait-review-header">

                <div>

                  <span>
                    PORTRAIT SÉLECTIONNÉ
                  </span>

                  <h2>
                    Portrait #
                    {
                      selectedPortrait.id
                    }
                  </h2>

                </div>

                <span
                  className={`qa-portrait-review-status status-${selectedPortrait.status?.toLowerCase()}`}
                >
                  {PORTRAIT_STATUS_LABELS[
                    selectedPortrait.status
                  ] ||
                    selectedPortrait.status}
                </span>

              </div>

              {/* IMAGE */}

              <div className="qa-portrait-review-image">

                {selectedPortrait
                  .imageUrl &&
                !brokenPortraits.has(
                  selectedPortrait.id
                ) ? (
                  <img
                    src={
                      selectedPortrait.imageUrl
                    }
                    alt="Portrait généré"
                    onError={() =>
                      handleImageError(
                        selectedPortrait.id
                      )
                    }
                  />
                ) : (
                  <div className="qa-portrait-review-no-image">

                    <FiImage />

                    Image indisponible

                  </div>
                )}

                {processingAction ===
                  "REGENERATE" &&
                String(
                  processingPortraitId
                ) ===
                  String(
                    selectedPortrait.id
                  ) && (
                  <div className="qa-regeneration-overlay qa-regeneration-overlay-large">

                    <div className="qa-regeneration-spinner">
                      <FiRefreshCw />
                    </div>

                    <strong>
                      Régénération en cours
                    </strong>

                    <span>
                      {
                        regenerationProgress
                      }%
                    </span>

                    <div className="qa-regeneration-progress-track">

                      <div
                        className="qa-regeneration-progress-value"
                        style={{
                          width:
                            `${regenerationProgress}%`,
                        }}
                      />

                    </div>

                    <small>
                      Gemini prépare le nouveau portrait…
                    </small>

                  </div>
                )}

              </div>

              {/* CHECKLIST */}

              <div className="qa-portrait-checklist">

                <h3>
                  Points de contrôle
                </h3>

                <div>
                  <FiCheckCircle />
                  Ressemblance correcte
                </div>

                <div>
                  <FiCheckCircle />
                  Aucun artefact gênant
                </div>

                <div>
                  <FiCheckCircle />
                  Teint naturel
                </div>

                <div>
                  <FiCheckCircle />
                  Style de campagne respecté
                </div>

                <div>
                  <FiCheckCircle />
                  Qualité générale suffisante
                </div>

              </div>

              {/* NOTES */}

              <div className="qa-portrait-notes">

                <label htmlFor="qa-portrait-notes">
                  Commentaire QA
                </label>

                <textarea
                  id="qa-portrait-notes"
                  value={
                    notes
                  }
                  onChange={(
                    event
                  ) =>
                    setNotes(
                      event.target
                        .value
                    )
                  }
                  placeholder="Ex. ressemblance insuffisante, artefact, expression à revoir..."
                  rows={4}
                  disabled={
                    bulkProcessing ||
                    processingPortraitId !==
                      null
                  }
                />

              </div>

              {/* ACTIONS */}

              <div className="qa-portrait-actions">

                <button
                  type="button"
                  className="qa-portrait-reject"
                  disabled={
                    processingPortraitId !==
                      null ||
                    bulkProcessing
                  }
                  onClick={() =>
                    reviewPortrait(
                      selectedPortrait.id,
                      "REJECT"
                    )
                  }
                >

                  {processingAction ===
                    "REJECT" &&
                  String(
                    processingPortraitId
                  ) ===
                    String(
                      selectedPortrait.id
                    ) ? (
                    <FiRefreshCw className="qa-portraits-spinner-small" />
                  ) : (
                    <FiX />
                  )}

                  {processingAction ===
                    "REJECT"
                    ? "Rejet..."
                    : "Rejeter"}

                </button>

                <button
                  type="button"
                  className="qa-portrait-regenerate"
                  disabled={
                    processingPortraitId !==
                      null ||
                    bulkProcessing
                  }
                  onClick={() =>
                    regeneratePortrait(
                      selectedPortrait.id
                    )
                  }
                >

                  {processingAction ===
                    "REGENERATE" ? (
                    <FiRefreshCw className="qa-portraits-spinner-small" />
                  ) : (
                    <FiRotateCcw />
                  )}

                  {processingAction ===
                    "REGENERATE"
                    ? `Régénération ${regenerationProgress}%`
                    : "Régénérer"}

                </button>

                <button
                  type="button"
                  className="qa-portrait-approve"
                  disabled={
                    processingPortraitId !==
                      null ||
                    bulkProcessing
                  }
                  onClick={() =>
                    reviewPortrait(
                      selectedPortrait.id,
                      "APPROVE"
                    )
                  }
                >

                  {processingAction ===
                    "APPROVE" &&
                  String(
                    processingPortraitId
                  ) ===
                    String(
                      selectedPortrait.id
                    ) ? (
                    <FiRefreshCw className="qa-portraits-spinner-small" />
                  ) : (
                    <FiCheck />
                  )}

                  {processingAction ===
                    "APPROVE"
                    ? "Approbation..."
                    : "Approuver"}

                </button>

              </div>

            </>
          ) : (
            <div className="qa-portrait-empty-review">

              <FiShield />

              <strong>
                Sélectionnez un portrait
              </strong>

              <span>
                Cliquez sur un résultat Gemini
                pour commencer le contrôle.
              </span>

            </div>
          )}

        </aside>

      </main>

      {/* =====================================================
          FINAL VALIDATION
      ====================================================== */}

      <section className="qa-portraits-final">

        <div>

          <span>
            PUBLICATION GALERIE
          </span>

          <h2>
            {canComplete
              ? "Galerie prête à être publiée"
              : "Contrôle des portraits en cours"}
          </h2>

          <p>
            {stats.pending >
            0
              ? `${stats.pending} portrait(s) restent à contrôler.`
              : stats.approved ===
                0
              ? "Au moins un portrait doit être approuvé."
              : `${stats.approved} portrait(s) seront proposés au participant.`}
          </p>

        </div>

        <button
          type="button"
          className="qa-portraits-complete-button"
          disabled={
            !canComplete ||
            completing ||
            bulkProcessing ||
            processingPortraitId !==
              null
          }
          onClick={
            completeQa
          }
        >

          {completing ? (
            <FiRefreshCw className="qa-portraits-spinner-small" />
          ) : (
            <FiShield />
          )}

          {completing
            ? "Publication..."
            : "Publier la galerie participant"}

        </button>

      </section>

    </div>
  );
}

export default AdminQaPortraitsPage;