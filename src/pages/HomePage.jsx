
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiMenu, FiX, FiArrowRight } from "react-icons/fi";

import logo from "../assets/logo.png";
import portraitImage from "../assets/home-portrait.png";

import ofti from "../assets/brands/ofti.png";
import assermentis from "../assets/brands/assermentis.png";
import gftij from "../assets/brands/gftij.png";
import intertrad from "../assets/brands/intertrad.png";
import calamelle from "../assets/brands/calamelle.webp";

import "./HomePage.css";

const NAV_ITEMS = [
  { label: "Solutions", href: "#solutions" },
  { label: "Tarifs", href: "#tarifs" },
  { label: "Ressources", href: "#ressources" },
  { label: "À propos", href: "#apropos" },
  { label: "Contact", href: "/contact" },
];

const LEGAL_ITEMS = [
  {
    label: "Politique de confidentialité",
    to: "/politique-confidentialite",
  },
  {
    label: "Mentions légales",
    to: "/mentions-legales",
  },
  {
    label: "Conditions générales d'utilisation",
    to: "/cgu",
  },
  {
    label: "Conditions générales de vente",
    to: "/cgv",
  },
  {
    label: "Politique de cookies",
    to: "/politique-cookies",
  },
];

const PARTNER_LOGOS = [
  {
    name: "OFTI",
    image: ofti,
    url: "https://ofti.fr/",
    className: "trust-logo-ofti",
  },
  {
    name: "Assermentis",
    image: assermentis,
    url: "https://www.assermentis.com/",
    className: "trust-logo-assermentis",
  },
  {
    name: "GFTIJ",
    image: gftij,
    url: "https://www.gftij.fr/",
    className: "trust-logo-gftij",
  },
  {
    name: "InterTrad",
    image: intertrad,
    url: "https://intertrad.fr/",
    className: "trust-logo-intertrad",
  },
  {
    name: "Calamelle",
    image: calamelle,
    url: "https://calamelle.fr/",
    className: "trust-logo-calamelle",
  },
];

