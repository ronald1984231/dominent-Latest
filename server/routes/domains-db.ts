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
import { db } from "../db/connection";

// Helpers to safely convert potential string/Date values to ISO strings
const toISODate = (v: any): string | undefined => {
  if (!v) return undefined;
  const d = typeof v === 'string' ? new Date(v) : v;
  if (!(d instanceof Date) || isNaN(d.getTime())) return undefined;
  return d.toISOString().split('T')[0];
};
const toISO = (v: any): string | undefined => {
  if (!v) return undefined;
  const d = typeof v === 'string' ? new Date(v) : v;
  if (!(d instanceof Date) || isNaN(d.getTime())) return undefined;
  return d.toISOString();
};

// Get all domains with optional filtering
export const getDomains: RequestHandler = async (req, res) => {
  try {
    const query = req.query as DomainSearchQuery;
    let whereConditions: string[] = ['is_active = $1'];
    let params: any[] = [true];
    let paramCount = 1;

    // Apply search filter
    if (query.search) {
      paramCount++;
      whereConditions.push(`(domain ILIKE $${paramCount} OR registrar ILIKE $${paramCount})`);
      params.push(`%${query.search}%`);
    }

    // Apply registrar filter
    if (query.registrar && query.registrar !== 'all') {
      paramCount++;
      whereConditions.push(`registrar ILIKE $${paramCount}`);
      params.push(`%${query.registrar}%`);
    }

    // Apply status filter
    if (query.status && query.status !== 'all') {
      paramCount++;
      whereConditions.push(`status = $${paramCount}`);
      params.push(query.status);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // Apply pagination
    const limit = query.limit ? parseInt(query.limit.toString()) : 50;
    const offset = query.offset ? parseInt(query.offset.toString()) : 0;

    const countResult = await db.query(`
      SELECT COUNT(*) as total 
      FROM domains 
      ${whereClause}
    `, params);

    const result = await db.query(`
      SELECT * 
      FROM domains 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `, [...params, limit, offset]);

    const domains: Domain[] = result.rows.map(row => ({
      id: row.id,
      domain: row.domain,
      subdomain: row.subdomain || row.domain,
      registrar: row.registrar || "Unknown",
      expirationDate: row.expiration_date || "Unknown",
      expiry_date: toISODate(row.expiry_date),
      ssl_status: row.ssl_status || "unknown",
      ssl_expiry: toISO(row.ssl_expiry),
      status: row.status || "Unknown",
      lastCheck: row.last_check || "Never",
      lastWhoisCheck: toISO(row.last_whois_check),
      lastSslCheck: toISO(row.last_ssl_check),
      isActive: row.is_active,
      createdAt: (typeof row.created_at === 'string' ? new Date(row.created_at) : row.created_at).toISOString()
    }));

    const response: GetDomainsResponse = {
      domains,
      total: parseInt(countResult.rows[0].total)
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching domains:", error);
    res.status(500).json({ error: "Failed to fetch domains" });
  }
};

// Add a new domain to monitor
export const addDomain: RequestHandler = async (req, res) => {
  try {
    const { domain }: AddDomainRequest = req.body;

    if (!domain) {
      const response: AddDomainResponse = {
        success: false,
        error: "Domain is required"
      };
      return res.status(400).json(response);
    }

    // Check if domain already exists
    const existingResult = await db.query(
      'SELECT id FROM domains WHERE domain = $1',
      [domain.toLowerCase()]
    );

    if (existingResult.rows.length > 0) {
      const response: AddDomainResponse = {
        success: false,
        error: "Domain is already being monitored"
      };
      return res.status(409).json(response);
    }

    // Create new domain entry
    const newDomainId = Date.now().toString();
    const result = await db.query(`
      INSERT INTO domains (
        id, domain, subdomain, registrar, expiration_date, 
        ssl_status, status, last_check, is_active, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
      RETURNING *
    `, [
      newDomainId,
      domain.toLowerCase(),
      domain.toLowerCase(),
      "Unknown",
      "Unknown",
      "unknown",
      "Unknown",
      "Never",
      true
    ]);

    const newDomain: Domain = {
      id: result.rows[0].id,
      domain: result.rows[0].domain,
      subdomain: result.rows[0].subdomain,
      registrar: result.rows[0].registrar,
      expirationDate: result.rows[0].expiration_date,
      expiry_date: undefined,
      ssl_status: result.rows[0].ssl_status,
      ssl_expiry: undefined,
      status: result.rows[0].status,
      lastCheck: result.rows[0].last_check,
      lastWhoisCheck: undefined,
      lastSslCheck: undefined,
      isActive: result.rows[0].is_active,
      createdAt: result.rows[0].created_at.toISOString()
    };

    // Trigger immediate domain monitoring check
    setTimeout(async () => {
      try {
        const { monitoringService } = await import("../services/monitoring-service");
        const updateData = await monitoringService.enhancedMonitorDomain(newDomain);

        // Update the domain with monitoring results
        await db.query(`
          UPDATE domains
          SET
            status = $1,
            last_check = $2,
            last_whois_check = $3,
            last_ssl_check = $4,
            expiry_date = $5,
            ssl_expiry = $6,
            ssl_status = $7,
            registrar = $8
          WHERE id = $9
        `, [
          "Online",
          "Just now",
          updateData.lastWhoisCheck ? new Date(updateData.lastWhoisCheck) : null,
          updateData.lastSslCheck ? new Date(updateData.lastSslCheck) : null,
          updateData.expiry_date ? new Date(updateData.expiry_date) : null,
          updateData.ssl_expiry ? new Date(updateData.ssl_expiry) : null,
          updateData.ssl_status || null,
          updateData.registrar || null,
          newDomainId  // Missing domain ID parameter
        ]);
      } catch (error) {
        console.error(`Initial monitoring failed for ${domain}:`, error);
      }
    }, 1000);

    const response: AddDomainResponse = {
      success: true,
      domain: newDomain
    };

    res.json(response);
  } catch (error) {
    console.error("Error adding domain:", error);
    res.status(500).json({ error: "Failed to add domain" });
  }
};

// Delete a domain from monitoring
export const deleteDomain: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query('DELETE FROM domains WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Domain not found" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting domain:", error);
    res.status(500).json({ error: "Failed to delete domain" });
  }
};

// Trigger domain monitoring
export const triggerDomainMonitoring: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query('SELECT * FROM domains WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Domain not found" });
    }

    const row = result.rows[0];
    const domain: Domain = {
      id: row.id,
      domain: row.domain,
      subdomain: row.subdomain || row.domain,
      registrar: row.registrar || "Unknown",
      expirationDate: row.expiration_date || "Unknown",
      expiry_date: toISODate(row.expiry_date),
      ssl_status: row.ssl_status || "unknown",
      ssl_expiry: toISO(row.ssl_expiry),
      status: row.status || "Unknown",
      lastCheck: row.last_check || "Never",
      lastWhoisCheck: toISO(row.last_whois_check),
      lastSslCheck: toISO(row.last_ssl_check),
      isActive: row.is_active,
      createdAt: (typeof row.created_at === 'string' ? new Date(row.created_at) : row.created_at).toISOString()
    };

    // Use real monitoring service
    const { monitoringService } = await import("../services/monitoring-service");
    const monitoringUpdate = await monitoringService.enhancedMonitorDomain(domain);

    // Apply the monitoring updates to the domain
    await db.query(`
      UPDATE domains
      SET
        status = $1,
        last_check = $2,
        last_whois_check = $3,
        last_ssl_check = $4,
        expiry_date = $5,
        ssl_expiry = $6,
        ssl_status = $7,
        registrar = $8
      WHERE id = $9
    `, [
      "Online", // Default to online if monitoring succeeds
      "Just now",
      monitoringUpdate.lastWhoisCheck ? new Date(monitoringUpdate.lastWhoisCheck) : null,
      monitoringUpdate.lastSslCheck ? new Date(monitoringUpdate.lastSslCheck) : null,
      monitoringUpdate.expiry_date ? new Date(monitoringUpdate.expiry_date) : null,
      monitoringUpdate.ssl_expiry ? new Date(monitoringUpdate.ssl_expiry) : null,
      monitoringUpdate.ssl_status || null,
      monitoringUpdate.registrar || null,
      id  // Missing domain ID parameter
    ]);

    const response: DomainMonitoringResponse = {
      success: true,
      message: "Domain monitoring completed successfully",
      updates: {
        status: "Online",
        lastCheck: "Just now",
        lastWhoisCheck: monitoringUpdate.lastWhoisCheck,
        lastSslCheck: monitoringUpdate.lastSslCheck,
        ...(monitoringUpdate.expiry_date && { expiry_date: monitoringUpdate.expiry_date }),
        ...(monitoringUpdate.ssl_expiry && { ssl_expiry: monitoringUpdate.ssl_expiry }),
        ...(monitoringUpdate.ssl_status && { ssl_status: monitoringUpdate.ssl_status }),
        ...(monitoringUpdate.registrar && { registrar: monitoringUpdate.registrar })
      }
    };

    res.json(response);
  } catch (error) {
    console.error(`Domain monitoring failed:`, error);

    const response: DomainMonitoringResponse = {
      success: false,
      message: "Domain monitoring failed",
      errors: [error instanceof Error ? error.message : "Unknown error"]
    };

    res.status(500).json(response);
  }
};

