import { Link } from "react-router-dom";

import logo from "../assets/logo.png";
import portraitImage from "../assets/home-portrait.png";

import lorealLogo from "../assets/brands/loreal.png";
import accentureLogo from "../assets/brands/accenture.png";
import bnpLogo from "../assets/brands/bnp-paribas.png";
import doctolibLogo from "../assets/brands/doctolib.png";
import veoliaLogo from "../assets/brands/veolia.png";

import "./HomePage.css";


function HomePage() {
  return (
    <div className="home-page">

      <main>

        <section
          id="accueil"
          className="home-main-section"
        >

          <div className="home-hero-card">


            {/* ================================================= */}
            {/* NAVBAR */}
            {/* ================================================= */}

            <header className="home-navbar">

              {/* BRAND */}
              <div className="home-brand">

                <img
                  src={logo}
                  alt="Portrélia"
                  className="home-brand-logo"
                />

                <span className="home-brand-name">
                  Portrélia
                </span>

              </div>


              {/* NAV */}
              <nav className="home-nav-links">

                <a href="#solutions">
                  Solutions
                </a>

                <a href="#tarifs">
                  Tarifs
                </a>

                <a href="#ressources">
                  Ressources
                </a>

                <a href="#apropos">
                  À propos
                </a>

              </nav>


              {/* ACTIONS */}
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

            </header>


            {/* ================================================= */}
            {/* HERO */}
            {/* ================================================= */}

            <div className="home-hero-content">


              {/* LEFT */}
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


                  {/* BENEFITS */}
                  <ul className="home-benefits">

                    <li>
                      <span className="benefit-check">
                        ✓
                      </span>

                      <span>
                        Expérience guidée pour vos collaborateurs
                      </span>
                    </li>


                    <li>
                      <span className="benefit-check">
                        ✓
                      </span>

                      <span>
                        Direction artistique et retouche humaine
                      </span>
                    </li>


                    <li>
                      <span className="benefit-check">
                        ✓
                      </span>

                      <span>
                        Résultats cohérents et fidèles
                      </span>
                    </li>


                    <li>
                      <span className="benefit-check">
                        ✓
                      </span>

                      <span>
                        Livraison rapide en 48 à 72 h
                      </span>
                    </li>

                  </ul>


                  {/* CTA */}
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
                    >

                      <span className="video-play">
                        ▶
                      </span>

                      <span>
                        Voir la vidéo
                      </span>

                    </button>

                  </div>

                </div>

              </div>


              {/* RIGHT */}
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


              {/* ================================================= */}
              {/* TRUST BAR */}
              {/* ================================================= */}

              <div className="home-trust-bar">

                <p className="home-trust-title">
                  Ils nous font confiance
                </p>


                <div className="home-trust-logos">

                  <div className="trust-logo-item">
                    <img
                      src={lorealLogo}
                      alt="L'Oréal"
                      className="trust-logo trust-logo-loreal"
                    />
                  </div>


                  <div className="trust-logo-item">
                    <img
                      src={accentureLogo}
                      alt="Accenture"
                      className="trust-logo trust-logo-accenture"
                    />
                  </div>


                  <div className="trust-logo-item">
                    <img
                      src={bnpLogo}
                      alt="BNP Paribas"
                      className="trust-logo trust-logo-bnp"
                    />
                  </div>


                  <div className="trust-logo-item">
                    <img
                      src={doctolibLogo}
                      alt="Doctolib"
                      className="trust-logo trust-logo-doctolib"
                    />
                  </div>


                  <div className="trust-logo-item">
                    <img
                      src={veoliaLogo}
                      alt="Veolia"
                      className="trust-logo trust-logo-veolia"
                    />
                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}


export default HomePage;