import {
  useState,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  FiEye,
  FiEyeOff,
  FiCheckCircle,
} from "react-icons/fi";

import {
  ClipLoader,
} from "react-spinners";



import "./AccountActivationPage.css";
import api from "../../services/api";

function AccountActivationPage() {
  const navigate = useNavigate();
  const [searchParams] =
    useSearchParams();

  const token =
    searchParams.get("token");

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [success, setSuccess] =
    useState(false);

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");

    if (!token) {
      setErrorMessage(
        "Le lien d'activation est invalide."
      );
      return;
    }

    if (form.password.length < 8) {
      setErrorMessage(
        "Le mot de passe doit contenir au moins 8 caractères."
      );
      return;
    }

    if (
      form.password !==
      form.confirmPassword
    ) {
      setErrorMessage(
        "Les mots de passe ne correspondent pas."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        "/activate-account",
        {
          token,
          password: form.password,
          confirmPassword:
            form.confirmPassword,
        }
      );

      if (response.data.success) {
        setSuccess(true);
      }
    } catch (error) {
      console.error(
        "Erreur activation compte :",
        error
      );

      setErrorMessage(
        error.response?.data?.message ||
          "Impossible d'activer votre compte."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="account-activation-page">

        <div className="account-activation-card">

          <div className="account-activation-success-icon">
            <FiCheckCircle />
          </div>

          <h1>
            Votre compte est activé
          </h1>

          <p>
            Votre mot de passe a été créé avec succès.
            Vous pouvez maintenant vous connecter à votre
            espace Portrélia.
          </p>

          <button
            type="button"
            className="account-activation-login-btn"
            onClick={() =>
              navigate("/connexion")
            }
          >
            Se connecter
          </button>

        </div>

      </div>
    );
  }

  return (
    <div className="account-activation-page">

      <div className="account-activation-card">

        <div className="account-activation-header">
          <span>
            PORTRÉLIA
          </span>

          <h1>
            Créez votre mot de passe
          </h1>

          <p>
            Finalisez l'activation de votre espace entreprise.
          </p>
        </div>

        {!token && (
          <div className="account-activation-error">
            Ce lien d'activation est invalide.
          </div>
        )}

        {errorMessage && (
          <div className="account-activation-error">
            {errorMessage}
          </div>
        )}

        <form
          className="account-activation-form"
          onSubmit={handleSubmit}
        >

          <div className="account-activation-field">
            <label htmlFor="password">
              Mot de passe
            </label>

            <div className="account-activation-password">
              <input
                id="password"
                name="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={form.password}
                onChange={handleChange}
                placeholder="Minimum 8 caractères"
                disabled={
                  loading ||
                  !token
                }
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (previous) =>
                      !previous
                  )
                }
                aria-label={
                  showPassword
                    ? "Masquer le mot de passe"
                    : "Afficher le mot de passe"
                }
              >
                {showPassword
                  ? <FiEyeOff />
                  : <FiEye />}
              </button>
            </div>
          </div>

          <div className="account-activation-field">
            <label htmlFor="confirmPassword">
              Confirmer le mot de passe
            </label>

            <div className="account-activation-password">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                value={
                  form.confirmPassword
                }
                onChange={handleChange}
                placeholder="Confirmez votre mot de passe"
                disabled={
                  loading ||
                  !token
                }
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    (previous) =>
                      !previous
                  )
                }
                aria-label={
                  showConfirmPassword
                    ? "Masquer le mot de passe"
                    : "Afficher le mot de passe"
                }
              >
                {showConfirmPassword
                  ? <FiEyeOff />
                  : <FiEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="account-activation-submit"
            disabled={
              loading ||
              !token
            }
          >
            {loading ? (
              <>
                <ClipLoader
                  size={16}
                  color="#ffffff"
                />
                Activation...
              </>
            ) : (
              "Créer mon mot de passe"
            )}
          </button>

        </form>

      </div>

    </div>
  );
}

export default AccountActivationPage;