import { RequestHandler } from "express";
import { 
  RegistrarImportRequest, 
  RegistrarImportResponse, 
  RegistrarDomainData
} from "@shared/internal-api";
import { db } from "../db/connection";
import { parseStringPromise } from "xml2js";

// ---------------- GoDaddy ----------------
const callGoDaddyAPI = async (apiKey: string, apiSecret: string): Promise<RegistrarDomainData[]> => {
  const response = await fetch("https://api.godaddy.com/v1/domains", {
    headers: {
      Authorization: `sso-key ${apiKey}:${apiSecret}`,
      Accept: "application/json"
    }
  });
  if (!response.ok) throw new Error(`GoDaddy API error: ${response.status}`);
  const domains = await response.json();

  return domains.map((d: any) => ({
    domain: d.domain,
    registrar: "GoDaddy",
    expiryDate: d.expires ? new Date(d.expires).toISOString().split("T")[0] : undefined,
    autoRenew: d.renewAuto || false,
    nameservers: d.nameServers || [],
    status: d.status || "Active"
  }));
};

// ---------------- Namecheap ----------------
const callNamecheapAPI = async (
  apiUser: string, apiKey: string, username: string, clientIp: string
): Promise<RegistrarDomainData[]> => {
  const response = await fetch(
    `https://api.namecheap.com/xml.response?ApiUser=${apiUser}&ApiKey=${apiKey}&UserName=${username}&Command=namecheap.domains.getList&ClientIp=${clientIp}`
  );
  if (!response.ok) throw new Error(`Namecheap API error: ${response.status}`);

  const xmlText = await response.text();
  const parsed = await parseStringPromise(xmlText, { explicitArray: false });

  const domains = parsed.ApiResponse?.CommandResponse?.DomainGetListResult?.Domain;
  if (!domains) return [];

  return (Array.isArray(domains) ? domains : [domains]).map((d: any) => ({
    domain: d.$.Name,
    registrar: "Namecheap",
    expiryDate: d.$.Expires,
    autoRenew: d.$.AutoRenew === "true",
    nameservers: [],
    status: d.$.IsExpired === "true" ? "Expired" : "Active"
  }));
};

// ---------------- Porkbun ----------------
const callPorkbunAPI = async (apiKey: string, secretKey: string): Promise<RegistrarDomainData[]> => {
  const response = await fetch("https://porkbun.com/api/json/v3/domain/listAll", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apikey: apiKey, secretapikey: secretKey })
  });
  if (!response.ok) throw new Error(`Porkbun API error: ${response.status}`);
  const data = await response.json();

  if (data.status !== "SUCCESS" || !data.domains) return [];

  return data.domains.map((d: any) => ({
    domain: d.domain,
    registrar: "Porkbun",
    expiryDate: d.expirationDate,
    autoRenew: d.autorenew === "1",
    nameservers: d.nameservers || [],
    status: "Active"
  }));
};

// ---------------- Import Handler ----------------
export const importDomainsFromRegistrar: RequestHandler<
  {}, RegistrarImportResponse, RegistrarImportRequest
> = async (req, res) => {
  try {
    const { registrar, credentials } = req.body;
    let domains: RegistrarDomainData[] = [];

    if (registrar.includes("GoDaddy")) {
      domains = await callGoDaddyAPI(credentials.apiKey, credentials.apiSecret);
    } else if (registrar.includes("Namecheap")) {
      domains = await callNamecheapAPI(
        credentials.apiUser, credentials.apiKey, credentials.username, credentials.clientIp
      );
    } else if (registrar.includes("Porkbun")) {
      domains = await callPorkbunAPI(credentials.apiKey, credentials.secretKey);
    }

    // Save to DB if needed
    for (const d of domains) {
      await db.domain.upsert({
        where: { domain: d.domain },
        update: d,
        create: d
      });
    }

    res.json({ success: true, domains });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : "Unknown error" });
  }
};

// ---------------- Error Logs Handler ----------------
export const getErrorLogs: RequestHandler = async (req, res) => {
  try {
    // This is a placeholder implementation for error logs
    // You can implement actual error logging/retrieval here
    const logs = {
      errors: [],
      warnings: [],
      info: "Error logging not fully implemented yet"
    };

    res.json(logs);
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : "Failed to retrieve error logs"
    });
  }
};
