import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DomainsSearch from "./pages/DomainsSearch";
import Pricing from "./pages/Pricing";
import Login from "./pages/Login";
import CreateAccount from "./pages/CreateAccount";
import Dashboard from "./pages/Dashboard";
import InternalDashboard from "./pages/InternalDashboard";
import InternalDomains from "./pages/InternalDomains";
import MyRegistrars from "./pages/MyRegistrars";
import DomainsWatchlist from "./pages/DomainsWatchlist";
import Projects from "./pages/Projects";
import Notifications from "./pages/Notifications";
import Documentation from "./pages/Documentation";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<InternalDashboard />} />
          <Route path="/internal/domains" element={<InternalDomains />} />
          <Route path="/internal/registrars" element={<MyRegistrars />} />
          <Route path="/internal/watchlist" element={<DomainsWatchlist />} />
          <Route path="/internal/projects" element={<Projects />} />
          <Route path="/internal/notifications" element={<Notifications />} />
          <Route path="/internal/documentation" element={<Documentation />} />
          <Route path="/domains-search" element={<DomainsSearch />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/create-account" element={<CreateAccount />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
