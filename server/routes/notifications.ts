import { RequestHandler } from "express";
import { 
  NotificationSettings, 
  UpdateNotificationSettingsRequest, 
  UpdateNotificationSettingsResponse 
} from "@shared/internal-api";

// In-memory storage for demonstration (in production, use a real database)
let notificationSettings: NotificationSettings = {
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
  webhookUrl: "",
  slackWebhookUrl: "",
  emailNotifications: true,
  updatedAt: new Date().toISOString()
};

// Get notification settings
export const getNotificationSettings: RequestHandler = (req, res) => {
  res.json(notificationSettings);
};

// Update notification settings
export const updateNotificationSettings: RequestHandler = (req, res) => {
  const updates: UpdateNotificationSettingsRequest = req.body;

  try {
    // Update domain expiration settings
    if (updates.domainExpiration) {
      notificationSettings.domainExpiration = {
        ...notificationSettings.domainExpiration,
        ...updates.domainExpiration
      };
    }

    // Update certificate expiration settings
    if (updates.certificateExpiration) {
      notificationSettings.certificateExpiration = {
        ...notificationSettings.certificateExpiration,
        ...updates.certificateExpiration
      };
    }

    // Update webhook URLs
    if (updates.webhookUrl !== undefined) {
      // Validate webhook URL format if provided
      if (updates.webhookUrl && !isValidUrl(updates.webhookUrl)) {
        const response: UpdateNotificationSettingsResponse = {
          success: false,
          error: "Invalid webhook URL format"
        };
        return res.status(400).json(response);
      }
      notificationSettings.webhookUrl = updates.webhookUrl;
    }

    if (updates.slackWebhookUrl !== undefined) {
      // Validate Slack webhook URL format if provided
      if (updates.slackWebhookUrl && !isValidSlackWebhookUrl(updates.slackWebhookUrl)) {
        const response: UpdateNotificationSettingsResponse = {
          success: false,
          error: "Invalid Slack webhook URL format"
        };
        return res.status(400).json(response);
      }
      notificationSettings.slackWebhookUrl = updates.slackWebhookUrl;
    }

    // Update email notifications
    if (updates.emailNotifications !== undefined) {
      notificationSettings.emailNotifications = updates.emailNotifications;
    }

    // Update timestamp
    notificationSettings.updatedAt = new Date().toISOString();

    const response: UpdateNotificationSettingsResponse = {
      success: true,
      settings: notificationSettings
    };

    res.json(response);
  } catch (error) {
    const response: UpdateNotificationSettingsResponse = {
      success: false,
      error: "Failed to update notification settings"
    };
    res.status(500).json(response);
  }
};

// Reset notification settings to defaults
export const resetNotificationSettings: RequestHandler = (req, res) => {
  notificationSettings = {
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
    webhookUrl: "",
    slackWebhookUrl: "",
    emailNotifications: true,
    updatedAt: new Date().toISOString()
  };

  const response: UpdateNotificationSettingsResponse = {
    success: true,
    settings: notificationSettings
  };

  res.json(response);
};

// Test webhook endpoint
export const testWebhook: RequestHandler = async (req, res) => {
  const { url, type } = req.body;

  if (!url) {
    return res.status(400).json({ error: "Webhook URL is required" });
  }

  try {
    // Simulate webhook test
    const testPayload = {
      test: true,
      message: "This is a test notification from Domexus",
      timestamp: new Date().toISOString(),
      type: type || "test"
    };

    // In a real application, you would make an HTTP request to the webhook URL
    // For now, we'll simulate success/failure
    const success = Math.random() > 0.2; // 80% success rate

    if (success) {
      res.json({ 
        success: true, 
        message: "Webhook test successful",
        response: "200 OK"
      });
    } else {
      res.status(400).json({ 
        success: false, 
        error: "Webhook test failed - URL not reachable or returned error"
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: "Failed to test webhook"
    });
  }
};

// Get notification logs/history
export const getNotificationLogs: RequestHandler = (req, res) => {
  // Starting with empty notification logs - all sample data removed
  const logs: any[] = [];

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const paginatedLogs = logs.slice(offset, offset + limit);

  res.json({
    logs: paginatedLogs,
    total: logs.length,
    page,
    limit,
    totalPages: Math.ceil(logs.length / limit)
  });
};

// Helper functions
function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

function isValidSlackWebhookUrl(string: string): boolean {
  try {
    const url = new URL(string);
    return url.hostname === 'hooks.slack.com' && url.pathname.startsWith('/services/');
  } catch (_) {
    return false;
  }
}
