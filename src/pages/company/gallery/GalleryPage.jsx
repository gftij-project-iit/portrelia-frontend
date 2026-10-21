
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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
  styleName:
    portrait.styleName || "Portrait professionnel",
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

const normalizeShareUrl = (value) => {
  if (typeof value !== "string") return "";

  try {
    const url = new URL(value);

    const isHttps = url.protocol === "https:";

    const isLocal =
      url.protocol === "http:" &&
      ["localhost", "127.0.0.1"].includes(
        url.hostname
      );

    const validPath =
      /^\/galerie-partagee\/[a-f0-9]{64}\/?$/.test(
        url.pathname
      );

    if ((!isHttps && !isLocal) || !validPath) {
      return "";
    }

    return url.href;
  } catch {
    return "";
  }
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.message ||
  fallback;

/* =========================================================
   COMPONENT
========================================================= */

function GalleryPage() {
  const navigate = useNavigate();

  /* =========================================================
     ETATS GALERIE PRIVEE
  ========================================================= */

  const [portraits, setPortraits] = useState([]);
  const [campaigns, setCampaigns] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [error, setError] = useState("");

  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);

  const [search, setSearch] = useState("");
  const [campaignFilter, setCampaignFilter] =
    useState("ALL");
  const [sort, setSort] = useState("NEWEST");

  const [selectedId, setSelectedId] = useState(null);

  /* =========================================================
     ETATS PARTAGE PAR CAMPAGNE
  ========================================================= */

  const [shareOpen, setShareOpen] = useState(false);

  const [shareCampaignId, setShareCampaignId] =
    useState("");

  const [shareLoading, setShareLoading] =
    useState(false);

  const [shareSaving, setShareSaving] =
    useState(false);

  const [shareRevoking, setShareRevoking] =
    useState(false);

  const [shareActive, setShareActive] =
    useState(false);

  const [shareInfo, setShareInfo] = useState(null);
  const [shareUrl, setShareUrl] = useState("");

  const [shareError, setShareError] = useState("");
  const [shareSuccess, setShareSuccess] = useState("");

  const [copied, setCopied] = useState(false);

  const [shareConfirmed, setShareConfirmed] =
    useState(false);

  const [revokeConfirm, setRevokeConfirm] =
    useState(false);

  /*
   * Evite qu'une ancienne réponse de partage
   * écrase la campagne nouvellement sélectionnée.
   */

  const shareRequestRef = useRef(0);

  /* =========================================================
     API PORTRAITS
  ========================================================= */

  const loadPortraits = useCallback(
    async ({
      cursor = null,
      append = false,
      signal,
    } = {}) => {
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

      const received = result.portraits.map(
        normalizePortrait
      );

      setPortraits((previous) => {
        if (!append) return received;

        const existingIds = new Set(
          previous.map((portrait) =>
            String(portrait.id)
          )
        );

        return [
          ...previous,
          ...received.filter(
            (portrait) =>
              !existingIds.has(String(portrait.id))
          ),
        ];
      });

      setHasMore(result.hasMore);
      setNextCursor(result.nextCursor);
    },
    []
  );

  /* =========================================================
     API CAMPAGNES DE L'ENTREPRISE
  ========================================================= */

  const loadCampaigns = useCallback(async (signal) => {
    const response = await api.get(
      "/company/gallery/campaigns",
      {
        signal,
        timeout: 60000,
      }
    );

    if (response.data?.success !== true) {
      throw new Error(
        response.data?.message ||
          "Impossible de charger les campagnes."
      );
    }

    const items =
      response.data.campaigns ??
      response.data.data?.campaigns;

    if (!Array.isArray(items)) {
      throw new Error(
        "La liste des campagnes est invalide."
      );
    }

    const validItems = items
      .filter(
        (campaign) =>
          campaign?.id != null &&
          campaign?.name
      )
      .sort((a, b) =>
        String(a.name).localeCompare(
          String(b.name),
          "fr"
        )
      );

    if (!signal?.aborted) {
      setCampaigns(validItems);
    }

    return validItems;
  }, []);

  /* =========================================================
     INITIALISATION
  ========================================================= */

  useEffect(() => {
    const controller = new AbortController();

    const initialize = async () => {
      try {
        setLoading(true);
        setError("");

        const results = await Promise.allSettled([
          loadPortraits({
            signal: controller.signal,
          }),
          loadCampaigns(controller.signal),
        ]);

        if (controller.signal.aborted) return;

        const messages = [];

        if (results[0].status === "rejected") {
          messages.push(
            getErrorMessage(
              results[0].reason,
              "Impossible de charger les portraits."
            )
          );
        }

        if (results[1].status === "rejected") {
          messages.push(
            getErrorMessage(
              results[1].reason,
              "Impossible de charger les campagnes."
            )
          );
        }

        if (messages.length > 0) {
          setError(messages.join(" "));
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    initialize();

    return () => {
      controller.abort();
      shareRequestRef.current += 1;
    };
  }, [loadPortraits, loadCampaigns]);

  /* =========================================================
     ACTUALISER
  ========================================================= */

  const handleRefresh = async () => {
    if (loading || refreshing || loadingMore) return;

    try {
      setRefreshing(true);
      setError("");

      const results = await Promise.allSettled([
        loadPortraits(),
        loadCampaigns(),
      ]);

      const failed = results.find(
        (item) => item.status === "rejected"
      );

      if (failed) {
        throw failed.reason;
      }

      setSelectedId(null);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Impossible d'actualiser la galerie."
        )
      );
    } finally {
      setRefreshing(false);
    }
  };

  /* =========================================================
     PAGINATION
  ========================================================= */

  const handleLoadMore = async () => {
    if (
      !hasMore ||
      !nextCursor ||
      loadingMore ||
      refreshing
    ) {
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
      setError(
        getErrorMessage(
          err,
          "Impossible de charger les portraits suivants."
        )
      );
    } finally {
      setLoadingMore(false);
    }
  };

  /* =========================================================
     FILTRES
  ========================================================= */

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

      const matchesSearch =
        !query || content.includes(query);

      const matchesCampaign =
        campaignFilter === "ALL" ||
        String(portrait.campaignId) ===
          campaignFilter;

      return matchesSearch && matchesCampaign;
    });

    items.sort((a, b) => {
      const dateA =
        Date.parse(a.createdAt || "") || 0;

      const dateB =
        Date.parse(b.createdAt || "") || 0;

      if (sort === "OLDEST") {
        return dateA - dateB;
      }

      if (sort === "NAME") {
        return getFullName(a).localeCompare(
          getFullName(b),
          "fr"
        );
      }

      return dateB - dateA;
    });

    return items;
  }, [
    portraits,
    search,
    campaignFilter,
    sort,
  ]);

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

      setSelectedId(
        filteredPortraits[nextIndex].id
      );
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

    window.addEventListener(
      "keydown",
      onKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        onKeyDown
      );
    };
  }, [selectedId, changeSelection]);

  const collaboratorCount = new Set(
    portraits
      .map((portrait) => portrait.participantId)
      .filter((id) => id != null)
  ).size;

  const campaignsCount = campaigns.length;

  const hasFilters =
    search.trim() !== "" ||
    campaignFilter !== "ALL" ||
    sort !== "NEWEST";

  const handleViewAll = () => {
    setSearch("");
    setCampaignFilter("ALL");
    setSort("NEWEST");

    document
      .getElementById(
        "company-gallery-portraits"
      )
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  /* =========================================================
     PARTAGE : REINITIALISATION
  ========================================================= */

  const resetShareState = () => {
    setShareActive(false);
    setShareInfo(null);
    setShareUrl("");

    setCopied(false);
    setShareConfirmed(false);
    setRevokeConfirm(false);
  };

  /* =========================================================
     API : RECUPERER LE LIEN DE LA CAMPAGNE
  ========================================================= */

  const fetchShareStatus = useCallback(
    async (campaignId) => {
      const response = await api.get(
        "/company/gallery/share",
        {
          timeout: 60000,
          params: {
            campaignId: Number(campaignId),
          },
        }
      );

      if (response.data?.success !== true) {
        throw new Error(
          response.data?.message ||
            "Impossible de vérifier le partage."
        );
      }

      return response.data;
    },
    []
  );

  /* =========================================================
     OUVERTURE DE LA MODALE
  ========================================================= */

  const handleOpenShare = () => {
    shareRequestRef.current += 1;

    setShareOpen(true);
    setShareCampaignId("");

    setShareLoading(false);
    setShareSaving(false);
    setShareRevoking(false);

    resetShareState();

    setShareError("");
    setShareSuccess("");
  };

  /* =========================================================
     CHOIX DE LA CAMPAGNE
  ========================================================= */

  const handleShareCampaignChange = async (value) => {
    const requestId = ++shareRequestRef.current;

    setShareCampaignId(value);
    setShareError("");
    setShareSuccess("");

    resetShareState();

    if (!value) {
      setShareLoading(false);
      return;
    }

    try {
      setShareLoading(true);

      const response = await fetchShareStatus(
        value
      );

      if (requestId !== shareRequestRef.current) {
        return;
      }

      const active = response.active === true;

      const url = normalizeShareUrl(
        response.shareUrl ??
        response.share?.shareUrl ??
        ""
      );

      setShareActive(active);

      setShareInfo(
        active
          ? response.share || null
          : null
      );

      setShareUrl(active ? url : "");
    } catch (err) {
      if (requestId !== shareRequestRef.current) {
        return;
      }

      setShareActive(false);
      setShareInfo(null);
      setShareUrl("");

      setShareError(
        getErrorMessage(
          err,
          "Impossible de récupérer le lien."
        )
      );
    } finally {
      if (requestId === shareRequestRef.current) {
        setShareLoading(false);
      }
    }
  };

  /* =========================================================
     FERMER LA MODALE
  ========================================================= */

  const handleCloseShare = () => {
    if (shareSaving || shareRevoking) {
      return;
    }

    shareRequestRef.current += 1;

    setShareOpen(false);
    setShareCampaignId("");
    setShareLoading(false);

    resetShareState();

    setShareError("");
    setShareSuccess("");
  };

  /* =========================================================
     CREER LE LIEN D'UNE CAMPAGNE
  ========================================================= */

  const handleCreateShare = async () => {
    if (
      !shareCampaignId ||
      !shareConfirmed ||
      shareLoading ||
      shareSaving ||
      shareRevoking
    ) {
      return;
    }

    const selectedCampaignId = shareCampaignId;
    const requestId = shareRequestRef.current;

    try {
      setShareSaving(true);

      setShareError("");
      setShareSuccess("");
      setCopied(false);

      const response = await api.post(
        "/company/gallery/share",
        {
          campaignId: Number(
            selectedCampaignId
          ),
        },
        {
          timeout: 60000,
        }
      );

      if (response.data?.success !== true) {
        throw new Error(
          response.data?.message ||
            "Impossible de créer le lien."
        );
      }

      const newUrl = normalizeShareUrl(
        response.data.shareUrl
      );

      if (!newUrl) {
        throw new Error(
          "Le backend a retourné une URL de partage invalide."
        );
      }

      if (requestId !== shareRequestRef.current) {
        return;
      }

      setShareActive(true);

      setShareInfo({
        expiresAt: response.data.expiresAt,
      });

      setShareUrl(newUrl);

      setShareConfirmed(false);
      setRevokeConfirm(false);

      setShareSuccess(
        "Lien créé avec succès pour cette campagne. Les autres campagnes ne sont pas concernées."
      );
    } catch (err) {
      if (requestId !== shareRequestRef.current) {
        return;
      }

      setShareError(
        getErrorMessage(
          err,
          "Impossible de créer le lien de partage."
        )
      );
    } finally {
      setShareSaving(false);
    }
  };

  /* =========================================================
     COPIER LE LIEN
  ========================================================= */

  const handleCopyShare = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(
        shareUrl
      );

      setCopied(true);
      setShareError("");
    } catch {
      setShareError(
        "Copie automatique impossible. Sélectionnez le lien pour le copier."
      );
    }
  };

  /* =========================================================
     DESACTIVER LE LIEN DE LA CAMPAGNE
  ========================================================= */

  const handleRevokeShare = async () => {
    if (
      !shareCampaignId ||
      !revokeConfirm ||
      shareLoading ||
      shareSaving ||
      shareRevoking
    ) {
      return;
    }

    const selectedCampaignId = shareCampaignId;
    const requestId = shareRequestRef.current;

    try {
      setShareRevoking(true);

      setShareError("");
      setShareSuccess("");

      const response = await api.delete(
        "/company/gallery/share",
        {
          timeout: 60000,
          params: {
            campaignId: Number(
              selectedCampaignId
            ),
          },
        }
      );

      if (response.data?.success !== true) {
        throw new Error(
          response.data?.message ||
            "Révocation non confirmée."
        );
      }

      if (requestId !== shareRequestRef.current) {
        return;
      }

      resetShareState();

      setShareSuccess(
        "Le lien de cette campagne a été désactivé. Les autres liens restent actifs."
      );
    } catch (err) {
      if (requestId !== shareRequestRef.current) {
        return;
      }

      setShareError(
        getErrorMessage(
          err,
          "Impossible de désactiver le lien."
        )
      );
    } finally {
      setShareRevoking(false);
    }
  };

  /* =========================================================
     CAMPAGNE SELECTIONNEE POUR LE PARTAGE
  ========================================================= */

  const selectedShareCampaign = campaigns.find(
    (campaign) =>
      String(campaign.id) ===
      String(shareCampaignId)
  );

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
            Retrouvez les portraits finaux de vos
            collaborateurs, regroupés depuis toutes
            vos campagnes.
          </p>
        </div>

        <button
          type="button"
          className="company-gallery-refresh"
          onClick={handleRefresh}
          disabled={
            loading ||
            refreshing ||
            loadingMore
          }
        >
          <FiRefreshCw
            className={
              refreshing
                ? "company-gallery-spin"
                : ""
            }
          />

          {refreshing
            ? "Actualisation..."
            : "Actualiser"}
        </button>
      </header>

      {/* ALERTES */}

      {error && (
        <div
          className="company-gallery-alert"
          role="alert"
        >
          <FiAlertCircle />

          <span>{error}</span>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={
              loading || refreshing
            }
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
                : `${portraits.length}${
                    hasMore ? "+" : ""
                  }`}
            </strong>

            <span>
              Portraits chargés
            </span>
          </div>
        </article>

        <article>
          <span className="company-gallery-summary-icon blue">
            <FiUsers />
          </span>

          <div>
            <strong>
              {loading
                ? "—"
                : collaboratorCount}
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
              {loading
                ? "—"
                : campaignsCount}
            </strong>

            <span>Campagnes</span>
          </div>
        </article>
      </section>

      {/* ACCES RAPIDES */}

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
            <strong>
              Voir tous les portraits
            </strong>

            <small>
              Afficher les portraits finaux
              de toutes les campagnes
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
            <strong>
              Partager une campagne
            </strong>

            <small>
              Créer ou gérer un lien public
              propre à chaque campagne
            </small>
          </span>

          <FiArrowRight className="company-gallery-quick-arrow" />
        </button>
      </section>

      {/* GALERIE PRIVEE */}

      <section
        id="company-gallery-portraits"
        className="company-gallery-section"
      >
        <div className="company-gallery-section-heading">
          <div>
            <h2>Tous les portraits</h2>

            <p>
              Consultez les portraits finaux de
              votre entreprise depuis un seul espace.
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
                setCampaignFilter(
                  event.target.value
                )
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
              <option value="NEWEST">
                Plus récents
              </option>

              <option value="OLDEST">
                Plus anciens
              </option>

              <option value="NAME">
                Nom A–Z
              </option>
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

        {/* CHARGEMENT / VIDE */}

        {loading ? (
          <div className="company-gallery-empty">
            <ClipLoader
              size={32}
              color="#56319a"
            />

            <p>
              Chargement des portraits...
            </p>
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
                  navigate(
                    "/dashboard/campagnes"
                  )
                }
              >
                Voir mes campagnes
                <FiArrowRight />
              </button>
            )}
          </div>
        ) : (
          <>
            {/* CARTES PORTRAITS */}

            <div className="company-gallery-grid">
              {filteredPortraits.map(
                (portrait) => {
                  const displayName =
                    getFullName(portrait);

                  return (
                    <article
                      key={portrait.id}
                      className="company-gallery-card"
                    >
                      <button
                        type="button"
                        className="company-gallery-card-preview"
                        onClick={() =>
                          setSelectedId(
                            portrait.id
                          )
                        }
                        aria-label={`Voir le portrait de ${displayName}`}
                      >
                        {isTrustedImageUrl(
                          portrait.imageUrl
                        ) ? (
                          <img
                            src={
                              portrait.imageUrl
                            }
                            alt={`Portrait final de ${displayName}`}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <span className="company-gallery-placeholder">
                            <FiCamera />
                            <small>
                              Aperçu indisponible
                            </small>
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
                            <h3>
                              {displayName}
                            </h3>

                            <span>
                              {
                                portrait.campaignName
                              }
                            </span>
                          </div>

                          <span className="company-gallery-ready-badge">
                            <FiCheckCircle />
                            Final
                          </span>
                        </div>

                        <div className="company-gallery-card-meta">
                          <span>
                            {
                              portrait.styleName
                            }
                          </span>

                          <span>
                            {formatDate(
                              portrait.createdAt
                            )}
                          </span>
                        </div>

                        <div className="company-gallery-card-actions">
                          <button
                            type="button"
                            className="company-gallery-view-btn"
                            onClick={() =>
                              setSelectedId(
                                portrait.id
                              )
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
                                  window.open(
                                    portrait.downloadUrl,
                                    "_blank",
                                    "noopener,noreferrer"
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
                }
              )}
            </div>

            {/* PAGINATION */}

            {hasMore && nextCursor && (
              <div className="company-gallery-pagination">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={
                    loadingMore ||
                    refreshing
                  }
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

      {/* INFORMATION SECURITE */}

      <div className="company-gallery-security">
        <FiShield />

        <span>
          Seuls les portraits finaux autorisés
          sont affichés. Chaque partage public
          concerne une seule campagne. Les liens
          expirent automatiquement et peuvent
          être désactivés.
        </span>
      </div>

      {/* =====================================================
          MODALE PARTAGE PAR CAMPAGNE
      ===================================================== */}

      {shareOpen && (
        <div
          className="company-gallery-share-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              handleCloseShare();
            }
          }}
        >
          <section
            className="company-gallery-share-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Partager une campagne"
          >
            {/* EN-TETE */}

            <div className="company-gallery-share-header">
              <div className="company-gallery-share-title">
                <span className="company-gallery-share-icon">
                  <FiShare2 />
                </span>

                <div>
                  <h2>
                    Partager une campagne
                  </h2>

                  <p>
                    Créez un lien de consultation
                    temporaire pour une campagne précise.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="company-gallery-share-close"
                onClick={handleCloseShare}
                disabled={
                  shareSaving ||
                  shareRevoking
                }
                aria-label="Fermer"
              >
                <FiX />
              </button>
            </div>

            {/* CONTENU */}

            <div className="company-gallery-share-body">
              {/* ==========================================
                  SELECTEUR DE CAMPAGNE
                  TOUJOURS VISIBLE
              ========================================== */}

              <div
                className="company-gallery-share-campaign-selector"
                style={{
                  marginBottom: 22,
                  padding: 18,
                  background: "#f8f6fc",
                  border:
                    "1px solid #e7dff1",
                  borderRadius: 14,
                }}
              >
                <label
                  htmlFor="companyShareCampaign"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    marginBottom: 12,
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#342846",
                  }}
                >
                  <FiGrid />
                  Sélectionnez la campagne à partager
                </label>

                <select
                  id="companyShareCampaign"
                  value={shareCampaignId}
                  onChange={(event) =>
                    handleShareCampaignChange(
                      event.target.value
                    )
                  }
                  disabled={
                    shareSaving ||
                    shareRevoking
                  }
                  required
                  style={{
                    display: "block",
                    width: "100%",
                    minHeight: 48,
                    padding: "0 14px",
                    fontSize: 14,
                    fontWeight: 500,
                    fontFamily: "inherit",
                    color: "#30243e",
                    background: "#ffffff",
                    border:
                      "1px solid #d8cfe5",
                    borderRadius: 10,
                    outlineOffset: 3,
                    cursor: "pointer",
                  }}
                >
                  <option value="">
                    -- Choisir une campagne --
                  </option>

                  {campaigns.map(
                    (campaign) => (
                      <option
                        key={campaign.id}
                        value={String(
                          campaign.id
                        )}
                      >
                        {campaign.name}
                      </option>
                    )
                  )}
                </select>

                {campaigns.length === 0 && (
                  <p
                    style={{
                      marginTop: 12,
                      fontSize: 13,
                      color: "#80647d",
                    }}
                  >
                    Aucune campagne disponible.
                    Vérifiez que vos campagnes
                    sont bien créées.
                  </p>
                )}

                {selectedShareCampaign && (
                  <p
                    style={{
                      marginTop: 12,
                      fontSize: 13,
                      color: "#5f5272",
                    }}
                  >
                    <FiCheckCircle
                      style={{
                        display: "inline",
                        marginRight: 6,
                        verticalAlign:
                          "middle",
                      }}
                    />

                    Seuls les portraits finaux de
                    la campagne{" "}
                    <strong>
                      {
                        selectedShareCampaign.name
                      }
                    </strong>{" "}
                    seront accessibles avec ce lien.
                  </p>
                )}
              </div>

              {/* AUCUNE CAMPAGNE SELECTIONNEE */}

              {!shareCampaignId ? (
                <div className="company-gallery-share-notice">
                  <FiInfo />

                  <p>
                    Choisissez d'abord une campagne
                    dans le menu ci-dessus. Vous pourrez
                    ensuite consulter son lien actif,
                    créer un nouveau lien ou désactiver
                    son partage.
                  </p>
                </div>
              ) : shareLoading ? (
                /* CHARGEMENT */

                <div className="company-gallery-share-loading">
                  <ClipLoader
                    size={27}
                    color="#56319a"
                  />

                  <span>
                    Recherche du lien de cette campagne...
                  </span>
                </div>
              ) : (
                <>
                  {/* ERREUR */}

                  {shareError && (
                    <div
                      className="company-gallery-share-alert"
                      role="alert"
                    >
                      <FiAlertCircle />
                      <span>
                        {shareError}
                      </span>
                    </div>
                  )}

                  {/* SUCCES */}

                  {shareSuccess && (
                    <div
                      className="company-gallery-share-success"
                      role="status"
                    >
                      <FiCheckCircle />

                      <span>
                        {shareSuccess}
                      </span>
                    </div>
                  )}

                  {/* STATUT */}

                  <div className="company-gallery-share-status">
                    <div>
                      <span
                        className={`company-gallery-share-status-dot ${
                          shareActive
                            ? "active"
                            : ""
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
                        shareActive
                          ? "active"
                          : ""
                      }`}
                    >
                      {shareActive
                        ? "Actif"
                        : "Inactif"}
                    </span>
                  </div>

                  {/* EXPIRATION */}

                  {shareActive &&
                    shareInfo?.expiresAt && (
                      <div className="company-gallery-share-expiration">
                        <FiClock />

                        <span>
                          Expiration :{" "}
                          <strong>
                            {formatDate(
                              shareInfo.expiresAt
                            )}
                          </strong>
                        </span>
                      </div>
                    )}

                  {/* LIEN ACTIF */}

                  {shareActive &&
                    shareUrl && (
                      <div className="company-gallery-share-link-block">
                        <label htmlFor="galleryShareUrl">
                          Lien public de la campagne
                        </label>

                        <div className="company-gallery-share-link-input">
                          <FiLink />

                          <input
                            id="galleryShareUrl"
                            type="text"
                            value={
                              shareUrl
                            }
                            readOnly
                            onFocus={(
                              event
                            ) =>
                              event.target.select()
                            }
                          />

                          <button
                            type="button"
                            onClick={
                              handleCopyShare
                            }
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
                          href={
                            shareUrl
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          referrerPolicy="no-referrer"
                        >
                          <FiExternalLink />

                          Ouvrir le lien public
                        </a>
                      </div>
                    )}

                  {/* ANCIEN LIEN NON RECUPERABLE */}

                  {shareActive &&
                    !shareUrl && (
                      <div className="company-gallery-share-notice">
                        <FiInfo />

                        <p>
                          Un partage est actif pour
                          cette campagne, mais son URL
                          est indisponible. Vous pouvez
                          générer un nouveau lien
                          pour le remplacer.
                        </p>
                      </div>
                    )}

                  {/* AUTORISATION */}

                  <label className="company-gallery-share-consent">
                    <input
                      type="checkbox"
                      checked={
                        shareConfirmed
                      }
                      onChange={(
                        event
                      ) =>
                        setShareConfirmed(
                          event.target.checked
                        )
                      }
                    />

                    <span>
                      Je confirme être autorisé à
                      partager les portraits de
                      cette campagne avec des
                      personnes extérieures à
                      l'entreprise.
                    </span>
                  </label>

                  {/* CREATION */}

                  <div className="company-gallery-share-create">
                    <div>
                      <strong>
                        {shareActive
                          ? "Générer un nouveau lien"
                          : "Créer un lien de partage"}
                      </strong>

                      <span>
                        Valable 7 jours.
                        Le nouveau lien remplacera
                        uniquement celui de cette
                        campagne. Les liens des autres
                        campagnes resteront actifs.
                      </span>
                    </div>

                    <button
                      type="button"
                      className="company-gallery-share-primary"
                      onClick={
                        handleCreateShare
                      }
                      disabled={
                        !shareCampaignId ||
                        !shareConfirmed ||
                        shareLoading ||
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

                  {/* REVOCATION */}

                  {shareActive && (
                    <div className="company-gallery-share-danger">
                      <div>
                        <strong>
                          Désactiver le partage
                        </strong>

                        <span>
                          Désactive uniquement le lien
                          de cette campagne.
                        </span>
                      </div>

                      {!revokeConfirm ? (
                        <button
                          type="button"
                          onClick={() =>
                            setRevokeConfirm(
                              true
                            )
                          }
                          disabled={
                            shareSaving
                          }
                        >
                          <FiTrash2 />

                          Désactiver
                        </button>
                      ) : (
                        <div className="company-gallery-share-confirm-actions">
                          <button
                            type="button"
                            onClick={() =>
                              setRevokeConfirm(
                                false
                              )
                            }
                            disabled={
                              shareRevoking
                            }
                          >
                            Retour
                          </button>

                          <button
                            type="button"
                            className="danger"
                            onClick={
                              handleRevokeShare
                            }
                            disabled={
                              shareRevoking
                            }
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

            {/* FOOTER */}

            <div className="company-gallery-share-footer">
              <FiShield />

              <span>
                Toute personne possédant le lien
                peut consulter les portraits finaux
                de la campagne sélectionnée pendant
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
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedId(null);
            }
          }}
        >
          <section
            className="company-gallery-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`Portrait de ${getFullName(
              selectedPortrait
            )}`}
          >
            <div className="company-gallery-modal-header">
              <div>
                <strong>
                  {getFullName(
                    selectedPortrait
                  )}
                </strong>

                <span>
                  {
                    selectedPortrait.campaignName
                  }
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedId(null)
                }
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
                  onClick={() =>
                    changeSelection(-1)
                  }
                  aria-label="Portrait précédent"
                >
                  <FiChevronLeft />
                </button>
              )}

              {isTrustedImageUrl(
                selectedPortrait.imageUrl
              ) ? (
                <img
                  src={
                    selectedPortrait.imageUrl
                  }
                  alt={`Portrait final de ${getFullName(
                    selectedPortrait
                  )}`}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="company-gallery-modal-placeholder">
                  <FiImage />

                  <span>
                    Aperçu indisponible
                  </span>
                </div>
              )}

              {filteredPortraits.length > 1 && (
                <button
                  type="button"
                  className="company-gallery-modal-arrow"
                  onClick={() =>
                    changeSelection(1)
                  }
                  aria-label="Portrait suivant"
                >
                  <FiChevronRight />
                </button>
              )}
            </div>

            <div className="company-gallery-modal-footer">
              <div>
                <strong>
                  {
                    selectedPortrait.styleName
                  }
                </strong>

                <span>
                  {formatDate(
                    selectedPortrait.createdAt
                  )}
                </span>
              </div>

              {selectedPortrait.canDownload &&
                isTrustedImageUrl(
                  selectedPortrait.downloadUrl
                ) && (
                  <button
                    type="button"
                    onClick={() =>
                      window.open(
                        selectedPortrait.downloadUrl,
                        "_blank",
                        "noopener,noreferrer"
                      )
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
