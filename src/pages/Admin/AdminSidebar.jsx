import { useState } from "react";

import {
  FiGrid,
  FiBriefcase,
  FiUsers,
  FiImage,
  FiLayers,
  FiMoreHorizontal,
  FiChevronsLeft,
  FiChevronsRight,
} from "react-icons/fi";

import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import logo from "../../assets/logo.png";

import "./AdminSidebar.css";

function AdminSidebar({
  collapsed,
  onToggle,
}) {
  const { user } = useAuth();

  const [previewOpen, setPreviewOpen] =
    useState(false);

  const initial =
    user?.firstName
      ?.charAt(0)
      ?.toUpperCase() || "A";

  const fullName =
    user?.firstName
      ? `${user.firstName} ${user.lastName || ""}`
      : "Portrélia";

  const getLinkClass = ({
    isActive,
  }) =>
    `admin-sidebar-link ${
      isActive
        ? "admin-sidebar-link-active"
        : ""
    }`;

  /*
   * Clic poignée :
   *
   * on ferme d'abord toute prévisualisation,
   * puis on change réellement l'état du menu.
   */
  const handleToggle = () => {
    setPreviewOpen(false);
    onToggle();
  };

  /*
   * Ouverture temporaire uniquement
   * quand on survole logo / icônes.
   */
  const handlePreviewOpen = () => {
    if (collapsed) {
      setPreviewOpen(true);
    }
  };

  /*
   * Quand la souris quitte complètement
   * la sidebar :
   *
   * si elle était seulement ouverte en preview,
   * elle se referme.
   */
  const handleMouseLeave = () => {
    setPreviewOpen(false);
  };

  const previewActive =
    collapsed && previewOpen;

  return (
    <aside
      className={`admin-sidebar ${
        collapsed
          ? "admin-sidebar-collapsed"
          : ""
      } ${
        previewActive
          ? "admin-sidebar-preview-open"
          : ""
      }`}
      onMouseLeave={handleMouseLeave}
    >
      {/* HANDLE */}

      <button
        type="button"
        className="admin-sidebar-handle"
        onClick={handleToggle}
        aria-label={
          collapsed
            ? "Ouvrir le menu"
            : "Réduire le menu"
        }
      >
        <span className="admin-sidebar-handle-line" />

        <span className="admin-sidebar-handle-icon">
          {collapsed ? (
            <FiChevronsRight />
          ) : (
            <FiChevronsLeft />
          )}
        </span>

        <span className="admin-sidebar-handle-line" />
      </button>

      {/* BRAND */}

      <div
        className="admin-sidebar-brand"
        onMouseEnter={handlePreviewOpen}
      >
        <div className="admin-sidebar-logo-container">
          <div className="admin-sidebar-logo-glow" />

          <img
            src={logo}
            alt="Portrélia"
            className="admin-sidebar-logo"
          />
        </div>

        <div className="admin-sidebar-brand-copy">
          <span className="admin-sidebar-brand-name">
            Portrélia
          </span>

          <span className="admin-sidebar-brand-subtitle">
            Administration
          </span>
        </div>
      </div>

      {/* NAV */}

      <nav className="admin-sidebar-nav">
        <NavLink
          to="/admin"
          end
          title="Tableau de bord"
          className={getLinkClass}
          onMouseEnter={handlePreviewOpen}
        >
          <span className="admin-sidebar-link-icon">
            <FiGrid />
          </span>

          <span className="admin-sidebar-link-text">
            Tableau de bord
          </span>

          <span className="admin-sidebar-active-indicator" />
        </NavLink>

        <NavLink
          to="/admin/entreprises"
          title="Entreprises"
          className={getLinkClass}
          onMouseEnter={handlePreviewOpen}
        >
          <span className="admin-sidebar-link-icon">
            <FiBriefcase />
          </span>

          <span className="admin-sidebar-link-text">
            Entreprises
          </span>

          <span className="admin-sidebar-active-indicator" />
        </NavLink>

        <NavLink
          to="/admin/demandes-demo"
          title="Demandes de démo"
          className={getLinkClass}
          onMouseEnter={handlePreviewOpen}
        >
          <span className="admin-sidebar-link-icon">
            <FiUsers />
          </span>

          <span className="admin-sidebar-link-text">
            Demandes de démo
          </span>

          <span className="admin-sidebar-active-indicator" />
        </NavLink>

        <div className="admin-sidebar-section-label">
          <span>Production</span>
        </div>

        <NavLink
          to="/admin/campagnes"
          title="Campagnes & QA"
          className={getLinkClass}
          onMouseEnter={handlePreviewOpen}
        >
          <span className="admin-sidebar-link-icon">
            <FiImage />
          </span>

          <span className="admin-sidebar-link-text">
            Campagnes & QA
          </span>

          <span className="admin-sidebar-active-indicator" />
        </NavLink>

        <NavLink
          to="/admin/galeries"
          title="Galeries"
          className={getLinkClass}
          onMouseEnter={handlePreviewOpen}
        >
          <span className="admin-sidebar-link-icon">
            <FiLayers />
          </span>

          <span className="admin-sidebar-link-text">
            Galeries
          </span>

          <span className="admin-sidebar-active-indicator" />
        </NavLink>

       

        
      </nav>

      {/* FOOTER */}

      <div
        className="admin-sidebar-footer"
        onMouseEnter={handlePreviewOpen}
      >
        <div className="admin-sidebar-user">
          <div className="admin-sidebar-avatar-wrap">
            <div className="admin-sidebar-avatar">
              {initial}
            </div>

            <span className="admin-sidebar-online-dot" />
          </div>

          <div className="admin-sidebar-user-info">
            <strong>
              {fullName}
            </strong>

            <span>
              Administrateur
            </span>
          </div>

          <button
            type="button"
            className="admin-sidebar-more"
            aria-label="Plus d'options"
          >
            <FiMoreHorizontal />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default AdminSidebar;