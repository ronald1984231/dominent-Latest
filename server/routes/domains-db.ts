import { RequestHandler } from "express";
import {
  Domain,
  AddDomainRequest,
  AddDomainResponse,
  GetDomainsResponse,
  DomainSearchQuery,
  UpdateDomainRequest,
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
    const data = await whois(domain);
    return {
      registrar: data.registrar || "Unknown",
      expiryDate: data.expirationDate
        ? new Date(data.expirationDate).toISOString().split("T")[0]
        : undefined,
    };
  } catch (err) {
    console.error("WHOIS lookup failed:", err);
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

    // Check if domain already exists
    const existingDomain = await db.query('SELECT id FROM domains WHERE domain = $1', [domain]);
    if (existingDomain.rows.length > 0) {
      return res.status(400).json({ success: false, error: "Domain already exists" });
    }

    // WHOIS lookup
    const whoisInfo = await fetchWhoisInfo(domain);

    // Generate unique ID
    const domainId = Date.now().toString();

    const sql = `
      INSERT INTO domains (id, domain, subdomain, registrar, expiry_date, status, is_active, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *
    `;

    const result = await db.query(sql, [
      domainId,
      domain,
      domain, // subdomain same as domain for now
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

// ---------------- Update Domain ----------------
export const updateDomain: RequestHandler<
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
