/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import AuditSprint from './pages/AuditSprint';
import EvidenceDashboard from './pages/EvidenceDashboard';
import PilotJourney from './pages/PilotJourney';
import ReadinessQualifier from './pages/ReadinessQualifier';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/audit-sprint" element={<AuditSprint />} />
          <Route path="/evidence-dashboard" element={<EvidenceDashboard />} />
          <Route path="/pilot-journey" element={<PilotJourney />} />
          <Route path="/readiness-qualifier" element={<ReadinessQualifier />} />
          <Route path="/get-started" element={<ReadinessQualifier />} />
        </Routes>
      </Layout>
    </Router>
  );
}

