import { useState } from "react";
import {
  FiBell,
  FiChevronDown,
  FiLogOut,
} from "react-icons/fi";

import { useAuth } from "../../context/AuthContext";

import "./AdminTopbar.css";

function AdminTopbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      await logout();
    } finally {
      setLogoutLoading(false);
      setMenuOpen(false);
    }
  };

  return (
    <header className="admin-topbar">
      <div className="admin-topbar-spacer" />

      <div className="admin-topbar-actions">

        {/* Notifications */}
        <button
          type="button"
          className="admin-topbar-notification"
          aria-label="Notifications"
        >
          <FiBell />
        </button>

        {/* User */}
        <div className="admin-topbar-user-wrapper">

          <button
            type="button"
            className="admin-topbar-user"
            onClick={() =>
              setMenuOpen((previous) => !previous)
            }
          >
            <div className="admin-topbar-avatar">
              {user?.firstName?.charAt(0)?.toUpperCase() || "A"}
            </div>

            <div className="admin-topbar-user-info">
              <strong>
                {user?.firstName
                  ? `${user.firstName} ${user.lastName || ""}`
                  : "Admin Portrélia"}
              </strong>

              <span>
                Administrateur
              </span>
            </div>

            <FiChevronDown
              className={`admin-topbar-chevron ${
                menuOpen ? "admin-topbar-chevron-open" : ""
              }`}
            />
          </button>

          {menuOpen && (
            <div className="admin-topbar-dropdown">

              <button
                type="button"
                className="admin-topbar-logout"
                onClick={handleLogout}
                disabled={logoutLoading}
              >
                <FiLogOut />

                <span>
                  {logoutLoading
                    ? "Déconnexion..."
                    : "Se déconnecter"}
                </span>
              </button>

            </div>
          )}

        </div>

      </div>
    </header>
  );
}

export default AdminTopbar;