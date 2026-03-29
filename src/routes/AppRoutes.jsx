import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import Login        from '../pages/auth/Login';
import Register     from '../pages/auth/Register';
import Dashboard    from '../pages/dashboard/Dashboard';
import PostsList    from '../pages/posts/PostsList';
import CreatePost   from '../pages/posts/CreatePost';
import AdminPanel   from '../pages/admin/AdminPanel';
import Layout       from '../components/layout/Layout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Profile from '../pages/profile/Profile';
import Messages from '../pages/messages/Messages';
import Journals from '../pages/journals/Journals';
import Conferences from '../pages/conferences/Conferences';
import ResearcherProfile from '../pages/researcher/ResearcherProfile';


// ── حماية المسارات الخاصة ─────────────────────
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return user ? children : <Navigate to="/login" replace />;
};

// ── حماية مسارات الأدمن ───────────────────────
const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user)    return <Navigate to="/login"     replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

// ── إعادة توجيه المستخدم المسجل ──────────────
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

const AppRoutes = () => {
  return (
    <Routes>

      {/* Public */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="/login" element={
        <PublicRoute><Login /></PublicRoute>
      } />

      <Route path="/register" element={
        <PublicRoute><Register /></PublicRoute>
      } />

      {/* Protected — داخل Layout */}
      <Route path="/" element={
        <PrivateRoute><Layout /></PrivateRoute>
      }>
        <Route path="journals" element={<Journals />} />
        <Route path="conferences" element={<Conferences />} />
        <Route path="profile" element={<Profile />} />
        <Route path="messages" element={<Messages />} />
        <Route path="dashboard"    element={<Dashboard />} />
        <Route path="posts"        element={<PostsList />} />
        <Route path="posts/create" element={<CreatePost />} />
        <Route path="researchers/:id" element={<ResearcherProfile />} />
      </Route>

      {/* Admin */}
      <Route path="/admin" element={
        <AdminRoute><Layout /></AdminRoute>
      }>
        <Route index element={<AdminPanel />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />

    </Routes>
  );
};

export default AppRoutes;