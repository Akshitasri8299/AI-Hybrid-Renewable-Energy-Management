import StatusCard from "../components/StatusCard";

function Dashboard() {
  return (
    <div className="page">
      <h1>Dashboard</h1>
      <p className="page-subtitle">Live overview of the microgrid</p>

      <div className="card-grid">
        <StatusCard title="Solar Generation" value="--" unit="kW" icon="☀️" />
        <StatusCard title="Wind Generation" value="--" unit="kW" icon="🌬️" />
        <StatusCard title="Load Demand" value="--" unit="kW" icon="🔌" />
        <StatusCard title="Battery SOC" value="--" unit="%" icon="🔋" />
        <StatusCard title="Grid Status" value="--" unit="kW" icon="🏭" />
      </div>

      <div className="section-row">
        <div className="placeholder-box">
          <h3>Energy Flow Visualization</h3>
          <p>Diagram will appear here (Week 2)</p>
        </div>
        <div className="placeholder-box">
          <h3>Alerts</h3>
          <p>No alerts yet</p>
        </div>
      </div>

      <div className="placeholder-box">
        <h3>Forecast Preview</h3>
        <p>Forecast chart will appear here (Week 2)</p>
      </div>
    </div>
  );
}

export default Dashboard;