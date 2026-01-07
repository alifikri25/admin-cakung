import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import PostList from './pages/PostList';
import PostForm from './pages/PostForm';
import StrukturOrganisasi from './pages/StrukturOrganisasi';
import Login from './pages/Login';
import AdminSetup from './pages/AdminSetup';
import AdminManagement from './pages/AdminManagement';
import Layout from './components/Layout';
import './App.css';

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// App content with routes
function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/admin/setup" element={<AdminSetup />} />

      {/* Protected routes inside Layout */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            <PostList />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/posts/new" element={
        <ProtectedRoute>
          <Layout>
            <PostForm />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/posts/edit/:id" element={
        <ProtectedRoute>
          <Layout>
            <PostForm />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/struktur" element={
        <ProtectedRoute>
          <Layout>
            <StrukturOrganisasi />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute>
          <Layout>
            <AdminManagement />
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </HashRouter>
  );
}

export default App;