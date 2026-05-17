import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  Filter,
  Search,
  Eye,
  Plus,
  Calendar,
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
  const [exporting, setExporting] = useState(false);
  const [generating, setGenerating] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params =
        filterType !== "all"
          ? { type: filterType, service: currentService }
          : { service: currentService };
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

  const handleExport = async (reportId?: string) => {
    setExporting(true);
    try {
      const blob = await viewerApi.exportData({
        type: reportId ? "report" : "logs",
        reportId,
        format: "csv",
        service: currentService,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report_${new Date().toISOString()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setExporting(false);
    }
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      await viewerApi.generateReport({
        service: currentService,
        type: "weekly",
      });
      await fetchReports();
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setGenerating(false);
    }
  };

  const filteredReports = reports.filter(
    (r) =>
      r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.type?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Reports</h1>
          <p className="text-blue-200">Access and export system reports</p>
        </div>
        <div className="flex items-center gap-3">
          <ServiceSelector />
          <button
            onClick={generateReport}
            disabled={generating}
            className="px-4 py-2 bg-green-600 rounded-xl text-white font-medium flex items-center gap-2 hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
            {generating ? "Generating..." : "New Report"}
          </button>
          <button
            onClick={() => handleExport()}
            disabled={exporting}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white font-medium flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {exporting ? "Exporting..." : "Export All Logs"}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800/50 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white"
            >
              <option value="all">All Types</option>
              <option value="Security">Security</option>
              <option value="Performance">Performance</option>
              <option value="Analytics">Analytics</option>
              <option value="Compliance">Compliance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800 border-b border-gray-700">
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
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">
                    No reports found
                  </td>
                </tr>
              ) : (
                filteredReports.map((report, index) => (
                  <motion.tr
                    key={report.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-800/30"
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
                      <span className="px-2 py-1 bg-gray-700 rounded-lg text-xs text-gray-300">
                        {report.type}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-300">{report.date}</td>
                    <td className="py-4 px-6 text-gray-300">{report.size}</td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleExport(report.id)}
                        className="p-2 hover:bg-gray-700 rounded-lg"
                        title="Download"
                      >
                        <Download className="w-4 h-4 text-gray-400" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
