import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  FiArrowRight,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiImage,
  FiShield,
  FiUser,
  FiAlertTriangle,
  FiRefreshCw,
} from "react-icons/fi";

import {
  ClipLoader,
} from "react-spinners";

import "./InvitationPage.css";
import api from "../../services/api";

/*
 * =========================================================
 * ROUTAGE DU PARCOURS COLLABORATEUR
 * =========================================================
 *
 * Le lien /invitation?token=...
 * devient le point d'entrée unique.
 *
 * Selon le statut réel du participant,
 * on l'envoie automatiquement vers
 * la bonne étape de son parcours.
 */
const getParticipantDestination = (
  status,
  token
) => {
  if (!status || !token) {
    return null;
  }

  switch (status) {
    /*
     * Le collaborateur a commencé
     * son upload mais ne l'a pas
     * encore confirmé.
     */
    case "PHOTOS_PENDING":
      return `/invitation/photos?token=${token}`;

    /*
     * Les photos ont été confirmées.
     * Elles sont maintenant prises
     * en charge par Portrélia.
     */
    case "PHOTOS_RECEIVED":
    case "GENERATION_PENDING":
    case "GENERATION_IN_PROGRESS":
    case "QA_PENDING":
      return `/invitation/envoi-termine?token=${token}`;

    /*
     * Le QA a publié les portraits
     * conformes dans la galerie privée.
     */
    case "GALLERY_READY":
    case "REVISION_REQUESTED":
      return `/invitation/galerie?token=${token}`;

    /*
     * Le collaborateur a sélectionné
     * son portrait final.
     */
    case "VALIDATED":
    case "DELIVERED":
      return `/invitation/portrait-final?token=${token}`;

    /*
     * INVITED et CONSENT_PENDING
     * restent sur la page d'invitation.
     */
    case "INVITED":
    case "CONSENT_PENDING":
    default:
      return null;
  }
};

