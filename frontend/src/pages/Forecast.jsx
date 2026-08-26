function Forecast() {
  return (
    <div className="page">
      <h1>Forecast</h1>
      <p className="page-subtitle">Predicted solar, wind and load values (24–48 hours)</p>

      <div className="section-row">
        <div className="placeholder-box">
          <h3>☀️ Solar Forecast</h3>
          <p>Chart will appear here once ML model is connected</p>
        </div>
        <div className="placeholder-box">
          <h3>🌬️ Wind Forecast</h3>
          <p>Chart will appear here once ML model is connected</p>
        </div>
      </div>

      <div className="section-row">
        <div className="placeholder-box">
          <h3>🔌 Load Forecast</h3>
          <p>Chart will appear here once ML model is connected</p>
        </div>
        <div className="placeholder-box">
          <h3>📊 Forecast Accuracy</h3>
          <p>MAE / RMSE / MAPE values will appear here</p>
        </div>
      </div>
    </div>
  );
}

export default Forecast;