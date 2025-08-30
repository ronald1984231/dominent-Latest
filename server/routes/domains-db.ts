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

    // WHOIS lookup
    const whoisInfo = await fetchWhoisInfo(domain);

    const sql = `
      INSERT INTO domains (domain, registrar, expiry_date, status, is_active, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *
    `;

    const result = await db.query(sql, [
      domain,
      whoisInfo.registrar,
      whoisInfo.expiryDate,
      "Active",
      true
    ]);

    const saved = result.rows[0];
    res.json({ success: true, domain: saved });
  } catch (err) {
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

    const updated = await db.domain.update({
      where: { domain },
      data: {
        registrar: whoisInfo.registrar,
        expiry_date: whoisInfo.expiryDate,
      },
    });

    res.json({ success: true, domain: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : "Unknown error" });
  }
};

// ---------------- Delete Domain ----------------
export const deleteDomain: RequestHandler<{ id: string }> = async (req, res) => {
  try {
    const { id } = req.params;

    await db.domain.update({
      where: { id },
      data: { is_active: false },
    });

    res.json({ success: true, message: "Domain deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : "Unknown error" });
  }
};

// ---------------- Extra Exports (for index.ts compatibility) ----------------

// Get Registrars (basic placeholder, adjust if you have a real registrar DB table)
export const getRegistrars: RequestHandler = async (req, res) => {
  try {
    const results = await db.registrar.findMany();
    res.json({ success: true, registrars: results });
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
