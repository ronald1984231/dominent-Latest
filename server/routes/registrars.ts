import { RequestHandler } from "express";
import { 
  Registrar, 
  AddRegistrarRequest, 
  AddRegistrarResponse, 
  GetRegistrarsResponse 
} from "@shared/internal-api";

// In-memory storage for demonstration (in production, use a real database)
let registrars: Registrar[] = [
  {
    id: "1",
    name: "GoDaddy.com, LLC",
    label: "Not set",
    email: "Not set",
    apiStatus: "Connected",
    domainCount: 26,
    status: "Connected",
    createdAt: new Date().toISOString()
  },
  {
    id: "2", 
    name: "CloudFlare, Inc.",
    label: "Not set",
    email: "Not set",
    apiStatus: "Connected",
    domainCount: 2,
    status: "Connected",
    createdAt: new Date().toISOString()
  },
  {
    id: "3",
    name: "NameCheap, Inc.",
    label: "Not set", 
    email: "Not set",
    apiStatus: "Connected",
    domainCount: 112,
    status: "Connected",
    createdAt: new Date().toISOString()
  },
  {
    id: "4",
    name: "PDR Ltd. d/b/a PublicDomainRegistry.com",
    label: "Not set",
    email: "Not set", 
    apiStatus: "Disconnected",
    domainCount: 3,
    status: "Unmanaged",
    createdAt: new Date().toISOString()
  }
];

// Get all registrars
export const getRegistrars: RequestHandler = (req, res) => {
  const response: GetRegistrarsResponse = {
    registrars: registrars,
    total: registrars.length
  };
  res.json(response);
};

// Add a new registrar
export const addRegistrar: RequestHandler = (req, res) => {
  const { registrar, apiKey, apiSecret, label }: AddRegistrarRequest = req.body;

  if (!registrar || !apiKey) {
    const response: AddRegistrarResponse = {
      success: false,
      error: "Registrar name and API key are required"
    };
    return res.status(400).json(response);
  }

  // Create new registrar entry
  const newRegistrar: Registrar = {
    id: Date.now().toString(),
    name: registrar,
    label: label || "Not set",
    email: "Not set",
    apiKey: apiKey,
    apiSecret: apiSecret,
    apiStatus: "Connected",
    domainCount: 0,
    status: "Connected",
    createdAt: new Date().toISOString()
  };

  registrars.push(newRegistrar);

  // Remove sensitive data from response
  const responseRegistrar = { ...newRegistrar };
  delete responseRegistrar.apiKey;
  delete responseRegistrar.apiSecret;

  const response: AddRegistrarResponse = {
    success: true,
    registrar: responseRegistrar
  };

  res.json(response);
};

// Update registrar
export const updateRegistrar: RequestHandler = (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const registrarIndex = registrars.findIndex(r => r.id === id);
  if (registrarIndex === -1) {
    return res.status(404).json({ error: "Registrar not found" });
  }

  registrars[registrarIndex] = {
    ...registrars[registrarIndex],
    ...updates,
    id: id // Ensure ID doesn't change
  };

  // Remove sensitive data from response
  const responseRegistrar = { ...registrars[registrarIndex] };
  delete responseRegistrar.apiKey;
  delete responseRegistrar.apiSecret;

  res.json({ success: true, registrar: responseRegistrar });
};

// Delete registrar
export const deleteRegistrar: RequestHandler = (req, res) => {
  const { id } = req.params;

  const registrarIndex = registrars.findIndex(r => r.id === id);
  if (registrarIndex === -1) {
    return res.status(404).json({ error: "Registrar not found" });
  }

  registrars.splice(registrarIndex, 1);
  res.json({ success: true });
};

// Test registrar connection
export const testRegistrarConnection: RequestHandler = (req, res) => {
  const { id } = req.params;

  const registrar = registrars.find(r => r.id === id);
  if (!registrar) {
    return res.status(404).json({ error: "Registrar not found" });
  }

  // Simulate API connection test
  const isConnected = Math.random() > 0.2; // 80% success rate

  registrar.apiStatus = isConnected ? "Connected" : "Disconnected";
  registrar.status = isConnected ? "Connected" : "Disconnected";

  res.json({ 
    success: true, 
    connected: isConnected,
    message: isConnected ? "Connection successful" : "Connection failed - check your API credentials"
  });
};
