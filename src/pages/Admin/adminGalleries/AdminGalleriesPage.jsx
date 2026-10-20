import {
  useEffect,
  useMemo,
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
} from "react-icons/fi";

import api from "../../../services/api";

import "./AdminGalleriesPage.css";

const PAGE_REFERENCE_TIME =
  Date.now();

const isGalleryExpired = (
  gallery
) => {
  if (!gallery?.expiresAt) {
    return false;
  }

  const expiration =
    new Date(
      gallery.expiresAt
    ).getTime();

  if (
    Number.isNaN(
      expiration
    )
  ) {
    return false;
  }

  return (
    expiration <
    PAGE_REFERENCE_TIME
  );
};

const formatDate = (
  value
) => {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return new Intl
    .DateTimeFormat(
      "fr-FR",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    )
    .format(date);
};

const getGalleryStatus = (
  gallery
) => {
  if (
    isGalleryExpired(
      gallery
    )
  ) {
    return {
      key: "EXPIRED",
      label: "Expirée",
    };
  }

  if (
    gallery
      ?.participantStatus ===
    "VALIDATED"
  ) {
    return {
      key: "VALIDATED",
      label: "Choix confirmé",
    };
  }

  if (
    gallery
      ?.participantStatus ===
    "GALLERY_READY"
  ) {
    return {
      key: "WAITING",
      label: "En attente",
    };
  }

  return {
    key: "OTHER",
    label: "Publiée",
  };
};

