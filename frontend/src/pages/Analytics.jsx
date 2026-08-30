import { useState, useEffect } from "react";
import StatusCard from "../components/StatusCard";

function Analytics() {
  const [data, setData] = useState(null);
  const [baseline, setBaseline] = useState(null);
  const [baselineError, setBaselineError] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/analytics/summary/")
      .then((response) => response.json())
      .then((result) => {
        console.log("Analytics data received:", result);
        setData(result);
      })
      .catch((error) => {
        console.error("Error connecting to analytics/summary endpoint:", error);
      });

    fetch("http://127.0.0.1:8000/api/forecast/baseline/")
      .then((response) => {
        if (!response.ok) throw new Error("Server error");
        return response.json();
      })
      .then((result) => {
        console.log("Baseline comparison data received:", result);
        setBaseline(result.comparison || null);
      })
      .catch((error) => {
        console.error("Error connecting to forecast/baseline endpoint:", error);
        setBaselineError("Unable to load baseline comparison data.");
      });
  }, []);

  const showValue = (val) => (val === null || val === undefined ? "--" : val);

  const metricRow = (label, metricData) => (
    <tr>
      <td style={{ padding: "10px", color: "#e2e8f0" }}>{label}</td>
      <td style={{ padding: "10px", textAlign: "center" }}>
        {showValue(metricData?.previous_value_baseline?.mae)}
      </td>
      <td style={{ padding: "10px", textAlign: "center" }}>
        {showValue(metricData?.previous_value_baseline?.rmse)}
      </td>
      <td style={{ padding: "10px", textAlign: "center" }}>
        {showValue(metricData?.historical_average_baseline?.mae)}
      </td>
      <td style={{ padding: "10px", textAlign: "center" }}>
        {showValue(metricData?.historical_average_baseline?.rmse)}
      </td>
    </tr>
  );

  return (
    <div className="page">
      <h1>Analytics</h1>
      <p className="page-subtitle">Historical trends, cost savings and performance comparison</p>

      <div className="card-grid">
        <StatusCard title="Renewable Utilization" value={data ? showValue(data.renewable_utilization_percent) : "--"} unit="%" icon="🌱" />
        <StatusCard title="Energy Wastage" value={data ? showValue(data.energy_wastage_kwh) : "--"} unit="kWh" icon="⚡" />
        <StatusCard title="Cost Savings" value={data ? showValue(data.cost_savings_inr) : "--"} unit="₹" icon="💰" />
        <StatusCard title="CO₂ Savings" value={data ? showValue(data.co2_savings_kg) : "--"} unit="kg" icon="🌍" />
      </div>

      <div className="placeholder-box">
        <h3>⚖️ AI Model vs Simple Baselines</h3>
        <p style={{ color: "#94a3b8", marginBottom: "16px" }}>
          Lower MAE/RMSE means more accurate predictions
        </p>
        {baselineError && <p style={{ color: "#f87171" }}>{baselineError}</p>}
        {!baselineError && !baseline && <p>Loading comparison data...</p>}
        {!baselineError && baseline && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #334155" }}>
                  <th style={{ padding: "10px", textAlign: "left", color: "#94a3b8" }}>Metric</th>
                  <th style={{ padding: "10px", color: "#94a3b8" }}>Previous-Value MAE</th>
                  <th style={{ padding: "10px", color: "#94a3b8" }}>Previous-Value RMSE</th>
                  <th style={{ padding: "10px", color: "#94a3b8" }}>Historical-Avg MAE</th>
                  <th style={{ padding: "10px", color: "#94a3b8" }}>Historical-Avg RMSE</th>
                </tr>
              </thead>
              <tbody>
                {metricRow("Solar", baseline.solar)}
                {metricRow("Wind", baseline.wind)}
                {metricRow("Load", baseline.load)}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="section-row">
        <div className="placeholder-box">
          <h3>📊 Generation Trends</h3>
          <p>
            {data && data.trends
              ? JSON.stringify(data.trends)
              : "Historical solar/wind/load charts will appear here"}
          </p>
        </div>
        <div className="placeholder-box">
          <h3>⚖️ AI vs Conventional</h3>
          <p>
            {data && data.comparison
              ? JSON.stringify(data.comparison)
              : "Comparison chart will appear here"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Analytics;