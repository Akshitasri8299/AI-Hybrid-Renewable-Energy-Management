function StatusCard({ title, value, unit, icon }) {
  return (
    <div className="status-card">
      <div className="status-card-icon">{icon}</div>
      <div className="status-card-info">
        <h3>{title}</h3>
        <p>
          {value} <span className="unit">{unit}</span>
        </p>
      </div>
    </div>
  );
}

export default StatusCard;