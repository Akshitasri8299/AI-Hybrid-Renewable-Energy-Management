import { NavLink } from "react-router-dom";

function Navbar() {
  const links = [
    { path: "/", label: "Dashboard" },
    { path: "/forecast", label: "Forecast" },
    { path: "/energy-management", label: "Energy Management" },
    { path: "/faults-alerts", label: "Faults/Alerts" },
    { path: "/what-if-simulation", label: "What-if Simulation" },
    { path: "/analytics", label: "Analytics" },
  ];

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
      </div>
    </nav>
  );
}

export default Navbar;