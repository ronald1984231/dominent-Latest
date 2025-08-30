import * as cron from "node-cron";
import { monitoringService } from "./monitoring-service";
import { Domain } from "@shared/domain-api";

export class CronService {
  private monitoringJob: cron.ScheduledTask | null = null;
  private cleanupJob: cron.ScheduledTask | null = null;
  private isMonitoringRunning = false;

  /**
   * Start all cron jobs
   */
  start() {
    this.startDomainMonitoring();
    this.startLogCleanup();
    console.log('🕒 Cron service started');
  }

  /**
   * Stop all cron jobs
   */
  stop() {
    if (this.monitoringJob) {
      this.monitoringJob.stop();
      this.monitoringJob = null;
    }
    
    if (this.cleanupJob) {
      this.cleanupJob.stop();
      this.cleanupJob = null;
    }
    
    console.log('🕒 Cron service stopped');
  }

  /**
   * Start daily domain monitoring job
   * Runs every day at 2:00 AM
   */
  private startDomainMonitoring() {
    // For development, you can use "*/2 * * * *" to run every 2 minutes
    // For production, use "0 2 * * *" to run at 2 AM daily
    const schedule = process.env.NODE_ENV === 'development' ? '*/10 * * * *' : '0 2 * * *';
    
    this.monitoringJob = cron.schedule(schedule, async () => {
      if (this.isMonitoringRunning) {
        console.log('⏭️ Skipping monitoring run - previous run still in progress');
        return;
      }

      console.log('🔍 Starting daily domain monitoring...');
      this.isMonitoringRunning = true;

      try {
        await this.runDomainMonitoring();
        console.log('✅ Daily domain monitoring completed successfully');
      } catch (error) {
        console.error('❌ Daily domain monitoring failed:', error);
      } finally {
        this.isMonitoringRunning = false;
      }
    }, {
      scheduled: true,
      timezone: "UTC"
    });

    console.log(`📅 Domain monitoring scheduled: ${schedule} (UTC)`);
  }

  /**
   * Start weekly log cleanup job
   * Runs every Sunday at 3:00 AM
   */
  private startLogCleanup() {
    this.cleanupJob = cron.schedule('0 3 * * 0', async () => {
      console.log('🧹 Starting log cleanup...');
      
      try {
        const removed = monitoringService.clearOldLogs(90); // Keep logs for 90 days
        console.log(`🗑️ Cleanup completed: ${removed} old logs removed`);
      } catch (error) {
        console.error('❌ Log cleanup failed:', error);
      }
    }, {
      scheduled: true,
      timezone: "UTC"
    });

    console.log('📅 Log cleanup scheduled: Every Sunday at 3:00 AM (UTC)');
  }

