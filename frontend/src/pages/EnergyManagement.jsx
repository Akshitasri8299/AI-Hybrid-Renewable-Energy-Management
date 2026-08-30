import { useState, useEffect } from "react";

function EnergyManagement() {
  const [flow, setFlow] = useState(null);
  const [decisionLog, setDecisionLog] = useState([]);

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
  }, []);

  const showValue = (val, unit) => (val === null || val === undefined ? "--" : `${val} ${unit}`);

  return (
    <div className="page">
      <h1>Energy Management</h1>
      <p className="page-subtitle">Source selection, battery scheduling and grid usage</p>

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
          {decisionLog.length > 0 ? (
          <>
          <p>Current Status: <strong>{decisionLog[0].grid_action}</strong></p>
          <p style={{ color: "#94a3b8", fontSize: "0.9em" }}>{decisionLog[0].reason}</p>
          </>
          ) : (
          <p>No grid data yet</p>
          )}
        </div>
      </div>

      <div className="placeholder-box">
        <h3>🧠 Decision Log</h3>
        {decisionLog.length === 0 ? (
          <p>No decisions recorded yet</p>
        ) : (
          <ul>
            {decisionLog.map((entry, index) => (
              <li key={index} style={{ marginBottom: "12px" }}>
              <strong>{entry.source_selection}</strong> | Battery: {entry.battery_action} | Grid: {entry.grid_action}
              <br />
              <span style={{ color: "#94a3b8", fontSize: "0.9em" }}>{entry.reason}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default EnergyManagement;