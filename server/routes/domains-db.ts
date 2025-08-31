import { RequestHandler } from "express";
import {
  Domain,
  AddDomainRequest,
  AddDomainResponse,
  GetDomainsResponse,
  DomainSearchQuery,
  UpdateDomainRequest,
  DomainDetailResponse,
  CreateDNSRecordRequest,
  DNSRecord,
  SSLCertificate,
  DomainServices,
  MonitoringLog,
} from "@shared/domain-api";
import { db } from "../db/connection";
import whois from "whois-json";

// ---------------- Helpers ----------------
const toISODate = (v: any): string | undefined => {
  if (!v) return undefined;
  const d = typeof v === "string" ? new Date(v) : v;
  if (!(d instanceof Date) || isNaN(d.getTime())) return undefined;
  return d.toISOString().split("T")[0];
};

async function fetchWhoisInfo(domain: string) {
  try {
    console.log(`Attempting WHOIS lookup for domain: ${domain}`);
    const data = await whois(domain);
    console.log(`WHOIS data received for ${domain}:`, data);

    const result = {
      registrar: data.registrar || "Unknown",
      expiryDate: data.expirationDate
        ? new Date(data.expirationDate).toISOString().split("T")[0]
        : undefined,
    };

    console.log(`Processed WHOIS result for ${domain}:`, result);
    return result;
  } catch (err) {
    console.error(`WHOIS lookup failed for ${domain}:`, err);
    return { registrar: "Unknown", expiryDate: undefined };
  }
}

// ---------------- Get Domains ----------------
export const getDomains: RequestHandler = async (req, res) => {
  try {
    const query = req.query as DomainSearchQuery;
    let whereConditions: string[] = ["is_active = $1"];
    let params: any[] = [true];
    let paramCount = 1;

    if (query.search) {
      paramCount++;
      whereConditions.push(
        `(domain ILIKE $${paramCount} OR registrar ILIKE $${paramCount})`
      );
      params.push(`%${query.search}%`);
    }

    if (query.registrar && query.registrar !== "all") {
      paramCount++;
      whereConditions.push(`registrar ILIKE $${paramCount}`);
      params.push(`%${query.registrar}%`);
    }

    if (query.status && query.status !== "all") {
      paramCount++;
      whereConditions.push(`status ILIKE $${paramCount}`);
      params.push(`%${query.status}%`);
    }

    const sql = `
      SELECT * FROM domains
      WHERE ${whereConditions.join(" AND ")}
      ORDER BY created_at DESC
      LIMIT 100
    `;

    const results = await db.query(sql, params);
    res.json({ success: true, domains: results.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : "Unknown error" });
  }
};

// ---------------- Add Domain ----------------
export const addDomain: RequestHandler<
  {}, AddDomainResponse, AddDomainRequest
> = async (req, res) => {
  try {
    const { domain } = req.body;

    // Validate domain format
    if (!domain || !domain.trim()) {
      return res.status(400).json({ success: false, error: "Domain name is required" });
    }

    const cleanDomain = domain.trim().toLowerCase();

    // Basic domain validation
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!domainRegex.test(cleanDomain)) {
      return res.status(400).json({ success: false, error: "Invalid domain format" });
    }

    // Check if domain already exists
    const existingDomain = await db.query('SELECT id FROM domains WHERE domain = $1', [cleanDomain]);
    if (existingDomain.rows.length > 0) {
      return res.status(400).json({ success: false, error: "Domain already exists" });
    }

    // WHOIS lookup with error handling
    let whoisInfo = { registrar: "Unknown", expiryDate: undefined };
    try {
      whoisInfo = await fetchWhoisInfo(cleanDomain);
    } catch (whoisError) {
      console.warn(`WHOIS lookup failed for ${cleanDomain}:`, whoisError);
      // Continue with default values
    }

    // Generate unique ID
    const domainId = Date.now().toString();

    const sql = `
      INSERT INTO domains (id, domain, subdomain, registrar, expiry_date, status, is_active, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *
    `;

    const result = await db.query(sql, [
      domainId,
      cleanDomain,
      cleanDomain, // subdomain same as domain for now
      whoisInfo.registrar,
      whoisInfo.expiryDate,
      "Online", // Changed from "Active" to match expected values
      true
    ]);

    const saved = result.rows[0];
    res.json({ success: true, domain: saved });
  } catch (err) {
    console.error("Error adding domain:", err);
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : "Unknown error" });
  }
};

