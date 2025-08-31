import "./global.css";

import * as Sentry from "@sentry/react";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "./hooks/useAuth";
import { setupResizeObserverErrorHandler } from "./lib/resizeObserverUtils";
import "./sentry"; // Initialize Sentry

// Setup global ResizeObserver error handling
setupResizeObserverErrorHandler();
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DomainsSearch from "./pages/DomainsSearch";
import Pricing from "./pages/Pricing";
import Login from "./pages/Login";
import CreateAccount from "./pages/CreateAccount";
import LogoShowcase from "./pages/LogoShowcase";
import LogoTest from "./pages/LogoTest";
import ErrorTest from "./pages/ErrorTest";
import DashboardTest from "./pages/DashboardTest";
import FullStoryTest from "./pages/FullStoryTest";
import Dashboard from "./pages/Dashboard";
import InternalDashboard from "./pages/InternalDashboard";
import InternalDomains from "./pages/InternalDomains";
import MyRegistrars from "./pages/MyRegistrars";
import DomainsWatchlist from "./pages/DomainsWatchlist";
import Projects from "./pages/Projects";
import Notifications from "./pages/Notifications";
import MonitoringDashboard from "./pages/MonitoringDashboard";
import Documentation from "./pages/Documentation";
import DomainDetail from "./pages/DomainDetail";
import AddDomain from "./pages/AddDomain";
import RegistrarOverview from "./pages/RegistrarOverview";
import RegistrarAPISettings from "./pages/RegistrarAPISettings";
import RegistrarDomains from "./pages/RegistrarDomains";
import RegistrarMonthlyReports from "./pages/RegistrarMonthlyReports";
import RegistrarConfig from "./pages/RegistrarConfig";

const queryClient = new QueryClient();

const SentryRoutes = Sentry.withSentryRouting(Routes);

const App = () => {
  // Initialize MSW for Cypress tests and development
  useEffect(() => {
    const initMSW = async () => {
      // Enable MSW in Cypress environment or when explicitly enabled
      const shouldEnableMSW = (window as any).Cypress ||
                             import.meta.env.VITE_ENABLE_MOCKING === 'true';

      if (shouldEnableMSW) {
        try {
          const { enableMocking } = await import("./mocks");
          await enableMocking();
        } catch (error) {
          console.warn('Failed to initialize MSW:', error);
        }
      }
    };

    initMSW();
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SentryRoutes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<InternalDashboard />} />
            <Route path="/internal/domains" element={<InternalDomains />} />
            <Route path="/internal/domains/add" element={<AddDomain />} />
            <Route path="/internal/domains/:id" element={<DomainDetail />} />
            <Route path="/internal/registrars" element={<MyRegistrars />} />
            <Route
              path="/internal/registrar-config"
              element={<RegistrarConfig />}
            />
            <Route path="/registrars/:id" element={<RegistrarOverview />} />
            <Route
              path="/registrars/:id/domains"
              element={<RegistrarDomains />}
            />
            <Route
              path="/registrars/:id/apisettings"
              element={<RegistrarAPISettings />}
            />
            <Route
              path="/registrars/:id/monthlyreports"
              element={<RegistrarMonthlyReports />}
            />
            <Route path="/internal/watchlist" element={<DomainsWatchlist />} />
            <Route path="/internal/projects" element={<Projects />} />
            <Route path="/internal/notifications" element={<Notifications />} />
            <Route
              path="/internal/monitoring"
              element={<MonitoringDashboard />}
            />
            <Route path="/internal/documentation" element={<Documentation />} />
            <Route path="/domains-search" element={<DomainsSearch />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/create-account" element={<CreateAccount />} />
            <Route path="/logo-showcase" element={<LogoShowcase />} />
            <Route path="/logo-test" element={<LogoTest />} />
            <Route path="/error-test" element={<ErrorTest />} />
            <Route path="/dashboard-test" element={<DashboardTest />} />
            <Route path="/fullstory-test" element={<FullStoryTest />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </SentryRoutes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

// Fix ReactDOMClient.createRoot() warning by using singleton pattern with HMR support
const rootElement = document.getElementById("root")!;

// Store root instance globally to persist across HMR reloads
declare global {
  interface Window {
    __DOMINENT_ROOT__?: ReturnType<typeof createRoot>;
  }
}

// Check if root already exists globally (survives HMR)
if (!window.__DOMINENT_ROOT__) {
  window.__DOMINENT_ROOT__ = createRoot(rootElement);
}

window.__DOMINENT_ROOT__.render(<App />);
