// src/pages/dashboards/user/UserDashboard.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Eye,
  BarChart3,
  FileText,
  Download,
  Filter,
  Activity,
  Users,
  Shield,
  Server,
  Globe,
  Container,
  Plus,
  Trash2,
  AlertTriangle,
  Zap,
  Brain,
  CheckCircle,
  Bell,
  X,
  Search,
  Pause,
  Play,
  ArrowUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../contexts/AuthContext";
import { viewerApi } from "../../../services/api";
import { useService } from "../../../contexts/ServiceContext";
import ServiceSelector from "../../../components/ServiceSelector";
import { ServiceProvider } from "../../../contexts/ServiceContext";

// ==================== TYPES ====================
interface Resource {
  id: string;
  _id?: string;
  name: string;
  type: "website" | "container" | "server";
  address: string;
  status: "healthy" | "warning" | "critical" | "pending";
  lastSeen?: string;
}

interface Anomaly {
  id: string;
  _id?: string;
  resourceId: string;
  resourceName: string;
  message: string;
  severity: "low" | "medium" | "high";
  timestamp: string;
  recommendation?: string;
}

interface AIRecommendation {
  id: string;
  _id?: string;
  title: string;
  description: string;
  action: string;
  resourceId?: string;
  status?: string;
}

interface Alert {
  id: string;
  _id?: string;
  resourceId: string;
  message: string;
  severity: string;
  createdAt: string;
  resolved: boolean;
}

interface LogEntry {
  _id: string;
  timestamp: string;
  message: string;
  level?: string;
  service?: string;
  source?: string;
}

// Helper
const ensureId = <T extends { _id?: string; id?: string }>(
  obj: T,
): T & { id: string } => {
  if (obj.id) return obj as T & { id: string };
  if (obj._id) return { ...obj, id: obj._id } as T & { id: string };
  return { ...obj, id: crypto.randomUUID() } as T & { id: string };
};

