import { Routes, Route, Navigate } from 'react-router-dom';
import { CompareProvider } from './context/CompareContext';
import { ConsultantLinkProvider } from './context/ConsultantLinkContext';
import { PropertySeekerLayout } from './pages/property-seeker/PropertySeekerLayout';
import { BrowsePage } from './pages/property-seeker/BrowsePage';
import { ComparisonPage } from './pages/property-seeker/ComparisonPage';
import { PropertyDetailsPage } from './pages/property-seeker/PropertyDetailsPage';

import { CompanyAdminLayout } from './pages/company-admin/CompanyAdminLayout';
import { DashboardPage as CompanyAdminDashboardPage } from './pages/company-admin/DashboardPage';
import { ManageDevelopersPage } from './pages/company-admin/ManageDevelopersPage';
import { ManagePropertiesPage } from './pages/company-admin/ManagePropertiesPage';
import { LoanQuotationPage } from './pages/company-admin/LoanQuotationPage';
import { VisitSchedulesPage } from './pages/company-admin/VisitSchedulesPage';
import { ConsultantAccountsPage } from './pages/company-admin/ConsultantAccountsPage';
import { ConsultantLinksPage } from './pages/company-admin/ConsultantLinksPage';
import { SalesReportPage } from './pages/company-admin/SalesReportPage';
import { NotificationsPage as CompanyAdminNotificationsPage } from './pages/company-admin/NotificationsPage';

import { SuperAdminLayout } from './pages/super-admin/SuperAdminLayout';
import { CompaniesPage } from './pages/super-admin/CompaniesPage';
import { CreateCompanyPage } from './pages/super-admin/CreateCompanyPage';
import { CreateCompanyAdminPage } from './pages/super-admin/CreateCompanyAdminPage';
import { SystemLogsPage } from './pages/super-admin/SystemLogsPage';

import { ConsultantLayout } from './pages/consultant/ConsultantLayout';
import { DashboardPage as ConsultantDashboardPage } from './pages/consultant/DashboardPage';
import { MonitorClientsPage } from './pages/consultant/MonitorClientsPage';
import { PerformancePage } from './pages/consultant/PerformancePage';
import { ConsultantLinkPage } from './pages/consultant/ConsultantLinkPage';
import { MyCommissionPage } from './pages/consultant/MyCommissionPage';
import { SignVoucherPage } from './pages/consultant/SignVoucherPage';
import { UploadPaymentProofPage } from './pages/consultant/UploadPaymentProofPage';
import { NotificationsPage as ConsultantNotificationsPage } from './pages/consultant/NotificationsPage';
import { SendNotificationPage } from './pages/consultant/SendNotificationPage';

import { SalesPersonsPage } from './pages/sales-manager/SalesPersonsPage';
import { TopSalesPersonPage } from './pages/sales-manager/TopSalesPersonPage';

import { BrokerDashboardPage } from './pages/broker/BrokerDashboardPage';
import { ReleasableCommissionPage } from './pages/broker/ReleasableCommissionPage';
import { TeamOverviewPage } from './pages/broker/TeamOverviewPage';
import { TopAgentsPage } from './pages/broker/TopAgentsPage';
import { BrokerSalesManagersPage } from './pages/broker/BrokerSalesManagersPage';
import { CreateCommissionVoucherPage } from './pages/broker/CreateCommissionVoucherPage';
import { AllCommissionVouchersPage } from './pages/broker/AllCommissionVouchersPage';
import { ReleaseCommissionPage } from './pages/broker/ReleaseCommissionPage';

const BROKER_SESSION = { consultantId: 'consultant-jann-kevin', role: 'Broker' as const, displayName: 'Jann Kevin Belarmino' };
const SALES_MANAGER_SESSION = {
  consultantId: 'consultant-jerome-mark',
  role: 'Sales Manager' as const,
  displayName: 'Jerome Mark Abella',
};
const SALES_PERSON_SESSION = {
  consultantId: 'consultant-sean-rey',
  role: 'Sales Person' as const,
  displayName: 'Sean Rey Bonganay',
};

const SALES_MANAGER_NAV = [
  { to: 'dashboard', label: 'Dashboard' },
  { to: 'sales-persons', label: 'Sales Persons' },
  { to: 'top-sales-person', label: 'Top Sales Person' },
  { to: 'performance', label: 'Performance' },
  { to: 'send-notification', label: 'Send Notification' },
  { to: 'monitor-clients', label: 'Monitor Clients' },
  { to: 'consultant-link', label: 'Consultant Link' },
  { to: 'my-commission', label: 'My Commission' },
  { to: 'sign-voucher', label: 'Sign Voucher' },
  { to: 'upload-payment-proof', label: 'Upload Payment Proof' },
  { to: 'notifications', label: 'Notifications' },
];

