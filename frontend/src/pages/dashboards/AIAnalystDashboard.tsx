// pages/dashboards/AIAnalystDashboard.tsx
import React from "react";
import { motion } from "framer-motion";
import {
  Brain,
  TrendingUp,
  Activity,
  Clock,
  AlertCircle,
  CheckCircle,
  BarChart3,
  LineChart,
  PieChart,
  ScatterChart,
  Network,
  Target,
  Zap,
  Layers,
  Code,
  FileText,
  Download,
  Filter,
  RefreshCw,
  Settings,
  Eye,
  Sparkles,
  MessageSquare,
  Lightbulb,
} from "lucide-react";

const AIAnalystDashboard: React.FC = () => {
  const modelMetrics = [
    {
      label: "Model Accuracy",
      value: "98.5%",
      change: "+2.3%",
      icon: Target,
      color: "from-green-500 to-emerald-600",
      trend: "up",
    },
    {
      label: "Inference Time",
      value: "124ms",
      change: "-12ms",
      icon: Clock,
      color: "from-blue-500 to-cyan-600",
      trend: "down",
    },
    {
      label: "Anomalies Found",
      value: "2,345",
      change: "+156",
      icon: AlertCircle,
      color: "from-orange-500 to-red-600",
      trend: "up",
    },
    {
      label: "Patterns Detected",
      value: "567",
      change: "+89",
      icon: Network,
      color: "from-purple-500 to-pink-600",
      trend: "up",
    },
  ];

  const aiModels = [
    {
      name: "Anomaly Detector v2",
      type: "Unsupervised Learning",
      accuracy: 99.2,
      latency: 89,
      predictions: "45.2k/day",
      status: "active",
      lastTraining: "2h ago",
    },
    {
      name: "Pattern Recognizer",
      type: "Deep Learning",
      accuracy: 97.8,
      latency: 124,
      predictions: "23.1k/day",
      status: "active",
      lastTraining: "5h ago",
    },
    {
      name: "Threat Predictor",
      type: "LSTM",
      accuracy: 96.5,
      latency: 156,
      predictions: "12.8k/day",
      status: "training",
      lastTraining: "30m ago",
    },
    {
      name: "Log Classifier",
      type: "BERT",
      accuracy: 98.9,
      latency: 67,
      predictions: "89.3k/day",
      status: "active",
      lastTraining: "1h ago",
    },
  ];

  const recentInsights = [
    {
      type: "anomaly",
      title: "Unusual traffic pattern detected",
      description: "Spike in API calls from new geographic region",
      confidence: 98,
      timestamp: "5m ago",
      affected: "api-gateway",
    },
    {
      type: "pattern",
      title: "New attack vector identified",
      description: "SQL injection attempts following specific pattern",
      confidence: 95,
      timestamp: "15m ago",
      affected: "web-app",
    },
    {
      type: "prediction",
      title: "Potential system overload",
      description: "Predicted 40% traffic increase in next hour",
      confidence: 89,
      timestamp: "25m ago",
      affected: "all-systems",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            AI Analyst Dashboard
          </h1>
          <p className="text-blue-200">
            Model Performance & Intelligent Insights
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-medium flex items-center space-x-2">
            <Brain className="w-4 h-4" />
            <span>Train New Model</span>
          </button>
          <button className="px-4 py-2 bg-gray-800 rounded-xl text-white font-medium flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Model Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {modelMetrics.map((metric, index) => (
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
              <span
                className={`text-sm font-medium ${
                  metric.trend === "up" ? "text-green-400" : "text-red-400"
                }`}
              >
                {metric.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white">{metric.value}</h3>
            <p className="text-gray-400 text-sm">{metric.label}</p>
          </motion.div>
        ))}
      </div>

      {/* AI Models Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {aiModels.map((model, index) => (
          <motion.div
            key={model.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {model.name}
                  </h3>
                  <p className="text-sm text-gray-400">{model.type}</p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  model.status === "active"
                    ? "bg-green-500/20 text-green-300"
                    : "bg-yellow-500/20 text-yellow-300"
                }`}
              >
                {model.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-400">Accuracy</p>
                <p className="text-lg font-bold text-white">
                  {model.accuracy}%
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Latency</p>
                <p className="text-lg font-bold text-white">
                  {model.latency}ms
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Predictions</p>
                <p className="text-lg font-bold text-white">
                  {model.predictions}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">
                Last trained: {model.lastTraining}
              </span>
              <button className="text-blue-400 hover:text-blue-300 flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>View Details</span>
              </button>
            </div>

            {/* Accuracy Bar */}
            <div className="mt-4">
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-400"
                  style={{ width: `${model.accuracy}%` }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {recentInsights.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6"
          >
            <div className="flex items-start space-x-3">
              <div
                className={`w-10 h-10 rounded-lg ${
                  insight.type === "anomaly"
                    ? "bg-red-500/20"
                    : insight.type === "pattern"
                      ? "bg-blue-500/20"
                      : "bg-purple-500/20"
                } flex items-center justify-center`}
              >
                {insight.type === "anomaly" && (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                )}
                {insight.type === "pattern" && (
                  <Network className="w-5 h-5 text-blue-400" />
                )}
                {insight.type === "prediction" && (
                  <Lightbulb className="w-5 h-5 text-purple-400" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-white font-medium mb-1">{insight.title}</h3>
                <p className="text-sm text-gray-400 mb-2">
                  {insight.description}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-purple-400">
                    Confidence: {insight.confidence}%
                  </span>
                  <span className="text-gray-500">{insight.timestamp}</span>
                </div>
                <div className="mt-2">
                  <span className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
                    {insight.affected}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Training Jobs */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-6">
          Active Training Jobs
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-medium">
                  Anomaly Detector v3 Training
                </h3>
                <p className="text-xs text-gray-400">
                  Epoch 45/100 · Loss: 0.0234
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="w-[45%] h-full bg-gradient-to-r from-purple-500 to-pink-500" />
              </div>
              <span className="text-sm text-white">45%</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-medium">
                  Pattern Recognizer Fine-tuning
                </h3>
                <p className="text-xs text-gray-400">
                  Epoch 23/50 · Accuracy: 96.7%
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="w-[78%] h-full bg-gradient-to-r from-blue-500 to-cyan-500" />
              </div>
              <span className="text-sm text-white">78%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAnalystDashboard;
