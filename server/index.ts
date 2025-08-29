import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  getDomains,
  addDomain,
  deleteDomain,
  getRegistrars,
  triggerDomainMonitoring
} from "./routes/domains-db";
import {
  checkDomain,
  getDomainDetails,
  updateDomain,
  createDNSRecord
} from "./routes/domains";
import {
  getRegistrars as getRegistrarsList,
  addRegistrar,
  updateRegistrar,
  deleteRegistrar,
  testRegistrarConnection
} from "./routes/registrars-db";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getProjectDetails,
  addDomainToProject,
  removeDomainFromProject
} from "./routes/projects";
import {
  getNotificationSettings,
  updateNotificationSettings,
  resetNotificationSettings,
  testWebhook,
  getNotificationLogs
} from "./routes/notifications";
import {
  getDashboardData,
  searchDomains,
  getDomainSuggestions,
  addToWatchlist,
  getWatchlist,
  removeFromWatchlist
} from "./routes/dashboard";
import {
  getMonitoringLogs,
  createMonitoringLog,
  getMonitoringStats,
  triggerDomainMonitoringByName,
  triggerFullMonitoring,
  getMonitoringStatus,
  clearOldLogs,
  testDomainConnectivity,
  getMonitoringConfig
} from "./routes/monitoring";
import {
  login,
  signup,
  verifyToken
} from "./routes/auth";
import {
  importDomainsFromRegistrar,
  getErrorLogs
} from "./routes/registrar-import";
import { cronService } from "./services/cron-service";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Domain monitoring API routes
  app.get("/api/domains", getDomains);
  app.post("/api/domains", addDomain);
  app.get("/api/domains/check/:domain", checkDomain);
  app.get("/api/domains/:id", getDomainDetails);
  app.put("/api/domains/:id", updateDomain);
  app.delete("/api/domains/:id", deleteDomain);
  app.post("/api/domains/:id/monitor", triggerDomainMonitoring);
  app.post("/api/domains/:id/dns", createDNSRecord);
  app.get("/api/registrars", getRegistrars);

  // Registrars management API routes
  app.get("/api/internal/registrars", getRegistrarsList);
  app.post("/api/internal/registrars", addRegistrar);
  app.put("/api/internal/registrars/:id", updateRegistrar);
  app.delete("/api/internal/registrars/:id", deleteRegistrar);
  app.post("/api/internal/registrars/:id/test", testRegistrarConnection);

  // Projects management API routes
  app.get("/api/internal/projects", getProjects);
  app.post("/api/internal/projects", createProject);
  app.put("/api/internal/projects/:id", updateProject);
  app.delete("/api/internal/projects/:id", deleteProject);
  app.get("/api/internal/projects/:id", getProjectDetails);
  app.post("/api/internal/projects/:id/domains", addDomainToProject);
  app.delete("/api/internal/projects/:id/domains/:domainId", removeDomainFromProject);

  // Notifications API routes
  app.get("/api/internal/notifications", getNotificationSettings);
  app.put("/api/internal/notifications", updateNotificationSettings);
  app.post("/api/internal/notifications/reset", resetNotificationSettings);
  app.post("/api/internal/notifications/test-webhook", testWebhook);
  app.get("/api/internal/notifications/logs", getNotificationLogs);

  // Dashboard and search API routes
  app.get("/api/internal/dashboard", getDashboardData);
  app.post("/api/internal/search/domains", searchDomains);
  app.get("/api/internal/search/suggestions", getDomainSuggestions);
  app.post("/api/internal/watchlist", addToWatchlist);
  app.get("/api/internal/watchlist", getWatchlist);
  app.delete("/api/internal/watchlist/:id", removeFromWatchlist);

  // Monitoring API routes
  app.get("/api/monitoring/logs", getMonitoringLogs);
  app.post("/api/monitoring/logs", createMonitoringLog);
  app.get("/api/monitoring/stats", getMonitoringStats);
  app.post("/api/monitoring/trigger/:domain", triggerDomainMonitoringByName);
  app.post("/api/monitoring/trigger-all", triggerFullMonitoring);
  app.get("/api/monitoring/status", getMonitoringStatus);
  app.delete("/api/monitoring/logs/cleanup", clearOldLogs);
  app.get("/api/monitoring/test/:domain", testDomainConnectivity);
  app.get("/api/monitoring/config", getMonitoringConfig);

  // Authentication API routes
  app.post("/api/auth/login", login);
  app.post("/api/auth/signup", signup);
  app.get("/api/auth/verify", verifyToken);

  // Manual monitoring trigger for testing
  app.post("/api/test/trigger-monitoring", async (req, res) => {
    try {
      console.log('🧪 Manual monitoring trigger requested');
      await cronService.triggerMonitoring();
      res.json({ success: true, message: "Monitoring triggered successfully" });
    } catch (error) {
      console.error('Manual monitoring trigger failed:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Start cron service for automated monitoring
  cronService.start();
  console.log('🚀 Server created with monitoring enabled');

  return app;
}
