import { useState } from "react";
import { Link } from "react-router-dom";
import { ClipLoader } from "react-spinners";

import logo from "../assets/logo.png";
import api from "../services/api";

import "./DemoRequestPage.css";

function DemoRequestPage() {
  const [form, setForm] = useState({
    companyName: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    teamSize: "",
    message: "",
    consent: false,
  });

  const [submitted, setSubmitted] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    errorCode,
    setErrorCode,
  ] = useState("");

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    if (errorMessage) {
      setErrorMessage("");
      setErrorCode("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");
      setErrorCode("");

      const response = await api.post(
        "/demo-requests",
        form
      );

      if (
        response.status === 200 ||
        response.status === 201
      ) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error(
        "Erreur lors de l'envoi de la demande :",
        error
      );

      const apiMessage =
        error.response?.data?.message;

      const apiCode =
        error.response?.data?.code;

      setErrorCode(
        apiCode || "DEMO_REQUEST_ERROR"
      );

      setErrorMessage(
        apiMessage ||
          "Une erreur est survenue lors de l'envoi de votre demande. Merci de réessayer."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section className="demo-page">
        <div className="demo-success-card">

          <div className="demo-brand">
            <img
              src={logo}
              alt="Logo Portrélia"
              className="demo-logo"
            />

            <span className="demo-brand-name">
              Portrélia
            </span>
          </div>

          <div className="demo-success-icon">
            ✓
          </div>

          <h1>
            Demande envoyée
          </h1>

          <p>
            Merci pour votre intérêt pour Portrélia.
            Notre équipe étudiera votre demande et
            vous recontactera prochainement.
          </p>

          <Link
            to="/"
            className="demo-back-button"
          >
            Retour à l'accueil
          </Link>

        </div>
      </section>
    );
  }

  return (
    <section className="demo-page">

      <div className="demo-card">

        {/* BRAND */}
        <div className="demo-brand">
          <img
            src={logo}
            alt="Logo Portrélia"
            className="demo-logo"
          />

          <span className="demo-brand-name">
            Portrélia
          </span>
        </div>

        {/* HEADER */}
        <div className="demo-header">

          <span className="demo-kicker">
            PORTRÉLIA POUR LES ENTREPRISES
          </span>

          <h1>
            Demander une démo
          </h1>

          <p>
            Parlez-nous de votre équipe et de votre besoin.
            Nous vous recontacterons pour vous présenter
            Portrélia et préparer votre premier pilote.
          </p>

        </div>

        {/* ERROR */}
        {errorMessage && (
          <div
            className={`demo-form-error ${
              errorCode ===
              "DEMO_REQUEST_REJECTED"
                ? "demo-form-error-important"
                : ""
            }`}
            role="alert"
          >
            <strong>
              {errorCode ===
              "DEMO_REQUEST_REJECTED"
                ? "Demande non disponible"
                : "Impossible d'envoyer la demande"}
            </strong>

            <span>
              {errorMessage}
            </span>

            {errorCode ===
              "DEMO_REQUEST_ACCEPTED" && (
              <Link
                to="/connexion"
                className="demo-error-link"
              >
                Se connecter
              </Link>
            )}
          </div>
        )}

        {/* FORM */}
        <form
          className="demo-form"
          onSubmit={handleSubmit}
        >

          {/* ENTREPRISE */}
          <div className="demo-field">

            <label htmlFor="companyName">
              Nom de l'entreprise
              <span>*</span>
            </label>

            <input
              id="companyName"
              name="companyName"
              type="text"
              placeholder="Ex. ACME"
              value={
                form.companyName
              }
              onChange={
                handleChange
              }
              autoComplete="organization"
              disabled={submitting}
              required
            />

          </div>

          {/* PRÉNOM + NOM */}
          <div className="demo-grid">

            <div className="demo-field">

              <label htmlFor="firstName">
                Prénom
                <span>*</span>
              </label>

              <input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="Claire"
                value={
                  form.firstName
                }
                onChange={
                  handleChange
                }
                autoComplete="given-name"
                disabled={submitting}
                required
              />

            </div>

            <div className="demo-field">

              <label htmlFor="lastName">
                Nom
                <span>*</span>
              </label>

              <input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Martin"
                value={
                  form.lastName
                }
                onChange={
                  handleChange
                }
                autoComplete="family-name"
                disabled={submitting}
                required
              />

            </div>

          </div>

          {/* EMAIL + PHONE */}
          <div className="demo-grid">

            <div className="demo-field">

              <label htmlFor="email">
                Email professionnel
                <span>*</span>
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="claire@entreprise.com"
                value={
                  form.email
                }
                onChange={
                  handleChange
                }
                autoComplete="email"
                disabled={submitting}
                required
              />

            </div>

            <div className="demo-field">

              <label htmlFor="phone">
                Téléphone
              </label>

              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+33 6 00 00 00 00"
                value={
                  form.phone
                }
                onChange={
                  handleChange
                }
                autoComplete="tel"
                disabled={submitting}
              />

            </div>

          </div>

          {/* TEAM SIZE */}
          <div className="demo-field">

            <label htmlFor="teamSize">
              Nombre de collaborateurs concernés
              <span>*</span>
            </label>

            <select
              id="teamSize"
              name="teamSize"
              value={
                form.teamSize
              }
              onChange={
                handleChange
              }
              disabled={submitting}
              required
            >
              <option value="">
                Sélectionnez une taille d'équipe
              </option>

              <option value="1-10">
                1 à 10 collaborateurs
              </option>

              <option value="11-25">
                11 à 25 collaborateurs
              </option>

              <option value="26-50">
                26 à 50 collaborateurs
              </option>

              <option value="51-100">
                51 à 100 collaborateurs
              </option>

              <option value="101-250">
                101 à 250 collaborateurs
              </option>

              <option value="251-500">
                251 à 500 collaborateurs
              </option>

              <option value="500+">
                Plus de 500 collaborateurs
              </option>
            </select>

          </div>

          {/* MESSAGE */}
          <div className="demo-field">

            <label htmlFor="message">
              Parlez-nous de votre besoin
            </label>

            <textarea
              id="message"
              name="message"
              rows="5"
              placeholder="Ex. Nous souhaitons harmoniser les portraits de notre équipe commerciale répartie sur plusieurs sites..."
              value={
                form.message
              }
              onChange={
                handleChange
              }
              disabled={submitting}
            />

            <span className="demo-field-help">
              Vous pouvez préciser votre contexte,
              votre nombre de sites ou votre délai.
            </span>

          </div>

          {/* CONSENT */}
          <label className="demo-consent">

            <input
              type="checkbox"
              name="consent"
              checked={
                form.consent
              }
              onChange={
                handleChange
              }
              disabled={submitting}
              required
            />

            <span>
              J'accepte d'être recontacté(e) par
              Portrélia au sujet de cette demande.
            </span>

          </label>

          {/* SUBMIT */}
          <button
            type="submit"
            className="demo-submit"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <ClipLoader
                  size={16}
                  color="#ffffff"
                />
                Envoi en cours...
              </>
            ) : (
              "Envoyer ma demande"
            )}
          </button>

          <p className="demo-required">
            * Champs obligatoires
          </p>

        </form>

        {/* FOOTER */}
        <div className="demo-card-footer">

          <span>
            Vous avez déjà un accès ?
          </span>

          <Link to="/connexion">
            Se connecter
          </Link>

        </div>

      </div>

    </section>
  );
}

export default DemoRequestPage;