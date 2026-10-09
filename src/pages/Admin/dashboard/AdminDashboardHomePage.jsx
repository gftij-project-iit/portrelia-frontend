import {
  FiUsers,
  FiBriefcase,
  FiCamera,
  FiCheckCircle,
  FiArrowRight,
} from "react-icons/fi";

import "./adminDashboard.css";

function AdminDashboardHomePage() {
  return (
    <div className="admin-home">

      {/* HEADER */}
      <div className="admin-home-header">
        <div>
          <h1>Bonjour Admin,</h1>
          <p>
            Voici l’activité globale de Portrélia.
          </p>
        </div>
      </div>

      {/* STATS */}
      <div className="admin-stats-grid">

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <FiUsers />
          </div>

          <strong>12</strong>

          <span>
            Demandes de démo
          </span>

          <small>
            4 en attente
          </small>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <FiBriefcase />
          </div>

          <strong>18</strong>

          <span>
            Entreprises actives
          </span>

          <small>
            +3 ce mois
          </small>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <FiCamera />
          </div>

          <strong>9</strong>

          <span>
            Campagnes en cours
          </span>

          <small>
            426 participants
          </small>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <FiCheckCircle />
          </div>

          <strong>34</strong>

          <span>
            Portraits à valider
          </span>

          <small>
            File QA
          </small>
        </div>

      </div>

      {/* CONTENT */}
      <div className="admin-home-grid">

        {/* DEMO REQUESTS */}
        <section className="admin-dashboard-card">

          <div className="admin-card-header">
            <div>
              <h2>
                Demandes de démo récentes
              </h2>

              <p>
                Les dernières demandes reçues
              </p>
            </div>

            <button type="button">
              Voir toutes
              <FiArrowRight />
            </button>
          </div>

          <div className="admin-request-list">

            <div className="admin-request-row">
              <div>
                <strong>
                  ACME France
                </strong>

                <span>
                  Claire Martin
                </span>
              </div>

              <span className="admin-status admin-status-pending">
                En attente
              </span>
            </div>

            <div className="admin-request-row">
              <div>
                <strong>
                  Nova Consulting
                </strong>

                <span>
                  Thomas Bernard
                </span>
              </div>

              <span className="admin-status admin-status-contacted">
                Contactée
              </span>
            </div>

            <div className="admin-request-row">
              <div>
                <strong>
                  Studio RH
                </strong>

                <span>
                  Sarah Petit
                </span>
              </div>

              <span className="admin-status admin-status-pending">
                En attente
              </span>
            </div>

          </div>

        </section>


        {/* QA */}
        <section className="admin-dashboard-card">

          <div className="admin-card-header">
            <div>
              <h2>
                File QA
              </h2>

              <p>
                Portraits nécessitant une validation
              </p>
            </div>

            <button type="button">
              Voir la QA
              <FiArrowRight />
            </button>
          </div>

          <div className="admin-qa-summary">

            <div className="admin-qa-number">
              34
            </div>

            <p>
              portraits actuellement en attente
              de contrôle qualité.
            </p>

            <div className="admin-progress">
              <div
                className="admin-progress-bar"
                style={{ width: "68%" }}
              />
            </div>

            <span>
              68 % traités aujourd’hui
            </span>

          </div>

        </section>

      </div>


      {/* CAMPAIGNS */}
      <section className="admin-dashboard-card admin-campaign-section">

        <div className="admin-card-header">
          <div>
            <h2>
              Campagnes actives
            </h2>

            <p>
              Suivi des principales campagnes en cours
            </p>
          </div>

          <button type="button">
            Voir les campagnes
            <FiArrowRight />
          </button>
        </div>

        <div className="admin-campaign-list">

          <div className="admin-campaign-row">

            <div className="admin-campaign-info">
              <strong>
                Site web 2026
              </strong>

              <span>
                ACME France
              </span>
            </div>

            <div className="admin-campaign-progress">

              <span>
                62 / 120 validés
              </span>

              <div className="admin-progress">
                <div
                  className="admin-progress-bar"
                  style={{ width: "52%" }}
                />
              </div>

            </div>

            <strong>
              52%
            </strong>

          </div>


          <div className="admin-campaign-row">

            <div className="admin-campaign-info">
              <strong>
                Équipe Direction
              </strong>

              <span>
                Nova Consulting
              </span>
            </div>

            <div className="admin-campaign-progress">

              <span>
                36 / 45 validés
              </span>

              <div className="admin-progress">
                <div
                  className="admin-progress-bar"
                  style={{ width: "80%" }}
                />
              </div>

            </div>

            <strong>
              80%
            </strong>

          </div>

        </div>

      </section>

    </div>
  );
}

export default AdminDashboardHomePage;