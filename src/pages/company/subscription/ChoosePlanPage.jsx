
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiArrowRight,
  FiCheck,
  FiCheckCircle,
  FiShield,
  FiUsers,
  FiLayers,
  FiImage,
  FiZap,
  FiAlertCircle,
  FiRefreshCw,
  FiLogOut,
} from "react-icons/fi";

import { ClipLoader } from "react-spinners";

import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";

import "./ChoosePlanPage.css";

const normalizePlans = (response) => {
  const payload = response?.data;

  const plans = Array.isArray(payload)
    ? payload
    : payload?.data?.plans ??
      payload?.data ??
      payload?.plans ??
      [];

  if (!Array.isArray(plans)) return [];

  return plans
    .map((plan) => ({
      ...plan,
      code: String(plan.code || "").toUpperCase(),
      price: Number(
        plan.priceMonthly ??
        plan.price_monthly ??
        0
      ),
      currency: plan.currency || "EUR",
      campaigns:
        plan.maxActiveCampaigns ??
        plan.max_active_campaigns ??
        null,
      participants:
        plan.maxParticipantsPerCampaign ??
        plan.max_participants_per_campaign ??
        null,
      portraits:
        plan.maxPortraitsPerMonth ??
        plan.max_portraits_per_month ??
        null,
      allStyles:
        plan.allStyles ??
        plan.all_styles ??
        false,
      hdDownload:
        plan.hdDownload ??
        plan.hd_download ??
        false,
      zipExport:
        plan.zipExport ??
        plan.zip_export ??
        false,
      customBranding:
        plan.customBranding ??
        plan.custom_branding ??
        false,
      prioritySupport:
        plan.prioritySupport ??
        plan.priority_support ??
        false,
    }))
    .filter((plan) =>
      ["FREE", "PREMIUM"].includes(plan.code)
    )
    .sort((a, b) =>
      a.code === "FREE" ? -1 : b.code === "FREE" ? 1 : 0
    );
};

const features = [
  {
    key: "campaigns",
    label: "Campagnes actives",
    icon: FiLayers,
  },
  {
    key: "participants",
    label: "Collaborateurs / campagne",
    icon: FiUsers,
  },
  {
    key: "portraits",
    label: "Portraits / mois",
    icon: FiImage,
  },
];

const premiumFeatures = [
  { key: "allStyles", label: "Tous les styles" },
  { key: "hdDownload", label: "Téléchargement HD" },
  { key: "zipExport", label: "Export ZIP" },
  { key: "customBranding", label: "Branding personnalisé" },
  { key: "prioritySupport", label: "Support prioritaire" },
];

