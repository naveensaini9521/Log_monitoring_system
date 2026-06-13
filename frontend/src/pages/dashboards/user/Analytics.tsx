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
  ComposedChart,
  ReferenceLine,
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
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Printer,
  Search,
  GitCompare,
} from "lucide-react";
import { useService } from "../../../contexts/ServiceContext";
import { viewerApi, analyticsApi } from "../../../services/api";

const COLORS = ["#3b82f6", "#ef4444", "#f59e0b", "#10b981", "#8b5cf6"];

// Helper to format date for display
const formatDate = (iso: string) => new Date(iso).toLocaleString();

// Helper to compute anomaly threshold (points > mean + 2*stdDev)
const findAnomalies = (data: any[]) => {
  if (!data.length) return [];
  const errors = data.map((d) => d.errors);
  const mean = errors.reduce((a, b) => a + b, 0) / errors.length;
  const variance =
    errors.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / errors.length;
  const stdDev = Math.sqrt(variance);
  const threshold = mean + 2 * stdDev;
  return data.filter((point) => point.errors > threshold);
};

const Analytics: React.FC = () => {
  const { currentService, setCurrentService } = useService();
  const [resources, setResources] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<string>("");
  const [compareService, setCompareService] = useState<string>("");
  const [timeSeries, setTimeSeries] = useState<any[]>([]);
  const [compareTimeSeries, setCompareTimeSeries] = useState<any[]>([]);
  const [topErrors, setTopErrors] = useState<any[]>([]);
  const [severityData, setSeverityData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRangeType, setDateRangeType] = useState<"days" | "custom">("days");
  const [days, setDays] = useState(7);
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState<string>(
    () => new Date().toISOString().split("T")[0],
  );
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval] = useState(30000);
  const [exporting, setExporting] = useState(false);
  const [highlightAnomalies, setHighlightAnomalies] = useState(true);
  const [logSearch, setLogSearch] = useState("");
  const [filteredLogs, setFilteredLogs] = useState<any[]>([]);
  const [allLogs, setAllLogs] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalLogs: 0,
    totalErrors: 0,
    errorRate: "0%",
    avgPerHour: 0,
    peakErrorHour: "",
    uniqueErrors: 0,
  });

  // Fetch resources (same as before)
  const fetchResources = async () => {
    try {
      const res = await viewerApi.getResources({});
      const data = res.data || res;
      setResources(Array.isArray(data) ? data : []);
      if (Array.isArray(data) && data.length > 0 && !selectedService) {
        const defaultService = data[0].address || data[0].name;
        setSelectedService(defaultService);
        setCurrentService?.(defaultService);
      }
    } catch (err) {
      console.error("Failed to fetch resources", err);
    }
  };

  // Fetch logs for a service (used for top errors and severity)
  const fetchRawLogs = useCallback(async (service: string) => {
    if (!service) return [];
    try {
      const url = `http://localhost:8000/api/logs/${encodeURIComponent(service)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.logs || [];
    } catch (err) {
      console.error(`Failed to fetch logs for ${service}`, err);
      return [];
    }
  }, []);

  // Fetch analytics data for a service (time series)
  const fetchTimeSeries = useCallback(
    async (service: string, start: Date, end: Date) => {
      if (!service) return [];
      try {
        // Convert date range to days approximation (simplified)
        const diffDays = Math.ceil(
          (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
        );
        const res = await analyticsApi.getTimeSeries(service, diffDays);
        const data = res.data || res;
        return Array.isArray(data) ? data : [];
      } catch (err) {
        console.error(`Failed to fetch time series for ${service}`, err);
        return [];
      }
    },
    [],
  );

  const getDateRange = () => {
    let start: Date,
      end: Date = new Date();
    if (dateRangeType === "days") {
      start = new Date();
      start.setDate(start.getDate() - days);
    } else {
      start = new Date(startDate);
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    }
    return { start, end };
  };

  // Main fetch function
  const fetchAnalytics = useCallback(async () => {
    if (!selectedService) return;
    setLoading(true);
    setError(null);
    try {
      const { start, end } = getDateRange();

      // 1. Time series for main service
      const mainSeries = await fetchTimeSeries(selectedService, start, end);
      setTimeSeries(mainSeries);

      // 2. Time series for compare service (if selected)
      if (compareService && compareService !== selectedService) {
        const compareSeries = await fetchTimeSeries(compareService, start, end);
        setCompareTimeSeries(compareSeries);
      } else {
        setCompareTimeSeries([]);
      }

      // 3. Raw logs for top errors and severity breakdown
      const logs = await fetchRawLogs(selectedService);
      setAllLogs(logs);
      // Filter logs by date range
      const filteredByDate = logs.filter((log: any) => {
        const logDate = new Date(log.timestamp);
        return logDate >= start && logDate <= end;
      });

      // 4. Top errors (aggregate client-side for now; backend endpoint already exists but we use raw logs for consistency)
      const errorMap = new Map<string, { count: number; last_seen: Date }>();
      filteredByDate.forEach((log: any) => {
        if (log.level === "ERROR") {
          const msg = log.message;
          const existing = errorMap.get(msg);
          if (existing) {
            existing.count++;
            if (new Date(log.timestamp) > existing.last_seen)
              existing.last_seen = new Date(log.timestamp);
          } else {
            errorMap.set(msg, { count: 1, last_seen: new Date(log.timestamp) });
          }
        }
      });
      const topErrorsArray = Array.from(errorMap.entries())
        .map(([message, { count, last_seen }]) => ({
          message,
          count,
          last_seen: last_seen.toISOString(),
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      setTopErrors(topErrorsArray);

      // 5. Severity breakdown
      const severityMap = new Map<string, number>();
      filteredByDate.forEach((log: any) => {
        const sev = (log.level || "info").toLowerCase();
        severityMap.set(sev, (severityMap.get(sev) || 0) + 1);
      });
      const severityArray = Array.from(severityMap.entries()).map(
        ([name, value]) => ({ name: name.toUpperCase(), value }),
      );
      setSeverityData(severityArray);

      // 6. Compute stats
      const totalLogs = filteredByDate.length;
      const totalErrors = topErrorsArray.reduce((sum, e) => sum + e.count, 0);
      const errorRate = totalLogs
        ? ((totalErrors / totalLogs) * 100).toFixed(1)
        : "0";
      const hoursDiff = Math.max(
        1,
        (end.getTime() - start.getTime()) / (1000 * 3600),
      );
      const avgPerHour = Math.round(totalLogs / hoursDiff);
      let peakErrorHour = "";
      let maxErrors = 0;
      mainSeries.forEach((point) => {
        if (point.errors > maxErrors) {
          maxErrors = point.errors;
          peakErrorHour = new Date(point.timestamp).toLocaleString();
        }
      });
      setStats({
        totalLogs,
        totalErrors,
        errorRate: `${errorRate}%`,
        avgPerHour,
        peakErrorHour: peakErrorHour || "N/A",
        uniqueErrors: errorMap.size,
      });
    } catch (err: any) {
      console.error("Analytics fetch error:", err);
      setError(err.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [
    selectedService,
    compareService,
    dateRangeType,
    days,
    startDate,
    endDate,
    fetchTimeSeries,
    fetchRawLogs,
  ]);

  // Filter logs by search term
  useEffect(() => {
    if (!logSearch.trim()) {
      setFilteredLogs(allLogs);
    } else {
      const filtered = allLogs.filter((log: any) =>
        log.message.toLowerCase().includes(logSearch.toLowerCase()),
      );
      setFilteredLogs(filtered);
    }
  }, [logSearch, allLogs]);

  // Auto-refresh effect
  useEffect(() => {
    fetchAnalytics();
    let interval: NodeJS.Timeout | null = null;
    if (autoRefresh && selectedService) {
      interval = setInterval(fetchAnalytics, refreshInterval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchAnalytics, autoRefresh, refreshInterval, selectedService]);

  useEffect(() => {
    fetchResources();
  }, []);

  // Anomaly points for highlighting
  const anomalyPoints = highlightAnomalies ? findAnomalies(timeSeries) : [];

  const handleExportCSV = () => {
    if (!timeSeries.length) return;
    setExporting(true);
    const headers = ["Timestamp", "Log Count", "Error Count"];
    const rows = timeSeries.map((point) => [
      new Date(point.timestamp).toLocaleString(),
      point.count,
      point.errors,
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics_${selectedService}_${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  };

  const handleExportJSON = () => {
    const exportData = {
      service: selectedService,
      compareService: compareService || null,
      dateRange: dateRangeType === "days" ? { days } : { startDate, endDate },
      generatedAt: new Date().toISOString(),
      timeSeries,
      compareTimeSeries,
      topErrors,
      severityData,
      stats,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics_${selectedService}_${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 p-6 bg-gray-900 min-h-screen text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:block">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Advanced Analytics
          </h1>
          <p className="text-gray-400">
            Real‑time log intelligence & anomaly detection
          </p>
        </div>
        <div className="flex gap-2 print:hidden">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 rounded-lg flex items-center gap-2 transition ${
              autoRefresh
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            {autoRefresh ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {autoRefresh ? "Live" : "Manual"}
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-2 bg-blue-600 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Printer className="w-4 h-4" /> PDF
          </button>
          <div className="relative group">
            <button className="px-3 py-2 bg-purple-600 rounded-lg flex items-center gap-2 hover:bg-purple-700">
              <Download className="w-4 h-4" /> Export
            </button>
            <div className="absolute right-0 mt-2 w-36 bg-gray-800 rounded-lg shadow-lg hidden group-hover:block z-10">
              <button
                onClick={handleExportCSV}
                className="block w-full text-left px-4 py-2 hover:bg-gray-700"
              >
                CSV
              </button>
              <button
                onClick={handleExportJSON}
                className="block w-full text-left px-4 py-2 hover:bg-gray-700"
              >
                JSON
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Service & Compare selectors + Date range */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 print:grid-cols-1">
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <label className="text-sm text-gray-400 flex items-center gap-2 mb-2">
            <Server className="w-4 h-4" /> Main Service
          </label>
          <select
            value={selectedService}
            onChange={(e) => {
              setSelectedService(e.target.value);
              setCurrentService?.(e.target.value);
            }}
            className="w-full bg-gray-900 text-white rounded-lg px-3 py-2 border border-gray-700"
          >
            <option value="">Select a service...</option>
            {resources.map((res) => (
              <option key={res.id} value={res.address || res.name}>
                {res.name} ({res.type})
              </option>
            ))}
          </select>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <label className="text-sm text-gray-400 flex items-center gap-2 mb-2">
            <GitCompare className="w-4 h-4" /> Compare with (optional)
          </label>
          <select
            value={compareService}
            onChange={(e) => setCompareService(e.target.value)}
            className="w-full bg-gray-900 text-white rounded-lg px-3 py-2 border border-gray-700"
          >
            <option value="">None</option>
            {resources
              .filter((r) => (r.address || r.name) !== selectedService)
              .map((res) => (
                <option key={res.id} value={res.address || res.name}>
                  {res.name} ({res.type})
                </option>
              ))}
          </select>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <label className="text-sm text-gray-400 flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4" /> Date range
          </label>
          <select
            value={dateRangeType}
            onChange={(e) =>
              setDateRangeType(e.target.value as "days" | "custom")
            }
            className="w-full bg-gray-900 text-white rounded-lg px-3 py-2 border border-gray-700 mb-2"
          >
            <option value="days">Last N days</option>
            <option value="custom">Custom range</option>
          </select>
          {dateRangeType === "days" ? (
            <select
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="w-full bg-gray-900 rounded-lg px-3 py-2"
            >
              <option value={1}>Last 24 hours</option>
              <option value={3}>Last 3 days</option>
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
            </select>
          ) : (
            <div className="flex flex-col gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-gray-900 rounded px-3 py-2 border border-gray-700"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-gray-900 rounded px-3 py-2 border border-gray-700"
              />
            </div>
          )}
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="text-2xl font-bold">
              {stats.totalLogs.toLocaleString()}
            </div>
            <div className="text-xs text-gray-400">Total logs</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-400">
              {stats.totalErrors}
            </div>
            <div className="text-xs text-gray-400">Errors</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-400">
              {stats.errorRate}
            </div>
            <div className="text-xs text-gray-400">Error rate</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">
              {stats.avgPerHour}
            </div>
            <div className="text-xs text-gray-400">Logs/hour avg</div>
          </div>
        </div>
      </div>

      {/* Additional stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800/30 rounded-xl p-3 text-center">
          <div className="text-sm text-gray-400">Peak error hour</div>
          <div className="font-mono text-sm">{stats.peakErrorHour}</div>
        </div>
        <div className="bg-gray-800/30 rounded-xl p-3 text-center">
          <div className="text-sm text-gray-400">Unique error messages</div>
          <div className="font-mono text-sm">{stats.uniqueErrors}</div>
        </div>
        <div className="bg-gray-800/30 rounded-xl p-3 text-center">
          <div className="text-sm text-gray-400 flex items-center justify-center gap-1">
            <Activity className="w-3 h-3" /> Trend
          </div>
          <div className="font-mono text-sm">
            {timeSeries.length > 1 &&
            timeSeries[timeSeries.length - 1].errors > timeSeries[0].errors ? (
              <span className="text-red-400">
                <TrendingUp className="w-4 h-4 inline" /> Increasing
              </span>
            ) : (
              <span className="text-green-400">
                <TrendingDown className="w-4 h-4 inline" /> Decreasing/Stable
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main charts */}
      {!selectedService ? (
        <div className="bg-gray-800/50 rounded-xl p-12 text-center text-gray-400">
          Select a service to begin analysis.
        </div>
      ) : loading ? (
        <div className="flex justify-center py-12">
          <RefreshCw className="animate-spin w-8 h-8 text-blue-400" />
        </div>
      ) : error ? (
        <div className="bg-red-900/30 p-6 rounded-xl text-red-300 text-center">
          {error}
        </div>
      ) : (
        <>
          {/* Log volume + error trend with anomaly highlighting */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" /> Log & Error
                Trends
              </h2>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={highlightAnomalies}
                  onChange={(e) => setHighlightAnomalies(e.target.checked)}
                  className="rounded"
                />
                Highlight anomalies
              </label>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={timeSeries}>
                <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(tick) => new Date(tick).toLocaleDateString()}
                  stroke="#9CA3AF"
                />
                <YAxis yAxisId="left" stroke="#3b82f6" />
                <YAxis yAxisId="right" orientation="right" stroke="#ef4444" />
                <Tooltip
                  labelFormatter={(label) => new Date(label).toLocaleString()}
                  contentStyle={{ backgroundColor: "#1F2937", border: "none" }}
                />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="count"
                  fill="#3b82f6"
                  fillOpacity={0.2}
                  stroke="#3b82f6"
                  name="Log Volume"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="errors"
                  stroke="#ef4444"
                  name="Errors"
                  strokeWidth={2}
                />
                {compareTimeSeries.length > 0 && (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="count"
                    data={compareTimeSeries}
                    stroke="#10b981"
                    name={`${compareService} Logs`}
                    strokeWidth={2}
                  />
                )}
                {highlightAnomalies &&
                  anomalyPoints.map((point, idx) => (
                    <ReferenceLine
                      key={idx}
                      x={point.timestamp}
                      stroke="#f59e0b"
                      strokeDasharray="5 5"
                      label="Anomaly"
                    />
                  ))}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Severity pie chart */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4">
                Severity Distribution
              </h2>
              {severityData.length ? (
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
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-gray-400 py-12">
                  No severity data
                </div>
              )}
            </div>

            {/* Top error messages table */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" /> Most Frequent
                Errors
              </h2>
              <div className="overflow-x-auto max-h-80">
                <table className="w-full text-sm">
                  <thead className="text-gray-400 border-b border-gray-700">
                    <tr>
                      <th className="text-left py-2">Message</th>
                      <th className="text-right">Count</th>
                      <th className="text-right">Last Seen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topErrors.map((err, idx) => (
                      <tr key={idx} className="border-b border-gray-800">
                        <td
                          className="py-2 truncate max-w-md"
                          title={err.message}
                        >
                          {err.message.substring(0, 60)}
                        </td>
                        <td className="text-right font-mono">{err.count}</td>
                        <td className="text-right text-gray-400 text-xs">
                          {formatDate(err.last_seen)}
                        </td>
                      </tr>
                    ))}
                    {topErrors.length === 0 && (
                      <tr>
                        <td
                          colSpan={3}
                          className="text-center py-4 text-gray-400"
                        >
                          No errors recorded
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Log search & recent logs */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Logs</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  className="pl-9 pr-3 py-1 bg-gray-900 rounded-lg border border-gray-700 text-white text-sm w-64"
                />
              </div>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto font-mono text-xs">
              {(logSearch ? filteredLogs : allLogs)
                .slice(0, 20)
                .map((log: any, idx: number) => (
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
                      {log.message.substring(0, 150)}
                    </span>
                  </div>
                ))}
              {allLogs.length === 0 && (
                <div className="text-center text-gray-400">
                  No logs in this time range.
                </div>
              )}
            </div>
          </div>

          {/* AI Insights (enhanced) */}
          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-4 border border-blue-800/50">
            <div className="flex items-center gap-2 text-blue-300">
              <Zap className="w-5 h-5" /> AI‑Powered Insights
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2 text-sm">
              <div>
                📊 Error rate {stats.errorRate} –{" "}
                {parseFloat(stats.errorRate) > 5
                  ? "⚠️ Above normal threshold"
                  : "✅ Within acceptable range"}
              </div>
              <div>🕒 Peak error hour: {stats.peakErrorHour}</div>
              <div>🚨 {stats.uniqueErrors} unique error types detected</div>
              <div>
                📈{" "}
                {timeSeries.length > 1 &&
                  (timeSeries[timeSeries.length - 1].errors >
                  timeSeries[0].errors
                    ? "Error trend is rising"
                    : "Error trend is stable or decreasing")}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