// Get unique registrars for filter dropdown
export const getRegistrars: RequestHandler = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT DISTINCT registrar 
      FROM domains 
      WHERE registrar IS NOT NULL 
        AND registrar != 'Unknown' 
        AND registrar != ''
      ORDER BY registrar
    `);

    const registrars = result.rows.map(row => row.registrar);
    res.json({ registrars });
  } catch (error) {
    console.error("Error fetching registrars:", error);
    res.status(500).json({ error: "Failed to fetch registrars" });
  }
};

// Helper function for cron service to update domain data
export const updateDomainFromCron = async (domainId: string, updateData: Partial<Domain>): Promise<boolean> => {
  try {
    const updates: string[] = [];
    const params: any[] = [];
    let paramCount = 0;

    // Build dynamic update query
    if (updateData.status !== undefined) {
      paramCount++;
      updates.push(`status = $${paramCount}`);
      params.push(updateData.status);
    }

    if (updateData.lastCheck !== undefined) {
      paramCount++;
      updates.push(`last_check = $${paramCount}`);
      params.push(updateData.lastCheck);
    }

    if (updateData.expiry_date !== undefined) {
      paramCount++;
      updates.push(`expiry_date = $${paramCount}`);
      params.push(updateData.expiry_date ? new Date(updateData.expiry_date) : null);
    }

    if (updateData.ssl_expiry !== undefined) {
      paramCount++;
      updates.push(`ssl_expiry = $${paramCount}`);
      params.push(updateData.ssl_expiry ? new Date(updateData.ssl_expiry) : null);
    }

    if (updateData.ssl_status !== undefined) {
      paramCount++;
      updates.push(`ssl_status = $${paramCount}`);
      params.push(updateData.ssl_status);
    }

    if (updateData.registrar !== undefined) {
      paramCount++;
      updates.push(`registrar = $${paramCount}`);
      params.push(updateData.registrar);
    }

    if (updateData.lastWhoisCheck !== undefined) {
      paramCount++;
      updates.push(`last_whois_check = $${paramCount}`);
      params.push(updateData.lastWhoisCheck ? new Date(updateData.lastWhoisCheck) : null);
    }

    if (updateData.lastSslCheck !== undefined) {
      paramCount++;
      updates.push(`last_ssl_check = $${paramCount}`);
      params.push(updateData.lastSslCheck ? new Date(updateData.lastSslCheck) : null);
    }

    if (updates.length === 0) {
      return false;
    }

    paramCount++;
    const query = `
      UPDATE domains 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING domain
    `;
    params.push(domainId);

    const result = await db.query(query, params);

    if (result.rows.length > 0) {
      console.log(`🔄 Domain ${result.rows[0].domain} updated:`, {
        expiry_date: updateData.expiry_date ? 'Updated' : 'Unchanged',
        ssl_expiry: updateData.ssl_expiry ? 'Updated' : 'Unchanged',
        ssl_status: updateData.ssl_status || 'Unchanged',
        registrar: updateData.registrar ? 'Updated' : 'Unchanged'
      });
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error updating domain ${domainId}:`, error);
    return false;
  }
};

// Helper function to get all domains for cron service
export const getAllDomainsForCron = async (): Promise<Domain[]> => {
  try {
    const result = await db.query('SELECT * FROM domains WHERE is_active = true ORDER BY created_at DESC');

    return result.rows.map(row => ({
      id: row.id,
      domain: row.domain,
      subdomain: row.subdomain || row.domain,
      registrar: row.registrar || "Unknown",
      expirationDate: row.expiration_date || "Unknown",
      expiry_date: toISODate(row.expiry_date),
      ssl_status: row.ssl_status || "unknown",
      ssl_expiry: toISO(row.ssl_expiry),
      status: row.status || "Unknown",
      lastCheck: row.last_check || "Never",
      lastWhoisCheck: toISO(row.last_whois_check),
      lastSslCheck: toISO(row.last_ssl_check),
      isActive: row.is_active,
      createdAt: (typeof row.created_at === 'string' ? new Date(row.created_at) : row.created_at).toISOString()
    }));
  } catch (error) {
    console.error("Error fetching domains for cron:", error);
    return [];
  }
};
