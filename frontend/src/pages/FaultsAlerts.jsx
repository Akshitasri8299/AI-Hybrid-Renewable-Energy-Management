import { useState, useEffect } from "react";

function FaultsAlerts() {
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [alertHistory, setAlertHistory] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/alerts/summary/")
      .then((response) => response.json())
      .then((result) => {
        console.log("Alerts data received:", result);
        setActiveAlerts(result.active_alerts || []);
        setAlertHistory(result.alert_history || []);
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
        {activeAlerts.length === 0 ? (
          <p>No active alerts right now</p>
        ) : (
          <ul>
            {activeAlerts.map((alert, index) => (
              <li key={index}>
                 <strong>{alert.alert_type}</strong> — {alert.severity} severity
                 {alert.actual_value !== null && ` (value: ${alert.actual_value})`}
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
            <ul>
              {alertHistory.map((alert, index) => (
              <li key={index}>
                 <strong>{alert.alert_type}</strong> — {alert.severity} severity
                 {alert.actual_value !== null && ` (value: ${alert.actual_value})`}
              </li>
              ))}
            </ul>
          )}
        </div>
        <div className="placeholder-box">
          <h3>⚠️ Anomaly Detection</h3>
          <p>Abnormal generation/battery-degradation flags will appear here</p>
        </div>
      </div>
    </div>
  );
}

export default FaultsAlerts;