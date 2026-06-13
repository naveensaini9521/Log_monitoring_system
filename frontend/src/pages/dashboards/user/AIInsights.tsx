// AIInsights.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Brain,
  Zap,
  Shield,
  RefreshCw,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { viewerApi } from "../../../services/api";
import { useService } from "../../../contexts/ServiceContext";
import ServiceSelector from "../../../components/ServiceSelector";

const AIInsights: React.FC = () => {
  const { currentService } = useService();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    try {
      const params = currentService ? { service: currentService } : {};
      const response = await viewerApi.getAIRecommendations(params);
      const data = response.data || response;
      setRecommendations(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load");
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  }, [currentService]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <RefreshCw className="animate-spin w-8 h-8 text-blue-400" />
      </div>
    );
  if (error)
    return (
      <div className="bg-red-900/30 p-3 rounded text-red-300">{error}</div>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Brain className="w-8 h-8 text-purple-400" /> AI Insights
          </h1>
          <p className="text-blue-200">
            Intelligent recommendations to improve your system
          </p>
        </div>
        <div className="flex gap-3">
          <ServiceSelector />
          <button
            onClick={fetchRecommendations}
            className="p-2 bg-gray-700 rounded-lg"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

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
              className="bg-purple-900/30 rounded-xl border border-purple-700/50 p-5"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-white font-semibold">{rec.title}</h3>
                  <p className="text-gray-300 text-sm mt-1">
                    {rec.description}
                  </p>
                </div>
                <button className="px-3 py-1.5 bg-purple-600 rounded-lg text-white text-sm">
                  <Shield className="w-4 h-4 inline mr-1" /> {rec.action}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIInsights;
