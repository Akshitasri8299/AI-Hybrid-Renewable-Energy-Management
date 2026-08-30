import { useState, useEffect } from "react";

function EnergyManagement() {
  const [flow, setFlow] = useState(null);
  const [decisionLog, setDecisionLog] = useState([]);
  const [aiDecision, setAiDecision] = useState(null);
  const [aiLoading, setAiLoading] = useState(true);
  const [aiError, setAiError] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/energy-management/summary/")
      .then((response) => response.json())
      .then((result) => {
        console.log("Energy Management data received:", result);
        setFlow(result.current_flow || null);
        setDecisionLog(result.decision_log || []);
      })
      .catch((error) => {
        console.error("Error connecting to energy-management/summary endpoint:", error);
      });

    fetch("http://127.0.0.1:8000/api/decision/live/")
      .then((response) => {
        if (!response.ok) throw new Error("Server error");
        return response.json();
      })
      .then((result) => {
        console.log("AI decision received:", result);
        setAiDecision(result.decision || null);
        setAiLoading(false);
      })
      .catch((error) => {
        console.error("Error connecting to decision/live endpoint:", error);
        setAiError("Unable to load AI recommendation. Please check that the backend server is running.");
        setAiLoading(false);
      });
  }, []);

  const showValue = (val, unit) => (val === null || val === undefined ? "--" : `${val} ${unit}`);

  return (
    <div className="page">
      <h1>Energy Management</h1>
      <p className="page-subtitle">Source selection, battery scheduling and grid usage</p>

      {/* AI Recommendation Card */}
      <div className="placeholder-box" style={{ borderColor: "#38bdf8" }}>
        <h3>🤖 Current AI Recommendation</h3>
        {aiLoading && <p>Loading AI recommendation...</p>}
        {aiError && <p style={{ color: "#f87171" }}>{aiError}</p>}
        {!aiLoading && !aiError && aiDecision && (
          <div>
            <div className="card-grid" style={{ marginBottom: "16px" }}>
              <div>
                <p style={{ color: "#94a3b8", marginBottom: "4px" }}>Source Selection</p>
                <p style={{ fontWeight: 600 }}>{aiDecision.source_selection || "--"}</p>
              </div>
              <div>
                <p style={{ color: "#94a3b8", marginBottom: "4px" }}>Battery Action</p>
                <p style={{ fontWeight: 600 }}>{aiDecision.battery_action || "--"}</p>
              </div>
              <div>
                <p style={{ color: "#94a3b8", marginBottom: "4px" }}>Grid Action</p>
                <p style={{ fontWeight: 600 }}>{aiDecision.grid_action || "--"}</p>
              </div>
            </div>
            <div
              style={{
                backgroundColor: "#0f172a",
                border: "1px solid #334155",
                borderRadius: "8px",
                padding: "12px 16px",
              }}
            >
              <p style={{ color: "#94a3b8", marginBottom: "4px", fontSize: "0.85rem" }}>Reason</p>
              <p style={{ color: "#e2e8f0" }}>{aiDecision.reason || "No reason provided"}</p>
            </div>
          </div>
        )}
      </div>

      <div className="placeholder-box">
        <h3>⚡ Energy Flow</h3>
        {flow ? (
          <div className="card-grid">
            <div>
              <p style={{ color: "#94a3b8", marginBottom: "4px" }}>Solar</p>
              <p style={{ fontWeight: 600 }}>{showValue(flow.solar_generation_kw, "kW")}</p>
            </div>
            <div>
              <p style={{ color: "#94a3b8", marginBottom: "4px" }}>Wind</p>
              <p style={{ fontWeight: 600 }}>{showValue(flow.wind_generation_kw, "kW")}</p>
            </div>
            <div>
              <p style={{ color: "#94a3b8", marginBottom: "4px" }}>Load</p>
              <p style={{ fontWeight: 600 }}>{showValue(flow.load_kw, "kW")}</p>
            </div>
            <div>
              <p style={{ color: "#94a3b8", marginBottom: "4px" }}>Battery SOC</p>
              <p style={{ fontWeight: 600 }}>{showValue(flow.battery_soc_percent, "%")}</p>
            </div>
          </div>
        ) : (
          <p>Loading energy flow data...</p>
        )}
      </div>

      <div className="section-row">
        <div className="placeholder-box">
          <h3>🔋 Battery Control</h3>
          <p>Charge Rate: {flow ? showValue(flow.battery_charge_kw, "kW") : "--"}</p>
          <p>State of Charge: {flow ? showValue(flow.battery_soc_percent, "%") : "--"}</p>
        </div>
        <div className="placeholder-box">
          <h3>🏭 Grid Usage</h3>
          <p>Grid fallback status will appear here</p>
        </div>
      </div>

      <div className="placeholder-box">
        <h3>🧠 Decision Log</h3>
        {decisionLog.length === 0 ? (
          <p>No decisions recorded yet</p>
        ) : (
          <ul>
            {decisionLog.map((entry, index) => (
              <li key={index} style={{ marginBottom: "10px" }}>
                <strong style={{ textTransform: "capitalize" }}>{entry.source_selection}</strong>
                {" — battery: "}
                {entry.battery_action}
                {", grid: "}
                {entry.grid_action}
                <br />
                <span style={{ color: "#94a3b8" }}>{entry.reason}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default EnergyManagement;