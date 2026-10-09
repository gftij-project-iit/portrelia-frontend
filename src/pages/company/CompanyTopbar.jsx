import {
  useState,
} from "react";

import {
  FiBell,
  FiChevronDown,
  FiLogOut,
} from "react-icons/fi";

import {
  useAuth,
} from "../../context/AuthContext";

import "./CompanyTopbar.css";

function CompanyTopbar() {
  const {
    user,
    logout,
  } = useAuth();

  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);

  const fullName =
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim();

  const initial =
    user?.firstName?.charAt(0)?.toUpperCase() ||
    "?";

  return (
    <header className="company-topbar">

      <div className="company-topbar-spacer" />

      <div className="company-topbar-actions">

        <button
          type="button"
          className="company-topbar-notification"
        >
          <FiBell />
        </button>

        <div className="company-topbar-user-wrapper">

          <button
            type="button"
            className="company-topbar-user"
            onClick={() =>
              setMenuOpen(
                (previous) =>
                  !previous
              )
            }
          >
            <div className="company-topbar-avatar">
              {initial}
            </div>

            <div className="company-topbar-user-info">
              <strong>
                {fullName || "Administrateur"}
              </strong>

              <span>
                Administrateur
              </span>
            </div>

            <FiChevronDown />
          </button>

          {menuOpen && (
            <div className="company-topbar-menu">

              <button
                type="button"
                onClick={logout}
              >
                <FiLogOut />
                Se déconnecter
              </button>

            </div>
          )}

        </div>

      </div>

    </header>
  );
}

export default CompanyTopbar;