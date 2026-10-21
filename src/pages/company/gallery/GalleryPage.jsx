
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiImage,
  FiGrid,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiDownload,
  FiEye,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiArrowRight,
  FiAlertCircle,
  FiCheckCircle,
  FiUsers,
  FiCamera,
  FiShield,
  FiInbox,
  FiShare2,
  FiLink,
  FiCopy,
  FiTrash2,
  FiClock,
  FiExternalLink,
  FiCheck,
  FiInfo,
} from "react-icons/fi";
import { ClipLoader } from "react-spinners";

import api from "../../../services/api";
import "./GalleryPage.css";

/* =========================================================
   HELPERS
========================================================= */

const normalizeResponse = (response) => {
  const payload = response?.data?.data ?? response?.data;

  if (!Array.isArray(payload?.portraits)) {
    throw new Error("Réponse de la galerie invalide.");
  }

  return {
    portraits: payload.portraits,
    hasMore: Boolean(payload.hasMore),
    nextCursor: payload.nextCursor ?? null,
  };
};

const normalizePortrait = (portrait) => ({
  id: portrait.id,
  participantId: portrait.participantId,
  firstName: portrait.firstName || "",
  lastName: portrait.lastName || "",
  campaignId: portrait.campaignId,
  campaignName: portrait.campaignName || "Campagne",
  styleName: portrait.styleName || "Portrait professionnel",
  imageUrl: portrait.imageUrl || null,
  downloadUrl: portrait.downloadUrl || null,
  canDownload: portrait.canDownload === true,
  createdAt: portrait.createdAt || null,
});

const getFullName = (portrait) =>
  `${portrait.firstName} ${portrait.lastName}`.trim() ||
  "Collaborateur";

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Paris",
  }).format(date);
};

const isTrustedImageUrl = (value) => {
  if (typeof value !== "string") return false;

  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
};

const openDownload = (value) => {
  if (!isTrustedImageUrl(value)) return;

  window.open(value, "_blank", "noopener,noreferrer");
};

/*
 * Validation des URL de partage.
 *
 * Les URL proviennent du backend.
 * On ne conserve jamais le token dans localStorage.
 *
 * Le domaine doit correspondre au frontend configuré
 * ou au site actuellement utilisé.
 */

const normalizeShareUrl = (value) => {
  if (!value || typeof value !== "string") return "";

  try {
    const url = new URL(value);

    const localDevelopment =
      url.protocol === "http:" &&
      ["localhost", "127.0.0.1"].includes(url.hostname);

    const secure = url.protocol === "https:";

    const validPath =
      /^\/galerie-partagee\/[a-f0-9]{64}\/?$/.test(url.pathname);

    if ((!secure && !localDevelopment) || !validPath) {
      return "";
    }

    return url.href;
  } catch {
    return "";
  }
};

/* =========================================================
   COMPOSANT
========================================================= */

