import fetch from "node-fetch";
import whois from "whois-json";
import * as tls from "tls";

export interface RegistrarConfig {
  type: "namecheap" | "godaddy" | "cloudflare" | "networksolutions" | "enom";
  apiUser?: string;
  apiKey?: string;
  username?: string;
  clientIp?: string;
  // Additional config fields for different registrars
  [key: string]: any;
}

export interface DomainInfo {
  domain: string;
  registrar: string;
  domain_expiry: string | null;
  ssl_expiry: string | null;
  ssl_status: 'valid' | 'expired' | 'unknown';
  status: string;
  source: 'api' | 'whois' | 'unknown';
  errors?: string[];
}

/**
 * Get domain information from registrar API
 */
async function getFromRegistrarAPI(domain: string, registrarConfig: RegistrarConfig): Promise<Partial<DomainInfo> | null> {
  try {
    if (registrarConfig.type === "namecheap") {
      const url = `https://api.namecheap.com/xml.response?ApiUser=${registrarConfig.apiUser}&ApiKey=${registrarConfig.apiKey}&UserName=${registrarConfig.username}&Command=namecheap.domains.getList&ClientIp=${registrarConfig.clientIp}`;
      
      const response = await fetch(url);
      const text = await response.text();
      
      if (text.includes(domain)) {
        // Simple XML parsing for Namecheap response
        const expiryMatch = text.match(/Expires="([^"]+)"/);
        const registrarMatch = text.match(/Registrar="([^"]+)"/);
        
        return {
          registrar: registrarMatch ? registrarMatch[1] : "Namecheap, Inc.",
          domain_expiry: expiryMatch ? expiryMatch[1] : null,
          source: 'api'
        };
      }
    } else if (registrarConfig.type === "godaddy") {
      // GoDaddy API integration
      const url = `https://api.godaddy.com/v1/domains/${domain}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `sso-key ${registrarConfig.apiKey}:${registrarConfig.apiSecret}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data: any = await response.json();
        return {
          registrar: "GoDaddy Inc.",
          domain_expiry: data.expires ? new Date(data.expires).toISOString().split('T')[0] : null,
          source: 'api'
        };
      }
    } else if (registrarConfig.type === "cloudflare") {
      // Cloudflare API integration
      const url = `https://api.cloudflare.com/client/v4/zones?name=${domain}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${registrarConfig.apiToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data: any = await response.json();
        if (data.result && data.result.length > 0) {
          return {
            registrar: "Cloudflare, Inc.",
            source: 'api'
            // Note: Cloudflare API doesn't typically return expiry dates for registrar info
          };
        }
      }
    }
    // Add more registrar APIs here (NetworkSolutions, Enom, etc.)
    
    return null;
  } catch (err) {
    console.error(`Registrar API error for ${domain}:`, err);
    return null;
  }
}

/**
 * Enhanced WHOIS lookup using whois-json with fallback to basic whois
 */
async function getFromWhois(domain: string): Promise<Partial<DomainInfo> | null> {
  console.log(`🔍 Starting WHOIS lookup for ${domain}`);

  try {
    const data = await whois(domain);
    console.log(`📋 WHOIS data received for ${domain}:`, JSON.stringify(data, null, 2));

    let registrar = "Unknown";
    let domain_expiry = null;

    // Extract registrar information with more comprehensive search
    const registrarFields = [
      'registrar', 'registrarName', 'sponsoringRegistrar',
      'registrarOrganization', 'registrar_name', 'registrarIanaId'
    ];

    for (const field of registrarFields) {
      if (data[field] && typeof data[field] === 'string') {
        registrar = data[field];
        break;
      }
    }

    // Extract expiry date with more comprehensive search
    const expiryFields = [
      'expirationDate', 'registryExpiryDate', 'expiry_date',
      'expires', 'expiration_time', 'registrar_registration_expiration_date'
    ];

    for (const field of expiryFields) {
      if (data[field]) {
        const expiry = new Date(data[field]);
        if (!isNaN(expiry.getTime())) {
          domain_expiry = expiry.toISOString().split('T')[0];
          console.log(`📅 Found expiry date for ${domain}: ${domain_expiry} (from field: ${field})`);
          break;
        }
      }
    }

    const result = {
      registrar: cleanRegistrarName(registrar),
      domain_expiry,
      source: 'whois' as const
    };

    console.log(`✅ WHOIS result for ${domain}:`, result);
    return result;
  } catch (err) {
    console.error(`❌ WHOIS error for ${domain}:`, err);

    // Try fallback with basic whois package
    try {
      console.log(`🔄 Trying fallback WHOIS for ${domain}`);
      const { getWhois } = await import("./domain-monitor");
      const fallbackResult = await getWhois(domain);

      if (fallbackResult.expiry_date) {
        console.log(`✅ Fallback WHOIS succeeded for ${domain}`);
        return {
          registrar: fallbackResult.registrar || "Unknown",
          domain_expiry: fallbackResult.expiry_date,
          source: 'whois' as const
        };
      }
    } catch (fallbackErr) {
      console.error(`❌ Fallback WHOIS also failed for ${domain}:`, fallbackErr);
    }

    return null;
  }
}

/**
 * Clean and normalize registrar names
 */
function cleanRegistrarName(rawName: string): string {
  if (!rawName) return "Unknown";

  let cleaned = rawName.trim();

  // Remove common suffixes and normalize
  const cleanupPatterns = [
    // Remove WHOIS server domains
    /^whois\./i,
    // Remove common TLDs when registrar is just a domain
    /\.(com|net|org|info)$/i
  ];

  for (const pattern of cleanupPatterns) {
    cleaned = cleaned.replace(pattern, '');
  }

  // Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // Capitalize registrar names properly
  cleaned = cleaned.replace(/\b\w+/g, (word) => {
    // Handle special cases
    const specialCases: { [key: string]: string } = {
      'llc': 'LLC',
      'inc': 'Inc.',
      'corp': 'Corp.',
      'ltd': 'Ltd.',
      'gmbh': 'GmbH',
      'sa': 'SA',
      'bv': 'BV',
      'ab': 'AB',
      'ag': 'AG',
      'as': 'AS',
      'pvt': 'Pvt.',
      'pty': 'Pty.',
      'co': 'Co.',
      'godaddy': 'GoDaddy',
      'namecheap': 'Namecheap',
      'cloudflare': 'Cloudflare',
      'networksolutions': 'Network Solutions'
    };

    const lowerWord = word.toLowerCase();
    if (specialCases[lowerWord]) {
      return specialCases[lowerWord];
    }

    // Standard title case
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });

  return cleaned || "Unknown";
}

/**
 * Enhanced SSL certificate expiry check
 */
async function getSSLExpiry(domain: string): Promise<{ ssl_expiry: Date | null; ssl_status: 'valid' | 'expired' | 'unknown' }> {
  return new Promise((resolve) => {
    // Clean domain - remove protocol and www if present
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    
    const socket = tls.connect(
      { 
        host: cleanDomain, 
        port: 443, 
        servername: cleanDomain,
        timeout: 10000 // 10 second timeout
      },
      () => {
        try {
          const cert = socket.getPeerCertificate();
          const expiryDate = cert.valid_to ? new Date(cert.valid_to) : null;
          const now = new Date();
          
          let ssl_status: 'valid' | 'expired' | 'unknown' = 'unknown';
          if (expiryDate) {
            ssl_status = expiryDate > now ? 'valid' : 'expired';
          }
          
          resolve({
            ssl_expiry: expiryDate,
            ssl_status
          });
          socket.end();
        } catch (error) {
          console.error(`SSL parsing error for ${cleanDomain}:`, error);
          resolve({
            ssl_expiry: null,
            ssl_status: 'unknown'
          });
          socket.end();
        }
      }
    );
    
    socket.on("error", (error) => {
      console.error(`SSL connection error for ${cleanDomain}:`, error);
      resolve({
        ssl_expiry: null,
        ssl_status: 'unknown'
      });
    });
    
    socket.on("timeout", () => {
      socket.destroy();
      resolve({
        ssl_expiry: null,
        ssl_status: 'unknown'
      });
    });
  });
}

/**
 * Main domain update function with prioritized data sources
 */
export async function updateDomainInfo(domain: string, registrarConfig?: RegistrarConfig): Promise<DomainInfo> {
  const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  const errors: string[] = [];
  
  let domainInfo: Partial<DomainInfo> = {
    domain: cleanDomain,
    registrar: "Unknown",
    domain_expiry: null,
    source: 'unknown',
    status: "Unknown"
  };

  // STEP 1: Try Registrar API first (highest priority)
  if (registrarConfig) {
    console.log(`Attempting registrar API lookup for ${cleanDomain} using ${registrarConfig.type}`);
    try {
      const apiResult = await getFromRegistrarAPI(cleanDomain, registrarConfig);
      if (apiResult) {
        domainInfo = { ...domainInfo, ...apiResult };
        console.log(`✅ Registrar API data retrieved for ${cleanDomain}`);
      } else {
        errors.push('Registrar API returned no data');
      }
    } catch (error) {
      const errorMsg = `Registrar API failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(errorMsg);
      errors.push(errorMsg);
    }
  }

  // STEP 2: Fallback to WHOIS if API didn't provide complete data
  if (!domainInfo.domain_expiry || domainInfo.registrar === "Unknown") {
    console.log(`Attempting WHOIS lookup for ${cleanDomain}`);
    try {
      const whoisResult = await getFromWhois(cleanDomain);
      if (whoisResult) {
        // Only override if we don't have better data from API
        if (!domainInfo.domain_expiry && whoisResult.domain_expiry) {
          domainInfo.domain_expiry = whoisResult.domain_expiry;
        }
        if (domainInfo.registrar === "Unknown" && whoisResult.registrar) {
          domainInfo.registrar = whoisResult.registrar;
        }
        if (domainInfo.source === 'unknown') {
          domainInfo.source = 'whois';
        }
        console.log(`✅ WHOIS data retrieved for ${cleanDomain}`);
      } else {
        errors.push('WHOIS lookup returned no data');
      }
    } catch (error) {
      const errorMsg = `WHOIS lookup failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(errorMsg);
      errors.push(errorMsg);
    }
  }

  // STEP 3: SSL certificate check (independent of domain data)
  console.log(`Checking SSL certificate for ${cleanDomain}`);
  try {
    const sslResult = await getSSLExpiry(cleanDomain);
    domainInfo.ssl_expiry = sslResult.ssl_expiry ? sslResult.ssl_expiry.toISOString().split('T')[0] : null;
    domainInfo.ssl_status = sslResult.ssl_status;
    console.log(`✅ SSL data retrieved for ${cleanDomain}: status=${sslResult.ssl_status}`);
  } catch (error) {
    const errorMsg = `SSL check failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(errorMsg);
    errors.push(errorMsg);
    domainInfo.ssl_expiry = null;
    domainInfo.ssl_status = 'unknown';
  }

  // Determine overall status
  if (domainInfo.domain_expiry || domainInfo.ssl_expiry) {
    domainInfo.status = "Online";
  } else if (errors.length > 0) {
    domainInfo.status = "Error";
  }

  return {
    domain: cleanDomain,
    registrar: domainInfo.registrar || "Unknown",
    domain_expiry: domainInfo.domain_expiry,
    ssl_expiry: domainInfo.ssl_expiry,
    ssl_status: domainInfo.ssl_status || 'unknown',
    status: domainInfo.status || "Unknown",
    source: domainInfo.source || 'unknown',
    errors: errors.length > 0 ? errors : undefined
  };
}

