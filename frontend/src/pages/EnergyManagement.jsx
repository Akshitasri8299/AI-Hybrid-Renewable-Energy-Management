import { useState, useEffect } from "react";

function EnergyManagement() {
  const [flow, setFlow] = useState(null);
  const [decisionLog, setDecisionLog] = useState([]);

  const [aiDecision, setAiDecision] = useState(null);
  const [aiLoading, setAiLoading] = useState(true);
  const [aiError, setAiError] = useState(null);

  // Test Forecast Impact tool state
  const [solar, setSolar] = useState(50);
  const [wind, setWind] = useState(20);
  const [load, setLoad] = useState(45);
  const [battery, setBattery] = useState(80);
  const [f1Solar, setF1Solar] = useState(10);
  const [f1Wind, setF1Wind] = useState(15);
  const [f1Load, setF1Load] = useState(55);
  const [testResult, setTestResult] = useState(null);
  const [testLoading, setTestLoading] = useState(false);
  const [testError, setTestError] = useState(null);

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

    fetch("http://127.0.0.1:8000/api/decision/optimized/")
      .then((response) => {
        if (!response.ok) throw new Error("Server error");
        return response.json();
      })
      .then((result) => {
        console.log("Optimized AI decision received:", result);
        setAiDecision(result.decision || null);
        setAiLoading(false);
      })
      .catch((error) => {
        console.error("Error connecting to decision/optimized endpoint:", error);
        setAiError("Unable to load AI recommendation. Please check that the backend server is running.");
        setAiLoading(false);
      });
  }, []);

  const showValue = (val, unit) => (val === null || val === undefined ? "--" : `${val} ${unit}`);

  const runTest = () => {
    setTestLoading(true);
    setTestError(null);
    const params = new URLSearchParams({
      solar, wind, load, battery,
      f1_solar: f1Solar, f1_wind: f1Wind, f1_load: f1Load,
    });
    fetch(`http://127.0.0.1:8000/api/decision/optimized-test/?${params.toString()}`)
      .then((response) => {
        if (!response.ok) throw new Error("Server error");
        return response.json();
      })
      .then((result) => {
        console.log("Test optimized decision result:", result);
        setTestResult(result.decision || null);
        setTestLoading(false);
      })
      .catch((error) => {
        console.error("Error connecting to decision/optimized-test endpoint:", error);
        setTestError("Unable to run test. Please check that the backend server is running.");
        setTestLoading(false);
      });
  };

  const inputStyle = {
    width: "100%",
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #475569",
    backgroundColor: "#334155",
    color: "#e2e8f0",
  };
  const labelStyle = { color: "#94a3b8", display: "block", marginBottom: "6px", fontSize: "0.85rem" };

  return (
    <div className="page">
      <h1>Energy Management</h1>
      <p className="page-subtitle">Source selection, battery scheduling and grid usage</p>

      {/* AI Recommendation Card - now forecast-aware */}
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
                marginBottom: "12px",
              }}
            >
              <p style={{ color: "#94a3b8", marginBottom: "4px", fontSize: "0.85rem" }}>
                Reason (current data)
              </p>
              <p style={{ color: "#e2e8f0" }}>{aiDecision.reason || "No reason provided"}</p>
            </div>

            {aiDecision.optimization_note && (
              <div
                style={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #38bdf8",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  marginBottom: "12px",
                }}
              >
                <p style={{ color: "#38bdf8", marginBottom: "4px", fontSize: "0.85rem" }}>
                  🔮 Forecast Adjustment
                </p>
                <p style={{ color: "#e2e8f0" }}>{aiDecision.optimization_note}</p>
              </div>
            )}

            {aiDecision.forecast_context && (
              <div className="card-grid" style={{ marginTop: "4px" }}>
                <div>
                  <p style={{ color: "#94a3b8", marginBottom: "4px", fontSize: "0.8rem" }}>Hours Analyzed</p>
                  <p style={{ fontWeight: 600, fontSize: "0.95rem" }}>{aiDecision.forecast_context.hours_analyzed}</p>
                </div>
                <div>
                  <p style={{ color: "#94a3b8", marginBottom: "4px", fontSize: "0.8rem" }}>Upcoming Deficit Hours</p>
                  <p style={{ fontWeight: 600, fontSize: "0.95rem" }}>{aiDecision.forecast_context.upcoming_deficit_hours}</p>
                </div>
                <div>
                  <p style={{ color: "#94a3b8", marginBottom: "4px", fontSize: "0.8rem" }}>Upcoming Surplus Hours</p>
                  <p style={{ fontWeight: 600, fontSize: "0.95rem" }}>{aiDecision.forecast_context.upcoming_surplus_hours}</p>
                </div>
                <div>
                  <p style={{ color: "#94a3b8", marginBottom: "4px", fontSize: "0.8rem" }}>Max Upcoming Deficit</p>
                  <p style={{ fontWeight: 600, fontSize: "0.95rem" }}>{aiDecision.forecast_context.max_upcoming_deficit_kw} kW</p>
                </div>
                <div>
                  <p style={{ color: "#94a3b8", marginBottom: "4px", fontSize: "0.8rem" }}>Max Upcoming Surplus</p>
                  <p style={{ fontWeight: 600, fontSize: "0.95rem" }}>{aiDecision.forecast_context.max_upcoming_surplus_kw} kW</p>
                </div>
              </div>
            )}
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
          {aiDecision ? (
            <div>
              <p style={{ color: "#94a3b8", marginBottom: "4px" }}>Current Grid Action</p>
              <p style={{ fontWeight: 600, fontSize: "1.1rem", textTransform: "capitalize" }}>
                {aiDecision.grid_action || "--"}
              </p>
            </div>
          ) : (
            <p>Grid fallback status will appear here</p>
          )}
        </div>
      </div>

      {/* Test Forecast Impact tool */}
      <div className="placeholder-box">
        <h3>🔮 Test Forecast Impact</h3>
        <p style={{ color: "#94a3b8", marginBottom: "16px" }}>
          Enter current values and next hour's forecast to see how the AI's decision changes
          when it looks ahead.
        </p>

        <p style={{ color: "#94a3b8", marginBottom: "8px", fontWeight: 600 }}>Current Values</p>
        <div className="card-grid" style={{ marginBottom: "16px" }}>
          <div>
            <label style={labelStyle}>Solar (kW)</label>
            <input type="number" value={solar} onChange={(e) => setSolar(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Wind (kW)</label>
            <input type="number" value={wind} onChange={(e) => setWind(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Load (kW)</label>
            <input type="number" value={load} onChange={(e) => setLoad(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Battery SOC (%)</label>
            <input type="number" value={battery} onChange={(e) => setBattery(e.target.value)} style={inputStyle} />
          </div>
        </div>

        <p style={{ color: "#94a3b8", marginBottom: "8px", fontWeight: 600 }}>Next Hour Forecast</p>
        <div className="card-grid" style={{ marginBottom: "16px" }}>
          <div>
            <label style={labelStyle}>Forecast Solar (kW)</label>
            <input type="number" value={f1Solar} onChange={(e) => setF1Solar(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Forecast Wind (kW)</label>
            <input type="number" value={f1Wind} onChange={(e) => setF1Wind(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Forecast Load (kW)</label>
            <input type="number" value={f1Load} onChange={(e) => setF1Load(e.target.value)} style={inputStyle} />
          </div>
        </div>

        <button className="scenario-btn active" onClick={runTest} disabled={testLoading}>
          {testLoading ? "Testing..." : "Test Forecast Impact"}
        </button>

        {testError && <p style={{ color: "#f87171", marginTop: "16px" }}>{testError}</p>}

        {testResult && !testLoading && (
          <div className="section-row" style={{ marginTop: "20px" }}>
            <div className="placeholder-box">
              <h3>📍 Reason (Current Data Only)</h3>
              <p>{testResult.reason}</p>
            </div>
            <div className="placeholder-box" style={{ borderColor: "#38bdf8" }}>
              <h3 style={{ color: "#38bdf8" }}>🔮 Optimization Note (Forecast-Aware)</h3>
              <p>{testResult.optimization_note || "No adjustment needed based on forecast."}</p>
            </div>
          </div>
        )}
      </div>

      <div className="placeholder-box">
        <h3>🧠 Decision Log</h3>
        {decisionLog.length === 0 ? (
          <p>No decisions recorded yet</p>
        ) : (
          <ul style={{ maxHeight: "280px", overflowY: "auto", paddingRight: "8px" }}>
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