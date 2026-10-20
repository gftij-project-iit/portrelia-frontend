
import { useEffect, useState, useRef } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  FiArrowRight,
  FiCheck,
  FiCheckCircle,
  FiX,
  FiZap,
  FiLayers,
  FiUsers,
  FiImage,
  FiDownload,
  FiPackage,
  FiShield,
  FiRefreshCw,
  FiAlertCircle,
  FiCreditCard,
  FiStar,
} from "react-icons/fi";

import { ClipLoader } from "react-spinners";

import { useAuth } from "../../../context/AuthContext";
import api from "../../../services/api";

import "./SubscriptionPage.css";

const normalizePlans = (response) => {
  const payload = response?.data;

  const plans = Array.isArray(payload)
    ? payload
    : payload?.plans ??
      payload?.data?.plans ??
      payload?.data ??
      [];

  if (!Array.isArray(plans)) return [];

  return plans.map((plan) => ({
    ...plan,
    code: String(plan.code || "").toUpperCase(),
    price: Number(
      plan.priceMonthly ?? plan.price_monthly ?? 0
    ),
    currency: plan.currency || "EUR",

    maxActiveCampaigns:
      plan.maxActiveCampaigns ??
      plan.max_active_campaigns ??
      null,

    maxParticipantsPerCampaign:
      plan.maxParticipantsPerCampaign ??
      plan.max_participants_per_campaign ??
      null,

    maxPortraitsPerMonth:
      plan.maxPortraitsPerMonth ??
      plan.max_portraits_per_month ??
      null,

    allStyles:
      plan.allStyles ?? plan.all_styles ?? false,

    hdDownload:
      plan.hdDownload ?? plan.hd_download ?? false,

    zipExport:
      plan.zipExport ?? plan.zip_export ?? false,

    customBranding:
      plan.customBranding ?? plan.custom_branding ?? false,

    prioritySupport:
      plan.prioritySupport ?? plan.priority_support ?? false,
  }));
};

const formatLimit = (value) => {
  if (value === null || value === undefined) {
    return "Illimité";
  }

  return new Intl.NumberFormat("fr-FR").format(
    Number(value)
  );
};

const formatPrice = (price, currency = "EUR") =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(price));

const formatDate = (date) => {
  if (!date) return null;

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return null;

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parsed);
};

const features = [
  {
    key: "allStyles",
    label: "Tous les styles de portraits",
    icon: FiStar,
  },
  {
    key: "hdDownload",
    label: "Téléchargement haute définition",
    icon: FiDownload,
  },
  {
    key: "zipExport",
    label: "Export groupé ZIP",
    icon: FiPackage,
  },
  {
    key: "customBranding",
    label: "Personnalisation de marque",
    icon: FiImage,
  },
  {
    key: "prioritySupport",
    label: "Support prioritaire",
    icon: FiZap,
  },
];

function SubscriptionPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] =
    useSearchParams();

  const { user, refreshUser } = useAuth();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [paymentStatus, setPaymentStatus] =
    useState("idle");

  const payment = searchParams.get("payment");
  const paymentSessionId =
    searchParams.get("session_id");

  const paymentCheckStarted = useRef(false);

  const subscription = user?.subscription;

  const isActive =
    subscription?.status === "ACTIVE";

  const planCode = isActive
    ? subscription?.plan?.code
    : null;

  const isPremium = planCode === "PREMIUM";
  const isFree = planCode === "FREE";

  // Charger les offres
  useEffect(() => {
    const controller = new AbortController();

    api.get("/company/plans", {
      signal: controller.signal,
    })
      .then((response) => {
        if (controller.signal.aborted) return;

        setPlans(normalizePlans(response));
      })
      .catch((err) => {
        if (
          err.code === "ERR_CANCELED" ||
          err.name === "CanceledError"
        ) return;

        console.error(
          "Erreur chargement abonnement :",
          err
        );

        setError(
          err.response?.data?.message ||
          "Impossible de récupérer les offres."
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [reloadKey]);

  // Vérifier le paiement après retour de Stripe
  useEffect(() => {
    if (
      payment !== "success" ||
      paymentCheckStarted.current
    ) {
      return;
    }

    paymentCheckStarted.current = true;

    let cancelled = false;
    let timeoutId = null;

    const verifyPayment = async () => {
      setPaymentStatus("checking");

      // Le webhook peut être reçu après
      // la redirection de Stripe.
      for (let attempt = 0; attempt < 10; attempt++) {
        if (cancelled) return;

        try {
          const updatedUser = await refreshUser();

          if (cancelled) return;

          if (
            updatedUser?.subscription?.status === "ACTIVE" &&
            updatedUser?.subscription?.plan?.code === "PREMIUM"
          ) {
            setPaymentStatus("success");

            console.log(
              "✅ PREMIUM confirmé dans PostgreSQL"
            );

            return;
          }
        } catch (err) {
          console.error(
            "Vérification abonnement :",
            err
          );
        }

        if (attempt < 9) {
          await new Promise((resolve) => {
            timeoutId = setTimeout(resolve, 2000);
          });
        }
      }

      if (!cancelled) {
        setPaymentStatus("pending");
      }
    };

    verifyPayment();

    return () => {
      cancelled = true;

      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };

    // Uniquement au retour de Stripe.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payment]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError("");

      const updatedUser = await refreshUser();

      if (
        payment === "success" &&
        updatedUser?.subscription?.status === "ACTIVE" &&
        updatedUser?.subscription?.plan?.code === "PREMIUM"
      ) {
        setPaymentStatus("success");
      }

      setLoading(true);
      setReloadKey((previous) => previous + 1);
    } catch (err) {
      console.error(err);

      setError(
        "Impossible d'actualiser votre abonnement."
      );
    } finally {
      setRefreshing(false);
    }
  };

  const closePaymentMessage = () => {
    setPaymentStatus("idle");

    const params = new URLSearchParams(searchParams);
    params.delete("payment");
    params.delete("session_id");

    setSearchParams(params, { replace: true });
  };

  const currentPlan = plans.find(
    (plan) => plan.code === planCode
  );

  const nextBillingDate = formatDate(
    subscription?.currentPeriodEnd
  );

  const goToPremium = () => {
    navigate("/dashboard/abonnement/choisir", {
      state: {
        preferredPlan: "PREMIUM",
      },
    });
  };

  return (
    <div className="company-subscription-page">

      <div className="company-subscription-header">
        <div>
          <span className="company-subscription-kicker">
            ESPACE ENTREPRISE
          </span>

          <h1>Mon abonnement</h1>

          <p>
            Consultez votre offre, vos limites
            et les fonctionnalités disponibles.
          </p>
        </div>

        <button
          type="button"
          className="company-subscription-refresh"
          onClick={handleRefresh}
          disabled={refreshing || loading}
        >
          <FiRefreshCw
            className={
              refreshing
                ? "company-subscription-spin"
                : ""
            }
          />

          <span>Actualiser</span>
        </button>
      </div>

      {/* Statut après retour Stripe */}

      {payment === "success" &&
        paymentStatus === "checking" && (
          <div
            className="company-subscription-loading"
            role="status"
          >
            <ClipLoader
              size={25}
              color="#4f2e94"
            />

            <strong>Vérification de votre paiement</strong>

            <span>
              Nous vérifions l'activation
              de votre abonnement Premium.
            </span>
          </div>
        )}

      {payment === "success" &&
        paymentStatus === "success" && (
          <div
            className="company-subscription-feature"
            role="status"
          >
            <FiCheckCircle color="#027a48" />

            <span className="company-subscription-feature-name">
              Votre abonnement Premium est actif !
              Toutes les fonctionnalités de votre offre
              sont désormais disponibles.
            </span>

            <button
              type="button"
              className="company-subscription-refresh"
              onClick={closePaymentMessage}
            >
              <FiX />
            </button>
          </div>
        )}

      {payment === "success" &&
        paymentStatus === "pending" && (
          <div
            className="company-subscription-error"
            role="status"
          >
            <FiAlertCircle />

            <span>
              Le retour Stripe a été reçu, mais
              l'activation Premium n'est pas encore
              confirmée. Vérifiez le paiement
              dans Stripe, puis actualisez la page.
            </span>

            <button
              type="button"
              className="company-subscription-refresh"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <FiRefreshCw />
              Actualiser
            </button>
          </div>
        )}

      {payment === "success" &&
        !paymentSessionId &&
        paymentStatus === "idle" && (
          <div className="company-subscription-error">
            <FiAlertCircle />

            <span>
              Référence de paiement absente.
              Vérifiez votre abonnement.
            </span>
          </div>
        )}

      {error && (
        <div
          className="company-subscription-error"
          role="alert"
        >
          <FiAlertCircle />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="company-subscription-loading">
          <ClipLoader
            size={30}
            color="#4f2e94"
          />

          <span>
            Chargement de votre abonnement...
          </span>
        </div>
      ) : (
        <>
          {/* Offre actuelle */}

          <section className="company-subscription-overview">

            <div className="company-subscription-overview-main">

              <div className="company-subscription-plan-icon">
                {isPremium
                  ? <FiZap />
                  : <FiCreditCard />}
              </div>

              <div className="company-subscription-plan-info">

                <span className="company-subscription-overview-label">
                  VOTRE OFFRE ACTUELLE
                </span>

                <div className="company-subscription-plan-title">
                  <h2>
                    {currentPlan?.name ||
                      subscription?.plan?.name ||
                      "Aucun abonnement"}
                  </h2>

                  <span
                    className={`company-subscription-status ${
                      isActive
                        ? "company-subscription-status-active"
                        : "company-subscription-status-inactive"
                    }`}
                  >
                    {isActive ? "Actif" : "Inactif"}
                  </span>
                </div>

                <p>
                  {currentPlan?.description ||
                    subscription?.plan?.description ||
                    "Aucune offre active pour le moment."}
                </p>
              </div>
            </div>

            <div className="company-subscription-overview-side">

              <div className="company-subscription-price">
                <strong>
                  {formatPrice(
                    currentPlan?.price ??
                      subscription?.plan?.priceMonthly ??
                      0,
                    currentPlan?.currency ??
                      subscription?.plan?.currency ??
                      "EUR"
                  )}
                </strong>

                <span>/ mois</span>
              </div>

              {nextBillingDate && (
                <span className="company-subscription-period">
                  Fin de période : {nextBillingDate}
                </span>
              )}

              {isFree && (
                <button
                  type="button"
                  className="company-subscription-upgrade-btn"
                  onClick={goToPremium}
                >
                  <FiZap />
                  Passer à Premium
                  <FiArrowRight />
                </button>
              )}

              {isPremium && (
                <span className="company-subscription-premium-label">
                  <FiCheckCircle />
                  Offre Premium activée
                </span>
              )}
            </div>
          </section>

          {/* Limites */}

          <div className="company-subscription-section-heading">
            <div>
              <h2>Limites de votre offre</h2>

              <p>
                Les capacités incluses dans votre abonnement.
              </p>
            </div>
          </div>

          <div className="company-subscription-limits">
            <div className="company-subscription-limit-card">
              <span className="company-subscription-limit-icon">
                <FiLayers />
              </span>

              <strong>
                {currentPlan
                  ? formatLimit(
                      currentPlan.maxActiveCampaigns
                    )
                  : "—"}
              </strong>

              <span>Campagnes actives</span>
            </div>

            <div className="company-subscription-limit-card">
              <span className="company-subscription-limit-icon">
                <FiUsers />
              </span>

              <strong>
                {currentPlan
                  ? formatLimit(
                      currentPlan.maxParticipantsPerCampaign
                    )
                  : "—"}
              </strong>

              <span>Collaborateurs par campagne</span>
            </div>

            <div className="company-subscription-limit-card">
              <span className="company-subscription-limit-icon">
                <FiImage />
              </span>

              <strong>
                {currentPlan
                  ? formatLimit(
                      currentPlan.maxPortraitsPerMonth
                    )
                  : "—"}
              </strong>

              <span>Portraits par mois</span>
            </div>
          </div>

          {/* Fonctionnalités */}

          <div className="company-subscription-section-heading">
            <div>
              <h2>Fonctionnalités incluses</h2>

              <p>
                Retrouvez les avantages disponibles
                avec votre formule.
              </p>
            </div>
          </div>

          <section className="company-subscription-features">
            {features.map((feature) => {
              const Icon = feature.icon;

              const available = Boolean(
                currentPlan?.[feature.key]
              );

              return (
                <div
                  key={feature.key}
                  className="company-subscription-feature"
                >
                  <span className="company-subscription-feature-icon">
                    <Icon />
                  </span>

                  <span className="company-subscription-feature-name">
                    {feature.label}
                  </span>

                  <span
                    className={`company-subscription-feature-status ${
                      available
                        ? "company-subscription-feature-enabled"
                        : "company-subscription-feature-disabled"
                    }`}
                  >
                    {available ? (
                      <>
                        <FiCheck />
                        Inclus
                      </>
                    ) : (
                      <>
                        <FiX />
                        Non inclus
                      </>
                    )}
                  </span>
                </div>
              );
            })}
          </section>

          {/* Upgrade */}

          {isFree && (
            <section className="company-subscription-upgrade">

              <div className="company-subscription-upgrade-symbol">
                <FiZap />
              </div>

              <div className="company-subscription-upgrade-content">
                <span>PORTRÉLIA PREMIUM</span>

                <h2>
                  Développez vos campagnes sans limites.
                </h2>

                <p>
                  Accédez aux fonctionnalités avancées,
                  aux portraits haute définition et
                  aux exports groupés pour vos équipes.
                </p>
              </div>

              <button
                type="button"
                onClick={goToPremium}
              >
                Découvrir Premium
                <FiArrowRight />
              </button>
            </section>
          )}

          <div className="company-subscription-security">
            <FiShield />

            <span>
              Les fonctionnalités accessibles dépendent
              de votre abonnement actif.
              Les limites sont appliquées automatiquement
              à vos campagnes.
            </span>
          </div>
        </>
      )}
    </div>
  );
}

export default SubscriptionPage;
