import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api";

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  const validate = () => {
    const errs = {};
    if (!username.trim()) errs.username = "Email or username is required";
    if (!password) errs.password = "Password is required";
    else if (password.length < 1) errs.password = "Password is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setSubmitting(true);
    try {
      await login(username.trim(), password);
      navigate("/");
    } catch (err) {
      setServerError(err.message || "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const fieldStyle = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "8px",
    border: `1px solid ${errors.username || errors.password ? "#f87171" : "#475569"}`,
    backgroundColor: "#0f172a",
    color: "#e2e8f0",
    fontSize: "0.95rem",
    outline: "none",
    transition: "border-color 0.2s",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "6px",
    color: "#94a3b8",
    fontSize: "0.85rem",
    fontWeight: 500,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0f172a",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          backgroundColor: "#1e293b",
          border: "1px solid #334155",
          borderRadius: "16px",
          padding: "36px 32px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 600,
              color: "#38bdf8",
              margin: "0 0 6px 0",
            }}
          >
            ⚡ Hybrid Energy Manager
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "0.9rem", margin: 0 }}>
            Sign in to access the dashboard
          </p>
        </div>

        {serverError && (
          <div
            style={{
              backgroundColor: "rgba(248, 113, 113, 0.1)",
              border: "1px solid #f87171",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "20px",
              color: "#fca5a5",
              fontSize: "0.9rem",
            }}
          >
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "18px" }}>
            <label style={labelStyle}>Email or Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your email or username"
              style={fieldStyle}
              disabled={submitting}
              autoComplete="username"
            />
            {errors.username && (
              <p style={{ color: "#f87171", fontSize: "0.8rem", marginTop: "6px" }}>
                {errors.username}
              </p>
            )}
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={fieldStyle}
              disabled={submitting}
              autoComplete="current-password"
            />
            {errors.password && (
              <p style={{ color: "#f87171", fontSize: "0.8rem", marginTop: "6px" }}>
                {errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: submitting ? "#1e3a5f" : "#38bdf8",
              color: submitting ? "#94a3b8" : "#0f172a",
              fontSize: "0.95rem",
              fontWeight: 600,
              cursor: submitting ? "not-allowed" : "pointer",
              transition: "background-color 0.2s",
            }}
          >
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
