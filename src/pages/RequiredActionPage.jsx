import { useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import {
  FiCheckCircle,
  FiAlertCircle,
  FiLoader,
} from "react-icons/fi";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";

import "./RequiredActionPage.css";

function RequiredActionPage() {
  const { code } = useParams();
  const navigate = useNavigate();

  const { user, refreshUser } = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const action = useMemo(() => {
    return user?.requiredActions?.find(
      (item) => item.code === code
    );
  }, [user, code]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "COMPANY_ADMIN") {
    return <Navigate to="/" replace />;
  }

  if (!action) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleAccept = async () => {
    try {
      setSubmitting(true);
      setError("");

      await api.post(
        `/required-actions/${action.id}/accept`
      );

      const updatedUser = await refreshUser();

      const nextAction =
        updatedUser?.requiredActions?.[0];

      if (nextAction) {
        navigate(
          `/required-actions/${nextAction.code}`,
          {
            replace: true,
          }
        );

        return;
      }

      navigate("/dashboard", {
        replace: true,
      });
    } catch (requestError) {
      console.error(
        "Erreur validation required action :",
        requestError
      );

      setError(
        requestError.response?.data?.message ||
          "Impossible de valider cette action."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="required-action-page">
      <div className="required-action-card">
        <div className="required-action-icon">
          <FiCheckCircle />
        </div>

        <span className="required-action-eyebrow">
          ACTION REQUISE
        </span>

        <h1>
          {action.title}
        </h1>

        {action.version && (
          <span className="required-action-version">
            Version {action.version}
          </span>
        )}

        <p>
          {action.description ||
            "Une action est nécessaire avant de continuer vers votre espace entreprise."}
        </p>

        {error && (
          <div className="required-action-error">
            <FiAlertCircle />

            <span>
              {error}
            </span>
          </div>
        )}

        <button
          type="button"
          className="required-action-button"
          onClick={handleAccept}
          disabled={submitting}
        >
          {submitting ? (
            <>
              <FiLoader className="required-action-spinner" />
              Validation...
            </>
          ) : (
            <>
              <FiCheckCircle />
              Valider et continuer
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default RequiredActionPage;