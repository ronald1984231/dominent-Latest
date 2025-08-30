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

    const saved = await db.domain.create({
      data: {
        domain,
        registrar: whoisInfo.registrar,
        expiry_date: whoisInfo.expiryDate,
        status: "Active",
        is_active: true,
      },
    });

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
