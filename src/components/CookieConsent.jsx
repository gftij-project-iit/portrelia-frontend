
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { FiShield, FiSettings } from "react-icons/fi";

import "./CookieConsent.css";

const STORAGE_KEY = "portrelia-analytics-consent";

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
const GOOGLE_TAG_ID = import.meta.env.VITE_GOOGLE_TAG_ID;

const VALID_GA_ID = /^G-[A-Z0-9]+$/i.test(GA_ID || "");
const VALID_TAG_ID = /^(GT|G)-[A-Z0-9]+$/i.test(
  GOOGLE_TAG_ID || ""
);

function getSavedConsent() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    return saved === "accepted" || saved === "rejected"
      ? saved
      : null;
  } catch {
    return null;
  }
}

function removeAnalyticsCookies() {
  const cookieNames = document.cookie
    .split(";")
    .map((cookie) => cookie.trim().split("=")[0])
    .filter(
      (name) =>
        name === "_ga" ||
        name.startsWith("_ga_") ||
        name === "_gid" ||
        name === "_gat"
    );

  const hostname = window.location.hostname;
  const domains = [""];
  const parts = hostname.split(".");

  for (let i = 0; i < parts.length - 1; i += 1) {
    domains.push(`.${parts.slice(i).join(".")}`);
  }

  for (const name of cookieNames) {
    for (const domain of domains) {
      document.cookie =
        `${name}=; Max-Age=0; path=/; SameSite=Lax` +
        (domain ? `; domain=${domain}` : "");
    }
  }
}

function enableAnalytics() {
  if (!VALID_GA_ID || !VALID_TAG_ID) {
    console.warn(
      "[Portrélia] Configuration Google Analytics manquante."
    );
    return;
  }

  window[`ga-disable-${GA_ID}`] = false;

  window.dataLayer = window.dataLayer || [];

  window.gtag =
    window.gtag ||
    function gtag() {
      window.dataLayer.push(arguments);
    };

  if (document.getElementById("portrelia-ga-script")) {
    return;
  }

  window.gtag("js", new Date());

  // Les pages vues sont envoyées manuellement par React Router.
  window.gtag("config", GA_ID, {
    send_page_view: false,
  });

  const script = document.createElement("script");

  script.id = "portrelia-ga-script";
  script.async = true;

  // Charge la nouvelle balise Google dédiée à Portrélia.
  script.src =
    `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
      GOOGLE_TAG_ID
    )}`;

  script.onerror = () => {
    console.error(
      "[Portrélia] Échec du chargement de Google Analytics.",
      script.src
    );
  };

  document.head.appendChild(script);
}

function disableAnalytics() {
  if (VALID_GA_ID) {
    window[`ga-disable-${GA_ID}`] = true;
  }

  removeAnalyticsCookies();
}

function getSafePagePath(pathname) {
  // Exclure les pages contenant des tokens sensibles.
  const sensitivePaths = [
    /galerie-partagee/i,
    /reset.password/i,
    /reinitialis/i,
    /activation.compte/i,
    /invitation/i,
  ];

  if (sensitivePaths.some((pattern) => pattern.test(pathname))) {
    return null;
  }

  // Remplacer les segments d'URL dynamiques sensibles.
  return pathname
    .replace(
      /\/[0-9a-f]{8}-[0-9a-f-]{27,}/gi,
      "/:id"
    )
    .replace(/\/\d+(?=\/|$)/g, "/:id");
}

export default function CookieConsent() {
  const location = useLocation();

  const [consent, setConsent] = useState(getSavedConsent);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const bannerOpen = consent === null || settingsOpen;

  useEffect(() => {
    if (consent === "accepted") {
      enableAnalytics();
    } else {
      disableAnalytics();
    }
  }, [consent]);

  useEffect(() => {
    if (
      consent !== "accepted" ||
      !VALID_GA_ID ||
      !VALID_TAG_ID
    ) {
      return;
    }

    const pagePath = getSafePagePath(location.pathname);

    if (!pagePath) {
      return;
    }

    enableAnalytics();

    window.gtag?.("event", "page_view", {
      page_title: "Portrélia",
      page_location: window.location.origin + pagePath,
      page_path: pagePath,
      send_to: GA_ID,
    });
  }, [consent, location.pathname]);

  const saveConsent = (choice) => {
    try {
      localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      // Le choix reste appliqué pendant la session.
    }

    if (choice === "rejected") {
      disableAnalytics();
    }

    setConsent(choice);
    setSettingsOpen(false);
  };

  return (
    <>
      {bannerOpen && (
        <div
          className="portrelia-cookie-banner"
          role="region"
          aria-label="Gestion des cookies"
        >
          <div className="portrelia-cookie-icon">
            <FiShield />
          </div>

          <div className="portrelia-cookie-content">
            <h2>Votre confidentialité compte</h2>

            <p>
              Portrélia utilise des cookies de mesure
              d'audience Google Analytics pour comprendre
              la fréquentation et améliorer le site.
              Vous pouvez accepter ou refuser ces cookies,
              sans conséquence sur votre accès aux services.
            </p>

            <div className="portrelia-cookie-actions">
              <button
                type="button"
                className="portrelia-cookie-refuse"
                onClick={() => saveConsent("rejected")}
              >
                Tout refuser
              </button>

              <button
                type="button"
                className="portrelia-cookie-accept"
                onClick={() => saveConsent("accepted")}
              >
                Tout accepter
              </button>
            </div>
          </div>
        </div>
      )}

      {!bannerOpen && (
        <button
          type="button"
          className="portrelia-cookie-settings"
          onClick={() => setSettingsOpen(true)}
          aria-label="Modifier mes préférences de cookies"
          title="Préférences des cookies"
        >
          <FiSettings />
        </button>
      )}
    </>
  );
}
