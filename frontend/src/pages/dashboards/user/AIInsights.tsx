import React, { useState, useEffect, useCallback } from "react";
import {
  Brain,
  Zap,
  Shield,
  RefreshCw,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { viewerApi } from "../services/api";
import { useService } from "../contexts/ServiceContext";
import ServiceSelector from "../components/ServiceSelector";

interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  action: string;
  resourceId?: string;
  status?: string;
}

const AIInsights: React.FC = () => {
  const { currentService } = useService();
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    try {
      const params = currentService ? { service: currentService } : {};
      const response = await viewerApi.getAIRecommendations(params);
      const data = response.data || response;
      setRecommendations(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load AI insights");
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  }, [currentService]);

  useEffect(() => {
    fetchRecommendations();
    // Refresh every 30 seconds
    const interval = setInterval(fetchRecommendations, 30000);
    return () => clearInterval(interval);
  }, [fetchRecommendations]);

  const applyRecommendation = async (rec: AIRecommendation) => {
    setApplying(rec.id);
    try {
      await viewerApi.applyAIRecommendation({ recommendationId: rec.id });
      // Refresh list after applying
      await fetchRecommendations();
    } catch (err) {
      console.error("Application failed", err);
    } finally {
      setApplying(null);
    }
  };

  if (loading && recommendations.length === 0) {
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
            <Brain className="w-8 h-8 text-purple-400" /> AI Insights
          </h1>
          <p className="text-blue-200">
            Intelligent recommendations to improve your system
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ServiceSelector />
          <button
            onClick={fetchRecommendations}
            className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 p-3 rounded text-red-300">{error}</div>
      )}

      {recommendations.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl p-12 text-center text-gray-400">
          <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
          No active recommendations – your system looks healthy.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 rounded-xl border border-purple-700/50 p-5"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-white font-semibold">{rec.title}</h3>
                  </div>
                  <p className="text-gray-300 text-sm">{rec.description}</p>
                  {rec.resourceId && (
                    <p className="text-xs text-gray-400 mt-2">
                      Resource ID: {rec.resourceId}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => applyRecommendation(rec)}
                  disabled={applying === rec.id}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm flex items-center gap-1"
                >
                  {applying === rec.id ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Shield className="w-4 h-4" />
                  )}
                  {rec.action}
                </button>
              </div>
              <div className="mt-3 text-xs text-gray-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> AI‑generated suggestion
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIInsights;
