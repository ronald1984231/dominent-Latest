// Registrar configuration with required API credentials
export interface RegistrarCredentialField {
  key: string;
  label: string;
  type: 'text' | 'password';
  placeholder?: string;
  required: boolean;
}

export interface RegistrarConfig {
  name: string;
  displayName: string;
  website?: string;
  apiUrl?: string;
  credentials: RegistrarCredentialField[];
  documentation?: string;
}

export const REGISTRAR_CONFIGS: Record<string, RegistrarConfig> = {
  "GoDaddy.com, LLC": {
    name: "GoDaddy.com, LLC",
    displayName: "GoDaddy",
    apiUrl: "https://api.godaddy.com/v1",
    credentials: [
      { key: "api_key", label: "API Key", type: "text", placeholder: "Enter your GoDaddy API key", required: true },
      { key: "api_secret", label: "API Secret", type: "password", placeholder: "Enter your GoDaddy API secret", required: true }
    ],
    documentation: "https://developer.godaddy.com/"
  },
  "Namecheap, Inc.": {
    name: "Namecheap, Inc.",
    displayName: "Namecheap",
    apiUrl: "https://api.namecheap.com/xml.response",
    credentials: [
      { key: "api_user", label: "API User", type: "text", placeholder: "Enter your Namecheap API username", required: true },
      { key: "api_key", label: "API Key", type: "password", placeholder: "Enter your Namecheap API key", required: true },
      { key: "username", label: "Username", type: "text", placeholder: "Enter your Namecheap username", required: true },
      { key: "client_ip", label: "Client IP", type: "text", placeholder: "Your whitelisted IP address", required: true }
    ],
    documentation: "https://www.namecheap.com/support/api/"
  },
  "Cloudflare, Inc.": {
    name: "Cloudflare, Inc.",
    displayName: "Cloudflare",
    apiUrl: "https://api.cloudflare.com/client/v4",
    credentials: [
      { key: "api_token", label: "API Token", type: "password", placeholder: "Enter your Cloudflare API token", required: true }
    ],
    documentation: "https://developers.cloudflare.com/registrar/"
  },
  "Domain.com, LLC": {
    name: "Domain.com, LLC",
    displayName: "Domain.com",
    credentials: [
      { key: "api_key", label: "API Key", type: "text", placeholder: "Enter your Domain.com API key", required: true },
      { key: "api_secret", label: "API Secret", type: "password", placeholder: "Enter your Domain.com API secret", required: true }
    ]
  },
  "Google Domains (Squarespace)": {
    name: "Google Domains (Squarespace)",
    displayName: "Google Domains",
    credentials: [
      { key: "client_id", label: "Client ID", type: "text", placeholder: "Enter your Google API client ID", required: true },
      { key: "client_secret", label: "Client Secret", type: "password", placeholder: "Enter your Google API client secret", required: true },
      { key: "refresh_token", label: "Refresh Token", type: "password", placeholder: "Enter your OAuth refresh token", required: true }
    ]
  },
  "Amazon Route 53": {
    name: "Amazon Route 53",
    displayName: "Route 53",
    credentials: [
      { key: "access_key", label: "Access Key", type: "text", placeholder: "Enter your AWS access key", required: true },
      { key: "secret_key", label: "Secret Key", type: "password", placeholder: "Enter your AWS secret key", required: true },
      { key: "region", label: "Region", type: "text", placeholder: "AWS region (e.g., us-east-1)", required: true }
    ]
  },
  "Porkbun": {
    name: "Porkbun",
    displayName: "Porkbun",
    apiUrl: "https://porkbun.com/api/json/v3",
    credentials: [
      { key: "api_key", label: "API Key", type: "text", placeholder: "Enter your Porkbun API key", required: true },
      { key: "api_secret", label: "Secret API Key", type: "password", placeholder: "Enter your Porkbun secret API key", required: true }
    ],
    documentation: "https://porkbun.com/api/json/v3/documentation"
  },
  "Dynadot": {
    name: "Dynadot",
    displayName: "Dynadot",
    credentials: [
      { key: "api_key", label: "API Key", type: "password", placeholder: "Enter your Dynadot API key", required: true }
    ]
  },
  "Name.com": {
    name: "Name.com",
    displayName: "Name.com",
    credentials: [
      { key: "username", label: "Username", type: "text", placeholder: "Enter your Name.com username", required: true },
      { key: "api_token", label: "API Token", type: "password", placeholder: "Enter your Name.com API token", required: true }
    ]
  },
  "Network Solutions": {
    name: "Network Solutions",
    displayName: "Network Solutions",
    credentials: [
      { key: "account_id", label: "Account ID", type: "text", placeholder: "Enter your Network Solutions account ID", required: true },
      { key: "api_key", label: "API Key", type: "password", placeholder: "Enter your Network Solutions API key", required: true }
    ]
  },
  "Hover": {
    name: "Hover",
    displayName: "Hover",
    credentials: [
      { key: "username", label: "Username", type: "text", placeholder: "Enter your Hover username", required: true },
      { key: "password", label: "Password", type: "password", placeholder: "Enter your Hover password", required: true },
      { key: "api_key", label: "API Key", type: "password", placeholder: "Enter your Hover API key", required: true }
    ]
  },
  "Gandi": {
    name: "Gandi",
    displayName: "Gandi",
    credentials: [
      { key: "api_key", label: "API Key", type: "password", placeholder: "Enter your Gandi API key", required: true }
    ]
  },
  "1&1 IONOS": {
    name: "1&1 IONOS",
    displayName: "IONOS",
    credentials: [
      { key: "username", label: "Username", type: "text", placeholder: "Enter your IONOS username", required: true },
      { key: "password", label: "Password", type: "password", placeholder: "Enter your IONOS password", required: true },
      { key: "api_key", label: "API Key", type: "password", placeholder: "Enter your IONOS API key", required: true }
    ]
  },
  "HostGator Domains": {
    name: "HostGator Domains",
    displayName: "HostGator",
    credentials: [
      { key: "reseller_id", label: "Reseller ID", type: "text", placeholder: "Enter your HostGator reseller ID", required: true },
      { key: "api_key", label: "API Key", type: "password", placeholder: "Enter your HostGator API key", required: true }
    ]
  },
  "Bluehost": {
    name: "Bluehost",
    displayName: "Bluehost",
    credentials: [
      { key: "username", label: "Username", type: "text", placeholder: "Enter your Bluehost username", required: true },
      { key: "api_key", label: "API Key", type: "password", placeholder: "Enter your Bluehost API key", required: true }
    ]
  },
  "Enom": {
    name: "Enom",
    displayName: "Enom",
    credentials: [
      { key: "reseller_id", label: "Reseller ID", type: "text", placeholder: "Enter your Enom reseller ID", required: true },
      { key: "api_key", label: "API Key", type: "password", placeholder: "Enter your Enom API key", required: true }
    ]
  },
  "Register.com": {
    name: "Register.com",
    displayName: "Register.com",
    credentials: [
      { key: "account_id", label: "Account ID", type: "text", placeholder: "Enter your Register.com account ID", required: true },
      { key: "api_key", label: "API Key", type: "password", placeholder: "Enter your Register.com API key", required: true }
    ]
  },
  "Tucows/OpenSRS": {
    name: "Tucows/OpenSRS",
    displayName: "Tucows",
    credentials: [
      { key: "reseller_id", label: "Reseller ID", type: "text", placeholder: "Enter your Tucows reseller ID", required: true },
      { key: "api_key", label: "API Key", type: "password", placeholder: "Enter your Tucows API key", required: true },
      { key: "username", label: "Username", type: "text", placeholder: "Enter your Tucows username", required: true },
      { key: "password", label: "Password", type: "password", placeholder: "Enter your Tucows password", required: true }
    ]
  },
  "OVH": {
    name: "OVH",
    displayName: "OVH",
    credentials: [
      { key: "application_key", label: "Application Key", type: "text", placeholder: "Enter your OVH application key", required: true },
      { key: "application_secret", label: "Application Secret", type: "password", placeholder: "Enter your OVH application secret", required: true },
      { key: "consumer_key", label: "Consumer Key", type: "password", placeholder: "Enter your OVH consumer key", required: true }
    ]
  },
  "DreamHost": {
    name: "DreamHost",
    displayName: "DreamHost",
    credentials: [
      { key: "api_key", label: "API Key", type: "password", placeholder: "Enter your DreamHost API key", required: true }
    ]
  },
  "123-reg": {
    name: "123-reg",
    displayName: "123-reg",
    credentials: [
      { key: "username", label: "Username", type: "text", placeholder: "Enter your 123-reg username", required: true },
      { key: "password", label: "Password", type: "password", placeholder: "Enter your 123-reg password", required: true },
      { key: "api_key", label: "API Key", type: "password", placeholder: "Enter your 123-reg API key", required: true }
    ]
  },
  "Hostinger": {
    name: "Hostinger",
    displayName: "Hostinger",
    credentials: [
      { key: "api_token", label: "API Token", type: "password", placeholder: "Enter your Hostinger API token", required: true }
    ]
  },
  "Epik": {
    name: "Epik",
    displayName: "Epik",
    credentials: [
      { key: "username", label: "Username", type: "text", placeholder: "Enter your Epik username", required: true },
      { key: "api_key", label: "API Key", type: "password", placeholder: "Enter your Epik API key", required: true }
    ]
  },
  "MarkMonitor": {
    name: "MarkMonitor",
    displayName: "MarkMonitor",
    credentials: [
      { key: "reseller_id", label: "Reseller ID", type: "text", placeholder: "Enter your MarkMonitor reseller ID", required: true },
      { key: "api_key", label: "API Key", type: "password", placeholder: "Enter your MarkMonitor API key", required: true }
    ]
  },
  "CSC Corporate Domains": {
    name: "CSC Corporate Domains",
    displayName: "CSC",
    credentials: [
      { key: "username", label: "Username", type: "text", placeholder: "Enter your CSC username", required: true },
      { key: "password", label: "Password", type: "password", placeholder: "Enter your CSC password", required: true },
      { key: "api_key", label: "API Key", type: "password", placeholder: "Enter your CSC API key", required: true }
    ]
  }
};

export const getRegistrarConfig = (registrarName: string): RegistrarConfig | undefined => {
  return REGISTRAR_CONFIGS[registrarName];
};

export const getRegistrarNames = (): string[] => {
  return Object.keys(REGISTRAR_CONFIGS);
};

export const getRegistrarDisplayNames = (): { name: string; displayName: string }[] => {
  return Object.values(REGISTRAR_CONFIGS).map(config => ({
    name: config.name,
    displayName: config.displayName
  }));
};
