import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  RefreshCw,
  Download,
  Calendar,
  Server,
  AlertTriangle,
  Info,
  Play,
  Pause,
} from "lucide-react";
import { useService } from "../../../contexts/ServiceContext";
import { viewerApi } from "../../../services/api";

const FASTAPI_BASE = "http://localhost:8000";

interface LogEntry {
  _id: string;
  timestamp: string;
  message: string;
  level?: string;
  service?: string;
  source?: string;
}

interface Resource {
  id: string;
  name: string;
  address: string;
  type: string;
}

const COLORS = ["#3b82f6", "#ef4444", "#f59e0b", "#10b981", "#8b5cf6"];

const Analytics: React.FC = () => {
  const { currentService, setCurrentService } = useService();
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedService, setSelectedService] = useState<string>("");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("24h");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval] = useState(10000); // 10 seconds
  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([]);
  const [severityData, setSeverityData] = useState<any[]>([]);
  const [topSourcesData, setTopSourcesData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalLogs: 0,
    anomalies: 0,
    avgPerHour: 0,
  });

  // Fetch user's resources
  const fetchResources = async () => {
    try {
      const response = await viewerApi.getResources({});
      const data = response.data || response;
      const resourcesList = Array.isArray(data) ? data : [];
      setResources(resourcesList);
      if (resourcesList.length > 0 && !selectedService) {
        const defaultService =
          resourcesList[0].address || resourcesList[0].name;
        setSelectedService(defaultService);
        if (setCurrentService) setCurrentService(defaultService);
      }
    } catch (err) {
      console.error("Failed to fetch resources:", err);
    }
  };

  // Fetch logs for selected service
  const fetchLogs = useCallback(async () => {
    if (!selectedService) {
      setLogs([]);
      return;
    }
    setLoading(true);
    try {
      const url = `${FASTAPI_BASE}/api/logs/${encodeURIComponent(selectedService)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const newLogs = data.logs || [];
      setLogs(newLogs);
      setError(null);
    } catch (err: any) {
      console.error("Fetch logs error:", err);
      setError(err.message || "Failed to fetch logs");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [selectedService]);

  // Auto-refresh
  useEffect(() => {
    fetchLogs();
    let interval: NodeJS.Timeout | null = null;
    if (autoRefresh && selectedService) {
      interval = setInterval(fetchLogs, refreshInterval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchLogs, autoRefresh, refreshInterval, selectedService]);

  // Filter logs by time range
  useEffect(() => {
    if (!logs.length) {
      setFilteredLogs([]);
      return;
    }
    const now = new Date();
    let cutoff = new Date();
    switch (timeRange) {
      case "1h":
        cutoff.setHours(now.getHours() - 1);
        break;
      case "24h":
        cutoff.setDate(now.getDate() - 1);
        break;
      case "7d":
        cutoff.setDate(now.getDate() - 7);
        break;
      case "30d":
        cutoff.setDate(now.getDate() - 30);
        break;
      default:
        cutoff.setDate(now.getDate() - 1);
    }
    const filtered = logs.filter((log) => new Date(log.timestamp) >= cutoff);
    setFilteredLogs(filtered);
  }, [logs, timeRange]);

  // Compute analytics from filtered logs
  useEffect(() => {
    if (!filteredLogs.length) {
      setTimeSeriesData([]);
      setSeverityData([]);
      setTopSourcesData([]);
      setStats({ totalLogs: 0, anomalies: 0, avgPerHour: 0 });
      return;
    }

    // 1. Time series (group by hour)
    const hourlyMap = new Map<string, number>();
    filteredLogs.forEach((log) => {
      const date = new Date(log.timestamp);
      const hourKey = date.toISOString().slice(0, 13); // YYYY-MM-DDTHH
      hourlyMap.set(hourKey, (hourlyMap.get(hourKey) || 0) + 1);
    });
    const series = Array.from(hourlyMap.entries())
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => a.hour.localeCompare(b.hour));
    setTimeSeriesData(series);

    // 2. Severity distribution
    const severityMap = new Map<string, number>();
    filteredLogs.forEach((log) => {
      const sev = (log.level || "info").toLowerCase();
      severityMap.set(sev, (severityMap.get(sev) || 0) + 1);
    });
    const severityArray = Array.from(severityMap.entries()).map(
      ([name, value]) => ({
        name: name.toUpperCase(),
        value,
      }),
    );
    setSeverityData(severityArray);

    // 3. Top sources (if service field varies, else use resource name)
    const sourceMap = new Map<string, number>();
    filteredLogs.forEach((log) => {
      const src = log.source || log.service || selectedService;
      sourceMap.set(src, (sourceMap.get(src) || 0) + 1);
    });
    const sources = Array.from(sourceMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    setTopSourcesData(sources);

    // 4. Stats
    const total = filteredLogs.length;
    const anomaliesCount = filteredLogs.filter(
      (log) =>
        log.level?.toLowerCase() === "error" ||
        log.message.toLowerCase().includes("anomaly"),
    ).length;
    const hoursDiff =
      (new Date().getTime() - new Date(filteredLogs[0]?.timestamp).getTime()) /
      (1000 * 3600);
    const avgPerHour = hoursDiff > 0 ? Math.round(total / hoursDiff) : total;
    setStats({ totalLogs: total, anomalies: anomaliesCount, avgPerHour });
  }, [filteredLogs, selectedService]);

  useEffect(() => {
    fetchResources();
  }, []);

  const handleExport = () => {
    const dataStr = JSON.stringify(
      {
        logs: filteredLogs,
        analytics: { timeSeriesData, severityData, topSourcesData, stats },
      },
      null,
      2,
    );
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics_${selectedService}_${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-blue-200">Real‑time log analytics and insights</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 rounded-lg flex items-center gap-2 ${
              autoRefresh
                ? "bg-green-600 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            {autoRefresh ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {autoRefresh ? "Auto" : "Manual"}
          </button>
          <button
            onClick={handleExport}
            disabled={filteredLogs.length === 0}
            className="px-3 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Service / Resource Selector */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <Server className="w-5 h-5 text-gray-400" />
          <select
            value={selectedService}
            onChange={(e) => {
              setSelectedService(e.target.value);
              if (setCurrentService) setCurrentService(e.target.value);
            }}
            className="flex-1 bg-gray-900 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-blue-500"
          >
            <option value="">Select a service/resource...</option>
            {resources.map((res) => (
              <option key={res.id} value={res.address || res.name}>
                {res.name} ({res.type})
              </option>
            ))}
          </select>
          <button
            onClick={fetchLogs}
            className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600"
            title="Refresh now"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Time Range & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-4">
          <label className="text-sm text-gray-400 mb-1 block">Time Range</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="w-full bg-gray-900 text-white rounded-lg px-3 py-2 border border-gray-700"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
        <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-xl p-4">
          <div className="text-2xl font-bold text-white">{stats.totalLogs}</div>
          <div className="text-sm text-gray-300">Total Logs</div>
        </div>
        <div className="bg-gradient-to-br from-red-900/30 to-red-800/30 rounded-xl p-4">
          <div className="text-2xl font-bold text-white">{stats.anomalies}</div>
          <div className="text-sm text-gray-300">Errors / Anomalies</div>
        </div>
        <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-xl p-4">
          <div className="text-2xl font-bold text-white">
            {stats.avgPerHour}
          </div>
          <div className="text-sm text-gray-300">Avg Logs / Hour</div>
        </div>
      </div>

      {/* Charts */}
      {!selectedService ? (
        <div className="bg-gray-800/50 rounded-xl p-12 text-center text-gray-400">
          Select a service to view analytics.
        </div>
      ) : loading && logs.length === 0 ? (
        <div className="flex justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      ) : error ? (
        <div className="bg-red-900/30 rounded-xl p-6 text-red-300 text-center">
          Error: {error}. Make sure FastAPI backend is running on port 8000.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Log Volume Over Time */}
          <div className="bg-gray-800/50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Log Volume Over Time
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="hour"
                  stroke="#9CA3AF"
                  tick={{ fontSize: 10 }}
                />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1F2937", border: "none" }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Severity Distribution */}
          <div className="bg-gray-800/50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Severity Breakdown
            </h2>
            {severityData.length === 0 ? (
              <div className="h-300 flex items-center justify-center text-gray-400">
                No data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={severityData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {severityData.map((_, idx) => (
                      <Cell
                        key={`cell-${idx}`}
                        fill={COLORS[idx % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Top Log Sources */}
          <div className="bg-gray-800/50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Top Sources
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topSourcesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1F2937", border: "none" }}
                />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Sample Recent Logs */}
          <div className="bg-gray-800/50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Recent Logs
            </h2>
            <div className="space-y-2 max-h-[300px] overflow-y-auto font-mono text-xs">
              {filteredLogs.slice(0, 10).map((log, idx) => (
                <div
                  key={log._id || idx}
                  className="border-b border-gray-700 pb-1"
                >
                  <span className="text-gray-500">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>{" "}
                  <span
                    className={
                      log.level === "ERROR" ? "text-red-400" : "text-gray-300"
                    }
                  >
                    {log.message.substring(0, 100)}
                  </span>
                </div>
              ))}
              {filteredLogs.length === 0 && (
                <div className="text-gray-400">No logs in this time range.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
