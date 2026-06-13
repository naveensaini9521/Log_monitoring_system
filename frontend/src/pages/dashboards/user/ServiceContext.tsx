// contexts/ServiceContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
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
  const [currentService, setCurrentService] = useState<string | null>(() => {
    return localStorage.getItem("selectedService") || null;
  });
  const [availableServices, setAvailableServices] = useState<string[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  useEffect(() => {
    viewerApi
      .getAvailableServices()
      .then((response) => {
        const services = response.services || [];
        setAvailableServices(services);
        if (!currentService && services.length > 0) {
          setCurrentService(services[0]);
        }
      })
      .catch((err) => console.error("Failed to load services", err))
      .finally(() => setLoadingServices(false));
  }, []);

  useEffect(() => {
    if (currentService) {
      localStorage.setItem("selectedService", currentService);
    } else {
      localStorage.removeItem("selectedService");
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
