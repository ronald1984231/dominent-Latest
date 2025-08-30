import { RequestHandler } from "express";
import { monitoringService } from "../services/monitoring-service";
import { testDomainMonitoring } from "../utils/enhanced-domain-monitor";
import { cronService } from "../services/cron-service";
import { checkDomain } from "../utils/domain-monitor";
import { 
  GetLogsResponse, 
  GetLogsQuery,
  MonitoringStats,
  CreateLogRequest,
  CreateLogResponse 
} from "@shared/monitoring-api";

// Get monitoring logs with filtering and pagination
export const getMonitoringLogs: RequestHandler = (req, res) => {
  const query = req.query as GetLogsQuery;
  
  const result = monitoringService.getLogs({
    domain: query.domain,
    logType: query.logType,
    severity: query.severity,
    page: query.page ? parseInt(query.page.toString()) : undefined,
    limit: query.limit ? parseInt(query.limit.toString()) : undefined
  });

  const response: GetLogsResponse = {
    logs: result.logs,
    total: result.total,
    page: result.page,
    totalPages: result.totalPages
  };

  res.json(response);
};

// Create a new monitoring log entry
export const createMonitoringLog: RequestHandler = async (req, res) => {
  const logData: CreateLogRequest = req.body;

  if (!logData.domain || !logData.logType || !logData.severity || !logData.message) {
    const response: CreateLogResponse = {
      success: false,
      error: "Missing required fields: domain, logType, severity, message"
    };
    return res.status(400).json(response);
  }

  try {
    const log = await monitoringService.createLog(logData);
    
    const response: CreateLogResponse = {
      success: true,
      log
    };

    res.json(response);
  } catch (error) {
    console.error("Failed to create monitoring log:", error);
    
    const response: CreateLogResponse = {
      success: false,
      error: "Failed to create monitoring log"
    };

    res.status(500).json(response);
  }
};

// Get monitoring statistics
export const getMonitoringStats: RequestHandler = async (req, res) => {
  try {
    // Get domains from the domains module
    const { getDomains } = await import("./domains");
    
    // Mock request/response to get domains
    let domains: any[] = [];
    const mockReq = { query: {} } as any;
    const mockRes = {
      json: (data: any) => {
        domains = data.domains || [];
      }
    } as any;

    getDomains(mockReq, mockRes, () => {});
    
    const stats: MonitoringStats = monitoringService.getStats(domains);
    res.json(stats);
  } catch (error) {
    console.error("Failed to get monitoring stats:", error);
    res.status(500).json({ error: "Failed to get monitoring statistics" });
  }
};

// Manually trigger domain monitoring for a specific domain
export const triggerDomainMonitoringByName: RequestHandler = async (req, res) => {
  const { domain } = req.params;

  if (!domain) {
    return res.status(400).json({ error: "Domain parameter is required" });
  }

  try {
    console.log(`Manually triggering enhanced monitoring for: ${domain}`);

    // Use enhanced monitoring instead of basic checkDomain
    const { updateDomainInfo } = await import("../utils/enhanced-domain-monitor");
    const result = await updateDomainInfo(domain);

    // Log the monitoring result
    await monitoringService.createLog({
      domain: domain,
      logType: 'monitoring_error',
      severity: 'info',
      message: `Manual enhanced monitoring triggered for ${domain}`,
      details: {
        domain_expiry: result.domain_expiry,
        ssl_expiry: result.ssl_expiry,
        ssl_status: result.ssl_status,
        registrar: result.registrar,
        source: result.source,
        errors: result.errors
      }
    });

    res.json({
      success: true,
      result: {
        domain: result.domain,
        expiry_date: result.domain_expiry,
        ssl_expiry: result.ssl_expiry,
        ssl_status: result.ssl_status,
        registrar: result.registrar,
        source: result.source,
        status: result.status,
        errors: result.errors
      },
      message: `Enhanced monitoring completed for ${domain}`
    });
  } catch (error) {
    console.error(`Manual enhanced monitoring failed for ${domain}:`, error);

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Enhanced monitoring failed"
    });
  }
};