/**
 * Batch domain monitoring with configurable concurrency
 */
export async function updateMultipleDomains(
  domains: string[], 
  registrarConfigs: { [domain: string]: RegistrarConfig } = {},
  concurrency: number = 3
): Promise<DomainInfo[]> {
  const results: DomainInfo[] = [];
  
  // Process domains in batches to avoid overwhelming APIs
  for (let i = 0; i < domains.length; i += concurrency) {
    const batch = domains.slice(i, i + concurrency);
    const batchPromises = batch.map(domain => 
      updateDomainInfo(domain, registrarConfigs[domain])
    );
    
    const batchResults = await Promise.allSettled(batchPromises);
    
    for (let j = 0; j < batchResults.length; j++) {
      const result = batchResults[j];
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        // Create error result for failed domains
        results.push({
          domain: batch[j],
          registrar: "Unknown",
          domain_expiry: null,
          ssl_expiry: null,
          ssl_status: 'unknown',
          status: "Error",
          source: 'unknown',
          errors: [`Batch processing failed: ${result.reason}`]
        });
      }
    }
    
    // Add delay between batches to be respectful to APIs
    if (i + concurrency < domains.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}

/**
 * Validate registrar configuration
 */
export function validateRegistrarConfig(config: RegistrarConfig): boolean {
  if (!config.type) return false;
  
  switch (config.type) {
    case "namecheap":
      return !!(config.apiUser && config.apiKey && config.username && config.clientIp);
    case "godaddy":
      return !!(config.apiKey && config.apiSecret);
    case "cloudflare":
      return !!(config.apiToken);
    default:
      return false;
  }
}

/**
 * Example usage and testing function
 */
export async function testDomainMonitoring() {
  const registrarConfig: RegistrarConfig = {
    type: "namecheap",
    apiUser: "ronaldstone",
    apiKey: "your_api_key_here",
    username: "ronaldstone",
    clientIp: "your_server_ip"
  };

  console.log("Testing domain monitoring...");
  
  try {
    const result = await updateDomainInfo("samay.com", registrarConfig);
    console.log("Domain monitoring result:", result);
  } catch (error) {
    console.error("Domain monitoring test failed:", error);
  }
}
