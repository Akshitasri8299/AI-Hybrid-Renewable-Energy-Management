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

  const role = user?.role || "user";
  const links = ALL_LINKS.filter((link) => link.roles.includes(role));

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    setLoggingOut(false);
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-title">⚡ Hybrid Energy Manager</div>
      <div className="navbar-links">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.path === "/"}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            {link.label}
          </NavLink>
        ))}
        {user && (
          <span
            style={{
              color: ROLE_COLORS[role] || "#38bdf8",
              fontSize: "0.85rem",
              fontWeight: 600,
              padding: "6px 10px",
              border: `1px solid ${ROLE_COLORS[role] || "#38bdf8"}`,
              borderRadius: "6px",
              opacity: 0.9,
            }}
          >
            {ROLE_LABELS[role] || role}
          </span>
        )}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          style={{
            background: "transparent",
            color: "#cbd5e1",
            border: "1px solid #475569",
            borderRadius: "6px",
            padding: "6px 12px",
            cursor: loggingOut ? "not-allowed" : "pointer",
            fontSize: "0.9rem",
          }}
        >
          {loggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
