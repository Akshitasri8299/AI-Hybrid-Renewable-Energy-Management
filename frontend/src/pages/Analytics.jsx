import { useState, useEffect } from "react";
import StatusCard from "../components/StatusCard";

function Analytics() {
  const [data, setData] = useState(null);

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
  }, []);

  const showValue = (val) => (val === null || val === undefined ? "--" : val);

  return (
    <div className="page">
      <h1>Analytics</h1>
      <p className="page-subtitle">Historical trends, cost savings and performance comparison</p>

      <div className="card-grid">
        <StatusCard title="Renewable Utilization" value={data ? showValue(data.renewable_utilization) : "--"} unit="%" icon="🌱" />
        <StatusCard title="Energy Wastage" value={data ? showValue(data.energy_wastage) : "--"} unit="kWh" icon="⚡" />
        <StatusCard title="Cost Savings" value={data ? showValue(data.cost_savings) : "--"} unit="₹" icon="💰" />
        <StatusCard title="CO₂ Savings" value={data ? showValue(data.co2_savings) : "--"} unit="kg" icon="🌍" />
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