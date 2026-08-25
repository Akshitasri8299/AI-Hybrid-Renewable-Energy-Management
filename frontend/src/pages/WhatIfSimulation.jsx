import { useState } from "react";

function WhatIfSimulation() {
  const [selectedScenario, setSelectedScenario] = useState(null);

  const scenarios = [
    "Cloudy Day",
    "High Demand",
    "Low Wind",
    "Low Battery",
    "Grid Outage",
  ];

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
              onClick={() => setSelectedScenario(scenario)}
            >
              {scenario}
            </button>
          ))}
        </div>
      </div>

      <div className="placeholder-box">
        <h3>📈 Simulation Result</h3>
        <p>
          {selectedScenario
            ? `Results for "${selectedScenario}" will appear here once the simulation engine is connected`
            : "Select a scenario above to see simulated results"}
        </p>
      </div>
    </div>
  );
}

export default WhatIfSimulation;