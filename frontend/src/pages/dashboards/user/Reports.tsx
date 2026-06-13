import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Download,
  Filter,
  Search,
  Eye,
  Plus,
  Calendar,
  X,
  TrendingUp,
  AlertTriangle,
  Activity,
  Server,
  Loader2,
  ChevronDown,
  FileJson,
  FileSpreadsheet,
  FileText as FilePdf,
} from "lucide-react";
import { viewerApi } from "../../../services/api";
import { useService } from "../../../contexts/ServiceContext";
import ServiceSelector from "../../../components/ServiceSelector";

interface Report {
  id: string;
  name: string;
  type: string;
  date: string;
  size: string;
  format: string;
}

const Reports: React.FC = () => {
  const { currentService } = useService();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [generating, setGenerating] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [previewReport, setPreviewReport] = useState<any>(null);

  // Generate form state
  const [reportType, setReportType] = useState("Security");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [generationError, setGenerationError] = useState("");

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params: any = { service: currentService };
      if (filterType !== "all") params.type = filterType;
      const response = await viewerApi.getReports(params);
      const data = response.data || response;
      setReports(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filterType, currentService]);

  const handleGenerate = async () => {
    if (!currentService) {
      setGenerationError("Please select a service first.");
      return;
    }
    setGenerating(true);
    setGenerationError("");
    try {
      await viewerApi.generateReport({
        service: currentService,
        type: reportType,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      });
      setShowGenerateModal(false);
      await fetchReports();
      // Reset form
      setReportType("Security");
      const defaultStart = new Date();
      defaultStart.setDate(defaultStart.getDate() - 7);
      setStartDate(defaultStart.toISOString().split("T")[0]);
      setEndDate(new Date().toISOString().split("T")[0]);
    } catch (error: any) {
      console.error("Generation failed:", error);
      setGenerationError(
        error.response?.data?.error || "Failed to generate report",
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (reportId: string, format: string) => {
    try {
      const response = await viewerApi.downloadReport(reportId, format);
      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report_${reportId}.${format === "json" ? "json" : "csv"}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handlePreview = async (reportId: string) => {
    try {
      const response = await viewerApi.downloadReport(reportId, "json");
      const text = await response.data.text();
      setPreviewReport(JSON.parse(text));
    } catch (error) {
      console.error("Preview failed:", error);
    }
  };

  const filteredReports = reports.filter(
    (r) =>
      r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.type?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Security":
        return "bg-red-900/40 text-red-300";
      case "Performance":
        return "bg-blue-900/40 text-blue-300";
      case "Compliance":
        return "bg-purple-900/40 text-purple-300";
      default:
        return "bg-gray-700 text-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Reports</h1>
          <p className="text-blue-200">
            Generate and export professional analytics reports
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ServiceSelector />
          <button
            onClick={() => setShowGenerateModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl text-white font-medium flex items-center gap-2 hover:shadow-lg transition"
          >
            <Plus className="w-4 h-4" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-xl text-white focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-white"
            >
              <option value="all">All Types</option>
              <option value="Security">Security</option>
              <option value="Performance">Performance</option>
              <option value="Compliance">Compliance</option>
              <option value="Custom">Custom</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/80 border-b border-gray-700">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">
                  Report Name
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">
                  Type
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">
                  Date
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">
                  Size
                </th>
                <th className="text-right py-4 px-6 text-sm font-medium text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-400" />
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">
                    No reports found. Generate your first report.
                  </td>
                </tr>
              ) : (
                filteredReports.map((report, idx) => (
                  <motion.tr
                    key={report.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-gray-800/40 transition"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-400" />
                        <span className="text-white font-medium">
                          {report.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-medium ${getTypeColor(report.type)}`}
                      >
                        {report.type}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-300">{report.date}</td>
                    <td className="py-4 px-6 text-gray-300">{report.size}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handlePreview(report.id)}
                          className="p-2 hover:bg-gray-700 rounded-lg transition"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                        <div className="relative group">
                          <button className="p-2 hover:bg-gray-700 rounded-lg">
                            <Download className="w-4 h-4 text-gray-400" />
                          </button>
                          <div className="absolute right-0 mt-2 w-32 bg-gray-800 rounded-lg shadow-lg hidden group-hover:block z-10 border border-gray-700">
                            <button
                              onClick={() => handleDownload(report.id, "json")}
                              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700"
                            >
                              JSON
                            </button>
                            <button
                              onClick={() => handleDownload(report.id, "csv")}
                              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700"
                            >
                              CSV
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Report Modal */}
      <AnimatePresence>
        {showGenerateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-gray-800 rounded-2xl max-w-lg w-full border border-gray-700 shadow-2xl"
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white">
                  Generate New Report
                </h2>
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Report Type
                  </label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option>Security</option>
                    <option>Performance</option>
                    <option>Compliance</option>
                    <option>Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                {generationError && (
                  <div className="bg-red-900/30 text-red-300 p-3 rounded-lg text-sm">
                    {generationError}
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 p-6 pt-0">
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 bg-gray-700 rounded-lg text-white hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="px-4 py-2 bg-green-600 rounded-lg text-white hover:bg-green-700 flex items-center gap-2"
                >
                  {generating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  {generating ? "Generating..." : "Generate"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report Preview Modal */}
      <AnimatePresence>
        {previewReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col border border-gray-700"
            >
              <div className="flex justify-between items-center p-4 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-white">
                  Report Preview
                </h2>
                <button
                  onClick={() => setPreviewReport(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-900/50 p-3 rounded-lg">
                    <div className="text-gray-400 text-sm">Total Logs</div>
                    <div className="text-2xl font-bold text-white">
                      {previewReport.metrics.total_logs}
                    </div>
                  </div>
                  <div className="bg-gray-900/50 p-3 rounded-lg">
                    <div className="text-gray-400 text-sm">Errors</div>
                    <div className="text-2xl font-bold text-red-400">
                      {previewReport.metrics.errors}
                    </div>
                  </div>
                  <div className="bg-gray-900/50 p-3 rounded-lg">
                    <div className="text-gray-400 text-sm">Warnings</div>
                    <div className="text-2xl font-bold text-yellow-400">
                      {previewReport.metrics.warns}
                    </div>
                  </div>
                  <div className="bg-gray-900/50 p-3 rounded-lg">
                    <div className="text-gray-400 text-sm">Anomalies</div>
                    <div className="text-2xl font-bold text-purple-400">
                      {previewReport.anomalies_detected}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2">Top Errors</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {previewReport.top_errors.map((err: any, i: number) => (
                      <div
                        key={i}
                        className="bg-gray-900/30 p-2 rounded text-sm"
                      >
                        <span className="text-red-300">
                          {err.message.substring(0, 100)}
                        </span>
                        <span className="text-gray-400 ml-2">
                          ({err.count}x)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  Generated at:{" "}
                  {new Date(previewReport.generated_at).toLocaleString()}
                </div>
              </div>
              <div className="p-4 border-t border-gray-700 flex justify-end">
                <button
                  onClick={() => setPreviewReport(null)}
                  className="px-4 py-2 bg-blue-600 rounded-lg text-white"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Reports;
