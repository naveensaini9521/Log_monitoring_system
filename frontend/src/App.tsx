// App.tsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ServiceProvider } from "./contexts/ServiceContext";
import MainLayout from "./components/common/Layout/MainLayout";
import Homepage from "./pages/Homepage";
import Dashboard from "./pages/Dashboard";
import Logs from "./pages/dashboards/user/Logs";
import Analytics from "./pages/dashboards/user/Analytics";
import Alerts from "./pages/dashboards/user/Alerts";
import AIInsights from "./pages/AIInsights";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import Reports from "./pages/dashboards/user/Reports";

// Placeholder components (unchanged)
const Team = () => <div className="text-white p-6">Team Management</div>;
const Integrations = () => <div className="text-white p-6">Integrations</div>;
const ApiKeys = () => <div className="text-white p-6">API Keys</div>;
const Threats = () => <div className="text-white p-6">Threats</div>;
const Incidents = () => <div className="text-white p-6">Incidents</div>;
const Compliance = () => <div className="text-white p-6">Compliance</div>;
const Services = () => <div className="text-white p-6">Services</div>;
const Containers = () => <div className="text-white p-6">Containers</div>;
const Network = () => <div className="text-white p-6">Network</div>;
const Deployments = () => <div className="text-white p-6">Deployments</div>;
const Models = () => <div className="text-white p-6">AI Models</div>;
const Insights = () => <div className="text-white p-6">Insights</div>;
const Training = () => <div className="text-white p-6">Training</div>;
const Anomalies = () => <div className="text-white p-6">Anomalies</div>;
const Organizations = () => <div className="text-white p-6">Organizations</div>;
const Users = () => <div className="text-white p-6">Users</div>;
const System = () => <div className="text-white p-6">System Settings</div>;
const Billing = () => <div className="text-white p-6">Billing</div>;

import "./index.css";

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-75 animate-pulse"></div>
            <div className="relative bg-gray-900 p-6 rounded-full">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
          <p className="mt-6 text-blue-300 font-medium">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <ServiceProvider>{children}</ServiceProvider>;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected app routes – all under /app */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route
              path="logs"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "super_admin",
                    "org_admin",
                    "security_analyst",
                    "devops_engineer",
                    "viewer",
                  ]}
                >
                  <Logs />
                </ProtectedRoute>
              }
            />
            <Route
              path="analytics"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "super_admin",
                    "org_admin",
                    "security_analyst",
                    "ai_analyst",
                    "viewer",
                  ]}
                >
                  <Analytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="alerts"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "super_admin",
                    "org_admin",
                    "security_analyst",
                    "devops_engineer",
                    "viewer",
                  ]}
                >
                  <Alerts />
                </ProtectedRoute>
              }
            />
            <Route
              path="ai-insights"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "super_admin",
                    "ai_analyst",
                    "security_analyst",
                  ]}
                >
                  <AIInsights />
                </ProtectedRoute>
              }
            />
            <Route
              path="settings"
              element={
                <ProtectedRoute
                  allowedRoles={["super_admin", "org_admin", "viewer"]}
                >
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <div className="text-white p-6">Profile Page</div>
                </ProtectedRoute>
              }
            />
            <Route
              path="reports"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "viewer",
                    "security_analyst",
                    "super_admin",
                    "org_admin",
                  ]}
                >
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="dashboards"
              element={<Navigate to="/app/dashboard" replace />}
            />

            {/* Role‑specific routes (same as before) */}
            <Route
              path="team"
              element={
                <ProtectedRoute allowedRoles={["org_admin", "super_admin"]}>
                  <Team />
                </ProtectedRoute>
              }
            />
            <Route
              path="integrations"
              element={
                <ProtectedRoute allowedRoles={["org_admin", "super_admin"]}>
                  <Integrations />
                </ProtectedRoute>
              }
            />
            <Route
              path="api-keys"
              element={
                <ProtectedRoute allowedRoles={["org_admin", "super_admin"]}>
                  <ApiKeys />
                </ProtectedRoute>
              }
            />
            <Route
              path="threats"
              element={
                <ProtectedRoute
                  allowedRoles={["security_analyst", "super_admin"]}
                >
                  <Threats />
                </ProtectedRoute>
              }
            />
            <Route
              path="incidents"
              element={
                <ProtectedRoute
                  allowedRoles={["security_analyst", "super_admin"]}
                >
                  <Incidents />
                </ProtectedRoute>
              }
            />
            <Route
              path="compliance"
              element={
                <ProtectedRoute
                  allowedRoles={["security_analyst", "super_admin"]}
                >
                  <Compliance />
                </ProtectedRoute>
              }
            />
            <Route
              path="services"
              element={
                <ProtectedRoute
                  allowedRoles={["devops_engineer", "super_admin"]}
                >
                  <Services />
                </ProtectedRoute>
              }
            />
            <Route
              path="containers"
              element={
                <ProtectedRoute
                  allowedRoles={["devops_engineer", "super_admin"]}
                >
                  <Containers />
                </ProtectedRoute>
              }
            />
            <Route
              path="network"
              element={
                <ProtectedRoute
                  allowedRoles={["devops_engineer", "super_admin"]}
                >
                  <Network />
                </ProtectedRoute>
              }
            />
            <Route
              path="deployments"
              element={
                <ProtectedRoute
                  allowedRoles={["devops_engineer", "super_admin"]}
                >
                  <Deployments />
                </ProtectedRoute>
              }
            />
            <Route
              path="models"
              element={
                <ProtectedRoute allowedRoles={["ai_analyst", "super_admin"]}>
                  <Models />
                </ProtectedRoute>
              }
            />
            <Route
              path="insights"
              element={
                <ProtectedRoute allowedRoles={["ai_analyst", "super_admin"]}>
                  <Insights />
                </ProtectedRoute>
              }
            />
            <Route
              path="training"
              element={
                <ProtectedRoute allowedRoles={["ai_analyst", "super_admin"]}>
                  <Training />
                </ProtectedRoute>
              }
            />
            <Route
              path="anomalies"
              element={
                <ProtectedRoute allowedRoles={["ai_analyst", "super_admin"]}>
                  <Anomalies />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Super Admin routes (separate area for global admin) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["super_admin"]}>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="organizations" element={<Organizations />} />
            <Route path="users" element={<Users />} />
            <Route path="system" element={<System />} />
            <Route path="billing" element={<Billing />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
