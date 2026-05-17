// pages/dashboards/SecurityAnalystDashboard.tsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  AlertTriangle,
  Brain,
  Activity,
  Eye,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Zap,
  Users,
  Lock,
  Globe,
  Filter,
  Download,
  AlertCircle,
  Scan,
  Target,
  Radar,
  Network,
  Server,
  Code,
  Terminal,
} from "lucide-react";
import { securityApi } from "../../services/api";
import { aiApi } from "../../services/api";
import { alertApi } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

const SecurityAnalystDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [threats, setThreats] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [threatIntel, setThreatIntel] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState("all");

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    setLoading(true);
    try {
      const [threatsData, incidentsData, intelData, anomaliesData] =
        await Promise.all([
          securityApi.getThreats({ limit: 10 }),
          securityApi.getIncidents({ status: "active" }),
          securityApi.getThreatIntelligence(),
          aiApi.getAnomalies({ severity: "high,critical" }),
        ]);

      setThreats(threatsData.data);
      setIncidents(incidentsData.data);
      setThreatIntel(intelData.data);
      setAnomalies(anomaliesData.data);
    } catch (error) {
      console.error("Error fetching security data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvestigate = async (incidentId: string) => {
    try {
      await securityApi.getIncidentDetails(incidentId);
      // Navigate to investigation page or open modal
    } catch (error) {
      console.error("Error fetching incident details:", error);
    }
  };

  const handleRunThreatHunt = async () => {
    try {
      await securityApi.runThreatHunt({
        type: "ai_assisted",
        timeframe: "24h",
      });
      // Show success message
    } catch (error) {
      console.error("Error running threat hunt:", error);
    }
  };

  const stats = [
    {
      label: "Active Threats",
      value: threats.filter((t) => t.severity !== "low").length.toString(),
      change: `+${threats.filter((t) => t.status === "new").length}`,
      icon: AlertTriangle,
      color: "from-red-500 to-pink-600",
      critical: threats.filter((t) => t.severity === "critical").length,
      high: threats.filter((t) => t.severity === "high").length,
      medium: threats.filter((t) => t.severity === "medium").length,
    },
    {
      label: "AI Detected Anomalies",
      value: anomalies.length.toString(),
      change: `+${anomalies.filter((a) => a.confidence > 90).length}`,
      icon: Brain,
      color: "from-purple-500 to-violet-600",
      confidence: "94%",
    },
    {
      label: "Open Incidents",
      value: incidents.length.toString(),
      change: incidents.filter((i) => i.priority === "high").length.toString(),
      icon: Shield,
      color: "from-orange-500 to-red-600",
      investigating: incidents.filter((i) => i.status === "investigating")
        .length,
      triage: incidents.filter((i) => i.status === "triage").length,
    },
    {
      label: "Avg Response Time",
      value: "4.2m",
      change: "-1.3m",
      icon: Clock,
      color: "from-green-500 to-emerald-600",
      target: "< 5m",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-75 animate-pulse"></div>
          <div className="relative bg-gray-900 p-6 rounded-full">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with AI Status */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Security Analyst Dashboard
          </h1>
          <p className="text-blue-200">Welcome back, {user?.name}</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleRunThreatHunt}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-medium flex items-center space-x-2"
          >
            <Brain className="w-4 h-4" />
            <span>Run AI Threat Scan</span>
          </button>
          <button className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 rounded-xl text-red-300 font-medium flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Active Incidents: {incidents.length}</span>
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
              <span
                className={`text-sm font-medium ${
                  stat.change.startsWith("+")
                    ? "text-red-400"
                    : "text-green-400"
                }`}
              >
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
            <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
            {stat.critical !== undefined && (
              <div className="flex space-x-2 text-xs">
                <span className="text-red-400">Critical: {stat.critical}</span>
                <span className="text-orange-400">High: {stat.high}</span>
                <span className="text-yellow-400">Medium: {stat.medium}</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Threats List */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Active Threats</h2>
          <div className="flex items-center space-x-2">
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-700"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
            </select>
            <button className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700">
              <Filter className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {threats.map((threat) => (
            <motion.div
              key={threat.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 bg-gray-800/30 rounded-xl hover:bg-gray-800/50 transition-colors border-l-4"
              style={{
                borderLeftColor:
                  threat.severity === "critical"
                    ? "#ef4444"
                    : threat.severity === "high"
                      ? "#f97316"
                      : threat.severity === "medium"
                        ? "#eab308"
                        : "#3b82f6",
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-white font-medium">{threat.title}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        threat.status === "new"
                          ? "bg-red-500/20 text-red-300"
                          : threat.status === "investigating"
                            ? "bg-yellow-500/20 text-yellow-300"
                            : "bg-green-500/20 text-green-300"
                      }`}
                    >
                      {threat.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">
                    {threat.description}
                  </p>
                  <div className="flex items-center space-x-4 text-xs">
                    <span className="text-gray-400">
                      Source: {threat.source}
                    </span>
                    <span className="text-gray-400">
                      Time: {threat.timestamp}
                    </span>
                    <span className="flex items-center text-purple-400">
                      <Brain className="w-3 h-3 mr-1" />
                      AI Confidence: {threat.aiConfidence}%
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {threat.affected?.map((asset: string, i: number) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300"
                      >
                        {asset}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleInvestigate(threat.id)}
                    className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600"
                  >
                    <Eye className="w-4 h-4 text-gray-300" />
                  </button>
                  <button className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700">
                    <Shield className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SecurityAnalystDashboard;
