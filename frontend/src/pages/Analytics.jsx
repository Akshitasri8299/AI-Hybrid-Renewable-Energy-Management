import { useState, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import StatusCard from "../components/StatusCard";

function Analytics() {
  const [data, setData] = useState(null);
  const [baseline, setBaseline] = useState(null);
  const [baselineError, setBaselineError] = useState(null);
  const [trends, setTrends] = useState(null);
  const [trendsError, setTrendsError] = useState(null);

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

    // Fetch historical generation + load data for the trends chart
    Promise.all([
      fetch("http://127.0.0.1:8000/api/generation/").then((r) => r.json()),
      fetch("http://127.0.0.1:8000/api/load/").then((r) => r.json()),
    ])
      .then(([generationData, loadData]) => {
        console.log("Generation data received:", generationData);
        console.log("Load data received:", loadData);

        const genList = Array.isArray(generationData) ? generationData : generationData.results || [];
        const loadList = Array.isArray(loadData) ? loadData : loadData.results || [];

        // Merge generation + load by timestamp
        const loadByTimestamp = {};
        loadList.forEach((l) => {
          loadByTimestamp[l.timestamp] = l.consumption;
        });

        const merged = genList
          .map((g) => ({
            timestamp: g.timestamp,
            solar: g.solar_generation,
            wind: g.wind_generation,
            load: loadByTimestamp[g.timestamp] ?? null,
          }))
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        setTrends(merged);
      })
      .catch((error) => {
        console.error("Error connecting to generation/load endpoints:", error);
        setTrendsError("Unable to load generation trend data.");
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

  const baselineChartData = baseline
    ? [
        {
          metric: "Solar",
          "Previous-Value MAE": baseline.solar?.previous_value_baseline?.mae,
          "Historical-Avg MAE": baseline.solar?.historical_average_baseline?.mae,
        },
        {
          metric: "Wind",
          "Previous-Value MAE": baseline.wind?.previous_value_baseline?.mae,
          "Historical-Avg MAE": baseline.wind?.historical_average_baseline?.mae,
        },
        {
          metric: "Load",
          "Previous-Value MAE": baseline.load?.previous_value_baseline?.mae,
          "Historical-Avg MAE": baseline.load?.historical_average_baseline?.mae,
        },
      ]
    : [];

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
          {trendsError && <p style={{ color: "#f87171" }}>{trendsError}</p>}
          {!trendsError && !trends && <p>Loading trend data...</p>}
          {!trendsError && trends && trends.length === 0 && (
            <p>No historical generation data available yet</p>
          )}
          {!trendsError && trends && trends.length > 0 && (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="timestamp" stroke="#94a3b8" tick={false} />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }} />
                <Legend />
                <Line type="monotone" dataKey="solar" stroke="#facc15" name="Solar (kW)" dot={false} />
                <Line type="monotone" dataKey="wind" stroke="#38bdf8" name="Wind (kW)" dot={false} />
                <Line type="monotone" dataKey="load" stroke="#f87171" name="Load (kW)" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="placeholder-box">
          <h3>⚖️ AI vs Conventional</h3>
          {baselineError && <p style={{ color: "#f87171" }}>{baselineError}</p>}
          {!baselineError && !baseline && <p>Loading comparison data...</p>}
          {!baselineError && baseline && (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={baselineChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="metric" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }} />
                <Legend />
                <Bar dataKey="Previous-Value MAE" fill="#38bdf8" />
                <Bar dataKey="Historical-Avg MAE" fill="#facc15" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

export default Analytics;