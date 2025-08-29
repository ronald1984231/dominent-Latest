import * as whois from "whois";
import * as tls from "tls";
import fetch from "node-fetch";

export interface WhoisResult {
  domain: string;
  expiry_date: string | null;
  registrar?: string;
  error?: string;
}

export interface SSLResult {
  domain: string;
  ssl_expiry: string | null;
  ssl_status: 'valid' | 'expired' | 'unknown';
  error?: string;
}

export interface DomainMonitorResult {
  domain: string;
  expiry_date: string | null;
  ssl_expiry: string | null;
  ssl_status: 'valid' | 'expired' | 'unknown';
  registrar?: string;
  whoisError?: string;
  sslError?: string;
}

/**
 * Get WHOIS information for a domain
 */
export function getWhois(domain: string): Promise<WhoisResult> {
  return new Promise((resolve, reject) => {
    // Clean domain - remove protocol and www if present
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    
    whois.lookup(cleanDomain, (err, data) => {
      if (err) {
        console.error(`WHOIS error for ${cleanDomain}:`, err);
        return resolve({ 
          domain: cleanDomain, 
          expiry_date: null, 
          error: err.message || 'WHOIS lookup failed'
        });
      }

      try {
        // Try multiple common expiry date formats
        const expiryPatterns = [
          /Expiry Date:\s*(.*)/i,
          /Registrar Registration Expiration Date:\s*(.*)/i,
          /Registry Expiry Date:\s*(.*)/i,
          /Expiration Date:\s*(.*)/i,
          /expires:\s*(.*)/i,
          /expire:\s*(.*)/i,
          /Expiration Time:\s*(.*)/i
        ];

        let expiryMatch = null;
        for (const pattern of expiryPatterns) {
          expiryMatch = data.match(pattern);
          if (expiryMatch) break;
        }

        // Try to extract registrar information with comprehensive patterns
        const registrarPatterns = [
          /Registrar:\s*(.*)/i,
          /Sponsoring Registrar:\s*(.*)/i,
          /Registrar Name:\s*(.*)/i,
          /Registrar Organization:\s*(.*)/i,
          /Registrar WHOIS Server:\s*whois\.(.*)$/im,
          /Registrar URL:\s*(?:https?:\/\/)?(?:www\.)?([^\/\s]+)/i,
          /Domain registrar:\s*(.*)/i,
          /Registration Service Provider:\s*(.*)/i,
          /Registrar of Record:\s*(.*)/i,
          /Record maintained by:\s*(.*)/i
        ];

        let registrarMatch = null;
        let registrarSource = null;

        for (const pattern of registrarPatterns) {
          registrarMatch = data.match(pattern);
          if (registrarMatch && registrarMatch[1] && registrarMatch[1].trim()) {
            registrarSource = registrarMatch[1].trim();
            break;
          }
        }

        // Clean and normalize registrar name
        let registrar = undefined;
        if (registrarSource) {
          registrar = cleanRegistrarName(registrarSource);
        }

        if (expiryMatch) {
          const expiryDateStr = expiryMatch[1].trim();
          const expiryDate = new Date(expiryDateStr);
          
          if (!isNaN(expiryDate.getTime())) {
            resolve({ 
              domain: cleanDomain, 
              expiry_date: expiryDate.toISOString().split("T")[0],
              registrar 
            });
          } else {
            resolve({ 
              domain: cleanDomain, 
              expiry_date: null, 
              registrar,
              error: 'Could not parse expiry date'
            });
          }
        } else {
          resolve({ 
            domain: cleanDomain, 
            expiry_date: null, 
            registrar,
            error: 'No expiry date found in WHOIS data'
          });
        }
      } catch (parseError) {
        console.error(`WHOIS parsing error for ${cleanDomain}:`, parseError);
        resolve({ 
          domain: cleanDomain, 
          expiry_date: null, 
          error: 'Failed to parse WHOIS data'
        });
      }
    });
  });
}

/**
 * Get SSL certificate information for a domain
 */
