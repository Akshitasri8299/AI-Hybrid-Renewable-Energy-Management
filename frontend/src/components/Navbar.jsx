import { useState } from "react";
import { NavLink } from "react-router-dom";

const ALL_LINKS = [
  { path: "/", label: "Dashboard", roles: ["admin", "viewer"] },
  { path: "/forecast", label: "Forecast", roles: ["admin", "viewer"] },
  { path: "/energy-management", label: "Energy Management", roles: ["admin"] },
  { path: "/faults-alerts", label: "Faults/Alerts", roles: ["admin"] },
  { path: "/what-if-simulation", label: "What-if Simulation", roles: ["admin"] },
  { path: "/analytics", label: "Analytics", roles: ["admin", "viewer"] },
];

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  // Authentication is optional for this dashboard. Keep all routes visible so
  // every existing page remains reachable when no user is stored locally.
  const links = ALL_LINKS;

  return (
    <>
      <header className="mobile-header">
        <button
          className="sidebar-toggle"
          type="button"
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
        <div className="mobile-brand">
          <span className="mobile-brand-mark" aria-hidden="true">⚡</span>
          <span>Hybrid Energy Manager</span>
        </div>
      </header>

      <div
        className={`sidebar-backdrop${isOpen ? " visible" : ""}`}
        aria-hidden="true"
        onClick={() => setIsOpen(false)}
      />

      <aside className={`sidebar${isOpen ? " open" : ""}`}>
        <div className="sidebar-header">
          <div className="brand-mark" aria-hidden="true">⚡</div>
          <div>
            <div className="sidebar-title">Hybrid Energy</div>
            <div className="sidebar-caption">Manager</div>
          </div>
          <button
            className="sidebar-close"
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setIsOpen(false)}
          >
            ×
          </button>
        </div>

        <div className="sidebar-section-label">Workspace</div>
        <nav className="navbar-links" aria-label="Main navigation">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === "/"}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <span className="nav-link-icon" aria-hidden="true">
                {link.path === "/" ? "⌂" :
                  link.path === "/forecast" ? "◒" :
                    link.path === "/energy-management" ? "↯" :
                      link.path === "/faults-alerts" ? "!" :
                        link.path === "/what-if-simulation" ? "◇" : "▥"}
              </span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

      </aside>
    </>
  );
}

export default Navbar;