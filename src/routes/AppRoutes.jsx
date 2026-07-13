import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import Sidebar from '../components/layout/Sidebar';
import Login from '../pages/auth/Login';
import AdminDashboard from '../pages/dashboard/AdminDashboard';
import EmployeeDashboard from '../pages/dashboard/EmployeeDashboard';
import UsersList from '../pages/users/UsersList';
import RolesList from '../pages/roles/RolesList';
import BranchesList from '../pages/branches/BranchesList';
import ScanLocationsList from '../pages/scanLocations/ScanLocationsList';
import ScanDevicesList from '../pages/scanDevices/ScanDevicesList';
import Settings from '../pages/settings/Settings';
import CitizenRecordsList from '../pages/citizenRecords/CitizenRecordsList';
import CitizenRecordForm from '../pages/citizenRecords/CitizenRecordForm';
import CitizenRecordDetails from '../pages/citizenRecords/CitizenRecordDetails';
import CitizenRecordImages from '../pages/citizenRecords/CitizenRecordImages';
import CitizenSearch from '../pages/search/CitizenSearch';
import QrScannerPage from '../pages/scanner/QrScannerPage';
import SecureDocumentViewer from '../pages/documents/SecureDocumentViewer';
import DocumentAccessLogsList from '../pages/accessLogs/DocumentAccessLogsList';
import ReportsHub from '../pages/reports/ReportsHub';
import CitizenRecordsReport from '../pages/reports/CitizenRecordsReport';
import { BranchesReport, EmployeesReport, QrActivityReport, StorageReport, SecurityReport, DocumentAccessReport } from '../pages/reports/OtherReports';
import AuditLogsList from '../pages/auditLogs/AuditLogsList';
import BackupsList from '../pages/backups/BackupsList';
import StorageOverview from '../pages/storage/StorageOverview';
import QrTokensList from '../pages/qrTokens/QrTokensList';
import SystemActivity from '../pages/activity/SystemActivity';

function DashboardRouter() {
  const { user } = useAuth();
  const adminRoles = ['SUPER_ADMIN', 'ADMIN'];
  return adminRoles.includes(user?.role?.key) ? <AdminDashboard /> : <EmployeeDashboard />;
}

function AppLayout({ children }) {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">{children}</div>
    </div>
  );
}

export default function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AppLayout><DashboardRouter /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/users" element={
        <ProtectedRoute permission="users.view">
          <AppLayout><UsersList /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/roles" element={
        <ProtectedRoute permission="roles.view">
          <AppLayout><RolesList /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/branches" element={
        <ProtectedRoute permission="branches.view">
          <AppLayout><BranchesList /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/scan-locations" element={
        <ProtectedRoute permission="scan_locations.view">
          <AppLayout><ScanLocationsList /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/scan-devices" element={
        <ProtectedRoute permission="scan_devices.view">
          <AppLayout><ScanDevicesList /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/settings" element={
        <ProtectedRoute permission="settings.view">
          <AppLayout><Settings /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Phase 2 — Citizen Records */}
      <Route path="/citizen-records" element={
        <ProtectedRoute permission="documents.view">
          <AppLayout><CitizenRecordsList /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/citizen-records/create" element={
        <ProtectedRoute permission="documents.create">
          <AppLayout><CitizenRecordForm /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/citizen-records/:id" element={
        <ProtectedRoute permission="documents.view">
          <AppLayout><CitizenRecordDetails /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/citizen-records/:id/edit" element={
        <ProtectedRoute permission="documents.edit">
          <AppLayout><CitizenRecordForm /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/citizen-records/:id/images" element={
        <ProtectedRoute permission="documents.upload_images">
          <AppLayout><CitizenRecordImages /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Phase 2 — Search */}
      <Route path="/search" element={
        <ProtectedRoute permission="search.records">
          <AppLayout><CitizenSearch /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Phase 2 — QR Scanner */}
      <Route path="/scanner" element={
        <ProtectedRoute permission="qr.scan">
          <AppLayout><QrScannerPage /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Phase 2 — Secure Document Viewer */}
      <Route path="/secure-documents/:id" element={
        <ProtectedRoute permission="documents.view_pdf">
          <AppLayout><SecureDocumentViewer /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Phase 2 — Access Logs */}
      <Route path="/access-logs" element={
        <ProtectedRoute permission="access_logs.view">
          <AppLayout><DocumentAccessLogsList /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Phase 3 — Reports */}
      <Route path="/reports" element={
        <ProtectedRoute permission="reports.view">
          <AppLayout><ReportsHub /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/reports/citizen-records" element={
        <ProtectedRoute permission="reports.view">
          <AppLayout><CitizenRecordsReport /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/reports/document-access" element={
        <ProtectedRoute permission="reports.view">
          <AppLayout><DocumentAccessReport /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/reports/branches" element={
        <ProtectedRoute permission="reports.view">
          <AppLayout><BranchesReport /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/reports/employees" element={
        <ProtectedRoute permission="reports.view">
          <AppLayout><EmployeesReport /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/reports/qr-activity" element={
        <ProtectedRoute permission="reports.view">
          <AppLayout><QrActivityReport /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/reports/storage" element={
        <ProtectedRoute permission="reports.view">
          <AppLayout><StorageReport /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/reports/security" element={
        <ProtectedRoute permission="reports.view">
          <AppLayout><SecurityReport /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Phase 3 — Audit Logs */}
      <Route path="/audit-logs" element={
        <ProtectedRoute permission="audit_logs.view">
          <AppLayout><AuditLogsList /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Phase 3 — Backups */}
      <Route path="/backups" element={
        <ProtectedRoute permission="backup.view">
          <AppLayout><BackupsList /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Phase 3 — Storage */}
      <Route path="/storage" element={
        <ProtectedRoute permission="storage.view">
          <AppLayout><StorageOverview /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Phase 3 — QR Tokens */}
      <Route path="/qr-tokens" element={
        <ProtectedRoute permission="qr_tokens.view">
          <AppLayout><QrTokensList /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Phase 3 — System Activity */}
      <Route path="/activity" element={
        <ProtectedRoute permission="dashboard.view">
          <AppLayout><SystemActivity /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
