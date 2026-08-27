import { useState } from "react";

function WhatIfSimulation() {
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const scenarios = [
    "cloudy_day",
    "high_demand",
    "low_wind",
    "low_battery",
    "grid_outage",
  ];

  const scenarioLabels = {
    cloudy_day: "Cloudy Day",
    high_demand: "High Demand",
    low_wind: "Low Wind",
    low_battery: "Low Battery",
    grid_outage: "Grid Outage",
  };

  const runSimulation = (scenario) => {
    setSelectedScenario(scenario);
    setLoading(true);
    fetch(`http://127.0.0.1:8000/api/simulate/?scenario=${scenario}`)
      .then((response) => response.json())
      .then((data) => {
        setResult(data);
        setLoading(false);
        console.log("Simulation result:", data);
      })
      .catch((error) => {
        console.error("Error connecting to simulate endpoint:", error);
        setLoading(false);
      });
  };

  return (
    <div className="page">
      <h1>What-if Simulation</h1>
      <p className="page-subtitle">Test scenarios before applying them to the system</p>

      <div className="placeholder-box">
        <h3>🎛️ Choose a Scenario</h3>
        <div className="scenario-buttons">
          {scenarios.map((scenario) => (
            <button
              key={scenario}
              className={selectedScenario === scenario ? "scenario-btn active" : "scenario-btn"}
              onClick={() => runSimulation(scenario)}
            >
              {scenarioLabels[scenario]}
            </button>
          ))}
        </div>
      </div>

      <div className="placeholder-box">
        <h3>📈 Simulation Result</h3>

        {loading && <p>Loading simulation result...</p>}

        {!loading && !result && (
          <p>Select a scenario above to see simulated results</p>
        )}

        {!loading && result && (
          <div>
            <p style={{ color: "#94a3b8", marginBottom: "16px" }}>
              {result.description}
            </p>

            <div className="section-row">
              <div className="placeholder-box">
                <h3>📍 Baseline (Normal)</h3>
                <p>Solar: {result.baseline.solar_generation_kw} kW</p>
                <p>Wind: {result.baseline.wind_generation_kw} kW</p>
                <p>Load: {result.baseline.load_kw} kW</p>
                <p>Battery: {result.baseline.battery_soc_percent} %</p>
                <p>Grid Import: {result.baseline.grid_import_kw} kW</p>
              </div>

              <div className="placeholder-box">
                <h3>⚡ Simulated Result</h3>
                <p>Solar: {result.result.solar_generation_kw} kW</p>
                <p>Wind: {result.result.wind_generation_kw} kW</p>
                <p>Load: {result.result.load_kw} kW</p>
                <p>Battery: {result.result.battery_soc_percent} %</p>
                <p>Total Generation: {result.result.total_generation_kw} kW</p>
                <p>Net Balance: {result.result.net_balance_kw} kW</p>
                <p>
                  Status:{" "}
                  <strong
                    style={{
                      color:
                        result.result.status === "deficit" ? "#f87171" : "#4ade80",
                    }}
                  >
                    {result.result.status}
                  </strong>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WhatIfSimulation;