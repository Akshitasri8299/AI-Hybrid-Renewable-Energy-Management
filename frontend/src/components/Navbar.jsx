import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { getUser, logout } from "../api";

function Navbar() {
  const navigate = useNavigate();
  const user = getUser();
  const [loggingOut, setLoggingOut] = useState(false);

  const links = [
    { path: "/", label: "Dashboard" },
    { path: "/forecast", label: "Forecast" },
    { path: "/energy-management", label: "Energy Management" },
    { path: "/faults-alerts", label: "Faults/Alerts" },
    { path: "/what-if-simulation", label: "What-if Simulation" },
    { path: "/analytics", label: "Analytics" },
  ];

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
              color: "#38bdf8",
              fontSize: "0.85rem",
              fontWeight: 600,
              textTransform: "capitalize",
              padding: "6px 10px",
            }}
          >
            {user.role}
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