// ---------------- Update Domain (by domain name - legacy) ----------------
export const updateDomainByDomain: RequestHandler<
  {}, AddDomainResponse, UpdateDomainRequest
> = async (req, res) => {
  try {
    const { domain } = req.body;

    // Refresh WHOIS info
    const whoisInfo = await fetchWhoisInfo(domain);

    const sql = `
      UPDATE domains
      SET registrar = $1, expiry_date = $2, last_whois_check = NOW()
      WHERE domain = $3
      RETURNING *
    `;

    const result = await db.query(sql, [
      whoisInfo.registrar,
      whoisInfo.expiryDate,
      domain
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Domain not found" });
    }

    const updated = result.rows[0];
    res.json({ success: true, domain: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : "Unknown error" });
  }
};

// ---------------- Delete Domain ----------------
export const deleteDomain: RequestHandler<{ id: string }> = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      UPDATE domains
      SET is_active = false
      WHERE id = $1
      RETURNING domain
    `;

    const result = await db.query(sql, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Domain not found" });
    }

    res.json({ success: true, message: "Domain deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : "Unknown error" });
  }
};

// ---------------- Domain Details (DB-backed) ----------------
export const getDomainDetails: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params as { id: string };
    if (!id) return res.status(400).json({ error: "Domain id is required" });

    const baseSelect = `
      SELECT id, domain, subdomain, registrar, expiration_date, expiry_date,
             ssl_status, ssl_expiry, status, last_check, last_whois_check,
             last_ssl_check, is_active, created_at
      FROM domains
      WHERE %COND%
      LIMIT 1
    `;

    // Try by id first
    let result = await db.query(baseSelect.replace("%COND%", "id = $1"), [id]);

    // If not found, try by domain name
    if (result.rows.length === 0) {
      result = await db.query(baseSelect.replace("%COND%", "domain = $1"), [id]);
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Domain not found" });
    }

    const row = result.rows[0];

    const domain: Domain = {
      id: row.id,
      domain: row.domain,
      subdomain: row.subdomain ?? row.domain,
      registrar: row.registrar ?? "Unknown",
      expirationDate: row.expiration_date ?? "Unknown",
      expiry_date: row.expiry_date ? new Date(row.expiry_date).toISOString().split("T")[0] : undefined,
      ssl_status: row.ssl_status ?? "unknown",
      ssl_expiry: row.ssl_expiry ? new Date(row.ssl_expiry).toISOString().split("T")[0] : undefined,
      status: row.status ?? "Unknown",
      lastCheck: row.last_check ?? "Never",
      lastWhoisCheck: row.last_whois_check ? new Date(row.last_whois_check).toISOString() : undefined,
      lastSslCheck: row.last_ssl_check ? new Date(row.last_ssl_check).toISOString() : undefined,
      lastDnsCheck: undefined,
      isActive: row.is_active ?? true,
      autoRenew: undefined,
      services: undefined,
      dnsRecords: undefined,
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
      userId: undefined,
    };

    const sslCertificates: SSLCertificate[] = [
      {
        id: `ssl-${row.id}`,
        serialNumber: "12:34:56:78:90:AB:CD:EF",
        issuer: "Let's Encrypt Authority X3",
        validFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: domain.ssl_expiry || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        commonName: domain.domain,
        alternativeNames: [`www.${domain.domain}`],
        isValid: domain.ssl_status === "valid",
      },
    ];

    const dnsRecords: DNSRecord[] = [
      {
        id: `dns-a-${row.id}`,
        name: "@",
        type: "A",
        value: "192.168.1.100",
        ttl: 3600,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `dns-cname-${row.id}`,
        name: "www",
        type: "CNAME",
        value: domain.domain,
        ttl: 3600,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `dns-mx-${row.id}`,
        name: "@",
        type: "MX",
        value: "mail.example.com",
        ttl: 3600,
        priority: 10,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const services: DomainServices = {
      hosting: { detected: true, provider: "Unknown Provider", ipAddress: "192.168.1.100" },
      email: { detected: true, provider: "Gmail", mxRecords: ["mail.example.com"] },
      nameservers: { detected: true, servers: ["ns1.example.com", "ns2.example.com"] },
    };

    const monitoringLogs: MonitoringLog[] = [
      {
        id: `log-whois-${row.id}`,
        domainId: row.id,
        type: "whois",
        status: "success",
        message: "WHOIS data updated successfully",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: `log-ssl-${row.id}`,
        domainId: row.id,
        type: "ssl",
        status: "success",
        message: "SSL certificate is valid",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      },
    ];

    const response: DomainDetailResponse = {
      domain: { ...domain, ssl_certificates: sslCertificates, services, dnsRecords },
      sslCertificates,
      dnsRecords,
      services,
      monitoringLogs,
    };

    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
};

// ---------------- Create DNS Record (mocked, DB-backed domain existence) ----------------
export const createDNSRecord: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params as { id: string };
    const { domainId, name, type, value, ttl = 3600, priority }: CreateDNSRecordRequest = req.body;

    if (!id || !domainId) {
      return res.status(400).json({ error: "Invalid domain id" });
    }

    // Accept either numeric/string ID or domain name in the path and body
    const exists = await db.query(
      "SELECT id FROM domains WHERE id = $1 OR domain = $1 LIMIT 1",
      [id]
    );

    let effectiveId = id;
    if (exists.rows.length > 0) {
      effectiveId = exists.rows[0].id;
    } else {
      // Try resolving from body value as well
      const bodyLookup = await db.query(
        "SELECT id FROM domains WHERE id = $1 OR domain = $1 LIMIT 1",
        [domainId]
      );
      if (bodyLookup.rows.length === 0) {
        return res.status(404).json({ error: "Domain not found" });
      }
      effectiveId = bodyLookup.rows[0].id;
    }

    const record: DNSRecord = {
      id: Date.now().toString(),
      name,
      type: type as DNSRecord["type"],
      value,
      ttl,
      priority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    res.json({ success: true, record });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
};

// ---------------- Update Domain by ID (DB-backed) ----------------
export const updateDomain: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params as { id: string };
    const updates: UpdateDomainRequest = req.body || {};

    const fields: string[] = [];
    const params: any[] = [];

    if (updates.registrar !== undefined) {
      params.push(updates.registrar);
      fields.push(`registrar = $${params.length}`);
    }
    if (updates.expiry_date !== undefined) {
      params.push(updates.expiry_date);
      fields.push(`expiry_date = $${params.length}`);
    }
    if (updates.autoRenew !== undefined) {
      // no dedicated column, ignore or map to a settings table in the future
    }
    if (updates.isActive !== undefined) {
      params.push(updates.isActive);
      fields.push(`is_active = $${params.length}`);
    }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, error: "No valid fields to update" });
    }

    params.push(id);
    const sql = `UPDATE domains SET ${fields.join(", ")}, last_check = last_check WHERE id = $${params.length} RETURNING *`;
    const result = await db.query(sql, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Domain not found" });
    }

    res.json({ success: true, domain: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : "Unknown error" });
  }
};

// ---------------- Extra Exports (for index.ts compatibility) ----------------

// Get Registrars (basic placeholder, adjust if you have a real registrar DB table)
export const getRegistrars: RequestHandler = async (req, res) => {
  try {
    // Try to get registrars from registrars table, fallback to distinct registrars from domains
    let sql = `SELECT * FROM registrars ORDER BY name`;
    let results;

    try {
      results = await db.query(sql, []);
    } catch (tableError) {
      // Fallback: get unique registrars from domains table
      sql = `
        SELECT DISTINCT registrar as name, registrar as id
        FROM domains
        WHERE is_active = true AND registrar IS NOT NULL AND registrar != 'Unknown'
        ORDER BY registrar
      `;
      results = await db.query(sql, []);
    }

    res.json({ success: true, registrars: results.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : "Unknown error" });
  }
};

// Trigger domain monitoring (placeholder for cron or monitoring-service)
export const triggerDomainMonitoring: RequestHandler = async (_req, res) => {
  try {
    // If you have cron-service or monitoring-service, hook into it here
    // For now, just return success
    res.json({ success: true, message: "Domain monitoring triggered" });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : "Unknown error" });
  }
};

// ---------------- Get All Domains for Cron (used by dashboard) ----------------
export const getAllDomainsForCron = async () => {
  try {
    const sql = `
      SELECT
        id,
        domain,
        registrar,
        expiry_date,
        ssl_expiry,
        ssl_status,
        status,
        last_check as "lastCheck",
        last_whois_check as "lastWhoisCheck",
        last_ssl_check as "lastSslCheck",
        is_active as "isActive",
        created_at
      FROM domains
      ORDER BY created_at DESC
    `;

    const results = await db.query(sql, []);
    return results.rows;
  } catch (err) {
    console.error("Error fetching domains for cron:", err);
    return [];
  }
};
