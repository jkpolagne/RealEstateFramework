import { Routes, Route, Navigate } from 'react-router-dom';
import { CompareProvider } from './context/CompareContext';
import { ConsultantLinkProvider } from './context/ConsultantLinkContext';
import { PropertySeekerLayout } from './pages/property-seeker/PropertySeekerLayout';
import { BrowsePage } from './pages/property-seeker/BrowsePage';
import { ComparisonPage } from './pages/property-seeker/ComparisonPage';
import { PropertyDetailsPage } from './pages/property-seeker/PropertyDetailsPage';
import { CompanyAdminLayout } from './pages/company-admin/CompanyAdminLayout';
import { DashboardPage } from './pages/company-admin/DashboardPage';
import { ManageDevelopersPage } from './pages/company-admin/ManageDevelopersPage';
import { ManagePropertiesPage } from './pages/company-admin/ManagePropertiesPage';
import { LoanQuotationPage } from './pages/company-admin/LoanQuotationPage';
import { VisitSchedulesPage } from './pages/company-admin/VisitSchedulesPage';
import { ConsultantAccountsPage } from './pages/company-admin/ConsultantAccountsPage';
import { ConsultantLinksPage } from './pages/company-admin/ConsultantLinksPage';
import { SalesReportPage } from './pages/company-admin/SalesReportPage';
import { NotificationsPage } from './pages/company-admin/NotificationsPage';
import { SuperAdminLayout } from './pages/super-admin/SuperAdminLayout';
import { CompaniesPage } from './pages/super-admin/CompaniesPage';
import { CreateCompanyPage } from './pages/super-admin/CreateCompanyPage';
import { CreateCompanyAdminPage } from './pages/super-admin/CreateCompanyAdminPage';
import { SystemLogsPage } from './pages/super-admin/SystemLogsPage';

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
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="properties" element={<ManagePropertiesPage />} />
            <Route path="developers" element={<ManageDevelopersPage />} />
            <Route path="loan-quotation" element={<LoanQuotationPage />} />
            <Route path="visit-schedules" element={<VisitSchedulesPage />} />
            <Route path="consultant-accounts" element={<ConsultantAccountsPage />} />
            <Route path="consultant-links" element={<ConsultantLinksPage />} />
            <Route path="sales-report" element={<SalesReportPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>

          <Route path="/super-admin" element={<SuperAdminLayout />}>
            <Route index element={<Navigate to="companies" replace />} />
            <Route path="companies" element={<CompaniesPage />} />
            <Route path="create-company" element={<CreateCompanyPage />} />
            <Route path="create-company-admin" element={<CreateCompanyAdminPage />} />
            <Route path="system-logs" element={<SystemLogsPage />} />
          </Route>
        </Routes>
      </ConsultantLinkProvider>
    </CompareProvider>
  );
}

export default App;
