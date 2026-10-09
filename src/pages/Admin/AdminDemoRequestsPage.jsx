import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  FiSearch,
  FiFilter,
  FiEye,
  FiX,
  FiChevronDown,
} from "react-icons/fi";

import { ClipLoader } from "react-spinners";

import api from "../../services/api";

import "./AdminDemoRequestsPage.css";

function AdminDemoRequestsPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [demoRequests, setDemoRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const defaultFilters = {
    status: "ALL",
    teamSize: "ALL",
  };

  const [draftFilters, setDraftFilters] =
    useState(defaultFilters);

  const [filters, setFilters] =
    useState(defaultFilters);

  // Récupération des demandes depuis l'API
  useEffect(() => {
    let active = true;

    const fetchDemoRequests = async () => {
      try {
        setErrorMessage("");

        const response = await api.get(
          "/admin/demo-requests"
        );

        if (!active) {
          return;
        }

        if (response.data.success) {
          const requests = response.data.data.map(
            (request) => ({
              id: request.id,

              companyName:
                request.company_name,

              firstName:
                request.first_name,

              lastName:
                request.last_name,

              email:
                request.email,

              phone:
                request.phone || "Non renseigné",

              teamSize:
                request.team_size,

              status:
                request.status,

              createdAt:
                request.created_at,
            })
          );

          setDemoRequests(requests);
        }
      } catch (error) {
        if (!active) {
          return;
        }

        console.error(
          "Erreur récupération demandes :",
          error
        );

        setErrorMessage(
          error.response?.data?.message ||
            "Impossible de charger les demandes."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchDemoRequests();

    return () => {
      active = false;
    };
  }, []);

  const filteredRequests = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return demoRequests.filter((request) => {
      const matchesSearch =
        !query ||
        request.companyName
          .toLowerCase()
          .includes(query) ||
        request.firstName
          .toLowerCase()
          .includes(query) ||
        request.lastName
          .toLowerCase()
          .includes(query) ||
        request.email
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        filters.status === "ALL" ||
        request.status === filters.status;

      const matchesTeamSize =
        filters.teamSize === "ALL" ||
        request.teamSize === filters.teamSize;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesTeamSize
      );
    });
  }, [
    search,
    filters,
    demoRequests,
  ]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setDraftFilters((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    setFilters(draftFilters);
    setFiltersOpen(false);
  };

  const resetFilters = () => {
    setDraftFilters(defaultFilters);
    setFilters(defaultFilters);
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "PENDING":
        return "En attente";

      case "CONTACTED":
        return "Contactée";

      case "ACCEPTED":
        return "Acceptée";

      case "REJECTED":
        return "Refusée";

      default:
        return status;
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Intl.DateTimeFormat(
      "fr-FR",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    ).format(new Date(date));
  };

  return (
    <div className="admin-demo-requests-page">

      {/* HEADER */}
      <div className="admin-demo-requests-header">
        <div>
          <h1>
            Demandes de démo
          </h1>

          <p>
            Consultez et traitez les demandes reçues
            par Portrélia.
          </p>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="admin-demo-requests-toolbar">

        <div className="admin-demo-requests-search">
          <FiSearch />

          <input
            type="text"
            placeholder="Rechercher une entreprise, un contact..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <div className="admin-demo-filter-wrapper">

          <button
            type="button"
            className={`admin-demo-filter-btn ${
              filtersOpen
                ? "admin-demo-filter-btn-active"
                : ""
            }`}
            onClick={() =>
              setFiltersOpen(
                (previous) => !previous
              )
            }
          >
            <FiFilter />

            <span>
              Filtres
            </span>

            <FiChevronDown />
          </button>

          {filtersOpen && (
            <div className="admin-demo-filter-panel">

              <div className="admin-demo-filter-header">

                <div>
                  <strong>
                    Filtres
                  </strong>

                  <span>
                    Affinez les demandes affichées
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setFiltersOpen(false)
                  }
                  aria-label="Fermer"
                >
                  <FiX />
                </button>

              </div>

              <div className="admin-demo-filter-field">

                <label htmlFor="status">
                  Statut
                </label>

                <select
                  id="status"
                  name="status"
                  value={draftFilters.status}
                  onChange={handleFilterChange}
                >
                  <option value="ALL">
                    Tous les statuts
                  </option>

                  <option value="PENDING">
                    En attente
                  </option>

                  <option value="CONTACTED">
                    Contactée
                  </option>

                  <option value="ACCEPTED">
                    Acceptée
                  </option>

                  <option value="REJECTED">
                    Refusée
                  </option>
                </select>

              </div>

              <div className="admin-demo-filter-field">

                <label htmlFor="teamSize">
                  Taille d’équipe
                </label>

                <select
                  id="teamSize"
                  name="teamSize"
                  value={draftFilters.teamSize}
                  onChange={handleFilterChange}
                >
                  <option value="ALL">
                    Toutes les tailles
                  </option>

                  <option value="1-10">
                    1 à 10
                  </option>

                  <option value="11-25">
                    11 à 25
                  </option>

                  <option value="26-50">
                    26 à 50
                  </option>

                  <option value="51-100">
                    51 à 100
                  </option>

                  <option value="101-250">
                    101 à 250
                  </option>

                  <option value="251-500">
                    251 à 500
                  </option>

                  <option value="500+">
                    Plus de 500
                  </option>
                </select>

              </div>

              <div className="admin-demo-filter-actions">

                <button
                  type="button"
                  className="admin-demo-reset-btn"
                  onClick={resetFilters}
                >
                  Réinitialiser
                </button>

                <button
                  type="button"
                  className="admin-demo-apply-btn"
                  onClick={applyFilters}
                >
                  Appliquer
                </button>

              </div>

            </div>
          )}

        </div>

      </div>

      {/* COUNT */}
      {!loading && !errorMessage && (
        <div className="admin-demo-results">
          {filteredRequests.length}{" "}
          {filteredRequests.length > 1
            ? "demandes"
            : "demande"}
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="admin-demo-loading">
          <ClipLoader
            size={36}
            color="#4f2e94"
          />

          <span>
            Chargement des demandes...
          </span>
        </div>
      )}

      {/* ERROR */}
      {!loading && errorMessage && (
        <div className="admin-demo-error">
          {errorMessage}
        </div>
      )}

      {/* TABLE */}
      {!loading && !errorMessage && (
        <div className="admin-demo-table">

          <div className="admin-demo-table-header">
            <div>Entreprise</div>
            <div>Contact</div>
            <div>Taille équipe</div>
            <div>Statut</div>
            <div>Date</div>
            <div>Action</div>
          </div>

          <div className="admin-demo-table-body">

            {filteredRequests.length > 0 ? (
              filteredRequests.map((request) => (
                <div
                  key={request.id}
                  className="admin-demo-row"
                >

                  {/* ENTREPRISE */}
                  <div className="admin-demo-company">

                    <div className="admin-demo-avatar">
                      {request.companyName
                        .substring(0, 2)
                        .toUpperCase()}
                    </div>

                    <div>
                      <strong>
                        {request.companyName}
                      </strong>

                      <span>
                        {request.email}
                      </span>
                    </div>

                  </div>

                  {/* CONTACT */}
                  <div className="admin-demo-contact">

                    <strong>
                      {request.firstName}{" "}
                      {request.lastName}
                    </strong>

                    <span>
                      {request.phone}
                    </span>

                  </div>

                  {/* TEAM SIZE */}
                  <div className="admin-demo-value">
                    {request.teamSize}
                  </div>

                  {/* STATUS */}
                  <div>
                    <span
                      className={`admin-demo-status admin-demo-status-${request.status.toLowerCase()}`}
                    >
                      {getStatusLabel(
                        request.status
                      )}
                    </span>
                  </div>

                  {/* DATE */}
                  <div className="admin-demo-value">
                    {formatDate(
                      request.createdAt
                    )}
                  </div>

                  {/* ACTION */}
                  <div>
                    <button
                      type="button"
                      className="admin-demo-view-btn"
                      onClick={() =>
                        navigate(
                          `/admin/demandes-demo/${request.id}`
                        )
                      }
                    >
                      <FiEye />
                      <span>
                        Voir
                      </span>
                    </button>
                  </div>

                </div>
              ))
            ) : (
              <div className="admin-demo-empty">

                <strong>
                  Aucune demande trouvée
                </strong>

                <span>
                  Modifiez votre recherche ou vos filtres.
                </span>

              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}

export default AdminDemoRequestsPage;