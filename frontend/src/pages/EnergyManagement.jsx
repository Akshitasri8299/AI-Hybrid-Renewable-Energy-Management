function EnergyManagement() {
  return (
    <div className="page">
      <h1>Energy Management</h1>
      <p className="page-subtitle">Source selection, battery scheduling and grid usage</p>

      <div className="placeholder-box">
        <h3>⚡ Energy Flow</h3>
        <p>Solar → Battery → Load → Grid flow diagram will appear here</p>
      </div>

      <div className="section-row">
        <div className="placeholder-box">
          <h3>🔋 Battery Control</h3>
          <p>Charge / discharge status and limits will appear here</p>
        </div>
        <div className="placeholder-box">
          <h3>🏭 Grid Usage</h3>
          <p>Grid fallback status will appear here</p>
        </div>
      </div>

      <div className="placeholder-box">
        <h3>🧠 Decision Log</h3>
        <p>Reasons behind each energy-management decision will appear here</p>
      </div>
    </div>
  );
}

export default EnergyManagement;