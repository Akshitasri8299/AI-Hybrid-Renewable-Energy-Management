import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

function Forecast() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // AI prediction tool state
  const [hour, setHour] = useState(14);
  const [temperature, setTemperature] = useState(30);
  const [cloudCover, setCloudCover] = useState(10);
  const [prediction, setPrediction] = useState(null);
  const [predictLoading, setPredictLoading] = useState(false);
  const [predictError, setPredictError] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/forecast/summary/")
      .then((response) => {
        if (!response.ok) throw new Error("Server responded with an error");
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

  const runPrediction = () => {
    setPredictLoading(true);
    setPredictError(null);
    fetch(
      `http://127.0.0.1:8000/api/forecast/predict/?hour=${hour}&temperature=${temperature}&cloud_cover=${cloudCover}`
    )
      .then((response) => {
        if (!response.ok) throw new Error("Prediction request failed");
        return response.json();
      })
      .then((result) => {
        console.log("Prediction result:", result);
        setPrediction(result);
        setPredictLoading(false);
      })
      .catch((error) => {
        console.error("Error connecting to forecast/predict endpoint:", error);
        setPredictError("Unable to get prediction. Please check that the backend server is running.");
        setPredictLoading(false);
      });
  };

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
                  <XAxis dataKey="time" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }} />
                  <Legend />
                  <Line type="monotone" dataKey="solar" stroke="#facc15" name="Solar (kW)" />
                  <Line type="monotone" dataKey="wind" stroke="#38bdf8" name="Wind (kW)" />
                  <Line type="monotone" dataKey="load" stroke="#f87171" name="Load (kW)" />
                </LineChart>
              </ResponsiveContainer>
            )}
            {!loading && !hasComparisonData && (
              <p>No forecast data available yet — chart will appear once the ML model generates predictions</p>
            )}
          </div>

          {/* AI Prediction Tool */}
          <div className="placeholder-box">
            <h3>🤖 AI Prediction Tool</h3>
            <p style={{ color: "#94a3b8", marginBottom: "16px" }}>
              Enter conditions to get a live prediction from the RandomForest model
            </p>

            <div className="card-grid" style={{ marginBottom: "16px" }}>
              <div>
                <label style={{ color: "#94a3b8", display: "block", marginBottom: "6px" }}>
                  Hour (0-23)
                </label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={hour}
                  onChange={(e) => setHour(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid #475569",
                    backgroundColor: "#334155",
                    color: "#e2e8f0",
                  }}
                />
              </div>
              <div>
                <label style={{ color: "#94a3b8", display: "block", marginBottom: "6px" }}>
                  Temperature (°C)
                </label>
                <input
                  type="number"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid #475569",
                    backgroundColor: "#334155",
                    color: "#e2e8f0",
                  }}
                />
              </div>
              <div>
                <label style={{ color: "#94a3b8", display: "block", marginBottom: "6px" }}>
                  Cloud Cover (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={cloudCover}
                  onChange={(e) => setCloudCover(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid #475569",
                    backgroundColor: "#334155",
                    color: "#e2e8f0",
                  }}
                />
              </div>
            </div>

            <button className="scenario-btn active" onClick={runPrediction} disabled={predictLoading}>
              {predictLoading ? "Predicting..." : "Predict Next Hour"}
            </button>

            {predictError && (
              <p style={{ color: "#f87171", marginTop: "16px" }}>{predictError}</p>
            )}

            {prediction && !predictLoading && (
              <div>
                <div className="card-grid" style={{ marginTop: "20px" }}>
                  <div>
                    <p style={{ color: "#94a3b8", marginBottom: "4px" }}>Predicted Solar</p>
                    <p style={{ fontWeight: 600 }}>{showValue(prediction.prediction?.predicted_solar)} kW</p>
                  </div>
                  <div>
                    <p style={{ color: "#94a3b8", marginBottom: "4px" }}>Predicted Wind</p>
                    <p style={{ fontWeight: 600 }}>{showValue(prediction.prediction?.predicted_wind)} kW</p>
                  </div>
                  <div>
                    <p style={{ color: "#94a3b8", marginBottom: "4px" }}>Predicted Load</p>
                    <p style={{ fontWeight: 600 }}>{showValue(prediction.prediction?.predicted_load)} kW</p>
                  </div>
                </div>
                <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "12px" }}>
                  Model: {prediction.model}
                </p>
              </div>
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