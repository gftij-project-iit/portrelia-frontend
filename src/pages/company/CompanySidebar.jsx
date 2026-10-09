import {
  NavLink,
} from "react-router-dom";

import {
  FiGrid,
  FiImage,
  FiUsers,
  FiCamera,
  FiPackage,
  FiCreditCard,
  FiSettings,
} from "react-icons/fi";

import {
  useAuth,
} from "../../context/AuthContext";

import logo from "../../assets/logo.png";

import "./CompanySidebar.css";

function CompanySidebar() {
  const { user } = useAuth();

  const fullName =
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim();

  const initial =
    user?.firstName?.charAt(0)?.toUpperCase() ||
    "?";

  const navItems = [
    {
      label: "Tableau de bord",
      path: "/dashboard",
      icon: <FiGrid />,
    },
    {
      label: "Campagnes",
      path: "/dashboard/campagnes",
      icon: <FiImage />,
    },
    {
      label: "Collaborateurs",
      path: "/dashboard/collaborateurs",
      icon: <FiUsers />,
    },
    {
      label: "Galerie",
      path: "/dashboard/galerie",
      icon: <FiCamera />,
    },
    {
      label: "Livraisons",
      path: "/dashboard/livraisons",
      icon: <FiPackage />,
    },
    {
      label: "Facturation",
      path: "/dashboard/facturation",
      icon: <FiCreditCard />,
    },
    {
      label: "Paramètres",
      path: "/dashboard/parametres",
      icon: <FiSettings />,
    },
  ];

  return (
    <aside className="company-sidebar">

      <div className="company-sidebar-brand">
        <img
          src={logo}
          alt="Portrélia"
        />

        <span>
          Portrélia
        </span>
      </div>

      <nav className="company-sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/dashboard"}
            className={({ isActive }) =>
              `company-sidebar-link ${
                isActive
                  ? "company-sidebar-link-active"
                  : ""
              }`
            }
          >
            {item.icon}

            <span>
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="company-sidebar-user">

        <div className="company-sidebar-avatar">
          {initial}
        </div>

        <div className="company-sidebar-user-info">
          <strong>
            {fullName || "Administrateur"}
          </strong>

          <span>
            Administrateur entreprise
          </span>
        </div>

      </div>

    </aside>
  );
}

export default CompanySidebar;