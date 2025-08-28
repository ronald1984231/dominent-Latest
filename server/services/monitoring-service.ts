import { 
  MonitoringLog, 
  MonitoringAlert, 
  CreateLogRequest,
  DomainMonitoringUpdate,
  MonitoringStats
} from "@shared/monitoring-api";
import { Domain } from "@shared/domain-api";
import { 
  checkDomain, 
  isDomainExpiringSoon, 
  isSSLExpiringSoon,
  formatDaysUntilExpiry 
} from "../utils/domain-monitor";
import { AlertService } from "./alert-service";

// In-memory storage for demonstration (in production, use a real database)
let monitoringLogs: MonitoringLog[] = [];
let monitoringAlerts: MonitoringAlert[] = [];

export class MonitoringService {
  private alertService: AlertService;

  constructor() {
    this.alertService = new AlertService();
  }

  /**
   * Log a monitoring event
   */
  async createLog(logData: CreateLogRequest): Promise<MonitoringLog> {
    const log: MonitoringLog = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      domain: logData.domain,
      logType: logData.logType,
      severity: logData.severity,
      message: logData.message,
      details: logData.details,
      alertSent: false,
      alertChannels: [],
      createdAt: new Date().toISOString(),
      domainId: logData.domainId
    };

    monitoringLogs.push(log);
    console.log(`[MONITORING LOG] ${log.severity.toUpperCase()}: ${log.message}`);

    // Send alerts for critical and warning logs
    if (log.severity === 'critical' || log.severity === 'warning') {
      await this.sendAlerts(log);
    }

