
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowRight,
  FiMail,
  FiSend,
  FiCheckCircle,
} from "react-icons/fi";

import logo from "../assets/logo.png";
import "./ContactPage.css";

const EMAIL = "contact@portrelia.fr";

const LEGAL_ITEMS = [
  { label: "Confidentialité", to: "/politique-confidentialite" },
  { label: "Mentions légales", to: "/mentions-legales" },
  { label: "Conditions générales", to: "/cgu" },
];

function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSubmitted(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const subject =
      form.subject.trim() || "Demande de contact — Portrélia";

    const body = [
      `Nom : ${form.name}`,
      `E-mail : ${form.email}`,
      `Sujet : ${subject}`,
      "",
      "Message :",
      form.message,
    ].join("\n");

    const mailto = `mailto:${EMAIL}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
    setSubmitted(true);
  };

  return (
    <div className="contact-page">
      {/* EN-TÊTE */}
      <header className="contact-header">
        <Link
          to="/"
          className="contact-brand"
          aria-label="Portrélia, accueil"
        >
          <img src={logo} alt="" />
          <span>Portrélia</span>
        </Link>

        <Link to="/" className="contact-home-link">
          <FiArrowLeft aria-hidden="true" />
          <span>Retour à l’accueil</span>
        </Link>
      </header>

      {/* CONTENU PRINCIPAL */}
      <main className="contact-main">
        {/* COLONNE GAUCHE */}
        <section className="contact-intro">
          <span className="contact-eyebrow">
            PORTRÉLIA · À VOTRE ÉCOUTE
          </span>

          <h1>
            Contactez-
            <br />
            nous.
          </h1>

          <p className="contact-description">
            Une question sur nos portraits professionnels,
            notre solution ou votre projet d’entreprise ?
            Écrivez-nous, notre équipe est là pour vous
            accompagner.
          </p>

          <div className="contact-divider" />

          <a
            href={`mailto:${EMAIL}`}
            className="contact-email-card"
          >
            <span className="contact-email-icon">
              <FiMail aria-hidden="true" />
            </span>

            <span className="contact-email-content">
              <strong>L’équipe Portrélia</strong>
              <span>{EMAIL}</span>
            </span>

            <FiArrowRight
              className="contact-email-arrow"
              aria-hidden="true"
            />
          </a>

          <p className="contact-help">
            Besoin d’en savoir plus ? Consultez nos{" "}
            <Link to="/cgu">ressources et informations</Link>.
          </p>

          <div className="contact-note">
            <span className="contact-note-dot" />
            <p>
              Parlons de votre projet et trouvons ensemble
              la solution adaptée à vos équipes.
            </p>
          </div>
        </section>

        {/* FORMULAIRE */}
        <section className="contact-form-card">
          <div className="contact-form-heading">
            <span className="contact-form-kicker">
              ÉCRIVEZ-NOUS
            </span>

            <h2>Envoyez-nous un message</h2>

            <p>
              Les champs marqués d’un * sont obligatoires.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="contact-fields-grid">
              <div className="contact-field">
                <label htmlFor="contact-name">
                  Nom complet <span>*</span>
                </label>

                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Votre nom"
                  value={form.name}
                  onChange={updateField}
                  maxLength={120}
                  required
                />
              </div>

              <div className="contact-field">
                <label htmlFor="contact-email">
                  Adresse e-mail <span>*</span>
                </label>

                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="vous@exemple.fr"
                  value={form.email}
                  onChange={updateField}
                  maxLength={254}
                  required
                />
              </div>
            </div>

            <div className="contact-field">
              <label htmlFor="contact-subject">
                Sujet <span className="contact-optional">(facultatif)</span>
              </label>

              <input
                id="contact-subject"
                name="subject"
                type="text"
                placeholder="Comment pouvons-nous vous aider ?"
                value={form.subject}
                onChange={updateField}
                maxLength={160}
              />
            </div>

            <div className="contact-field">
              <label htmlFor="contact-message">
                Votre message <span>*</span>
              </label>

              <textarea
                id="contact-message"
                name="message"
                placeholder="Présentez-nous votre demande ou votre projet..."
                value={form.message}
                onChange={updateField}
                maxLength={5000}
                rows={6}
                required
              />

              <div className="contact-char-count" aria-live="polite">
                {form.message.length} / 5 000 caractères
              </div>
            </div>

            <p className="contact-privacy">
              Les informations renseignées sont utilisées
              pour préparer votre réponse. Consultez notre{" "}
              <Link to="/politique-confidentialite">
                politique de confidentialité
              </Link>
              .
            </p>

            <button type="submit" className="contact-submit">
              <FiSend aria-hidden="true" />
              <span>Envoyer le message</span>
              <FiArrowRight
                className="contact-submit-arrow"
                aria-hidden="true"
              />
            </button>

            {submitted && (
              <p className="contact-feedback" role="status">
                <FiCheckCircle aria-hidden="true" />
                Votre application de messagerie a été sollicitée.
                Vérifiez votre brouillon pour envoyer le message.
              </p>
            )}
          </form>
        </section>
      </main>

      {/* PIED DE PAGE */}
      <footer className="contact-footer">
        <span>© {new Date().getFullYear()} Portrélia</span>

        <nav aria-label="Informations légales">
          {LEGAL_ITEMS.map((item) => (
            <Link to={item.to} key={item.to}>
              {item.label}
            </Link>
          ))}
        </nav>
      </footer>
    </div>
  );
}

export default ContactPage;
