import StatusCard from "../components/StatusCard";

function Analytics() {
  return (
    <div className="page">
      <h1>Analytics</h1>
      <p className="page-subtitle">Historical trends, cost savings and performance comparison</p>

      <div className="card-grid">
        <StatusCard title="Renewable Utilization" value="--" unit="%" icon="🌱" />
        <StatusCard title="Energy Wastage" value="--" unit="kWh" icon="⚡" />
        <StatusCard title="Cost Savings" value="--" unit="₹" icon="💰" />
        <StatusCard title="CO₂ Savings" value="--" unit="kg" icon="🌍" />
      </div>

      <div className="section-row">
        <div className="placeholder-box">
          <h3>📊 Generation Trends</h3>
          <p>Historical solar/wind/load charts will appear here</p>
        </div>
        <div className="placeholder-box">
          <h3>⚖️ AI vs Conventional</h3>
          <p>Comparison chart will appear here</p>
        </div>
      </div>
    </div>
  );
}

export default Analytics;