    return log;
  }

  /**
   * Send alerts for a monitoring log
   */
  private async sendAlerts(log: MonitoringLog): Promise<void> {
    try {
      const channels = await this.alertService.getEnabledChannels();
      const sentChannels: ('email' | 'webhook' | 'slack')[] = [];

      for (const channel of channels) {
        try {
          const success = await this.alertService.sendAlert(log, channel);
          if (success) {
            sentChannels.push(channel);
            
            // Create alert record
            const alert: MonitoringAlert = {
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              logId: log.id,
              domain: log.domain,
              alertType: log.logType as any,
              channel: channel,
              recipient: await this.alertService.getChannelRecipient(channel),
              status: 'sent',
              sentAt: new Date().toISOString(),
              retryCount: 0,
              createdAt: new Date().toISOString()
            };
            monitoringAlerts.push(alert);
          }
        } catch (error) {
          console.error(`Failed to send alert via ${channel}:`, error);
          
          // Create failed alert record
          const alert: MonitoringAlert = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            logId: log.id,
            domain: log.domain,
            alertType: log.logType as any,
            channel: channel,
            recipient: await this.alertService.getChannelRecipient(channel),
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            retryCount: 0,
            createdAt: new Date().toISOString()
          };
          monitoringAlerts.push(alert);
        }
      }

      // Update log with sent channels
      log.alertSent = sentChannels.length > 0;
      log.alertChannels = sentChannels;
    } catch (error) {
      console.error('Failed to send alerts:', error);
    }
  }

  /**
   * Monitor a single domain and log any issues
   */
  async monitorDomain(domain: Domain): Promise<DomainMonitoringUpdate> {
    console.log(`Monitoring domain: ${domain.domain}`);
    
    try {
      const monitorResult = await checkDomain(domain.domain);
      const now = new Date().toISOString();

      // Prepare update data
      const updateData: DomainMonitoringUpdate = {
        domainId: domain.id,
        domain: domain.domain,
        lastWhoisCheck: now,
        lastSslCheck: now,
        status: 'Online', // Will be updated based on checks
        preserveExpiryDate: true
      };

      // Update WHOIS data (only if we got a valid result)
      if (monitorResult.expiry_date && !monitorResult.whoisError) {
        updateData.expiry_date = monitorResult.expiry_date;
        if (monitorResult.registrar) {
          updateData.registrar = monitorResult.registrar;
        }
      } else if (monitorResult.whoisError) {
        // Log WHOIS error but don't overwrite existing data
        await this.createLog({
          domain: domain.domain,
          logType: 'monitoring_error',
          severity: 'warning',
          message: `WHOIS check failed: ${monitorResult.whoisError}`,
          details: { error: monitorResult.whoisError },
          domainId: domain.id
        });
      }

      // Update SSL data
      if (monitorResult.ssl_expiry && !monitorResult.sslError) {
        updateData.ssl_expiry = monitorResult.ssl_expiry;
        updateData.ssl_status = monitorResult.ssl_status;
      } else if (monitorResult.sslError) {
        updateData.ssl_status = 'unknown';
        
        // Log SSL error
        await this.createLog({
          domain: domain.domain,
          logType: 'monitoring_error',
          severity: 'info',
          message: `SSL check failed: ${monitorResult.sslError}`,
          details: { error: monitorResult.sslError },
          domainId: domain.id
        });
      }

      // Check for domain expiry alerts (use existing or new expiry date)
      const expiryToCheck = updateData.expiry_date || domain.expiry_date;
      if (expiryToCheck) {
        const daysUntilExpiry = Math.ceil((new Date(expiryToCheck).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        
        // Alert at 30, 15, 7, and 1 days
        if ([30, 15, 7, 1].includes(daysUntilExpiry) || daysUntilExpiry <= 0) {
          const severity = daysUntilExpiry <= 0 ? 'critical' : daysUntilExpiry <= 7 ? 'critical' : 'warning';
          const message = daysUntilExpiry <= 0 
            ? `Domain ${domain.domain} has expired!`
            : `Domain ${domain.domain} expires in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'}`;
            
          await this.createLog({
            domain: domain.domain,
            logType: 'domain_expiry',
            severity,
            message,
            details: {
              daysUntilExpiry,
              expiryDate: expiryToCheck
            },
            domainId: domain.id
          });
        }
      }

      // Check for SSL expiry alerts
      if (updateData.ssl_expiry) {
        const daysUntilSSLExpiry = Math.ceil((new Date(updateData.ssl_expiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        
        // Alert at 30, 15, 7, and 1 days for SSL
        if ([30, 15, 7, 1].includes(daysUntilSSLExpiry) || daysUntilSSLExpiry <= 0) {
          const severity = daysUntilSSLExpiry <= 0 ? 'critical' : daysUntilSSLExpiry <= 7 ? 'critical' : 'warning';
          const message = daysUntilSSLExpiry <= 0 
            ? `SSL certificate for ${domain.domain} has expired!`
            : `SSL certificate for ${domain.domain} expires in ${daysUntilSSLExpiry} day${daysUntilSSLExpiry === 1 ? '' : 's'}`;
            
          await this.createLog({
            domain: domain.domain,
            logType: 'ssl_expiry',
            severity,
            message,
            details: {
              daysUntilExpiry: daysUntilSSLExpiry,
              sslExpiryDate: updateData.ssl_expiry,
              sslStatus: updateData.ssl_status
            },
            domainId: domain.id
          });
        }
      }

      // Check if SSL status changed to expired
      if (updateData.ssl_status === 'expired' && domain.ssl_status !== 'expired') {
        await this.createLog({
          domain: domain.domain,
          logType: 'ssl_expiry',
          severity: 'critical',
          message: `SSL certificate for ${domain.domain} is now expired`,
          details: {
            sslExpiryDate: updateData.ssl_expiry,
            sslStatus: updateData.ssl_status,
            previousStatus: domain.ssl_status
          },
          domainId: domain.id
        });
      }

      return updateData;
    } catch (error) {
      console.error(`Failed to monitor domain ${domain.domain}:`, error);
      
      // Log monitoring failure
      await this.createLog({
        domain: domain.domain,
        logType: 'monitoring_error',
        severity: 'error',
        message: `Domain monitoring failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        domainId: domain.id
      });

      return {
        domainId: domain.id,
        domain: domain.domain,
        lastWhoisCheck: new Date().toISOString(),
        lastSslCheck: new Date().toISOString(),
        status: 'Unknown',
        preserveExpiryDate: true
      };
    }
  }

  /**
   * Get monitoring logs with pagination and filtering
   */
  getLogs(query: {
    domain?: string;
    logType?: string;
    severity?: string;
    page?: number;
    limit?: number;
  }) {
    let filteredLogs = [...monitoringLogs];

    // Apply filters
    if (query.domain) {
      filteredLogs = filteredLogs.filter(log => 
        log.domain.toLowerCase().includes(query.domain!.toLowerCase())
      );
    }

    if (query.logType) {
      filteredLogs = filteredLogs.filter(log => log.logType === query.logType);
    }

    if (query.severity) {
      filteredLogs = filteredLogs.filter(log => log.severity === query.severity);
    }

    // Sort by creation date (newest first)
    filteredLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Apply pagination
    const page = query.page || 1;
    const limit = query.limit || 50;
    const offset = (page - 1) * limit;
    const paginatedLogs = filteredLogs.slice(offset, offset + limit);

    return {
      logs: paginatedLogs,
      total: filteredLogs.length,
      page,
      totalPages: Math.ceil(filteredLogs.length / limit)
    };
  }

  /**
   * Get monitoring statistics
   */
  getStats(domains: Domain[]): MonitoringStats {
    const activeDomains = domains.filter(d => d.isActive !== false);
    const domainsExpiringSoon = activeDomains.filter(d => 
      d.expiry_date && isDomainExpiringSoon(d.expiry_date, 30)
    );
    const sslExpiringSoon = activeDomains.filter(d => 
      d.ssl_expiry && isSSLExpiringSoon(d.ssl_expiry, 30)
    );
    
    const criticalAlerts = monitoringLogs.filter(log => 
      log.severity === 'critical' && 
      log.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    ).length;

    return {
      totalDomains: domains.length,
      activeDomains: activeDomains.length,
      domainsExpiringSoon: domainsExpiringSoon.length,
      sslExpiringSoon: sslExpiringSoon.length,
      criticalAlerts,
      lastMonitoringRun: this.getLastMonitoringRun(),
      nextMonitoringRun: this.getNextMonitoringRun()
    };
  }

  private getLastMonitoringRun(): string | undefined {
    // In a real implementation, this would come from a database or config
    return new Date(Date.now() - 60 * 60 * 1000).toISOString(); // 1 hour ago
  }

  private getNextMonitoringRun(): string | undefined {
    // In a real implementation, this would be calculated based on cron schedule
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(2, 0, 0, 0); // 2 AM tomorrow
    return tomorrow.toISOString();
  }

  /**
   * Clear old logs (older than specified days)
   */
  clearOldLogs(days: number = 90): number {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const initialCount = monitoringLogs.length;
    
    monitoringLogs = monitoringLogs.filter(log => 
      new Date(log.createdAt) > cutoffDate
    );
    
    const removed = initialCount - monitoringLogs.length;
    console.log(`Cleared ${removed} old monitoring logs`);
    return removed;
  }
}

// Export singleton instance
export const monitoringService = new MonitoringService();
