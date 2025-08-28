export interface Domain {
  id: string;
  domain: string;
  subdomain: string;
  registrar: string;
  expirationDate: string;
  expiry_date?: string; // WHOIS expiry date (YYYY-MM-DD format)
  ssl_status?: 'valid' | 'expired' | 'unknown';
  ssl_expiry?: string; // SSL certificate expiry date (YYYY-MM-DD format)
  ssl_certificates?: SSLCertificate[];
  status: 'Online' | 'Offline' | 'Unknown';
  lastCheck: string;
  lastWhoisCheck?: string;
  lastSslCheck?: string;
  lastDnsCheck?: string;
  isActive: boolean; // Whether to monitor this domain
  autoRenew?: boolean;
  services?: DomainServices;
  dnsRecords?: DNSRecord[];
  createdAt: string;
  userId?: string;
}

export interface SSLCertificate {
  id: string;
  serialNumber: string;
  issuer: string;
  validFrom: string;
  expiresAt: string;
  commonName: string;
  alternativeNames?: string[];
  isValid: boolean;
}

export interface DomainServices {
  hosting?: {
    detected: boolean;
    provider?: string;
    ipAddress?: string;
  };
  email?: {
    detected: boolean;
    provider?: string;
    mxRecords?: string[];
  };
  nameservers?: {
    detected: boolean;
    servers: string[];
  };
}

export interface DNSRecord {
  id: string;
  name: string;
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS' | 'SOA' | 'SRV';
  value: string;
  ttl: number;
  priority?: number; // For MX records
  createdAt: string;
  updatedAt: string;
}

export interface DomainCheckResponse {
  domain: string;
  isAvailable: boolean;
  registrar?: string;
  expirationDate?: string;
  nameservers?: string[];
  status: 'Online' | 'Offline' | 'Unknown';
  lastChecked: string;
  whoisData?: {
    registrar: string;
    registrationDate: string;
    expirationDate: string;
    nameservers: string[];
    status: string[];
  };
  sslInfo?: {
    isValid: boolean;
    issuer: string;
    expiresAt: string;
    certificateChain: SSLCertificate[];
  };
  dnsInfo?: {
    aRecords: string[];
    mxRecords: string[];
    nsRecords: string[];
    txtRecords: string[];
  };
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
  expiryStatus?: 'expired' | 'expiring' | 'valid' | 'all';
  sslStatus?: 'valid' | 'expired' | 'unknown' | 'all';
  limit?: number;
  offset?: number;
}

export interface CreateDNSRecordRequest {
  domainId: string;
  name: string;
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS' | 'SOA' | 'SRV';
  value: string;
  ttl?: number;
  priority?: number;
}

export interface UpdateDomainRequest {
  registrar?: string;
  expiry_date?: string;
  autoRenew?: boolean;
  isActive?: boolean;
}

export interface DomainDetailResponse {
  domain: Domain;
  sslCertificates: SSLCertificate[];
  dnsRecords: DNSRecord[];
  services: DomainServices;
  monitoringLogs: MonitoringLog[];
}

export interface MonitoringLog {
  id: string;
  domainId: string;
  type: 'whois' | 'ssl' | 'dns' | 'status';
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: any;
  timestamp: string;
}

export interface DomainMonitoringResponse {
  success: boolean;
  message: string;
  updates?: Partial<Domain>;
  errors?: string[];
}