// ==================== MAIN COMPONENT ====================
const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const { currentService } = useService();

  // Existing state
  const [resources, setResources] = useState<Resource[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<
    AIRecommendation[]
  >([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("24h");
  const [exporting, setExporting] = useState(false);
  const [showAddResource, setShowAddResource] = useState(false);
  const [newResource, setNewResource] = useState<Partial<Resource>>({
    type: "website",
    name: "",
    address: "",
  });
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Live logs polling state
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null,
  );
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(
    null,
  );
  const [filterText, setFilterText] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const [streamActive, setStreamActive] = useState(false);
  const logsContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef(autoScroll);

  // Alerts & analytics
  const [showAlerts, setShowAlerts] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Helper
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const safeFetch = async (promise: Promise<any>, name: string) => {
    try {
      const result = await promise;
      return { success: true, data: result };
    } catch (error) {
      console.error(`❌ ${name} failed:`, error);
      return { success: false, data: null };
    }
  };

  // Fetch dashboard data – now includes timeRange parameter
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // ✅ Include timeRange in the request params
      const params = { service: currentService || undefined, timeRange };
      const [resourcesRes, anomaliesRes, aiRes, alertsRes, statsRes] =
        await Promise.all([
          safeFetch(viewerApi.getResources(params), "getResources"),
          safeFetch(viewerApi.getAnomalies(params), "getAnomalies"),
          safeFetch(
            viewerApi.getAIRecommendations(params),
            "getAIRecommendations",
          ),
          safeFetch(viewerApi.getAlerts(params), "getAlerts"),
          safeFetch(viewerApi.getStats(params), "getStats"),
        ]);

      const fetchedResources = (
        resourcesRes.success
          ? resourcesRes.data?.data || resourcesRes.data || []
          : []
      ).map((r: any) => ensureId(r));
      setResources(fetchedResources);

      const fetchedAnomalies = (
        anomaliesRes.success
          ? anomaliesRes.data?.data || anomaliesRes.data || []
          : []
      ).map((a: any) => ensureId(a));
      setAnomalies(fetchedAnomalies);

      const fetchedAI = (
        aiRes.success ? aiRes.data?.data || aiRes.data || [] : []
      ).map((rec: any) => ensureId(rec));
      setAiRecommendations(fetchedAI);

      const fetchedAlerts = (
        alertsRes.success ? alertsRes.data?.data || alertsRes.data || [] : []
      ).map((alert: any) => ensureId(alert));
      setAlerts(fetchedAlerts);

      if (statsRes.success) {
        const s = statsRes.data?.data || statsRes.data;
        setStats([
          {
            label: "Total Logs",
            value: s.totalLogs || "0",
            change: s.changes?.totalLogs || "0%",
            icon: FileText,
            color: "from-blue-500 to-cyan-600",
          },
          {
            label: "Active Resources",
            value: s.activeSources || 0,
            change: `${fetchedResources.filter((r) => r.status === "healthy").length} total`,
            icon: Server,
            color: "from-green-500 to-emerald-600",
          },
          {
            label: "Anomalies",
            value: s.anomaliesCount || fetchedAnomalies.length,
            change: s.changes?.activeSources || "0",
            icon: AlertTriangle,
            color: "from-orange-500 to-red-600",
          },
          {
            label: "Uptime",
            value: s.uptime || "99.9%",
            change: s.changes?.uptime || "0%",
            icon: Activity,
            color: "from-purple-500 to-violet-600",
          },
        ]);
      } else {
        setStats([
          {
            label: "Total Logs",
            value: "0",
            change: "0%",
            icon: FileText,
            color: "from-blue-500 to-cyan-600",
          },
          {
            label: "Active Resources",
            value: "0",
            change: "0",
            icon: Server,
            color: "from-green-500 to-emerald-600",
          },
          {
            label: "Anomalies",
            value: "0",
            change: "0",
            icon: AlertTriangle,
            color: "from-orange-500 to-red-600",
          },
          {
            label: "Uptime",
            value: "99.9%",
            change: "0%",
            icon: Activity,
            color: "from-purple-500 to-violet-600",
          },
        ]);
      }
    } catch (error) {
      console.error("Unexpected error in fetchDashboardData:", error);
      showToast("Failed to load some dashboard data", "error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Re‑fetch data when currentService OR timeRange changes
  useEffect(() => {
    fetchDashboardData();
  }, [currentService, timeRange]);

  // Sync autoScroll ref
  useEffect(() => {
    autoScrollRef.current = autoScroll;
  }, [autoScroll]);

  // Resource management (unchanged)
  const handleAddResource = async () => {
    if (!newResource.name || !newResource.address) {
      showToast("Name and address required", "error");
      return;
    }
    try {
      const response = await viewerApi.addResource({
        ...newResource,
        service: currentService,
      });
      const addedResource = ensureId(response.data || response);
      setResources([...resources, addedResource]);
      setShowAddResource(false);
      setNewResource({ type: "website", name: "", address: "" });
      showToast("Resource added", "success");

      // Optional: Register in FastAPI (non‑blocking)
      try {
        await fetch("http://localhost:8000/applications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: addedResource.name,
            long: addedResource.name,
            log_file: addedResource.address,
            cron: "*/5 * * * *",
            enabled: true,
          }),
        });
      } catch (err) {
        console.warn("FastAPI registration optional");
      }

      fetchDashboardData();
    } catch (err) {
      console.error("Add resource error:", err);
      showToast("Failed to add resource", "error");
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (!window.confirm("Delete this resource?")) return;
    try {
      await viewerApi.deleteResource(id);
      setResources(resources.filter((r) => r.id !== id));
      showToast("Resource deleted", "success");
      fetchDashboardData();
    } catch (err) {
      console.error("Delete error:", err);
      showToast("Delete failed", "error");
    }
  };

  const handleAIAction = async (rec: AIRecommendation) => {
    setActionInProgress(rec.id);
    try {
      await viewerApi.applyAIRecommendation({ recommendationId: rec.id });
      showToast(`Action "${rec.action}" applied`, "success");
      fetchDashboardData();
    } catch (err) {
      console.error("AI action error:", err);
      showToast("Action failed", "error");
    } finally {
      setActionInProgress(null);
    }
  };

  const viewAnalytics = async (resourceId: string) => {
    try {
      const res = await viewerApi.getResourceAnalytics(resourceId);
      setAnalyticsData(res.data || res);
      setShowAnalytics(true);
    } catch (err) {
      console.error("Analytics error:", err);
      showToast("Analytics unavailable", "error");
    }
  };

  const handleExport = async (format = "csv") => {
    setExporting(true);
    try {
      const blob = await viewerApi.exportData({
        type: "logs",
        format,
        timeRange,
        service: currentService,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `export_logs_${new Date().toISOString()}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      showToast("Export started", "success");
    } catch (err) {
      console.error("Export error:", err);
      showToast("Export failed", "error");
    } finally {
      setExporting(false);
    }
  };

  // Simulate log for testing
  const simulateLog = async (resource: Resource) => {
    const apiKey = "test-key";
    try {
      const response = await fetch("http://localhost:8000/api/ingest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
        },
        body: JSON.stringify({
          service: resource.address || resource.name,
          host: window.location.hostname,
          source: "simulator",
          logs: [
            `[${new Date().toISOString()}] INFO: Test log from ${resource.name}`,
          ],
        }),
      });
      if (response.ok) {
        showToast("Test log sent", "success");
      } else {
        showToast("Failed to send test log", "error");
      }
    } catch (err) {
      console.error("Simulate log error:", err);
      showToast("Failed to send test log", "error");
    }
  };

  // ==================== POLLING REAL‑TIME LOGS ====================
  const openLiveLogs = useCallback(
    async (resource: Resource) => {
      if (pollingInterval) clearInterval(pollingInterval);
      setSelectedResource(resource);
      setLogs([]);
      setLogsLoading(true);
      setFilterText("");
      setSeverityFilter([]);
      setAutoScroll(true);
      setStreamActive(true);

      const serviceId = encodeURIComponent(resource.address || resource.name);
      const fetchLogs = async () => {
        try {
          const response = await fetch(
            `http://localhost:8000/api/logs/${serviceId}`,
          );
          if (response.ok) {
            const data = await response.json();
            let logsArray = data.logs || [];
            setLogs(logsArray);
            setLogsLoading(false);
            if (autoScrollRef.current && logsContainerRef.current) {
              logsContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
            }
          } else {
            console.error("Polling failed with status:", response.status);
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      };

      await fetchLogs();
      const interval = setInterval(fetchLogs, 1000);
      setPollingInterval(interval);
    },
    [pollingInterval],
  );

  const closeLiveLogs = () => {
    if (pollingInterval) clearInterval(pollingInterval);
    setPollingInterval(null);
    setSelectedResource(null);
    setLogs([]);
    setStreamActive(false);
  };

  const scrollToTop = () => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (
      filterText &&
      !log.message.toLowerCase().includes(filterText.toLowerCase())
    )
      return false;
    if (
      severityFilter.length > 0 &&
      !severityFilter.includes(log.level?.toLowerCase() || "info")
    )
      return false;
    return true;
  });

  const ResourceIcon = ({ type }: { type: Resource["type"] }) => {
    switch (type) {
      case "website":
        return <Globe className="w-5 h-5 text-blue-400" />;
      case "container":
        return <Container className="w-5 h-5 text-green-400" />;
      case "server":
        return <Server className="w-5 h-5 text-purple-400" />;
      default:
        return <Server className="w-5 h-5 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl opacity-75 animate-pulse"></div>
          <div className="relative bg-gray-900 p-6 rounded-full">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">User Dashboard</h1>
          <p className="text-blue-200">
            Manage your websites, containers, and servers with AI monitoring
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <ServiceSelector />
          <button
            onClick={() => setShowAlerts(true)}
            className="relative px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl text-white font-medium flex items-center space-x-2 hover:from-yellow-700 hover:to-orange-700"
          >
            <Bell className="w-4 h-4" />
            <span>Alerts</span>
            {alerts.filter((a) => !a.resolved).length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {alerts.filter((a) => !a.resolved).length}
              </span>
            )}
          </button>
          <button
            onClick={() => handleExport("csv")}
            disabled={exporting}
            className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 rounded-xl text-white font-medium flex items-center space-x-2 hover:from-gray-700 hover:to-gray-800"
          >
            <Download className="w-4 h-4" />
            <span>{exporting ? "Exporting..." : "Export"}</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
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

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resources */}
        <div className="lg:col-span-2 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Your Resources</h2>
            <button
              onClick={() => setShowAddResource(true)}
              className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white text-sm flex items-center space-x-1 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="w-4 h-4" /> <span>Add Resource</span>
            </button>
          </div>
          {resources.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Server className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>
                No resources added yet. Click "Add Resource" to start
                monitoring.
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {resources.map((res) => (
                <div
                  key={res.id}
                  className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <ResourceIcon type={res.type} />
                    <div>
                      <h3 className="text-white font-medium">{res.name}</h3>
                      <div className="flex items-center space-x-3 text-sm">
                        <span className="text-gray-400">{res.address}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            res.status === "healthy"
                              ? "bg-green-500/20 text-green-400"
                              : res.status === "warning"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : res.status === "critical"
                                  ? "bg-red-500/20 text-red-400"
                                  : "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          {res.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openLiveLogs(res)}
                      className="px-2 py-1 text-xs bg-blue-600/50 rounded-lg text-white hover:bg-blue-600"
                    >
                      Live Logs
                    </button>
                    <button
                      onClick={() => viewAnalytics(res.id)}
                      className="px-2 py-1 text-xs bg-purple-600/50 rounded-lg text-white hover:bg-purple-600"
                    >
                      Analytics
                    </button>
                    <button
                      onClick={() => simulateLog(res)}
                      className="px-2 py-1 text-xs bg-green-600/50 rounded-lg text-white hover:bg-green-600"
                    >
                      Simulate Log
                    </button>
                    <button
                      onClick={() => handleDeleteResource(res.id)}
                      className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 flex flex-col gap-6">
          {/* Anomalies */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" /> Anomalies
            </h2>
            {anomalies.length === 0 ? (
              <div className="text-center py-6 text-gray-400">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <p className="text-sm">No anomalies detected</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {anomalies.map((a) => (
                  <div key={a.id} className="p-3 bg-gray-800/30 rounded-xl">
                    <div className="flex justify-between">
                      <span className="font-medium text-white">
                        {a.resourceName}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          a.severity === "high"
                            ? "bg-red-500/20 text-red-400"
                            : a.severity === "medium"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        {a.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mt-1">{a.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(a.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Recommendations */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" /> AI Processor –
              Prevention
            </h2>
            {aiRecommendations.length === 0 ? (
              <div className="text-center py-6 text-gray-400">
                <Zap className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">No active recommendations</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {aiRecommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-xl border border-purple-700/50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-white font-medium text-sm">
                          {rec.title}
                        </h3>
                        <p className="text-xs text-gray-300 mt-1">
                          {rec.description}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAIAction(rec)}
                        disabled={actionInProgress === rec.id}
                        className="px-2 py-1 bg-purple-600 rounded text-xs text-white hover:bg-purple-700 disabled:opacity-50"
                      >
                        {actionInProgress === rec.id ? "..." : rec.action}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3 p-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl text-center text-xs text-white">
              <Shield className="w-3 h-3 inline mr-1" /> AI scans for threats
              and suggests auto‑remediation.
            </div>
          </div>
        </div>
      </div>

      {/* Quick View */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Quick View</h2>
          <div className="flex space-x-2">
            {["24h", "7d", "30d"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  timeRange === range
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                    : "bg-gray-800 text-white hover:bg-gray-700"
                }`}
              >
                {range === "24h" ? "Today" : range === "7d" ? "Week" : "Month"}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-800/30 rounded-xl">
            <Activity className="w-5 h-5 text-blue-400 mb-2" />
            <p className="text-2xl font-bold text-white">
              {stats.find((s) => s.label === "Total Logs")?.value || "0"}
            </p>
            <p className="text-xs text-gray-400">Log volume</p>
          </div>
          <div className="p-4 bg-gray-800/30 rounded-xl">
            <Users className="w-5 h-5 text-green-400 mb-2" />
            <p className="text-2xl font-bold text-white">
              {resources.filter((r) => r.status === "healthy").length}
            </p>
            <p className="text-xs text-gray-400">
              Active / Total: {resources.length}
            </p>
          </div>
          <div className="p-4 bg-gray-800/30 rounded-xl">
            <Shield className="w-5 h-5 text-purple-400 mb-2" />
            <p className="text-2xl font-bold text-white">
              {aiRecommendations.length}
            </p>
            <p className="text-xs text-gray-400">Prevention actions ready</p>
          </div>
        </div>
      </div>

      {/* ==================== MODALS ==================== */}

      {/* Add Resource Modal */}
      {showAddResource && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">
              Add New Resource
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Type</label>
                <select
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  value={newResource.type}
                  onChange={(e) =>
                    setNewResource({
                      ...newResource,
                      type: e.target.value as any,
                    })
                  }
                >
                  <option value="website">Website</option>
                  <option value="container">Container</option>
                  <option value="server">Server</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  value={newResource.name}
                  onChange={(e) =>
                    setNewResource({ ...newResource, name: e.target.value })
                  }
                  placeholder="e.g., Production API"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Address / URL
                </label>
                <input
                  type="text"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  value={newResource.address}
                  onChange={(e) =>
                    setNewResource({ ...newResource, address: e.target.value })
                  }
                  placeholder="https://example.com or 10.0.0.1:8080"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddResource(false)}
                className="px-4 py-2 bg-gray-700 rounded-lg text-white hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleAddResource}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Logs Modal with Polling */}
      {selectedResource && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl max-w-6xl w-full max-h-[85vh] flex flex-col border border-gray-700 shadow-xl">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-white">
                  Live Logs – {selectedResource.name}
                </h3>
                <div
                  className={`flex items-center gap-1 text-xs ${streamActive ? "text-green-400" : "text-red-400"}`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${streamActive ? "bg-green-400 animate-pulse" : "bg-red-400"}`}
                  />
                  <span>{streamActive ? "Polling (2s)" : "Stopped"}</span>
                </div>
              </div>
              <button
                onClick={closeLiveLogs}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 border-b border-gray-700 flex flex-wrap gap-2 items-center bg-gray-800/30">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter logs..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="w-full bg-gray-800 text-white pl-8 pr-3 py-1.5 rounded text-sm border border-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex gap-1">
                {["error", "warn", "info", "debug"].map((sev) => (
                  <button
                    key={sev}
                    onClick={() =>
                      setSeverityFilter((prev) =>
                        prev.includes(sev)
                          ? prev.filter((s) => s !== sev)
                          : [...prev, sev],
                      )
                    }
                    className={`px-2 py-1 text-xs rounded font-medium ${
                      severityFilter.includes(sev)
                        ? `bg-${sev === "error" ? "red" : sev === "warn" ? "yellow" : "blue"}-600 text-white`
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    {sev.toUpperCase()}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setAutoScroll(!autoScroll)}
                className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${
                  autoScroll
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300"
                }`}
              >
                {autoScroll ? (
                  <Pause className="w-3 h-3" />
                ) : (
                  <Play className="w-3 h-3" />
                )}
                {autoScroll ? "Auto‑scroll (newest)" : "Manual"}
              </button>
              <button
                onClick={scrollToTop}
                className="px-2 py-1 text-xs bg-purple-600 rounded flex items-center gap-1"
              >
                <ArrowUp className="w-3 h-3" /> Top
              </button>
              <div className="text-xs text-gray-400 ml-auto">
                {filteredLogs.length} logs{" "}
                {filterText || severityFilter.length ? "(filtered)" : ""}
              </div>
            </div>

            <div
              ref={logsContainerRef}
              className="flex-1 overflow-y-auto p-4 font-mono text-sm"
              style={{ display: "flex", flexDirection: "column" }}
            >
              {logsLoading && filteredLogs.length === 0 ? (
                <div className="text-center text-gray-400">Loading logs...</div>
              ) : filteredLogs.length === 0 ? (
                <div className="text-center text-gray-400">
                  No logs match the current filters
                </div>
              ) : (
                filteredLogs.map((log, idx) => (
                  <div
                    key={log._id || idx}
                    className={`border-b border-gray-800 py-2 ${log.level === "ERROR" ? "bg-red-900/10" : ""}`}
                  >
                    <span className="text-gray-500 text-xs">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>{" "}
                    <span
                      className={`text-sm ${
                        log.level === "ERROR"
                          ? "text-red-400"
                          : log.level === "WARN"
                            ? "text-yellow-400"
                            : "text-gray-300"
                      }`}
                    >
                      {log.message}
                    </span>
                    {log.service && (
                      <span className="ml-2 text-xs text-gray-500">
                        [{log.service}]
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-2 border-t border-gray-700 text-xs text-gray-500 flex justify-between">
              <span>Auto‑refresh every 2 seconds</span>
              <span>New logs appear without page refresh</span>
            </div>
          </div>
        </div>
      )}

      {/* Alerts Modal */}
      {showAlerts && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[70vh] flex flex-col border border-gray-700">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="text-xl font-semibold text-white">
                Active Alerts
              </h3>
              <button
                onClick={() => setShowAlerts(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-4">
              {alerts.filter((a) => !a.resolved).length === 0 ? (
                <div className="text-center text-gray-400">
                  No active alerts
                </div>
              ) : (
                alerts
                  .filter((a) => !a.resolved)
                  .map((alert) => (
                    <div
                      key={alert.id}
                      className="p-3 bg-red-900/20 rounded-lg mb-3 border border-red-800"
                    >
                      <div className="flex justify-between">
                        <span className="font-medium text-white">
                          {alert.severity}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(alert.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-200 mt-1">
                        {alert.message}
                      </p>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalytics && analyticsData && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-2xl w-full border border-gray-700 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">
                Resource Analytics
              </h3>
              <button
                onClick={() => setShowAnalytics(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <p className="text-white">Severity breakdown (last 7 days):</p>
              {analyticsData.severity_breakdown?.map(
                (item: any, idx: number) => (
                  <div key={idx} className="flex justify-between">
                    <span className="capitalize">{item._id || "unknown"}</span>
                    <span className="text-white font-bold">{item.count}</span>
                  </div>
                ),
              )}
              {(!analyticsData.severity_breakdown ||
                analyticsData.severity_breakdown.length === 0) && (
                <p className="text-gray-400">No data available</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Wrap with ServiceProvider
export default function UserDashboardWithProvider() {
  return (
    <ServiceProvider>
      <UserDashboard />
    </ServiceProvider>
  );
}
