
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  FiSettings,
  FiExternalLink,
  FiCalendar,
  FiClock,
  FiInfo,
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
      plan.priceMonthly ??
      plan.price_monthly ??
      0
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
  }));
};

const formatLimit = (value) => {
  if (value === null || value === undefined) {
    return "Illimité";
  }

  return new Intl.NumberFormat("fr-FR").format(Number(value));
};

const formatPrice = (price, currency = "EUR") => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(price ?? 0));
};

const formatDate = (value) => {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Paris",
  }).format(date);
};

const isPremiumActive = (user) => (
  user?.subscription?.status === "ACTIVE" &&
  user?.subscription?.plan?.code === "PREMIUM"
);

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
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, setUser } = useAuth();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState("idle");
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState("");

  const payment = searchParams.get("payment");
  const sessionId = searchParams.get("session_id");

  const subscription = user?.subscription;
  const isActive = subscription?.status === "ACTIVE";
  const planCode = isActive
    ? String(subscription?.plan?.code || "").toUpperCase()
    : null;

  const isPremium = planCode === "PREMIUM";
  const isFree = planCode === "FREE";

  const cancellationValue =
    subscription?.cancelAtPeriodEnd ??
    subscription?.cancel_at_period_end;

  const cancellationKnown = typeof cancellationValue === "boolean";

  const cancellationScheduled =
    isPremium &&
    isActive &&
    cancellationValue === true;

  const currentPlan = plans.find(
    (plan) => plan.code === planCode
  );

  const periodEnd = formatDate(subscription?.currentPeriodEnd);

  const periodStart = formatDate(
    subscription?.currentPeriodStart
  );

  const displayName =
    currentPlan?.name ||
    subscription?.plan?.name ||
    "Aucun abonnement";

  const displayDescription =
    currentPlan?.description ||
    subscription?.plan?.description ||
    "Aucune offre active pour le moment.";

  const planPrice =
    currentPlan?.price ??
    subscription?.plan?.priceMonthly ??
    0;

  const planCurrency =
    currentPlan?.currency ??
    subscription?.plan?.currency ??
    "EUR";

  useEffect(() => {
    const controller = new AbortController();

    api.get("/company/plans", {
      signal: controller.signal,
    })
      .then((response) => {
        if (controller.signal.aborted) return;
        setPlans(normalizePlans(response));
        setError("");
      })
      .catch((err) => {
        if (
          controller.signal.aborted ||
          err.code === "ERR_CANCELED"
        ) {
          return;
        }

        console.error("Erreur chargement plans :", err);

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

  useEffect(() => {
    if (payment !== "success") return;

    const controller = new AbortController();
    let timer = null;
    let attempts = 0;

    const maxAttempts = 10;
    const interval = 2000;

    const checkSubscription = async () => {
      if (controller.signal.aborted) return;

      attempts += 1;

      try {
        const response = await api.get("/me", {
          signal: controller.signal,
          timeout: 10000,
          headers: {
            "Cache-Control": "no-cache",
          },
          params: {
            _t: Date.now(),
          },
        });

        if (controller.signal.aborted) return;

        const updatedUser = response.data?.user;

        if (
          response.data?.success === true &&
          updatedUser
        ) {
          setUser(updatedUser);

          if (isPremiumActive(updatedUser)) {
            setPaymentStatus("success");
            return;
          }
        }
      } catch (err) {
        if (controller.signal.aborted) return;

        console.error(
          "Vérification paiement Stripe :",
          err.message
        );
      }

      if (controller.signal.aborted) return;

      if (attempts >= maxAttempts) {
        setPaymentStatus("pending");
        return;
      }

      timer = setTimeout(checkSubscription, interval);
    };

    if (!sessionId) {
      console.warn(
        "Retour Stripe sans identifiant de session"
      );
    }

    checkSubscription();

    return () => {
      controller.abort();

      if (timer !== null) {
        clearTimeout(timer);
      }
    };
  }, [payment, sessionId, setUser]);

  const handleRefresh = async () => {
    if (refreshing) return;

    try {
      setRefreshing(true);
      setError("");
      setPortalError("");

      const response = await api.get("/me", {
        timeout: 10000,
        params: {
          _t: Date.now(),
        },
      });

      if (
        response.data?.success !== true ||
        !response.data?.user
      ) {
        throw new Error("Réponse utilisateur invalide.");
      }

      const updatedUser = response.data.user;

      setUser(updatedUser);

      if (payment === "success") {
        setPaymentStatus(
          isPremiumActive(updatedUser)
            ? "success"
            : "pending"
        );
      }

      setLoading(true);
      setReloadKey((previous) => previous + 1);
    } catch (err) {
      console.error("Actualisation abonnement :", err);

      setError(
        err.response?.data?.message ||
        "Impossible d'actualiser votre abonnement."
      );
    } finally {
      setRefreshing(false);
    }
  };

  const closePaymentMessage = () => {
    const params = new URLSearchParams(searchParams);

    params.delete("payment");
    params.delete("session_id");

    setPaymentStatus("idle");
    setSearchParams(params, { replace: true });
  };

  const goToPremium = () => {
    navigate("/dashboard/abonnement/choisir", {
      state: {
        preferredPlan: "PREMIUM",
      },
    });
  };

  const handleOpenBillingPortal = async () => {
    if (portalLoading || !isPremium) return;

    try {
      setPortalLoading(true);
      setPortalError("");

      const response = await api.post(
        "/company/subscription/portal",
        {},
        { timeout: 15000 }
      );

      const portalUrl = response.data?.portalUrl;

      if (
        response.data?.success !== true ||
        typeof portalUrl !== "string"
      ) {
        throw new Error(
          "Le lien de gestion de l'abonnement est indisponible."
        );
      }

      const url = new URL(portalUrl);

      if (
        url.protocol !== "https:" ||
        (
          url.hostname !== "billing.stripe.com" &&
          !url.hostname.endsWith(".billing.stripe.com")
        )
      ) {
        throw new Error(
          "Adresse de redirection Stripe invalide."
        );
      }

      window.location.assign(url.href);
    } catch (err) {
      console.error("Erreur portail Stripe :", err);

      setPortalError(
        err.response?.data?.message ||
        err.message ||
        "Impossible d'ouvrir la gestion de votre abonnement."
      );

      setPortalLoading(false);
    }
  };

  const effectivePaymentStatus =
    payment !== "success"
      ? "idle"
      : isPremiumActive(user)
        ? "success"
        : paymentStatus === "idle"
          ? "checking"
          : paymentStatus;

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

      {payment === "success" &&
        effectivePaymentStatus === "checking" && (
          <div
            className="company-subscription-loading"
            role="status"
          >
            <ClipLoader size={25} color="#4f2e94" />

            <strong>
              Vérification de votre abonnement
            </strong>

            <span>
              Nous vérifions l'activation de Premium.
              Cela peut prendre quelques instants.
            </span>
          </div>
        )}

      {payment === "success" &&
        effectivePaymentStatus === "success" && (
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
              aria-label="Fermer le message"
            >
              <FiX />
            </button>
          </div>
        )}

      {payment === "success" &&
        effectivePaymentStatus === "pending" && (
          <div
            className="company-subscription-error"
            role="status"
          >
            <FiAlertCircle />

            <span>
              Votre abonnement Premium n'est pas encore
              confirmé. Vérifiez le statut du paiement
              puis actualisez votre abonnement.
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

      {payment === "cancel" && (
        <div
          className="company-subscription-error"
          role="status"
        >
          <FiAlertCircle />

          <span>
            Vous avez quitté le paiement.
            Votre abonnement actuel reste inchangé.
          </span>

          <button
            type="button"
            className="company-subscription-refresh"
            onClick={closePaymentMessage}
            aria-label="Fermer"
          >
            <FiX />
          </button>
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

      {portalError && (
        <div
          className="company-subscription-error"
          role="alert"
        >
          <FiAlertCircle />
          <span>{portalError}</span>

          <button
            type="button"
            className="company-subscription-refresh"
            onClick={() => setPortalError("")}
            aria-label="Fermer l'erreur"
          >
            <FiX />
          </button>
        </div>
      )}

      {loading ? (
        <div className="company-subscription-loading">
          <ClipLoader size={30} color="#4f2e94" />

          <span>
            Chargement de votre abonnement...
          </span>
        </div>
      ) : (
        <>
          <section className="company-subscription-overview">
            <div className="company-subscription-overview-main">
              <div className="company-subscription-plan-icon">
                {isPremium ? <FiZap /> : <FiCreditCard />}
              </div>

              <div className="company-subscription-plan-info">
                <span className="company-subscription-overview-label">
                  VOTRE OFFRE ACTUELLE
                </span>

                <div className="company-subscription-plan-title">
                  <h2>{displayName}</h2>

                  <span
                    className={`company-subscription-status ${
                      isActive
                        ? cancellationScheduled
                          ? "company-subscription-status-inactive"
                          : "company-subscription-status-active"
                        : "company-subscription-status-inactive"
                    }`}
                  >
                    {cancellationScheduled
                      ? "Résiliation programmée"
                      : isActive
                        ? "Actif"
                        : "Inactif"}
                  </span>
                </div>

                <p>{displayDescription}</p>

                {isPremium &&
                  isActive &&
                  cancellationScheduled && (
                    <p
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 9,
                        marginTop: 14,
                        color: "#92400e",
                        lineHeight: 1.6,
                      }}
                    >
                      <FiClock
                        style={{
                          flexShrink: 0,
                          marginTop: 4,
                        }}
                      />

                      <span>
                        Votre abonnement prendra fin
                        {periodEnd
                          ? ` le ${periodEnd}`
                          : " à la fin de votre période payée"}
                        . Vous conservez vos avantages
                        Premium jusqu'à cette date.
                      </span>
                    </p>
                  )}

                {isPremium &&
                  isActive &&
                  !cancellationScheduled &&
                  periodEnd && (
                    <p
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 9,
                        marginTop: 14,
                        lineHeight: 1.6,
                      }}
                    >
                      <FiCalendar style={{ flexShrink: 0 }} />

                      <span>
                        {cancellationKnown
                          ? `Prochain renouvellement : ${periodEnd}`
                          : `Période en cours jusqu'au ${periodEnd}`}
                      </span>
                    </p>
                  )}
              </div>
            </div>

            <div className="company-subscription-overview-side">
              <div className="company-subscription-price">
                <strong>
                  {formatPrice(planPrice, planCurrency)}
                </strong>
                <span>/ mois</span>
              </div>

              {periodEnd && isPremium && (
                <span className="company-subscription-period">
                  {cancellationScheduled
                    ? "Fin d'accès"
                    : "Fin de période"}{" "}
                  : {periodEnd}
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
                <>
                  <span className="company-subscription-premium-label">
                    <FiCheckCircle />
                    {cancellationScheduled
                      ? "Accès Premium conservé"
                      : "Offre Premium activée"}
                  </span>

                  <button
                    type="button"
                    className="company-subscription-upgrade-btn"
                    onClick={handleOpenBillingPortal}
                    disabled={portalLoading}
                    aria-busy={portalLoading}
                  >
                    {portalLoading ? (
                      <>
                        <FiRefreshCw
                          className="company-subscription-spin"
                        />
                        Ouverture...
                      </>
                    ) : (
                      <>
                        <FiSettings />
                        Gérer mon abonnement
                        <FiExternalLink />
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </section>

          {isPremium && cancellationScheduled && (
            <div
              role="status"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
                padding: "18px 20px",
                marginTop: 18,
                border: "1px solid #f5d7a4",
                borderRadius: 14,
                background: "#fffaf0",
                color: "#855a18",
              }}
            >
              <FiInfo
                size={20}
                style={{ flexShrink: 0, marginTop: 2 }}
              />

              <div style={{ lineHeight: 1.6 }}>
                <strong style={{ display: "block" }}>
                  Votre résiliation est programmée
                </strong>

                <span>
                  Votre accès Premium reste actif
                  {periodEnd
                    ? ` jusqu'au ${periodEnd}`
                    : " jusqu'à la fin de la période payée"}
                  . Vous pouvez annuler cette résiliation
                  depuis le portail Stripe en cliquant sur
                  « Gérer mon abonnement ».
                </span>
              </div>
            </div>
          )}

          {isPremium &&
            isActive &&
            !cancellationKnown && (
              <div
                role="note"
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  marginTop: 16,
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: "#667085",
                }}
              >
                <FiInfo
                  size={17}
                  style={{
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                />

                <span>
                  Pour consulter le renouvellement ou
                  une éventuelle résiliation programmée,
                  ouvrez la gestion de votre abonnement.
                </span>
              </div>
            )}

          {isPremium && periodStart && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 8,
                marginTop: 15,
                fontSize: 13,
                color: "#667085",
              }}
            >
              <FiCalendar />
              <span>
                Période d'abonnement commencée
                le {periodStart}
              </span>
            </div>
          )}

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
                  ? formatLimit(currentPlan.maxActiveCampaigns)
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
                  ? formatLimit(currentPlan.maxPortraitsPerMonth)
                  : "—"}
              </strong>

              <span>Portraits par mois</span>
            </div>
          </div>

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
                currentPlan?.[feature.key] ??
                subscription?.plan?.[feature.key]
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

              <button type="button" onClick={goToPremium}>
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
