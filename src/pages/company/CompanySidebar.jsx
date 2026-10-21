
import { useState } from "react";

import { NavLink } from "react-router-dom";

import {
  FiGrid,
  FiImage,
  FiUsers,
  FiCamera,
  FiCreditCard,
  FiSettings,
  FiZap,
  FiChevronsLeft,
  FiChevronsRight,
} from "react-icons/fi";

import { useAuth } from "../../context/AuthContext";

import logo from "../../assets/logo.png";

import "./CompanySidebar.css";

/* =========================================================
   NAVIGATION
========================================================= */

const navItems = [
  {
    label: "Tableau de bord",
    path: "/dashboard",
    icon: FiGrid,
    end: true,
  },
  {
    label: "Campagnes",
    path: "/dashboard/campagnes",
    icon: FiImage,
  },
  {
    label: "Collaborateurs",
    path: "/dashboard/collaborateurs",
    icon: FiUsers,
  },
  {
    label: "Galerie",
    path: "/dashboard/galerie",
    icon: FiCamera,
  },
  {
    label: "Abonnement",
    path: "/dashboard/abonnement",
    icon: FiZap,
  },
  {
    label: "Facturation",
    path: "/dashboard/facturation",
    icon: FiCreditCard,
  },
  {
    label: "Paramètres",
    path: "/dashboard/parametres",
    icon: FiSettings,
  },
];

/* =========================================================
   COMPONENT
========================================================= */

function CompanySidebar({
  collapsed = false,
  onToggle = () => {},
}) {
  const { user } = useAuth();

  const [previewOpen, setPreviewOpen] = useState(false);

  const initial =
    user?.firstName
      ?.charAt(0)
      ?.toUpperCase() || "E";

  const fullName =
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
    "Entreprise";

  /* =========================================================
     TOGGLE
  ========================================================= */

  const handleToggle = () => {
    setPreviewOpen(false);
    onToggle();
  };

  /* =========================================================
     TEMPORARY PREVIEW
  ========================================================= */

  const handlePreviewOpen = () => {
    if (collapsed) {
      setPreviewOpen(true);
    }
  };

  const handleMouseLeave = () => {
    setPreviewOpen(false);
  };

  const handleFocus = () => {
    if (collapsed) {
      setPreviewOpen(true);
    }
  };

  const handleBlur = (event) => {
    if (
      !event.currentTarget.contains(
        event.relatedTarget
      )
    ) {
      setPreviewOpen(false);
    }
  };

  const previewActive =
    collapsed && previewOpen;

  const getLinkClass = ({ isActive }) =>
    `company-sidebar-link ${
      isActive
        ? "company-sidebar-link-active"
        : ""
    }`;

  return (
    <aside
      className={`company-sidebar ${
        collapsed
          ? "company-sidebar-collapsed"
          : ""
      } ${
        previewActive
          ? "company-sidebar-preview-open"
          : ""
      }`}
      onMouseLeave={handleMouseLeave}
      onBlur={handleBlur}
      aria-label="Navigation entreprise"
    >
      {/* =====================================================
          HANDLE
      ===================================================== */}

      <button
        type="button"
        className="company-sidebar-handle"
        onClick={handleToggle}
        aria-label={
          collapsed
            ? "Déplier le menu"
            : "Réduire le menu"
        }
        aria-expanded={!collapsed}
        title={
          collapsed
            ? "Déplier le menu"
            : "Réduire le menu"
        }
      >
        <span className="company-sidebar-handle-line" />

        <span className="company-sidebar-handle-icon">
          {collapsed ? (
            <FiChevronsRight />
          ) : (
            <FiChevronsLeft />
          )}
        </span>

        <span className="company-sidebar-handle-line" />
      </button>

      {/* =====================================================
          BRAND
      ===================================================== */}

      <div
        className="company-sidebar-brand"
        onMouseEnter={handlePreviewOpen}
      >
        <div className="company-sidebar-logo-container">
          <div className="company-sidebar-logo-glow" />

          <img
            src={logo}
            alt="Portrélia"
            className="company-sidebar-logo"
          />
        </div>

        <div className="company-sidebar-brand-copy">
          <span className="company-sidebar-brand-name">
            Portrélia
          </span>

          <span className="company-sidebar-brand-subtitle">
            Espace entreprise
          </span>
        </div>
      </div>

      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <nav
        className="company-sidebar-nav"
        aria-label="Pages entreprise"
      >
        {navItems.map((item) => {
          const IconComponent = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end === true}
              title={item.label}
              className={getLinkClass}
              onMouseEnter={handlePreviewOpen}
              onFocus={handleFocus}
            >
              <span className="company-sidebar-link-icon">
                <IconComponent />
              </span>

              <span className="company-sidebar-link-text">
                {item.label}
              </span>

              <span
                className="company-sidebar-active-indicator"
                aria-hidden="true"
              />
            </NavLink>
          );
        })}
      </nav>

      {/* =====================================================
          FOOTER USER
      ===================================================== */}

      <div
        className="company-sidebar-footer"
        onMouseEnter={handlePreviewOpen}
      >
        <div className="company-sidebar-user">
          <div className="company-sidebar-avatar-wrap">
            <div className="company-sidebar-avatar">
              {initial}
            </div>

            <span
              className="company-sidebar-online-dot"
              aria-hidden="true"
            />
          </div>

          <div className="company-sidebar-user-info">
            <strong title={fullName}>
              {fullName}
            </strong>

            <span>
              Administrateur entreprise
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default CompanySidebar;