function InvitationPage() {
  const navigate =
    useNavigate();

  const [
    searchParams,
  ] = useSearchParams();

  const token =
    searchParams.get(
      "token"
    );

  const [
    invitation,
    setInvitation,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(
    () => Boolean(token)
  );

  const [
    error,
    setError,
  ] = useState("");

  const [
    consentAccepted,
    setConsentAccepted,
  ] = useState(false);

  /*
   * =========================================================
   * TRAITEMENT DE LA RÉPONSE API
   * =========================================================
   *
   * Cette fonction centralise :
   * - la lecture du participant
   * - son statut
   * - la redirection éventuelle
   *
   * Elle est utilisée au premier
   * chargement et lors d'un retry.
   */
  const handleInvitationData = (
    data
  ) => {
    if (!data) {
      setInvitation(null);

      setError(
        "Cette invitation n'est pas disponible."
      );

      return;
    }

    const participantStatus =
      data.participant?.status;

    const destination =
      getParticipantDestination(
        participantStatus,
        token
      );

    /*
     * Si le participant se trouve
     * déjà plus loin dans le parcours,
     * on ne lui remontre jamais
     * l'écran de départ.
     */
    if (destination) {
      navigate(
        destination,
        {
          replace: true,
        }
      );

      return;
    }

    setInvitation(data);
    setError("");
  };

  /*
   * =========================================================
   * CHARGEMENT INITIAL DE L'INVITATION
   * =========================================================
   */
  useEffect(() => {
    if (!token) {
      return;
    }

    const controller =
      new AbortController();

    api
      .get(
        `/participant/invitations/${token}`,
        {
          signal:
            controller.signal,
        }
      )
      .then((response) => {
        const data =
          response.data?.data ||
          null;

        const participantStatus =
          data?.participant?.status;

        const destination =
          getParticipantDestination(
            participantStatus,
            token
          );

        /*
         * Redirection automatique
         * vers l'étape réelle.
         */
        if (destination) {
          navigate(
            destination,
            {
              replace: true,
            }
          );

          return;
        }

        setInvitation(data);
        setError("");
      })
      .catch((error) => {
        if (
          error.code ===
            "ERR_CANCELED" ||
          error.name ===
            "CanceledError"
        ) {
          return;
        }

        console.error(
          "Erreur chargement invitation :",
          error
        );

        setError(
          error.response?.data
            ?.message ||
            "Impossible de charger cette invitation."
        );
      })
      .finally(() => {
        if (
          !controller.signal
            .aborted
        ) {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [
    token,
    navigate,
  ]);

  /*
   * =========================================================
   * RECHARGEMENT MANUEL
   * =========================================================
   */
  const reloadInvitation =
    async () => {
      if (!token) {
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await api.get(
            `/participant/invitations/${token}`
          );

        handleInvitationData(
          response.data?.data ||
            null
        );
      } catch (error) {
        console.error(
          "Erreur rechargement invitation :",
          error
        );

        setError(
          error.response?.data
            ?.message ||
            "Impossible de charger cette invitation."
        );
      } finally {
        setLoading(false);
      }
    };

  /*
   * =========================================================
   * FORMATAGE DE DATE
   * =========================================================
   */
  const formatDate = (
    date
  ) => {
    if (!date) {
      return "Non définie";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "Non définie";
    }

    return new Intl
      .DateTimeFormat(
        "fr-FR",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      )
      .format(
        parsedDate
      );
  };

  /*
   * =========================================================
   * DÉBUT DU PARCOURS
   * =========================================================
   */
  const handleStart = () => {
    if (
      !consentAccepted ||
      !token
    ) {
      return;
    }

    navigate(
      `/invitation/guide-photo?token=${token}`
    );
  };

  /*
   * =========================================================
   * TOKEN ABSENT
   * =========================================================
   */
  if (!token) {
    return (
      <div className="invitation-page invitation-page-centered">

        <div className="invitation-error-card">

          <div className="invitation-error-icon">
            <FiAlertTriangle />
          </div>

          <h1>
            Invitation invalide
          </h1>

          <p>
            Ce lien d'invitation ne contient aucun token valide.
          </p>

        </div>

      </div>
    );
  }

  /*
   * =========================================================
   * CHARGEMENT
   * =========================================================
   */
  if (loading) {
    return (
      <div className="invitation-page invitation-page-centered">

        <div className="invitation-loading-card">

          <ClipLoader
            size={32}
            color="#4f2e94"
          />

          <strong>
            Chargement de votre invitation...
          </strong>

          <span>
            Nous vérifions votre parcours Portrélia.
          </span>

        </div>

      </div>
    );
  }

  /*
   * =========================================================
   * ERREUR
   * =========================================================
   */
  if (
    error ||
    !invitation
  ) {
    return (
      <div className="invitation-page invitation-page-centered">

        <div className="invitation-error-card">

          <div className="invitation-error-icon">
            <FiAlertTriangle />
          </div>

          <h1>
            Invitation indisponible
          </h1>

          <p>
            {error ||
              "Cette invitation n'est pas disponible."}
          </p>

          <button
            type="button"
            className="invitation-primary-btn"
            onClick={
              reloadInvitation
            }
          >
            <FiRefreshCw />
            Réessayer
          </button>

        </div>

      </div>
    );
  }

  const participant =
    invitation.participant ||
    {};

  const campaign =
    invitation.campaign ||
    {};

  const company =
    invitation.company ||
    {};

  const style =
    invitation.style ||
    {};

  return (
    <div className="invitation-page">

      <div className="invitation-shell">

        {/* BRAND */}
        <div className="invitation-brand">

          <div className="invitation-brand-mark">
            P
          </div>

          <span>
            Portrélia
          </span>

        </div>

        {/* HERO */}
        <section className="invitation-hero">

          <div className="invitation-hero-content">

            <span className="invitation-kicker">
              INVITATION PERSONNELLE
            </span>

            <h1>
              Bonjour{" "}
              {participant.firstName ||
                ""}
            </h1>

            <p>
              <strong>
                {company.name ||
                  "Votre entreprise"}
              </strong>{" "}
              vous invite à participer à une campagne de portraits professionnels avec Portrélia.
            </p>

          </div>

          <div className="invitation-hero-badge">

            <FiCheckCircle />

            Invitation vérifiée

          </div>

        </section>

        {/* CAMPAIGN INFO */}
        <section className="invitation-info-grid">

          <div className="invitation-info-card">

            <FiImage />

            <div>
              <span>
                Campagne
              </span>

              <strong>
                {campaign.name ||
                  "Campagne Portrélia"}
              </strong>
            </div>

          </div>

          <div className="invitation-info-card">

            <FiCalendar />

            <div>
              <span>
                Date limite
              </span>

              <strong>
                {formatDate(
                  campaign.deadlineAt
                )}
              </strong>
            </div>

          </div>

          <div className="invitation-info-card">

            <FiClock />

            <div>
              <span>
                Temps estimé
              </span>

              <strong>
                5 à 8 minutes
              </strong>
            </div>

          </div>

          <div className="invitation-info-card">

            <FiUser />

            <div>
              <span>
                Participant
              </span>

              <strong>
                {participant.firstName}{" "}
                {participant.lastName}
              </strong>
            </div>

          </div>

        </section>

        {/* MAIN CONTENT */}
        <div className="invitation-main-grid">

          {/* LEFT */}
          <section className="invitation-card">

            <div className="invitation-card-header">

              <span className="invitation-step-label">
                VOTRE PARCOURS
              </span>

              <h2>
                Comment ça fonctionne ?
              </h2>

              <p>
                Vous serez guidé étape par étape pour obtenir un portrait professionnel cohérent avec le style choisi par votre entreprise.
              </p>

            </div>

            <div className="invitation-steps">

              <div className="invitation-step">

                <div className="invitation-step-number">
                  1
                </div>

                <div>
                  <strong>
                    Guide photo
                  </strong>

                  <span>
                    Nous vous indiquons comment prendre ou sélectionner de bonnes photos.
                  </span>
                </div>

              </div>

              <div className="invitation-step">

                <div className="invitation-step-number">
                  2
                </div>

                <div>
                  <strong>
                    Envoi de vos photos
                  </strong>

                  <span>
                    Vous déposez entre 6 et 12 photos récentes depuis votre téléphone ou ordinateur.
                  </span>
                </div>

              </div>

              <div className="invitation-step">

                <div className="invitation-step-number">
                  3
                </div>

                <div>
                  <strong>
                    Création et contrôle qualité
                  </strong>

                  <span>
                    Vos portraits sont générés puis contrôlés par l'équipe Portrélia.
                  </span>
                </div>

              </div>

              <div className="invitation-step">

                <div className="invitation-step-number">
                  4
                </div>

                <div>
                  <strong>
                    Votre galerie privée
                  </strong>

                  <span>
                    Vous choisissez votre portrait final parmi les propositions validées par Portrélia.
                  </span>
                </div>

              </div>

            </div>

          </section>

          {/* RIGHT */}
          <aside className="invitation-card invitation-side-card">

            <div className="invitation-style-block">

              <span>
                STYLE DE LA CAMPAGNE
              </span>

              <strong>
                {style.name ||
                  "Style professionnel"}
              </strong>

              <p>
                {style.description ||
                  "Le style choisi sera appliqué de manière cohérente à l'ensemble des portraits de votre équipe."}
              </p>

            </div>

            <div className="invitation-security-block">

              <FiShield />

              <div>
                <strong>
                  Vos photos restent privées
                </strong>

                <span>
                  Elles sont utilisées uniquement pour créer vos portraits et suivre votre participation à la campagne.
                </span>
              </div>

            </div>

            <label className="invitation-consent">

              <input
                type="checkbox"
                checked={
                  consentAccepted
                }
                onChange={(event) =>
                  setConsentAccepted(
                    event.target.checked
                  )
                }
              />

              <span>
                Je confirme avoir compris le parcours et j'accepte de poursuivre.
              </span>

            </label>

            <button
              type="button"
              className="invitation-primary-btn invitation-start-btn"
              onClick={
                handleStart
              }
              disabled={
                !consentAccepted
              }
            >
              Commencer
              <FiArrowRight />
            </button>

          </aside>

        </div>

        {/* FOOTER */}
        <footer className="invitation-footer">

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

export default InvitationPage;