// Manually trigger monitoring for all active domains
export const triggerFullMonitoring: RequestHandler = async (req, res) => {
  try {
    if (cronService.isRunning()) {
      return res.status(409).json({
        success: false,
        error: "Monitoring is already running. Please wait for the current run to complete."
      });
    }

    // Trigger monitoring in the background
    cronService.triggerMonitoring().catch(error => {
      console.error("Background monitoring failed:", error);
    });

    res.json({
      success: true,
      message: "Full domain monitoring triggered. Check logs for progress."
    });
  } catch (error) {
    console.error("Failed to trigger full monitoring:", error);
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to trigger monitoring"
    });
  }
};

// Get monitoring service status
export const getMonitoringStatus: RequestHandler = (req, res) => {
  const status = cronService.getStatus();
  
  res.json({
    ...status,
    version: "1.0.0",
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development"
  });
};

// Clear old monitoring logs
export const clearOldLogs: RequestHandler = async (req, res) => {
  const { days } = req.query;
  const daysToKeep = days ? parseInt(days.toString()) : 90;

  if (isNaN(daysToKeep) || daysToKeep < 1) {
    return res.status(400).json({
      error: "Invalid days parameter. Must be a positive number."
    });
  }

  try {
    const removedCount = monitoringService.clearOldLogs(daysToKeep);
    
    res.json({
      success: true,
      message: `Cleared ${removedCount} logs older than ${daysToKeep} days`,
      removedCount,
      daysToKeep
    });
  } catch (error) {
    console.error("Failed to clear old logs:", error);
    
    res.status(500).json({
      success: false,
      error: "Failed to clear old logs"
    });
  }
};

// Test domain connectivity (WHOIS and SSL)
export const testDomainConnectivity: RequestHandler = async (req, res) => {
  const { domain } = req.params;

  if (!domain) {
    return res.status(400).json({ error: "Domain parameter is required" });
  }

  try {
    const result = await checkDomain(domain);
    
    res.json({
      success: true,
      domain: domain,
      whois: {
        available: !!result.expiry_date,
        expiry_date: result.expiry_date,
        registrar: result.registrar,
        error: result.whoisError
      },
      ssl: {
        available: !!result.ssl_expiry,
        ssl_expiry: result.ssl_expiry,
        ssl_status: result.ssl_status,
        error: result.sslError
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Domain connectivity test failed for ${domain}:`, error);
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Connectivity test failed"
    });
  }
};

// Get monitoring configuration
export const getMonitoringConfig: RequestHandler = (req, res) => {
  const config = {
    monitoring: {
      schedule: process.env.NODE_ENV === 'development' ? 'Every 10 minutes' : 'Daily at 2:00 AM UTC',
      batchSize: 5,
      delayBetweenDomains: 2000, // milliseconds
      delayBetweenBatches: 10000, // milliseconds
      alertThresholds: {
        domain_expiry: [30, 15, 7, 1], // days
        ssl_expiry: [30, 15, 7, 1] // days
      },
      enhancedMonitoringEnabled: true,
      registrarAPIEnabled: true
    },
    logging: {
      retentionDays: 90,
      alertSeverities: ['info', 'warning', 'critical', 'error']
    },
    alerts: {
      channels: ['email', 'webhook', 'slack'],
      retryAttempts: 3,
      timeout: 10000 // milliseconds
    }
  };

  res.json(config);
};

// Test enhanced domain monitoring for a specific domain
export const testEnhancedMonitoring: RequestHandler = async (req, res) => {
  try {
    const { domain } = req.params;

    if (!domain) {
      return res.status(400).json({
        error: 'Domain parameter is required'
      });
    }

    console.log(`Testing enhanced monitoring for domain: ${domain}`);

    // Use the test function from enhanced domain monitor
    await testDomainMonitoring();

    res.json({
      success: true,
      domain,
      message: `Enhanced monitoring test completed for ${domain}`,
      timestamp: new Date().toISOString(),
      features: [
        'Registrar API integration',
        'WHOIS fallback',
        'SSL certificate checking',
        'Enhanced error handling'
      ]
    });
  } catch (error) {
    console.error('Enhanced monitoring test error:', error);
    res.status(500).json({
      error: 'Failed to test enhanced monitoring',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
