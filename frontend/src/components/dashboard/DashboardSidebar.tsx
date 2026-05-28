// components/dashboard/DashboardSidebar.tsx
import React from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Activity,
  AlertTriangle,
  BarChart3,
  Settings,
  Users,
  Database,
  Shield,
  Brain,
  FileText,
  Globe,
  Bell,
  Clock,
  TrendingUp,
  Cpu,
  HardDrive,
  Network,
  Zap,
  Server,
  Lock,
  Eye,
  Code,
  Key,
  UserPlus,
  X,
} from "lucide-react";

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: string;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  isOpen,
  onClose,
  userRole,
}) => {
  const getMenuItems = () => {
    const baseItems = [
      { path: "/app/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { path: "/app/logs", icon: Activity, label: "Live Logs" },
      { path: "/app/alerts", icon: AlertTriangle, label: "Alerts" },
      { path: "/app/analytics", icon: BarChart3, label: "Analytics" },
    ];

    const roleSpecificItems: Record<string, any[]> = {
      super_admin: [
        { path: "/app/organizations", icon: Globe, label: "Organizations" },
        { path: "/app/users", icon: Users, label: "Users" },
        { path: "/app/system", icon: Server, label: "System" },
        { path: "/app/billing", icon: Database, label: "Billing" },
        { path: "/app/ai-models", icon: Brain, label: "AI Models" },
        { path: "/app/security", icon: Shield, label: "Security" },
        { path: "/app/settings", icon: Settings, label: "Settings" },
      ],
      org_admin: [
        { path: "/app/team", icon: Users, label: "Team" },
        { path: "/app/integrations", icon: Globe, label: "Integrations" },
        { path: "/app/api-keys", icon: Key, label: "API Keys" },
        { path: "/app/billing", icon: Database, label: "Billing" },
        { path: "/app/settings", icon: Settings, label: "Settings" },
      ],
      security_analyst: [
        { path: "/app/threats", icon: Shield, label: "Threats" },
        { path: "/app/incidents", icon: AlertTriangle, label: "Incidents" },
        { path: "/app/compliance", icon: Lock, label: "Compliance" },
        { path: "/app/reports", icon: FileText, label: "Reports" },
      ],
      devops_engineer: [
        { path: "/app/services", icon: Server, label: "Services" },
        { path: "/app/containers", icon: Cpu, label: "Containers" },
        { path: "/app/network", icon: Network, label: "Network" },
        { path: "/app/deployments", icon: Zap, label: "Deployments" },
      ],
      ai_analyst: [
        { path: "/app/models", icon: Brain, label: "Models" },
        { path: "/app/insights", icon: TrendingUp, label: "Insights" },
        { path: "/app/training", icon: Cpu, label: "Training" },
        { path: "/app/anomalies", icon: Activity, label: "Anomalies" },
      ],
      viewer: [
        { path: "/app/reports", icon: FileText, label: "Reports" },
        { path: "/app/dashboards", icon: LayoutDashboard, label: "Dashboards" },
      ],
    };

    return [...baseItems, ...(roleSpecificItems[userRole] || [])];
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ type: "spring", damping: 20 }}
        className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-gray-900 to-gray-800 border-r border-gray-700 z-50 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:transform-none lg:top-16 lg:h-[calc(100vh-4rem)]`}
      >
        <div className="flex flex-col h-full">
          {/* Close button - mobile only */}
          <button
            onClick={onClose}
            className="lg:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>

          {/* Menu items */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-2 space-y-1">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/app/dashboard"}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-blue-500/30"
                        : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-700">
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-2">Need help?</p>
              <button className="w-full text-xs text-blue-400 hover:text-blue-300 transition-colors">
                View Documentation
              </button>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default DashboardSidebar;
