import fetch from "node-fetch";
import { MonitoringLog } from "@shared/monitoring-api";
import { NotificationSettings } from "@shared/internal-api";

export class AlertService {
  private notificationSettings: NotificationSettings | null = null;

  constructor() {
    // In a real implementation, this would load from database
    this.loadNotificationSettings();
  }

  private loadNotificationSettings() {
    // Mock settings - in production, load from database
    this.notificationSettings = {
      id: "default",
      userId: "default-user",
      domainExpiration: {
        thirtyDays: true,
        fifteenDays: true,
        sevenDays: true,
        oneDay: true
      },
      certificateExpiration: {
        thirtyDays: true,
        fifteenDays: true,
        sevenDays: true,
        oneDay: true
      },
      webhookUrl: process.env.WEBHOOK_URL || "",
      slackWebhookUrl: process.env.SLACK_WEBHOOK_URL || "",
      emailNotifications: true,
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Get enabled notification channels
   */
  async getEnabledChannels(): Promise<('email' | 'webhook' | 'slack')[]> {
    const channels: ('email' | 'webhook' | 'slack')[] = [];

    if (this.notificationSettings?.emailNotifications) {
      channels.push('email');
    }

    if (this.notificationSettings?.webhookUrl) {
      channels.push('webhook');
    }

    if (this.notificationSettings?.slackWebhookUrl) {
      channels.push('slack');
    }

    return channels;
  }

  /**
   * Get recipient for a channel
   */
  async getChannelRecipient(channel: 'email' | 'webhook' | 'slack'): Promise<string> {
    switch (channel) {
      case 'email':
        return process.env.ALERT_EMAIL || 'admin@example.com';
      case 'webhook':
        return this.notificationSettings?.webhookUrl || '';
      case 'slack':
        return this.notificationSettings?.slackWebhookUrl || '';
      default:
        return '';
    }
  }

  /**
   * Send alert via specified channel
   */
  async sendAlert(log: MonitoringLog, channel: 'email' | 'webhook' | 'slack'): Promise<boolean> {
    try {
      switch (channel) {
        case 'email':
          return await this.sendEmailAlert(log);
        case 'webhook':
          return await this.sendWebhookAlert(log);
        case 'slack':
          return await this.sendSlackAlert(log);
        default:
          console.error(`Unknown alert channel: ${channel}`);
          return false;
      }
    } catch (error) {
      console.error(`Failed to send alert via ${channel}:`, error);
      return false;
    }
  }

  /**
   * Send email alert (mock implementation)
   */
  private async sendEmailAlert(log: MonitoringLog): Promise<boolean> {
    // In a real implementation, you would use a service like SendGrid, AWS SES, etc.
    console.log(`[EMAIL ALERT] ${log.severity.toUpperCase()}: ${log.message}`);
    console.log(`Details:`, log.details);
    
    // Mock successful email sending
    return true;
  }

  /**
   * Send webhook alert
   */
  private async sendWebhookAlert(log: MonitoringLog): Promise<boolean> {
    if (!this.notificationSettings?.webhookUrl) {
      console.error('No webhook URL configured');
      return false;
    }

    const payload = {
      timestamp: log.createdAt,
      domain: log.domain,
      type: log.logType,
      severity: log.severity,
      message: log.message,
      details: log.details,
      source: 'Domexus Domain Monitor'
    };

    try {
      const response = await fetch(this.notificationSettings.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Domexus-Monitor/1.0'
        },
        body: JSON.stringify(payload),
        timeout: 10000
      });

      if (response.ok) {
        console.log(`[WEBHOOK ALERT] Sent to ${this.notificationSettings.webhookUrl}`);
        return true;
      } else {
        console.error(`Webhook failed with status ${response.status}: ${response.statusText}`);
        return false;
      }
    } catch (error) {
      console.error('Webhook request failed:', error);
      return false;
    }
  }

  /**
   * Send Slack alert
   */
  private async sendSlackAlert(log: MonitoringLog): Promise<boolean> {
    if (!this.notificationSettings?.slackWebhookUrl) {
      console.error('No Slack webhook URL configured');
      return false;
    }

    const color = this.getSeverityColor(log.severity);
    const emoji = this.getSeverityEmoji(log.severity);
    
    const payload = {
      text: `${emoji} Domexus Domain Alert`,
      attachments: [
        {
          color: color,
          fields: [
            {
              title: 'Domain',
              value: log.domain,
              short: true
            },
            {
              title: 'Alert Type',
              value: log.logType.replace('_', ' ').toUpperCase(),
              short: true
            },
            {
              title: 'Severity',
              value: log.severity.toUpperCase(),
              short: true
            },
            {
              title: 'Message',
              value: log.message,
              short: false
            }
          ],
          footer: 'Domexus Monitor',
          ts: Math.floor(new Date(log.createdAt).getTime() / 1000)
        }
      ]
    };

    // Add details if available
    if (log.details) {
      if (log.details.daysUntilExpiry !== undefined) {
        payload.attachments[0].fields.push({
          title: 'Days Until Expiry',
          value: log.details.daysUntilExpiry.toString(),
          short: true
        });
      }
      
      if (log.details.expiryDate) {
        payload.attachments[0].fields.push({
          title: 'Expiry Date',
          value: log.details.expiryDate,
          short: true
        });
      }
    }

    try {
      const response = await fetch(this.notificationSettings.slackWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        timeout: 10000
      });

      if (response.ok) {
        console.log(`[SLACK ALERT] Sent to ${this.notificationSettings.slackWebhookUrl}`);
        return true;
      } else {
        console.error(`Slack webhook failed with status ${response.status}: ${response.statusText}`);
        return false;
      }
    } catch (error) {
      console.error('Slack webhook request failed:', error);
      return false;
    }
  }

  /**
   * Get color for severity level
   */
  private getSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical': return '#ff0000';
      case 'warning': return '#ff9900';
      case 'info': return '#0099ff';
      case 'error': return '#cc0000';
      default: return '#999999';
    }
  }

  /**
   * Get emoji for severity level
   */
  private getSeverityEmoji(severity: string): string {
    switch (severity) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      case 'error': return '❌';
      default: return '📋';
    }
  }

  /**
   * Test webhook connectivity
   */
  async testWebhook(url: string): Promise<boolean> {
    const testPayload = {
      test: true,
      message: 'This is a test notification from Domexus',
      timestamp: new Date().toISOString(),
      source: 'Domexus Domain Monitor'
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Domexus-Monitor/1.0'
        },
        body: JSON.stringify(testPayload),
        timeout: 10000
      });

      return response.ok;
    } catch (error) {
      console.error('Webhook test failed:', error);
      return false;
    }
  }

  /**
   * Test Slack webhook
   */
  async testSlackWebhook(url: string): Promise<boolean> {
    const testPayload = {
      text: '✅ Domexus Test Notification',
      attachments: [
        {
          color: '#00ff00',
          fields: [
            {
              title: 'Status',
              value: 'Slack integration is working correctly',
              short: false
            }
          ],
          footer: 'Domexus Monitor',
          ts: Math.floor(Date.now() / 1000)
        }
      ]
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testPayload),
        timeout: 10000
      });

      return response.ok;
    } catch (error) {
      console.error('Slack webhook test failed:', error);
      return false;
    }
  }

  /**
   * Update notification settings
   */
  updateSettings(settings: NotificationSettings) {
    this.notificationSettings = settings;
  }
}
