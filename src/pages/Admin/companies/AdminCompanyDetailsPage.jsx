import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  FiArrowLeft,
  FiBriefcase,
  FiMail,
  FiPhone,
  FiUsers,
  FiGlobe,
  FiCalendar,
  FiActivity,
  FiCheckCircle,
  FiEdit3,
  FiSave,
  FiX,
  FiTrash2,
} from "react-icons/fi";

import {
  ClipLoader,
} from "react-spinners";



import "./AdminCompanyDetailsPage.css";
import api from "../../../services/api";

function AdminCompanyDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [company, setCompany] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [editing, setEditing] =
    useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [form, setForm] =
    useState({
      name: "",
      billingEmail: "",
      phone: "",
      website: "",
      employeeCount: "",
      employeeSizeRange: "",
      status: "ACTIVE",
    });

  useEffect(() => {
    let active = true;

    const fetchCompany =
      async () => {
        try {
          setLoading(true);
          setErrorMessage("");

          const response =
            await api.get(
              `/admin/companies/${id}`
            );

          if (!active) {
            return;
          }

          if (
            response.data.success
          ) {
            const data =
              response.data.data;

            const initials =
              data.name
                ?.split(" ")
                .filter(Boolean)
                .map((word) =>
                  word
                    .charAt(0)
                    .toUpperCase()
                )
                .slice(0, 2)
                .join("") || "?";

            const formattedCompany = {
              id: data.id,
              name: data.name,
              initials,

              billingEmail:
                data.billing_email,

              phone:
                data.phone,

              employeeCount:
                data.employee_count,

              employeeSizeRange:
                data.employee_size_range,

              website:
                data.website_url,

              status:
                data.status,

              campaigns:
                Number(
                  data.campaigns_count ||
                    0
                ),

              contactFirstName:
                data.contact_first_name,

              contactLastName:
                data.contact_last_name,

              contactEmail:
                data.contact_email,

              contactIsActive:
                data.contact_is_active,

              contactLastLogin:
                data.contact_last_login_at,

              sourceDemoRequestId:
                data.source_demo_request_id,

              createdAt:
                data.created_at,

              updatedAt:
                data.updated_at,
            };

            setCompany(
              formattedCompany
            );

            setForm({
              name:
                formattedCompany.name ||
                "",

              billingEmail:
                formattedCompany.billingEmail ||
                "",

              phone:
                formattedCompany.phone ||
                "",

              website:
                formattedCompany.website ||
                "",

              employeeCount:
                formattedCompany.employeeCount ??
                "",

              employeeSizeRange:
                formattedCompany.employeeSizeRange ||
                "",

              status:
                formattedCompany.status ||
                "ACTIVE",
            });
          }
        } catch (error) {
          if (!active) {
            return;
          }

          console.error(
            "Erreur récupération entreprise :",
            error
          );

          setErrorMessage(
            error.response?.data
              ?.message ||
              "Impossible de charger cette entreprise."
          );
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };

    fetchCompany();

    return () => {
      active = false;
    };
  }, [id]);

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const startEditing = () => {
    setErrorMessage("");
    setSuccessMessage("");

    setForm({
      name:
        company.name || "",

      billingEmail:
        company.billingEmail || "",

      phone:
        company.phone || "",

      website:
        company.website || "",

      employeeCount:
        company.employeeCount ?? "",

      employeeSizeRange:
        company.employeeSizeRange ||
        "",

      status:
        company.status ||
        "ACTIVE",
    });

    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const saveCompany =
    async () => {
      try {
        setSaving(true);
        setErrorMessage("");
        setSuccessMessage("");

        const payload = {
          name:
            form.name.trim(),

          billingEmail:
            form.billingEmail.trim() ||
            null,

          phone:
            form.phone.trim() ||
            null,

          website:
            form.website.trim() ||
            null,

          employeeCount:
            form.employeeCount === ""
              ? null
              : Number(
                  form.employeeCount
                ),

          employeeSizeRange:
            form.employeeSizeRange.trim() ||
            null,

          status:
            form.status,
        };

        const response =
          await api.patch(
            `/admin/companies/${id}`,
            payload
          );

        if (
          response.data.success
        ) {
          const data =
            response.data.data;

          const initials =
            data.name
              ?.split(" ")
              .filter(Boolean)
              .map((word) =>
                word
                  .charAt(0)
                  .toUpperCase()
              )
              .slice(0, 2)
              .join("") || "?";

          setCompany(
            (previous) => ({
              ...previous,

              name:
                data.name,

              initials,

              billingEmail:
                data.billing_email,

              phone:
                data.phone,

              employeeCount:
                data.employee_count,

              employeeSizeRange:
                data.employee_size_range,

              website:
                data.website_url,

              status:
                data.status,

              updatedAt:
                data.updated_at,
            })
          );

          setEditing(false);

          setSuccessMessage(
            response.data.message ||
              "Entreprise mise à jour avec succès."
          );
        }
      } catch (error) {
        console.error(
          "Erreur modification entreprise :",
          error
        );

        setErrorMessage(
          error.response?.data
            ?.message ||
            "Impossible de modifier l'entreprise."
        );
      } finally {
        setSaving(false);
      }
    };

  const deleteCompany =
    async () => {
      const confirmed =
        window.confirm(
          `Voulez-vous vraiment supprimer "${company.name}" ?\n\nCette action supprimera définitivement l'entreprise, ses utilisateurs et ses campagnes.`
        );

      if (!confirmed) {
        return;
      }

      try {
        setDeleting(true);
        setErrorMessage("");
        setSuccessMessage("");

        const response =
          await api.delete(
            `/admin/companies/${id}`
          );

        if (
          response.data.success
        ) {
          navigate(
            "/admin/entreprises",
            {
              replace: true,
            }
          );
        }
      } catch (error) {
        console.error(
          "Erreur suppression entreprise :",
          error
        );

        setErrorMessage(
          error.response?.data
            ?.message ||
            "Impossible de supprimer l'entreprise."
        );
      } finally {
        setDeleting(false);
      }
    };

  const formatDate = (
    date
  ) => {
    if (!date) {
      return "Jamais";
    }

    return new Intl.DateTimeFormat(
      "fr-FR",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    ).format(
      new Date(date)
    );
  };

  const getStatusLabel = (
    status
  ) => {
    switch (status) {
      case "ACTIVE":
        return "Active";

      case "SUSPENDED":
        return "Suspendue";

      case "ARCHIVED":
        return "Archivée";

      default:
        return status;
    }
  };

  const getStatusClass = (
    status
  ) => {
    switch (status) {
      case "ACTIVE":
        return "admin-company-status-active";

      case "ARCHIVED":
        return "admin-company-status-archived";

      default:
        return "admin-company-status-suspended";
    }
  };

  if (loading) {
    return (
      <div className="admin-company-details-page">

        <button
          type="button"
          className="admin-company-back-btn"
          onClick={() =>
            navigate(
              "/admin/entreprises"
            )
          }
        >
          <FiArrowLeft />
          Retour aux entreprises
        </button>

        <div className="admin-company-details-loading">

          <ClipLoader
            size={36}
            color="#4f2e94"
          />

          <span>
            Chargement de l'entreprise...
          </span>

        </div>

      </div>
    );
  }

  if (
    errorMessage &&
    !company
  ) {
    return (
      <div className="admin-company-details-page">

        <button
          type="button"
          className="admin-company-back-btn"
          onClick={() =>
            navigate(
              "/admin/entreprises"
            )
          }
        >
          <FiArrowLeft />
          Retour aux entreprises
        </button>

        <div className="admin-company-not-found">
          {errorMessage}
        </div>

      </div>
    );
  }

  if (!company) {
    return (
      <div className="admin-company-details-page">

        <button
          type="button"
          className="admin-company-back-btn"
          onClick={() =>
            navigate(
              "/admin/entreprises"
            )
          }
        >
          <FiArrowLeft />
          Retour aux entreprises
        </button>

        <div className="admin-company-not-found">
          Entreprise introuvable.
        </div>

      </div>
    );
  }

  const contactName =
    `${
      company.contactFirstName ||
      ""
    } ${
      company.contactLastName ||
      ""
    }`.trim() ||
    "Non renseigné";

  const employees =
    company.employeeCount ??
    company.employeeSizeRange ??
    "Non renseigné";

  return (
    <div className="admin-company-details-page">

      {/* TOP */}
      <div className="admin-company-details-top">

        <button
          type="button"
          className="admin-company-back-btn"
          onClick={() =>
            navigate(
              "/admin/entreprises"
            )
          }
        >
          <FiArrowLeft />
          Retour aux entreprises
        </button>

        {!editing && (
          <div className="admin-company-top-actions">

            <button
              type="button"
              className="admin-company-delete-btn"
              onClick={
                deleteCompany
              }
              disabled={
                deleting
              }
            >
              {deleting ? (
                <>
                  <ClipLoader
                    size={14}
                    color="#dc2626"
                  />
                  Suppression...
                </>
              ) : (
                <>
                  <FiTrash2 />
                  Supprimer
                </>
              )}
            </button>

            <button
              type="button"
              className="admin-company-edit-btn"
              onClick={
                startEditing
              }
              disabled={
                deleting
              }
            >
              <FiEdit3 />
              Modifier
            </button>

          </div>
        )}

      </div>

      {/* SUCCESS */}
      {successMessage && (
        <div className="admin-company-update-success">
          <FiCheckCircle />

          <span>
            {successMessage}
          </span>
        </div>
      )}

      {/* ERROR */}
      {errorMessage && (
        <div className="admin-company-update-error">
          {errorMessage}
        </div>
      )}

      {/* HEADER */}
      <div className="admin-company-details-header">

        <div className="admin-company-details-identity">

          <div className="admin-company-details-avatar">
            {company.initials}
          </div>

          <div>
            <span>
              ENTREPRISE
            </span>

            <h1>
              {company.name}
            </h1>

            <p>
              {contactName}
            </p>
          </div>

        </div>

        <span
          className={`admin-company-status ${getStatusClass(
            company.status
          )}`}
        >
          {getStatusLabel(
            company.status
          )}
        </span>

      </div>

      {/* SUMMARY */}
      <div className="admin-company-details-stats">

        <div>
          <strong>
            {employees}
          </strong>

          <span>
            Collaborateurs
          </span>
        </div>

        <div>
          <strong>
            {company.campaigns}
          </strong>

          <span>
            Campagnes
          </span>
        </div>

      </div>

      {/* VIEW MODE */}
      {!editing && (
        <section className="admin-company-details-card">

          <div className="admin-company-details-card-header">
            <h2>
              Informations de l’entreprise
            </h2>

            <p>
              Coordonnées et informations générales.
            </p>
          </div>

          <div className="admin-company-details-grid">

            <div className="admin-company-detail-item">
              <FiBriefcase />

              <div>
                <span>
                  Entreprise
                </span>

                <strong>
                  {company.name}
                </strong>
              </div>
            </div>

            <div className="admin-company-detail-item">
              <FiUsers />

              <div>
                <span>
                  Contact principal
                </span>

                <strong>
                  {contactName}
                </strong>
              </div>
            </div>

            <div className="admin-company-detail-item">
              <FiMail />

              <div>
                <span>
                  Email de connexion
                </span>

                <strong>
                  {company.contactEmail ||
                    "Non renseigné"}
                </strong>
              </div>
            </div>

            <div className="admin-company-detail-item">
              <FiPhone />

              <div>
                <span>
                  Téléphone
                </span>

                <strong>
                  {company.phone ||
                    "Non renseigné"}
                </strong>
              </div>
            </div>

            <div className="admin-company-detail-item">
              <FiGlobe />

              <div>
                <span>
                  Site web
                </span>

                <strong>
                  {company.website ||
                    "Non renseigné"}
                </strong>
              </div>
            </div>

            <div className="admin-company-detail-item">
              <FiMail />

              <div>
                <span>
                  Email de facturation
                </span>

                <strong>
                  {company.billingEmail ||
                    "Non renseigné"}
                </strong>
              </div>
            </div>

            <div className="admin-company-detail-item">
              <FiCalendar />

              <div>
                <span>
                  Créée le
                </span>

                <strong>
                  {formatDate(
                    company.createdAt
                  )}
                </strong>
              </div>
            </div>

            <div className="admin-company-detail-item">
              <FiActivity />

              <div>
                <span>
                  Dernière connexion
                </span>

                <strong>
                  {formatDate(
                    company.contactLastLogin
                  )}
                </strong>
              </div>
            </div>

            <div className="admin-company-detail-item">
              <FiCheckCircle />

              <div>
                <span>
                  Compte entreprise
                </span>

                <strong>
                  {company.contactIsActive
                    ? "Activé"
                    : "Activation en attente"}
                </strong>
              </div>
            </div>

          </div>

        </section>
      )}

      {/* EDIT MODE */}
      {editing && (
        <section className="admin-company-details-card">

          <div className="admin-company-details-card-header">
            <h2>
              Modifier l’entreprise
            </h2>

            <p>
              Modifiez les informations puis enregistrez les changements.
            </p>
          </div>

          <div className="admin-company-edit-grid">

            <div className="admin-company-edit-field">
              <label htmlFor="name">
                Nom de l’entreprise
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={
                  form.name
                }
                onChange={
                  handleChange
                }
              />
            </div>

            <div className="admin-company-edit-field">
              <label htmlFor="billingEmail">
                Email de facturation
              </label>

              <input
                id="billingEmail"
                name="billingEmail"
                type="email"
                value={
                  form.billingEmail
                }
                onChange={
                  handleChange
                }
              />
            </div>

            <div className="admin-company-edit-field">
              <label htmlFor="phone">
                Téléphone
              </label>

              <input
                id="phone"
                name="phone"
                type="text"
                value={
                  form.phone
                }
                onChange={
                  handleChange
                }
              />
            </div>

            <div className="admin-company-edit-field">
              <label htmlFor="website">
                Site web
              </label>

              <input
                id="website"
                name="website"
                type="url"
                value={
                  form.website
                }
                onChange={
                  handleChange
                }
              />
            </div>

            <div className="admin-company-edit-field">
              <label htmlFor="employeeSizeRange">
                Taille d’équipe
              </label>

              <select
                id="employeeSizeRange"
                name="employeeSizeRange"
                value={
                  form.employeeSizeRange
                }
                onChange={
                  handleChange
                }
              >
                <option value="">
                  Non renseignée
                </option>

                <option value="1-10">
                  1 à 10
                </option>

                <option value="11-50">
                  11 à 50
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

            <div className="admin-company-edit-field">
              <label htmlFor="employeeCount">
                Nombre exact de collaborateurs
              </label>

              <input
                id="employeeCount"
                name="employeeCount"
                type="number"
                min="0"
                value={
                  form.employeeCount
                }
                onChange={
                  handleChange
                }
                placeholder="Ex : 42"
              />
            </div>

            <div className="admin-company-edit-field admin-company-edit-status-field">
              <label htmlFor="status">
                Statut
              </label>

              <select
                id="status"
                name="status"
                value={
                  form.status
                }
                onChange={
                  handleChange
                }
              >
                <option value="ACTIVE">
                  Active
                </option>

                <option value="SUSPENDED">
                  Suspendue / inactive
                </option>

                <option value="ARCHIVED">
                  Archivée
                </option>
              </select>
            </div>

          </div>

          <div className="admin-company-edit-actions">

            <button
              type="button"
              className="admin-company-edit-cancel"
              onClick={
                cancelEditing
              }
              disabled={
                saving
              }
            >
              <FiX />
              Annuler
            </button>

            <button
              type="button"
              className="admin-company-edit-save"
              onClick={
                saveCompany
              }
              disabled={
                saving
              }
            >
              {saving ? (
                <>
                  <ClipLoader
                    size={15}
                    color="#ffffff"
                  />
                  Enregistrement...
                </>
              ) : (
                <>
                  <FiSave />
                  Enregistrer
                </>
              )}
            </button>

          </div>

        </section>
      )}

    </div>
  );
}

export default AdminCompanyDetailsPage;