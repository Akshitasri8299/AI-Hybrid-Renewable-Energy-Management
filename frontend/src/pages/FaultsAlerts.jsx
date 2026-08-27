import { useState, useEffect } from "react";

function FaultsAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [rawData, setRawData] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/alerts/summary/")
      .then((response) => response.json())
      .then((result) => {
        setRawData(result);
        console.log("Alerts data received:", result);

        // Handle different possible response shapes safely
        if (Array.isArray(result)) {
          setAlerts(result);
        } else if (result && Array.isArray(result.alerts)) {
          setAlerts(result.alerts);
        } else if (result && Array.isArray(result.results)) {
          setAlerts(result.results);
        } else {
          setAlerts([]); // fallback so .map never breaks
        }
      })
      .catch((error) => {
        console.error("Error connecting to alerts/summary endpoint:", error);
      });
  }, []);

  return (
    <div className="page">
      <h1>Faults / Alerts</h1>
      <p className="page-subtitle">System warnings, anomalies and fault history</p>

      <div className="placeholder-box">
        <h3>🚨 Active Alerts</h3>
        {alerts.length === 0 ? (
          <p>No active alerts right now</p>
        ) : (
          <ul>
            {alerts.map((alert, index) => (
              <li key={index}>{alert.message || JSON.stringify(alert)}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="section-row">
        <div className="placeholder-box">
          <h3>📋 Alert History</h3>
          <p>Past alerts and resolved issues will appear here</p>
        </div>
        <div className="placeholder-box">
          <h3>⚠️ Anomaly Detection</h3>
          <p>Abnormal generation/battery-degradation flags will appear here</p>
        </div>
      </div>

      {/* Temporary debug view - remove once we confirm the data shape */}
      {rawData && (
        <div className="placeholder-box">
          <h3>🔧 Raw API Response (debug)</h3>
          <p>{JSON.stringify(rawData)}</p>
        </div>
      )}
    </div>
  );
}

export default FaultsAlerts;