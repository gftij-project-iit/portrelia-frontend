
import { useState } from "react";
import { Link } from "react-router-dom";
import { ClipLoader } from "react-spinners";

import logo from "../assets/logo.png";
import api from "../services/api";

import "./DemoRequestPage.css";

const initialForm = {
  companyName: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  teamSize: "",
  message: "",
  consent: false,
};

function DemoRequestPage() {
  const [form, setForm] = useState(initialForm);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorCode, setErrorCode] = useState("");

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errorMessage) {
      setErrorMessage("");
      setErrorCode("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) return;

    if (!acceptedTerms) {
      setErrorMessage(
        "Veuillez accepter les conditions générales d'utilisation."
      );
      return;
    }

    if (!form.consent) {
      setErrorMessage(
        "Veuillez confirmer que notre équipe peut vous recontacter au sujet de votre demande."
      );
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");
      setErrorCode("");

      // On conserve le payload attendu par le backend existant.
      // acceptedTerms reste une vérification frontend.
      const response = await api.post("/demo-requests", {
        companyName: form.companyName.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        teamSize: form.teamSize,
        message: form.message.trim(),
        consent: form.consent,
      });

      if (response.status === 200 || response.status === 201) {
        setSubmitted(true);
      } else {
        setErrorMessage(
          "La demande n'a pas pu être confirmée. Merci de réessayer."
        );
      }
    } catch (error) {
      console.error(
        "Erreur lors de l'envoi de la demande :",
        error
      );

      const apiMessage = error.response?.data?.message;
      const apiCode = error.response?.data?.code;

      setErrorCode(apiCode || "DEMO_REQUEST_ERROR");
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
      <main className="demo-page">
        <section className="demo-success-card">
          <div className="demo-brand">
            <img
              src={logo}
              alt="Logo Portrélia"
              className="demo-logo"
            />
            <span className="demo-brand-name">Portrélia</span>
          </div>

          <div className="demo-success-icon" aria-hidden="true">
            ✓
          </div>

          <h1>Demande envoyée</h1>

          <p>
            Merci pour votre intérêt pour Portrélia.
            Notre équipe étudiera votre demande et
            vous recontactera prochainement.
          </p>

          <p className="demo-success-info">
            L'envoi de cette demande ne crée pas
            automatiquement un compte entreprise.
            L'ouverture d'un accès est soumise
            à validation.
          </p>

          <Link to="/" className="demo-back-button">
            Retour à l'accueil
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="demo-page">
      <section className="demo-card">
        <Link to="/" className="demo-brand">
          <img
            src={logo}
            alt="Logo Portrélia"
            className="demo-logo"
          />
          <span className="demo-brand-name">Portrélia</span>
        </Link>

        <div className="demo-header">
          <span className="demo-kicker">
            PORTRÉLIA POUR LES ENTREPRISES
          </span>

          <h1>Demander une démo</h1>

          <p>
            Parlez-nous de votre équipe et de votre besoin.
            Nous vous recontacterons pour vous présenter
            Portrélia et préparer votre premier pilote.
          </p>
        </div>

        <div className="demo-process-note">
          <span className="demo-process-number">1</span>
          <span>Envoyez votre demande</span>
          <span className="demo-process-separator">→</span>
          <span className="demo-process-number">2</span>
          <span>Notre équipe vous contacte</span>
        </div>

        {errorMessage && (
          <div
            className={`demo-form-error ${
              errorCode === "DEMO_REQUEST_REJECTED"
                ? "demo-form-error-important"
                : ""
            }`}
            role="alert"
          >
            <strong>
              {errorCode === "DEMO_REQUEST_REJECTED"
                ? "Demande non disponible"
                : "Impossible d'envoyer la demande"}
            </strong>

            <span>{errorMessage}</span>

            {errorCode === "DEMO_REQUEST_ACCEPTED" && (
              <Link to="/connexion" className="demo-error-link">
                Se connecter
              </Link>
            )}
          </div>
        )}

        <form className="demo-form" onSubmit={handleSubmit}>
          <div className="demo-field">
            <label htmlFor="companyName">
              Nom de l'entreprise <span>*</span>
            </label>

            <input
              id="companyName"
              name="companyName"
              type="text"
              placeholder="Ex. ACME"
              value={form.companyName}
              onChange={handleChange}
              autoComplete="organization"
              maxLength={150}
              disabled={submitting}
              required
            />
          </div>

          <div className="demo-grid">
            <div className="demo-field">
              <label htmlFor="firstName">
                Prénom <span>*</span>
              </label>

              <input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="Claire"
                value={form.firstName}
                onChange={handleChange}
                autoComplete="given-name"
                maxLength={100}
                disabled={submitting}
                required
              />
            </div>

            <div className="demo-field">
              <label htmlFor="lastName">
                Nom <span>*</span>
              </label>

              <input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Martin"
                value={form.lastName}
                onChange={handleChange}
                autoComplete="family-name"
                maxLength={100}
                disabled={submitting}
                required
              />
            </div>
          </div>

          <div className="demo-grid">
            <div className="demo-field">
              <label htmlFor="email">
                Email professionnel <span>*</span>
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="claire@entreprise.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                maxLength={254}
                disabled={submitting}
                required
              />
            </div>

            <div className="demo-field">
              <label htmlFor="phone">Téléphone</label>

              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+33 6 00 00 00 00"
                value={form.phone}
                onChange={handleChange}
                autoComplete="tel"
                maxLength={30}
                disabled={submitting}
              />
            </div>
          </div>

          <div className="demo-field">
            <label htmlFor="teamSize">
              Nombre de collaborateurs concernés <span>*</span>
            </label>

            <select
              id="teamSize"
              name="teamSize"
              value={form.teamSize}
              onChange={handleChange}
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

          <div className="demo-field">
            <label htmlFor="message">
              Parlez-nous de votre besoin
            </label>

            <textarea
              id="message"
              name="message"
              rows={5}
              placeholder="Ex. Nous souhaitons harmoniser les portraits de notre équipe commerciale répartie sur plusieurs sites..."
              value={form.message}
              onChange={handleChange}
              maxLength={3000}
              disabled={submitting}
            />

            <span className="demo-field-help">
              Vous pouvez préciser votre contexte,
              votre nombre de sites ou votre délai.
            </span>
          </div>

          <div className="demo-legal-panel">
            <div className="demo-legal-heading">
              <span className="demo-legal-symbol" aria-hidden="true">
                ✓
              </span>

              <div>
                <h2>Confidentialité et conditions</h2>
                <p>
                  Vos informations sont utilisées pour traiter
                  votre demande et vous recontacter à son sujet.
                </p>
              </div>
            </div>

            <label className="demo-consent">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) =>
                  setAcceptedTerms(event.target.checked)
                }
                disabled={submitting}
                required
              />

              <span>
                J'ai lu et j'accepte les{" "}
                <Link to="/cgu" target="_blank" rel="noopener noreferrer">
                  conditions générales d'utilisation
                </Link>
                . <strong>*</strong>
              </span>
            </label>

            <label className="demo-consent">
              <input
                type="checkbox"
                name="consent"
                checked={form.consent}
                onChange={handleChange}
                disabled={submitting}
                required
              />

              <span>
                J'accepte d'être recontacté(e) par
                l'équipe Portrélia uniquement au sujet
                de cette demande de démonstration.{" "}
                <strong>*</strong>
              </span>
            </label>

            <p className="demo-privacy-notice">
              Pour connaître l'utilisation de vos données
              personnelles et vos droits, consultez notre{" "}
              <Link
                to="/politique-confidentialite"
                target="_blank"
                rel="noopener noreferrer"
              >
                politique de confidentialité
              </Link>
              .
            </p>
          </div>

          <button
            type="submit"
            className="demo-submit"
            disabled={
              submitting ||
              !acceptedTerms ||
              !form.consent
            }
          >
            {submitting ? (
              <>
                <ClipLoader size={16} color="#ffffff" />
                Envoi en cours...
              </>
            ) : (
              "Envoyer ma demande"
            )}
          </button>

          <p className="demo-required">
            * Champs obligatoires. Aucun paiement
            ni mot de passe n'est demandé à cette étape.
          </p>
        </form>

        <div className="demo-card-footer">
          <span>Vous avez déjà un accès ?</span>
          <Link to="/connexion">Se connecter</Link>
        </div>

        <nav className="demo-legal-footer" aria-label="Informations légales">
          <Link to="/mentions-legales">Mentions légales</Link>
          <Link to="/politique-confidentialite">
            Confidentialité
          </Link>
          <Link to="/cgu">CGU</Link>
          <Link to="/cgv">CGV</Link>
          <Link to="/politique-cookies">Cookies</Link>
        </nav>
      </section>
    </main>
  );
}

export default DemoRequestPage;
