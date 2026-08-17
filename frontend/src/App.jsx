import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Forecast from "./pages/Forecast";
import EnergyManagement from "./pages/EnergyManagement";
import FaultsAlerts from "./pages/FaultsAlerts";
import WhatIfSimulation from "./pages/WhatIfSimulation";
import Analytics from "./pages/Analytics";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/forecast" element={<Forecast />} />
          <Route path="/energy-management" element={<EnergyManagement />} />
          <Route path="/faults-alerts" element={<FaultsAlerts />} />
          <Route path="/what-if-simulation" element={<WhatIfSimulation />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;