export function getSSL(domain: string, port: number = 443): Promise<SSLResult> {
  return new Promise((resolve) => {
    // Clean domain - remove protocol and www if present
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    
    const socket = tls.connect(port, cleanDomain, { 
      servername: cleanDomain,
      timeout: 10000 // 10 second timeout
    }, () => {
      try {
        const cert = socket.getPeerCertificate();
        socket.end();
        
        if (!cert || !cert.valid_to) {
          return resolve({
            domain: cleanDomain,
            ssl_expiry: null,
            ssl_status: 'unknown',
            error: 'No certificate information available'
          });
        }

        const sslExpiryDate = new Date(cert.valid_to);
        const now = new Date();
        
        resolve({ 
          domain: cleanDomain,
          ssl_expiry: sslExpiryDate.toISOString().split("T")[0],
          ssl_status: sslExpiryDate > now ? "valid" : "expired"
        });
      } catch (error) {
        socket.end();
        console.error(`SSL parsing error for ${cleanDomain}:`, error);
        resolve({
          domain: cleanDomain,
          ssl_expiry: null,
          ssl_status: 'unknown',
          error: 'Failed to parse SSL certificate'
        });
      }
    });

    socket.on("error", (error) => {
      console.error(`SSL connection error for ${cleanDomain}:`, error);
      resolve({
        domain: cleanDomain,
        ssl_expiry: null,
        ssl_status: 'unknown',
        error: error.message || 'SSL connection failed'
      });
    });

    socket.on("timeout", () => {
      socket.destroy();
      resolve({
        domain: cleanDomain,
        ssl_expiry: null,
        ssl_status: 'unknown',
        error: 'SSL connection timeout'
      });
    });
  });
}

/**
 * Check both WHOIS and SSL for a domain
 */
export async function checkDomain(domain: string): Promise<DomainMonitorResult> {
  console.log(`Checking domain: ${domain}`);
  
  try {
    const [whoisResult, sslResult] = await Promise.allSettled([
      getWhois(domain),
      getSSL(domain)
    ]);

    const whoisData = whoisResult.status === 'fulfilled' ? whoisResult.value : {
      domain,
      expiry_date: null,
      error: 'WHOIS check failed'
    };

    const sslData = sslResult.status === 'fulfilled' ? sslResult.value : {
      domain,
      ssl_expiry: null,
      ssl_status: 'unknown' as const,
      error: 'SSL check failed'
    };

    return {
      domain,
      expiry_date: whoisData.expiry_date,
      ssl_expiry: sslData.ssl_expiry,
      ssl_status: sslData.ssl_status,
      registrar: whoisData.registrar,
      whoisError: whoisData.error,
      sslError: sslData.error
    };
  } catch (error) {
    console.error(`Domain check failed for ${domain}:`, error);
    return {
      domain,
      expiry_date: null,
      ssl_expiry: null,
      ssl_status: 'unknown',
      whoisError: 'Domain check failed',
      sslError: 'Domain check failed'
    };
  }
}

/**
 * Check if domain expires within the specified number of days
 */
export function isDomainExpiringSoon(expiryDate: string | null, days: number = 30): boolean {
  if (!expiryDate) return false;
  
  const expiry = new Date(expiryDate);
  const now = new Date();
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays <= days && diffDays >= 0;
}

/**
 * Check if SSL certificate expires within the specified number of days
 */
export function isSSLExpiringSoon(sslExpiryDate: string | null, days: number = 30): boolean {
  if (!sslExpiryDate) return false;
  
  const expiry = new Date(sslExpiryDate);
  const now = new Date();
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays <= days && diffDays >= 0;
}

/**
 * Format days until expiry for display
 */
export function formatDaysUntilExpiry(expiryDate: string | null): string {
  if (!expiryDate) return 'Unknown';
  
  const expiry = new Date(expiryDate);
  const now = new Date();
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return `Expired ${Math.abs(diffDays)} days ago`;
  } else if (diffDays === 0) {
    return 'Expires today';
  } else if (diffDays === 1) {
    return 'Expires tomorrow';
  } else {
    return `Expires in ${diffDays} days`;
  }
}
