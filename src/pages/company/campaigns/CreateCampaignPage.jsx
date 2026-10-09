import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiPlus,
  FiTrash2,
  FiUser,
  FiMail,
  FiCalendar,
  FiClock,
  FiImage,
  FiAlertCircle,
} from "react-icons/fi";
import { ClipLoader } from "react-spinners";

import "./CreateCampaignPage.css";
import api from "../../../services/api";

function CreateCampaignPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [campaign, setCampaign] = useState({
    name: "",
    description: "",
    deadline: "",
    targetDelay: "72",
    portraitStyle: "MODERN_OFFICE",
  });

  const [participants, setParticipants] = useState([
    {
      id: 1,
      firstName: "",
      lastName: "",
      email: "",
    },
  ]);

  const handleCampaignChange = (event) => {
    const { name, value } = event.target;

    setCampaign((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (createError) {
      setCreateError("");
    }
  };

  const handleParticipantChange = (
    participantId,
    event
  ) => {
    const { name, value } = event.target;

    setParticipants((previous) =>
      previous.map((participant) =>
        participant.id === participantId
          ? {
              ...participant,
              [name]: value,
            }
          : participant
      )
    );

    if (createError) {
      setCreateError("");
    }
  };

  const addParticipant = () => {
    setParticipants((previous) => [
      ...previous,
      {
        id: Date.now(),
        firstName: "",
        lastName: "",
        email: "",
      },
    ]);
  };

  const removeParticipant = (
    participantId
  ) => {
    if (participants.length === 1) {
      return;
    }

    setParticipants((previous) =>
      previous.filter(
        (participant) =>
          participant.id !== participantId
      )
    );
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email.trim()
    );
  };

  const hasDuplicateEmails = () => {
    const emails = participants.map(
      (participant) =>
        participant.email
          .trim()
          .toLowerCase()
    );

    return (
      new Set(emails).size !==
      emails.length
    );
  };

  const canContinueStepOne =
    campaign.name.trim().length >= 2 &&
    campaign.deadline &&
    campaign.portraitStyle;

  const canContinueStepTwo =
    participants.length > 0 &&
    participants.every(
      (participant) =>
        participant.firstName.trim() &&
        participant.lastName.trim() &&
        participant.email.trim() &&
        isValidEmail(
          participant.email
        )
    ) &&
    !hasDuplicateEmails();

  const goNext = () => {
    setCreateError("");

    if (
      step === 1 &&
      canContinueStepOne
    ) {
      setStep(2);
      return;
    }

    if (step === 2) {
      if (hasDuplicateEmails()) {
        setCreateError(
          "Chaque collaborateur doit avoir une adresse email différente."
        );
        return;
      }

      if (!canContinueStepTwo) {
        setCreateError(
          "Merci de renseigner correctement le prénom, le nom et l'email de chaque collaborateur."
        );
        return;
      }

      setStep(3);
    }
  };

  const goBack = () => {
    setCreateError("");

    if (step === 1) {
      navigate(
        "/dashboard/campagnes"
      );
      return;
    }

    setStep(
      (previous) =>
        previous - 1
    );
  };

  const handleCreateCampaign =
    async () => {
      if (creating) {
        return;
      }

      if (
        !canContinueStepOne ||
        !canContinueStepTwo
      ) {
        setCreateError(
          "Certaines informations sont incomplètes ou invalides."
        );
        return;
      }

      try {
        setCreating(true);
        setCreateError("");

        const payload = {
          name:
            campaign.name.trim(),

          description:
            campaign.description
              .trim() || null,

          deadline:
            campaign.deadline,

          targetDelay:
            Number(
              campaign.targetDelay
            ),

          portraitStyle:
            campaign.portraitStyle,

          participants:
            participants.map(
              (participant) => ({
                firstName:
                  participant.firstName
                    .trim(),

                lastName:
                  participant.lastName
                    .trim(),

                email:
                  participant.email
                    .trim()
                    .toLowerCase(),
              })
            ),
        };

        const response =
          await api.post(
            "/company/campaigns",
            payload
          );

        if (
          response.data.success
        ) {
          const campaignId =
            response.data.data
              ?.campaign?.id ||
            response.data.data?.id;

          if (campaignId) {
            navigate(
              `/dashboard/campagnes/${campaignId}`,
              {
                replace: true,
              }
            );

            return;
          }

          navigate(
            "/dashboard/campagnes",
            {
              replace: true,
            }
          );
        }
      } catch (error) {
        console.error(
          "Erreur création campagne :",
          error
        );

        setCreateError(
          error.response?.data
            ?.message ||
            "Impossible de créer la campagne. Merci de réessayer."
        );
      } finally {
        setCreating(false);
      }
    };

  const getStyleLabel = (
    style
  ) => {
    switch (style) {
      case "MODERN_OFFICE":
        return "Bureau moderne";

      case "LIGHT_STUDIO":
        return "Studio clair";

      case "EXECUTIVE":
        return "Direction / Executive";

      case "LINKEDIN":
        return "Corporate LinkedIn";

      default:
        return style;
    }
  };

  const formatDeadline = (
    date
  ) => {
    if (!date) {
      return "-";
    }

    return new Intl.DateTimeFormat(
      "fr-FR",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    ).format(
      new Date(
        `${date}T12:00:00`
      )
    );
  };

  return (
    <div className="create-campaign-page">

      {/* HEADER */}
      <div className="create-campaign-header">

        <div>
          <span className="create-campaign-kicker">
            NOUVELLE CAMPAGNE
          </span>

          <h1>
            Créer une campagne
          </h1>

          <p>
            Configurez votre campagne, ajoutez vos collaborateurs
            puis vérifiez les informations avant le lancement.
          </p>
        </div>

        <div className="create-campaign-step-badge">
          Étape {step} sur 3
        </div>

      </div>

      {/* STEPPER */}
      <div className="create-campaign-stepper">

        <div
          className={`create-campaign-step ${
            step >= 1
              ? "create-campaign-step-active"
              : ""
          }`}
        >
          <div>
            {step > 1
              ? <FiCheck />
              : "1"}
          </div>

          <span>
            Configuration
          </span>
        </div>

        <div
          className={`create-campaign-step-line ${
            step >= 2
              ? "create-campaign-step-line-active"
              : ""
          }`}
        />

        <div
          className={`create-campaign-step ${
            step >= 2
              ? "create-campaign-step-active"
              : ""
          }`}
        >
          <div>
            {step > 2
              ? <FiCheck />
              : "2"}
          </div>

          <span>
            Participants
          </span>
        </div>

        <div
          className={`create-campaign-step-line ${
            step >= 3
              ? "create-campaign-step-line-active"
              : ""
          }`}
        />

        <div
          className={`create-campaign-step ${
            step >= 3
              ? "create-campaign-step-active"
              : ""
          }`}
        >
          <div>
            3
          </div>

          <span>
            Vérification
          </span>
        </div>

      </div>

      {/* ERROR */}
      {createError && (
        <div
          className="create-campaign-error"
          role="alert"
        >
          <FiAlertCircle />

          <span>
            {createError}
          </span>
        </div>
      )}

      {/* STEP 1 */}
      {step === 1 && (
        <div className="create-campaign-layout">

          <section className="create-campaign-card">

            <div className="create-campaign-card-header">
              <h2>
                Informations générales
              </h2>

              <p>
                Définissez les paramètres principaux de votre campagne.
              </p>
            </div>

            <div className="create-campaign-form">

              <div className="create-campaign-field">
                <label htmlFor="name">
                  Nom de la campagne
                  <span>*</span>
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Ex. Équipe France — Q4"
                  value={
                    campaign.name
                  }
                  onChange={
                    handleCampaignChange
                  }
                  maxLength={150}
                />
              </div>

              <div className="create-campaign-field">
                <label htmlFor="description">
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  placeholder="Décrivez brièvement l'objectif de cette campagne..."
                  value={
                    campaign.description
                  }
                  onChange={
                    handleCampaignChange
                  }
                  maxLength={1000}
                />
              </div>

              <div className="create-campaign-form-grid">

                <div className="create-campaign-field">
                  <label htmlFor="deadline">
                    Date limite de participation
                    <span>*</span>
                  </label>

                  <div className="create-campaign-input-icon">
                    <FiCalendar />

                    <input
                      id="deadline"
                      name="deadline"
                      type="date"
                      value={
                        campaign.deadline
                      }
                      onChange={
                        handleCampaignChange
                      }
                    />
                  </div>
                </div>

                <div className="create-campaign-field">
                  <label htmlFor="targetDelay">
                    Délai de livraison souhaité
                  </label>

                  <div className="create-campaign-input-icon">
                    <FiClock />

                    <select
                      id="targetDelay"
                      name="targetDelay"
                      value={
                        campaign.targetDelay
                      }
                      onChange={
                        handleCampaignChange
                      }
                    >
                      <option value="48">
                        48 heures
                      </option>

                      <option value="72">
                        72 heures
                      </option>

                      <option value="120">
                        5 jours ouvrés
                      </option>
                    </select>
                  </div>
                </div>

              </div>

              <div className="create-campaign-field">
                <label htmlFor="portraitStyle">
                  Style de portrait
                  <span>*</span>
                </label>

                <select
                  id="portraitStyle"
                  name="portraitStyle"
                  value={
                    campaign.portraitStyle
                  }
                  onChange={
                    handleCampaignChange
                  }
                >
                  <option value="MODERN_OFFICE">
                    Bureau moderne
                  </option>

                  <option value="LIGHT_STUDIO">
                    Studio clair
                  </option>

                  <option value="EXECUTIVE">
                    Direction / Executive
                  </option>

                  <option value="LINKEDIN">
                    Corporate LinkedIn
                  </option>
                </select>
              </div>

            </div>

          </section>

          <aside className="create-campaign-preview-card">

            <div className="create-campaign-card-header">
              <h2>
                Aperçu du style
              </h2>

              <p>
                Direction artistique appliquée à toute l'équipe.
              </p>
            </div>

            <div className="create-campaign-style-preview">

              <div className="create-campaign-style-card">
                <span>
                  {getStyleLabel(
                    campaign.portraitStyle
                  )}
                </span>

                <div className="create-campaign-avatar-preview">
                  <div className="create-campaign-avatar-head" />
                  <div className="create-campaign-avatar-body" />
                </div>
              </div>

              <div className="create-campaign-style-card create-campaign-style-card-secondary">
                <span>
                  Exemple
                </span>

                <div className="create-campaign-avatar-preview">
                  <div className="create-campaign-avatar-head" />
                  <div className="create-campaign-avatar-body" />
                </div>
              </div>

            </div>

            <div className="create-campaign-style-info">
              <FiImage />

              <div>
                <strong>
                  Direction artistique cohérente
                </strong>

                <span>
                  Lumière, cadrage et fond harmonisés pour tous les portraits.
                </span>
              </div>
            </div>

          </aside>

        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <section className="create-campaign-card">

          <div className="create-campaign-participants-header">

            <div className="create-campaign-card-header">
              <h2>
                Ajouter les collaborateurs
              </h2>

              <p>
                Chaque collaborateur recevra une invitation personnelle
                sur son adresse email après la création de la campagne.
              </p>
            </div>

            <button
              type="button"
              className="create-campaign-add-btn"
              onClick={
                addParticipant
              }
            >
              <FiPlus />
              Ajouter un collaborateur
            </button>

          </div>

          <div className="create-campaign-participants-list">

            {participants.map(
              (
                participant,
                index
              ) => (
                <div
                  key={
                    participant.id
                  }
                  className="create-campaign-participant"
                >

                  <div className="create-campaign-participant-number">
                    {index + 1}
                  </div>

                  <div className="create-campaign-participant-fields">

                    <div className="create-campaign-field">
                      <label>
                        Prénom
                      </label>

                      <div className="create-campaign-input-icon">
                        <FiUser />

                        <input
                          name="firstName"
                          type="text"
                          placeholder="Claire"
                          value={
                            participant.firstName
                          }
                          onChange={(
                            event
                          ) =>
                            handleParticipantChange(
                              participant.id,
                              event
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className="create-campaign-field">
                      <label>
                        Nom
                      </label>

                      <input
                        name="lastName"
                        type="text"
                        placeholder="Martin"
                        value={
                          participant.lastName
                        }
                        onChange={(
                          event
                        ) =>
                          handleParticipantChange(
                            participant.id,
                            event
                          )
                        }
                      />
                    </div>

                    <div className="create-campaign-field">
                      <label>
                        Email professionnel
                      </label>

                      <div className="create-campaign-input-icon">
                        <FiMail />

                        <input
                          name="email"
                          type="email"
                          placeholder="claire@entreprise.com"
                          value={
                            participant.email
                          }
                          onChange={(
                            event
                          ) =>
                            handleParticipantChange(
                              participant.id,
                              event
                            )
                          }
                        />
                      </div>
                    </div>

                  </div>

                  <button
                    type="button"
                    className="create-campaign-remove-btn"
                    onClick={() =>
                      removeParticipant(
                        participant.id
                      )
                    }
                    disabled={
                      participants.length ===
                      1
                    }
                    aria-label="Supprimer ce collaborateur"
                  >
                    <FiTrash2 />
                  </button>

                </div>
              )
            )}

          </div>

          <div className="create-campaign-participants-info">
            <strong>
              {participants.length}
            </strong>

            <span>
              {participants.length > 1
                ? "collaborateurs ajoutés"
                : "collaborateur ajouté"}
            </span>
          </div>

        </section>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="create-campaign-review-grid">

          <section className="create-campaign-card">

            <div className="create-campaign-card-header">
              <h2>
                Vérification
              </h2>

              <p>
                Vérifiez les paramètres avant de créer la campagne.
              </p>
            </div>

            <div className="create-campaign-review-list">

              <div>
                <span>
                  Nom
                </span>

                <strong>
                  {campaign.name}
                </strong>
              </div>

              {campaign.description && (
                <div>
                  <span>
                    Description
                  </span>

                  <strong>
                    {campaign.description}
                  </strong>
                </div>
              )}

              <div>
                <span>
                  Date limite de participation
                </span>

                <strong>
                  {formatDeadline(
                    campaign.deadline
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Délai de livraison souhaité
                </span>

                <strong>
                  {campaign.targetDelay ===
                  "120"
                    ? "5 jours ouvrés"
                    : `${campaign.targetDelay} heures`}
                </strong>
              </div>

              <div>
                <span>
                  Style
                </span>

                <strong>
                  {getStyleLabel(
                    campaign.portraitStyle
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Participants
                </span>

                <strong>
                  {participants.length}
                </strong>
              </div>

            </div>

          </section>

          <section className="create-campaign-card">

            <div className="create-campaign-card-header">
              <h2>
                Collaborateurs
              </h2>

              <p>
                Ces collaborateurs seront associés à la campagne.
              </p>
            </div>

            <div className="create-campaign-review-participants">

              {participants.map(
                (participant) => (
                  <div
                    key={
                      participant.id
                    }
                  >

                    <div>
                      <strong>
                        {
                          participant.firstName
                        }
                        {" "}
                        {
                          participant.lastName
                        }
                      </strong>

                      <span>
                        {
                          participant.email
                        }
                      </span>
                    </div>

                    <span className="create-campaign-ready-badge">
                      Prêt
                    </span>

                  </div>
                )
              )}

            </div>

          </section>

        </div>
      )}

      {/* ACTIONS */}
      <div className="create-campaign-actions">

        <button
          type="button"
          className="create-campaign-back-btn"
          onClick={
            goBack
          }
          disabled={
            creating
          }
        >
          <FiArrowLeft />

          {step === 1
            ? "Annuler"
            : "Retour"}
        </button>

        {step < 3 ? (
          <button
            type="button"
            className="create-campaign-next-btn"
            onClick={
              goNext
            }
            disabled={
              step === 1
                ? !canContinueStepOne
                : !canContinueStepTwo
            }
          >
            Continuer
            <FiArrowRight />
          </button>
        ) : (
          <button
            type="button"
            className="create-campaign-next-btn"
            onClick={
              handleCreateCampaign
            }
            disabled={
              creating
            }
          >
            {creating ? (
              <>
                <ClipLoader
                  size={15}
                  color="#ffffff"
                />
                Création...
              </>
            ) : (
              <>
                <FiCheck />
                Créer la campagne
              </>
            )}
          </button>
        )}

      </div>

    </div>
  );
}

export default CreateCampaignPage;