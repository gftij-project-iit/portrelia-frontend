import {
  FiGrid,
  FiBriefcase,
  FiUsers,
  FiImage,
  FiEdit3,
  FiCreditCard,
  FiSettings,
  FiMoreHorizontal,
} from "react-icons/fi";

import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import logo from "../../assets/logo.png";
import "./AdminSidebar.css";

function AdminSidebar() {
  const { user } = useAuth();

  const initial =
    user?.firstName?.charAt(0)?.toUpperCase() || "A";

  const fullName = user?.firstName
    ? `${user.firstName} ${user.lastName || ""}`
    : "Portrélia";

  return (
    <aside className="admin-sidebar">

      {/* BRAND */}
      <div className="admin-sidebar-brand">
        <img
          src={logo}
          alt="Portrélia"
          className="admin-sidebar-logo"
        />

        <span className="admin-sidebar-brand-name">
          Portrélia
        </span>
      </div>

      {/* NAV */}
      <nav className="admin-sidebar-nav">

        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            `admin-sidebar-link ${
              isActive ? "admin-sidebar-link-active" : ""
            }`
          }
        >
          <FiGrid />
          <span>Tableau de bord</span>
        </NavLink>

        <NavLink
          to="/admin/entreprises"
          className={({ isActive }) =>
            `admin-sidebar-link ${
              isActive ? "admin-sidebar-link-active" : ""
            }`
          }
        >
          <FiBriefcase />
          <span>Entreprises</span>
        </NavLink>

        <NavLink
          to="/admin/demandes-demo"
          className={({ isActive }) =>
            `admin-sidebar-link ${
              isActive ? "admin-sidebar-link-active" : ""
            }`
          }
        >
          <FiUsers />
          <span>Demandes de démo</span>
        </NavLink>

        <NavLink
          to="/admin/campagnes"
          className={({ isActive }) =>
            `admin-sidebar-link ${
              isActive ? "admin-sidebar-link-active" : ""
            }`
          }
        >
          <FiImage />
          <span>Campagnes & QA</span>
        </NavLink>

      

        <NavLink
          to="/admin/retouches"
          className={({ isActive }) =>
            `admin-sidebar-link ${
              isActive ? "admin-sidebar-link-active" : ""
            }`
          }
        >
          <FiEdit3 />
          <span>Retouches</span>
        </NavLink>

        <NavLink
          to="/admin/livraisons"
          className={({ isActive }) =>
            `admin-sidebar-link ${
              isActive ? "admin-sidebar-link-active" : ""
            }`
          }
        >
          <FiCreditCard />
          <span>Livraisons</span>
        </NavLink>

        <NavLink
          to="/admin/parametres"
          className={({ isActive }) =>
            `admin-sidebar-link ${
              isActive ? "admin-sidebar-link-active" : ""
            }`
          }
        >
          <FiSettings />
          <span>Paramètres</span>
        </NavLink>

      </nav>

      {/* FOOTER USER */}
      <div className="admin-sidebar-footer">

        <div className="admin-sidebar-user">

          <div className="admin-sidebar-avatar">
            {initial}
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