const SALES_PERSON_NAV = [
  { to: 'dashboard', label: 'Dashboard' },
  { to: 'performance', label: 'Performance' },
  { to: 'send-notification', label: 'Send Notification' },
  { to: 'monitor-clients', label: 'Monitor Clients' },
  { to: 'consultant-link', label: 'Consultant Link' },
  { to: 'my-commission', label: 'My Commission' },
  { to: 'sign-voucher', label: 'Sign Voucher' },
  { to: 'upload-payment-proof', label: 'Upload Payment Proof' },
  { to: 'notifications', label: 'Notifications' },
];

const BROKER_NAV = [
  { to: 'dashboard', label: 'Dashboard' },
  { to: 'releasable-commission', label: 'Releasable Commission' },
  { to: 'team-overview', label: 'Team Overview' },
  { to: 'top-agents', label: 'Top Agents' },
  { to: 'sales-managers', label: 'Sales Managers' },
  { to: 'create-commission-voucher', label: 'Create Commission Voucher' },
  { to: 'all-commission-vouchers', label: 'All Commission Vouchers' },
  { to: 'release-commission', label: 'Release Commission' },
  { to: 'send-notification', label: 'Send Notification' },
  { to: 'notifications', label: 'Notifications' },
];

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
            <Route path="dashboard" element={<CompanyAdminDashboardPage />} />
            <Route path="properties" element={<ManagePropertiesPage />} />
            <Route path="developers" element={<ManageDevelopersPage />} />
            <Route path="loan-quotation" element={<LoanQuotationPage />} />
            <Route path="visit-schedules" element={<VisitSchedulesPage />} />
            <Route path="consultant-accounts" element={<ConsultantAccountsPage />} />
            <Route path="consultant-links" element={<ConsultantLinksPage />} />
            <Route path="sales-report" element={<SalesReportPage />} />
            <Route path="notifications" element={<CompanyAdminNotificationsPage />} />
          </Route>

          <Route path="/super-admin" element={<SuperAdminLayout />}>
            <Route index element={<Navigate to="companies" replace />} />
            <Route path="companies" element={<CompaniesPage />} />
            <Route path="create-company" element={<CreateCompanyPage />} />
            <Route path="create-company-admin" element={<CreateCompanyAdminPage />} />
            <Route path="system-logs" element={<SystemLogsPage />} />
          </Route>

          <Route
            path="/sales-manager"
            element={<ConsultantLayout session={SALES_MANAGER_SESSION} basePath="/sales-manager" navItems={SALES_MANAGER_NAV} />}
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ConsultantDashboardPage />} />
            <Route path="sales-persons" element={<SalesPersonsPage />} />
            <Route path="top-sales-person" element={<TopSalesPersonPage />} />
            <Route path="performance" element={<PerformancePage />} />
            <Route path="send-notification" element={<SendNotificationPage />} />
            <Route path="monitor-clients" element={<MonitorClientsPage />} />
            <Route path="consultant-link" element={<ConsultantLinkPage />} />
            <Route path="my-commission" element={<MyCommissionPage />} />
            <Route path="sign-voucher" element={<SignVoucherPage />} />
            <Route path="upload-payment-proof" element={<UploadPaymentProofPage />} />
            <Route path="notifications" element={<ConsultantNotificationsPage />} />
          </Route>

          <Route
            path="/sales-person"
            element={<ConsultantLayout session={SALES_PERSON_SESSION} basePath="/sales-person" navItems={SALES_PERSON_NAV} />}
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ConsultantDashboardPage />} />
            <Route path="performance" element={<PerformancePage />} />
            <Route path="send-notification" element={<SendNotificationPage />} />
            <Route path="monitor-clients" element={<MonitorClientsPage />} />
            <Route path="consultant-link" element={<ConsultantLinkPage />} />
            <Route path="my-commission" element={<MyCommissionPage />} />
            <Route path="sign-voucher" element={<SignVoucherPage />} />
            <Route path="upload-payment-proof" element={<UploadPaymentProofPage />} />
            <Route path="notifications" element={<ConsultantNotificationsPage />} />
          </Route>

          <Route path="/broker" element={<ConsultantLayout session={BROKER_SESSION} basePath="/broker" navItems={BROKER_NAV} />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<BrokerDashboardPage />} />
            <Route path="releasable-commission" element={<ReleasableCommissionPage />} />
            <Route path="team-overview" element={<TeamOverviewPage />} />
            <Route path="top-agents" element={<TopAgentsPage />} />
            <Route path="sales-managers" element={<BrokerSalesManagersPage />} />
            <Route path="create-commission-voucher" element={<CreateCommissionVoucherPage />} />
            <Route path="all-commission-vouchers" element={<AllCommissionVouchersPage />} />
            <Route path="release-commission" element={<ReleaseCommissionPage />} />
            <Route path="send-notification" element={<SendNotificationPage />} />
            <Route path="notifications" element={<ConsultantNotificationsPage />} />
          </Route>
        </Routes>
      </ConsultantLinkProvider>
    </CompareProvider>
  );
}

export default App;
