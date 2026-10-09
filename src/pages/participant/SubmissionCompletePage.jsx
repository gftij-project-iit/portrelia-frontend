import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FiCheckCircle,
  FiClock,
  FiShield,
  FiImage,
  FiRefreshCw,
  FiAlertTriangle,
} from "react-icons/fi";

import api from "../../services/api";
import "./SubmissionCompletePage.css";

function SubmissionCompletePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(token));
  const [error, setError] = useState("");

  /*
   * =========================================================
   * CHARGEMENT DE L'ÉTAT DU PARTICIPANT
   * =========================================================
   *
   * On réutilise l'API d'invitation afin
   * d'afficher le participant et la campagne.
   */
  useEffect(() => {
    if (!token) {
      return;
    }

    const controller = new AbortController();

    api
      .get(
        `/participant/invitations/${token}`,
        {
          signal: controller.signal,
        }
      )
      .then((response) => {
        setInvitation(
          response.data?.data || null
        );

        setError("");
      })
      .catch((error) => {
        if (
          error.code === "ERR_CANCELED" ||
          error.name === "CanceledError"
        ) {
          return;
        }

        console.error(
          "Erreur chargement confirmation :",
          error
        );

        setError(
          error.response?.data?.message ||
          "Impossible de charger votre parcours."
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [token]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleReturnToInvitation = () => {
    navigate(
      `/invitation?token=${token}`
    );
  };

  if (!token) {
    return (
      <div className="submission-page submission-centered">
        <div className="submission-error">
          <FiAlertTriangle />
          <h1>Lien invalide</h1>
          <p>Le token d'invitation est manquant.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="submission-page submission-centered">
        <div className="submission-error">
          <FiRefreshCw />
          <h1>Chargement...</h1>
          <p>Nous préparons votre suivi.</p>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="submission-page submission-centered">
        <div className="submission-error">
          <FiAlertTriangle />

          <h1>
            Parcours indisponible
          </h1>

          <p>
            {error ||
              "Impossible de charger votre parcours."}
          </p>

          <button
            type="button"
            className="submission-secondary-button"
            onClick={handleRefresh}
          >
            <FiRefreshCw />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const participant =
    invitation.participant || {};

  const campaign =
    invitation.campaign || {};

  const company =
    invitation.company || {};

  return (
    <div className="submission-page">
      <div className="submission-shell">

        {/* BRAND */}
        <header className="submission-brand">
          <div className="submission-brand-mark">
            P
          </div>

          <span>
            Portrélia
          </span>
        </header>

        <main className="submission-card">

          {/* SUCCESS */}
          <section className="submission-hero">

            <div className="submission-success-icon">
              <FiCheckCircle />
            </div>

            <span className="submission-kicker">
              PHOTOS REÇUES
            </span>

            <h1>
              Merci {participant.firstName || ""}
            </h1>

            <p>
              Vos photos ont bien été envoyées à Portrélia.
              Votre participation à la campagne{" "}
              <strong>
                {campaign.name || "Portrélia"}
              </strong>{" "}
              est maintenant prise en charge.
            </p>

          </section>

          {/* STATUS */}
          <section className="submission-status-card">

            <div className="submission-status-header">
              <div>
                <span>
                  STATUT DE VOTRE PARCOURS
                </span>

                <strong>
                  Photos reçues
                </strong>
              </div>

              <div className="submission-status-badge">
                <FiCheckCircle />
                Envoyé
              </div>
            </div>

            <div className="submission-status-progress">
              <div className="submission-status-step completed">
                <div>
                  <FiCheckCircle />
                </div>

                <span>
                  Photos reçues
                </span>
              </div>

              <div className="submission-status-line" />

              <div className="submission-status-step pending">
                <div>
                  <FiClock />
                </div>

                <span>
                  Génération
                </span>
              </div>

              <div className="submission-status-line" />

              <div className="submission-status-step pending">
                <div>
                  <FiShield />
                </div>

                <span>
                  QA
                </span>
              </div>

              <div className="submission-status-line" />

              <div className="submission-status-step pending">
                <div>
                  <FiImage />
                </div>

                <span>
                  Galerie
                </span>
              </div>
            </div>

          </section>

          {/* NEXT */}
          <div className="submission-layout">

            <section className="submission-next-card">

              <span className="submission-section-label">
                PROCHAINE ÉTAPE
              </span>

              <h2>
                Que se passe-t-il maintenant ?
              </h2>

              <div className="submission-next-item">
                <div className="submission-next-number">
                  1
                </div>

                <div>
                  <strong>
                    Contrôle de vos photos
                  </strong>

                  <span>
                    Portrélia vérifie que vos photos sont exploitables.
                  </span>
                </div>
              </div>

              <div className="submission-next-item">
                <div className="submission-next-number">
                  2
                </div>

                <div>
                  <strong>
                    Génération de vos portraits
                  </strong>

                  <span>
                    Les portraits sont créés selon le style sélectionné par votre entreprise.
                  </span>
                </div>
              </div>

              <div className="submission-next-item">
                <div className="submission-next-number">
                  3
                </div>

                <div>
                  <strong>
                    Contrôle qualité Portrélia
                  </strong>

                  <span>
                    Seuls les portraits conformes sont retenus pour votre galerie.
                  </span>
                </div>
              </div>

              <div className="submission-next-item">
                <div className="submission-next-number">
                  4
                </div>

                <div>
                  <strong>
                    Galerie privée
                  </strong>

                  <span>
                    Lorsque votre galerie sera prête, vous pourrez choisir votre portrait final.
                  </span>
                </div>
              </div>

            </section>

            <aside className="submission-info-card">

              <span className="submission-info-title">
                Votre participation
              </span>

              <div className="submission-info-row">
                <span>
                  Entreprise
                </span>

                <strong>
                  {company.name || "—"}
                </strong>
              </div>

              <div className="submission-info-row">
                <span>
                  Campagne
                </span>

                <strong>
                  {campaign.name || "—"}
                </strong>
              </div>

              <div className="submission-info-row">
                <span>
                  Participant
                </span>

                <strong>
                  {participant.firstName}{" "}
                  {participant.lastName}
                </strong>
              </div>

              <div className="submission-private">
                <FiShield />

                <div>
                  <strong>
                    Accès privé
                  </strong>

                  <span>
                    Votre lien reste personnel. Conservez-le pour revenir à votre parcours.
                  </span>
                </div>
              </div>

            </aside>

          </div>

          {/* MESSAGE */}
          <div className="submission-final-message">
            <FiClock />

            <div>
              <strong>
                Votre galerie n'est pas encore disponible
              </strong>

              <span>
                Elle apparaîtra après la génération et la validation qualité de vos portraits.
              </span>
            </div>
          </div>

          {/* ACTION */}
          <div className="submission-actions">
            <button
              type="button"
              className="submission-secondary-button"
              onClick={
                handleReturnToInvitation
              }
            >
              Revenir à mon parcours
            </button>
          </div>

        </main>

        <footer className="submission-footer">
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

export default SubmissionCompletePage;