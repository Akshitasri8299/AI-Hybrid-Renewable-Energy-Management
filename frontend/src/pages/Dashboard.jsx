import { useState, useEffect } from "react";
import StatusCard from "../components/StatusCard";

function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Fetching live data from Jyoti's status/live endpoint
    fetch("http://127.0.0.1:8000/api/status/live/")
      .then((response) => response.json())
      .then((result) => {
        setData(result);
        console.log("Dashboard data received:", result);
      })
      .catch((error) => {
        console.error("Error connecting to status/live endpoint:", error);
      });
  }, []);

  return (
    <div className="page">
      <h1>Dashboard</h1>
      <p className="page-subtitle">Live overview of the microgrid</p>

      <div className="card-grid">
        <StatusCard title="Solar Generation" value={data ? data.solar_generation_kw : "--"} unit="kW" icon="☀️" />
        <StatusCard title="Wind Generation" value={data ? data.wind_generation_kw : "--"} unit="kW" icon="🌬️" />
        <StatusCard title="Load Demand" value={data ? data.load_kw : "--"} unit="kW" icon="🔌" />
        <StatusCard title="Battery SOC" value={data && data.battery ? data.battery.soc_percent : "--"} unit="%" icon="🔋" />
        <StatusCard title="Grid Status" value={data && data.current_decision ? data.current_decision.grid_action : "--"} unit="" icon="🏭" />
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