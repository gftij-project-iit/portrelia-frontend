
import { useState } from "react";
import {
  Link,
  useSearchParams,
} from "react-router-dom";

import {
  FiLock,
  FiEye,
  FiEyeOff,
  FiCheckCircle,
  FiAlertCircle,
  FiArrowLeft,
  FiArrowRight,
} from "react-icons/fi";

import api from "../services/api";
import logo from "../assets/logo.png";

import "./PasswordRecovery.css";

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token") || "";

  const validToken = /^[a-f0-9]{64}$/.test(token);

  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading || !validToken) return;

    if (form.newPassword.length < 8) {
      setError(
        "Le mot de passe doit contenir au moins 8 caractères."
      );
      return;
    }

    if (
      new TextEncoder().encode(form.newPassword).length >
      72
    ) {
      setError(
        "Le mot de passe ne doit pas dépasser 72 octets."
      );
      return;
    }

    if (
      form.newPassword !== form.confirmPassword
    ) {
      setError(
        "Les mots de passe ne correspondent pas."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.post(
        "/reset-password",
        {
          token,
          newPassword: form.newPassword,
        },
        {
          timeout: 60000,
        }
      );

      if (response.data?.success !== true) {
        throw new Error(
          response.data?.message ||
            "Impossible de réinitialiser le mot de passe."
        );
      }

      setSuccess(true);

      setForm({
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Impossible de réinitialiser le mot de passe."
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

        {!validToken ? (
          <div className="password-recovery-confirmation">
            <div className="password-recovery-icon error-icon">
              <FiAlertCircle />
            </div>

            <h1>Lien invalide</h1>

            <p>
              Ce lien de réinitialisation est incorrect
              ou incomplet. Demandez un nouveau lien
              pour continuer.
            </p>

            <Link
              to="/mot-de-passe-oublie"
              className="password-recovery-submit password-recovery-link-button"
            >
              Demander un nouveau lien
              <FiArrowRight />
            </Link>
          </div>
        ) : success ? (
          <div className="password-recovery-confirmation">
            <div className="password-recovery-icon success">
              <FiCheckCircle />
            </div>

            <h1>Mot de passe modifié !</h1>

            <p>
              Votre mot de passe a été réinitialisé
              avec succès. Vous pouvez maintenant
              vous connecter à votre espace Portrélia.
            </p>

            <Link
              to="/connexion"
              className="password-recovery-submit password-recovery-link-button"
            >
              Se connecter
              <FiArrowRight />
            </Link>
          </div>
        ) : (
          <>
            <div className="password-recovery-icon">
              <FiLock />
            </div>

            <div className="password-recovery-header">
              <h1>Nouveau mot de passe</h1>

              <p>
                Choisissez un nouveau mot de passe
                pour sécuriser votre compte Portrélia.
              </p>
            </div>

            <form
              className="password-recovery-form"
              onSubmit={handleSubmit}
            >
              <div className="password-recovery-field">
                <label htmlFor="newPassword">
                  Nouveau mot de passe
                </label>

                <div className="password-recovery-input">
                  <FiLock />

                  <input
                    id="newPassword"
                    name="newPassword"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="••••••••••"
                    value={form.newPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />

                  <button
                    type="button"
                    className="password-recovery-eye"
                    onClick={() =>
                      setShowPassword((value) => !value)
                    }
                    aria-label={
                      showPassword
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                    }
                  >
                    {showPassword ? (
                      <FiEyeOff />
                    ) : (
                      <FiEye />
                    )}
                  </button>
                </div>
              </div>

              <div className="password-recovery-field">
                <label htmlFor="confirmPassword">
                  Confirmer le mot de passe
                </label>

                <div className="password-recovery-input">
                  <FiLock />

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="••••••••••"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </div>
              </div>

              <p className="password-recovery-help">
                Votre mot de passe doit contenir
                au moins 8 caractères.
              </p>

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
                  ? "Enregistrement..."
                  : "Enregistrer mon nouveau mot de passe"}
              </button>
            </form>
          </>
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

export default ResetPasswordPage;
