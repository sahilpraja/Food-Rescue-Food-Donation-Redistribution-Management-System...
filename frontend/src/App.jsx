import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import MobileBottomNav from './components/MobileBottomNav';
import Toast from './components/Toast';

// Public Pages
import LandingPage from './pages/LandingPage';
import HowItWorksPage from './pages/HowItWorksPage';
import ImpactPage from './pages/ImpactPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import AuthLoginPage from './pages/AuthLoginPage';
import AuthRegisterPage from './pages/AuthRegisterPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Donor Pages
import DonorDashboard from './pages/donor/DonorDashboard';
import CreateListingPage from './pages/donor/CreateListingPage';
import EditListingPage from './pages/donor/EditListingPage';
import MyListingsPage from './pages/donor/MyListingsPage';
import ListingDetailPage from './pages/donor/ListingDetailPage';

// NGO Pages
import DiscoverPage from './pages/ngo/DiscoverPage';
import NgoListingDetailPage from './pages/ngo/NgoListingDetailPage';
import MyClaimsPage from './pages/ngo/MyClaimsPage';

// Volunteer Pages
import VolunteerTasksPage from './pages/volunteer/VolunteerTasksPage';
import TaskDeliveryPage from './pages/volunteer/TaskDeliveryPage';

// Admin Pages
import AdminOverviewPage from './pages/admin/AdminOverviewPage';
import VerificationsQueuePage from './pages/admin/VerificationsQueuePage';
import ReportsModerationPage from './pages/admin/ReportsModerationPage';
import PlatformSettingsPage from './pages/admin/PlatformSettingsPage';
import AuditLogPage from './pages/admin/AuditLogPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="app-container">
          <Header />
          <Toast />

          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/impact" element={<ImpactPage />} />
              <Route path="/login" element={<AuthLoginPage />} />
              <Route path="/register" element={<AuthRegisterPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/profile" element={<ProfilePage />} />

              {/* Donor Routes */}
              <Route path="/donor/dashboard" element={<DonorDashboard />} />
              <Route path="/donor/listings/new" element={<CreateListingPage />} />
              <Route path="/donor/listings/edit/:id" element={<EditListingPage />} />
              <Route path="/donor/listings" element={<MyListingsPage />} />
              <Route path="/donor/listings/:id" element={<ListingDetailPage />} />

              {/* NGO Routes */}
              <Route path="/ngo/discover" element={<DiscoverPage />} />
              <Route path="/ngo/listings/:id" element={<NgoListingDetailPage />} />
              <Route path="/ngo/claims" element={<MyClaimsPage />} />

              {/* Volunteer Routes */}
              <Route path="/volunteer/tasks" element={<VolunteerTasksPage />} />
              <Route path="/volunteer/tasks/:id" element={<TaskDeliveryPage />} />

              {/* Admin Routes */}
              <Route path="/admin/overview" element={<AdminOverviewPage />} />
              <Route path="/admin/verifications" element={<VerificationsQueuePage />} />
              <Route path="/admin/reports" element={<ReportsModerationPage />} />
              <Route path="/admin/settings" element={<PlatformSettingsPage />} />
              <Route path="/admin/audit" element={<AuditLogPage />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <MobileBottomNav />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
