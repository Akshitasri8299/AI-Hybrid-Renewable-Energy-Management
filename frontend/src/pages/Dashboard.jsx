import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import StatusCard from "../components/StatusCard";
import DigitalTwin from "../components/DigitalTwin";

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [forecastPreview, setForecastPreview] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/status/live/")
      .then((response) => {
        if (!response.ok) throw new Error("Server error");
        return response.json();
      })
      .then((result) => {
        setData(result);
        setLoading(false);
        console.log("Dashboard data received:", result);
      })
      .catch((error) => {
        console.error("Error connecting to status/live endpoint:", error);
        setError("Unable to load dashboard data. Please check that the backend server is running.");
        setLoading(false);
      });

    fetch("http://127.0.0.1:8000/api/forecast/summary/")
      .then((response) => response.json())
      .then((result) => {
        setForecastPreview(result.comparison || []);
      })
      .catch((error) => {
        console.error("Error connecting to forecast/summary endpoint:", error);
      });
  }, []);

  const showValue = (val) => (val === null || val === undefined ? "--" : val);

  return (
    <div className="page">
      <h1>Dashboard</h1>
      <p className="page-subtitle">Live overview of the microgrid</p>

      {error && (
        <div className="placeholder-box" style={{ borderColor: "#f87171" }}>
          <h3 style={{ color: "#f87171" }}>⚠️ Connection Error</h3>
          <p>{error}</p>
        </div>
      )}

      {!error && loading && (
        <div className="placeholder-box">
          <p>Loading live data...</p>
        </div>
      )}

      {!error && !loading && (
        <>
          <div className="card-grid">
            <StatusCard title="Solar Generation" value={showValue(data.solar_generation_kw)} unit="kW" icon="☀️" />
            <StatusCard title="Wind Generation" value={showValue(data.wind_generation_kw)} unit="kW" icon="🌬️" />
            <StatusCard title="Load Demand" value={showValue(data.load_kw)} unit="kW" icon="🔌" />
            <StatusCard title="Battery SOC" value={showValue(data.battery?.soc_percent)} unit="%" icon="🔋" />
            <StatusCard title="Grid Status" value={data.current_decision?.grid_action || "--"} unit="" icon="🏭" />
          </div>

          <div className="placeholder-box">
            <h3>Energy Flow Visualization (Digital Twin)</h3>
            <DigitalTwin
              solar={data.solar_generation_kw}
              wind={data.wind_generation_kw}
              load={data.load_kw}
              batterySoc={data.battery?.soc_percent}
              batteryAction={data.current_decision?.battery_action}
              gridAction={data.current_decision?.grid_action}
            />
          </div>

          <div className="section-row">
            <div className="placeholder-box">
              <h3>Alerts</h3>
              {data.active_alerts && data.active_alerts.length > 0 ? (
                <ul>
                  {data.active_alerts.map((alert, index) => (
                    <li key={index} style={{ marginBottom: "6px" }}>
                      <strong style={{ textTransform: "capitalize" }}>{alert.severity}</strong>
                      {" — "}
                      {alert.type}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No alerts yet</p>
              )}
            </div>

            <div className="placeholder-box">
              <h3>Forecast Preview</h3>
              {forecastPreview && forecastPreview.length > 0 ? (
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={forecastPreview}>
                    <XAxis dataKey="timestamp" tick={false} stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }} />
                    <Line type="monotone" dataKey="predicted_solar" stroke="#facc15" name="Predicted Solar" dot={false} />
                    <Line type="monotone" dataKey="predicted_load" stroke="#f87171" name="Predicted Load" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p>Forecast chart will appear here (Week 2)</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;