
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiArrowLeft,
  FiArrowRight,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiDownload,
  FiExternalLink,
  FiFileText,
  FiInbox,
  FiRefreshCw,
  FiShield,
  FiCalendar,
  FiZap,
} from "react-icons/fi";

import { ClipLoader } from "react-spinners";

import { useAuth } from "../../../context/AuthContext";
import api from "../../../services/api";

import "./BillingPage.css";

// Stripe retourne les montants en centimes.
const formatMoney = (amount, currency = "EUR") => {
  const value = Number(amount);

  if (!Number.isFinite(value)) return "—";

  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: String(currency || "EUR").toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value / 100);
  } catch {
    return `${(value / 100).toFixed(2)} ${currency}`;
  }
};

// Les prix des offres dans PostgreSQL sont en euros.
const formatPlanPrice = (amount, currency = "EUR") => {
  const value = Number(amount);

  if (!Number.isFinite(value)) return "—";

  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: String(currency || "EUR").toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Paris",
  }).format(date);
};

const getInvoiceStatus = (invoice) => {
  switch (invoice.status) {
    case "paid":
      return {
        label: "Payée",
        className: "paid",
        icon: FiCheckCircle,
      };

    case "open":
      return {
        label: "À payer",
        className: "pending",
        icon: FiClock,
      };

    case "draft":
      return {
        label: "Brouillon",
        className: "draft",
        icon: FiFileText,
      };

    case "void":
      return {
        label: "Annulée",
        className: "void",
        icon: FiAlertCircle,
      };

    case "uncollectible":
      return {
        label: "Irrécouvrable",
        className: "failed",
        icon: FiAlertCircle,
      };

    default:
      return {
        label: "En cours",
        className: "pending",
        icon: FiClock,
      };
  }
};

const getInvoiceTitle = (invoice) => {
  if (invoice.number) {
    return `Facture ${invoice.number}`;
  }

  return `Facture du ${formatDate(invoice.createdAt)}`;
};

// Les URL des factures proviennent de l'API Stripe,
// jamais d'une valeur saisie par un autre utilisateur.
const openInvoiceLink = (url) => {
  if (typeof url !== "string") return;

  try {
    const parsed = new URL(url);

    if (parsed.protocol !== "https:") {
      throw new Error("Lien non sécurisé.");
    }

    window.open(
      parsed.href,
      "_blank",
      "noopener,noreferrer"
    );
  } catch (error) {
    console.error("Lien de facture invalide :", error);
  }
};

