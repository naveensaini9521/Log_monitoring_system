import React, { useState, useEffect, useCallback } from "react";
import {
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Filter,
  Bell,
  X,
  Play,
  Pause,
} from "lucide-react";
import { viewerApi } from "../../../services/api";
import { useService } from "../../../contexts/ServiceContext";
import ServiceSelector from "../../../components/ServiceSelector";

interface Alert {
  id: string;
  message: string;
  severity: string;
  createdAt: string;
  resolved: boolean;
  resourceId: string;
}

const Alerts: React.FC = () => {
  const { currentService } = useService();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [resolving, setResolving] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { service: currentService };
      const response = await viewerApi.getAlerts(params);
      const data = response.data || response;
      const alertsList = Array.isArray(data) ? data : [];
      setAlerts(alertsList);
    } catch (err: any) {
      console.error("Failed to fetch alerts:", err);
      setError(err.message || "Failed to load alerts");
    } finally {
      setLoading(false);
    }
  }, [currentService]);

  // Auto‑refresh every 5 seconds
  useEffect(() => {
    fetchAlerts();
    let interval: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      interval = setInterval(fetchAlerts, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchAlerts, autoRefresh]);

  // Filtering
  useEffect(() => {
    let filtered = alerts.filter((a) => !a.resolved);
    if (severityFilter.length > 0) {
      filtered = filtered.filter((a) =>
        severityFilter.includes(a.severity.toLowerCase()),
      );
    }
    setFilteredAlerts(filtered);
  }, [alerts, severityFilter]);

  const resolveAlert = async (alertId: string) => {
    setResolving(alertId);
    try {
      // If your backend supports resolve endpoint, call it; else just refresh
      (await viewerApi.resolveAlert?.(alertId)) || Promise.resolve();
      await fetchAlerts();
    } catch (err) {
      console.error("Resolve failed", err);
    } finally {
      setResolving(null);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return "border-l-red-600 bg-red-900/20";
      case "high":
        return "border-l-orange-600 bg-orange-900/20";
      case "medium":
        return "border-l-yellow-600 bg-yellow-900/20";
      default:
        return "border-l-blue-600 bg-blue-900/20";
    }
  };

  if (loading && alerts.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Bell className="w-8 h-8 text-yellow-400" /> Alerts
          </h1>
          <p className="text-blue-200">Security and system alerts</p>
        </div>
        <div className="flex items-center gap-3">
          <ServiceSelector />
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`p-2 rounded-lg ${
              autoRefresh ? "bg-green-600" : "bg-gray-700"
            }`}
            title={autoRefresh ? "Auto-refresh on" : "Auto-refresh off"}
          >
            {autoRefresh ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={fetchAlerts}
            className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 p-3 rounded text-red-300">{error}</div>
      )}

      {/* Filter bar */}
      <div className="bg-gray-800/50 rounded-xl p-3 flex flex-wrap gap-2 items-center">
        <Filter className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-300">Severity:</span>
        {["critical", "high", "medium", "low"].map((sev) => (
          <button
            key={sev}
            onClick={() =>
              setSeverityFilter((prev) =>
                prev.includes(sev)
                  ? prev.filter((s) => s !== sev)
                  : [...prev, sev],
              )
            }
            className={`px-2 py-1 text-xs rounded-full ${
              severityFilter.includes(sev)
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            {sev.toUpperCase()}
          </button>
        ))}
        {severityFilter.length > 0 && (
          <button
            onClick={() => setSeverityFilter([])}
            className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded-full"
          >
            Clear
          </button>
        )}
      </div>

      {filteredAlerts.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl p-12 text-center text-gray-400">
          <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
          No active alerts
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-xl border-l-4 p-4 ${getSeverityColor(
                alert.severity,
              )} border border-gray-700`}
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-current" />
                  <div>
                    <h3 className="text-white font-semibold">
                      {alert.severity?.toUpperCase()}
                    </h3>
                    <p className="text-gray-300 text-sm mt-1">
                      {alert.message}
                    </p>
                    <div className="text-xs text-gray-500 mt-2">
                      {new Date(alert.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => resolveAlert(alert.id)}
                  disabled={resolving === alert.id}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm flex items-center gap-1"
                >
                  <CheckCircle className="w-4 h-4" />
                  {resolving === alert.id ? "..." : "Resolve"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Alerts;
