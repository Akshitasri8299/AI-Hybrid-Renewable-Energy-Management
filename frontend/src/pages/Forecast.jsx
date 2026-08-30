import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

function Forecast() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/forecast/summary/")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Server responded with an error");
        }
        return response.json();
      })
      .then((result) => {
        console.log("Forecast data received:", result);
        setData(result);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error connecting to forecast/summary endpoint:", error);
        setError("Unable to load forecast data. Please check that the backend server is running.");
        setLoading(false);
      });
  }, []);

  const showValue = (val) => (val === null || val === undefined ? "--" : val);
  const hasComparisonData = data && Array.isArray(data.comparison) && data.comparison.length > 0;

  return (
    <div className="page">
      <h1>Forecast</h1>
      <p className="page-subtitle">Predicted solar, wind and load values (24–48 hours)</p>

      {error && (
        <div className="placeholder-box" style={{ borderColor: "#f87171" }}>
          <h3 style={{ color: "#f87171" }}>⚠️ Connection Error</h3>
          <p>{error}</p>
        </div>
      )}

      {!error && (
        <>
          <div className="placeholder-box">
            <h3>📈 Forecast Chart</h3>
            {loading && <p>Loading forecast data...</p>}
            {!loading && hasComparisonData && (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.comparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="timestamp" stroke="#94a3b8" tickFormatter={(t) => new Date(t).getHours() + ":00"} />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }} />
                  <Legend />
                  <Line type="monotone" dataKey="predicted_solar" stroke="#facc15" name="Predicted Solar (kW)" />
                  <Line type="monotone" dataKey="actual_solar" stroke="#fbbf24" strokeDasharray="4 2" name="Actual Solar (kW)" />
                  <Line type="monotone" dataKey="predicted_load" stroke="#f87171" name="Predicted Load (kW)" />
                  <Line type="monotone" dataKey="actual_load" stroke="#fca5a5" strokeDasharray="4 2" name="Actual Load (kW)" />
                </LineChart>
              </ResponsiveContainer>
            )}
            {!loading && !hasComparisonData && (
              <p>No forecast data available yet — chart will appear once the ML model generates predictions</p>
            )}
          </div>

          <div className="placeholder-box">
            <h3>📊 Forecast Accuracy</h3>
            {loading && <p>Loading accuracy data...</p>}
            {!loading && data && (
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
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Forecast;