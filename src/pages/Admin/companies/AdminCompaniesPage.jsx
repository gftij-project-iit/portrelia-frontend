import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  FiSearch,
  FiFilter,
  FiEye,
  FiX,
  FiChevronDown,
} from "react-icons/fi";

import {
  ClipLoader,
} from "react-spinners";



import "./AdminCompaniesPage.css";
import api from "../../../services/api";

function AdminCompaniesPage() {
  const navigate = useNavigate();

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [draftFilters, setDraftFilters] = useState({
    status: "ALL",
    employees: "ALL",
    campaigns: "ALL",
  });

  const [filters, setFilters] = useState({
    status: "ALL",
    employees: "ALL",
    campaigns: "ALL",
  });

  useEffect(() => {
    let active = true;

    const fetchCompanies = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await api.get(
          "/admin/companies"
        );

        if (!active) {
          return;
        }

        if (response.data.success) {
          const formattedCompanies =
            response.data.data.map(
              (company) => {
                const firstName =
                  company.contact_first_name || "";

                const lastName =
                  company.contact_last_name || "";

                const initials =
                  company.name
                    ?.split(" ")
                    .filter(Boolean)
                    .map((word) =>
                      word.charAt(0).toUpperCase()
                    )
                    .slice(0, 2)
                    .join("") || "?";

                return {
                  id: company.id,
                  name: company.name,
                  initials,
                  email:
                    company.billing_email ||
                    company.contact_email ||
                    "Non renseigné",
                  contact:
                    `${firstName} ${lastName}`.trim() ||
                    "Non renseigné",
                  employees:
                    company.employee_size_range ||
                    company.employee_count ||
                    "Non renseigné",
                  employeeCount:
                    company.employee_count,
                  employeeSizeRange:
                    company.employee_size_range,
                  campaigns:
                    Number(
                      company.campaigns_count || 0
                    ),
                  status: company.status,
                  accountActive:
                    company.contact_is_active,
                  createdAt:
                    company.created_at,
                  updatedAt:
                    company.updated_at,
                };
              }
            );

          setCompanies(
            formattedCompanies
          );
        }
      } catch (error) {
        if (!active) {
          return;
        }

        console.error(
          "Erreur récupération entreprises :",
          error
        );

        setErrorMessage(
          error.response?.data?.message ||
            "Impossible de charger les entreprises."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchCompanies();

    return () => {
      active = false;
    };
  }, []);

  const matchesEmployeeFilter = (
    company,
    filter
  ) => {
    if (filter === "ALL") {
      return true;
    }

    /*
     * Si on a un employee_count exact,
     * on utilise le nombre.
     */
    if (
      company.employeeCount !== null &&
      company.employeeCount !== undefined
    ) {
      const count =
        Number(company.employeeCount);

      if (filter === "1-50") {
        return count >= 1 && count <= 50;
      }

      if (filter === "51-100") {
        return count >= 51 && count <= 100;
      }

      if (filter === "101-250") {
        return count >= 101 && count <= 250;
      }

      if (filter === "250+") {
        return count > 250;
      }
    }

    /*
     * Sinon on utilise la tranche
     * employee_size_range issue de la démo.
     */
    const range =
      company.employeeSizeRange;

    if (!range) {
      return false;
    }

    const numbers =
      range.match(/\d+/g)?.map(Number) || [];

    if (range.includes("+")) {
      const minimum =
        numbers[0] || 0;

      if (filter === "250+") {
        return minimum >= 250;
      }

      if (filter === "101-250") {
        return minimum >= 101 &&
          minimum <= 250;
      }

      if (filter === "51-100") {
        return minimum >= 51 &&
          minimum <= 100;
      }

      if (filter === "1-50") {
        return minimum >= 1 &&
          minimum <= 50;
      }

      return false;
    }

    const minimum =
      numbers[0] || 0;

    const maximum =
      numbers[1] ?? minimum;

    if (filter === "1-50") {
      return (
        minimum <= 50 &&
        maximum >= 1
      );
    }

    if (filter === "51-100") {
      return (
        minimum <= 100 &&
        maximum >= 51
      );
    }

    if (filter === "101-250") {
      return (
        minimum <= 250 &&
        maximum >= 101
      );
    }

    if (filter === "250+") {
      return maximum > 250;
    }

    return true;
  };

  const filteredCompanies =
    useMemo(() => {
      return companies.filter(
        (company) => {
          const query =
            search
              .toLowerCase()
              .trim();

          const matchesSearch =
            !query ||
            company.name
              .toLowerCase()
              .includes(query) ||
            company.email
              .toLowerCase()
              .includes(query) ||
            company.contact
              .toLowerCase()
              .includes(query);

          const matchesStatus =
            filters.status === "ALL" ||
            company.status ===
              filters.status;

          const matchesEmployees =
            matchesEmployeeFilter(
              company,
              filters.employees
            );

          let matchesCampaigns = true;

          if (
            filters.campaigns === "0"
          ) {
            matchesCampaigns =
              company.campaigns === 0;
          }

          if (
            filters.campaigns === "1-2"
          ) {
            matchesCampaigns =
              company.campaigns >= 1 &&
              company.campaigns <= 2;
          }

          if (
            filters.campaigns === "3+"
          ) {
            matchesCampaigns =
              company.campaigns >= 3;
          }

          return (
            matchesSearch &&
            matchesStatus &&
            matchesEmployees &&
            matchesCampaigns
          );
        }
      );
    }, [
      companies,
      search,
      filters,
    ]);

  const handleFilterChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setDraftFilters(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  };

  const applyFilters = () => {
    setFilters(draftFilters);
    setFiltersOpen(false);
  };

  const resetFilters = () => {
    const initialFilters = {
      status: "ALL",
      employees: "ALL",
      campaigns: "ALL",
    };

    setDraftFilters(
      initialFilters
    );

    setFilters(
      initialFilters
    );
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
      }
    ).format(
      new Date(date)
    );
  };

  return (
    <div className="admin-companies-page">

      {/* HEADER */}
      <div className="admin-companies-header">
        <div>
          <h1>
            Entreprises
          </h1>

          <p>
            Gérez les entreprises clientes de Portrélia.
          </p>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="admin-companies-toolbar">

        <div className="admin-companies-search">
          <FiSearch />

          <input
            type="text"
            placeholder="Rechercher une entreprise..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />
        </div>

        <div className="admin-companies-filter-wrapper">

          <button
            type="button"
            className={`admin-companies-filter ${
              filtersOpen
                ? "admin-companies-filter-active"
                : ""
            }`}
            onClick={() =>
              setFiltersOpen(
                (previous) =>
                  !previous
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
            <div className="admin-companies-filter-panel">

              <div className="admin-companies-filter-panel-header">
                <div>
                  <strong>
                    Filtres
                  </strong>

                  <span>
                    Affinez la liste des entreprises
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setFiltersOpen(false)
                  }
                >
                  <FiX />
                </button>
              </div>

              <div className="admin-companies-filter-field">
                <label htmlFor="status">
                  Statut
                </label>

                <select
                  id="status"
                  name="status"
                  value={
                    draftFilters.status
                  }
                  onChange={
                    handleFilterChange
                  }
                >
                  <option value="ALL">
                    Tous les statuts
                  </option>

                  <option value="ACTIVE">
                    Active
                  </option>

                  <option value="SUSPENDED">
                    Suspendue
                  </option>

                  <option value="ARCHIVED">
                    Archivée
                  </option>
                </select>
              </div>

              <div className="admin-companies-filter-field">
                <label htmlFor="employees">
                  Collaborateurs
                </label>

                <select
                  id="employees"
                  name="employees"
                  value={
                    draftFilters.employees
                  }
                  onChange={
                    handleFilterChange
                  }
                >
                  <option value="ALL">
                    Toutes les tailles
                  </option>

                  <option value="1-50">
                    1 à 50
                  </option>

                  <option value="51-100">
                    51 à 100
                  </option>

                  <option value="101-250">
                    101 à 250
                  </option>

                  <option value="250+">
                    Plus de 250
                  </option>
                </select>
              </div>

              <div className="admin-companies-filter-field">
                <label htmlFor="campaigns">
                  Campagnes
                </label>

                <select
                  id="campaigns"
                  name="campaigns"
                  value={
                    draftFilters.campaigns
                  }
                  onChange={
                    handleFilterChange
                  }
                >
                  <option value="ALL">
                    Toutes
                  </option>

                  <option value="0">
                    Aucune
                  </option>

                  <option value="1-2">
                    1 à 2
                  </option>

                  <option value="3+">
                    3 ou plus
                  </option>
                </select>
              </div>

              <div className="admin-companies-filter-actions">

                <button
                  type="button"
                  className="admin-companies-reset-btn"
                  onClick={
                    resetFilters
                  }
                >
                  Réinitialiser
                </button>

                <button
                  type="button"
                  className="admin-companies-apply-btn"
                  onClick={
                    applyFilters
                  }
                >
                  Appliquer
                </button>

              </div>

            </div>
          )}

        </div>

      </div>

      {/* LOADING */}
      {loading && (
        <div className="admin-companies-loading">
          <ClipLoader
            size={34}
            color="#4f2e94"
          />

          <span>
            Chargement des entreprises...
          </span>
        </div>
      )}

      {/* ERROR */}
      {!loading &&
        errorMessage && (
          <div className="admin-companies-error">
            {errorMessage}
          </div>
        )}

      {/* DATA */}
      {!loading &&
        !errorMessage && (
          <>

            {/* RESULT COUNT */}
            <div className="admin-companies-results">
              <span>
                {filteredCompanies.length}
                {" "}
                {filteredCompanies.length > 1
                  ? "entreprises"
                  : "entreprise"}
              </span>
            </div>

            {/* TABLE */}
            <div className="admin-companies-table">

              <div className="admin-companies-table-header">
                <div>
                  Entreprise
                </div>

                <div>
                  Contact
                </div>

                <div>
                  Collaborateurs
                </div>

                <div>
                  Campagnes
                </div>

                <div>
                  Statut
                </div>

                <div>
                  Créée le
                </div>

                <div>
                  Action
                </div>
              </div>

              <div className="admin-companies-table-body">

                {filteredCompanies.length > 0 ? (
                  filteredCompanies.map(
                    (company) => (
                      <div
                        key={
                          company.id
                        }
                        className="admin-companies-row"
                      >

                        <div className="admin-company-main">

                          <div className="admin-company-avatar">
                            {
                              company.initials
                            }
                          </div>

                          <div className="admin-company-main-info">
                            <strong>
                              {
                                company.name
                              }
                            </strong>

                            <span>
                              {
                                company.email
                              }
                            </span>
                          </div>

                        </div>

                        <div className="admin-company-contact">
                          {
                            company.contact
                          }
                        </div>

                        <div className="admin-company-value">
                          {
                            company.employees
                          }
                        </div>

                        <div className="admin-company-value">
                          {
                            company.campaigns
                          }
                        </div>

                        <div>
                          <span
                            className={`admin-company-status ${
                              company.status ===
                              "ACTIVE"
                                ? "admin-company-status-active"
                                : "admin-company-status-suspended"
                            }`}
                          >
                            {company.status ===
                            "ACTIVE"
                              ? "Active"
                              : company.status ===
                                  "ARCHIVED"
                                ? "Archivée"
                                : "Suspendue"}
                          </span>
                        </div>

                        <div className="admin-company-value">
                          {formatDate(
                            company.createdAt
                          )}
                        </div>

                        <div>
                          <button
                            type="button"
                            className="admin-company-view-btn"
                            onClick={() =>
                              navigate(
                                `/admin/entreprises/${company.id}`
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
                    )
                  )
                ) : (
                  <div className="admin-companies-empty">
                    <strong>
                      Aucune entreprise trouvée
                    </strong>

                    <span>
                      Modifiez votre recherche ou vos filtres.
                    </span>
                  </div>
                )}

              </div>

            </div>

          </>
        )}

    </div>
  );
}

export default AdminCompaniesPage;