function AdminGalleriesPage() {
  const [
    galleries,
    setGalleries,
  ] = useState([]);

  const [
    campaigns,
    setCampaigns,
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
    search,
    setSearch,
  ] = useState("");

  const [
    campaignFilter,
    setCampaignFilter,
  ] = useState("ALL");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("ALL");

  /*
   * =========================================================
   * INITIAL LOAD
   * =========================================================
   */

  useEffect(() => {
    let active =
      true;

    api
      .get(
        "/admin/galleries"
      )
      .then(
        (response) => {
          if (!active) {
            return;
          }

          const payload =
            response.data?.data ??
            response.data ??
            {};

          setGalleries(
            Array.isArray(
              payload?.galleries
            )
              ? payload.galleries
              : []
          );

          setCampaigns(
            Array.isArray(
              payload?.campaigns
            )
              ? payload.campaigns
              : []
          );

          setError("");
        }
      )
      .catch(
        (requestError) => {
          if (!active) {
            return;
          }

          console.error(
            "[ADMIN GALLERIES] LOAD ERROR:",
            requestError
          );

          setError(
            requestError
              .response
              ?.data
              ?.message ||
              "Impossible de charger les galeries."
          );
        }
      )
      .finally(
        () => {
          if (active) {
            setLoading(false);
          }
        }
      );

    return () => {
      active =
        false;
    };
  }, []);

  /*
   * =========================================================
   * RELOAD
   * =========================================================
   */

  const reloadGalleries =
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get(
            "/admin/galleries"
          );

        const payload =
          response.data?.data ??
          response.data ??
          {};

        setGalleries(
          Array.isArray(
            payload?.galleries
          )
            ? payload.galleries
            : []
        );

        setCampaigns(
          Array.isArray(
            payload?.campaigns
          )
            ? payload.campaigns
            : []
        );
      } catch (
        requestError
      ) {
        console.error(
          "[ADMIN GALLERIES] RELOAD ERROR:",
          requestError
        );

        setError(
          requestError
            .response
            ?.data
            ?.message ||
            "Impossible de charger les galeries."
        );
      } finally {
        setLoading(false);
      }
    };

  /*
   * =========================================================
   * CAMPAIGNS
   * =========================================================
   */

  const availableCampaigns =
    useMemo(
      () => {
        if (
          campaigns.length >
          0
        ) {
          return campaigns;
        }

        const map =
          new Map();

        galleries.forEach(
          (gallery) => {
            const id =
              gallery
                ?.campaign
                ?.id ??
              gallery
                ?.campaignId;

            const name =
              gallery
                ?.campaign
                ?.name ??
              gallery
                ?.campaignName;

            if (
              id &&
              name
            ) {
              map.set(
                String(id),
                {
                  id,
                  name,
                }
              );
            }
          }
        );

        return Array.from(
          map.values()
        );
      },
      [
        campaigns,
        galleries,
      ]
    );

  /*
   * =========================================================
   * STATS
   * =========================================================
   */

  const stats =
    useMemo(
      () => {
        const total =
          galleries.length;

        const validated =
          galleries.filter(
            (gallery) =>
              !isGalleryExpired(
                gallery
              ) &&
              gallery
                .participantStatus ===
                "VALIDATED"
          ).length;

        const waiting =
          galleries.filter(
            (gallery) =>
              !isGalleryExpired(
                gallery
              ) &&
              gallery
                .participantStatus ===
                "GALLERY_READY"
          ).length;

        const expired =
          galleries.filter(
            (gallery) =>
              isGalleryExpired(
                gallery
              )
          ).length;

        return {
          total,
          validated,
          waiting,
          expired,
        };
      },
      [
        galleries,
      ]
    );

  /*
   * =========================================================
   * FILTERS
   * =========================================================
   */

  const filteredGalleries =
    useMemo(
      () => {
        const normalized =
          search
            .trim()
            .toLowerCase();

        return galleries.filter(
          (gallery) => {
            const status =
              getGalleryStatus(
                gallery
              );

            const firstName =
              gallery
                ?.participant
                ?.firstName ??
              gallery
                ?.participantFirstName ??
              "";

            const lastName =
              gallery
                ?.participant
                ?.lastName ??
              gallery
                ?.participantLastName ??
              "";

            const email =
              gallery
                ?.participant
                ?.email ??
              gallery
                ?.participantEmail ??
              "";

            const campaignName =
              gallery
                ?.campaign
                ?.name ??
              gallery
                ?.campaignName ??
              "";

            const companyName =
              gallery
                ?.company
                ?.name ??
              gallery
                ?.companyName ??
              "";

            const currentCampaignId =
              gallery
                ?.campaign
                ?.id ??
              gallery
                ?.campaignId;

            const searchable =
              [
                firstName,
                lastName,
                email,
                campaignName,
                companyName,
              ]
                .join(" ")
                .toLowerCase();

            const matchesSearch =
              !normalized ||
              searchable.includes(
                normalized
              );

            const matchesCampaign =
              campaignFilter ===
                "ALL" ||
              String(
                currentCampaignId
              ) ===
                String(
                  campaignFilter
                );

            const matchesStatus =
              statusFilter ===
                "ALL" ||
              status.key ===
                statusFilter;

            return (
              matchesSearch &&
              matchesCampaign &&
              matchesStatus
            );
          }
        );
      },
      [
        galleries,
        search,
        campaignFilter,
        statusFilter,
      ]
    );

  /*
   * =========================================================
   * FINAL PORTRAIT
   * =========================================================
   */

  const getFinalPortrait = (
    gallery
  ) => {
    if (
      gallery
        ?.selectedPortrait
    ) {
      return gallery
        .selectedPortrait;
    }

    if (
      gallery?.finalPortrait
    ) {
      return gallery
        .finalPortrait;
    }

    if (
      Array.isArray(
        gallery?.portraits
      )
    ) {
      return (
        gallery
          .portraits
          .find(
            (portrait) =>
              portrait
                .isSelectedByParticipant
          ) ||
        null
      );
    }

    return null;
  };

  /*
   * =========================================================
   * DATA NORMALIZER
   * =========================================================
   */

  const getGalleryData = (
    gallery
  ) => {
    const firstName =
      gallery
        ?.participant
        ?.firstName ??
      gallery
        ?.participantFirstName ??
      "";

    const lastName =
      gallery
        ?.participant
        ?.lastName ??
      gallery
        ?.participantLastName ??
      "";

    const email =
      gallery
        ?.participant
        ?.email ??
      gallery
        ?.participantEmail ??
      "";

    const campaignName =
      gallery
        ?.campaign
        ?.name ??
      gallery
        ?.campaignName ??
      "—";

    const companyName =
      gallery
        ?.company
        ?.name ??
      gallery
        ?.companyName ??
      "";

    return {
      firstName,
      lastName,
      email,
      campaignName,
      companyName,
      status:
        getGalleryStatus(
          gallery
        ),
      finalPortrait:
        getFinalPortrait(
          gallery
        ),
    };
  };

  /*
   * =========================================================
   * STATUS CONTENT
   * =========================================================
   */

  const renderStatus = (
    status
  ) => (
    <span
      className={`admin-gallery-status admin-gallery-status-${status.key.toLowerCase()}`}
    >
      {status.key ===
        "VALIDATED" && (
        <FiCheckCircle />
      )}

      {status.key ===
        "WAITING" && (
        <FiClock />
      )}

      {status.key ===
        "EXPIRED" && (
        <FiAlertCircle />
      )}

      {status.label}
    </span>
  );

  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (
    loading &&
    galleries.length === 0
  ) {
    return (
      <div className="admin-galleries-page">

        <div className="admin-galleries-loading">

          <FiRefreshCw className="admin-galleries-spinner" />

          <strong>
            Chargement des galeries
          </strong>

          <span>
            Récupération des données...
          </span>

        </div>

      </div>
    );
  }

  return (
    <div className="admin-galleries-page">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="admin-galleries-header">

        <div className="admin-galleries-header-copy">

          <span className="admin-galleries-eyebrow">
            PRODUCTION
          </span>

          <h1>
            Galeries
          </h1>

          <p>
            Suivez les galeries publiées et les portraits
            sélectionnés par les participants.
          </p>

        </div>

        <button
          type="button"
          className="admin-galleries-refresh"
          onClick={
            reloadGalleries
          }
          disabled={
            loading
          }
        >
          <FiRefreshCw
            className={
              loading
                ? "admin-galleries-spinner"
                : ""
            }
          />

          Actualiser
        </button>

      </header>

      {/* =====================================================
          STATS
      ====================================================== */}

      <section className="admin-galleries-stats">

        <button
          type="button"
          className={`admin-galleries-stat ${
            statusFilter ===
            "ALL"
              ? "admin-galleries-stat-active"
              : ""
          }`}
          onClick={() =>
            setStatusFilter(
              "ALL"
            )
          }
        >
          <div className="admin-galleries-stat-icon">
            <FiImage />
          </div>

          <div>
            <span>
              Toutes
            </span>

            <strong>
              {stats.total}
            </strong>
          </div>

        </button>

        <button
          type="button"
          className={`admin-galleries-stat ${
            statusFilter ===
            "WAITING"
              ? "admin-galleries-stat-active"
              : ""
          }`}
          onClick={() =>
            setStatusFilter(
              "WAITING"
            )
          }
        >
          <div className="admin-galleries-stat-icon admin-galleries-stat-icon-waiting">
            <FiClock />
          </div>

          <div>
            <span>
              En attente
            </span>

            <strong>
              {stats.waiting}
            </strong>
          </div>

        </button>

        <button
          type="button"
          className={`admin-galleries-stat ${
            statusFilter ===
            "VALIDATED"
              ? "admin-galleries-stat-active"
              : ""
          }`}
          onClick={() =>
            setStatusFilter(
              "VALIDATED"
            )
          }
        >
          <div className="admin-galleries-stat-icon admin-galleries-stat-icon-success">
            <FiCheckCircle />
          </div>

          <div>
            <span>
              Validées
            </span>

            <strong>
              {stats.validated}
            </strong>
          </div>

        </button>

        <button
          type="button"
          className={`admin-galleries-stat ${
            statusFilter ===
            "EXPIRED"
              ? "admin-galleries-stat-active"
              : ""
          }`}
          onClick={() =>
            setStatusFilter(
              "EXPIRED"
            )
          }
        >
          <div className="admin-galleries-stat-icon admin-galleries-stat-icon-expired">
            <FiAlertCircle />
          </div>

          <div>
            <span>
              Expirées
            </span>

            <strong>
              {stats.expired}
            </strong>
          </div>

        </button>

      </section>

      {/* =====================================================
          FILTERS
      ====================================================== */}

      <section className="admin-galleries-toolbar">

        <div className="admin-galleries-search">

          <FiSearch />

          <input
            type="search"
            value={
              search
            }
            onChange={(
              event
            ) =>
              setSearch(
                event
                  .target
                  .value
              )
            }
            placeholder="Rechercher un participant..."
          />

        </div>

        <div className="admin-galleries-filter">

          <FiFilter />

          <select
            value={
              campaignFilter
            }
            onChange={(
              event
            ) =>
              setCampaignFilter(
                event
                  .target
                  .value
              )
            }
          >
            <option value="ALL">
              Toutes les campagnes
            </option>

            {availableCampaigns.map(
              (campaign) => (
                <option
                  key={
                    campaign.id
                  }
                  value={
                    campaign.id
                  }
                >
                  {
                    campaign.name
                  }
                </option>
              )
            )}

          </select>

        </div>

      </section>

      {/* ERROR */}

      {error && (
        <div className="admin-galleries-error">

          <FiAlertCircle />

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={
              reloadGalleries
            }
          >
            Réessayer
          </button>

        </div>
      )}

      {/* =====================================================
          PANEL TITLE
      ====================================================== */}

      <div className="admin-galleries-list-heading">

        <div>

          <strong>
            Galeries participants
          </strong>

          <span>
            {
              filteredGalleries.length
            }{" "}
            résultat
            {
              filteredGalleries.length !==
              1
                ? "s"
                : ""
            }
          </span>

        </div>

      </div>

      {filteredGalleries.length ===
      0 ? (

        <div className="admin-galleries-empty">

          <div className="admin-galleries-empty-icon">
            <FiImage />
          </div>

          <h2>
            Aucune galerie
          </h2>

          <p>
            Aucune galerie ne correspond aux filtres sélectionnés.
          </p>

        </div>

      ) : (
        <>
          {/* =================================================
              DESKTOP TABLE
          ================================================== */}

          <section className="admin-galleries-desktop">

            <div className="admin-galleries-panel">

              <div className="admin-galleries-table-wrapper">

                <table className="admin-galleries-table">

                  <thead>
                    <tr>
                      <th>
                        Participant
                      </th>

                      <th>
                        Campagne
                      </th>

                      <th>
                        Statut
                      </th>

                      <th>
                        Portrait final
                      </th>

                      <th>
                        Publication
                      </th>

                      <th>
                        Expiration
                      </th>

                      <th>
                        Galerie
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {filteredGalleries.map(
                      (gallery) => {
                        const data =
                          getGalleryData(
                            gallery
                          );

                        return (
                          <tr
                            key={
                              gallery.id
                            }
                          >

                            <td>

                              <div className="admin-gallery-participant">

                                <div className="admin-gallery-participant-avatar">
                                  {
                                    data.firstName
                                      ?.charAt(0)
                                      ?.toUpperCase() ||
                                    "P"
                                  }
                                </div>

                                <div className="admin-gallery-participant-info">

                                  <strong>
                                    {
                                      [
                                        data.firstName,
                                        data.lastName,
                                      ]
                                        .filter(
                                          Boolean
                                        )
                                        .join(" ") ||
                                      "Participant"
                                    }
                                  </strong>

                                  <span>
                                    {
                                      data.email ||
                                      "—"
                                    }
                                  </span>

                                </div>

                              </div>

                            </td>

                            <td>

                              <div className="admin-gallery-campaign">

                                <span className="admin-gallery-campaign-icon">
                                  <FiUsers />
                                </span>

                                <div>

                                  <strong>
                                    {
                                      data
                                        .campaignName
                                    }
                                  </strong>

                                  <span>
                                    {
                                      data
                                        .companyName ||
                                      "—"
                                    }
                                  </span>

                                </div>

                              </div>

                            </td>

                            <td>
                              {
                                renderStatus(
                                  data.status
                                )
                              }
                            </td>

                            <td>

                              {data.finalPortrait ? (

                                <div className="admin-gallery-final-portrait">

                                  {data
                                    .finalPortrait
                                    .imageUrl ? (

                                    <img
                                      src={
                                        data
                                          .finalPortrait
                                          .imageUrl
                                      }
                                      alt="Portrait final"
                                    />

                                  ) : (

                                    <div className="admin-gallery-final-placeholder">
                                      <FiImage />
                                    </div>

                                  )}

                                  <div>
                                    <strong>
                                      Sélectionné
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
                              {
                                formatDate(
                                  gallery
                                    .publishedAt
                                )
                              }
                            </td>

                            <td className="admin-gallery-date">
                              {
                                formatDate(
                                  gallery
                                    .expiresAt
                                )
                              }
                            </td>

                            <td>

                              {gallery.publicToken ? (

                                <a
                                  href={`/gallery/${gallery.publicToken}`}
                                  target="_blank"
                                  rel="noreferrer"
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

          {/* =================================================
              REAL MOBILE VERSION
          ================================================== */}

          <section className="admin-galleries-mobile">

            {filteredGalleries.map(
              (gallery) => {
                const data =
                  getGalleryData(
                    gallery
                  );

                return (
                  <article
                    key={
                      `mobile-${gallery.id}`
                    }
                    className="admin-gallery-mobile-card"
                  >

                    {/* TOP */}

                    <div className="admin-gallery-mobile-top">

                      <div className="admin-gallery-mobile-avatar">
                        {
                          data.firstName
                            ?.charAt(0)
                            ?.toUpperCase() ||
                          "P"
                        }
                      </div>

                      <div className="admin-gallery-mobile-person">

                        <strong>
                          {
                            [
                              data.firstName,
                              data.lastName,
                            ]
                              .filter(
                                Boolean
                              )
                              .join(" ") ||
                            "Participant"
                          }
                        </strong>

                        <span>
                          {
                            data.email ||
                            "—"
                          }
                        </span>

                      </div>

                      {
                        renderStatus(
                          data.status
                        )
                      }

                    </div>

                    {/* CAMPAIGN */}

                    <div className="admin-gallery-mobile-campaign">

                      <span className="admin-gallery-mobile-campaign-icon">
                        <FiUsers />
                      </span>

                      <div>

                        <span className="admin-gallery-mobile-label">
                          Campagne
                        </span>

                        <strong>
                          {
                            data
                              .campaignName
                          }
                        </strong>

                        <small>
                          {
                            data
                              .companyName ||
                            "—"
                          }
                        </small>

                      </div>

                    </div>

                    {/* PORTRAIT */}

                    <div className="admin-gallery-mobile-portrait">

                      <div className="admin-gallery-mobile-portrait-copy">

                        <span className="admin-gallery-mobile-label">
                          Portrait final
                        </span>

                        {data.finalPortrait ? (
                          <>
                            <strong>
                              Portrait sélectionné
                            </strong>

                            <small>
                              Choix confirmé par le participant
                            </small>
                          </>
                        ) : (
                          <>
                            <strong>
                              En attente de sélection
                            </strong>

                            <small>
                              Le participant n'a pas encore confirmé son choix
                            </small>
                          </>
                        )}

                      </div>

                      <div className="admin-gallery-mobile-photo">

                        {data.finalPortrait?.imageUrl ? (

                          <img
                            src={
                              data
                                .finalPortrait
                                .imageUrl
                            }
                            alt="Portrait final"
                          />

                        ) : (

                          <FiImage />

                        )}

                      </div>

                    </div>

                    {/* DATES */}

                    <div className="admin-gallery-mobile-dates">

                      <div>

                        <span>
                          <FiCalendar />

                          Publication
                        </span>

                        <strong>
                          {
                            formatDate(
                              gallery
                                .publishedAt
                            )
                          }
                        </strong>

                      </div>

                      <div>

                        <span>
                          <FiClock />

                          Expiration
                        </span>

                        <strong>
                          {
                            formatDate(
                              gallery
                                .expiresAt
                            )
                          }
                        </strong>

                      </div>

                    </div>

                    {/* ACTION */}

                    {gallery.publicToken && (

                      <a
                        href={`/gallery/${gallery.publicToken}`}
                        target="_blank"
                        rel="noreferrer"
                        className="admin-gallery-mobile-open"
                      >
                        Voir la galerie

                        <FiExternalLink />
                      </a>

                    )}

                  </article>
                );
              }
            )}

          </section>
        </>
      )}

    </div>
  );
}

export default AdminGalleriesPage;