function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <div className="home-page">

      {/* NAVBAR */}
      <header className="home-navbar">
        <Link
          to="/"
          className="home-brand"
          onClick={closeMenu}
        >
          <img
            src={logo}
            alt="Portrélia"
            className="home-brand-logo"
          />

          <span className="home-brand-name">
            Portrélia
          </span>
        </Link>

        <nav
          className="home-nav-links"
          aria-label="Navigation principale"
        >
          {NAV_ITEMS.map((item) => (
            <a href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="home-nav-actions">
          <Link
            to="/connexion"
            className="home-login-btn"
          >
            Se connecter
          </Link>

          <Link
            to="/demande-demo"
            className="home-demo-btn"
          >
            Demander une démo
          </Link>
        </div>

        <button
          type="button"
          className="home-mobile-toggle"
          aria-label={
            menuOpen ? "Fermer le menu" : "Ouvrir le menu"
          }
          aria-expanded={menuOpen}
          aria-controls="home-mobile-menu"
          onClick={() => {
            setMenuOpen((previous) => !previous);
          }}
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>
      </header>

      {/* MENU MOBILE */}
      {menuOpen && (
        <>
          <button
            type="button"
            className="home-mobile-backdrop"
            aria-label="Fermer le menu"
            onClick={closeMenu}
          />

          <nav
            id="home-mobile-menu"
            className="home-mobile-menu"
            aria-label="Navigation mobile"
          >
            <p className="home-mobile-menu-label">
              Découvrir Portrélia
            </p>

            {NAV_ITEMS.map((item) => (
              <a
                href={item.href}
                key={item.href}
                onClick={closeMenu}
              >
                <span>{item.label}</span>
                <FiArrowRight />
              </a>
            ))}

            <div className="home-mobile-menu-divider" />

            <Link
              to="/connexion"
              className="home-mobile-login"
              onClick={closeMenu}
            >
              Se connecter
            </Link>

            <Link
              to="/demande-demo"
              className="home-mobile-demo"
              onClick={closeMenu}
            >
              Demander une démo
            </Link>

            <div className="home-mobile-menu-divider" />

            <p className="home-mobile-menu-label">
              Informations légales
            </p>

            {LEGAL_ITEMS.map((item) => (
              <Link
                to={item.to}
                key={item.to}
                className="home-mobile-legal-link"
                onClick={closeMenu}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </>
      )}

      <main>

        {/* HERO */}
        <section
          id="accueil"
          className="home-main-section"
        >
          <div className="home-hero-card">
            <div className="home-hero-content">

              {/* HERO GAUCHE */}
              <div className="home-hero-left">
                <div className="home-hero-copy">
                  <h1>
                    Des portraits professionnels
                    <br />
                    qui renforcent votre marque
                    <br />
                    employeur
                  </h1>

                  <p className="home-hero-description">
                    Une solution simple et sécurisée pour des
                    portraits homogènes, réalistes et de haute
                    qualité, où que soient vos équipes.
                  </p>

                  <ul className="home-benefits">
                    <li>
                      <span className="benefit-check">✓</span>
                      <span>
                        Expérience guidée pour vos collaborateurs
                      </span>
                    </li>

                    <li>
                      <span className="benefit-check">✓</span>
                      <span>
                        Direction artistique et retouche humaine
                      </span>
                    </li>

                    <li>
                      <span className="benefit-check">✓</span>
                      <span>
                        Résultats cohérents et fidèles
                      </span>
                    </li>

                    <li>
                      <span className="benefit-check">✓</span>
                      <span>
                        Livraison rapide en 48 à 72 h
                      </span>
                    </li>
                  </ul>

                  <div className="home-hero-actions">
                    <Link
                      to="/demande-demo"
                      className="home-primary-cta"
                    >
                      Demander une démo
                    </Link>

                    <button
                      type="button"
                      className="home-video-btn"
                      onClick={() => {
                        document
                          .getElementById("solutions")
                          ?.scrollIntoView({
                            behavior: "smooth",
                          });
                      }}
                    >
                      <span className="video-play">▶</span>
                      <span>Découvrir la solution</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* HERO DROITE */}
              <div className="home-hero-right">
                <img
                  src={portraitImage}
                  alt="Portrait professionnel Portrélia"
                  className="home-portrait-image"
                />

                <div className="home-image-quote">
                  <p>
                    « Des équipes qui
                    <br />
                    inspirent confiance. »
                  </p>
                </div>
              </div>

              {/* LOGOS PARTENAIRES CLIQUABLES */}
              <div className="home-trust-bar">
                <p className="home-trust-title">
                  Ils nous font confiance
                </p>

                <div className="home-trust-logos">
                  {PARTNER_LOGOS.map((partner) => (
                    <a
                      key={partner.name}
                      href={partner.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`trust-logo-item ${
                        partner.name === "GFTIJ"
                          ? "trust-logo-item-gftij"
                          : ""
                      }`}
                      aria-label={`Visiter le site de ${partner.name}`}
                      title={`Visiter ${partner.name}`}
                    >
                      <img
                        src={partner.image}
                        alt={partner.name}
                        className={`trust-logo ${partner.className}`}
                      />
                    </a>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* SOLUTIONS */}
        <section
          id="solutions"
          className="home-info-section"
        >
          <div className="home-info-container">
            <p className="home-eyebrow">
              NOTRE SOLUTION
            </p>

            <h2>
              Un parcours simple pour vos équipes
            </h2>

            <p className="home-info-intro">
              Centralisez vos campagnes de portraits
              professionnels, accompagnez vos collaborateurs
              et retrouvez les résultats dans votre espace
              entreprise.
            </p>

            <div className="home-info-grid">
              <article className="home-info-card">
                <span className="home-step">01</span>
                <h3>Créer une campagne</h3>
                <p>
                  Organisez vos besoins en portraits depuis
                  un espace dédié à votre entreprise.
                </p>
              </article>

              <article className="home-info-card">
                <span className="home-step">02</span>
                <h3>Inviter les collaborateurs</h3>
                <p>
                  Chaque participant suit un parcours
                  guidé pour transmettre sa photographie.
                </p>
              </article>

              <article className="home-info-card">
                <span className="home-step">03</span>
                <h3>Retrouver les portraits</h3>
                <p>
                  Consultez les galeries produites et
                  suivez l'avancement de votre campagne.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* TARIFS */}
        <section
          id="tarifs"
          className="home-info-section home-info-soft"
        >
          <div className="home-info-container home-centered-section">
            <p className="home-eyebrow">
              OFFRES ENTREPRISES
            </p>

            <h2>
              Une solution adaptée à vos besoins
            </h2>

            <p className="home-info-intro">
              Échangeons sur votre projet, le nombre de
              collaborateurs et les modalités de réalisation
              de vos portraits.
            </p>

            <Link
              to="/demande-demo"
              className="home-section-button"
            >
              Découvrir nos offres
              <FiArrowRight />
            </Link>
          </div>
        </section>

        {/* RESSOURCES */}
        <section
          id="ressources"
          className="home-info-section"
        >
          <div className="home-info-container">
            <p className="home-eyebrow">
              RESSOURCES
            </p>

            <h2>
              Des informations claires, à chaque étape
            </h2>

            <div className="home-info-grid">
              <article className="home-info-card">
                <h3>Protection des données</h3>
                <p>
                  Comprenez comment les informations
                  et les photographies sont traitées.
                </p>

                <Link to="/politique-confidentialite">
                  Consulter la politique
                  <FiArrowRight />
                </Link>
              </article>

              <article className="home-info-card">
                <h3>Utilisation de la plateforme</h3>
                <p>
                  Retrouvez les principales conditions
                  d'utilisation de Portrélia.
                </p>

                <Link to="/cgu">
                  Consulter les CGU
                  <FiArrowRight />
                </Link>
              </article>

              <article className="home-info-card">
                <h3>Cookies et confidentialité</h3>
                <p>
                  Découvrez les outils de mesure d'audience
                  et les choix disponibles.
                </p>

                <Link to="/politique-cookies">
                  En savoir plus
                  <FiArrowRight />
                </Link>
              </article>
            </div>
          </div>
        </section>

        {/* À PROPOS */}
        <section
          id="apropos"
          className="home-info-section home-info-soft"
        >
          <div className="home-info-container home-about-layout">
            <div>
              <p className="home-eyebrow">
                À PROPOS DE PORTRÉLIA
              </p>

              <h2>
                Des portraits cohérents pour votre
                image de marque
              </h2>
            </div>

            <div className="home-about-copy">
              <p>
                Portrélia accompagne les entreprises dans
                la création et l'organisation de leurs
                portraits professionnels, avec une expérience
                à distance pensée pour les équipes.
              </p>

              <p>
                Notre objectif est de simplifier la production
                de portraits homogènes, tout en accordant
                une place essentielle à la qualité du résultat
                et au respect des données personnelles.
              </p>

              <Link
                to="/demande-demo"
                className="home-section-button"
              >
                Parlons de votre projet
                <FiArrowRight />
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="home-footer">
        <div className="home-footer-inner">

          <div className="home-footer-top">

            <div className="home-footer-brand">
              <img src={logo} alt="Portrélia" />

              <div>
                <strong>Portrélia</strong>
                <p>
                  Des portraits professionnels pour vos équipes.
                </p>
              </div>
              
            </div>

            <div className="home-footer-column">
              <h3>Navigation</h3>

              {NAV_ITEMS.map((item) => (
                <a href={item.href} key={item.href}>
                  {item.label}
                </a>
              ))}
            </div>

            <div className="home-footer-column">
              <h3>Informations légales</h3>

              {LEGAL_ITEMS.map((item) => (
                <Link to={item.to} key={item.to}>
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="home-footer-column">
              <h3>Portrélia</h3>

              <Link to="/connexion">
                Se connecter
              </Link>

              <Link to="/demande-demo">
                Demander une démo
              </Link>
              <Link to="/contact">Nous contacter</Link>
            </div>

          </div>

          <div className="home-footer-bottom">
            <span>
              © {new Date().getFullYear()} Portrélia
            </span>

            <span>
              Vos données et votre confidentialité comptent.
            </span>
          </div>

        </div>
      </footer>

    </div>
  );
}

export default HomePage;
