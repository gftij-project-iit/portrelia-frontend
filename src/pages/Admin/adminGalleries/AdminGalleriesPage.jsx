
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  FiImage,
  FiSearch,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiExternalLink,
  FiRefreshCw,
  FiFilter,
  FiUsers,
  FiCalendar,
  FiHome,
  FiShare2,
  FiCopy,
  FiCheck,
  FiEye,
  FiX,
  FiLink,
  FiInbox,
  FiChevronRight,
} from "react-icons/fi";

import api from "../../../services/api";
import "./AdminGalleriesPage.css";

/* =========================================================
   HELPERS
========================================================= */

const extractArray = (response, names = []) => {
  const root = response?.data ?? response ?? {};

  const containers = [
    root,
    root.data,
    root.data?.data,
    root.result,
    root.results,
  ];

  for (const container of containers) {
    if (Array.isArray(container)) {
      return container;
    }

    if (!container || typeof container !== "object") {
      continue;
    }

    for (const name of names) {
      if (Array.isArray(container[name])) {
        return container[name];
      }
    }

    if (Array.isArray(container.items)) {
      return container.items;
    }

    if (Array.isArray(container.rows)) {
      return container.rows;
    }
  }

  return [];
};

const getId = (item) =>
  item?.id ??
  item?.companyId ??
  item?.campaignId ??
  null;

const getCompanyName = (company) =>
  company?.name ??
  company?.companyName ??
  company?.company_name ??
  company?.legalName ??
  company?.businessName ??
  `Entreprise ${getId(company) ?? ""}`;

const getCampaignName = (campaign) =>
  campaign?.name ??
  campaign?.campaignName ??
  campaign?.campaign_name ??
  `Campagne ${getId(campaign) ?? ""}`;

const getCampaignCompanyId = (campaign) =>
  campaign?.companyId ??
  campaign?.company_id ??
  campaign?.company?.id ??
  null;

