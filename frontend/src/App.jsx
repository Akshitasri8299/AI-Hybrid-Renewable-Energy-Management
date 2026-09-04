import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Forecast from "./pages/Forecast";
import EnergyManagement from "./pages/EnergyManagement";
import FaultsAlerts from "./pages/FaultsAlerts";
import WhatIfSimulation from "./pages/WhatIfSimulation";
import Analytics from "./pages/Analytics";
import Login from "./pages/Login";
import { isAuthenticated } from "./api";
import "./App.css";

function ProtectedRoute({ children }) {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
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
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
