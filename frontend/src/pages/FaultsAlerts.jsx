import { useState, useEffect } from "react";

function FaultsAlerts() {
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [alertHistory, setAlertHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/alerts/summary/")
      .then((response) => {
        if (!response.ok) throw new Error("Server error");
        return response.json();
      })
      .then((result) => {
        console.log("Alerts data received:", result);
        setActiveAlerts(result.active_alerts || []);
        setAlertHistory(result.alert_history || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error connecting to alerts/summary endpoint:", error);
        setError("Unable to load alerts data. Please check that the backend server is running.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="page">
      <h1>Faults / Alerts</h1>
      <p className="page-subtitle">System warnings, anomalies and fault history</p>

      {error && (
        <div className="placeholder-box" style={{ borderColor: "#f87171" }}>
          <h3 style={{ color: "#f87171" }}>⚠️ Connection Error</h3>
          <p>{error}</p>
        </div>
      )}

      {!error && loading && (
        <div className="placeholder-box">
          <p>Loading alerts data...</p>
        </div>
      )}

      {!error && !loading && (
        <>
          <div className="placeholder-box">
            <h3>🚨 Active Alerts</h3>
            {activeAlerts.length === 0 ? (
              <p>No active alerts right now</p>
            ) : (
              <ul>
                {activeAlerts.map((alert, index) => (
                  <li key={index}>{alert.message || JSON.stringify(alert)}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="section-row">
            <div className="placeholder-box">
              <h3>📋 Alert History</h3>
              {alertHistory.length === 0 ? (
                <p>No past alerts recorded yet</p>
              ) : (
                <ul>
                  {alertHistory.map((alert, index) => (
                    <li key={index}>{alert.message || JSON.stringify(alert)}</li>
                  ))}
                </ul>
              )}
            </div>
            <div className="placeholder-box">
              <h3>⚠️ Anomaly Detection</h3>
              <p>Abnormal generation/battery-degradation flags will appear here</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default FaultsAlerts;