import { Request, Response } from "express";
import { monitoringService } from "../services/monitoring-service";
import { 
  RegistrarConfig, 
  validateRegistrarConfig 
} from "../utils/enhanced-domain-monitor";

export interface RegistrarConfigRequest {
  registrarName: string;
  config: RegistrarConfig;
}

export interface RegistrarConfigResponse {
  success: boolean;
  message: string;
  registrarName?: string;
  configType?: string;
}

export interface GetRegistrarConfigsResponse {
  configs: Array<{
    registrarName: string;
    type: string;
    configured: boolean;
    valid: boolean;
  }>;
}

/**
 * Set or update registrar configuration for enhanced monitoring
 */
export async function setRegistrarConfig(
  req: Request<{}, RegistrarConfigResponse, RegistrarConfigRequest>,
  res: Response<RegistrarConfigResponse>
) {
  try {
    const { registrarName, config } = req.body;

    if (!registrarName || !config) {
      return res.status(400).json({
        success: false,
        message: "Registrar name and configuration are required"
      });
    }

    // Validate the configuration
    if (!validateRegistrarConfig(config)) {
      return res.status(400).json({
        success: false,
        message: `Invalid configuration for registrar type: ${config.type}`
      });
    }

    // Set the configuration in the monitoring service
    const success = monitoringService.setRegistrarConfig(registrarName, config);

    if (success) {
      res.json({
        success: true,
        message: `Registrar configuration set successfully for ${registrarName}`,
        registrarName,
        configType: config.type
      });
    } else {
      res.status(400).json({
        success: false,
        message: `Failed to set registrar configuration for ${registrarName}`
      });
    }
  } catch (error) {
    console.error("Set registrar config error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}

/**
 * Get registrar configuration by name
 */
export async function getRegistrarConfig(
  req: Request<{ registrarName: string }>,
  res: Response
) {
  try {
    const { registrarName } = req.params;

    if (!registrarName) {
      return res.status(400).json({
        success: false,
        message: "Registrar name is required"
      });
    }

    const config = monitoringService.getRegistrarConfig(registrarName);

    if (config) {
      // Return config without sensitive data
      const sanitizedConfig = {
        type: config.type,
        configured: true,
        // Don't return API keys/secrets for security
        hasApiUser: !!config.apiUser,
        hasApiKey: !!config.apiKey,
        hasUsername: !!config.username,
        hasClientIp: !!config.clientIp,
        hasApiToken: !!config.apiToken,
        hasApiSecret: !!config.apiSecret
      };

      res.json({
        success: true,
        registrarName,
        config: sanitizedConfig
      });
    } else {
      res.status(404).json({
        success: false,
        message: `No configuration found for registrar: ${registrarName}`
      });
    }
  } catch (error) {
    console.error("Get registrar config error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}

/**
 * Get all configured registrars
 */
export async function getRegistrarConfigs(
  req: Request,
  res: Response<GetRegistrarConfigsResponse>
) {
  try {
    // This would ideally come from a database or persistent storage
    // For now, we'll return a list of commonly supported registrars
    const supportedRegistrars = [
      { name: "Namecheap", type: "namecheap" },
      { name: "GoDaddy", type: "godaddy" },
      { name: "Cloudflare", type: "cloudflare" },
      { name: "Network Solutions", type: "networksolutions" },
      { name: "Enom", type: "enom" }
    ];

    const configs = supportedRegistrars.map(registrar => {
      const config = monitoringService.getRegistrarConfig(registrar.name);
      return {
        registrarName: registrar.name,
        type: registrar.type,
        configured: !!config,
        valid: config ? validateRegistrarConfig(config) : false
      };
    });

    res.json({ configs });
  } catch (error) {
    console.error("Get registrar configs error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    } as any);
  }
}

/**
 * Remove registrar configuration
 */
export async function removeRegistrarConfig(
  req: Request<{ registrarName: string }>,
  res: Response<RegistrarConfigResponse>
) {
  try {
    const { registrarName } = req.params;

    if (!registrarName) {
      return res.status(400).json({
        success: false,
        message: "Registrar name is required"
      });
    }

    // Note: We don't have a remove method in the monitoring service yet
    // This would need to be implemented if we want to support removing configs
    res.json({
      success: true,
      message: `Registrar configuration removal requested for ${registrarName}`,
      registrarName
    });
  } catch (error) {
    console.error("Remove registrar config error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}

/**
 * Test registrar configuration
 */
export async function testRegistrarConfig(
  req: Request<{}, any, RegistrarConfigRequest>,
  res: Response
) {
  try {
    const { registrarName, config } = req.body;

    if (!registrarName || !config) {
      return res.status(400).json({
        success: false,
        message: "Registrar name and configuration are required"
      });
    }

    // Validate the configuration
    const isValid = validateRegistrarConfig(config);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: `Configuration validation failed for ${config.type}`,
        details: "Please check that all required fields are provided"
      });
    }

    // Test the configuration by trying to fetch data for a test domain
    try {
      const { updateDomainInfo } = await import("../utils/enhanced-domain-monitor");
      
      // Use a common test domain that should exist
      const testDomain = "google.com";
      const result = await updateDomainInfo(testDomain, config);

      res.json({
        success: true,
        message: `Registrar configuration test successful for ${registrarName}`,
        registrarName,
        configType: config.type,
        testResult: {
          domain: result.domain,
          source: result.source,
          hasData: !!(result.domain_expiry || result.registrar !== "Unknown"),
          errors: result.errors
        }
      });
    } catch (testError) {
      res.status(400).json({
        success: false,
        message: `Registrar configuration test failed for ${registrarName}`,
        error: testError instanceof Error ? testError.message : "Unknown error"
      });
    }
  } catch (error) {
    console.error("Test registrar config error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}
