// pages/dashboards/SuperAdminDashboard.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Activity,
  Server,
  Users,
  Building2,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Settings,
  Globe,
  Database,
  Cpu,
  HardDrive,
  Network,
  Zap,
  Shield,
  BarChart3,
  Download,
  Filter,
  RefreshCw,
  Play,
  Pause,
  AlertCircle,
  LineChart,
  PieChart,
  Layers,
  Webhook,
  Code,
  GitBranch,
  Cloud,
  Lock,
  Terminal,
  Eye,
} from "lucide-react";
import { adminApi } from "../../../services/api";
import { aiApi } from "../../../services/api";
import { analyticsApi } from "../../../services/api";
import { useAuth } from "../../../contexts/AuthContext";
import {
  LineChart as ReLineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  ComposedChart,
  Scatter,
} from "recharts";

import io from "socket.io-client";

interface SystemHealth {
  activeNodes: number;
  avgCpu: number;
  avgMemory: number;
  avgLatency: number;
  activeOrgs: number;
  newOrgs: number;
  trialOrgs: number;
  paidOrgs: number;
  services: ServiceStatus[];
  incidents: Incident[];
}

interface ServiceStatus {
  name: string;
  status: "operational" | "degraded" | "down";
  latency: number;
  uptime: number;
  lastChecked: string;
}

interface Incident {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "investigating" | "identified" | "monitoring" | "resolved";
  service: string;
  time: string;
}

interface GlobalMetrics {
  ingestionRate: string;
  rateChange: string;
  totalLogs: string;
  todayLogs: string;
  anomalies: number;
  anomalyChange: string;
  topSources: LogSource[];
  timeSeriesData: TimeDataPoint[];
  geoDistribution: GeoPoint[];
}

interface LogSource {
  name: string;
  count: number;
  percentage: number;
}

interface TimeDataPoint {
  timestamp: string;
  logs: number;
  anomalies: number;
  queries: number;
  latency: number;
}

interface GeoPoint {
  country: string;
  count: number;
  lat: number;
  lng: number;
}

interface AIModelStatus {
  overallAccuracy: number;
  accuracyChange: number;
  precision: number;
  recall: number;
  models: ModelInfo[];
  trainingJobs: TrainingJob[];
}

interface ModelInfo {
  name: string;
  version: string;
  accuracy: number;
  status: "active" | "training" | "failed";
  latency: number;
  requestsPerMinute: number;
}

interface TrainingJob {
  id: string;
  model: string;
  progress: number;
  status: "running" | "completed" | "failed";
  startTime: string;
  eta: string;
}

interface Organization {
  id: string;
  name: string;
  userCount: number;
  logVolume: string;
  aiQueries: number;
  anomalyRate: string;
  status: "active" | "trial" | "suspended";
  plan: "enterprise" | "pro" | "basic";
  usage: number;
  quota: number;
  lastActive: string;
}

const COLORS = {
  operational: "#10b981",
  degraded: "#f59e0b",
  down: "#ef4444",
  primary: "#3b82f6",
  secondary: "#8b5cf6",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#06b6d4",
};

const CHART_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
];

const SuperAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [globalMetrics, setGlobalMetrics] = useState<GlobalMetrics | null>(
    null,
  );
  const [aiModelStatus, setAiModelStatus] = useState<AIModelStatus | null>(
    null,
  );
  const [timeRange, setTimeRange] = useState("24h");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedView, setSelectedView] = useState<
    "overview" | "analytics" | "ai" | "infrastructure"
  >("overview");

  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    const socket = io("http://localhost:8001", {
      transports: ["websocket"],
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket.IO connected");
      setSocketConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Socket.IO disconnected");
      setSocketConnected(false);
    });

    socket.on("update", (data: any) => {
      handleRealtimeUpdate(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleRealtimeUpdate = (data: any) => {
    switch (data.type) {
      case "system_health":
        setSystemHealth((prev) => ({ ...prev, ...data.payload }));
        break;
      case "metrics":
        setGlobalMetrics((prev) => ({ ...prev, ...data.payload }));
        break;
      case "ai_update":
        setAiModelStatus((prev) => ({ ...prev, ...data.payload }));
        break;
      default:
        console.log("Unknown WebSocket message type:", data.type);
    }
  };

  const fetchDashboardData = useCallback(
    async (showRefresh = false) => {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);
      try {
        const [health, orgs, metrics, aiStatus] = await Promise.allSettled([
          adminApi.getSystemHealth(),
          adminApi.getOrganizations({
            limit: 10,
            sortBy: "usage",
            order: "desc",
          }),
          analyticsApi.getAnalytics(timeRange),
          aiApi.getModelStatus(),
        ]);
        if (health.status === "fulfilled") setSystemHealth(health.value.data);
        else console.error("System health fetch failed:", health.reason);
        if (orgs.status === "fulfilled") setOrganizations(orgs.value.data);
        else console.error("Organizations fetch failed:", orgs.reason);
        if (metrics.status === "fulfilled")
          setGlobalMetrics(metrics.value.data);
        else console.error("Metrics fetch failed:", metrics.reason);
        if (aiStatus.status === "fulfilled")
          setAiModelStatus(aiStatus.value.data);
        else console.error("AI model status fetch failed:", aiStatus.reason);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [timeRange],
  );

  useEffect(() => {
    fetch;
    fetchDashboardData();
    let interval: NodeJS.Timeout | undefined;

    if (autoRefresh && !socketConnected) {
      interval = setInterval(() => fetchDashboardData(true), 15000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timeRange, autoRefresh, socketConnected, fetchDashboardData]);

  const systemStats = [
    {
      label: "AI Processing Nodes",
      value: systemHealth?.activeNodes || "0",
      status: (systemHealth?.activeNodes ?? 0) > 0 ? "online" : "offline",
      icon: Brain,
      color: "from-purple-500 to-pink-600",
      metrics: {
        cpu: `${systemHealth?.avgCpu || 0}%`,
        memory: `${systemHealth?.avgMemory || 0}%`,
        latency: `${systemHealth?.avgLatency || 0}ms`,
      },
    },
    {
      label: "Log Ingestion Rate",
      value: globalMetrics?.ingestionRate || "0/sec",
      change: globalMetrics?.rateChange || "0%",
      icon: Database,
      color: "from-blue-500 to-cyan-600",
      metrics: {
        total: globalMetrics?.totalLogs || "0",
        today: globalMetrics?.todayLogs || "0",
      },
    },
    {
      label: "Active Organizations",
      value: systemHealth?.activeOrgs || "0",
      change: `+${systemHealth?.newOrgs || 0}`,
      icon: Building2,
      color: "from-green-500 to-emerald-600",
      metrics: {
        trial: systemHealth?.trialOrgs || "0",
        active: systemHealth?.paidOrgs || "0",
      },
    },
    {
      label: "AI Model Accuracy",
      value: `${aiModelStatus?.overallAccuracy || 0}%`,
      change: `+${aiModelStatus?.accuracyChange || 0}%`,
      icon: TrendingUp,
      color: "from-orange-500 to-red-600",
      metrics: {
        precision: `${aiModelStatus?.precision || 0}%`,
        recall: `${aiModelStatus?.recall || 0}%`,
      },
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
      case "active":
      case "completed":
        return "text-green-400 bg-green-500/20";
      case "degraded":
      case "trial":
      case "training":
        return "text-yellow-400 bg-yellow-500/20";
      case "down":
      case "suspended":
      case "failed":
        return "text-red-400 bg-red-500/20";
      default:
        return "text-gray-400 bg-gray-500/20";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl opacity-75 animate-pulse"></div>
          <div className="relative bg-gray-900 p-8 rounded-full">
            <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header with Real-time Status */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Super Admin Dashboard
          </h1>
          <p className="text-blue-200">Welcome back, {user?.name}</p>
        </div>
        <div className="flex items-center space-x-4">
          {/*Show Socket.IO status instead of WebSocket */}
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 ${socketConnected ? "bg-green-400" : "bg-red-400"} rounded-full animate-pulse`}
            />
            <span className="text-sm text-gray-400">
              {socketConnected ? "Live" : "Polling"}
            </span>
          </div>

          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-gray-800 text-white rounded-xl px-4 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>

          {/* Auto-refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`p-2 rounded-xl transition-colors ${
              autoRefresh
                ? "bg-blue-500/20 text-blue-400"
                : "bg-gray-800 text-gray-400"
            }`}
          >
            {autoRefresh ? (
              <Play className="w-5 h-5" />
            ) : (
              <Pause className="w-5 h-5" />
            )}
          </button>

          {/* Manual Refresh */}
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="p-2 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`w-5 h-5 text-gray-400 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* View Selector (unchanged) */}
      <div className="flex space-x-2 border-b border-gray-800 pb-4">
        {[
          { id: "overview", label: "Overview", icon: Eye },
          { id: "analytics", label: "Analytics", icon: BarChart3 },
          { id: "ai", label: "AI & Models", icon: Brain },
          { id: "infrastructure", label: "Infrastructure", icon: Server },
        ].map((view) => (
          <button
            key={view.id}
            onClick={() => setSelectedView(view.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
              selectedView === view.id
                ? "bg-blue-500 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            <view.icon className="w-4 h-4" />
            <span>{view.label}</span>
          </button>
        ))}
      </div>

      {/* ... The rest of the JSX (overview, analytics, ai, infrastructure sections) remains exactly the same ... */}
      <AnimatePresence mode="wait">
        {selectedView === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* System Stats Grid (unchanged) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {systemStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 hover:border-gray-600 transition-all"
                >
                  {/* ... stat content unchanged ... */}
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center`}
                    >
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    {stat.change && (
                      <span className="text-green-400 text-sm font-medium">
                        {stat.change}
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    {stat.value}
                  </h3>
                  <p className="text-gray-400 text-sm mb-3">{stat.label}</p>
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-700">
                    {Object.entries(stat.metrics || {}).map(([key, val]) => (
                      <div key={key}>
                        <p className="text-xs text-gray-500 capitalize">
                          {key}
                        </p>
                        <p className="text-sm text-white font-mono">{val}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Charts Section (unchanged) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Time Series Chart */}
              <motion.div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-white">
                    System Activity
                  </h2>
                  <div className="flex space-x-2">
                    <span className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-xs text-gray-400">Logs</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-xs text-gray-400">Anomalies</span>
                    </span>
                  </div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={globalMetrics?.timeSeriesData || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="timestamp" stroke="#9CA3AF" />
                      <YAxis yAxisId="left" stroke="#9CA3AF" />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#9CA3AF"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "none",
                          borderRadius: "0.5rem",
                          color: "#fff",
                        }}
                      />
                      <Legend />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="logs"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.3}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="anomalies"
                        stroke="#ef4444"
                        strokeWidth={2}
                      />
                      <Bar
                        yAxisId="right"
                        dataKey="queries"
                        fill="#8b5cf6"
                        opacity={0.6}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Service Status (unchanged) */}
              <motion.div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Service Status
                </h2>
                <div className="space-y-4">
                  {systemHealth?.services?.map((service) => (
                    <div
                      key={service.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-2 h-2 rounded-full ${service.status === "operational" ? "bg-green-400" : service.status === "degraded" ? "bg-yellow-400" : "bg-red-400"}`}
                        />
                        <span className="text-white">{service.name}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-400">
                          {service.latency}ms
                        </span>
                        <span
                          className={`text-sm px-2 py-1 rounded-full ${getStatusColor(service.status)}`}
                        >
                          {service.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {systemHealth?.incidents &&
                  systemHealth.incidents.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-gray-400 mb-3">
                        Active Incidents
                      </h3>
                      <div className="space-y-3">
                        {systemHealth.incidents.map((incident) => (
                          <div
                            key={incident.id}
                            className="bg-red-500/10 border border-red-500/20 rounded-lg p-3"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-white font-medium">
                                {incident.title}
                              </span>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${incident.severity === "critical" ? "bg-red-500/20 text-red-300" : incident.severity === "high" ? "bg-orange-500/20 text-orange-300" : "bg-yellow-500/20 text-yellow-300"}`}
                              >
                                {incident.severity}
                              </span>
                            </div>
                            <p className="text-sm text-gray-400">
                              {incident.service} · {incident.time}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </motion.div>
            </div>

            {/* Organizations Overview (unchanged) */}
            <motion.div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">
                  Organizations
                </h2>
                <button
                  onClick={() =>
                    (window.location.href = "/admin/organizations")
                  }
                  className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1"
                >
                  <span>View All</span>
                  <span>→</span>
                </button>
              </div>
              <div className="space-y-4">
                {organizations.map((org, index) => (
                  <motion.div
                    key={org.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-white font-medium">{org.name}</h3>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${getStatusColor(org.plan)}`}
                          >
                            {org.plan}
                          </span>
                        </div>
                        <div className="flex items-center space-x-6 text-sm mt-1">
                          <span className="text-gray-400">
                            {org.userCount} users
                          </span>
                          <span className="text-gray-400">
                            {org.logVolume}/day
                          </span>
                          <span className="text-gray-400">
                            AI: {org.aiQueries}/day
                          </span>
                          <span className="text-gray-400">
                            Last active: {org.lastActive}
                          </span>
                        </div>
                        <div className="mt-2 w-64">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400">Usage</span>
                            <span className="text-white">
                              {Math.round((org.usage / org.quota) * 100)}%
                            </span>
                          </div>
                          <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                              style={{
                                width: `${(org.usage / org.quota) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Anomaly Rate</p>
                        <p className="text-sm text-white font-mono">
                          {org.anomalyRate}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(org.status)}`}
                      >
                        {org.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {selectedView === "analytics" && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Top Log Sources
                </h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={globalMetrics?.topSources || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {(globalMetrics?.topSources || []).map(
                          (entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={CHART_COLORS[index % CHART_COLORS.length]}
                            />
                          ),
                        )}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "none",
                          borderRadius: "0.5rem",
                          color: "#fff",
                        }}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Anomaly Trends
                </h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={globalMetrics?.timeSeriesData || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="timestamp" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "none",
                          borderRadius: "0.5rem",
                          color: "#fff",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="anomalies"
                        stroke="#ef4444"
                        fill="#ef4444"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {selectedView === "ai" && (
          <motion.div
            key="ai"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {aiModelStatus?.models?.map((model, index) => (
                <motion.div
                  key={model.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getStatusColor(model.status)}`}
                    >
                      {model.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    {model.name}
                  </h3>
                  <p className="text-sm text-gray-400 mb-3">v{model.version}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Accuracy</span>
                      <span className="text-white font-mono">
                        {model.accuracy}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Latency</span>
                      <span className="text-white font-mono">
                        {model.latency}ms
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Requests/min</span>
                      <span className="text-white font-mono">
                        {model.requestsPerMinute}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Training Jobs
              </h2>
              <div className="space-y-4">
                {aiModelStatus?.trainingJobs?.map((job) => (
                  <div key={job.id} className="p-4 bg-gray-800/30 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-white font-medium">
                          {job.model}
                        </span>
                        <span
                          className={`ml-3 text-xs px-2 py-1 rounded-full ${getStatusColor(job.status)}`}
                        >
                          {job.status}
                        </span>
                      </div>
                      <span className="text-sm text-gray-400">
                        ETA: {job.eta}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Started: {job.startTime}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {selectedView === "infrastructure" && (
          <motion.div
            key="infrastructure"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
                <Cpu className="w-8 h-8 text-blue-400 mb-3" />
                <h3 className="text-2xl font-bold text-white">
                  {systemHealth?.avgCpu || 0}%
                </h3>
                <p className="text-gray-400 text-sm">CPU Usage</p>
              </div>
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
                <HardDrive className="w-8 h-8 text-green-400 mb-3" />
                <h3 className="text-2xl font-bold text-white">
                  {systemHealth?.avgMemory || 0}%
                </h3>
                <p className="text-gray-400 text-sm">Memory Usage</p>
              </div>
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
                <Network className="w-8 h-8 text-purple-400 mb-3" />
                <h3 className="text-2xl font-bold text-white">
                  {systemHealth?.avgLatency || 0}ms
                </h3>
                <p className="text-gray-400 text-sm">Avg Latency</p>
              </div>
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
                <Server className="w-8 h-8 text-orange-400 mb-3" />
                <h3 className="text-2xl font-bold text-white">
                  {systemHealth?.activeNodes || 0}
                </h3>
                <p className="text-gray-400 text-sm">Active Nodes</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SuperAdminDashboard;