function BillingPage() {
  const navigate = useNavigate();

  const { user, setUser } = useAuth();

  const subscription = user?.subscription;
  const plan = subscription?.plan;

  const planCode = String(
    plan?.code || "FREE"
  ).toUpperCase();

  const isPremium =
    planCode === "PREMIUM" &&
    subscription?.status === "ACTIVE";

  const cancellationScheduled =
    isPremium &&
    subscription?.cancelAtPeriodEnd === true;

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);

  const [error, setError] = useState("");
  const [portalError, setPortalError] = useState("");
  const [portalLoading, setPortalLoading] = useState(false);

  // Chargement des factures de l'entreprise connectée.
  const loadInvoices = useCallback(async ({
    cursor = null,
    append = false,
    signal,
  } = {}) => {
    const response = await api.get(
      "/company/billing/invoices",
      {
        signal,
        timeout: 60000,
        params: cursor ? { cursor } : {},
      }
    );

    if (
      response.data?.success !== true ||
      !Array.isArray(response.data?.invoices)
    ) {
      throw new Error(
        "Réponse de facturation invalide."
      );
    }

    const received = response.data.invoices;

    setInvoices((previous) => {
      if (!append) return received;

      const existingIds = new Set(
        previous.map((invoice) => invoice.id)
      );

      const newInvoices = received.filter(
        (invoice) => !existingIds.has(invoice.id)
      );

      return [...previous, ...newInvoices];
    });

    setHasMore(Boolean(response.data.hasMore));
    setNextCursor(response.data.nextCursor || null);
  }, []);

  // Premier chargement de la page.
  useEffect(() => {
    const controller = new AbortController();

    const initialize = async () => {
      try {
        setLoading(true);
        setError("");

        await loadInvoices({
          signal: controller.signal,
        });
      } catch (err) {
        if (
          controller.signal.aborted ||
          err.code === "ERR_CANCELED"
        ) {
          return;
        }

        console.error("Chargement factures :", err);

        setError(
          err.response?.data?.message ||
          err.message ||
          "Impossible de charger vos factures."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    initialize();

    return () => controller.abort();
  }, [loadInvoices]);

  // Actualiser les factures et les informations de l'offre.
  const handleRefresh = async () => {
    if (refreshing || loadingMore || loading) return;

    try {
      setRefreshing(true);
      setError("");
      setPortalError("");

      const [invoicesResult, userResult] =
        await Promise.allSettled([
          loadInvoices(),
          api.get("/me", {
            timeout: 60000,
            params: { _t: Date.now() },
          }),
        ]);

      if (userResult.status === "fulfilled") {
        const updatedUser = userResult.value.data?.user;

        if (
          userResult.value.data?.success === true &&
          updatedUser
        ) {
          setUser(updatedUser);
        }
      }

      if (invoicesResult.status === "rejected") {
        throw invoicesResult.reason;
      }
    } catch (err) {
      console.error("Actualisation factures :", err);

      setError(
        err.response?.data?.message ||
        "Impossible d'actualiser vos factures."
      );
    } finally {
      setRefreshing(false);
    }
  };

  // Pagination : charger les 20 factures suivantes.
  const handleLoadMore = async () => {
    if (
      loadingMore ||
      refreshing ||
      !hasMore ||
      !nextCursor
    ) {
      return;
    }

    try {
      setLoadingMore(true);
      setError("");

      await loadInvoices({
        cursor: nextCursor,
        append: true,
      });
    } catch (err) {
      console.error("Pagination factures :", err);

      setError(
        err.response?.data?.message ||
        "Impossible de charger les factures suivantes."
      );
    } finally {
      setLoadingMore(false);
    }
  };

  // Accès sécurisé au Stripe Customer Portal.
  const handleOpenPortal = async () => {
    if (portalLoading) return;

    try {
      setPortalLoading(true);
      setPortalError("");

      const response = await api.post(
        "/company/subscription/portal",
        {},
        { timeout: 60000 }
      );

      const portalUrl = response.data?.portalUrl;

      if (
        response.data?.success !== true ||
        typeof portalUrl !== "string"
      ) {
        throw new Error(
          "Le portail de paiement est indisponible."
        );
      }

      const parsed = new URL(portalUrl);

      if (
        parsed.protocol !== "https:" ||
        parsed.hostname !== "billing.stripe.com"
      ) {
        throw new Error(
          "Adresse de redirection Stripe invalide."
        );
      }

      window.location.assign(parsed.href);
    } catch (err) {
      console.error("Portail de facturation :", err);

      setPortalError(
        err.response?.data?.message ||
        err.message ||
        "Impossible d'ouvrir la gestion des paiements."
      );

      setPortalLoading(false);
    }
  };

  // Résumé calculé uniquement à partir des factures chargées.
  const summary = useMemo(() => {
    const paidInvoices = invoices.filter(
      (invoice) => invoice.status === "paid"
    );

    const currencies = new Set(
      paidInvoices.map((invoice) =>
        String(invoice.currency || "EUR").toUpperCase()
      )
    );

    const sameCurrency = currencies.size <= 1;

    const currency =
      paidInvoices[0]?.currency || "EUR";

    const totalPaid = paidInvoices.reduce(
      (sum, invoice) =>
        sum + Number(invoice.amountPaid || 0),
      0
    );

    return {
      count: invoices.length,
      paidCount: paidInvoices.length,
      totalPaid,
      currency,
      sameCurrency,
    };
  }, [invoices]);

  const canManagePayment =
    Boolean(subscription?.stripeCustomerId) &&
    isPremium;

  return (
    <div className="company-billing-page">
      <header className="company-billing-header">
        <div className="company-billing-header-content">
          <span className="company-billing-kicker">
            ESPACE ENTREPRISE
          </span>

          <h1>Facturation</h1>

          <p>
            Retrouvez vos factures, vos paiements
            et les informations de votre abonnement.
          </p>
        </div>

        <button
          type="button"
          className="company-billing-refresh"
          onClick={handleRefresh}
          disabled={loading || refreshing || loadingMore}
        >
          <FiRefreshCw
            className={refreshing ? "company-billing-spin" : ""}
          />
          <span>
            {refreshing ? "Actualisation..." : "Actualiser"}
          </span>
        </button>
      </header>

      {error && (
        <div
          className="company-billing-alert"
          role="alert"
        >
          <FiAlertCircle />
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Fermer le message"
          >
            ×
          </button>
        </div>
      )}

      {portalError && (
        <div
          className="company-billing-alert"
          role="alert"
        >
          <FiAlertCircle />
          <span>{portalError}</span>
          <button
            type="button"
            onClick={() => setPortalError("")}
            aria-label="Fermer le message"
          >
            ×
          </button>
        </div>
      )}

      <section
        className="company-billing-summary"
        aria-label="Résumé de facturation"
      >
        <article className="company-billing-summary-card">
          <div className="company-billing-summary-top">
            <span className="company-billing-summary-icon purple">
              <FiZap />
            </span>
            <span className="company-billing-summary-caption">
              Offre actuelle
            </span>
          </div>

          <strong>
            {plan?.name || "Aucune offre"}
          </strong>

          <span className="company-billing-summary-subtitle">
            {subscription?.status === "ACTIVE"
              ? cancellationScheduled
                ? "Résiliation programmée"
                : "Abonnement actif"
              : "Aucun abonnement actif"}
          </span>
        </article>

        <article className="company-billing-summary-card">
          <div className="company-billing-summary-top">
            <span className="company-billing-summary-icon blue">
              <FiFileText />
            </span>
            <span className="company-billing-summary-caption">
              Factures affichées
            </span>
          </div>

          <strong>
            {loading ? "—" : summary.count}
            {!loading && hasMore ? "+" : ""}
          </strong>

          <span className="company-billing-summary-subtitle">
            {hasMore
              ? "D'autres factures sont disponibles"
              : "Dans votre historique"}
          </span>
        </article>

        <article className="company-billing-summary-card">
          <div className="company-billing-summary-top">
            <span className="company-billing-summary-icon green">
              <FiCheckCircle />
            </span>
            <span className="company-billing-summary-caption">
              Total payé
            </span>
          </div>

          <strong>
            {loading
              ? "—"
              : summary.sameCurrency
                ? formatMoney(
                    summary.totalPaid,
                    summary.currency
                  )
                : "—"}
          </strong>

          <span className="company-billing-summary-subtitle">
            {summary.sameCurrency
              ? "Sur les factures chargées"
              : "Plusieurs devises"}
          </span>
        </article>
      </section>

      <section className="company-billing-section">
        <div className="company-billing-section-header">
          <div>
            <h2>Historique des factures</h2>
            <p>
              Consultez vos documents et le statut
              de vos paiements.
            </p>
          </div>

          {!loading && invoices.length > 0 && (
            <span className="company-billing-count">
              {invoices.length}
              {hasMore ? "+" : ""} facture
              {invoices.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="company-billing-invoices">
          {loading ? (
            <div
              className="company-billing-loading"
              role="status"
            >
              <ClipLoader size={30} color="#56319a" />
              <p>Chargement de vos factures...</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="company-billing-empty">
              <span className="company-billing-empty-icon">
                <FiInbox />
              </span>

              <h3>Aucune facture disponible</h3>

              <p>
                Vos factures apparaîtront ici
                dès qu'un paiement aura été enregistré
                sur votre compte Stripe.
              </p>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <FiRefreshCw />
                Actualiser
              </button>
            </div>
          ) : (
            <>
              <div className="company-billing-table-scroll">
                <table className="company-billing-table">
                  <thead>
                    <tr>
                      <th>Facture</th>
                      <th>Date</th>
                      <th>Montant</th>
                      <th>Statut</th>
                      <th className="company-billing-actions-heading">
                        Documents
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {invoices.map((invoice) => {
                      const status = getInvoiceStatus(invoice);
                      const StatusIcon = status.icon;

                      return (
                        <tr key={invoice.id}>
                          <td>
                            <div className="company-billing-invoice-name">
                              <span className="company-billing-document-icon">
                                <FiFileText />
                              </span>

                              <div>
                                <strong>
                                  {getInvoiceTitle(invoice)}
                                </strong>

                                <span>
                                  {invoice.description ||
                                    "Facturation Portrélia"}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className="company-billing-date">
                              <FiCalendar />
                              {formatDate(invoice.createdAt)}
                            </span>
                          </td>

                          <td>
                            <strong className="company-billing-amount">
                              {formatMoney(
                                invoice.total,
                                invoice.currency
                              )}
                            </strong>
                          </td>

                          <td>
                            <span
                              className={`company-billing-status ${status.className}`}
                            >
                              <StatusIcon />
                              {status.label}
                            </span>
                          </td>

                          <td>
                            <div className="company-billing-actions">
                              {invoice.hostedInvoiceUrl && (
                                <button
                                  type="button"
                                  className="company-billing-action-btn"
                                  onClick={() =>
                                    openInvoiceLink(
                                      invoice.hostedInvoiceUrl
                                    )
                                  }
                                  title="Consulter la facture"
                                >
                                  <FiExternalLink />
                                  <span>Voir</span>
                                </button>
                              )}

                              {invoice.invoicePdf && (
                                <button
                                  type="button"
                                  className="company-billing-action-btn"
                                  onClick={() =>
                                    openInvoiceLink(
                                      invoice.invoicePdf
                                    )
                                  }
                                  title="Ouvrir le PDF de la facture"
                                >
                                  <FiDownload />
                                  <span>PDF</span>
                                </button>
                              )}

                              {!invoice.hostedInvoiceUrl &&
                                !invoice.invoicePdf && (
                                  <span className="company-billing-no-document">
                                    Indisponible
                                  </span>
                                )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="company-billing-mobile-list">
                {invoices.map((invoice) => {
                  const status = getInvoiceStatus(invoice);
                  const StatusIcon = status.icon;

                  return (
                    <article
                      key={invoice.id}
                      className="company-billing-mobile-invoice"
                    >
                      <div className="company-billing-mobile-invoice-top">
                        <span className="company-billing-document-icon">
                          <FiFileText />
                        </span>

                        <div>
                          <strong>
                            {getInvoiceTitle(invoice)}
                          </strong>

                          <span>
                            {formatDate(invoice.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="company-billing-mobile-invoice-details">
                        <div>
                          <span>Montant</span>
                          <strong>
                            {formatMoney(
                              invoice.total,
                              invoice.currency
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>Statut</span>
                          <span
                            className={`company-billing-status ${status.className}`}
                          >
                            <StatusIcon />
                            {status.label}
                          </span>
                        </div>
                      </div>

                      <div className="company-billing-mobile-invoice-actions">
                        {invoice.hostedInvoiceUrl && (
                          <button
                            type="button"
                            onClick={() =>
                              openInvoiceLink(
                                invoice.hostedInvoiceUrl
                              )
                            }
                          >
                            <FiExternalLink />
                            Voir la facture
                          </button>
                        )}

                        {invoice.invoicePdf && (
                          <button
                            type="button"
                            onClick={() =>
                              openInvoiceLink(
                                invoice.invoicePdf
                              )
                            }
                          >
                            <FiDownload />
                            PDF
                          </button>
                        )}

                        {!invoice.hostedInvoiceUrl &&
                          !invoice.invoicePdf && (
                            <span className="company-billing-no-document">
                              Document non disponible
                            </span>
                          )}
                      </div>
                    </article>
                  );
                })}
              </div>

              {hasMore && (
                <div className="company-billing-pagination">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={loadingMore || refreshing}
                  >
                    {loadingMore ? (
                      <>
                        <ClipLoader
                          size={15}
                          color="#56319a"
                        />
                        Chargement...
                      </>
                    ) : (
                      <>
                        Charger plus de factures
                        <FiArrowRight />
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section className="company-billing-section">
        <div className="company-billing-section-header">
          <div>
            <h2>Gestion de la facturation</h2>
            <p>
              Retrouvez les informations de votre offre
              et gérez vos moyens de paiement.
            </p>
          </div>
        </div>

        <div className="company-billing-management">
          <div className="company-billing-management-icon">
            <FiCreditCard />
          </div>

          <div className="company-billing-management-content">
            <h3>Mon abonnement et mes paiements</h3>

            <p>
              {isPremium
                ? "Consultez vos informations de facturation et gérez vos moyens de paiement dans le portail sécurisé Stripe."
                : "Consultez votre offre actuelle et les options disponibles pour votre entreprise."}
            </p>

            {isPremium && (
              <div className="company-billing-plan-details">
                <span>
                  {formatPlanPrice(
                    plan?.priceMonthly,
                    plan?.currency
                  )}{" "}
                  / mois
                </span>

                {subscription?.currentPeriodEnd && (
                  <span>
                    <FiCalendar />
                    {cancellationScheduled
                      ? "Fin d'accès"
                      : "Prochaine échéance"}{" "}
                    :{" "}
                    {formatDate(
                      subscription.currentPeriodEnd
                    )}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="company-billing-management-actions">
            {canManagePayment ? (
              <button
                type="button"
                className="company-billing-primary-btn"
                onClick={handleOpenPortal}
                disabled={portalLoading}
              >
                {portalLoading ? (
                  <>
                    <FiRefreshCw className="company-billing-spin" />
                    Ouverture...
                  </>
                ) : (
                  <>
                    Gérer mes paiements
                    <FiExternalLink />
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                className="company-billing-primary-btn"
                onClick={() =>
                  navigate("/dashboard/abonnement")
                }
              >
                Voir mon abonnement
                <FiArrowRight />
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="company-billing-footer">
        <FiShield />

        <span>
          Vos paiements et vos données bancaires sont
          traités de manière sécurisée par Stripe.
          Portrélia n'enregistre pas vos numéros de carte.
        </span>
      </div>

      <button
        type="button"
        className="company-billing-back-link"
        onClick={() =>
          navigate("/dashboard/abonnement")
        }
      >
        <FiArrowLeft />
        Retour à mon abonnement
      </button>
    </div>
  );
}

export default BillingPage;
