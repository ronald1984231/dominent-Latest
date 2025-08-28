export interface Domain {
  id: string;
  domain: string;
  subdomain: string;
  registrar: string;
  expirationDate: string;
  expiry_date?: string; // WHOIS expiry date (YYYY-MM-DD format)
  ssl_status?: 'valid' | 'expired' | 'unknown';
  ssl_expiry?: string; // SSL certificate expiry date (YYYY-MM-DD format)
  status: 'Online' | 'Offline' | 'Unknown';
  lastCheck: string;
  lastWhoisCheck?: string;
  lastSslCheck?: string;
  isActive: boolean; // Whether to monitor this domain
  createdAt: string;
  userId?: string;
}

export interface DomainCheckResponse {
  domain: string;
  isAvailable: boolean;
  registrar?: string;
  expirationDate?: string;
  nameservers?: string[];
  status: 'Online' | 'Offline' | 'Unknown';
  lastChecked: string;
}

export interface AddDomainRequest {
  domain: string;
}

export interface AddDomainResponse {
  success: boolean;
  domain?: Domain;
  error?: string;
}

export interface GetDomainsResponse {
  domains: Domain[];
  total: number;
}

export interface DomainSearchQuery {
  search?: string;
  registrar?: string;
  status?: string;
  limit?: number;
  offset?: number;
}
