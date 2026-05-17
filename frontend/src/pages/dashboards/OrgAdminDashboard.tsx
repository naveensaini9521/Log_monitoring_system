// pages/dashboards/OrgAdminDashboard.tsx
import React from "react";
import { motion } from "framer-motion";
import {
  Users,
  Key,
  Settings,
  Activity,
  Shield,
  BarChart3,
  Database,
  AlertTriangle,
  CheckCircle,
  Clock,
  UserPlus,
  FileText,
  Bell,
  Zap,
  GitBranch,
  Code,
  Server,
} from "lucide-react";

const OrgAdminDashboard: React.FC = () => {
  const stats = [
    {
      label: "Team Members",
      value: "24",
      change: "+3",
      icon: Users,
      color: "from-blue-500 to-cyan-600",
    },
    {
      label: "Active Log Sources",
      value: "156",
      change: "+12",
      icon: Database,
      color: "from-green-500 to-emerald-600",
    },
    {
      label: "API Keys",
      value: "8",
      change: "+2",
      icon: Key,
      color: "from-purple-500 to-violet-600",
    },
    {
      label: "Active Alerts",
      value: "12",
      change: "-3",
      icon: AlertTriangle,
      color: "from-orange-500 to-red-600",
    },
  ];

  const teamMembers = [
    {
      name: "John Smith",
      role: "Security Analyst",
      status: "active",
      lastActive: "5 min ago",
    },
    {
      name: "Sarah Johnson",
      role: "Developer",
      status: "active",
      lastActive: "2 min ago",
    },
    {
      name: "Mike Wilson",
      role: "Viewer",
      status: "away",
      lastActive: "1 hour ago",
    },
    {
      name: "Emily Brown",
      role: "Security Analyst",
      status: "offline",
      lastActive: "1 day ago",
    },
  ];

  const logSources = [
    {
      name: "Production Servers",
      type: "Server",
      logs: "234k",
      status: "healthy",
    },
    { name: "Application Logs", type: "App", logs: "892k", status: "healthy" },
    {
      name: "Security Events",
      type: "Security",
      logs: "45k",
      status: "warning",
    },
    {
      name: "Database Queries",
      type: "Database",
      logs: "567k",
      status: "healthy",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Organization Admin
          </h1>
          <p className="text-blue-200">
            Acme Corporation - Manage your team and resources
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white font-medium flex items-center space-x-2">
            <UserPlus className="w-4 h-4" />
            <span>Invite Member</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center`}
              >
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-green-400 text-sm font-medium">
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
            <p className="text-gray-400 text-sm">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Members */}
        <div className="lg:col-span-2 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Team Members</h2>
            <div className="flex space-x-2">
              <button className="text-blue-400 hover:text-blue-300 text-sm">
                View All
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 hover:bg-gray-800/30 rounded-xl transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-medium">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{member.name}</h3>
                    <p className="text-sm text-gray-400">{member.role}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          member.status === "active"
                            ? "bg-green-400"
                            : member.status === "away"
                              ? "bg-yellow-400"
                              : "bg-gray-400"
                        }`}
                      />
                      <span className="text-xs text-gray-400">
                        {member.lastActive}
                      </span>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                    <Settings className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-6">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <button className="w-full p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl hover:from-blue-500/20 hover:to-purple-500/20 transition-all text-left">
              <div className="flex items-center space-x-3">
                <Key className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-white font-medium">Generate API Key</p>
                  <p className="text-xs text-gray-400">
                    Create new API access key
                  </p>
                </div>
              </div>
            </button>
            <button className="w-full p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl hover:from-green-500/20 hover:to-emerald-500/20 transition-all text-left">
              <div className="flex items-center space-x-3">
                <GitBranch className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-white font-medium">Add Log Source</p>
                  <p className="text-xs text-gray-400">
                    Configure new log source
                  </p>
                </div>
              </div>
            </button>
            <button className="w-full p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl hover:from-orange-500/20 hover:to-red-500/20 transition-all text-left">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-orange-400" />
                <div>
                  <p className="text-white font-medium">Configure Alerts</p>
                  <p className="text-xs text-gray-400">Set up alerting rules</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Log Sources */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Log Sources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {logSources.map((source, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-r ${
                    source.status === "healthy"
                      ? "from-green-500 to-emerald-600"
                      : "from-yellow-500 to-orange-600"
                  } flex items-center justify-center`}
                >
                  <Server className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-medium">{source.name}</h3>
                  <p className="text-xs text-gray-400">
                    {source.type} • {source.logs} logs
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    source.status === "healthy"
                      ? "bg-green-400"
                      : "bg-yellow-400"
                  }`}
                />
                <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                  <Settings className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrgAdminDashboard;
