import { useState, useEffect } from "react";

function EnergyManagement() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/energy-management/summary/")
      .then((response) => response.json())
      .then((result) => {
        setData(result);
        console.log("Energy Management data received:", result);
      })
      .catch((error) => {
        console.error("Error connecting to energy-management/summary endpoint:", error);
      });
  }, []);

  return (
    <div className="page">
      <h1>Energy Management</h1>
      <p className="page-subtitle">Source selection, battery scheduling and grid usage</p>

      <div className="placeholder-box">
        <h3>⚡ Energy Flow</h3>
        <p>{data ? JSON.stringify(data.flow) : "Solar → Battery → Load → Grid flow diagram will appear here"}</p>
      </div>

      <div className="section-row">
        <div className="placeholder-box">
          <h3>🔋 Battery Control</h3>
          <p>{data ? JSON.stringify(data.battery) : "Charge / discharge status and limits will appear here"}</p>
        </div>
        <div className="placeholder-box">
          <h3>🏭 Grid Usage</h3>
          <p>{data ? JSON.stringify(data.grid) : "Grid fallback status will appear here"}</p>
        </div>
      </div>

      <div className="placeholder-box">
        <h3>🧠 Decision Log</h3>
        <p>{data ? JSON.stringify(data.decisions) : "Reasons behind each energy-management decision will appear here"}</p>
      </div>
    </div>
  );
}

export default EnergyManagement;