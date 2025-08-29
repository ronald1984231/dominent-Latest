import { RequestHandler } from "express";
import { 
  RegistrarImportRequest, 
  RegistrarImportResponse, 
  RegistrarDomainData,
  CreateErrorLogRequest,
  ErrorLog
} from "@shared/internal-api";
import { db } from "../db/connection";
import { AddDomainRequest } from "@shared/domain-api";

// GoDaddy API integration
const callGoDaddyAPI = async (apiKey: string, apiSecret: string): Promise<RegistrarDomainData[]> => {
  try {
    // GoDaddy API endpoint for listing domains
    const response = await fetch('https://api.godaddy.com/v1/domains', {
      headers: {
        'Authorization': `sso-key ${apiKey}:${apiSecret}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`GoDaddy API error: ${response.status} ${response.statusText}`);
    }

    const domains = await response.json();
    
    return domains.map((domain: any) => ({
      domain: domain.domain,
      registrar: 'GoDaddy',
      expiryDate: domain.expires ? new Date(domain.expires).toISOString().split('T')[0] : undefined,
      autoRenew: domain.renewAuto || false,
      nameservers: domain.nameServers || [],
      status: domain.status || 'Active'
    }));
  } catch (error) {
    throw new Error(`GoDaddy API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Namecheap API integration (XML-based)
const callNamecheapAPI = async (apiKey: string, apiSecret: string): Promise<RegistrarDomainData[]> => {
  try {
    // Namecheap uses XML API, this is a simplified example
    const response = await fetch(`https://api.namecheap.com/xml.response?ApiUser=${apiSecret}&ApiKey=${apiKey}&UserName=${apiSecret}&Command=namecheap.domains.getList&ClientIp=127.0.0.1`, {
      method: 'GET'
    });

    if (!response.ok) {
      throw new Error(`Namecheap API error: ${response.status} ${response.statusText}`);
    }

    const xmlText = await response.text();
    
    // Basic XML parsing for demo - in production, use proper XML parser
    const domainMatches = xmlText.match(/<Domain\s+ID="\d+"\s+Name="([^"]+)"\s+User="[^"]+"\s+Created="[^"]+"\s+Expires="([^"]+)"\s+IsExpired="[^"]+"\s+IsLocked="[^"]+"\s+AutoRenew="([^"]+)"\s+WhoisGuard="[^"]+"\s+IsPremium="[^"]+"\s+IsOurDNS="[^"]+"\s*\/>/g);
    
    if (!domainMatches) {
      return [];
    }

    return domainMatches.map(match => {
      const nameMatch = match.match(/Name="([^"]+)"/);
      const expiryMatch = match.match(/Expires="([^"]+)"/);
      const autoRenewMatch = match.match(/AutoRenew="([^"]+)"/);
      
      return {
        domain: nameMatch ? nameMatch[1] : '',
        registrar: 'Namecheap',
        expiryDate: expiryMatch ? new Date(expiryMatch[1]).toISOString().split('T')[0] : undefined,
        autoRenew: autoRenewMatch ? autoRenewMatch[1].toLowerCase() === 'true' : false,
        nameservers: [],
        status: 'Active'
      };
    }).filter(domain => domain.domain);
  } catch (error) {
    throw new Error(`Namecheap API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Cloudflare API integration
const callCloudflareAPI = async (apiKey: string, apiSecret: string): Promise<RegistrarDomainData[]> => {
  try {
    // Cloudflare uses different authentication (Bearer token)
    const response = await fetch('https://api.cloudflare.com/client/v4/registrar/domains', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Cloudflare API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(`Cloudflare API returned error: ${data.errors?.[0]?.message || 'Unknown error'}`);
    }

    return data.result.map((domain: any) => ({
      domain: domain.name,
      registrar: 'Cloudflare',
      expiryDate: domain.expires_at ? new Date(domain.expires_at).toISOString().split('T')[0] : undefined,
      autoRenew: domain.auto_renew || false,
      nameservers: domain.name_servers || [],
      status: domain.status || 'Active'
    }));
  } catch (error) {
    throw new Error(`Cloudflare API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Porkbun API integration
const callPorkbunAPI = async (apiKey: string, apiSecret: string): Promise<RegistrarDomainData[]> => {
  try {
    const response = await fetch('https://porkbun.com/api/json/v3/domain/listAll', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        secretapikey: apiSecret,
        apikey: apiKey
      })
    });

    if (!response.ok) {
      throw new Error(`Porkbun API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.status !== 'SUCCESS') {
      throw new Error(`Porkbun API error: ${data.message || 'Unknown error'}`);
    }

    return data.domains.map((domain: any) => ({
      domain: domain.domain,
      registrar: 'Porkbun',
      expiryDate: domain.expireDate ? new Date(domain.expireDate).toISOString().split('T')[0] : undefined,
      autoRenew: domain.autoRenew === 'yes',
      nameservers: domain.ns || [],
      status: domain.status || 'Active'
    }));
  } catch (error) {
    throw new Error(`Porkbun API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// WHOIS fallback function
const performWhoisLookup = async (domain: string): Promise<RegistrarDomainData> => {
  try {
    const whois = await import('whois');

    return new Promise((resolve, reject) => {
      whois.lookup(domain, (err: any, data: any) => {
        if (err) {
          reject(new Error(`WHOIS lookup failed for ${domain}: ${err.message}`));
          return;
        }

        try {
          // Parse WHOIS data to extract registrar and expiry date
          const lines = data.split('\n');
          let registrar = 'Unknown (WHOIS)';
          let expiryDate: string | undefined;
          let nameservers: string[] = [];

          for (const line of lines) {
            const lowerLine = line.toLowerCase().trim();

            // Extract registrar
            if (lowerLine.includes('registrar:') || lowerLine.includes('registrar name:')) {
              registrar = line.split(':')[1]?.trim() || registrar;
            }

            // Extract expiry date (various formats)
            if (lowerLine.includes('expiry date:') ||
                lowerLine.includes('expiration date:') ||
                lowerLine.includes('expires:') ||
                lowerLine.includes('registry expiry date:')) {
              const dateStr = line.split(':')[1]?.trim();
              if (dateStr) {
                try {
                  const date = new Date(dateStr);
                  if (!isNaN(date.getTime())) {
                    expiryDate = date.toISOString().split('T')[0];
                  }
                } catch (dateError) {
                  console.warn(`Failed to parse WHOIS date for ${domain}:`, dateStr);
                }
              }
            }

            // Extract nameservers
            if (lowerLine.includes('name server:') || lowerLine.includes('nameserver:')) {
              const ns = line.split(':')[1]?.trim();
              if (ns) {
                nameservers.push(ns);
              }
            }
          }

          resolve({
            domain,
            registrar,
            expiryDate,
            autoRenew: false, // WHOIS doesn't provide auto-renewal info
            nameservers,
            status: 'Active'
          });
        } catch (parseError) {
          reject(new Error(`Failed to parse WHOIS data for ${domain}: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`));
        }
      });
    });
  } catch (error) {
    throw new Error(`WHOIS lookup failed for ${domain}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Log error to database
const logError = async (errorData: CreateErrorLogRequest): Promise<void> => {
  try {
    await db.query(`
      INSERT INTO error_logs (id, type, domain, registrar_id, message, details, timestamp)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
    `, [
      Date.now().toString(),
      errorData.type,
      errorData.domain || null,
      errorData.registrarId || null,
      errorData.message,
      errorData.details ? JSON.stringify(errorData.details) : null
    ]);
  } catch (error) {
    console.error('Failed to log error:', error);
  }
};

// Main import function
export const importDomainsFromRegistrar: RequestHandler = async (req, res) => {
  try {
    const { registrarId }: RegistrarImportRequest = req.body;

    if (!registrarId) {
      return res.status(400).json({
        success: false,
        importedCount: 0,
        failedCount: 0,
        domains: [],
        errors: ['Registrar ID is required'],
        registrarName: ''
      } as RegistrarImportResponse);
    }

    // Get registrar details from database
    const registrarResult = await db.query(`
      SELECT id, name, api_key, api_secret, api_credentials
      FROM registrars
      WHERE id = $1
    `, [registrarId]);

    if (registrarResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        importedCount: 0,
        failedCount: 0,
        domains: [],
        errors: ['Registrar not found'],
        registrarName: ''
      } as RegistrarImportResponse);
    }

    const registrar = registrarResult.rows[0];
    let domains: RegistrarDomainData[] = [];
    const errors: string[] = [];
    let importedCount = 0;
    let failedCount = 0;

    try {
      // Call appropriate registrar API based on registrar name
      switch (registrar.name.toLowerCase()) {
        case 'godaddy':
          domains = await callGoDaddyAPI(registrar.api_key, registrar.api_secret);
          break;
        case 'namecheap':
          domains = await callNamecheapAPI(registrar.api_key, registrar.api_secret);
          break;
        case 'cloudflare':
          domains = await callCloudflareAPI(registrar.api_key, registrar.api_secret);
          break;
        case 'porkbun':
          domains = await callPorkbunAPI(registrar.api_key, registrar.api_secret);
          break;
        default:
          throw new Error(`Registrar ${registrar.name} API not supported yet`);
      }

      // Process each domain from the registrar
      for (const domainData of domains) {
        try {
          // Check if domain already exists
          const existingResult = await db.query(
            'SELECT id FROM domains WHERE domain = $1',
            [domainData.domain.toLowerCase()]
          );

          if (existingResult.rows.length === 0) {
            // Add new domain to database
            const newDomainId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
            await db.query(`
              INSERT INTO domains (
                id, domain, subdomain, registrar, expiry_date, 
                auto_renew, status, last_check, is_active, created_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
            `, [
              newDomainId,
              domainData.domain.toLowerCase(),
              domainData.domain.toLowerCase(),
              domainData.registrar,
              domainData.expiryDate ? new Date(domainData.expiryDate) : null,
              domainData.autoRenew || false,
              'Online',
              'Just imported',
              true
            ]);
            importedCount++;
          } else {
            // Update existing domain with registrar data
            await db.query(`
              UPDATE domains 
              SET registrar = $1, expiry_date = $2, auto_renew = $3, last_check = $4
              WHERE domain = $5
            `, [
              domainData.registrar,
              domainData.expiryDate ? new Date(domainData.expiryDate) : null,
              domainData.autoRenew || false,
              'Just updated from registrar',
              domainData.domain.toLowerCase()
            ]);
            importedCount++;
          }
        } catch (domainError) {
          failedCount++;
          const errorMessage = `Failed to process domain ${domainData.domain}: ${domainError instanceof Error ? domainError.message : 'Unknown error'}`;
          errors.push(errorMessage);

          // Log error to database
          await logError({
            type: 'registrar_import',
            domain: domainData.domain,
            registrarId: registrarId,
            message: errorMessage,
            details: { domainData, error: domainError }
          });
        }
      }

    } catch (apiError) {
      // Registrar API failed, try WHOIS fallback for existing domains
      const errorMessage = `Registrar API failed: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`;
      errors.push(errorMessage);

      // Log API failure
      await logError({
        type: 'registrar_import',
        registrarId: registrarId,
        message: errorMessage,
        details: { registrarName: registrar.name, error: apiError }
      });

      // Get existing domains for this registrar to try WHOIS fallback
      const existingDomainsResult = await db.query(
        'SELECT domain FROM domains WHERE registrar = $1 AND is_active = true',
        [registrar.name]
      );

      for (const row of existingDomainsResult.rows) {
        try {
          const whoisData = await performWhoisLookup(row.domain);
          domains.push(whoisData);
          
          // Update domain with WHOIS data if available
          if (whoisData.expiryDate) {
            await db.query(`
              UPDATE domains 
              SET expiry_date = $1, last_whois_check = CURRENT_TIMESTAMP, last_check = $2
              WHERE domain = $3
            `, [
              new Date(whoisData.expiryDate),
              'WHOIS fallback used',
              row.domain
            ]);
            importedCount++;
          }
        } catch (whoisError) {
          failedCount++;
          const whoisErrorMessage = `WHOIS fallback failed for ${row.domain}: ${whoisError instanceof Error ? whoisError.message : 'Unknown error'}`;
          errors.push(whoisErrorMessage);

          await logError({
            type: 'whois_lookup',
            domain: row.domain,
            registrarId: registrarId,
            message: whoisErrorMessage,
            details: { error: whoisError }
          });
        }
      }
    }

    // Update registrar status and domain count
    await db.query(`
      UPDATE registrars 
      SET domain_count = $1, api_status = $2, status = $2
      WHERE id = $3
    `, [
      importedCount,
      errors.length === 0 ? 'Connected' : 'Disconnected',
      registrarId
    ]);

    const response: RegistrarImportResponse = {
      success: failedCount === 0 || importedCount > 0,
      importedCount,
      failedCount,
      domains,
      errors,
      registrarName: registrar.name
    };

    res.json(response);
  } catch (error) {
    console.error('Import domains error:', error);
    
    // Log the general import error
    await logError({
      type: 'registrar_import',
      registrarId: req.body.registrarId,
      message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: { error }
    });

    res.status(500).json({
      success: false,
      importedCount: 0,
      failedCount: 0,
      domains: [],
      errors: ['Internal server error during import'],
      registrarName: ''
    } as RegistrarImportResponse);
  }
};

// Get error logs
export const getErrorLogs: RequestHandler = async (req, res) => {
  try {
    const { type, domain, registrarId, limit = 50, offset = 0 } = req.query;

    let whereConditions: string[] = [];
    let params: any[] = [];
    let paramCount = 0;

    if (type) {
      paramCount++;
      whereConditions.push(`type = $${paramCount}`);
      params.push(type);
    }

    if (domain) {
      paramCount++;
      whereConditions.push(`domain = $${paramCount}`);
      params.push(domain);
    }

    if (registrarId) {
      paramCount++;
      whereConditions.push(`registrar_id = $${paramCount}`);
      params.push(registrarId);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const result = await db.query(`
      SELECT * FROM error_logs 
      ${whereClause}
      ORDER BY timestamp DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `, [...params, limit, offset]);

    const logs: ErrorLog[] = result.rows.map(row => ({
      id: row.id,
      type: row.type,
      domain: row.domain,
      registrarId: row.registrar_id,
      message: row.message,
      details: row.details ? JSON.parse(row.details) : undefined,
      timestamp: row.timestamp.toISOString()
    }));

    res.json({ logs });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Failed to fetch error logs' });
  }
};
