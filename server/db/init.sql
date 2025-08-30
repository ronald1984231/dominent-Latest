-- Database schema for DOMINENT domain monitoring app

-- Create domains table
CREATE TABLE IF NOT EXISTS domains (
  id VARCHAR(255) PRIMARY KEY,
  domain VARCHAR(255) NOT NULL UNIQUE,
  subdomain VARCHAR(255),
  registrar VARCHAR(255) DEFAULT 'Unknown',
  expiration_date VARCHAR(255) DEFAULT 'Unknown',
  expiry_date DATE,
  ssl_status VARCHAR(50) DEFAULT 'unknown',
  ssl_expiry TIMESTAMP,
  status VARCHAR(50) DEFAULT 'Unknown',
  last_check VARCHAR(255) DEFAULT 'Never',
  last_whois_check TIMESTAMP,
  last_ssl_check TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_domains_domain ON domains(domain);
CREATE INDEX IF NOT EXISTS idx_domains_registrar ON domains(registrar);
CREATE INDEX IF NOT EXISTS idx_domains_expiry_date ON domains(expiry_date);
CREATE INDEX IF NOT EXISTS idx_domains_ssl_expiry ON domains(ssl_expiry);
CREATE INDEX IF NOT EXISTS idx_domains_is_active ON domains(is_active);

-- Insert sample domains for demonstration
INSERT INTO domains (
  id, domain, subdomain, registrar, expiration_date, expiry_date,
  ssl_status, ssl_expiry, status, last_check, is_active, created_at
) VALUES 
  (
    '1', 'example.com', 'example.com', 'Example Registrar',
    '2024-12-31', '2024-12-31',
    'valid', '2024-11-30 23:59:59', 'Online', 'Just now', true, CURRENT_TIMESTAMP
  ),
  (
    '2', 'test.org', 'test.org', 'Test Registrar',
    '2024-06-15', '2024-06-15',
    'valid', '2024-05-20 23:59:59', 'Online', '2 hours ago', true, CURRENT_TIMESTAMP
  ),
  (
    '3', 'demo.net', 'demo.net', 'Demo Registrar',
    '2024-03-10', '2024-03-10',
    'expiring', '2024-02-28 23:59:59', 'Online', '1 day ago', true, CURRENT_TIMESTAMP
  )
ON CONFLICT (domain) DO NOTHING;

-- Create registrars table (if needed for the future)
CREATE TABLE IF NOT EXISTS registrars (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  label VARCHAR(255),
  email VARCHAR(255),
  api_key TEXT,
  api_secret TEXT,
  api_credentials JSONB,
  api_status VARCHAR(50) DEFAULT 'Not configured',
  domain_count INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'Disconnected',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create monitoring_logs table for enhanced monitoring
CREATE TABLE IF NOT EXISTS monitoring_logs (
  id VARCHAR(255) PRIMARY KEY,
  domain VARCHAR(255) NOT NULL,
  domain_id VARCHAR(255),
  log_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  details JSONB,
  alert_sent BOOLEAN DEFAULT FALSE,
  alert_channels TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for monitoring logs
CREATE INDEX IF NOT EXISTS idx_monitoring_logs_domain ON monitoring_logs(domain);
CREATE INDEX IF NOT EXISTS idx_monitoring_logs_domain_id ON monitoring_logs(domain_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_logs_severity ON monitoring_logs(severity);
CREATE INDEX IF NOT EXISTS idx_monitoring_logs_created_at ON monitoring_logs(created_at);

-- Create notification_settings table
CREATE TABLE IF NOT EXISTS notification_settings (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255),
  domain_expiration JSONB DEFAULT '{"thirtyDays": true, "fifteenDays": true, "sevenDays": true, "oneDay": true}',
  certificate_expiration JSONB DEFAULT '{"thirtyDays": true, "fifteenDays": true, "sevenDays": true, "oneDay": true}',
  webhook_url TEXT,
  slack_webhook_url TEXT,
  email_notifications BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
