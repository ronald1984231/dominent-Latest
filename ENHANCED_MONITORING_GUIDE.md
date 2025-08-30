# Enhanced Domain Monitoring Guide

## Overview

The enhanced domain monitoring system integrates registrar API access with fallback WHOIS and SSL monitoring to provide more accurate and up-to-date domain information.

## Features

- **Registrar API Integration**: Direct API access to registrars like Namecheap, GoDaddy, Cloudflare
- **Intelligent Fallbacks**: API → WHOIS → SSL checking with graceful degradation  
- **Enhanced Error Handling**: Detailed error reporting and retry mechanisms
- **Batch Processing**: Efficient bulk domain monitoring with rate limiting
- **Configuration Management**: Web-based registrar API configuration interface

## Supported Registrars

### Namecheap
Required configuration:
- API User
- API Key  
- Username
- Client IP

### GoDaddy
Required configuration:
- API Key
- API Secret

### Cloudflare
Required configuration:
- API Token

## Usage

### 1. Configure Registrar APIs

Navigate to `/internal/registrar-config` in the web interface to configure your registrar API credentials.

### 2. API Endpoints

#### Set Registrar Configuration
```bash
POST /api/registrar-config
{
  "registrarName": "Namecheap",
  "config": {
    "type": "namecheap",
    "apiUser": "your_username",
    "apiKey": "your_api_key", 
    "username": "your_username",
    "clientIp": "your_server_ip"
  }
}
```

#### Test Configuration
```bash
POST /api/registrar-config/test
{
  "registrarName": "Namecheap",
  "config": { ... }
}
```

#### Test Enhanced Monitoring
```bash
POST /api/monitoring/enhanced-test/example.com
```

### 3. Programmatic Usage

```javascript
import { updateDomainInfo, RegistrarConfig } from "./server/utils/enhanced-domain-monitor";

const config = {
  type: "namecheap",
  apiUser: "your_username",
  apiKey: "your_api_key",
  username: "your_username", 
  clientIp: "your_server_ip"
};

const result = await updateDomainInfo("example.com", config);
console.log(result);
// {
//   domain: "example.com",
//   registrar: "Namecheap, Inc.",
//   domain_expiry: "2024-12-31",
//   ssl_expiry: "2024-11-15", 
//   ssl_status: "valid",
//   status: "Online",
//   source: "api"
// }
```

## Data Prioritization

1. **Registrar API** (highest priority) - Real-time, authoritative data
2. **WHOIS Lookup** (fallback) - Publicly available registry data  
3. **SSL Certificate** (independent) - Certificate expiry information

## Benefits

- **More Accurate Data**: Direct API access provides real-time information
- **Reduced Rate Limiting**: Avoids WHOIS rate limits for configured registrars
- **Better Monitoring**: Enhanced error handling and retry mechanisms
- **Comprehensive Coverage**: Falls back gracefully when APIs are unavailable

## Configuration Security

- API credentials are stored securely and not returned in API responses
- Test endpoints validate configurations without storing credentials
- Configuration validation prevents invalid setups

## Example Registrar Configurations

### Namecheap Example
```javascript
{
  type: "namecheap",
  apiUser: "ronaldstone", 
  apiKey: "abc123def456",
  username: "ronaldstone",
  clientIp: "192.168.1.100"
}
```

### GoDaddy Example  
```javascript
{
  type: "godaddy",
  apiKey: "your_api_key",
  apiSecret: "your_api_secret"
}
```

### Cloudflare Example
```javascript
{
  type: "cloudflare", 
  apiToken: "your_global_api_token"
}
```

## Testing

Test the enhanced monitoring system:

1. Configure a registrar API in the web interface
2. Navigate to `/internal/monitoring` 
3. Use the enhanced monitoring test endpoint
4. Check monitoring logs for results

The system will automatically use enhanced monitoring for domains where registrar configurations are available, falling back to standard WHOIS/SSL monitoring otherwise.
