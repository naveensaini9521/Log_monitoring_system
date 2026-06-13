// pages/dashboards/DevOpsDashboard.tsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Server,
  Cpu,
  HardDrive,
  Network,
  Activity,
  Clock,
  AlertCircle,
  CheckCircle,
  Zap,
  Terminal,
  GitBranch,
  Database,
  Globe,
  Download,
  Upload,
  RefreshCw,
  Play,
  Pause,
  Settings,
  Box,
  Layers,
  Cloud,
  Container,
  Code,
  BarChart3,
} from "lucide-react";

const DevOpsDashboard: React.FC = () => {
  const [selectedCluster, setSelectedCluster] = useState("production");

  const systemMetrics = [
    {
      label: "Active Nodes",
      value: "24",
      status: "online",
      icon: Server,
      color: "from-blue-500 to-cyan-600",
      metrics: { cpu: "42%", memory: "56%", disk: "34%" },
    },
    {
      label: "Log Processing Rate",
      value: "234k/sec",
      change: "+12%",
      icon: Activity,
      color: "from-green-500 to-emerald-600",
    },
    {
      label: "Avg Response Time",
      value: "124ms",
      change: "-12ms",
      icon: Clock,
      color: "from-purple-500 to-violet-600",
    },
    {
      label: "Error Rate",
      value: "0.02%",
      change: "-0.01%",
      icon: AlertCircle,
      color: "from-orange-500 to-red-600",
    },
  ];

  const clusters = [
    {
      name: "Production",
      status: "healthy",
      nodes: 12,
      cpu: 64,
      memory: 72,
      latency: 98,
      logs: "1.2M/min",
      errors: 23,
    },
    {
      name: "Staging",
      status: "healthy",
      nodes: 6,
      cpu: 32,
      memory: 41,
      latency: 124,
      logs: "234k/min",
      errors: 5,
    },
    {
      name: "Development",
      status: "degraded",
      nodes: 8,
      cpu: 78,
      memory: 84,
      latency: 245,
      logs: "567k/min",
      errors: 67,
    },
  ];

  const recentDeployments = [
    {
      service: "log-ingestor",
      version: "v2.3.1",
      status: "success",
      time: "5m ago",
      author: "john",
    },
    {
      service: "ai-processor",
      version: "v1.5.0",
      status: "success",
      time: "15m ago",
      author: "sarah",
    },
    {
      service: "alert-manager",
      version: "v3.0.2",
      status: "failed",
      time: "25m ago",
      author: "mike",
    },
    {
      service: "api-gateway",
      version: "v4.1.0",
      status: "success",
      time: "35m ago",
      author: "alex",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            DevOps Dashboard
          </h1>
          <p className="text-blue-200">
            Distributed Log Processing System - Performance Metrics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedCluster}
            onChange={(e) => setSelectedCluster(e.target.value)}
            className="bg-gray-800 text-white px-4 py-2 rounded-xl border border-gray-700"
          >
            <option value="production">Production Cluster</option>
            <option value="staging">Staging Cluster</option>
            <option value="development">Development Cluster</option>
          </select>
          <button className="p-2 bg-gray-800 rounded-xl hover:bg-gray-700">
            <RefreshCw className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemMetrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-r ${metric.color} flex items-center justify-center`}
              >
                <metric.icon className="w-6 h-6 text-white" />
              </div>
              {metric.change && (
                <span
                  className={`text-sm font-medium ${
                    metric.change.startsWith("-")
                      ? "text-green-400"
                      : "text-blue-400"
                  }`}
                >
                  {metric.change}
                </span>
              )}
            </div>
            <h3 className="text-2xl font-bold text-white">{metric.value}</h3>
            <p className="text-gray-400 text-sm">{metric.label}</p>
            {metric.metrics && (
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">CPU</span>
                  <p className="text-white">{metric.metrics.cpu}</p>
                </div>
                <div>
                  <span className="text-gray-500">Memory</span>
                  <p className="text-white">{metric.metrics.memory}</p>
                </div>
                <div>
                  <span className="text-gray-500">Disk</span>
                  <p className="text-white">{metric.metrics.disk}</p>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Cluster Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {clusters.map((cluster, index) => (
          <motion.div
            key={cluster.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {cluster.name}
              </h3>
              <div
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  cluster.status === "healthy"
                    ? "bg-green-500/20 text-green-300"
                    : "bg-yellow-500/20 text-yellow-300"
                }`}
              >
                {cluster.status}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-400">Nodes</p>
                <p className="text-xl font-bold text-white">{cluster.nodes}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Logs/min</p>
                <p className="text-xl font-bold text-white">{cluster.logs}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">CPU Usage</span>
                  <span className="text-white">{cluster.cpu}%</span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                    style={{ width: `${cluster.cpu}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">Memory Usage</span>
                  <span className="text-white">{cluster.memory}%</span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                    style={{ width: `${cluster.memory}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">Latency</span>
                  <span className="text-white">{cluster.latency}ms</span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                    style={{ width: `${(cluster.latency / 300) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-red-400">Errors: {cluster.errors}</span>
              <button className="text-blue-400 hover:text-blue-300">
                View Details →
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Deployments & Log Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Deployments */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-6">
            Recent Deployments
          </h2>
          <div className="space-y-4">
            {recentDeployments.map((deployment, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl"
              >
                <div className="flex items-center space-x-4">
                  <GitBranch className="w-5 h-5 text-gray-400" />
                  <div>
                    <h3 className="text-white font-medium">
                      {deployment.service}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {deployment.version}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <span
                      className={`text-sm font-medium ${
                        deployment.status === "success"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {deployment.status}
                    </span>
                    <p className="text-xs text-gray-400">{deployment.time}</p>
                  </div>
                  <button className="p-2 hover:bg-gray-700 rounded-lg">
                    <Terminal className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Log Stream */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">
              Live Log Stream
            </h2>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-gray-400">Live</span>
            </div>
          </div>
          <div className="space-y-2 font-mono text-xs">
            <div className="p-2 bg-gray-800/30 rounded">
              <span className="text-green-400">[INFO]</span>
              <span className="text-gray-400 ml-2">log-processor-01:</span>
              <span className="text-white ml-2">
                Processed 2,345 logs in 234ms
              </span>
            </div>
            <div className="p-2 bg-gray-800/30 rounded">
              <span className="text-yellow-400">[WARN]</span>
              <span className="text-gray-400 ml-2">api-gateway-03:</span>
              <span className="text-white ml-2">
                High latency detected (345ms)
              </span>
            </div>
            <div className="p-2 bg-gray-800/30 rounded">
              <span className="text-blue-400">[DEBUG]</span>
              <span className="text-gray-400 ml-2">ai-processor-02:</span>
              <span className="text-white ml-2">Model inference completed</span>
            </div>
            <div className="p-2 bg-gray-800/30 rounded">
              <span className="text-red-400">[ERROR]</span>
              <span className="text-gray-400 ml-2">database-01:</span>
              <span className="text-white ml-2">Connection timeout</span>
            </div>
          </div>
          <button className="w-full mt-4 p-2 bg-gray-800 rounded-lg text-sm text-gray-400 hover:text-white">
            View Full Logs
          </button>
        </div>
      </div>
    </div>
  );
};

export default DevOpsDashboard;
