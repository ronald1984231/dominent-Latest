export interface MonitoringLog {
  id: string;
  domain: string;
  logType: 'domain_expiry' | 'ssl_expiry' | 'domain_status' | 'monitoring_error';
  severity: 'info' | 'warning' | 'critical' | 'error';
  message: string;
  details?: {
    daysUntilExpiry?: number;
    expiryDate?: string;
    sslExpiryDate?: string;
    sslStatus?: string;
    previousStatus?: string;
    currentStatus?: string;
    error?: string;
  };
  alertSent: boolean;
  alertChannels?: ('email' | 'webhook' | 'slack')[];
  createdAt: string;
  domainId?: string;
}

export interface MonitoringAlert {
  id: string;
  logId: string;
  domain: string;
  alertType: 'domain_expiry' | 'ssl_expiry' | 'domain_status';
  channel: 'email' | 'webhook' | 'slack';
  recipient: string; // email address, webhook URL, or slack channel
  status: 'pending' | 'sent' | 'failed' | 'retry';
  sentAt?: string;
  error?: string;
  retryCount: number;
  createdAt: string;
}

export interface CreateLogRequest {
  domain: string;
  logType: MonitoringLog['logType'];
  severity: MonitoringLog['severity'];
  message: string;
  details?: MonitoringLog['details'];
  domainId?: string;
}

export interface CreateLogResponse {
  success: boolean;
  log?: MonitoringLog;
  error?: string;
}

export interface GetLogsResponse {
  logs: MonitoringLog[];
  total: number;
  page: number;
  totalPages: number;
}

export interface GetLogsQuery {
  domain?: string;
  logType?: string;
  severity?: string;
  alertSent?: boolean;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export interface MonitoringStats {
  totalDomains: number;
  activeDomains: number;
  domainsExpiringSoon: number;
  sslExpiringSoon: number;
  criticalAlerts: number;
  lastMonitoringRun?: string;
  nextMonitoringRun?: string;
}

export interface DomainMonitoringUpdate {
  domainId: string;
  domain: string;
  expiry_date?: string | null;
  ssl_expiry?: string | null;
  ssl_status?: 'valid' | 'expired' | 'unknown';
  registrar?: string;
  lastWhoisCheck: string;
  lastSslCheck: string;
  status: 'Online' | 'Offline' | 'Unknown';
  preserveExpiryDate?: boolean; // Don't overwrite with null
}
