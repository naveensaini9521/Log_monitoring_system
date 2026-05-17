// components/ServiceSelector.tsx
import React from "react";
import { useService } from "../contexts/ServiceContext";
import { Server } from "lucide-react";

const ServiceSelector: React.FC = () => {
  const {
    currentService,
    setCurrentService,
    availableServices,
    loadingServices,
  } = useService();

  if (loadingServices)
    return <div className="w-32 h-8 bg-gray-700 rounded animate-pulse"></div>;
  if (availableServices.length === 0)
    return <div className="text-gray-400 text-sm">No services</div>;

  return (
    <div className="flex items-center space-x-3 bg-gray-800/50 rounded-lg px-3 py-1.5 border border-gray-700">
      <Server className="w-4 h-4 text-blue-400" />
      <select
        value={currentService || ""}
        onChange={(e) => setCurrentService(e.target.value || null)}
        className="bg-transparent text-white focus:outline-none text-sm cursor-pointer"
      >
        <option value="">All Services</option>
        {availableServices.map((svc) => (
          <option key={svc} value={svc}>
            {svc}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ServiceSelector;
