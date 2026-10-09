import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FiPlus,
  FiAlertCircle,
  FiCheck,
} from "react-icons/fi";

import "./CompanyDashboardHomePage.css";

function CompanyDashboardHomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const firstName =
    user?.firstName || "Claire";

  return (
    <div className="company-home-page">

      {/* HEADER */}
      <div className="company-home-header">
        <div>
          <span className="company-home-kicker">
            PORTAIL ENTREPRISE
          </span>

          <h1>
            Bonjour, {firstName}
          </h1>

          <p>
            Voici l’avancement de votre campagne
            « Équipe France — Q4 ».
          </p>
        </div>

        <button
          type="button"
          className="company-home-create-btn"
          onClick={() =>
            navigate(
              "/dashboard/campagnes/nouvelle"
            )
          }
        >
          <FiPlus />
          Créer une campagne
        </button>
      </div>

      {/* KPI */}
      <div className="company-home-kpis">

        <div className="company-home-kpi-card">
          <span>
            Participants
          </span>

          <strong>
            24
          </strong>

          <div className="company-home-kpi-badge company-home-kpi-purple">
            100 % invités
          </div>
        </div>

        <div className="company-home-kpi-card">
          <span>
            Photos reçues
          </span>

          <strong>
            19
          </strong>

          <div className="company-home-kpi-badge company-home-kpi-orange">
            5 en attente
          </div>
        </div>

        <div className="company-home-kpi-card">
          <span>
            Galeries prêtes
          </span>

          <strong>
            12
          </strong>

          <div className="company-home-kpi-badge company-home-kpi-green">
            50 %
          </div>
        </div>

        <div className="company-home-kpi-card">
          <span>
            Validés
          </span>

          <strong>
            9
          </strong>

          <div className="company-home-kpi-badge company-home-kpi-purple">
            38 %
          </div>
        </div>

      </div>

      {/* LOWER GRID */}
      <div className="company-home-bottom-grid">

        {/* PROGRESSION */}
        <section className="company-home-progress-card">

          <div className="company-home-section-header">
            <h2>
              Progression campagne
            </h2>

            <span>
              Délai cible 72 h
            </span>
          </div>

          <div className="company-home-progress-track">
            <div
              className="company-home-progress-fill"
              style={{
                width: "62%",
              }}
            />
          </div>

          <div className="company-home-progress-meta">
            <strong>
              62 % terminé
            </strong>

            <span>
              Livraison estimée : jeudi
            </span>
          </div>

          <div className="company-home-progress-actions">

            <button
              type="button"
              className="company-home-primary-action"
              onClick={() =>
                navigate(
                  "/dashboard/collaborateurs"
                )
              }
            >
              Voir les participants
            </button>

            <button
              type="button"
              className="company-home-secondary-action"
            >
              Envoyer une relance
            </button>

          </div>

        </section>

        {/* ATTENTION */}
        <section className="company-home-attention-card">

          <h2>
            Points d’attention
          </h2>

          <div className="company-home-attention-list">

            <div className="company-home-attention-item">

              <div className="company-home-attention-icon">
                <FiAlertCircle />
              </div>

              <div>
                <strong>
                  3 photos à refaire
                </strong>

                <span>
                  Flou ou cadrage trop serré.
                </span>
              </div>

            </div>

            <div className="company-home-attention-item">

              <div className="company-home-attention-icon">
                2
              </div>

              <div>
                <strong>
                  2 collaborateurs sans réponse
                </strong>

                <span>
                  Dernière relance il y a 24 h.
                </span>
              </div>

            </div>

            <div className="company-home-attention-item">

              <div className="company-home-attention-icon">
                <FiCheck />
              </div>

              <div>
                <strong>
                  Style validé
                </strong>

                <span>
                  Studio clair — pilote 8/8 accepté.
                </span>
              </div>

            </div>

          </div>

        </section>

      </div>

    </div>
  );
}

export default CompanyDashboardHomePage;