function GalleryPage() {
  const navigate = useNavigate();

  /* =========================================================
     ÉTATS GALERIE
  ========================================================= */

  const [portraits, setPortraits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);

  const [search, setSearch] = useState("");
  const [campaignFilter, setCampaignFilter] = useState("ALL");
  const [sort, setSort] = useState("NEWEST");

  const [selectedId, setSelectedId] = useState(null);

  /* =========================================================
     ÉTATS PARTAGE PUBLIC
  ========================================================= */

  const [shareOpen, setShareOpen] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareSaving, setShareSaving] = useState(false);
  const [shareRevoking, setShareRevoking] = useState(false);

  const [shareActive, setShareActive] = useState(false);
  const [shareInfo, setShareInfo] = useState(null);

  /*
   * Ce lien est récupéré depuis PostgreSQL
   * via le backend.
   *
   * Aucun stockage navigateur.
   */

  const [shareUrl, setShareUrl] = useState("");

  const [shareError, setShareError] = useState("");
  const [shareSuccess, setShareSuccess] = useState("");
  const [copied, setCopied] = useState(false);
  const [shareConfirmed, setShareConfirmed] = useState(false);
  const [revokeConfirm, setRevokeConfirm] = useState(false);

  /* =========================================================
     CHARGEMENT DES PORTRAITS
  ========================================================= */

  const loadPortraits = useCallback(
    async ({ cursor = null, append = false, signal } = {}) => {
      const response = await api.get(
        "/company/gallery/portraits",
        {
          signal,
          timeout: 60000,
          params: cursor ? { cursor } : {},
        }
      );

      if (signal?.aborted) return;

      const result = normalizeResponse(response);
      const received = result.portraits.map(normalizePortrait);

      setPortraits((previous) => {
        if (!append) return received;

        const ids = new Set(
          previous.map((portrait) => String(portrait.id))
        );

        return [
          ...previous,
          ...received.filter(
            (portrait) => !ids.has(String(portrait.id))
          ),
        ];
      });

      setHasMore(result.hasMore);
      setNextCursor(result.nextCursor);
    },
    []
  );

  useEffect(() => {
    const controller = new AbortController();

    const initialize = async () => {
      try {
        setLoading(true);
        setError("");

        await loadPortraits({
          signal: controller.signal,
        });
      } catch (err) {
        if (
          controller.signal.aborted ||
          err.code === "ERR_CANCELED"
        ) {
          return;
        }

        console.error("Chargement galerie :", err);

        setError(
          err.response?.data?.message ||
          err.message ||
          "Impossible de charger la galerie."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    initialize();

    return () => controller.abort();
  }, [loadPortraits]);

  const handleRefresh = async () => {
    if (refreshing || loading || loadingMore) return;

    try {
      setRefreshing(true);
      setError("");

      await loadPortraits();
      setSelectedId(null);
    } catch (err) {
      console.error("Actualisation galerie :", err);

      setError(
        err.response?.data?.message ||
        "Impossible d'actualiser la galerie."
      );
    } finally {
      setRefreshing(false);
    }
  };

  const handleLoadMore = async () => {
    if (!hasMore || !nextCursor || loadingMore || refreshing) {
      return;
    }

    try {
      setLoadingMore(true);
      setError("");

      await loadPortraits({
        cursor: nextCursor,
        append: true,
      });
    } catch (err) {
      console.error("Pagination galerie :", err);

      setError(
        err.response?.data?.message ||
        "Impossible de charger les portraits suivants."
      );
    } finally {
      setLoadingMore(false);
    }
  };

  /* =========================================================
     FILTRES ET STATISTIQUES
  ========================================================= */

  const campaigns = useMemo(() => {
    const unique = new Map();

    portraits.forEach((portrait) => {
      if (portrait.campaignId != null) {
        unique.set(String(portrait.campaignId), {
          id: portrait.campaignId,
          name: portrait.campaignName,
        });
      }
    });

    return [...unique.values()].sort((a, b) =>
      a.name.localeCompare(b.name, "fr")
    );
  }, [portraits]);

  const filteredPortraits = useMemo(() => {
    const query = search.trim().toLowerCase();

    const items = portraits.filter((portrait) => {
      const content = [
        portrait.firstName,
        portrait.lastName,
        portrait.campaignName,
        portrait.styleName,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || content.includes(query);

      const matchesCampaign =
        campaignFilter === "ALL" ||
        String(portrait.campaignId) === campaignFilter;

      return matchesSearch && matchesCampaign;
    });

    items.sort((a, b) => {
      const dateA = Date.parse(a.createdAt || "") || 0;
      const dateB = Date.parse(b.createdAt || "") || 0;

      if (sort === "OLDEST") return dateA - dateB;

      if (sort === "NAME") {
        return getFullName(a).localeCompare(
          getFullName(b),
          "fr"
        );
      }

      return dateB - dateA;
    });

    return items;
  }, [portraits, search, campaignFilter, sort]);

  const selectedIndex = filteredPortraits.findIndex(
    (portrait) => portrait.id === selectedId
  );

  const selectedPortrait =
    selectedIndex >= 0
      ? filteredPortraits[selectedIndex]
      : null;

  const changeSelection = useCallback(
    (direction) => {
      if (
        selectedIndex < 0 ||
        filteredPortraits.length < 2
      ) {
        return;
      }

      const nextIndex =
        (
          selectedIndex +
          direction +
          filteredPortraits.length
        ) % filteredPortraits.length;

      setSelectedId(filteredPortraits[nextIndex].id);
    },
    [selectedIndex, filteredPortraits]
  );

  useEffect(() => {
    if (selectedId == null) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedId(null);
      }

      if (event.key === "ArrowLeft") {
        changeSelection(-1);
      }

      if (event.key === "ArrowRight") {
        changeSelection(1);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedId, changeSelection]);

  const availableCount = portraits.length;

  const collaboratorCount = new Set(
    portraits.map((portrait) => portrait.participantId)
  ).size;

  const campaignsCount = new Set(
    portraits.map((portrait) => portrait.campaignId)
  ).size;

  const hasFilters =
    search.trim() !== "" ||
    campaignFilter !== "ALL" ||
    sort !== "NEWEST";

  const handleViewAll = () => {
    setSearch("");
    setCampaignFilter("ALL");
    setSort("NEWEST");

    document
      .getElementById("company-gallery-portraits")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  /* =========================================================
     RÉCUPÉRATION DU LIEN EXISTANT — CORRECTION
  =========================================================
   *
   * Le backend doit retourner :
   *
   * {
   *   success: true,
   *   active: true,
   *   share: {
   *     id: ...,
   *     expiresAt: ...
   *   },
   *   shareUrl: "https://.../galerie-partagee/TOKEN"
   * }
   *
   * Le lien est disponible même après déconnexion,
   * actualisation ou changement d'appareil.
   */

  const loadShareStatus = useCallback(async () => {
    const response = await api.get(
      "/company/gallery/share",
      {
        timeout: 60000,
        params: { _: Date.now() },
      }
    );

    if (response.data?.success !== true) {
      throw new Error(
        "Impossible de vérifier le lien de partage."
      );
    }

    const active = response.data.active === true;

    const receivedUrl = normalizeShareUrl(
      response.data.shareUrl ||
      response.data.share?.shareUrl ||
      ""
    );

    setShareActive(active);
    setShareInfo(
      active ? response.data.share || null : null
    );

    /*
     * CORRECTION PRINCIPALE :
     *
     * Au lieu de conserver l'URL uniquement
     * après un POST, on récupère celle du GET.
     *
     * Si le partage a été révoqué ou expiré,
     * on efface immédiatement le lien.
     */

    setShareUrl(active ? receivedUrl : "");
    setCopied(false);

    return {
      active,
      shareUrl: active ? receivedUrl : "",
    };
  }, []);

  /* =========================================================
     OUVERTURE DE LA MODALE DE PARTAGE
  ========================================================= */

  const handleOpenShare = async () => {
    setShareOpen(true);
    setShareLoading(true);
    setShareError("");
    setShareSuccess("");
    setCopied(false);
    setShareConfirmed(false);
    setRevokeConfirm(false);

    try {
      await loadShareStatus();
    } catch (err) {
      console.error("Chargement partage :", err);

      setShareError(
        err.response?.data?.message ||
        "Impossible de récupérer l'état du partage."
      );
    } finally {
      setShareLoading(false);
    }
  };

  const handleCloseShare = () => {
    if (shareSaving || shareRevoking) return;

    setShareOpen(false);
    setShareError("");
    setShareSuccess("");
    setShareConfirmed(false);
    setRevokeConfirm(false);
    setCopied(false);
  };

  /* =========================================================
     CRÉATION / REMPLACEMENT DU LIEN
  ========================================================= */

  const handleCreateShare = async () => {
    if (
      shareSaving ||
      shareRevoking ||
      !shareConfirmed
    ) {
      return;
    }

    try {
      setShareSaving(true);
      setShareError("");
      setShareSuccess("");
      setCopied(false);

      const response = await api.post(
        "/company/gallery/share",
        {},
        { timeout: 60000 }
      );

      if (
        response.data?.success !== true ||
        typeof response.data.shareUrl !== "string"
      ) {
        throw new Error("Lien de partage invalide.");
      }

      const newUrl = normalizeShareUrl(
        response.data.shareUrl
      );

      if (!newUrl) {
        throw new Error(
          "Le backend a retourné une URL de partage invalide."
        );
      }

      /*
       * Le nouveau lien remplace l'ancien.
       *
       * Le backend stocke sa version chiffrée
       * et révoque l'ancien lien.
       */

      setShareUrl(newUrl);
      setShareActive(true);

      setShareInfo({
        expiresAt: response.data.expiresAt,
      });

      setShareSuccess(
        "Lien créé avec succès. Il restera disponible tant qu'il sera actif."
      );

      setShareConfirmed(false);
      setRevokeConfirm(false);
    } catch (err) {
      console.error("Création partage :", err);

      setShareError(
        err.response?.data?.message ||
        err.message ||
        "Impossible de créer le lien."
      );
    } finally {
      setShareSaving(false);
    }
  };

  /* =========================================================
     COPIE DU LIEN
  ========================================================= */

  const handleCopyShare = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);

      setCopied(true);
      setShareError("");
    } catch (err) {
      console.error("Copie partage :", err);

      setShareError(
        "Copie automatique indisponible. Sélectionnez le lien pour le copier."
      );
    }
  };

  /* =========================================================
     RÉVOCATION
  ========================================================= */

  const handleRevokeShare = async () => {
    if (
      !revokeConfirm ||
      shareRevoking ||
      shareSaving
    ) {
      return;
    }

    try {
      setShareRevoking(true);
      setShareError("");
      setShareSuccess("");

      const response = await api.delete(
        "/company/gallery/share",
        { timeout: 60000 }
      );

      if (response.data?.success !== true) {
        throw new Error("Révocation non confirmée.");
      }

      /*
       * Lien désactivé :
       * on le supprime immédiatement de l'interface.
       */

      setShareActive(false);
      setShareInfo(null);
      setShareUrl("");
      setCopied(false);
      setRevokeConfirm(false);

      setShareSuccess(
        "Le lien de partage a été désactivé."
      );
    } catch (err) {
      console.error("Révocation partage :", err);

      setShareError(
        err.response?.data?.message ||
        "Impossible de désactiver le lien."
      );
    } finally {
      setShareRevoking(false);
    }
  };

  /* =========================================================
     AFFICHAGE
  ========================================================= */

  return (
    <div className="company-gallery-page">
      {/* HEADER */}
      <header className="company-gallery-header">
        <div>
          <span className="company-gallery-kicker">
            ESPACE ENTREPRISE
          </span>

          <h1>Galerie</h1>

          <p>
            Retrouvez les portraits finaux de vos collaborateurs,
            regroupés depuis toutes vos campagnes.
          </p>
        </div>

        <button
          type="button"
          className="company-gallery-refresh"
          onClick={handleRefresh}
          disabled={loading || refreshing || loadingMore}
        >
          <FiRefreshCw
            className={
              refreshing ? "company-gallery-spin" : ""
            }
          />

          {refreshing ? "Actualisation..." : "Actualiser"}
        </button>
      </header>

      {/* ALERTES */}
      {error && (
        <div className="company-gallery-alert" role="alert">
          <FiAlertCircle />

          <span>{error}</span>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading || refreshing}
          >
            Réessayer
          </button>
        </div>
      )}

      {/* STATISTIQUES */}
      <section className="company-gallery-summary">
        <article>
          <span className="company-gallery-summary-icon purple">
            <FiImage />
          </span>

          <div>
            <strong>
              {loading
                ? "—"
                : `${availableCount}${hasMore ? "+" : ""}`}
            </strong>

            <span>Portraits chargés</span>
          </div>
        </article>

        <article>
          <span className="company-gallery-summary-icon blue">
            <FiUsers />
          </span>

          <div>
            <strong>
              {loading ? "—" : collaboratorCount}
            </strong>

            <span>Collaborateurs</span>
          </div>
        </article>

        <article>
          <span className="company-gallery-summary-icon green">
            <FiGrid />
          </span>

          <div>
            <strong>
              {loading ? "—" : campaignsCount}
            </strong>

            <span>Campagnes</span>
          </div>
        </article>
      </section>

      {/* ACCÈS RAPIDES */}
      <section className="company-gallery-quick-actions">
        <button
          type="button"
          className="company-gallery-quick-card"
          onClick={handleViewAll}
        >
          <span className="company-gallery-quick-icon purple">
            <FiGrid />
          </span>

          <span className="company-gallery-quick-text">
            <strong>Voir tous les portraits</strong>

            <small>
              Afficher les portraits finaux de toutes les campagnes
            </small>
          </span>

          <FiArrowRight className="company-gallery-quick-arrow" />
        </button>

        <button
          type="button"
          className="company-gallery-quick-card"
          onClick={handleOpenShare}
        >
          <span className="company-gallery-quick-icon blue">
            <FiShare2 />
          </span>

          <span className="company-gallery-quick-text">
            <strong>Partager la galerie</strong>

            <small>
              Créer ou gérer un lien public temporaire
            </small>
          </span>

          <FiArrowRight className="company-gallery-quick-arrow" />
        </button>
      </section>

      {/* LISTE DES PORTRAITS */}
      <section
        id="company-gallery-portraits"
        className="company-gallery-section"
      >
        <div className="company-gallery-section-heading">
          <div>
            <h2>Tous les portraits</h2>

            <p>
              Consultez les portraits finaux de votre entreprise
              depuis un seul espace.
            </p>
          </div>
        </div>

        {/* RECHERCHE ET FILTRES */}
        <div className="company-gallery-toolbar">
          <label className="company-gallery-search">
            <FiSearch />

            <input
              type="search"
              placeholder="Rechercher un collaborateur..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              aria-label="Rechercher un portrait"
            />
          </label>

          <label className="company-gallery-select">
            <FiFilter />

            <select
              value={campaignFilter}
              onChange={(event) =>
                setCampaignFilter(event.target.value)
              }
              aria-label="Filtrer par campagne"
            >
              <option value="ALL">
                Toutes les campagnes
              </option>

              {campaigns.map((campaign) => (
                <option
                  key={campaign.id}
                  value={String(campaign.id)}
                >
                  {campaign.name}
                </option>
              ))}
            </select>
          </label>

          <label className="company-gallery-select">
            <select
              value={sort}
              onChange={(event) =>
                setSort(event.target.value)
              }
              aria-label="Trier les portraits"
            >
              <option value="NEWEST">Plus récents</option>
              <option value="OLDEST">Plus anciens</option>
              <option value="NAME">Nom A–Z</option>
            </select>
          </label>
        </div>

        <div className="company-gallery-results">
          <span>
            {loading
              ? "Chargement..."
              : `${filteredPortraits.length} portrait(s) affiché(s)`}
          </span>

          {hasFilters && (
            <button
              type="button"
              onClick={handleViewAll}
            >
              Effacer les filtres
            </button>
          )}
        </div>

        {/* CHARGEMENT */}
        {loading ? (
          <div className="company-gallery-empty">
            <ClipLoader size={32} color="#56319a" />
            <p>Chargement des portraits...</p>
          </div>
        ) : filteredPortraits.length === 0 ? (
          <div className="company-gallery-empty">
            {hasFilters ? (
              <FiSearch size={38} />
            ) : (
              <FiInbox size={38} />
            )}

            <h3>
              {hasFilters
                ? "Aucun portrait trouvé"
                : "Aucun portrait final disponible"}
            </h3>

            <p>
              {hasFilters
                ? "Modifiez votre recherche ou vos filtres."
                : "Les portraits finaux de vos collaborateurs apparaîtront ici dès leur mise à disposition."}
            </p>

            {!hasFilters && (
              <button
                type="button"
                onClick={() =>
                  navigate("/dashboard/campagnes")
                }
              >
                Voir mes campagnes
                <FiArrowRight />
              </button>
            )}
          </div>
        ) : (
          <>
            {/* GRILLE */}
            <div className="company-gallery-grid">
              {filteredPortraits.map((portrait) => {
                const displayName = getFullName(portrait);

                return (
                  <article
                    key={portrait.id}
                    className="company-gallery-card"
                  >
                    <button
                      type="button"
                      className="company-gallery-card-preview"
                      onClick={() =>
                        setSelectedId(portrait.id)
                      }
                      aria-label={`Voir le portrait de ${displayName}`}
                    >
                      {isTrustedImageUrl(portrait.imageUrl) ? (
                        <img
                          src={portrait.imageUrl}
                          alt={`Portrait final de ${displayName}`}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="company-gallery-placeholder">
                          <FiCamera />
                          <small>Aperçu indisponible</small>
                        </span>
                      )}

                      <span className="company-gallery-card-zoom">
                        <FiEye />
                        Voir
                      </span>
                    </button>

                    <div className="company-gallery-card-content">
                      <div className="company-gallery-card-top">
                        <div>
                          <h3>{displayName}</h3>
                          <span>{portrait.campaignName}</span>
                        </div>

                        <span className="company-gallery-ready-badge">
                          <FiCheckCircle />
                          Final
                        </span>
                      </div>

                      <div className="company-gallery-card-meta">
                        <span>{portrait.styleName}</span>
                        <span>{formatDate(portrait.createdAt)}</span>
                      </div>

                      <div className="company-gallery-card-actions">
                        <button
                          type="button"
                          className="company-gallery-view-btn"
                          onClick={() =>
                            setSelectedId(portrait.id)
                          }
                        >
                          <FiEye />
                          Aperçu
                        </button>

                        {portrait.canDownload &&
                          isTrustedImageUrl(
                            portrait.downloadUrl
                          ) && (
                            <button
                              type="button"
                              className="company-gallery-download-btn"
                              onClick={() =>
                                openDownload(
                                  portrait.downloadUrl
                                )
                              }
                            >
                              <FiDownload />
                              Télécharger
                            </button>
                          )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* PAGINATION */}
            {hasMore && nextCursor && (
              <div className="company-gallery-pagination">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loadingMore || refreshing}
                >
                  {loadingMore ? (
                    <>
                      <ClipLoader
                        size={15}
                        color="#56319a"
                      />
                      Chargement...
                    </>
                  ) : (
                    <>
                      Charger plus de portraits
                      <FiArrowRight />
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* INFORMATION */}
      <div className="company-gallery-security">
        <FiShield />

        <span>
          Seuls les portraits finaux autorisés sont affichés.
          Le partage public doit respecter les autorisations
          des personnes concernées. Les liens peuvent être
          révoqués et expirent automatiquement.
        </span>
      </div>

      {/* =====================================================
          MODALE DE PARTAGE
      ===================================================== */}
      {shareOpen && (
        <div
          className="company-gallery-share-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseShare();
            }
          }}
        >
          <section
            className="company-gallery-share-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Partager la galerie"
          >
            <div className="company-gallery-share-header">
              <div className="company-gallery-share-title">
                <span className="company-gallery-share-icon">
                  <FiShare2 />
                </span>

                <div>
                  <h2>Partager la galerie</h2>

                  <p>
                    Créez un lien de consultation temporaire.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="company-gallery-share-close"
                onClick={handleCloseShare}
                disabled={shareSaving || shareRevoking}
                aria-label="Fermer"
              >
                <FiX />
              </button>
            </div>

            <div className="company-gallery-share-body">
              {shareLoading ? (
                <div className="company-gallery-share-loading">
                  <ClipLoader
                    size={27}
                    color="#56319a"
                  />

                  <span>
                    Vérification du partage...
                  </span>
                </div>
              ) : (
                <>
                  {/* ERREURS */}
                  {shareError && (
                    <div
                      className="company-gallery-share-alert"
                      role="alert"
                    >
                      <FiAlertCircle />
                      <span>{shareError}</span>
                    </div>
                  )}

                  {/* SUCCÈS */}
                  {shareSuccess && (
                    <div
                      className="company-gallery-share-success"
                      role="status"
                    >
                      <FiCheckCircle />
                      <span>{shareSuccess}</span>
                    </div>
                  )}

                  {/* STATUT DU PARTAGE */}
                  <div className="company-gallery-share-status">
                    <div>
                      <span
                        className={`company-gallery-share-status-dot ${
                          shareActive ? "active" : ""
                        }`}
                      />

                      <strong>
                        {shareActive
                          ? "Un partage est actif"
                          : "Aucun partage actif"}
                      </strong>
                    </div>

                    <span
                      className={`company-gallery-share-status-badge ${
                        shareActive ? "active" : ""
                      }`}
                    >
                      {shareActive ? "Actif" : "Inactif"}
                    </span>
                  </div>

                  {/* EXPIRATION */}
                  {shareActive && shareInfo?.expiresAt && (
                    <div className="company-gallery-share-expiration">
                      <FiClock />

                      <span>
                        Expiration :{" "}
                        <strong>
                          {formatDate(shareInfo.expiresAt)}
                        </strong>
                      </span>
                    </div>
                  )}

                  {/* =================================================
                      LIEN PERSISTANT — NOUVEAU COMPORTEMENT

                      Il apparaît :
                      - juste après sa création ;
                      - après fermeture de la modale ;
                      - après actualisation ;
                      - après reconnexion ;
                      - depuis un autre appareil.

                      À condition que le backend retourne shareUrl.
                  ================================================= */}
                  {shareActive && shareUrl && (
                    <div className="company-gallery-share-link-block">
                      <label htmlFor="galleryShareUrl">
                        Lien public actif
                      </label>

                      <div className="company-gallery-share-link-input">
                        <FiLink />

                        <input
                          id="galleryShareUrl"
                          type="text"
                          value={shareUrl}
                          readOnly
                          onFocus={(event) =>
                            event.target.select()
                          }
                        />

                        <button
                          type="button"
                          onClick={handleCopyShare}
                        >
                          {copied ? (
                            <>
                              <FiCheck />
                              Copié
                            </>
                          ) : (
                            <>
                              <FiCopy />
                              Copier
                            </>
                          )}
                        </button>
                      </div>

                      <a
                        className="company-gallery-share-preview-link"
                        href={shareUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        referrerPolicy="no-referrer"
                      >
                        <FiExternalLink />
                        Ouvrir le lien public
                      </a>
                    </div>
                  )}

                  {/* ANCIEN PARTAGE SANS TOKEN CHIFFRÉ */}
                  {shareActive && !shareUrl && (
                    <div className="company-gallery-share-notice">
                      <FiInfo />

                      <p>
                        Un partage est actif, mais son lien
                        n'est pas récupérable. Il a peut-être
                        été créé avant l'enregistrement chiffré
                        des liens. Générez un nouveau lien une
                        seule fois pour pouvoir ensuite le
                        retrouver à chaque visite.
                      </p>
                    </div>
                  )}

                  {/* CONFIRMATION AVANT CRÉATION */}
                  <label className="company-gallery-share-consent">
                    <input
                      type="checkbox"
                      checked={shareConfirmed}
                      onChange={(event) =>
                        setShareConfirmed(event.target.checked)
                      }
                    />

                    <span>
                      Je confirme être autorisé à partager les
                      portraits concernés avec des personnes
                      extérieures à l'entreprise.
                    </span>
                  </label>

                  {/* CRÉATION / NOUVEAU LIEN */}
                  <div className="company-gallery-share-create">
                    <div>
                      <strong>
                        {shareActive
                          ? "Générer un nouveau lien"
                          : "Créer un lien de partage"}
                      </strong>

                      <span>
                        Valable 7 jours. Le nouveau lien
                        remplacera tout partage précédent.
                      </span>
                    </div>

                    <button
                      type="button"
                      className="company-gallery-share-primary"
                      onClick={handleCreateShare}
                      disabled={
                        !shareConfirmed ||
                        shareSaving ||
                        shareRevoking
                      }
                    >
                      {shareSaving ? (
                        <>
                          <ClipLoader
                            size={14}
                            color="#ffffff"
                          />
                          Création...
                        </>
                      ) : (
                        <>
                          <FiLink />

                          {shareActive
                            ? "Nouveau lien"
                            : "Créer le lien"}
                        </>
                      )}
                    </button>
                  </div>

                  {/* RÉVOCATION */}
                  {shareActive && (
                    <div className="company-gallery-share-danger">
                      <div>
                        <strong>Désactiver le partage</strong>

                        <span>
                          Empêche les nouveaux accès via ce lien.
                        </span>
                      </div>

                      {!revokeConfirm ? (
                        <button
                          type="button"
                          onClick={() =>
                            setRevokeConfirm(true)
                          }
                          disabled={shareSaving}
                        >
                          <FiTrash2 />
                          Désactiver
                        </button>
                      ) : (
                        <div className="company-gallery-share-confirm-actions">
                          <button
                            type="button"
                            onClick={() =>
                              setRevokeConfirm(false)
                            }
                            disabled={shareRevoking}
                          >
                            Retour
                          </button>

                          <button
                            type="button"
                            className="danger"
                            onClick={handleRevokeShare}
                            disabled={shareRevoking}
                          >
                            {shareRevoking ? (
                              <ClipLoader
                                size={14}
                                color="#ffffff"
                              />
                            ) : (
                              <FiTrash2 />
                            )}

                            Confirmer
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="company-gallery-share-footer">
              <FiShield />

              <span>
                Toute personne possédant le lien peut
                consulter les portraits autorisés pendant
                sa durée de validité. Ne le transmettez
                qu'aux destinataires prévus.
              </span>
            </div>
          </section>
        </div>
      )}

      {/* =====================================================
          MODALE PORTRAIT
      ===================================================== */}
      {selectedPortrait && (
        <div
          className="company-gallery-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedId(null);
            }
          }}
        >
          <section
            className="company-gallery-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`Portrait de ${getFullName(selectedPortrait)}`}
          >
            <div className="company-gallery-modal-header">
              <div>
                <strong>
                  {getFullName(selectedPortrait)}
                </strong>

                <span>
                  {selectedPortrait.campaignName}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedId(null)}
                aria-label="Fermer l'aperçu"
              >
                <FiX />
              </button>
            </div>

            <div className="company-gallery-modal-image">
              {filteredPortraits.length > 1 && (
                <button
                  type="button"
                  className="company-gallery-modal-arrow"
                  onClick={() => changeSelection(-1)}
                  aria-label="Portrait précédent"
                >
                  <FiChevronLeft />
                </button>
              )}

              {isTrustedImageUrl(selectedPortrait.imageUrl) ? (
                <img
                  src={selectedPortrait.imageUrl}
                  alt={`Portrait final de ${getFullName(
                    selectedPortrait
                  )}`}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="company-gallery-modal-placeholder">
                  <FiImage />
                  <span>Aperçu indisponible</span>
                </div>
              )}

              {filteredPortraits.length > 1 && (
                <button
                  type="button"
                  className="company-gallery-modal-arrow"
                  onClick={() => changeSelection(1)}
                  aria-label="Portrait suivant"
                >
                  <FiChevronRight />
                </button>
              )}
            </div>

            <div className="company-gallery-modal-footer">
              <div>
                <strong>
                  {selectedPortrait.styleName}
                </strong>

                <span>
                  {formatDate(selectedPortrait.createdAt)}
                </span>
              </div>

              {selectedPortrait.canDownload &&
                isTrustedImageUrl(
                  selectedPortrait.downloadUrl
                ) && (
                  <button
                    type="button"
                    onClick={() =>
                      openDownload(selectedPortrait.downloadUrl)
                    }
                  >
                    <FiDownload />
                    Télécharger le portrait
                  </button>
                )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default GalleryPage;