function ChoosePlanPage() {
  const navigate = useNavigate();
  const { user, refreshUser, logout } = useAuth();

  const [plans, setPlans] = useState([]);
  const [selected, setSelected] = useState("FREE");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const subscription = user?.subscription;
  const currentPlan =
    subscription?.status === "ACTIVE"
      ? subscription.plan?.code
      : null;

  useEffect(() => {
    const controller = new AbortController();

    api.get("/company/plans", {
      signal: controller.signal,
    })


      .then((response) => {
        console.log("Plans API response:", response);
        if (controller.signal.aborted) return;

        const result = normalizePlans(response);

        setPlans(result);
        setError("");
      })
      .catch((err) => {
        if (
          err.code === "ERR_CANCELED" ||
          err.name === "CanceledError"
        ) return;

        setError(
          err.response?.data?.message ||
          "Impossible de charger les offres."
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [reloadKey]);

  const handleContinue = async () => {
    if (processing) return;

    setProcessing(true);
    setError("");

    try {
      if (currentPlan === selected) {
        navigate("/dashboard", { replace: true });
        return;
      }

      if (selected === "FREE") {
        const response = await api.post(
          "/company/subscription/free"
        );

        if (response.data?.success === false) {
          throw new Error(
            response.data.message ||
            "Activation impossible."
          );
        }

        const updatedUser = await refreshUser();

        if (
          updatedUser?.subscription?.status !== "ACTIVE" ||
          updatedUser?.subscription?.plan?.code !== "FREE"
        ) {
          throw new Error(
            "L'activation n'a pas été confirmée."
          );
        }

        navigate("/dashboard", { replace: true });
        return;
      }

      if (selected === "PREMIUM") {
        const response = await api.post(
          "/company/subscription/premium"
        );

        if (response.data?.success === false) {
          throw new Error(
            response.data.message ||
            "Paiement indisponible."
          );
        }

        const checkoutUrl =
          response.data?.checkoutUrl ||
          response.data?.url ||
          response.data?.data?.checkoutUrl ||
          response.data?.data?.url;

        if (!checkoutUrl) {
          throw new Error(
            "Le paiement Premium n'est pas encore configuré."
          );
        }

        const destination = new URL(
          checkoutUrl,
          window.location.origin
        );

        if (
          destination.protocol !== "https:" &&
          destination.origin !== window.location.origin
        ) {
          throw new Error("Adresse de paiement invalide.");
        }

        window.location.assign(destination.href);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Une erreur est survenue."
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/connexion", { replace: true });
  };

  const selectedPlan = plans.find(
    (plan) => plan.code === selected
  );

  const formatPrice = (plan) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: plan.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(plan.price);

  return (
    <div className="company-plans-page">

      <header className="company-plans-nav">
        <div className="company-plans-brand">
          <span className="company-plans-brand-icon">
            <FiImage />
          </span>
          <span>Portrélia<span className="company-plans-brand-dot">.</span></span>
        </div>

        <button
          className="company-plans-logout"
          type="button"
          onClick={handleLogout}
        >
          <FiLogOut />
          <span>Déconnexion</span>
        </button>
      </header>

      <main className="company-plans-container">

        <section className="company-plans-intro">
          <span className="company-plans-kicker">
            VOTRE ABONNEMENT
          </span>

          <h1>Choisissez votre formule</h1>

          <p>
            Commencez gratuitement ou profitez de toutes
            les fonctionnalités avec Premium.
          </p>
        </section>

        {error && (
          <div className="company-plans-error" role="alert">
            <FiAlertCircle />
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Fermer"
            >
              ×
            </button>
          </div>
        )}

        {currentPlan && (
          <div className="company-plans-current">
            <FiCheckCircle />
            Offre actuelle : <strong>{currentPlan}</strong>
          </div>
        )}

        {loading ? (
          <div className="company-plans-loading">
            <ClipLoader size={28} color="#4f2e94" />
            <span>Chargement des offres...</span>
          </div>
        ) : plans.length === 0 ? (
          <div className="company-plans-loading">
            <FiAlertCircle />
            <span>Aucune offre disponible.</span>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setReloadKey((n) => n + 1);
              }}
            >
              <FiRefreshCw /> Réessayer
            </button>
          </div>
        ) : (
          <>
            <div
              className="company-plans-grid"
              role="radiogroup"
              aria-label="Choisissez votre abonnement"
            >
              {plans.map((plan) => {
                const active = selected === plan.code;
                const premium = plan.code === "PREMIUM";

                return (
                  <div
                    key={plan.code}
                    className={`company-plan-card ${
                      active ? "company-plan-card-selected" : ""
                    }`}
                  >
                    <button
                      type="button"
                      role="radio"
                      aria-checked={active}
                      className="company-plan-select"
                      onClick={() => setSelected(plan.code)}
                    >
                      <span className="company-plan-radio">
                        {active && <FiCheck />}
                      </span>

                      <span className="company-plan-heading">
                        <span className="company-plan-name-row">
                          <strong>{plan.name}</strong>
                          {premium && (
                            <span className="company-plan-badge">
                              <FiZap /> Plus complet
                            </span>
                          )}
                        </span>

                        <span className="company-plan-subtitle">
                          {premium
                            ? "Pour les équipes et projets ambitieux"
                            : "Pour découvrir Portrélia"}
                        </span>
                      </span>

                      <span className="company-plan-price">
                        <strong>{formatPrice(plan)}</strong>
                        <small>/mois</small>
                      </span>
                    </button>

                    <div className="company-plan-divider" />

                    <div className="company-plan-features">
                      {features.map((feature) => {
                        const Icon = feature.icon;

                        return (
                          <div
                            className="company-plan-feature"
                            key={feature.key}
                          >
                            <Icon />
                            <span>{feature.label}</span>
                            <strong>
                              {plan[feature.key] ?? "Illimité"}
                            </strong>
                          </div>
                        );
                      })}
                    </div>

                    <div className="company-plan-extras">
                      {premiumFeatures.map((feature) => {
                        const included = Boolean(
                          plan[feature.key]
                        );

                        return (
                          <div
                            className={`company-plan-extra ${
                              !included
                                ? "company-plan-extra-disabled"
                                : ""
                            }`}
                            key={feature.key}
                          >
                            <FiCheck />
                            <span>{feature.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="company-plans-action">
              <div className="company-plans-selection">
                <span>Formule sélectionnée</span>
                <strong>
                  {selectedPlan?.name} ·{" "}
                  {selectedPlan && formatPrice(selectedPlan)}
                  /mois
                </strong>
              </div>

              <button
                type="button"
                className="company-plans-continue"
                onClick={handleContinue}
                disabled={processing || !selectedPlan}
              >
                {processing ? (
                  <>
                    <ClipLoader size={16} color="#fff" />
                    Traitement...
                  </>
                ) : (
                  <>
                    {selected === currentPlan
                      ? "Accéder au tableau de bord"
                      : selected === "PREMIUM"
                        ? "Continuer avec Premium"
                        : "Commencer gratuitement"}
                    <FiArrowRight />
                  </>
                )}
              </button>

              <span className="company-plans-action-note">
                {selected === "FREE"
                  ? "Aucune carte bancaire nécessaire"
                  : "Vous serez redirigé vers le paiement"}
              </span>
            </div>
          </>
        )}

        <div className="company-plans-assurance">
          <FiShield />
          <span>
            Votre espace professionnel est sécurisé.
          </span>
        </div>
      </main>

      <footer className="company-plans-footer">
        © {new Date().getFullYear()} Portrélia
      </footer>
    </div>
  );
}

export default ChoosePlanPage;
