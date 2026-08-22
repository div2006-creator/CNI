import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { InvestigationProvider } from './context/InvestigationContext';
import { MainLayout } from './components/layout/MainLayout';

import { DashboardPage } from './pages/DashboardPage';
import { InvestigationPage } from './pages/InvestigationPage';
import { CaseDetailPage } from './pages/CaseDetailPage';
import { NetworkPage } from './pages/NetworkPage';
import { EntitiesPage } from './pages/EntitiesPage';
import { TimelinePage } from './pages/TimelinePage';
import { AlertsPage } from './pages/AlertsPage';
import { EvidencePage } from './pages/EvidencePage';
import { CopilotPage } from './pages/CopilotPage';
import { WhatIfPage } from './pages/WhatIfPage';
import { ReportsPage } from './pages/ReportsPage';
import { DataSourcesPage } from './pages/DataSourcesPage';
import { AuditPage } from './pages/AuditPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <InvestigationProvider>
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/investigations" element={<InvestigationPage />} />
            <Route path="/investigations/:id" element={<CaseDetailPage />} />
            <Route path="/network" element={<NetworkPage />} />
            <Route path="/entities" element={<EntitiesPage />} />
            <Route path="/timeline" element={<TimelinePage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/evidence" element={<EvidencePage />} />
            <Route path="/copilot" element={<CopilotPage />} />
            <Route path="/what-if" element={<WhatIfPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/data-sources" element={<DataSourcesPage />} />
            <Route path="/audit" element={<AuditPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </MainLayout>
      </Router>
    </InvestigationProvider>
  );
};

export default App;
