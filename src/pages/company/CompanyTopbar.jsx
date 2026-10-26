import { useEffect, useRef, useState } from "react";
import { FiBell, FiChevronDown, FiLogOut } from "react-icons/fi";

import { useAuth } from "../../context/AuthContext";
import ThemeSwitcher from "../../theme/ThemeSwitcher";

import "./CompanyTopbar.css";

function CompanyTopbar() {
  const { user, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const fullName =
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim();

  const initial =
    user?.firstName?.charAt(0)?.toUpperCase() || "?";

  /* Menu utilisateur : ferme au clic à l'extérieur ou avec Échap */
  useEffect(() => {
    if (!menuOpen) return undefined;

    const onPointerDown = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <header className="company-topbar">
      <div className="company-topbar-spacer" />

      <div className="company-topbar-actions">
        {/* Sélecteur de thème : Clair / Sombre / Dégradé */}
        <ThemeSwitcher />

        <button
          type="button"
          className="company-topbar-notification"
          aria-label="Notifications"
          title="Notifications"
        >
          <FiBell />
        </button>

        <div className="company-topbar-user-wrapper" ref={userMenuRef}>
          <button
            type="button"
            className={`company-topbar-user${menuOpen ? " is-open" : ""}`}
            aria-haspopup="true"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((previous) => !previous)}
          >
            <div className="company-topbar-avatar">{initial}</div>

            <div className="company-topbar-user-info">
              <strong>{fullName || "Administrateur"}</strong>
              <span>Administrateur</span>
            </div>

            <FiChevronDown className="company-topbar-caret" />
          </button>

          {menuOpen && (
            <div className="company-topbar-menu" role="menu">
              <button type="button" role="menuitem" onClick={logout}>
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