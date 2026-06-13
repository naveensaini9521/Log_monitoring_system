import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  Play,
  Pause,
  ArrowDown,
  Trash2,
  AlertCircle,
  AlertTriangle,
  Info,
  Bug,
  Terminal,
  PlusCircle,
  Server,
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

const Logs: React.FC = () => {
  const { currentService, setCurrentService } = useService();
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedResource, setSelectedResource] = useState<string>("");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [refreshInterval] = useState(2000);
  const [sendingTest, setSendingTest] = useState(false);
  const logsContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef(autoScroll);

  useEffect(() => {
    autoScrollRef.current = autoScroll;
  }, [autoScroll]);

  const fetchResources = async () => {
    try {
      const response = await viewerApi.getResources({});
      const data = response.data || response;
      const resourcesList = Array.isArray(data) ? data : [];
      setResources(resourcesList);
      if (resourcesList.length > 0 && !selectedResource) {
        const defaultResource =
          resourcesList[0].address || resourcesList[0].name;
        setSelectedResource(defaultResource);
        if (setCurrentService) setCurrentService(defaultResource);
      }
    } catch (err) {
      console.error("Failed to fetch resources:", err);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchLogs = useCallback(async () => {
    if (!selectedResource) {
      setLogs([]);
      setError(null);
      return;
    }
    setLoading(true);
    try {
      const url = `${FASTAPI_BASE}/api/logs/${encodeURIComponent(selectedResource)}`;
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
  }, [selectedResource]);

  useEffect(() => {
    fetchLogs();
    let interval: NodeJS.Timeout | null = null;
    if (autoRefresh && selectedResource) {
      interval = setInterval(fetchLogs, refreshInterval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchLogs, autoRefresh, refreshInterval, selectedResource]);

  useEffect(() => {
    let filtered = [...logs];
    if (searchTerm.trim()) {
      filtered = filtered.filter((log) =>
        log.message.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    if (severityFilter.length > 0) {
      filtered = filtered.filter((log) =>
        severityFilter.includes((log.level || "info").toLowerCase()),
      );
    }
    setFilteredLogs(filtered);
  }, [logs, searchTerm, severityFilter]);

  useEffect(() => {
    if (autoScrollRef.current && logsContainerRef.current) {
      logsContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [filteredLogs]);

  const handleExport = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logs_${selectedResource}_${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSeverityFilter([]);
  };

  const sendTestLog = async () => {
    if (!selectedResource) return;
    setSendingTest(true);
    try {
      const testMessage = `[${new Date().toISOString()}] INFO: Test log from Logs page for ${selectedResource}`;
      const response = await fetch(`${FASTAPI_BASE}/api/ingest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": "test-key",
        },
        body: JSON.stringify({
          service: selectedResource,
          host: window.location.hostname,
          source: "logs-page",
          logs: [testMessage],
        }),
      });
      if (response.ok) {
        fetchLogs();
        alert("Test log sent successfully!");
      } else {
        alert("Failed to send test log");
      }
    } catch (err) {
      console.error(err);
      alert("Error sending test log");
    } finally {
      setSendingTest(false);
    }
  };

  const getSeverityIcon = (level?: string) => {
    const lvl = (level || "info").toLowerCase();
    switch (lvl) {
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case "warn":
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case "debug":
        return <Bug className="w-4 h-4 text-purple-400" />;
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const getSeverityBadge = (level?: string) => {
    const lvl = (level || "info").toLowerCase();
    const colors = {
      error: "bg-red-900/40 text-red-300 border-red-700",
      warn: "bg-yellow-900/40 text-yellow-300 border-yellow-700",
      info: "bg-blue-900/40 text-blue-300 border-blue-700",
      debug: "bg-purple-900/40 text-purple-300 border-purple-700",
    };
    return colors[lvl as keyof typeof colors] || colors.info;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Terminal className="w-8 h-8 text-blue-400" />
            Live Logs
          </h1>
          <p className="text-blue-200">
            Real‑time log streaming from your resources
          </p>
        </div>
        <button
          onClick={sendTestLog}
          disabled={sendingTest || !selectedResource}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-xl text-white flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          {sendingTest ? "Sending..." : "Test Log"}
        </button>
      </div>

      {/* Resource Selector - FIXED: added key prop */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <Server className="w-5 h-5 text-gray-400" />
          <select
            value={selectedResource}
            onChange={(e) => {
              setSelectedResource(e.target.value);
              if (setCurrentService) setCurrentService(e.target.value);
            }}
            className="flex-1 bg-gray-900 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-blue-500"
          >
            <option value="">Select a resource...</option>
            {resources.map((res) => (
              <option key={res.id} value={res.address || res.name}>
                {" "}
                {/* ✅ key added */}
                {res.name} ({res.type})
              </option>
            ))}
          </select>
          <button
            onClick={fetchResources}
            className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600"
            title="Refresh resources"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Control Bar (unchanged) */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900 text-white pl-9 pr-3 py-2 rounded-lg border border-gray-700 focus:border-blue-500"
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
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                  severityFilter.includes(sev)
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300"
                }`}
              >
                {sev.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 ${
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
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 ${
              autoScroll
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            <ArrowDown className="w-4 h-4" />
            Auto-scroll
          </button>
          <button
            onClick={handleClearFilters}
            className="px-3 py-1.5 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> Clear
          </button>
          <button
            onClick={handleExport}
            disabled={filteredLogs.length === 0}
            className="px-3 py-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> Export JSON
          </button>
          <button
            onClick={fetchLogs}
            className="p-1.5 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Logs Display */}
      <div className="bg-gray-900/80 rounded-xl border border-gray-700 overflow-hidden">
        <div className="bg-gray-800/50 px-4 py-2 border-b border-gray-700 flex justify-between text-xs text-gray-400">
          <span>
            {filteredLogs.length} logs {searchTerm && "(filtered)"}
          </span>
          <span>Auto‑refresh every {refreshInterval / 1000}s</span>
        </div>
        <div
          ref={logsContainerRef}
          className="h-[calc(100vh-420px)] overflow-y-auto font-mono text-sm"
        >
          {!selectedResource && (
            <div className="text-center py-12 text-yellow-400">
              Select a resource to view logs.
            </div>
          )}
          {error && (
            <div className="text-center py-12 text-red-400">Error: {error}</div>
          )}
          {loading && selectedResource && logs.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
              Fetching logs...
            </div>
          )}
          {!loading && selectedResource && filteredLogs.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              No logs found. Click "Test Log" to send a sample.
            </div>
          )}
          {filteredLogs.map((log, idx) => (
            <div
              key={log._id || idx}
              className="border-b border-gray-800 hover:bg-gray-800/30 py-2 px-4"
            >
              <div className="flex flex-wrap gap-2 items-start">
                <span className="text-gray-500 text-xs whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${getSeverityBadge(log.level)}`}
                >
                  {getSeverityIcon(log.level)}{" "}
                  {(log.level || "INFO").toUpperCase()}
                </span>
                <span className="text-gray-300 break-all flex-1">
                  {log.message}
                </span>
                {log.service && (
                  <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
                    {log.service}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Logs;
