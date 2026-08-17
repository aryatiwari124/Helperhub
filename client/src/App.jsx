import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import EmergencyButton from './components/common/EmergencyButton';

// Pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import BrowseHelpersPage from './pages/BrowseHelpersPage';
import HelperProfilePage from './pages/HelperProfilePage';
import RecruiterDashboard from './pages/RecruiterDashboard';
import JobSeekerDashboard from './pages/JobSeekerDashboard';
import JobDetailPage from './pages/JobDetailPage';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/helpers" element={<BrowseHelpersPage />} />
          <Route path="/helper/:userId" element={<HelperProfilePage />} />

          {/* Protected Routes */}
          <Route
            path="/recruiter"
            element={
              <ProtectedRoute allowedRoles={['recruiter']}>
                <RecruiterDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobseeker"
            element={
              <ProtectedRoute allowedRoles={['jobseeker']}>
                <JobSeekerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/job/:id"
            element={
              <ProtectedRoute>
                <JobDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </main>
      <Footer />

      {/* Floating Emergency SOS Button across all pages */}
      <EmergencyButton />
    </div>
  );
}
