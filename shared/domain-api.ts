export interface Domain {
  id: string;
  domain: string;
  subdomain: string;
  registrar: string;
  expirationDate: string;
  status: 'Online' | 'Offline' | 'Unknown';
  lastCheck: string;
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
