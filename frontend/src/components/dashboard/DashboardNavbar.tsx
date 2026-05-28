// components/dashboard/DashboardNavbar.tsx
import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  LogOut,
  User,
  Settings,
  Bell,
  ChevronDown,
  Moon,
  Sun,
  Shield,
  Activity,
  Menu,
  X,
} from "lucide-react";

interface DashboardNavbarProps {
  toggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

const DashboardNavbar: React.FC<DashboardNavbarProps> = ({
  toggleSidebar,
  isSidebarOpen,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      super_admin: "from-red-500 to-pink-600",
      org_admin: "from-blue-500 to-cyan-600",
      security_analyst: "from-green-500 to-emerald-600",
      devops_engineer: "from-purple-500 to-violet-600",
      ai_analyst: "from-indigo-500 to-purple-600",
      viewer: "from-gray-500 to-gray-600",
    };
    return colors[role] || "from-gray-500 to-gray-600";
  };

  const getRoleDisplayName = (role: string) => {
    const names: Record<string, string> = {
      super_admin: "Super Admin",
      org_admin: "Organization Admin",
      security_analyst: "Security Analyst",
      devops_engineer: "DevOps Engineer",
      ai_analyst: "AI Analyst",
      viewer: "Viewer",
    };
    return names[role] || role;
  };

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-gray-900/95 to-gray-800/95 backdrop-blur-xl border-b border-gray-700">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left section */}
          <div className="flex items-center space-x-4">
            {toggleSidebar && (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors lg:hidden"
              >
                {isSidebarOpen ? (
                  <X className="w-5 h-5 text-gray-400" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-400" />
                )}
              </button>
            )}

            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur opacity-75"></div>
                <div className="relative bg-gray-900 p-2 rounded-lg">
                  <Brain className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  AI Log Monitor
                </h1>
                <p className="text-xs text-gray-500">
                  {getRoleDisplayName(user?.role || "")}
                </p>
              </div>
            </div>
          </div>

          {/* Center section - Quick actions */}
          <div className="hidden md:flex items-center space-x-2">
            <button className="px-3 py-1.5 bg-gray-800 rounded-lg text-sm text-gray-300 hover:bg-gray-700 transition-colors flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>Quick Actions</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-3">
            {/* Theme toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-gray-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors relative"
              >
                <Bell className="w-5 h-5 text-gray-400" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-700">
                      <h3 className="text-white font-semibold">
                        Notifications
                      </h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      <div className="p-4 hover:bg-gray-700/50 transition-colors">
                        <p className="text-sm text-white">
                          System health check passed
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          5 minutes ago
                        </p>
                      </div>
                      <div className="p-4 hover:bg-gray-700/50 transition-colors">
                        <p className="text-sm text-white">
                          AI model updated successfully
                        </p>
                        <p className="text-xs text-gray-400 mt-1">1 hour ago</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-lg bg-gradient-to-r ${getRoleBadgeColor(user?.role || "")} flex items-center justify-center`}
                  >
                    <span className="text-white text-sm font-bold">
                      {user?.name?.charAt(0) || "U"}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-white">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-700">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getRoleBadgeColor(user?.role || "")} flex items-center justify-center`}
                        >
                          <span className="text-white font-bold">
                            {user?.name?.charAt(0) || "U"}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {user?.name}
                          </p>
                          <p className="text-xs text-gray-400">{user?.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate("/app/profile");
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 rounded-lg transition-colors flex items-center space-x-3"
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate("/app/settings");
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 rounded-lg transition-colors flex items-center space-x-3"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </button>

                      <div className="border-t border-gray-700 my-2"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex items-center space-x-3"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;
