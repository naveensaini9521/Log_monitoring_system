// src/components/common/Layout/Sidebar.tsx
import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext"; // ✅ fixed path
import {
  LayoutDashboard,
  Activity,
  BarChart3,
  Bell,
  FileText,
  Settings,
  Users,
  Shield,
  Server,
  Container,
  Brain,
  AlertTriangle,
  Key,
  Globe,
  Network,
  Rocket,
  GitBranch,
  Database,
  Lock,
  Building2,
  UserCog,
  HardDrive,
  CreditCard,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, loading } = useAuth();
  const role = user?.role || "viewer";

  const canSeeDevOps = ["devops_engineer", "super_admin"].includes(role);
  const canSeeSecurity = ["security_analyst", "super_admin"].includes(role);
  const canSeeAIAnalyst = ["ai_analyst", "super_admin"].includes(role);
  const canSeeAdmin = ["org_admin", "super_admin"].includes(role);
  const canSeeSuperAdmin = role === "super_admin";

  const mainNavItems = [
    { path: "/app/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/app/logs", icon: Activity, label: "Live Logs" },
    { path: "/app/analytics", icon: BarChart3, label: "Analytics" },
    { path: "/app/alerts", icon: Bell, label: "Alerts" },
    { path: "/app/reports", icon: FileText, label: "Reports" },
    { path: "/app/ai-insights", icon: Brain, label: "AI Insights" },
    { path: "/app/settings", icon: Settings, label: "Settings" },
  ];

  const devopsItems = [
    { path: "/app/services", icon: Server, label: "Services" },
    { path: "/app/containers", icon: Container, label: "Containers" },
    { path: "/app/network", icon: Network, label: "Network" },
    { path: "/app/deployments", icon: Rocket, label: "Deployments" },
  ];

  const securityItems = [
    { path: "/app/threats", icon: Shield, label: "Threats" },
    { path: "/app/incidents", icon: AlertTriangle, label: "Incidents" },
    { path: "/app/compliance", icon: Lock, label: "Compliance" },
  ];

  const aiItems = [
    { path: "/app/models", icon: Database, label: "Models" },
    { path: "/app/insights", icon: Brain, label: "Insights" },
    { path: "/app/training", icon: GitBranch, label: "Training" },
    { path: "/app/anomalies", icon: AlertTriangle, label: "Anomalies" },
  ];

  const adminItems = [
    { path: "/app/team", icon: Users, label: "Team" },
    { path: "/app/integrations", icon: Globe, label: "Integrations" },
    { path: "/app/api-keys", icon: Key, label: "API Keys" },
  ];

  const superAdminItems = [
    { path: "/admin/organizations", icon: Building2, label: "Organizations" },
    { path: "/admin/users", icon: UserCog, label: "Users" },
    { path: "/admin/system", icon: HardDrive, label: "System" },
    { path: "/admin/billing", icon: CreditCard, label: "Billing" },
  ];

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) onClose();
  };

  if (loading) return null;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-gray-900/95 backdrop-blur-sm border-r border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            LogSentinel AI
          </h1>
          <p className="text-xs text-gray-500 mt-1">Observability Platform</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 h-[calc(100vh-80px)]">
          <div className="px-3 space-y-1">
            {mainNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border-l-2 border-blue-500"
                      : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </NavLink>
            ))}
          </div>

          {canSeeDevOps && (
            <div className="mt-6">
              <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                DevOps
              </div>
              <div className="mt-2 px-3 space-y-1">
                {devopsItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white"
                          : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          )}

          {canSeeSecurity && (
            <div className="mt-6">
              <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Security
              </div>
              <div className="mt-2 px-3 space-y-1">
                {securityItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white"
                          : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          )}

          {canSeeAIAnalyst && (
            <div className="mt-6">
              <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                AI Analyst
              </div>
              <div className="mt-2 px-3 space-y-1">
                {aiItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white"
                          : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          )}

          {canSeeAdmin && (
            <div className="mt-6">
              <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Admin
              </div>
              <div className="mt-2 px-3 space-y-1">
                {adminItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white"
                          : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          )}

          {canSeeSuperAdmin && (
            <div className="mt-6">
              <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Super Admin
              </div>
              <div className="mt-2 px-3 space-y-1">
                {superAdminItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white"
                          : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <span className="text-white text-sm font-bold uppercase">
                {user?.name?.[0] || user?.email?.[0] || "U"}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">
                {user?.name || user?.email?.split("@")[0] || "User"}
              </p>
              <p className="text-gray-400 text-xs capitalize">{role}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
