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
  FiUser,
  FiMail,
  FiPhone,
  FiUsers,
  FiMessageSquare,
  FiCalendar,
  FiCheckCircle,
  FiTrash2,
} from "react-icons/fi";

import {
  ClipLoader,
} from "react-spinners";

import api from "../../services/api";

import "./AdminDemoRequestDetailsPage.css";

function AdminDemoRequestDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [request, setRequest] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);

  const [
    activeAction,
    setActiveAction,
  ] = useState(null);

  const [deleting, setDeleting] =
    useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    actionMessage,
    setActionMessage,
  ] = useState("");

  useEffect(() => {
    let active = true;

    const fetchRequest = async () => {
      try {
        setErrorMessage("");

        const response =
          await api.get(
            `/admin/demo-requests/${id}`
          );

        if (!active) {
          return;
        }

        if (
          response.data.success
        ) {
          const data =
            response.data.data;

          setRequest({
            id: data.id,
            companyName:
              data.company_name,
            firstName:
              data.first_name,
            lastName:
              data.last_name,
            email:
              data.email,
            phone:
              data.phone,
            teamSize:
              data.team_size,
            message:
              data.message,
            consent:
              data.consent_to_contact,
            status:
              data.status,
            createdAt:
              data.created_at,
          });
        }
      } catch (error) {
        if (!active) {
          return;
        }

        console.error(
          "Erreur récupération détail demande :",
          error
        );

        setErrorMessage(
          error.response?.data
            ?.message ||
            "Impossible de charger cette demande."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchRequest();

    return () => {
      active = false;
    };
  }, [id]);

  const updateStatus = async (
    status
  ) => {
    if (
      request.status ===
        "ACCEPTED" ||
      request.status ===
        "REJECTED"
    ) {
      return;
    }

    if (
      status !== "CONTACTED" &&
      status !== "REJECTED"
    ) {
      return;
    }

    try {
      setActionLoading(true);
      setActiveAction(status);
      setErrorMessage("");
      setActionMessage("");

      const response =
        await api.patch(
          `/admin/demo-requests/${id}/status`,
          {
            status,
          }
        );

      if (
        response.data.success
      ) {
        const data =
          response.data.data;

        setRequest(
          (previous) => ({
            ...previous,
            status:
              data.status,
          })
        );

        setActionMessage(
          response.data.message ||
            "Statut mis à jour avec succès."
        );
      }
    } catch (error) {
      console.error(
        "Erreur mise à jour statut :",
        error
      );

      setErrorMessage(
        error.response?.data
          ?.message ||
          "Impossible de modifier le statut."
      );
    } finally {
      setActionLoading(false);
      setActiveAction(null);
    }
  };

  const acceptRequest =
    async () => {
      if (
        request.status ===
          "ACCEPTED" ||
        request.status ===
          "REJECTED"
      ) {
        return;
      }

      try {
        setActionLoading(true);
        setActiveAction(
          "ACCEPTED"
        );
        setErrorMessage("");
        setActionMessage("");

        const response =
          await api.post(
            `/admin/demo-requests/${id}/accept`
          );

        if (
          response.data.success
        ) {
          const data =
            response.data.data
              ?.request ||
            response.data.data;

          setRequest(
            (previous) => ({
              ...previous,
              status:
                data?.status ||
                "ACCEPTED",
            })
          );

          setActionMessage(
            response.data.message ||
              "La demande a été acceptée avec succès."
          );
        }
      } catch (error) {
        console.error(
          "Erreur acceptation demande :",
          error
        );

        setErrorMessage(
          error.response?.data
            ?.message ||
            "Impossible d'accepter cette demande."
        );
      } finally {
        setActionLoading(false);
        setActiveAction(null);
      }
    };

  const deleteRequest =
    async () => {
      if (
        request.status ===
        "ACCEPTED"
      ) {
        setErrorMessage(
          "Une demande acceptée ne peut pas être supprimée directement."
        );

        return;
      }

      const confirmed =
        window.confirm(
          `Voulez-vous vraiment supprimer la demande de "${request.companyName}" ?\n\nCette action est définitive.`
        );

      if (!confirmed) {
        return;
      }

      try {
        setDeleting(true);
        setErrorMessage("");
        setActionMessage("");

        const response =
          await api.delete(
            `/admin/demo-requests/${id}`
          );

        if (
          response.data.success
        ) {
          navigate(
            "/admin/demandes-demo",
            {
              replace: true,
            }
          );
        }
      } catch (error) {
        console.error(
          "Erreur suppression demande :",
          error
        );

        setErrorMessage(
          error.response?.data
            ?.message ||
            "Impossible de supprimer cette demande."
        );
      } finally {
        setDeleting(false);
      }
    };

  const getStatusLabel = (
    status
  ) => {
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

  const formatDate = (
    date
  ) => {
    if (!date) {
      return "-";
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

  if (loading) {
    return (
      <div className="admin-demo-details-page">

        <button
          type="button"
          className="admin-demo-back-btn"
          onClick={() =>
            navigate(
              "/admin/demandes-demo"
            )
          }
        >
          <FiArrowLeft />
          Retour aux demandes
        </button>

        <div className="admin-demo-details-loading">
          <ClipLoader
            size={36}
            color="#4f2e94"
          />

          <span>
            Chargement de la demande...
          </span>
        </div>

      </div>
    );
  }

  if (
    errorMessage &&
    !request
  ) {
    return (
      <div className="admin-demo-details-page">

        <button
          type="button"
          className="admin-demo-back-btn"
          onClick={() =>
            navigate(
              "/admin/demandes-demo"
            )
          }
        >
          <FiArrowLeft />
          Retour aux demandes
        </button>

        <div className="admin-demo-details-not-found">
          {errorMessage}
        </div>

      </div>
    );
  }

  if (!request) {
    return (
      <div className="admin-demo-details-page">

        <button
          type="button"
          className="admin-demo-back-btn"
          onClick={() =>
            navigate(
              "/admin/demandes-demo"
            )
          }
        >
          <FiArrowLeft />
          Retour aux demandes
        </button>

        <div className="admin-demo-details-not-found">
          Demande introuvable.
        </div>

      </div>
    );
  }

  return (
    <div className="admin-demo-details-page">

      {/* TOP */}
      <div className="admin-demo-details-top">

        <button
          type="button"
          className="admin-demo-back-btn"
          onClick={() =>
            navigate(
              "/admin/demandes-demo"
            )
          }
        >
          <FiArrowLeft />
          Retour aux demandes
        </button>

        {request.status !==
          "ACCEPTED" && (
          <button
            type="button"
            className="admin-demo-delete-btn"
            onClick={
              deleteRequest
            }
            disabled={
              deleting ||
              actionLoading
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
        )}

      </div>

      {/* HEADER */}
      <div className="admin-demo-details-header">

        <div>
          <span className="admin-demo-details-kicker">
            DEMANDE DE DÉMO
          </span>

          <h1>
            {request.companyName}
          </h1>

          <p>
            Demande #{request.id}
          </p>
        </div>

        <span
          className={`admin-demo-status admin-demo-status-${request.status.toLowerCase()}`}
        >
          {getStatusLabel(
            request.status
          )}
        </span>

      </div>

      {/* INFORMATIONS */}
      <section className="admin-demo-details-card">

        <div className="admin-demo-details-card-header">
          <h2>
            Informations de la demande
          </h2>

          <p>
            Coordonnées et besoin exprimé par le prospect.
          </p>
        </div>

        <div className="admin-demo-details-grid">

          <div className="admin-demo-detail-item">
            <FiBriefcase />

            <div>
              <span>
                Entreprise
              </span>

              <strong>
                {request.companyName}
              </strong>
            </div>
          </div>

          <div className="admin-demo-detail-item">
            <FiUser />

            <div>
              <span>
                Contact
              </span>

              <strong>
                {request.firstName}
                {" "}
                {request.lastName}
              </strong>
            </div>
          </div>

          <div className="admin-demo-detail-item">
            <FiMail />

            <div>
              <span>
                Email
              </span>

              <strong>
                {request.email}
              </strong>
            </div>
          </div>

          <div className="admin-demo-detail-item">
            <FiPhone />

            <div>
              <span>
                Téléphone
              </span>

              <strong>
                {request.phone ||
                  "Non renseigné"}
              </strong>
            </div>
          </div>

          <div className="admin-demo-detail-item">
            <FiUsers />

            <div>
              <span>
                Taille d’équipe
              </span>

              <strong>
                {request.teamSize}
              </strong>
            </div>
          </div>

          <div className="admin-demo-detail-item">
            <FiCalendar />

            <div>
              <span>
                Demande reçue
              </span>

              <strong>
                {formatDate(
                  request.createdAt
                )}
              </strong>
            </div>
          </div>

          <div className="admin-demo-detail-item">
            <FiCheckCircle />

            <div>
              <span>
                Consentement
              </span>

              <strong>
                {request.consent
                  ? "Accepté"
                  : "Non accepté"}
              </strong>
            </div>
          </div>

        </div>

      </section>

      {/* MESSAGE */}
      <section className="admin-demo-details-card">

        <div className="admin-demo-details-card-header">
          <h2>
            Besoin exprimé
          </h2>
        </div>

        <div className="admin-demo-message">

          <FiMessageSquare />

          <p>
            {request.message ||
              "Aucun message renseigné."}
          </p>

        </div>

      </section>

      {/* ACTIONS */}
      <section className="admin-demo-details-card">

        <div className="admin-demo-details-card-header">
          <h2>
            Actions
          </h2>

          <p>
            Gérez le traitement de cette demande.
          </p>
        </div>

        {actionMessage && (
          <div className="admin-demo-action-success">
            {actionMessage}
          </div>
        )}

        {errorMessage && (
          <div className="admin-demo-action-error">
            {errorMessage}
          </div>
        )}

        {(request.status ===
          "PENDING" ||
          request.status ===
            "CONTACTED") && (
          <div className="admin-demo-details-actions">

            {request.status ===
              "PENDING" && (
              <button
                type="button"
                className="admin-demo-action-contact"
                onClick={() =>
                  updateStatus(
                    "CONTACTED"
                  )
                }
                disabled={
                  actionLoading ||
                  deleting
                }
              >
                {activeAction ===
                "CONTACTED"
                  ? "Mise à jour..."
                  : "Marquer comme contactée"}
              </button>
            )}

            <button
              type="button"
              className="admin-demo-action-reject"
              onClick={() =>
                updateStatus(
                  "REJECTED"
                )
              }
              disabled={
                actionLoading ||
                deleting
              }
            >
              {activeAction ===
              "REJECTED"
                ? "Refus..."
                : "Refuser"}
            </button>

            <button
              type="button"
              className="admin-demo-action-accept"
              onClick={
                acceptRequest
              }
              disabled={
                actionLoading ||
                deleting
              }
            >
              {activeAction ===
              "ACCEPTED"
                ? "Création du compte..."
                : "Accepter la demande"}
            </button>

          </div>
        )}

        {request.status ===
          "ACCEPTED" && (
          <div className="admin-demo-final-state admin-demo-final-accepted">

            <FiCheckCircle />

            <div>
              <strong>
                Demande acceptée
              </strong>

              <span>
                L'entreprise a été acceptée. Cette demande ne peut plus être modifiée.
              </span>
            </div>

          </div>
        )}

        {request.status ===
          "REJECTED" && (
          <div className="admin-demo-final-state admin-demo-final-rejected">

            <div>
              <strong>
                Demande refusée
              </strong>

              <span>
                Cette demande est finalisée.
                Vous pouvez la supprimer définitivement si nécessaire.
              </span>
            </div>

          </div>
        )}

      </section>

    </div>
  );
}

export default AdminDemoRequestDetailsPage;