const uniqueById = (items) => {
  const seen = new Set();

  return items.filter((item) => {
    const id = getId(item);

    if (id == null || seen.has(String(id))) {
      return false;
    }

    seen.add(String(id));
    return true;
  });
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const isExpired = (gallery, referenceTime) => {
  if (!gallery?.expiresAt || !referenceTime) {
    return false;
  }

  const expiration = Date.parse(gallery.expiresAt);

  return (
    Number.isFinite(expiration) &&
    expiration <= referenceTime
  );
};

const getSelectedPortrait = (gallery) =>
  gallery?.selectedPortrait ??
  gallery?.finalPortrait ??
  null;

const getStatus = (gallery, referenceTime) => {
  if (isExpired(gallery, referenceTime)) {
    return {
      key: "EXPIRED",
      label: "Expirée",
    };
  }

  if (getSelectedPortrait(gallery)?.id) {
    return {
      key: "VALIDATED",
      label: "Portrait sélectionné",
    };
  }

  if (gallery?.publishedAt) {
    return {
      key: "WAITING",
      label: "En attente du choix",
    };
  }

  return {
    key: "OTHER",
    label: "Non publiée",
  };
};

const getParticipantName = (gallery) => {
  const first =
    gallery?.participantFirstName ??
    gallery?.participant?.firstName ??
    "";

  const last =
    gallery?.participantLastName ??
    gallery?.participant?.lastName ??
    "";

  return `${first} ${last}`.trim() || "Participant";
};

const getParticipantEmail = (gallery) =>
  gallery?.participantEmail ??
  gallery?.participant?.email ??
  "";

const getGalleryCompanyId = (gallery) =>
  gallery?.companyId ??
  gallery?.company?.id ??
  null;

const getGalleryCampaignId = (gallery) =>
  gallery?.campaignId ??
  gallery?.campaign?.id ??
  null;

const getGalleryCampaignName = (gallery) =>
  gallery?.campaignName ??
  gallery?.campaign?.name ??
  "Campagne";

const validImageUrl = (value) => {
  if (typeof value !== "string") return false;

  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
};

const validShareUrl = (value) => {
  if (typeof value !== "string") return false;

  try {
    const url = new URL(value);

    const secure = url.protocol === "https:";
    const local =
      url.protocol === "http:" &&
      ["localhost", "127.0.0.1"].includes(
        url.hostname
      );

    return (
      (secure || local) &&
      /^\/galerie-partagee\/[a-f0-9]{64}\/?$/.test(
        url.pathname
      )
    );
  } catch {
    return false;
  }
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.message ||
  fallback;

/* =========================================================
   PAGE ADMIN GALERIES
========================================================= */

function AdminGalleriesPage() {
  const [companies, setCompanies] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [galleries, setGalleries] = useState([]);

  const [companyId, setCompanyId] = useState("");
  const [campaignId, setCampaignId] = useState("");

  const [loadingCompanies, setLoadingCompanies] =
    useState(true);

  const [loadingCampaigns, setLoadingCampaigns] =
    useState(false);

  const [loadingGalleries, setLoadingGalleries] =
    useState(false);

  const [loadingShare, setLoadingShare] =
    useState(false);

  const [shareLoaded, setShareLoaded] =
    useState(false);

  const [shareError, setShareError] = useState("");
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [share, setShare] = useState(null);
  const [copied, setCopied] = useState(false);
  const [preview, setPreview] = useState(null);

  const [referenceTime, setReferenceTime] =
    useState(0);

  const companyRequestRef = useRef(0);
  const campaignRequestRef = useRef(0);
  const galleryRequestRef = useRef(0);
  const shareRequestRef = useRef(0);

  const isBusy =
    loadingCompanies ||
    loadingCampaigns ||
    loadingGalleries ||
    loadingShare;

  /* =========================================================
     API ENTREPRISES
  ========================================================= */

  const fetchCompanies = useCallback(async (signal) => {
    const response = await api.get(
      "/admin/companies",
      {
        signal,
        timeout: 60000,
      }
    );

    if (response.data?.success === false) {
      throw new Error(
        response.data?.message ||
          "Impossible de charger les entreprises."
      );
    }

    const items = extractArray(response, [
      "companies",
      "entreprises",
    ]);

    return uniqueById(items).sort((a, b) =>
      getCompanyName(a).localeCompare(
        getCompanyName(b),
        "fr"
      )
    );
  }, []);

  /* =========================================================
     API CAMPAGNES
  ========================================================= */

  const fetchCampaigns = useCallback(
    async (selectedCompany) => {
      const response = await api.get(
        "/admin/campaigns",
        {
          params: {
            companyId: selectedCompany,
          },
          timeout: 60000,
        }
      );

      if (response.data?.success === false) {
        throw new Error(
          response.data?.message ||
            "Impossible de charger les campagnes."
        );
      }

      const items = extractArray(response, [
        "campaigns",
        "campagnes",
      ]);

      return uniqueById(
        items.filter((campaign) => {
          const ownerId =
            getCampaignCompanyId(campaign);

          return (
            ownerId != null &&
            String(ownerId) === String(selectedCompany)
          );
        })
      ).sort((a, b) =>
        getCampaignName(a).localeCompare(
          getCampaignName(b),
          "fr"
        )
      );
    },
    []
  );

  /* =========================================================
     API GALERIES
  ========================================================= */

  const fetchGalleries = useCallback(
    async (selectedCompany, selectedCampaign) => {
      const response = await api.get(
        "/admin/galleries",
        {
          params: {
            companyId: selectedCompany,
            campaignId: selectedCampaign,
          },
          timeout: 60000,
        }
      );

      if (response.data?.success === false) {
        throw new Error(
          response.data?.message ||
            "Impossible de charger les galeries."
        );
      }

      const items = extractArray(response, [
        "galleries",
      ]);

      return items.filter((gallery) => {
        const ownerCompanyId =
          getGalleryCompanyId(gallery);

        const ownerCampaignId =
          getGalleryCampaignId(gallery);

        return (
          ownerCompanyId != null &&
          ownerCampaignId != null &&
          String(ownerCompanyId) ===
            String(selectedCompany) &&
          String(ownerCampaignId) ===
            String(selectedCampaign)
        );
      });
    },
    []
  );

  /* =========================================================
     API PARTAGE PUBLIC D'UNE CAMPAGNE
  =========================================================
     GET /admin/companies/:companyId/
         campaigns/:campaignId/gallery-share

     Le lien est récupéré après la sélection
     de l'entreprise ET de la campagne.
  ========================================================= */

  const fetchCampaignShare = useCallback(
    async (selectedCompany, selectedCampaign) => {
      const response = await api.get(
        `/admin/companies/${encodeURIComponent(
          selectedCompany
        )}/campaigns/${encodeURIComponent(
          selectedCampaign
        )}/gallery-share`,
        {
          timeout: 60000,
        }
      );

      if (response.data?.success !== true) {
        throw new Error(
          response.data?.message ||
            "Impossible de récupérer le lien public."
        );
      }

      const active = response.data.active === true;

      return {
        share: active
          ? {
              ...(response.data.share || {}),
              shareUrl:
                response.data.shareUrl ??
                response.data.share?.shareUrl ??
                null,
            }
          : null,
        receivedAt: Date.now(),
      };
    },
    []
  );

  /* =========================================================
     CHARGEMENT INITIAL
  ========================================================= */

  useEffect(() => {
    const controller = new AbortController();
    const requestId = ++companyRequestRef.current;

    const initialize = async () => {
      try {
        const items = await fetchCompanies(
          controller.signal
        );

        if (
          controller.signal.aborted ||
          requestId !== companyRequestRef.current
        ) {
          return;
        }

        setCompanies(items);
        setError("");
      } catch (err) {
        if (
          controller.signal.aborted ||
          requestId !== companyRequestRef.current
        ) {
          return;
        }

        console.error(
          "[ADMIN GALLERIES] COMPANIES:",
          err
        );

        setError(
          getErrorMessage(
            err,
            "Impossible de charger les entreprises."
          )
        );
      } finally {
        if (
          !controller.signal.aborted &&
          requestId === companyRequestRef.current
        ) {
          setLoadingCompanies(false);
        }
      }
    };

    initialize();

    return () => {
      controller.abort();
      companyRequestRef.current += 1;
      campaignRequestRef.current += 1;
      galleryRequestRef.current += 1;
      shareRequestRef.current += 1;
    };
  }, [fetchCompanies]);

  /* =========================================================
     CHANGEMENT D'ENTREPRISE
  ========================================================= */

  const handleCompanyChange = async (value) => {
    const requestId = ++campaignRequestRef.current;

    ++galleryRequestRef.current;
    ++shareRequestRef.current;

    setCompanyId(value);
    setCampaignId("");

    setCampaigns([]);
    setGalleries([]);

    setShare(null);
    setShareLoaded(false);
    setShareError("");

    setSearch("");
    setStatusFilter("ALL");

    setPreview(null);
    setCopied(false);
    setError("");

    setLoadingGalleries(false);
    setLoadingShare(false);

    if (!value) {
      setLoadingCampaigns(false);
      return;
    }

    try {
      setLoadingCampaigns(true);

      const items = await fetchCampaigns(value);

      if (
        requestId !== campaignRequestRef.current
      ) {
        return;
      }

      setCampaigns(items);
    } catch (err) {
      if (
        requestId !== campaignRequestRef.current
      ) {
        return;
      }

      console.error(
        "[ADMIN GALLERIES] CAMPAIGNS:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Impossible de charger les campagnes."
        )
      );
    } finally {
      if (
        requestId === campaignRequestRef.current
      ) {
        setLoadingCampaigns(false);
      }
    }
  };

  /* =========================================================
     CHARGEMENT DU PARTAGE DE LA CAMPAGNE
  ========================================================= */

  const loadShare = async (
    selectedCompany,
    selectedCampaign,
    requestId
  ) => {
    try {
      setLoadingShare(true);
      setShareLoaded(false);
      setShareError("");
      setShare(null);

      const result = await fetchCampaignShare(
        selectedCompany,
        selectedCampaign
      );

      if (
        requestId !== shareRequestRef.current
      ) {
        return;
      }

      setShare(result.share);
      setShareLoaded(true);
      setReferenceTime(result.receivedAt);
    } catch (err) {
      if (
        requestId !== shareRequestRef.current
      ) {
        return;
      }

      console.error(
        "[ADMIN GALLERIES] SHARE:",
        err
      );

      setShare(null);
      setShareLoaded(false);

      setShareError(
        getErrorMessage(
          err,
          "Impossible de récupérer le partage."
        )
      );
    } finally {
      if (
        requestId === shareRequestRef.current
      ) {
        setLoadingShare(false);
      }
    }
  };

  /* =========================================================
     CHANGEMENT DE CAMPAGNE
  ========================================================= */

  const handleCampaignChange = async (value) => {
    const galleryRequestId =
      ++galleryRequestRef.current;

    const shareRequestId =
      ++shareRequestRef.current;

    setCampaignId(value);
    setGalleries([]);

    setShare(null);
    setShareLoaded(false);
    setShareError("");

    setSearch("");
    setStatusFilter("ALL");

    setPreview(null);
    setCopied(false);
    setError("");

    if (!value || !companyId) {
      setLoadingGalleries(false);
      setLoadingShare(false);
      return;
    }

    /*
     * Chargement indépendant :
     * - galeries
     * - partage de cette campagne
     */

    const sharePromise = loadShare(
      companyId,
      value,
      shareRequestId
    );

    try {
      setLoadingGalleries(true);

      const items = await fetchGalleries(
        companyId,
        value
      );

      if (
        galleryRequestId !== galleryRequestRef.current
      ) {
        return;
      }

      setGalleries(items);
      setReferenceTime(Date.now());
    } catch (err) {
      if (
        galleryRequestId !== galleryRequestRef.current
      ) {
        return;
      }

      console.error(
        "[ADMIN GALLERIES] GALLERIES:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Impossible de charger les galeries."
        )
      );
    } finally {
      if (
        galleryRequestId === galleryRequestRef.current
      ) {
        setLoadingGalleries(false);
      }
    }

    await sharePromise;
  };

  /* =========================================================
     ACTUALISATION
  ========================================================= */

  const handleRefresh = async () => {
    if (isBusy) return;

    setError("");
    setShareError("");
    setCopied(false);
    setPreview(null);

    if (!companyId) {
      const requestId = ++companyRequestRef.current;

      try {
        setLoadingCompanies(true);

        const items = await fetchCompanies();

        if (
          requestId !== companyRequestRef.current
        ) {
          return;
        }

        setCompanies(items);
      } catch (err) {
        if (
          requestId !== companyRequestRef.current
        ) {
          return;
        }

        setError(
          getErrorMessage(
            err,
            "Impossible d'actualiser les entreprises."
          )
        );
      } finally {
        if (
          requestId === companyRequestRef.current
        ) {
          setLoadingCompanies(false);
        }
      }

      return;
    }

    const campaignRequestId =
      ++campaignRequestRef.current;

    const reloadCampaigns = async () => {
      try {
        setLoadingCampaigns(true);

        const items = await fetchCampaigns(companyId);

        if (
          campaignRequestId !== campaignRequestRef.current
        ) {
          return;
        }

        setCampaigns(items);
      } catch (err) {
        if (
          campaignRequestId !== campaignRequestRef.current
        ) {
          return;
        }

        setError(
          getErrorMessage(
            err,
            "Impossible d'actualiser les campagnes."
          )
        );
      } finally {
        if (
          campaignRequestId === campaignRequestRef.current
        ) {
          setLoadingCampaigns(false);
        }
      }
    };

    const tasks = [reloadCampaigns()];

    if (campaignId) {
      const galleryRequestId =
        ++galleryRequestRef.current;

      const shareRequestId =
        ++shareRequestRef.current;

      const reloadGalleries = async () => {
        try {
          setLoadingGalleries(true);

          const items = await fetchGalleries(
            companyId,
            campaignId
          );

          if (
            galleryRequestId !==
            galleryRequestRef.current
          ) {
            return;
          }

          setGalleries(items);
          setReferenceTime(Date.now());
        } catch (err) {
          if (
            galleryRequestId !==
            galleryRequestRef.current
          ) {
            return;
          }

          setError(
            getErrorMessage(
              err,
              "Impossible d'actualiser les galeries."
            )
          );
        } finally {
          if (
            galleryRequestId ===
            galleryRequestRef.current
          ) {
            setLoadingGalleries(false);
          }
        }
      };

      tasks.push(reloadGalleries());

      tasks.push(
        loadShare(
          companyId,
          campaignId,
          shareRequestId
        )
      );
    }

    await Promise.all(tasks);
  };

  /* =========================================================
     SELECTIONS
  ========================================================= */

  const selectedCompany = useMemo(
    () =>
      companies.find(
        (company) =>
          String(getId(company)) === String(companyId)
      ) || null,
    [companies, companyId]
  );

  const selectedCampaign = useMemo(
    () =>
      campaigns.find(
        (campaign) =>
          String(getId(campaign)) === String(campaignId)
      ) || null,
    [campaigns, campaignId]
  );

  /* =========================================================
     FILTRES
  ========================================================= */

  const filteredGalleries = useMemo(() => {
    const query = search.trim().toLowerCase();

    return galleries.filter((gallery) => {
      const searchable = [
        getParticipantName(gallery),
        getParticipantEmail(gallery),
        getGalleryCampaignName(gallery),
      ]
        .join(" ")
        .toLowerCase();

      const status = getStatus(
        gallery,
        referenceTime
      );

      return (
        (!query || searchable.includes(query)) &&
        (statusFilter === "ALL" ||
          status.key === statusFilter)
      );
    });
  }, [
    galleries,
    search,
    statusFilter,
    referenceTime,
  ]);

  /* =========================================================
     STATISTIQUES
  ========================================================= */

  const stats = useMemo(
    () => ({
      total: galleries.length,

      selected: galleries.filter(
        (gallery) =>
          Boolean(getSelectedPortrait(gallery)?.id)
      ).length,

      waiting: galleries.filter(
        (gallery) =>
          !getSelectedPortrait(gallery)?.id &&
          Boolean(gallery.publishedAt) &&
          !isExpired(gallery, referenceTime)
      ).length,

      expired: galleries.filter(
        (gallery) =>
          isExpired(gallery, referenceTime)
      ).length,
    }),
    [galleries, referenceTime]
  );

  /* =========================================================
     PARTAGE PUBLIC
  ========================================================= */

  const hasActiveShare = Boolean(
    share?.expiresAt &&
      referenceTime > 0 &&
      Date.parse(share.expiresAt) > referenceTime
  );

  const shareUrl =
    validShareUrl(share?.shareUrl)
      ? share.shareUrl
      : "";

  const copyShare = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setShareError("");
    } catch {
      setCopied(false);

      setShareError(
        "Impossible de copier automatiquement le lien."
      );
    }
  };

  /* =========================================================
     STATUT VISUEL
  ========================================================= */

  const renderStatus = (gallery) => {
    const status = getStatus(
      gallery,
      referenceTime
    );

    return (
      <span
        className={
          `admin-gallery-status ` +
          `admin-gallery-status-${status.key.toLowerCase()}`
        }
      >
        {status.key === "VALIDATED" && (
          <FiCheckCircle />
        )}

        {status.key === "WAITING" && (
          <FiClock />
        )}

        {status.key === "EXPIRED" && (
          <FiAlertCircle />
        )}

        {status.label}
      </span>
    );
  };

  /* =========================================================
     RENDU
  ========================================================= */

  return (
    <div className="admin-galleries-page">
      {/* HEADER */}

      <header className="admin-galleries-header">
        <div className="admin-galleries-header-copy">
          <span className="admin-galleries-eyebrow">
            PRODUCTION
          </span>

          <h1>Galeries</h1>

          <p>
            Explorez les entreprises, leurs campagnes,
            les portraits finaux des participants
            et les liens de partage.
          </p>
        </div>

        <button
          type="button"
          className="admin-galleries-refresh"
          onClick={handleRefresh}
          disabled={isBusy}
        >
          <FiRefreshCw
            className={
              isBusy
                ? "admin-galleries-spinner"
                : ""
            }
          />

          Actualiser
        </button>
      </header>

      {/* FILTRES ENTREPRISE / CAMPAGNE */}

      <section className="admin-galleries-selection">
        <div className="admin-galleries-selection-heading">
          <div className="admin-galleries-selection-icon">
            <FiFilter />
          </div>

          <div>
            <h2>Explorer les galeries</h2>

            <p>
              Choisissez une entreprise, puis une campagne.
            </p>
          </div>
        </div>

        <div className="admin-galleries-selection-grid">
          <label className="admin-galleries-selection-field">
            <span>
              <FiHome />
              1. Entreprise
            </span>

            <select
              value={companyId}
              onChange={(event) =>
                handleCompanyChange(
                  event.target.value
                )
              }
              disabled={loadingCompanies}
            >
              <option value="">
                {loadingCompanies
                  ? "Chargement des entreprises..."
                  : "Choisir une entreprise"}
              </option>

              {companies.map((company) => (
                <option
                  key={getId(company)}
                  value={getId(company)}
                >
                  {getCompanyName(company)}
                </option>
              ))}
            </select>
          </label>

          <label className="admin-galleries-selection-field">
            <span>
              <FiUsers />
              2. Campagne
            </span>

            <select
              value={campaignId}
              onChange={(event) =>
                handleCampaignChange(
                  event.target.value
                )
              }
              disabled={
                !companyId ||
                loadingCampaigns
              }
            >
              <option value="">
                {loadingCampaigns
                  ? "Chargement des campagnes..."
                  : !companyId
                    ? "Choisissez d'abord une entreprise"
                    : "Choisir une campagne"}
              </option>

              {campaigns.map((campaign) => (
                <option
                  key={getId(campaign)}
                  value={getId(campaign)}
                >
                  {getCampaignName(campaign)}
                </option>
              ))}
            </select>
          </label>
        </div>

        {selectedCompany && (
          <div className="admin-galleries-breadcrumb">
            <FiHome />

            <strong>
              {getCompanyName(selectedCompany)}
            </strong>

            {selectedCampaign && (
              <>
                <FiChevronRight />

                <span>
                  {getCampaignName(selectedCampaign)}
                </span>
              </>
            )}
          </div>
        )}
      </section>

      {/* ERREURS */}

      {error && (
        <div
          className="admin-galleries-error"
          role="alert"
        >
          <FiAlertCircle />
          <span>{error}</span>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isBusy}
          >
            Réessayer
          </button>
        </div>
      )}

      {/* CHARGEMENT INITIAL */}

      {loadingCompanies && !companyId && (
        <div className="admin-galleries-loading">
          <FiRefreshCw
            className="admin-galleries-spinner"
          />
          <strong>
            Chargement des entreprises...
          </strong>
        </div>
      )}

      {/* ENTREPRISE NON CHOISIE */}

      {!loadingCompanies && !companyId && (
        <section className="admin-galleries-prompt">
          <FiHome />

          <h2>
            Sélectionnez une entreprise
          </h2>

          <p>
            Les campagnes et les galeries
            apparaîtront après votre sélection.
          </p>
        </section>
      )}

      {/* ENTREPRISE CHOISIE, CAMPAGNE NON CHOISIE */}

      {companyId &&
        !campaignId &&
        !loadingCampaigns && (
          <section className="admin-galleries-prompt">
            <FiUsers />

            <h2>
              Choisissez une campagne
            </h2>

            <p>
              {campaigns.length > 0
                ? "Sélectionnez une campagne pour voir ses participants, portraits et lien de partage."
                : "Aucune campagne disponible pour cette entreprise."}
            </p>
          </section>
        )}

      {loadingCampaigns && (
        <div className="admin-galleries-loading">
          <FiRefreshCw
            className="admin-galleries-spinner"
          />
          <strong>
            Chargement des campagnes...
          </strong>
        </div>
      )}

      {/* CAMPAGNE CHOISIE */}

      {companyId && campaignId && (
        <>
          {/* LIEN PUBLIC DE LA CAMPAGNE */}

          <section className="admin-galleries-share-panel">
            <div className="admin-galleries-share-heading">
              <div className="admin-galleries-share-icon">
                <FiShare2 />
              </div>

              <div>
                <h2>
                  Partage public de la campagne
                </h2>

                <p>
                  {getCampaignName(selectedCampaign)} —
                  lien créé depuis l'espace Entreprise.
                  Consultation uniquement.
                </p>
              </div>
            </div>

            {loadingShare ? (
              <div className="admin-galleries-share-empty">
                <FiRefreshCw
                  className="admin-galleries-spinner"
                />

                Vérification du lien public...
              </div>
            ) : !shareLoaded ? (
              <div
                className="admin-galleries-share-empty"
                role={shareError ? "alert" : undefined}
              >
                <FiAlertCircle />

                {shareError ||
                  "Statut du partage indisponible."}
              </div>
            ) : hasActiveShare ? (
              <>
                <div className="admin-galleries-share-status">
                  <FiCheckCircle />

                  <strong>
                    Un partage est actif
                  </strong>

                  <span>
                    Expiration :{" "}
                    {formatDate(share.expiresAt)}
                  </span>
                </div>

                {shareUrl ? (
                  <div className="admin-galleries-share-link">
                    <div className="admin-galleries-share-url">
                      <FiLink />

                      <input
                        type="text"
                        readOnly
                        value={shareUrl}
                        aria-label="Lien public de la campagne"
                        onFocus={(event) =>
                          event.target.select()
                        }
                      />
                    </div>

                    <button
                      type="button"
                      onClick={copyShare}
                    >
                      {copied ? (
                        <FiCheck />
                      ) : (
                        <FiCopy />
                      )}

                      {copied
                        ? "Copié"
                        : "Copier"}
                    </button>

                    <a
                      href={shareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      referrerPolicy="no-referrer"
                    >
                      <FiExternalLink />
                      Ouvrir
                    </a>
                  </div>
                ) : (
                  <p className="admin-galleries-share-note">
                    Le partage est actif, mais son URL
                    n'est pas récupérable. L'entreprise
                    peut générer un nouveau lien
                    pour cette campagne.
                  </p>
                )}
              </>
            ) : (
              <div className="admin-galleries-share-empty">
                <FiClock />
                Aucun lien public actif pour cette campagne.
              </div>
            )}

            {shareError && shareLoaded && (
              <p
                className="admin-galleries-share-note"
                role="alert"
              >
                {shareError}
              </p>
            )}
          </section>

          {/* STATISTIQUES */}

          <section className="admin-galleries-stats">
            <article className="admin-galleries-stat">
              <div className="admin-galleries-stat-icon">
                <FiImage />
              </div>

              <div>
                <span>Galeries</span>
                <strong>{stats.total}</strong>
              </div>
            </article>

            <article className="admin-galleries-stat">
              <div className="admin-galleries-stat-icon admin-galleries-stat-icon-success">
                <FiCheckCircle />
              </div>

              <div>
                <span>Portraits choisis</span>
                <strong>{stats.selected}</strong>
              </div>
            </article>

            <article className="admin-galleries-stat">
              <div className="admin-galleries-stat-icon admin-galleries-stat-icon-waiting">
                <FiClock />
              </div>

              <div>
                <span>En attente</span>
                <strong>{stats.waiting}</strong>
              </div>
            </article>

            <article className="admin-galleries-stat">
              <div className="admin-galleries-stat-icon admin-galleries-stat-icon-expired">
                <FiAlertCircle />
              </div>

              <div>
                <span>Expirées</span>
                <strong>{stats.expired}</strong>
              </div>
            </article>
          </section>

          {/* RECHERCHE ET FILTRES */}

          <section className="admin-galleries-toolbar">
            <div className="admin-galleries-search">
              <FiSearch />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Rechercher un participant..."
                aria-label="Rechercher un participant"
              />
            </div>

            <div className="admin-galleries-filter">
              <FiFilter />

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                aria-label="Filtrer par statut"
              >
                <option value="ALL">
                  Tous les statuts
                </option>

                <option value="VALIDATED">
                  Portrait sélectionné
                </option>

                <option value="WAITING">
                  En attente du choix
                </option>

                <option value="EXPIRED">
                  Expirée
                </option>

                <option value="OTHER">
                  Non publiée
                </option>
              </select>
            </div>
          </section>

          <div className="admin-galleries-list-heading">
            <div>
              <strong>
                Galeries participants
              </strong>

              <span>
                {filteredGalleries.length} résultat
                {filteredGalleries.length !== 1
                  ? "s"
                  : ""}
              </span>
            </div>
          </div>

          {/* CHARGEMENT / AUCUN RESULTAT */}

          {loadingGalleries ? (
            <div className="admin-galleries-loading">
              <FiRefreshCw
                className="admin-galleries-spinner"
              />

              <strong>
                Chargement des galeries...
              </strong>
            </div>
          ) : filteredGalleries.length === 0 ? (
            <div className="admin-galleries-empty">
              <div className="admin-galleries-empty-icon">
                <FiInbox />
              </div>

              <h2>
                Aucune galerie trouvée
              </h2>

              <p>
                Aucun participant ne correspond
                aux filtres ou aucune galerie
                n'a encore été créée
                pour cette campagne.
              </p>
            </div>
          ) : (
            <>
              {/* TABLEAU DESKTOP */}

              <section className="admin-galleries-desktop">
                <div className="admin-galleries-panel">
                  <div className="admin-galleries-table-wrapper">
                    <table className="admin-galleries-table">
                      <thead>
                        <tr>
                          <th>Participant</th>
                          <th>Statut</th>
                          <th>Portrait final</th>
                          <th>Publication</th>
                          <th>Expiration</th>
                          <th>Galerie</th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredGalleries.map(
                          (gallery) => {
                            const portrait =
                              getSelectedPortrait(gallery);

                            const imageUrl =
                              portrait?.imageUrl;

                            const name =
                              getParticipantName(gallery);

                            const publicToken =
                              gallery.publicToken;

                            return (
                              <tr key={gallery.id}>
                                <td>
                                  <div className="admin-gallery-participant">
                                    <div className="admin-gallery-participant-avatar">
                                      {name
                                        .charAt(0)
                                        .toUpperCase()}
                                    </div>

                                    <div className="admin-gallery-participant-info">
                                      <strong>
                                        {name}
                                      </strong>

                                      <span>
                                        {getParticipantEmail(
                                          gallery
                                        ) || "—"}
                                      </span>
                                    </div>
                                  </div>
                                </td>

                                <td>
                                  {renderStatus(
                                    gallery
                                  )}
                                </td>

                                <td>
                                  {portrait ? (
                                    <div className="admin-gallery-final-portrait">
                                      {validImageUrl(
                                        imageUrl
                                      ) ? (
                                        <button
                                          type="button"
                                          className="admin-galleries-photo-button"
                                          onClick={() =>
                                            setPreview({
                                              name,
                                              imageUrl,
                                            })
                                          }
                                          aria-label={`Voir le portrait de ${name}`}
                                        >
                                          <img
                                            src={imageUrl}
                                            alt={`Portrait final de ${name}`}
                                            loading="lazy"
                                            referrerPolicy="no-referrer"
                                          />
                                        </button>
                                      ) : (
                                        <div className="admin-gallery-final-placeholder">
                                          <FiImage />
                                        </div>
                                      )}

                                      <div>
                                        <strong>
                                          {validImageUrl(
                                            imageUrl
                                          )
                                            ? "Sélectionné"
                                            : "Image indisponible"}
                                        </strong>

                                        <span>
                                          Portrait final
                                        </span>
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="admin-gallery-waiting-choice">
                                      <FiClock />
                                      En attente
                                    </span>
                                  )}
                                </td>

                                <td className="admin-gallery-date">
                                  {formatDate(
                                    gallery.publishedAt
                                  )}
                                </td>

                                <td className="admin-gallery-date">
                                  {formatDate(
                                    gallery.expiresAt
                                  )}
                                </td>

                                <td>
                                  {publicToken ? (
                                    <a
                                      href={`/gallery/${encodeURIComponent(
                                        publicToken
                                      )}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="admin-gallery-open-button"
                                    >
                                      <FiExternalLink />
                                      Ouvrir
                                    </a>
                                  ) : (
                                    "—"
                                  )}
                                </td>
                              </tr>
                            );
                          }
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              {/* CARTES MOBILE */}

              <section className="admin-galleries-mobile">
                {filteredGalleries.map((gallery) => {
                  const portrait =
                    getSelectedPortrait(gallery);

                  const imageUrl =
                    portrait?.imageUrl;

                  const name =
                    getParticipantName(gallery);

                  return (
                    <article
                      key={`mobile-${gallery.id}`}
                      className="admin-gallery-mobile-card"
                    >
                      <div className="admin-gallery-mobile-top">
                        <div className="admin-gallery-mobile-avatar">
                          {name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="admin-gallery-mobile-person">
                          <strong>{name}</strong>

                          <span>
                            {getParticipantEmail(
                              gallery
                            ) || "—"}
                          </span>
                        </div>
                      </div>

                      <div className="admin-galleries-mobile-status">
                        {renderStatus(gallery)}
                      </div>

                      <div className="admin-gallery-mobile-campaign">
                        <span className="admin-gallery-mobile-campaign-icon">
                          <FiUsers />
                        </span>

                        <div>
                          <span className="admin-gallery-mobile-label">
                            Campagne
                          </span>

                          <strong>
                            {getGalleryCampaignName(
                              gallery
                            )}
                          </strong>
                        </div>
                      </div>

                      <div className="admin-gallery-mobile-portrait">
                        <div className="admin-gallery-mobile-portrait-copy">
                          <span className="admin-gallery-mobile-label">
                            Portrait final
                          </span>

                          <strong>
                            {portrait
                              ? "Portrait sélectionné"
                              : "En attente de sélection"}
                          </strong>

                          <small>
                            {portrait
                              ? "Choix final du participant"
                              : "Aucun choix final enregistré"}
                          </small>
                        </div>

                        <div className="admin-gallery-mobile-photo">
                          {validImageUrl(imageUrl) ? (
                            <button
                              type="button"
                              className="admin-galleries-photo-button"
                              onClick={() =>
                                setPreview({
                                  name,
                                  imageUrl,
                                })
                              }
                              aria-label={`Voir le portrait de ${name}`}
                            >
                              <img
                                src={imageUrl}
                                alt={`Portrait final de ${name}`}
                                loading="lazy"
                                referrerPolicy="no-referrer"
                              />
                            </button>
                          ) : (
                            <FiImage />
                          )}
                        </div>
                      </div>

                      <div className="admin-gallery-mobile-dates">
                        <div>
                          <span>
                            <FiCalendar />
                            Publication
                          </span>

                          <strong>
                            {formatDate(
                              gallery.publishedAt
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>
                            <FiClock />
                            Expiration
                          </span>

                          <strong>
                            {formatDate(
                              gallery.expiresAt
                            )}
                          </strong>
                        </div>
                      </div>

                      {gallery.publicToken && (
                        <a
                          href={`/gallery/${encodeURIComponent(
                            gallery.publicToken
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="admin-gallery-mobile-open"
                        >
                          Voir la galerie
                          <FiExternalLink />
                        </a>
                      )}
                    </article>
                  );
                })}
              </section>
            </>
          )}
        </>
      )}

      {/* APERCU PORTRAIT */}

      {preview && (
        <div
          className="admin-galleries-preview-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              setPreview(null);
            }
          }}
        >
          <div
            className="admin-galleries-preview"
            role="dialog"
            aria-modal="true"
            aria-label={`Portrait de ${preview.name}`}
          >
            <div className="admin-galleries-preview-header">
              <div>
                <FiEye />

                <strong>
                  {preview.name}
                </strong>
              </div>

              <button
                type="button"
                aria-label="Fermer l'aperçu"
                onClick={() =>
                  setPreview(null)
                }
              >
                <FiX />
              </button>
            </div>

            <img
              src={preview.imageUrl}
              alt={`Portrait final de ${preview.name}`}
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminGalleriesPage;
