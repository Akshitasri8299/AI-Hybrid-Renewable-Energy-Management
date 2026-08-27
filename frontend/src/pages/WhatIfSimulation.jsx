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
        {!loading && result && <p>{JSON.stringify(result)}</p>}
        {!loading && !result && <p>Select a scenario above to see simulated results</p>}
      </div>
    </div>
  );
}

export default WhatIfSimulation;