// Registrars API Types
export interface Registrar {
  id: string;
  name: string;
  label: string;
  email: string;
  apiKey?: string;
  apiSecret?: string;
  apiStatus: 'Connected' | 'Disconnected' | 'Not configured';
  domainCount: number;
  status: 'Connected' | 'Disconnected' | 'Unmanaged';
  createdAt: string;
}

export interface AddRegistrarRequest {
  registrar: string;
  apiKey: string;
  apiSecret?: string;
  label?: string;
}

export interface AddRegistrarResponse {
  success: boolean;
  registrar?: Registrar;
  error?: string;
}

export interface GetRegistrarsResponse {
  registrars: Registrar[];
  total: number;
}

// Projects API Types
export interface Project {
  id: string;
  name: string;
  description?: string;
  teamCount: number;
  domainCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
}

export interface CreateProjectResponse {
  success: boolean;
  project?: Project;
  error?: string;
}

export interface GetProjectsResponse {
  projects: Project[];
  total: number;
}

// Notifications API Types
export interface NotificationSettings {
  id: string;
  userId?: string;
  domainExpiration: {
    thirtyDays: boolean;
    fifteenDays: boolean;
    sevenDays: boolean;
    oneDay: boolean;
  };
  certificateExpiration: {
    thirtyDays: boolean;
    fifteenDays: boolean;
    sevenDays: boolean;
    oneDay: boolean;
  };
  webhookUrl: string;
  slackWebhookUrl: string;
  emailNotifications: boolean;
  updatedAt: string;
}

export interface UpdateNotificationSettingsRequest {
  domainExpiration?: {
    thirtyDays?: boolean;
    fifteenDays?: boolean;
    sevenDays?: boolean;
    oneDay?: boolean;
  };
  certificateExpiration?: {
    thirtyDays?: boolean;
    fifteenDays?: boolean;
    sevenDays?: boolean;
    oneDay?: boolean;
  };
  webhookUrl?: string;
  slackWebhookUrl?: string;
  emailNotifications?: boolean;
}

export interface UpdateNotificationSettingsResponse {
  success: boolean;
  settings?: NotificationSettings;
  error?: string;
}

// Domain Search API Types
export interface DomainSearchRequest {
  domain: string;
  extensions?: string[];
}

export interface DomainSearchResult {
  domain: string;
  available: boolean;
  price?: string;
  registrar?: string;
  currency?: string;
}

export interface DomainSearchResponse {
  success: boolean;
  query: string;
  results: DomainSearchResult[];
  error?: string;
}

// Dashboard Stats API Types
export interface DashboardStats {
  totalDomains: number;
  domainsRenewalPrice: number;
  expiringDomains: number;
  expiringCertificates: number;
  onlineDomains: number;
  offlineDomains: number;
}

export interface ExpiringDomain {
  id: string;
  name: string;
  registrar: string;
  expirationDate: string;
  price?: string;
  lastCheck: string;
  status: string;
}

export interface ExpiringCertificate {
  id: string;
  domain: string;
  expirationDate: string;
  issuer: string;
  lastCheck: string;
  status: string;
}

export interface GetDashboardResponse {
  stats: DashboardStats;
  expiringDomains: ExpiringDomain[];
  expiringCertificates: ExpiringCertificate[];
}
