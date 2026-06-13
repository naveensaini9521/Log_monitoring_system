// src/pages/Dashboard.tsx
import React from "react";
import { useAuth } from "../contexts/AuthContext";
import SuperAdminDashboard from "./dashboards/superAdmin/SuperAdminDashboard";
import OrgAdminDashboard from "./dashboards/OrgAdminDashboard";
import SecurityAnalystDashboard from "./dashboards/SecurityAnalystDashboard";
import DevOpsDashboard from "./dashboards/DevOpsDashboard";
import AIAnalystDashboard from "./dashboards/AIAnalystDashboard";
// UserDashboard (formerly viewer) – includes full resource management, AI, logs
import UserDashboard from "./dashboards/user/UserDashboard";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  switch (user?.role) {
    case "super_admin":
      return <SuperAdminDashboard />;
    case "org_admin":
      return <OrgAdminDashboard />;
    case "security_analyst":
      return <SecurityAnalystDashboard />;
    case "devops_engineer":
      return <DevOpsDashboard />;
    case "ai_analyst":
      return <AIAnalystDashboard />;
    case "viewer":
      return <UserDashboard />; // now the full user dashboard
    default:
      return <UserDashboard />;
  }
};

export default Dashboard;
