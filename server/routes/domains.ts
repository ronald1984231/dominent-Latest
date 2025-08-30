import { RequestHandler } from "express";
import {
  Domain,
  DomainCheckResponse,
  AddDomainRequest,
  AddDomainResponse,
  GetDomainsResponse,
  DomainSearchQuery,
  DomainDetailResponse,
  CreateDNSRecordRequest,
  UpdateDomainRequest,
  DNSRecord,
  SSLCertificate,
  DomainServices,
  MonitoringLog,
  DomainMonitoringResponse
} from "@shared/domain-api";

// In-memory storage for demonstration (in production, use a real database)
// Starting with empty array - all sample data removed
let domains: Domain[] = [];

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
    registrar: "Unknown", // Will be updated by monitoring
    expirationDate: "Unknown",
    expiry_date: undefined,
    ssl_status: "unknown",
    ssl_expiry: undefined,
    status: "Unknown",
    lastCheck: "Never",
    lastWhoisCheck: undefined,
    lastSslCheck: undefined,
    isActive: true,
    createdAt: new Date().toISOString()
  };

  domains.push(newDomain);

  // Trigger immediate domain monitoring check
  setTimeout(async () => {
    try {
      const { monitoringService } = await import("../services/monitoring-service");
      const updateData = await monitoringService.enhancedMonitorDomain(newDomain);

      // Update the domain with monitoring results
      const domainIndex = domains.findIndex(d => d.id === newDomain.id);
      if (domainIndex !== -1) {
        const updates: Partial<Domain> = {
          status: "Online",
          lastCheck: "Just now",
          lastWhoisCheck: updateData.lastWhoisCheck,
          lastSslCheck: updateData.lastSslCheck,
          ...(updateData.expiry_date && { expiry_date: updateData.expiry_date }),
          ...(updateData.ssl_expiry && { ssl_expiry: updateData.ssl_expiry }),
          ...(updateData.ssl_status && { ssl_status: updateData.ssl_status }),
          ...(updateData.registrar && { registrar: updateData.registrar })
        };

        domains[domainIndex] = {
          ...domains[domainIndex],
          ...updates
        };
      }
    } catch (error) {
      console.error(`Initial monitoring failed for ${domain}:`, error);
    }
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

// Get domain details with SSL, DNS, and monitoring info
export const getDomainDetails: RequestHandler = (req, res) => {
  const { id } = req.params;

  const domain = domains.find(d => d.id === id);
  if (!domain) {
    return res.status(404).json({ error: "Domain not found" });
  }

  // Mock SSL certificates
  const sslCertificates: SSLCertificate[] = [
    {
      id: "ssl-1",
      serialNumber: "12:34:56:78:90:AB:CD:EF",
      issuer: "Let's Encrypt Authority X3",
      validFrom: "2024-01-01T00:00:00Z",
      expiresAt: domain.ssl_expiry || "2024-12-31T23:59:59Z",
      commonName: domain.domain,
      alternativeNames: [`www.${domain.domain}`],
      isValid: domain.ssl_status === 'valid'
    }
  ];

  // Mock DNS records
  const dnsRecords: DNSRecord[] = [
    {
      id: "dns-1",
      name: "@",
      type: "A",
      value: "192.168.1.100",
      ttl: 3600,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "dns-2",
      name: "www",
      type: "CNAME",
      value: domain.domain,
      ttl: 3600,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "dns-3",
      name: "@",
      type: "MX",
      value: "mail.example.com",
      ttl: 3600,
      priority: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Mock services detection
  const services: DomainServices = {
    hosting: {
      detected: true,
      provider: "Unknown Provider",
      ipAddress: "192.168.1.100"
    },
    email: {
      detected: true,
      provider: "Gmail",
      mxRecords: ["mail.example.com"]
    },
    nameservers: {
      detected: true,
      servers: ["ns1.example.com", "ns2.example.com"]
    }
  };

  // Mock monitoring logs
  const monitoringLogs: MonitoringLog[] = [
    {
      id: "log-1",
      domainId: domain.id,
      type: "whois",
      status: "success",
      message: "WHOIS data updated successfully",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "log-2",
      domainId: domain.id,
      type: "ssl",
      status: "success",
      message: "SSL certificate is valid",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
    }
  ];

  const response: DomainDetailResponse = {
    domain: {
      ...domain,
      ssl_certificates: sslCertificates,
      services,
      dnsRecords
    },
    sslCertificates,
    dnsRecords,
    services,
    monitoringLogs
  };

  res.json(response);
};

// Update domain information
export const updateDomain: RequestHandler = (req, res) => {
  const { id } = req.params;
  const updates: UpdateDomainRequest = req.body;

  const domainIndex = domains.findIndex(d => d.id === id);
  if (domainIndex === -1) {
    return res.status(404).json({ error: "Domain not found" });
  }

  domains[domainIndex] = {
    ...domains[domainIndex],
    ...updates
  };

  res.json({ success: true, domain: domains[domainIndex] });
};

// Create DNS record
export const createDNSRecord: RequestHandler = (req, res) => {
  const { domainId, name, type, value, ttl = 3600, priority }: CreateDNSRecordRequest = req.body;

  const domain = domains.find(d => d.id === domainId);
  if (!domain) {
    return res.status(404).json({ error: "Domain not found" });
  }

  const newRecord: DNSRecord = {
    id: Date.now().toString(),
    name,
    type,
    value,
    ttl,
    priority,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Initialize dnsRecords array if it doesn't exist
  if (!domain.dnsRecords) {
    domain.dnsRecords = [];
  }

  domain.dnsRecords.push(newRecord);
  domain.lastDnsCheck = new Date().toISOString();

  res.json({ success: true, record: newRecord });
};

// Trigger domain monitoring
export const triggerDomainMonitoring: RequestHandler = async (req, res) => {
  const { id } = req.params;

  const domain = domains.find(d => d.id === id);
  if (!domain) {
    return res.status(404).json({ error: "Domain not found" });
  }

  try {
    // Use real monitoring service
    const { monitoringService } = await import("../services/monitoring-service");
    const monitoringUpdate = await monitoringService.enhancedMonitorDomain(domain);

    // Apply the monitoring updates to the domain
    const domainIndex = domains.findIndex(d => d.id === id);
    if (domainIndex !== -1) {
      const updates: Partial<Domain> = {
        status: "Online", // Default to online if monitoring succeeds
        lastCheck: "Just now",
        lastWhoisCheck: monitoringUpdate.lastWhoisCheck,
        lastSslCheck: monitoringUpdate.lastSslCheck,
        ...(monitoringUpdate.expiry_date && { expiry_date: monitoringUpdate.expiry_date }),
        ...(monitoringUpdate.ssl_expiry && { ssl_expiry: monitoringUpdate.ssl_expiry }),
        ...(monitoringUpdate.ssl_status && { ssl_status: monitoringUpdate.ssl_status }),
        ...(monitoringUpdate.registrar && { registrar: monitoringUpdate.registrar })
      };

      domains[domainIndex] = { ...domains[domainIndex], ...updates };

      const response: DomainMonitoringResponse = {
        success: true,
        message: "Domain monitoring completed successfully",
        updates
      };

      res.json(response);
    } else {
      throw new Error("Domain not found during update");
    }
  } catch (error) {
    console.error(`Domain monitoring failed for ${domain.domain}:`, error);

    const response: DomainMonitoringResponse = {
      success: false,
      message: "Domain monitoring failed",
      errors: [error instanceof Error ? error.message : "Unknown error"]
    };

    res.status(500).json(response);
  }
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
  const registrars = [...new Set(domains.map(d => d.registrar))]
    .filter(r => r && r !== "Unknown" && r.trim() !== "");
  res.json({ registrars });
};

// Helper function for cron service to update domain data
export const updateDomainFromCron = (domainId: string, updateData: Partial<Domain>): boolean => {
  const domainIndex = domains.findIndex(d => d.id === domainId);

  if (domainIndex !== -1) {
    const currentDomain = domains[domainIndex];

    // Build updates object - always update provided fields
    const updates: Partial<Domain> = {
      status: updateData.status || 'Online',
      lastCheck: updateData.lastCheck || 'Auto updated'
    };

    // Update expiry_date (WHOIS data) - preserve if valid data exists
    if (updateData.expiry_date) {
      updates.expiry_date = updateData.expiry_date;
    }

    // Update SSL data
    if (updateData.ssl_expiry) {
      updates.ssl_expiry = updateData.ssl_expiry;
    }
    if (updateData.ssl_status) {
      updates.ssl_status = updateData.ssl_status;
    }

    // Update registrar
    if (updateData.registrar) {
      updates.registrar = updateData.registrar;
    }

    // Update check timestamps
    if (updateData.lastWhoisCheck) {
      updates.lastWhoisCheck = updateData.lastWhoisCheck;
    }
    if (updateData.lastSslCheck) {
      updates.lastSslCheck = updateData.lastSslCheck;
    }

    // Apply updates
    domains[domainIndex] = { ...currentDomain, ...updates };

    console.log(`🔄 Domain ${currentDomain.domain} updated:`, {
      expiry_date: updates.expiry_date ? 'Updated' : 'Unchanged',
      ssl_expiry: updates.ssl_expiry ? 'Updated' : 'Unchanged',
      ssl_status: updates.ssl_status || 'Unchanged',
      registrar: updates.registrar ? 'Updated' : 'Unchanged'
    });

    return true;
  }

  return false;
};

// Helper function to get all domains for cron service
export const getAllDomainsForCron = (): Domain[] => {
  return [...domains];
};
