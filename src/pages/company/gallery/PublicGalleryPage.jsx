
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FiImage,
  FiSearch,
  FiFilter,
  FiEye,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiShield,
  FiClock,
  FiAlertCircle,
  FiRefreshCw,
  FiArrowRight,
  FiCamera,
  FiUsers,
  FiGrid,
} from "react-icons/fi";
import { ClipLoader } from "react-spinners";


import "./PublicGalleryPage.css";
import api from "../../../services/api";

/*
 * =========================================================
 * PAGE PUBLIQUE DE GALERIE
 * =========================================================
 *
 * URL React :
 * /galerie-partagee/:token
 *
 * API publique :
 * GET /public/gallery/:token
 *
 * Aucun JWT n'est requis.
 * Le backend vérifie le token, l'expiration
 * et les autorisations des portraits.
 */

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

const getFullName = (portrait) => {
  const name = [
    portrait.firstName,
    portrait.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return name || "Collaborateur";
};

const isImageUrl = (url) => {
  if (typeof url !== "string") return false;

  try {
    return new URL(url).protocol === "https:";
  } catch {
    return false;
  }
};

const normalizeResult = (response) => {
  const result = response?.data;
  const data = result?.data;

  if (
    result?.success !== true ||
    !Array.isArray(data?.portraits)
  ) {
    throw new Error("Réponse de galerie invalide.");
  }

  return {
    companyName: result.companyName || "Entreprise",
    expiresAt: result.expiresAt || null,
    portraits: data.portraits.map((portrait) => ({
      id: portrait.id,
      participantId: portrait.participantId,
      firstName: portrait.firstName || "",
      lastName: portrait.lastName || "",
      campaignId: portrait.campaignId,
      campaignName: portrait.campaignName || "Campagne",
      styleName:
        portrait.styleName || "Portrait professionnel",
      imageUrl: portrait.imageUrl || null,
      createdAt: portrait.createdAt || null,
    })),
    hasMore: Boolean(data.hasMore),
    nextCursor: data.nextCursor ?? null,
  };
};

function PublicGalleryPage() {
  const { token } = useParams();

  /* =========================================================
     ÉTATS
  ========================================================= */

  const [portraits, setPortraits] = useState([]);
  const [companyName, setCompanyName] = useState("");
  const [expiresAt, setExpiresAt] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [invalidLink, setInvalidLink] = useState(false);

  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);

  const [search, setSearch] = useState("");
  const [campaignFilter, setCampaignFilter] =
    useState("ALL");

  const [selectedId, setSelectedId] = useState(null);

  /* =========================================================
     API PUBLIQUE
  ========================================================= */

  const fetchGallery = useCallback(
    async ({ cursor = null, append = false, signal } = {}) => {
      const response = await api.get(
        `/public/gallery/${encodeURIComponent(token)}`,
        {
          params: cursor ? { cursor } : {},
          signal,
          timeout: 60000,
        }
      );

      if (signal?.aborted) return;

      const result = normalizeResult(response);

      setCompanyName(result.companyName);
      setExpiresAt(result.expiresAt);

      setPortraits((previous) => {
        if (!append) return result.portraits;

        const existingIds = new Set(
          previous.map((portrait) => String(portrait.id))
        );

        return [
          ...previous,
          ...result.portraits.filter(
            (portrait) =>
              !existingIds.has(String(portrait.id))
          ),
        ];
      });

      setHasMore(result.hasMore);
      setNextCursor(result.nextCursor);
    },
    [token]
  );

  /* =========================================================
     CHARGEMENT INITIAL
  ========================================================= */

  useEffect(() => {
    const controller = new AbortController();

    const initialize = async () => {
      setLoading(true);
      setError("");
      setInvalidLink(false);

      try {
        if (!token || !/^[a-f0-9]{64}$/.test(token)) {
          setInvalidLink(true);
          return;
        }

        await fetchGallery({
          signal: controller.signal,
        });
      } catch (err) {
        if (
          controller.signal.aborted ||
          err.code === "ERR_CANCELED"
        ) {
          return;
        }

        console.error("Galerie publique :", err);

        if ([403, 404, 410].includes(err.response?.status)) {
          setInvalidLink(true);
        } else {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Impossible de charger cette galerie."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    initialize();

    return () => controller.abort();
  }, [token, fetchGallery]);

  /* =========================================================
     ACTUALISATION
  ========================================================= */

  const handleRefresh = async () => {
    if (loading || refreshing || loadingMore) return;

    try {
      setRefreshing(true);
      setError("");

      await fetchGallery();
      setSelectedId(null);
    } catch (err) {
      if ([403, 404, 410].includes(err.response?.status)) {
        setInvalidLink(true);
        setPortraits([]);
      } else {
        setError(
          err.response?.data?.message ||
            "Impossible d'actualiser les portraits."
        );
      }
    } finally {
      setRefreshing(false);
    }
  };

  /* =========================================================
     PAGINATION
  ========================================================= */

  const handleLoadMore = async () => {
    if (!hasMore || !nextCursor || loadingMore) return;

    try {
      setLoadingMore(true);
      setError("");

      await fetchGallery({
        cursor: nextCursor,
        append: true,
      });
    } catch (err) {
      if ([403, 404, 410].includes(err.response?.status)) {
        setInvalidLink(true);
        setPortraits([]);
      } else {
        setError(
          err.response?.data?.message ||
            "Impossible de charger la suite."
        );
      }
    } finally {
      setLoadingMore(false);
    }
  };

  /* =========================================================
     FILTRES
  ========================================================= */

  const campaigns = useMemo(() => {
    const map = new Map();

    portraits.forEach((portrait) => {
      if (portrait.campaignId != null) {
        map.set(String(portrait.campaignId), {
          id: portrait.campaignId,
          name: portrait.campaignName,
        });
      }
    });

    return [...map.values()].sort((a, b) =>
      a.name.localeCompare(b.name, "fr")
    );
  }, [portraits]);

  const filteredPortraits = useMemo(() => {
    const query = search.trim().toLowerCase();

    return portraits.filter((portrait) => {
      const searchableText = [
        portrait.firstName,
        portrait.lastName,
        portrait.campaignName,
        portrait.styleName,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchableText.includes(query);

      const matchesCampaign =
        campaignFilter === "ALL" ||
        String(portrait.campaignId) === campaignFilter;

      return matchesSearch && matchesCampaign;
    });
  }, [portraits, search, campaignFilter]);

  const participantCount = new Set(
    portraits.map((portrait) => portrait.participantId)
  ).size;

  const campaignCount = new Set(
    portraits.map((portrait) => portrait.campaignId)
  ).size;

  /* =========================================================
     APERÇU GRAND FORMAT
  ========================================================= */

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

    return () =>
      window.removeEventListener("keydown", onKeyDown);
  }, [selectedId, changeSelection]);

  /* =========================================================
     LIEN INVALIDE OU EXPIRÉ
  ========================================================= */

  if (!loading && invalidLink) {
    return (
      <main className="public-gallery-page">
        <div className="public-gallery-invalid">
          <div className="public-gallery-invalid-icon">
            <FiShield />
          </div>

          <h1>Ce lien n'est plus disponible</h1>

          <p>
            Le lien de cette galerie est peut-être expiré,
            désactivé ou incorrect. Contactez l'entreprise
            qui vous l'a transmis pour en obtenir un nouveau.
          </p>
        </div>
      </main>
    );
  }

  /* =========================================================
     PAGE PUBLIQUE
  ========================================================= */

  return (
    <main className="public-gallery-page">
      {/* HEADER */}
      <header className="public-gallery-topbar">
        <div className="public-gallery-brand">
          <span className="public-gallery-brand-icon">
            <FiCamera />
          </span>

          <div>
            <strong>Portrélia</strong>
            <small>Galerie de portraits</small>
          </div>
        </div>

        <span className="public-gallery-private-label">
          <FiShield />
          Partage temporaire
        </span>
      </header>

      <div className="public-gallery-container">
        {/* PRÉSENTATION */}
        <section className="public-gallery-hero">
          <div>
            <span className="public-gallery-eyebrow">
              GALERIE PARTAGÉE
            </span>

            <h1>
              Les portraits de{" "}
              <span>{companyName || "votre entreprise"}</span>
            </h1>

            <p>
              Découvrez les portraits professionnels
              sélectionnés et mis à disposition par
              l'entreprise.
            </p>
          </div>

          {expiresAt && (
            <div className="public-gallery-expiration">
              <FiClock />

              <div>
                <small>Lien accessible jusqu'au</small>
                <strong>{formatDate(expiresAt)}</strong>
              </div>
            </div>
          )}
        </section>

        {/* ALERTES */}
        {error && (
          <div className="public-gallery-alert" role="alert">
            <FiAlertCircle />
            <span>{error}</span>

            <button
              type="button"
              onClick={handleRefresh}
            >
              Réessayer
            </button>
          </div>
        )}

        {/* STATISTIQUES */}
        <section className="public-gallery-stats">
          <article>
            <FiImage />

            <div>
              <strong>
                {loading
                  ? "—"
                  : `${portraits.length}${hasMore ? "+" : ""}`}
              </strong>

              <span>Portraits chargés</span>
            </div>
          </article>

          <article>
            <FiUsers />

            <div>
              <strong>{loading ? "—" : participantCount}</strong>
              <span>Collaborateurs</span>
            </div>
          </article>

          <article>
            <FiGrid />

            <div>
              <strong>{loading ? "—" : campaignCount}</strong>
              <span>Campagnes</span>
            </div>
          </article>
        </section>

        {/* FILTRES */}
        <section className="public-gallery-section">
          <div className="public-gallery-section-heading">
            <div>
              <h2>Tous les portraits</h2>
              <p>
                Parcourez les portraits disponibles dans cette
                galerie.
              </p>
            </div>

            <button
              type="button"
              className="public-gallery-refresh"
              onClick={handleRefresh}
              disabled={loading || refreshing || loadingMore}
            >
              <FiRefreshCw
                className={refreshing ? "public-gallery-spin" : ""}
              />
              Actualiser
            </button>
          </div>

          <div className="public-gallery-toolbar">
            <label className="public-gallery-search">
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

            <label className="public-gallery-select">
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
          </div>

          <div className="public-gallery-results">
            {loading
              ? "Chargement..."
              : `${filteredPortraits.length} portrait(s)`}
          </div>

          {/* CHARGEMENT */}
          {loading ? (
            <div className="public-gallery-empty">
              <ClipLoader size={32} color="#56319a" />
              <p>Chargement des portraits...</p>
            </div>
          ) : filteredPortraits.length === 0 ? (
            /* GALERIE VIDE */
            <div className="public-gallery-empty">
              <FiImage size={37} />

              <h3>Aucun portrait disponible</h3>

              <p>
                Aucun portrait ne correspond aux critères
                sélectionnés ou aucun portrait n'a encore
                été mis à disposition.
              </p>
            </div>
          ) : (
            <>
              <div className="public-gallery-grid">
                {filteredPortraits.map((portrait) => (
                  <article
                    key={portrait.id}
                    className="public-gallery-card"
                  >
                    <button
                      type="button"
                      className="public-gallery-card-image"
                      onClick={() =>
                        setSelectedId(portrait.id)
                      }
                      aria-label={`Voir le portrait de ${getFullName(
                        portrait
                      )}`}
                    >
                      {isImageUrl(portrait.imageUrl) ? (
                        <img
                          src={portrait.imageUrl}
                          alt={`Portrait de ${getFullName(
                            portrait
                          )}`}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="public-gallery-placeholder">
                          <FiCamera />
                          Aperçu indisponible
                        </span>
                      )}

                      <span className="public-gallery-card-view">
                        <FiEye />
                        Agrandir
                      </span>
                    </button>

                    <div className="public-gallery-card-content">
                      <h3>{getFullName(portrait)}</h3>

                      <span>{portrait.campaignName}</span>

                      <div className="public-gallery-card-meta">
                        <small>{portrait.styleName}</small>
                        <small>
                          {formatDate(portrait.createdAt)}
                        </small>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {hasMore && nextCursor && (
                <div className="public-gallery-pagination">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <ClipLoader size={15} color="#56319a" />
                    ) : (
                      <FiArrowRight />
                    )}

                    {loadingMore
                      ? "Chargement..."
                      : "Voir plus de portraits"}
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* INFORMATION DE SÉCURITÉ */}
        <div className="public-gallery-security">
          <FiShield />

          <span>
            Cette galerie est accessible uniquement aux
            personnes disposant du lien de partage.
            L'accès est temporaire et peut être révoqué
            par l'entreprise.
          </span>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="public-gallery-footer">
        <span>Portrélia</span>
        <small>Portraits professionnels</small>
      </footer>

      {/* APERÇU GRAND FORMAT */}
      {selectedPortrait && (
        <div
          className="public-gallery-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedId(null);
            }
          }}
        >
          <section
            className="public-gallery-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`Portrait de ${getFullName(
              selectedPortrait
            )}`}
          >
            <div className="public-gallery-modal-header">
              <div>
                <strong>{getFullName(selectedPortrait)}</strong>
                <span>{selectedPortrait.campaignName}</span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedId(null)}
                aria-label="Fermer"
              >
                <FiX />
              </button>
            </div>

            <div className="public-gallery-modal-image">
              {filteredPortraits.length > 1 && (
                <button
                  type="button"
                  className="public-gallery-modal-arrow"
                  onClick={() => changeSelection(-1)}
                  aria-label="Portrait précédent"
                >
                  <FiChevronLeft />
                </button>
              )}

              {isImageUrl(selectedPortrait.imageUrl) ? (
                <img
                  src={selectedPortrait.imageUrl}
                  alt={`Portrait de ${getFullName(
                    selectedPortrait
                  )}`}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="public-gallery-placeholder">
                  <FiCamera />
                  Aperçu indisponible
                </div>
              )}

              {filteredPortraits.length > 1 && (
                <button
                  type="button"
                  className="public-gallery-modal-arrow"
                  onClick={() => changeSelection(1)}
                  aria-label="Portrait suivant"
                >
                  <FiChevronRight />
                </button>
              )}
            </div>

            <div className="public-gallery-modal-footer">
              <span>
                {selectedPortrait.styleName}
              </span>

              <span>
                {formatDate(selectedPortrait.createdAt)}
              </span>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default PublicGalleryPage;
