import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiSun,
  FiMoon,
  FiDroplet,
  FiCheck,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

import "./ThemeSwitcher.css";

const STORAGE_KEY = "portrelia-theme";
const CHANGE_EVENT = "portrelia-theme-change";

const THEMES = [
  { id: "light", label: "Clair", hint: "Fond blanc", icon: <FiSun /> },
  { id: "dark", label: "Sombre", hint: "Fond noir, idéal le soir", icon: <FiMoon /> },
  { id: "gradient", label: "Dégradé", hint: "Violet et corail", icon: <FiDroplet /> },
];

const VALID_THEMES = new Set(THEMES.map((item) => item.id));

const SLIDE = { duration: 0.22, ease: [0.22, 1, 0.36, 1] };
const POP = { duration: 0.16, ease: [0.22, 1, 0.36, 1] };

const readTheme = () => {
  if (typeof document === "undefined") return "light";

  const current = document.documentElement.getAttribute("data-theme");
  return VALID_THEMES.has(current) ? current : "light";
};

/*
 * variant="dropdown" (par défaut) : bouton rond + petit menu (navbar desktop)
 * variant="menu"                  : ligne "Apparence ›" façon ChatGPT (menu mobile)
 * variant="icons"                 : 3 icônes côte à côte
 */
function ThemeSwitcher({ variant = "dropdown", withLabels = false }) {
  const [theme, setTheme] = useState(readTheme);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const current = THEMES.find((item) => item.id === theme) ?? THEMES[0];

  /* Applique le thème à tout le site et le mémorise */
  useEffect(() => {
    const root = document.documentElement;
    const changed = root.getAttribute("data-theme") !== theme;

    root.setAttribute("data-theme", theme);

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* stockage indisponible (navigation privée) */
    }

    if (changed) {
      window.dispatchEvent(
        new CustomEvent(CHANGE_EVENT, { detail: theme })
      );
    }
  }, [theme]);

  /* Synchronise tous les sélecteurs (desktop + mobile) */
  useEffect(() => {
    const onChange = (event) => {
      if (VALID_THEMES.has(event.detail)) setTheme(event.detail);
    };

    window.addEventListener(CHANGE_EVENT, onChange);
    return () => window.removeEventListener(CHANGE_EVENT, onChange);
  }, []);

  /* Dropdown : ferme au clic à l'extérieur ou avec Échap */
  useEffect(() => {
    if (variant !== "dropdown" || !open) return undefined;

    const onPointerDown = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [variant, open]);

  /* ---------- VERSION DESKTOP : BOUTON + PETIT MENU ---------- */

  if (variant === "dropdown") {
    return (
      <div className="theme-dropdown" ref={dropdownRef}>
        <button
          type="button"
          className={`theme-dropdown-trigger${open ? " is-open" : ""}`}
          aria-haspopup="true"
          aria-expanded={open}
          aria-label={`Apparence : ${current.label}`}
          title="Apparence"
          onClick={() => setOpen((previous) => !previous)}
        >
          {current.icon}
          <FiChevronDown className="theme-dropdown-caret" />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              className="theme-dropdown-panel"
              role="radiogroup"
              aria-label="Apparence"
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={POP}
            >
              <p className="theme-dropdown-title">Apparence</p>

              {THEMES.map((item) => {
                const active = theme === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    className={`theme-dropdown-option${active ? " is-active" : ""}`}
                    onClick={() => {
                      setTheme(item.id);
                      setOpen(false);
                    }}
                  >
                    <span className="theme-dropdown-icon">{item.icon}</span>
                    <span className="theme-dropdown-label">{item.label}</span>
                    {active && <FiCheck className="theme-dropdown-check" />}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  /* ---------- VERSION MOBILE (style ChatGPT) ---------- */

  if (variant === "menu") {
    return (
      <div className="theme-menu">
        <AnimatePresence mode="wait" initial={false}>
          {!open ? (
            <motion.button
              key="row"
              type="button"
              className="theme-menu-row"
              onClick={() => setOpen(true)}
              aria-expanded="false"
              initial={{ x: -18, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -18, opacity: 0 }}
              transition={SLIDE}
            >
              <span className="theme-menu-icon">{current.icon}</span>

              <span className="theme-menu-text">
                <strong>Apparence</strong>
                <small>{current.label}</small>
              </span>

              <FiChevronRight className="theme-menu-chevron" />
            </motion.button>
          ) : (
            <motion.div
              key="panel"
              className="theme-menu-panel"
              initial={{ x: 18, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 18, opacity: 0 }}
              transition={SLIDE}
            >
              <button
                type="button"
                className="theme-menu-back"
                onClick={() => setOpen(false)}
              >
                <FiChevronLeft />
                Apparence
              </button>

              <div
                className="theme-menu-options"
                role="radiogroup"
                aria-label="Apparence"
              >
                {THEMES.map((item) => {
                  const active = theme === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      className={`theme-menu-option${active ? " is-active" : ""}`}
                      onClick={() => setTheme(item.id)}
                    >
                      <span className="theme-menu-icon">{item.icon}</span>

                      <span className="theme-menu-text">
                        <strong>{item.label}</strong>
                        <small>{item.hint}</small>
                      </span>

                      {active && <FiCheck className="theme-menu-check" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  /* ---------- VERSION 3 ICÔNES ---------- */

  return (
    <div
      className={`theme-switcher${withLabels ? " theme-switcher--labels" : ""}`}
      role="radiogroup"
      aria-label="Thème d'affichage"
    >
      {THEMES.map((item) => (
        <button
          key={item.id}
          type="button"
          role="radio"
          aria-checked={theme === item.id}
          title={item.label}
          className={`theme-switcher-btn${
            theme === item.id ? " is-active" : ""
          }`}
          onClick={() => setTheme(item.id)}
        >
          {item.icon}
          <span className="theme-switcher-label">{item.label}</span>
        </button>
      ))}
    </div>
  );
}

export default ThemeSwitcher;