function DigitalTwin({ solar, wind, load, batterySoc, batteryAction, gridAction }) {
  const s = solar ?? 0;
  const w = wind ?? 0;
  const l = load ?? 0;
  const soc = batterySoc ?? 0;

  const isCharging = batteryAction === "charge";
  const isDischarging = batteryAction === "discharge";
  const isImporting = gridAction === "import";
  const isExporting = gridAction === "export";

  const fmt = (v) => (v === null || v === undefined ? "--" : v);

  // Battery fill height (battery body is 70px tall, from y=115 to y=185)
  const battFillHeight = Math.max(2, (soc / 100) * 62);
  const battFillY = 181 - battFillHeight;

  return (
    <div style={{ width: "100%" }}>
      <style>{`
        @keyframes dt-flow {
          to { stroke-dashoffset: -24; }
        }
        .dt-line {
          stroke-dasharray: 6 6;
          animation: dt-flow 1s linear infinite;
        }
        .dt-line-off {
          opacity: 0.15;
        }
      `}</style>

      <svg viewBox="0 0 760 260" width="100%" style={{ maxHeight: "260px", height: "auto" }}>
        {/* ---- Connecting lines ---- */}
        {/* Solar -> Battery */}
        <line x1="150" y1="70" x2="330" y2="145" stroke="#facc15"
          strokeWidth="2.5" className={s > 0 ? "dt-line" : "dt-line dt-line-off"} />
        {/* Wind -> Battery */}
        <line x1="150" y1="190" x2="330" y2="155" stroke="#38bdf8"
          strokeWidth="2.5" className={w > 0 ? "dt-line" : "dt-line dt-line-off"} />
        {/* Battery -> Load */}
        <line x1="420" y1="150" x2="590" y2="90" stroke="#4ade80"
          strokeWidth="2.5" className={isDischarging || s + w > 0 ? "dt-line" : "dt-line dt-line-off"} />
        {/* Battery/Load -> Grid */}
        <line x1="620" y1="110" x2="700" y2="150" stroke="#a78bfa"
          strokeWidth="2.5" className={isImporting || isExporting ? "dt-line" : "dt-line dt-line-off"} />

        {/* ---- Solar panel ---- */}
        <g transform="translate(60,40)">
          <rect x="0" y="0" width="70" height="46" rx="4" fill="#1e293b" stroke="#facc15" strokeWidth="2" />
          <line x1="0" y1="15" x2="70" y2="15" stroke="#facc15" strokeWidth="1" opacity="0.6" />
          <line x1="0" y1="31" x2="70" y2="31" stroke="#facc15" strokeWidth="1" opacity="0.6" />
          <line x1="23" y1="0" x2="23" y2="46" stroke="#facc15" strokeWidth="1" opacity="0.6" />
          <line x1="46" y1="0" x2="46" y2="46" stroke="#facc15" strokeWidth="1" opacity="0.6" />
          <text x="35" y="66" textAnchor="middle" fill="#94a3b8" fontSize="11">Solar</text>
          <text x="35" y="82" textAnchor="middle" fill="#facc15" fontSize="13" fontWeight="700">
            {fmt(s)} kW
          </text>
        </g>

        {/* ---- Wind turbine ---- */}
        <g transform="translate(85,150)">
          <line x1="0" y1="0" x2="0" y2="45" stroke="#94a3b8" strokeWidth="3" />
          <circle cx="0" cy="0" r="3.5" fill="#38bdf8" />
          <g stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round">
            <line x1="0" y1="0" x2="0" y2="-22" />
            <line x1="0" y1="0" x2="19" y2="11" />
            <line x1="0" y1="0" x2="-19" y2="11" />
          </g>
          <text x="0" y="62" textAnchor="middle" fill="#94a3b8" fontSize="11">Wind</text>
          <text x="0" y="78" textAnchor="middle" fill="#38bdf8" fontSize="13" fontWeight="700">
            {fmt(w)} kW
          </text>
        </g>

        {/* ---- Battery ---- */}
        <g transform="translate(340,90)">
          <rect x="12" y="0" width="26" height="8" rx="2" fill="#475569" />
          <rect x="0" y="8" width="50" height="70" rx="6" fill="#1e293b" stroke="#4ade80" strokeWidth="2" />
          <rect
            x="5"
            y={battFillY - 8}
            width="40"
            height={battFillHeight}
            rx="3"
            fill="#4ade80"
            opacity="0.85"
          />
          <text x="25" y="96" textAnchor="middle" fill="#94a3b8" fontSize="11">Battery</text>
          <text x="25" y="112" textAnchor="middle" fill="#4ade80" fontSize="13" fontWeight="700">
            {fmt(soc)}%
          </text>
          <text x="25" y="126" textAnchor="middle" fill="#64748b" fontSize="9" style={{ textTransform: "capitalize" }}>
            {batteryAction || "idle"}
          </text>
        </g>

        {/* ---- House / Load ---- */}
        <g transform="translate(560,50)">
          <polygon points="25,0 50,22 0,22" fill="#f87171" opacity="0.85" />
          <rect x="6" y="22" width="38" height="30" fill="#1e293b" stroke="#f87171" strokeWidth="2" />
          <rect x="20" y="34" width="10" height="18" fill="#f87171" opacity="0.6" />
          <text x="25" y="68" textAnchor="middle" fill="#94a3b8" fontSize="11">Load</text>
          <text x="25" y="84" textAnchor="middle" fill="#f87171" fontSize="13" fontWeight="700">
            {fmt(l)} kW
          </text>
        </g>

        {/* ---- Grid ---- */}
        <g transform="translate(670,110)">
          <polygon points="15,0 0,45 30,45" fill="none" stroke="#a78bfa" strokeWidth="2.5" />
          <line x1="6" y1="15" x2="24" y2="15" stroke="#a78bfa" strokeWidth="2" />
          <line x1="3" y1="28" x2="27" y2="28" stroke="#a78bfa" strokeWidth="2" />
          <text x="15" y="62" textAnchor="middle" fill="#94a3b8" fontSize="11">Grid</text>
          <text x="15" y="78" textAnchor="middle" fill="#a78bfa" fontSize="12" fontWeight="700" style={{ textTransform: "capitalize" }}>
            {gridAction || "--"}
          </text>
        </g>
      </svg>
    </div>
  );
}

export default DigitalTwin;