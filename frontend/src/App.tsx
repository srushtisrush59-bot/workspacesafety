import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Incidents from './pages/Incidents';
import HazardReports from './pages/HazardReports';
import CorrectiveActions from './pages/CorrectiveActions';
import LiveMonitoring from './pages/LiveMonitoring';
import ZoneMap from './pages/ZoneMap';
import RiskIntelligence from './pages/RiskIntelligence';
import Analytics from './pages/Analytics';
import EmergencyCenter from './pages/EmergencyCenter';
import Cameras from './pages/Cameras';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="incidents" element={<Incidents />} />
          <Route path="hazards" element={<HazardReports />} />
          <Route path="actions" element={<CorrectiveActions />} />
          <Route path="monitoring" element={<LiveMonitoring />} />
          <Route path="zones" element={<ZoneMap />} />
          <Route path="risk" element={<RiskIntelligence />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="emergency" element={<EmergencyCenter />} />
          <Route path="cameras" element={<Cameras />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
