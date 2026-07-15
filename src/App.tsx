import { Routes, Route, Navigate } from 'react-router-dom';
import { CompareProvider } from './context/CompareContext';
import { ConsultantLinkProvider } from './context/ConsultantLinkContext';
import { PropertySeekerLayout } from './pages/property-seeker/PropertySeekerLayout';
import { BrowsePage } from './pages/property-seeker/BrowsePage';
import { ComparisonPage } from './pages/property-seeker/ComparisonPage';
import { PropertyDetailsPage } from './pages/property-seeker/PropertyDetailsPage';
import { CompanyAdminLayout } from './pages/company-admin/CompanyAdminLayout';
import { ManageDevelopersPage } from './pages/company-admin/ManageDevelopersPage';
import { ManagePropertiesPage } from './pages/company-admin/ManagePropertiesPage';
import { LoanQuotationPage } from './pages/company-admin/LoanQuotationPage';
import { ComingSoonPage } from './pages/company-admin/ComingSoonPage';

function App() {
  return (
    <CompareProvider>
      <ConsultantLinkProvider>
        <Routes>
          <Route element={<PropertySeekerLayout />}>
            <Route path="/" element={<BrowsePage />} />
            <Route path="/compare" element={<ComparisonPage />} />
            <Route path="/property/:id" element={<PropertyDetailsPage />} />
          </Route>

          <Route path="/company-admin" element={<CompanyAdminLayout />}>
            <Route index element={<Navigate to="developers" replace />} />
            <Route path="dashboard" element={<ComingSoonPage title="Dashboard" />} />
            <Route path="properties" element={<ManagePropertiesPage />} />
            <Route path="developers" element={<ManageDevelopersPage />} />
            <Route path="loan-quotation" element={<LoanQuotationPage />} />
            <Route path="visit-schedules" element={<ComingSoonPage title="Visit Schedules" />} />
            <Route path="consultant-accounts" element={<ComingSoonPage title="Consultant Accounts" />} />
            <Route path="consultant-links" element={<ComingSoonPage title="Consultant Links" />} />
            <Route path="sales-report" element={<ComingSoonPage title="Sales Report" />} />
            <Route path="notifications" element={<ComingSoonPage title="Notifications" />} />
          </Route>
        </Routes>
      </ConsultantLinkProvider>
    </CompareProvider>
  );
}

export default App;
