import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

const Login = lazy(() => import("./pages/Login.jsx"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard.jsx"));
const AdminCreate = lazy(() => import("./pages/AdminCreate.jsx"));
const AdminEdit = lazy(() => import("./pages/AdminEdit.jsx"));
const AdminStudent = lazy(() => import("./pages/AdminStudent.jsx"));
const CertificatePublic = lazy(() => import("./pages/CertificatePublic.jsx"));
const PublicList = lazy(() => import("./pages/PublicList.jsx"));

export default function AppRouter() {
  return (
    <Suspense fallback={<p className="text-sm text-slate">Loading page...</p>}>
      <Routes>
        <Route path="/" element={<Navigate to="/certificates" replace />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/create"
          element={
            <ProtectedRoute>
              <AdminCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/edit/:id"
          element={
            <ProtectedRoute>
              <AdminEdit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/student/:id"
          element={
            <ProtectedRoute>
              <AdminStudent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/certificate/:certificateId"
          element={<CertificatePublic />}
        />
        <Route path="/certificates" element={<PublicList />} />
        <Route path="/student/:studentId" element={<PublicList />} />
        <Route path="*" element={<Navigate to="/certificates" replace />} />
      </Routes>
    </Suspense>
  );
}
