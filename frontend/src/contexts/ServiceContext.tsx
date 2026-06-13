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

const ALL_SERVICES_KEY = "__all__";

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
  // ✅ Always start with null (All Services)
  const [currentService, setCurrentService] = useState<string | null>(null);
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
        const services = response.data?.services || response.services || [];
        if (Array.isArray(services)) {
          // Prepend internal "All Services" marker
          setAvailableServices([ALL_SERVICES_KEY, ...services]);
        } else {
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
    if (currentService === null) {
      localStorage.setItem("selectedService", ALL_SERVICES_KEY);
    } else if (currentService) {
      localStorage.setItem("selectedService", currentService);
    }
  }, [currentService]);

  return (
    <ServiceContext.Provider
      value={{
        currentService,
        setCurrentService,
        availableServices,
        loadingServices,
      }}
    >
      {children}
    </ServiceContext.Provider>
  );
};

export const useService = () => {
  const ctx = useContext(ServiceContext);
  if (!ctx) throw new Error("useService must be used within ServiceProvider");
  return ctx;
};
