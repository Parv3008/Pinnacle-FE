import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/layout/ProtectedRoute.jsx';
import AdminLayout from '../components/layout/AdminLayout.jsx';
import Login from '../pages/Login/Login.jsx';
import Dashboard from '../pages/Dashboard/Dashboard.jsx';
import CompanyListing from '../pages/JobListing/CompanyListing.jsx';
import CompanyDetails from '../pages/JobListing/CompanyDetails.jsx';
import JobProfileDetails from '../pages/JobProfiles/JobProfileDetails.jsx';
import CandidateListing from '../pages/CandidateListing/CandidateListing.jsx';
import CandidateDetails from '../pages/CandidateListing/CandidateDetails.jsx';
import HiringListing from '../pages/Hiring/HiringListing.jsx';
import HiringDetails from '../pages/Hiring/HiringDetails.jsx';
import RoleListing from '../pages/Roles/RoleListing.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="job-listing" element={<CompanyListing />} />
        <Route path="job-listing/companies/:companyId" element={<CompanyDetails />} />
        <Route
          path="job-listing/companies/:companyId/job-profiles/:jobProfileId"
          element={<JobProfileDetails />}
        />
        <Route path="roles" element={<RoleListing />} />
        <Route path="candidates" element={<CandidateListing />} />
        <Route path="candidates/:candidateId" element={<CandidateDetails />} />
        <Route path="hirings" element={<HiringListing />} />
        <Route path="hirings/:hiringId" element={<HiringDetails />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
