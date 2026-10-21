
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiMail,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";

import api from "../services/api";
import logo from "../assets/logo.png";

import "./PasswordRecovery.css";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Veuillez renseigner votre adresse e-mail.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post(
        "/forgot-password",
        {
          email: normalizedEmail,
        },
        {
          timeout: 60000,
        }
      );

      if (response.data?.success !== true) {
        throw new Error(
          response.data?.message ||
            "Impossible de traiter votre demande."
        );
      }

      setSent(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Une erreur est survenue. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="password-recovery-page">
      <div className="password-recovery-card">
        <div className="password-recovery-brand">
          <img
            src={logo}
            alt="Logo Portrélia"
            className="password-recovery-logo"
          />

          <span>Portrélia</span>
        </div>

        {!sent ? (
          <>
            <div className="password-recovery-icon">
              <FiMail />
            </div>

            <div className="password-recovery-header">
              <h1>Mot de passe oublié ?</h1>

              <p>
                Pas d'inquiétude. Indiquez l'adresse
                e-mail associée à votre compte et nous
                vous enverrons un lien pour réinitialiser
                votre mot de passe.
              </p>
            </div>

            <form
              className="password-recovery-form"
              onSubmit={handleSubmit}
            >
              <div className="password-recovery-field">
                <label htmlFor="recovery-email">
                  Adresse e-mail
                </label>

                <div className="password-recovery-input">
                  <FiMail />

                  <input
                    id="recovery-email"
                    type="email"
                    placeholder="nom@entreprise.fr"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setError("");
                    }}
                    autoComplete="email"
                    maxLength={254}
                    required
                    autoFocus
                  />
                </div>
              </div>

              {error && (
                <div
                  className="password-recovery-alert error"
                  role="alert"
                >
                  <FiAlertCircle />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="password-recovery-submit"
                disabled={loading}
              >
                {loading
                  ? "Envoi en cours..."
                  : "Recevoir le lien de réinitialisation"}
              </button>
            </form>
          </>
        ) : (
          <div className="password-recovery-confirmation">
            <div className="password-recovery-icon success">
              <FiCheckCircle />
            </div>

            <h1>Consultez vos e-mails</h1>

            <p>
              Si un compte est associé à cette adresse,
              vous recevrez un e-mail contenant un lien
              pour réinitialiser votre mot de passe.
            </p>

            <div className="password-recovery-email-display">
              <FiMail />
              <span>{email.trim().toLowerCase()}</span>
            </div>

            <p className="password-recovery-hint">
              Pensez à vérifier vos courriers indésirables.
              Le lien est valable 30 minutes.
            </p>

            <button
              type="button"
              className="password-recovery-secondary"
              onClick={() => {
                setSent(false);
                setError("");
              }}
            >
              Utiliser une autre adresse
            </button>
          </div>
        )}

        <div className="password-recovery-footer">
          <Link to="/connexion">
            <FiArrowLeft />
            Retour à la connexion
          </Link>
        </div>
      </div>
    </section>
  );
}

export default ForgotPasswordPage;
