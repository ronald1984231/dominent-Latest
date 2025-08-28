import { RequestHandler } from "express";
import { 
  Domain, 
  DomainCheckResponse, 
  AddDomainRequest, 
  AddDomainResponse, 
  GetDomainsResponse,
  DomainSearchQuery
} from "@shared/domain-api";

// In-memory storage for demonstration (in production, use a real database)
let domains: Domain[] = [
  {
    id: "1",
    domain: "youtube.com",
    subdomain: "youtube.com",
    registrar: "MarkMonitor Inc.",
    expirationDate: "15 February 2025 (108 days)",
    status: "Online",
    lastCheck: "4 days ago",
    createdAt: new Date().toISOString()
  },
  {
    id: "2",
    domain: "facebook.com",
    subdomain: "facebook.com",
    registrar: "RegistrarSafe, LLC",
    expirationDate: "30 March 2024 (38 days)",
    status: "Online",
    lastCheck: "3 days ago",
    createdAt: new Date().toISOString()
  },
  {
    id: "3",
    domain: "instagram.com",
    subdomain: "instagram.com",
    registrar: "RegistrarSafe, LLC",
    expirationDate: "4 June 2024 (204 days)",
    status: "Online",
    lastCheck: "4 days ago",
    createdAt: new Date().toISOString()
  },
  {
    id: "4",
    domain: "amazon.com",
    subdomain: "amazon.com",
    registrar: "MarkMonitor Inc.",
    expirationDate: "31 October 2025 (10 days)",
    status: "Online",
    lastCheck: "4 days ago",
    createdAt: new Date().toISOString()
  },
  {
    id: "5",
    domain: "reddit.com",
    subdomain: "reddit.com",
    registrar: "MarkMonitor Inc.",
    expirationDate: "28 April 2024 (67 days)",
    status: "Online",
    lastCheck: "1 day ago",
    createdAt: new Date().toISOString()
  }
];

// Get all domains with optional filtering
export const getDomains: RequestHandler = (req, res) => {
  const query = req.query as DomainSearchQuery;
  let filteredDomains = [...domains];

  // Apply search filter
  if (query.search) {
    const searchTerm = query.search.toLowerCase();
    filteredDomains = filteredDomains.filter(domain => 
      domain.domain.toLowerCase().includes(searchTerm) ||
      domain.registrar.toLowerCase().includes(searchTerm)
    );
  }

  // Apply registrar filter
  if (query.registrar && query.registrar !== 'all') {
    filteredDomains = filteredDomains.filter(domain => 
      domain.registrar.toLowerCase().includes(query.registrar!.toLowerCase())
    );
  }

  // Apply status filter
  if (query.status && query.status !== 'all') {
    filteredDomains = filteredDomains.filter(domain => 
      domain.status.toLowerCase() === query.status!.toLowerCase()
    );
  }

  // Apply pagination
  const limit = query.limit ? parseInt(query.limit.toString()) : 50;
  const offset = query.offset ? parseInt(query.offset.toString()) : 0;
  const paginatedDomains = filteredDomains.slice(offset, offset + limit);

  const response: GetDomainsResponse = {
    domains: paginatedDomains,
    total: filteredDomains.length
  };

  res.json(response);
};

// Add a new domain to monitor
export const addDomain: RequestHandler = (req, res) => {
  const { domain }: AddDomainRequest = req.body;

  if (!domain) {
    const response: AddDomainResponse = {
      success: false,
      error: "Domain is required"
    };
    return res.status(400).json(response);
  }

  // Check if domain already exists
  const existingDomain = domains.find(d => d.domain.toLowerCase() === domain.toLowerCase());
  if (existingDomain) {
    const response: AddDomainResponse = {
      success: false,
      error: "Domain is already being monitored"
    };
    return res.status(409).json(response);
  }

  // Create new domain entry
  const newDomain: Domain = {
    id: Date.now().toString(),
    domain: domain.toLowerCase(),
    subdomain: domain.toLowerCase(),
    registrar: "Unknown", // In real implementation, would fetch this
    expirationDate: "Unknown",
    status: "Unknown",
    lastCheck: "Never",
    createdAt: new Date().toISOString()
  };

  domains.push(newDomain);

  // Simulate domain check (in real implementation, would use WHOIS API)
  setTimeout(() => {
    checkDomainStatus(newDomain.id);
  }, 1000);

  const response: AddDomainResponse = {
    success: true,
    domain: newDomain
  };

  res.json(response);
};

// Check domain status and information
export const checkDomain: RequestHandler = (req, res) => {
  const { domain } = req.params;

  if (!domain) {
    return res.status(400).json({ error: "Domain parameter is required" });
  }

  // Simulate domain check (in real implementation, would use WHOIS/DNS APIs)
  const mockResponse: DomainCheckResponse = {
    domain: domain,
    isAvailable: false, // Most domains we'd check are not available
    registrar: "Unknown Registrar",
    expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    nameservers: ["ns1.example.com", "ns2.example.com"],
    status: "Online",
    lastChecked: new Date().toISOString()
  };

  res.json(mockResponse);
};

// Delete a domain from monitoring
export const deleteDomain: RequestHandler = (req, res) => {
  const { id } = req.params;

  const domainIndex = domains.findIndex(d => d.id === id);
  if (domainIndex === -1) {
    return res.status(404).json({ error: "Domain not found" });
  }

  domains.splice(domainIndex, 1);
  res.json({ success: true });
};

// Helper function to simulate domain status checking
function checkDomainStatus(domainId: string) {
  const domain = domains.find(d => d.id === domainId);
  if (!domain) return;

  // Simulate fetching real domain information
  domain.status = Math.random() > 0.1 ? "Online" : "Offline";
  domain.lastCheck = "Just now";
  domain.registrar = "Simulated Registrar Inc.";
  domain.expirationDate = new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toLocaleDateString();
}

// Get unique registrars for filter dropdown
export const getRegistrars: RequestHandler = (req, res) => {
  const registrars = [...new Set(domains.map(d => d.registrar))].filter(r => r !== "Unknown");
  res.json({ registrars });
};
