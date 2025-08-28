import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  getDomains,
  addDomain,
  checkDomain,
  deleteDomain,
  getRegistrars
} from "./routes/domains";
import {
  getRegistrars as getRegistrarsList,
  addRegistrar,
  updateRegistrar,
  deleteRegistrar,
  testRegistrarConnection
} from "./routes/registrars";
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
  app.delete("/api/domains/:id", deleteDomain);
  app.get("/api/registrars", getRegistrars);

  return app;
}
