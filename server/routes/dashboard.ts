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
export const getDashboardData: RequestHandler = (req, res) => {
  const stats: DashboardStats = {
    totalDomains: 177,
    domainsRenewalPrice: 0.00,
    expiringDomains: 111,
    expiringCertificates: 5,
    onlineDomains: 170,
    offlineDomains: 7
  };

  const expiringDomains: ExpiringDomain[] = [
    {
      id: "1",
      name: "umokalacrooding.online",
      registrar: "NameCheap, Inc.",
      expirationDate: "Expired",
      price: "",
      lastCheck: "1 day check 1 hours ago",
      status: "Online"
    },
    {
      id: "2", 
      name: "hubhungereat.club",
      registrar: "NameCheap, Inc.",
      expirationDate: "Expired",
      price: "",
      lastCheck: "1 day check 1 hours ago", 
      status: "Online"
    },
    {
      id: "3",
      name: "appmoneyservice.club",
      registrar: "NameCheap, Inc.",
      expirationDate: "Expired",
      price: "",
      lastCheck: "1 day check 1 hours ago",
      status: "Online"
    }
  ];

  const expiringCertificates: ExpiringCertificate[] = [
    {
      id: "1",
      domain: "example1.com",
      expirationDate: "2024-02-15",
      issuer: "Let's Encrypt",
      lastCheck: "2 hours ago",
      status: "Valid"
    },
    {
      id: "2", 
      domain: "example2.com",
      expirationDate: "2024-02-20",
      issuer: "DigiCert",
      lastCheck: "1 hour ago",
      status: "Valid"
    }
  ];

  const response: GetDashboardResponse = {
    stats,
    expiringDomains,
    expiringCertificates
  };

  res.json(response);
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
  // Mock watchlist data
  const watchlist = [
    {
      id: "1",
      domain: "example-domain.com",
      addedAt: new Date(Date.now() - 86400000).toISOString(),
      status: "Available",
      lastChecked: new Date().toISOString(),
      priceAlert: true,
      targetPrice: 15.00
    },
    {
      id: "2",
      domain: "my-startup.io",
      addedAt: new Date(Date.now() - 172800000).toISOString(),
      status: "Taken",
      lastChecked: new Date().toISOString(),
      priceAlert: false,
      targetPrice: null
    }
  ];

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
