import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";

import logo from "../assets/logo.png";

import "./LoginPage.css";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const remembered =
    localStorage.getItem("rememberMe") === "true";

  const rememberedEmail =
    localStorage.getItem("rememberedEmail") || "";

  const [form, setForm] = useState({
    email: remembered ? rememberedEmail : "",
    password: "",
    remember: remembered,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "remember") {
      localStorage.setItem(
        "rememberMe",
        checked ? "true" : "false"
      );

      if (!checked) {
        localStorage.removeItem("rememberedEmail");
      }
    }

    setErrorMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");
    setLoading(true);

    try {
      const data = await login(
        form.email,
        form.password
      );

      if (data.success) {
        if (form.remember) {
          localStorage.setItem(
            "rememberMe",
            "true"
          );

          localStorage.setItem(
            "rememberedEmail",
            form.email
          );
        } else {
          localStorage.setItem(
            "rememberMe",
            "false"
          );

          localStorage.removeItem(
            "rememberedEmail"
          );
        }

        const user = data.user;

        if (user.role === "ADMIN") {
          navigate("/admin");
          return;
        }

        if (user.role === "COMPANY_ADMIN") {
          navigate("/dashboard");
          return;
        }

        navigate("/");
      }
    } catch (error) {
      console.error("Erreur connexion :", error);

      setErrorMessage(
        error.response?.data?.message ||
          "Impossible de se connecter"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="login-page">

      <div className="login-card">

        {/* LOGO */}
        <div className="login-brand">

          <img
            src={logo}
            alt="Logo Portrélia"
            className="login-logo"
          />

          <span className="login-brand-name">
            Portrélia
          </span>

        </div>

        {/* HEADER */}
        <div className="login-header">

          <h1>
            Bienvenue
          </h1>

          <p>
            Connectez-vous à votre espace
          </p>

        </div>

        {/* FORM */}
        <form
          className="login-form"
          onSubmit={handleSubmit}
        >

          {/* EMAIL */}
          <div className="login-field">

            <label htmlFor="email">
              Adresse email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="claire.martin@acme.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />

          </div>

          {/* PASSWORD */}
          <div className="login-field">

            <label htmlFor="password">
              Mot de passe
            </label>

            <div className="password-wrapper">

              <input
                id="password"
                name="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(
                    (previous) => !previous
                  )
                }
                aria-label={
                  showPassword
                    ? "Masquer le mot de passe"
                    : "Afficher le mot de passe"
                }
              >
                {showPassword ? (
                  <FiEyeOff size={20} />
                ) : (
                  <FiEye size={20} />
                )}
              </button>

            </div>

          </div>

          {/* ERROR */}
          {errorMessage && (
            <p
              style={{
                color: "#d64545",
                fontSize: "14px",
                margin: "8px 0 0",
              }}
            >
              {errorMessage}
            </p>
          )}

          {/* OPTIONS */}
          <div className="login-options">

            <label className="remember-me">

              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={handleChange}
              />

              <span>
                Se souvenir de moi
              </span>

            </label>

            <Link
              to="/mot-de-passe-oublie"
              className="forgot-password"
            >
              Mot de passe oublié ?
            </Link>

          </div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            {loading
              ? "Connexion..."
              : "Se connecter"}
          </button>

        </form>

        {/* FOOTER */}
        <div className="login-card-footer">

          <span>
            Pas encore de compte ?
          </span>

          <Link to="/contact">
            Contactez-nous
          </Link>

        </div>

      </div>

    </section>
  );
}

export default LoginPage;