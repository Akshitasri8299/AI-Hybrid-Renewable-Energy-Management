import { useState, useEffect } from "react";

function FaultsAlerts() {
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [alertHistory, setAlertHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [anomalies, setAnomalies] = useState(null);
  const [anomalyError, setAnomalyError] = useState(null);

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

    fetch("http://127.0.0.1:8000/api/anomalies/detect/")
      .then((response) => {
        if (!response.ok) throw new Error("Server error");
        return response.json();
      })
      .then((result) => {
        console.log("Anomaly data received:", result);
        setAnomalies(result.anomalies || []);
      })
      .catch((error) => {
        console.error("Error connecting to anomalies/detect endpoint:", error);
        setAnomalyError("Unable to load anomaly detection data.");
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
              <ul style={{ maxHeight: "280px", overflowY: "auto", paddingRight: "8px" }}>
                {activeAlerts.map((alert, index) => (
                  <li key={index} style={{ marginBottom: "6px" }}>
                    <strong style={{ textTransform: "capitalize" }}>{alert.severity}</strong>
                    {" — "}
                    {alert.alert_type}
                    {" (expected "}
                    {alert.expected_value}
                    {", actual "}
                    {alert.actual_value}
                    {")"}
                  </li>
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
                <>
                  <p style={{ color: "#94a3b8", marginBottom: "10px" }}>
                    {alertHistory.length} past alerts
                  </p>
                  <ul style={{ maxHeight: "200px", overflowY: "auto", paddingRight: "8px" }}>
                    {alertHistory.map((alert, index) => (
                      <li key={index} style={{ marginBottom: "6px" }}>
                        <strong style={{ textTransform: "capitalize" }}>{alert.severity}</strong>
                        {" — "}
                        {alert.alert_type}
                        {" (expected "}
                        {alert.expected_value}
                        {", actual "}
                        {alert.actual_value}
                        {") — "}
                        <span style={{ color: "#4ade80", textTransform: "capitalize" }}>{alert.status}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
            <div className="placeholder-box">
              <h3>⚠️ Anomaly Detection</h3>
              {anomalyError && <p style={{ color: "#f87171" }}>{anomalyError}</p>}
              {!anomalyError && !anomalies && <p>Loading anomaly data...</p>}
              {!anomalyError && anomalies && anomalies.length === 0 && (
                <p>No anomalies detected — generation and load are tracking close to forecast.</p>
              )}
              {!anomalyError && anomalies && anomalies.length > 0 && (
                <div>
                  <p style={{ color: "#94a3b8", marginBottom: "10px" }}>
                    {anomalies.length} anomalies found
                  </p>
                  <ul style={{ maxHeight: "220px", overflowY: "auto", paddingRight: "8px" }}>
                    {anomalies.map((a, index) => (
                      <li key={index} style={{ marginBottom: "10px" }}>
                        <strong style={{ textTransform: "capitalize" }}>{a.severity}</strong>
                        {" — "}
                        {a.alert_type}
                        <br />
                        <span style={{ color: "#94a3b8" }}>{a.reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default FaultsAlerts;