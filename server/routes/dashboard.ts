import { RequestHandler } from "express";
import { 
  DashboardStats,
  ExpiringDomain,
  ExpiringCertificate,
  GetDashboardResponse,
  DomainSearchRequest,
  DomainSearchResponse,
  DomainSearchResult
} from "@shared/internal-api";

// Get dashboard statistics and data
export const getDashboardData: RequestHandler = async (req, res) => {
  try {
    // Get domains from the database
    const { getAllDomainsForCron } = await import("./domains-db");
    const domains = await getAllDomainsForCron();

    // Calculate stats
    const activeDomains = domains.filter(d => d.isActive !== false);
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Find expiring domains (within 30 days)
    const expiringDomains: ExpiringDomain[] = activeDomains
      .filter(d => {
        if (!d.expiry_date) return false;
        const expiryDate = new Date(d.expiry_date);
        return expiryDate <= thirtyDaysFromNow && expiryDate > now;
      })
      .map(d => ({
        id: d.id,
        name: d.domain,
        registrar: d.registrar || 'Unknown',
        expirationDate: d.expiry_date ? new Date(d.expiry_date).toLocaleDateString() : 'Unknown',
        price: '-', // Price data not available in current schema
        lastCheck: d.lastCheck || 'Never',
        status: d.status || 'Unknown'
      }));

    // Find expiring certificates (within 30 days)
    const expiringCertificates: ExpiringCertificate[] = activeDomains
      .filter(d => {
        if (!d.ssl_expiry) return false;
        const sslExpiryDate = new Date(d.ssl_expiry);
        return sslExpiryDate <= thirtyDaysFromNow && sslExpiryDate > now;
      })
      .map(d => ({
        id: `ssl-${d.id}`,
        domain: d.domain,
        expirationDate: d.ssl_expiry ? new Date(d.ssl_expiry).toLocaleDateString() : 'Unknown',
        issuer: 'Auto-detected', // Issuer data not available in current schema
        lastCheck: d.lastSslCheck ? new Date(d.lastSslCheck).toLocaleDateString() : 'Never',
        status: d.ssl_status === 'valid' ? 'Valid' : d.ssl_status || 'Unknown'
      }));

    const stats: DashboardStats = {
      totalDomains: domains.length,
      domainsRenewalPrice: 0.00, // Renewal price data not available
      expiringDomains: expiringDomains.length,
      expiringCertificates: expiringCertificates.length,
      onlineDomains: activeDomains.filter(d => d.status === 'Online').length,
      offlineDomains: activeDomains.filter(d => d.status === 'Offline').length
    };

    const response: GetDashboardResponse = {
      stats,
      expiringDomains,
      expiringCertificates
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

// Search for available domains
export const searchDomains: RequestHandler = (req, res) => {
  const { domain, extensions }: DomainSearchRequest = req.body;

  if (!domain || !domain.trim()) {
    const response: DomainSearchResponse = {
      success: false,
      query: domain || "",
      results: [],
      error: "Domain name is required"
    };
    return res.status(400).json(response);
  }

  const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '');
  const domainName = cleanDomain.split('.')[0];

  // Default extensions to check
  const defaultExtensions = ['com', 'net', 'org', 'io', 'app', 'dev', 'co', 'me', 'info'];
  const extensionsToCheck = extensions && extensions.length > 0 ? extensions : defaultExtensions;

  const results: DomainSearchResult[] = extensionsToCheck.map(ext => {
    const fullDomain = `${domainName}.${ext}`;
    const available = Math.random() > 0.6; // 40% availability rate
    
    let price = "";
    let registrar = "";
    
    if (available) {
      // Set realistic pricing based on extension
      switch (ext) {
        case 'com':
        case 'net':
        case 'org':
          price = `$${(12 + Math.random() * 5).toFixed(2)}/year`;
          break;
        case 'io':
          price = `$${(59 + Math.random() * 10).toFixed(2)}/year`;
          break;
        case 'app':
        case 'dev':
          price = `$${(19 + Math.random() * 10).toFixed(2)}/year`;
          break;
        default:
          price = `$${(15 + Math.random() * 20).toFixed(2)}/year`;
      }
      
      registrar = Math.random() > 0.5 ? "GoDaddy" : "Namecheap";
    }

    return {
      domain: fullDomain,
      available,
      price: available ? price : undefined,
      registrar: available ? registrar : undefined,
      currency: "USD"
    };
  });

  // Sort results: available domains first, then by price
  results.sort((a, b) => {
    if (a.available && !b.available) return -1;
    if (!a.available && b.available) return 1;
    if (a.available && b.available && a.price && b.price) {
      const priceA = parseFloat(a.price.replace(/[^0-9.]/g, ''));
      const priceB = parseFloat(b.price.replace(/[^0-9.]/g, ''));
      return priceA - priceB;
    }
    return 0;
  });

  const response: DomainSearchResponse = {
    success: true,
    query: cleanDomain,
    results
  };

  res.json(response);
};

// Get domain suggestions based on search term
export const getDomainSuggestions: RequestHandler = (req, res) => {
  const { q } = req.query;
  
  if (!q || typeof q !== 'string') {
    return res.json({ suggestions: [] });
  }

  const searchTerm = q.toLowerCase().trim();
  
  // Generate domain suggestions
  const suggestions = [
    `${searchTerm}.com`,
    `${searchTerm}.net`,
    `${searchTerm}.org`,
    `get${searchTerm}.com`,
    `my${searchTerm}.com`,
    `${searchTerm}app.com`,
    `${searchTerm}pro.com`,
    `${searchTerm}hub.com`,
    `${searchTerm}.io`,
    `${searchTerm}.app`
  ].slice(0, 5); // Limit to 5 suggestions

  res.json({ suggestions });
};

// Add domain to watchlist
export const addToWatchlist: RequestHandler = (req, res) => {
  const { domain } = req.body;

  if (!domain) {
    return res.status(400).json({ error: "Domain is required" });
  }

  // In a real application, you would:
  // 1. Validate the domain format
  // 2. Check if it's already in the watchlist
  // 3. Save to database
  // 4. Set up monitoring

  // Simulate success
  res.json({ 
    success: true, 
    message: `${domain} has been added to your watchlist`,
    domain: domain
  });
};

// Get watchlist domains
export const getWatchlist: RequestHandler = (req, res) => {
  // Starting with empty watchlist - all sample data removed
  const watchlist: any[] = [];

  res.json({ watchlist, total: watchlist.length });
};

// Remove domain from watchlist
export const removeFromWatchlist: RequestHandler = (req, res) => {
  const { id } = req.params;

  // In a real application, you would remove from database
  res.json({ 
    success: true, 
    message: "Domain removed from watchlist"
  });
};
