import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

function Forecast() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/forecast/summary/")
      .then((response) => response.json())
      .then((result) => {
        console.log("Forecast data received:", result);
        setData(result);
      })
      .catch((error) => {
        console.error("Error connecting to forecast/summary endpoint:", error);
      });
  }, []);

  const showValue = (val) => (val === null || val === undefined ? "--" : val);
  const hasComparisonData = data && Array.isArray(data.comparison) && data.comparison.length > 0;

  return (
    <div className="page">
      <h1>Forecast</h1>
      <p className="page-subtitle">Predicted solar, wind and load values (24–48 hours)</p>

      <div className="placeholder-box">
        <h3>📈 Forecast Chart</h3>
        {hasComparisonData ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.comparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }} />
              <Legend />
              <Line type="monotone" dataKey="solar" stroke="#facc15" name="Solar (kW)" />
              <Line type="monotone" dataKey="wind" stroke="#38bdf8" name="Wind (kW)" />
              <Line type="monotone" dataKey="load" stroke="#f87171" name="Load (kW)" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p>No forecast data available yet — chart will appear once the ML model generates predictions</p>
        )}
      </div>

      <div className="placeholder-box">
        <h3>📊 Forecast Accuracy</h3>
        {data ? (
          <div className="card-grid">
            <div>
              <p style={{ color: "#94a3b8", marginBottom: "4px" }}>Avg Solar Error</p>
              <p style={{ fontWeight: 600 }}>{showValue(data.accuracy?.avg_solar_error)}</p>
            </div>
            <div>
              <p style={{ color: "#94a3b8", marginBottom: "4px" }}>Avg Wind Error</p>
              <p style={{ fontWeight: 600 }}>{showValue(data.accuracy?.avg_wind_error)}</p>
            </div>
            <div>
              <p style={{ color: "#94a3b8", marginBottom: "4px" }}>Avg Load Error</p>
              <p style={{ fontWeight: 600 }}>{showValue(data.accuracy?.avg_load_error)}</p>
            </div>
          </div>
        ) : (
          <p>Loading accuracy data...</p>
        )}
      </div>
    </div>
  );
}

export default Forecast;