  /**
   * Run domain monitoring for all active domains
   */
  private async runDomainMonitoring() {
    const domains = await this.getActiveDomains();
    console.log(`📊 Monitoring ${domains.length} active domains`);

    if (domains.length === 0) {
      console.log('ℹ️ No active domains to monitor');
      return;
    }

    const results = {
      success: 0,
      failed: 0,
      total: domains.length
    };

    // Process domains in batches to avoid overwhelming external services
    const batchSize = 5;
    for (let i = 0; i < domains.length; i += batchSize) {
      const batch = domains.slice(i, i + batchSize);
      
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(domains.length / batchSize)} (${batch.length} domains)`);
      
      // Process batch in parallel with delay between domains
      const batchPromises = batch.map((domain, index) => 
        this.monitorDomainWithDelay(domain, index * 2000) // 2 second delay between each domain
      );
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      // Count results
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.success++;
          console.log(`✅ ${batch[index].domain} - monitoring completed`);
        } else {
          results.failed++;
          console.error(`❌ ${batch[index].domain} - monitoring failed:`, result.reason);
        }
      });

      // Wait between batches
      if (i + batchSize < domains.length) {
        console.log('⏳ Waiting 10 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }

    console.log(`📈 Monitoring completed: ${results.success} successful, ${results.failed} failed out of ${results.total} domains`);

    // Log monitoring summary
    await monitoringService.createLog({
      domain: 'SYSTEM',
      logType: 'monitoring_error',
      severity: 'info',
      message: `Daily monitoring completed: ${results.success}/${results.total} domains processed successfully`,
      details: {
        totalDomains: results.total,
        successCount: results.success,
        failedCount: results.failed
      }
    });
  }

  /**
   * Monitor a single domain with delay
   */
  private async monitorDomainWithDelay(domain: Domain, delay: number): Promise<void> {
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    try {
      const updateData = await monitoringService.enhancedMonitorDomain(domain);
      
      // In a real implementation, you would update the database here
      // For now, we'll just update the in-memory domains array
      await this.updateDomainData(domain.id, updateData);
      
    } catch (error) {
      console.error(`Failed to monitor domain ${domain.domain}:`, error);
      throw error;
    }
  }

  /**
   * Get all active domains that should be monitored
   */
  private async getActiveDomains(): Promise<Domain[]> {
    try {
      const { getAllDomainsForCron } = await import("../routes/domains-db");
      const domains = await getAllDomainsForCron();

      // Filter for active domains (assuming all are active for now)
      return domains.filter(domain => domain.isActive !== false);
    } catch (error) {
      console.error('Failed to get active domains:', error);
      return [];
    }
  }

  /**
   * Update domain data with monitoring results
   */
  private async updateDomainData(domainId: string, updateData: any): Promise<void> {
    try {
      const { updateDomainFromCron } = await import("../routes/domains-db");

      // Ensure we're passing the complete update data
      const domainUpdates = {
        ...(updateData.expiry_date && { expiry_date: updateData.expiry_date }),
        ...(updateData.ssl_expiry && { ssl_expiry: updateData.ssl_expiry }),
        ...(updateData.ssl_status && { ssl_status: updateData.ssl_status }),
        ...(updateData.registrar && { registrar: updateData.registrar }),
        ...(updateData.lastWhoisCheck && { lastWhoisCheck: updateData.lastWhoisCheck }),
        ...(updateData.lastSslCheck && { lastSslCheck: updateData.lastSslCheck }),
        status: 'Online',
        lastCheck: 'Auto updated'
      };

      const success = await updateDomainFromCron(domainId, domainUpdates);

      if (success) {
        console.log(`📝 Updated domain ${domainId} with:`, {
          expiry_date: updateData.expiry_date,
          ssl_expiry: updateData.ssl_expiry,
          ssl_status: updateData.ssl_status,
          registrar: updateData.registrar,
          lastWhoisCheck: updateData.lastWhoisCheck,
          lastSslCheck: updateData.lastSslCheck
        });
      } else {
        console.warn(`⚠️ Domain with ID ${domainId} not found for update`);
      }
    } catch (error) {
      console.error(`❌ Failed to update domain ${domainId}:`, error);
    }
  }

  /**
   * Manually trigger domain monitoring (for testing)
   */
  async triggerMonitoring(): Promise<void> {
    if (this.isMonitoringRunning) {
      throw new Error('Monitoring is already running');
    }

    console.log('🔍 Manually triggering domain monitoring...');
    await this.runDomainMonitoring();
  }

  /**
   * Check if monitoring is currently running
   */
  isRunning(): boolean {
    return this.isMonitoringRunning;
  }

  /**
   * Get next scheduled run time
   */
  getNextRun(): Date | null {
    if (!this.monitoringJob) return null;
    
    // Calculate next 2 AM UTC
    const now = new Date();
    const nextRun = new Date(now);
    nextRun.setUTCHours(2, 0, 0, 0);
    
    // If it's already past 2 AM today, schedule for tomorrow
    if (nextRun <= now) {
      nextRun.setUTCDate(nextRun.getUTCDate() + 1);
    }
    
    return nextRun;
  }

  /**
   * Get monitoring status
   */
  getStatus() {
    return {
      isRunning: this.isMonitoringRunning,
      nextRun: this.getNextRun(),
      monitoringJobActive: !!this.monitoringJob,
      cleanupJobActive: !!this.cleanupJob
    };
  }
}

// Export singleton instance
export const cronService = new CronService();
