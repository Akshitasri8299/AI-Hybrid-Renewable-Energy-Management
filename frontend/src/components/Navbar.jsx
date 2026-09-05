import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { getUser, logout } from "../api";

const ALL_LINKS = [
  { path: "/", label: "Dashboard", roles: ["admin", "staff", "user"] },
  { path: "/forecast", label: "Forecast", roles: ["admin", "staff", "user"] },
  { path: "/energy-management", label: "Energy Management", roles: ["admin", "staff"] },
  { path: "/faults-alerts", label: "Faults/Alerts", roles: ["admin", "staff"] },
  { path: "/what-if-simulation", label: "What-if Simulation", roles: ["admin", "staff"] },
  { path: "/analytics", label: "Analytics", roles: ["admin", "staff", "user"] },
];

const ROLE_LABELS = {
  admin: "Admin",
  staff: "Operator",
  user: "Viewer",
};

const ROLE_COLORS = {
  admin: "#38bdf8",
  staff: "#4ade80",
  user: "#fbbf24",
};

function Navbar() {
  const navigate = useNavigate();
  const user = getUser();
  const [loggingOut, setLoggingOut] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const role = user?.role || "user";
  const links = ALL_LINKS.filter((link) => link.roles.includes(role));

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    setLoggingOut(false);
    navigate("/login");
  };

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

        <div className="sidebar-footer">
          {user && (
            <div
              className="role-badge"
              style={{
                color: ROLE_COLORS[role] || "#38bdf8",
                borderColor: ROLE_COLORS[role] || "#38bdf8",
              }}
            >
              <span className="role-dot" style={{ backgroundColor: ROLE_COLORS[role] || "#38bdf8" }} />
              {ROLE_LABELS[role] || role}
            </div>
          )}
          <button
            className="logout-button"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            <span aria-hidden="true">↪</span>
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </aside>
    </>
  );
}

export default Navbar;
