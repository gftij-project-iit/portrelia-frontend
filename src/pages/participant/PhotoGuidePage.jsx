import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiX,
  FiSun,
  FiHome,
  FiUser,
  FiBriefcase,
  FiSmile,
} from "react-icons/fi";

import bonneLumiere from "../../assets/participant-guide/bonne-lumiere.png";
import fondNeutre from "../../assets/participant-guide/fond-neutre.png";
import regardCamera from "../../assets/participant-guide/regard-camera.png";
import contreJour from "../../assets/participant-guide/contre-jour.png";
import pasAccessoires from "../../assets/participant-guide/pas-accessoires.png";
import pasFiltre from "../../assets/participant-guide/pas-filtre.png";

import "./PhotoGuidePage.css";

function PhotoGuidePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const handleBack = () => {
    navigate(`/invitation?token=${token}`);
  };

  const handleNext = () => {
    navigate(`/invitation/photos?token=${token}`);
  };

  if (!token) {
    return (
      <div className="photo-guide-page photo-guide-centered">
        <div className="photo-guide-error">
          <h1>Lien invalide</h1>
          <p>Le token d'invitation est manquant.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="photo-guide-page">
      <div className="photo-guide-shell">

        {/* BRAND */}
        <header className="photo-guide-brand">
          <div className="photo-guide-brand-mark">P</div>
          <span>Portrélia</span>
        </header>

        <main className="photo-guide-card">

          {/* PROGRESS */}
          <div className="participant-progress">
            <div className="participant-progress-item active">
              <div className="participant-progress-number">1</div>
              <span>Guide</span>
            </div>

            <div className="participant-progress-line" />

            <div className="participant-progress-item">
              <div className="participant-progress-number">2</div>
              <span>Photos</span>
            </div>

            <div className="participant-progress-line" />

            <div className="participant-progress-item">
              <div className="participant-progress-number">3</div>
              <span>Validation</span>
            </div>
          </div>

          <div className="photo-guide-layout">

            {/* LEFT */}
            <section className="photo-guide-main">
              <div className="photo-guide-heading">
                <span className="photo-guide-kicker">ÉTAPE 1 SUR 3</span>

                <h1>
                  Nos conseils pour un portrait réussi
                </h1>

                <p>
                  Quelques règles simples permettent d'obtenir de meilleurs résultats.
                  Prenez quelques instants pour les consulter avant d'envoyer vos photos.
                </p>
              </div>

              <div className="photo-example-grid">

                {/* BONNE LUMIÈRE */}
                <article className="photo-example-card">
                  <div className="photo-example-image">
                    <img
                      src={bonneLumiere}
                      alt="Exemple de bonne lumière naturelle"
                      className="photo-example-real-image"
                    />
                  </div>

                  <div className="photo-example-label good">
                    <span>
                      <FiCheck />
                    </span>
                    Bonne lumière
                  </div>
                </article>

                {/* FOND NEUTRE */}
                <article className="photo-example-card">
                  <div className="photo-example-image">
                    <img
                      src={fondNeutre}
                      alt="Exemple avec un fond neutre"
                      className="photo-example-real-image"
                    />
                  </div>

                  <div className="photo-example-label good">
                    <span>
                      <FiCheck />
                    </span>
                    Fond neutre
                  </div>
                </article>

                {/* REGARD CAMÉRA */}
                <article className="photo-example-card">
                  <div className="photo-example-image">
                    <img
                      src={regardCamera}
                      alt="Exemple avec un regard vers la caméra"
                      className="photo-example-real-image"
                    />
                  </div>

                  <div className="photo-example-label good">
                    <span>
                      <FiCheck />
                    </span>
                    Regard caméra
                  </div>
                </article>

                {/* CONTRE-JOUR */}
                <article className="photo-example-card">
                  <div className="photo-example-image">
                    <img
                      src={contreJour}
                      alt="Exemple de photo en contre-jour à éviter"
                      className="photo-example-real-image"
                    />
                  </div>

                  <div className="photo-example-label bad">
                    <span>
                      <FiX />
                    </span>
                    Pas de contre-jour
                  </div>
                </article>

                {/* ACCESSOIRES */}
                <article className="photo-example-card">
                  <div className="photo-example-image">
                    <img
                      src={pasAccessoires}
                      alt="Exemple avec accessoires à éviter"
                      className="photo-example-real-image"
                    />
                  </div>

                  <div className="photo-example-label bad">
                    <span>
                      <FiX />
                    </span>
                    Pas d'accessoires
                  </div>
                </article>

                {/* FILTRE */}
                <article className="photo-example-card">
                  <div className="photo-example-image">
                    <img
                      src={pasFiltre}
                      alt="Exemple de filtre photo à éviter"
                      className="photo-example-real-image"
                    />
                  </div>

                  <div className="photo-example-label bad">
                    <span>
                      <FiX />
                    </span>
                    Pas de filtre
                  </div>
                </article>
              </div>
            </section>

            {/* RIGHT */}
            <aside className="photo-guide-tips">
              <span className="photo-guide-tips-title">
                Conseils
              </span>

              <div className="photo-guide-tip">
                <FiSun />

                <div>
                  <strong>
                    Lumière naturelle
                  </strong>

                  <span>
                    Placez-vous face à une fenêtre.
                  </span>
                </div>
              </div>

              <div className="photo-guide-tip">
                <FiHome />

                <div>
                  <strong>
                    Fond neutre et épuré
                  </strong>

                  <span>
                    Évitez les éléments visibles derrière vous.
                  </span>
                </div>
              </div>

              <div className="photo-guide-tip">
                <FiUser />

                <div>
                  <strong>
                    Regardez l'objectif
                  </strong>

                  <span>
                    Tenez-vous droit et gardez le visage visible.
                  </span>
                </div>
              </div>

              <div className="photo-guide-tip">
                <FiBriefcase />

                <div>
                  <strong>
                    Tenue professionnelle
                  </strong>

                  <span>
                    Privilégiez une tenue sobre et naturelle.
                  </span>
                </div>
              </div>

              <div className="photo-guide-tip">
                <FiSmile />

                <div>
                  <strong>
                    Souriez naturellement
                  </strong>

                  <span>
                    Gardez une expression détendue.
                  </span>
                </div>
              </div>
            </aside>
          </div>

          {/* ACTIONS */}
          <div className="photo-guide-actions">
            <button
              type="button"
              className="photo-guide-back"
              onClick={handleBack}
            >
              <FiArrowLeft />
              Retour
            </button>

            <button
              type="button"
              className="photo-guide-next"
              onClick={handleNext}
            >
              Suivant
              <FiArrowRight />
            </button>
          </div>
        </main>

        <footer className="photo-guide-footer">
          <span>
            © 2026 Portrélia
          </span>

          <span>
            Portraits professionnels pour les équipes.
          </span>
        </footer>
      </div>
    </div>
  );
}

export default PhotoGuidePage;