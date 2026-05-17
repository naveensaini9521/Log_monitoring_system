// contexts/ServiceContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { viewerApi } from "../services/api";

interface ServiceContextType {
  currentService: string | null;
  setCurrentService: (service: string | null) => void;
  availableServices: string[];
  loadingServices: boolean;
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

export const ServiceProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [currentService, setCurrentService] = useState<string | null>(() => {
    return localStorage.getItem("selectedService") || null;
  });
  const [availableServices, setAvailableServices] = useState<string[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      setLoadingServices(false);
      setAvailableServices([]);
      return;
    }

    const fetchServices = async () => {
      setLoadingServices(true);
      try {
        const response = await viewerApi.getAvailableServices();
        // Handle different response structures
        const services = response.data?.services || response.services || [];

        if (Array.isArray(services)) {
          setAvailableServices(services);
          if (!currentService && services.length > 0) {
            setCurrentService(services[0]);
          }
        } else {
          console.warn("Unexpected services response format:", response);
          setAvailableServices([]);
        }
      } catch (err) {
        console.error("Failed to load services:", err);
        setAvailableServices([]);
      } finally {
        setLoadingServices(false);
      }
    };

    fetchServices();
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    if (currentService) {
      localStorage.setItem("selectedService", currentService);
    } else {
      localStorage.removeItem("selectedService");
    }
  }, [currentService]);

  const value: ServiceContextType = {
    currentService,
    setCurrentService,
    availableServices,
    loadingServices,
  };

  return (
    <ServiceContext.Provider value={value}>{children}</ServiceContext.Provider>
  );
};

export const useService = () => {
  const ctx = useContext(ServiceContext);
  if (!ctx) throw new Error("useService must be used within ServiceProvider");
  return ctx;
};
