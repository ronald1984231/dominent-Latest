import { http, HttpResponse } from "msw";

// Example fake domain data
const fakeDomains = [
  {
    domain: "example.com",
    registrar: "Namecheap",
    expiryDate: "2026-01-15",
    status: "Active"
  },
  {
    domain: "demo.net",
    registrar: "GoDaddy", 
    expiryDate: "2025-09-20",
    status: "Active"
  },
  {
    domain: "test.org",
    registrar: "Porkbun",
    expiryDate: "2025-12-31",
    status: "Active"
  }
];

export const handlers = [
  // Mock registrar import
  http.post("/api/registrar/import", () => {
    return HttpResponse.json({ 
      success: true, 
      domains: fakeDomains,
      message: "Successfully imported domains from registrar"
    });
  }),

  // Mock get domains
  http.get("/api/domains", () => {
    return HttpResponse.json({ 
      success: true, 
      domains: fakeDomains,
      total: fakeDomains.length
    });
  }),

  // Mock registrar configs
  http.get("/api/registrar-configs", () => {
    return HttpResponse.json({
      success: true,
      configs: [
        { name: "Namecheap", enabled: true },
        { name: "GoDaddy", enabled: true },
        { name: "Porkbun", enabled: true }
      ]
    });
  }),

  // Mock add domain
  http.post("/api/domains", async ({ request }) => {
    const body = await request.json() as { domain: string };
    return HttpResponse.json({
      success: true,
      message: `Domain ${body.domain} added successfully`,
      domain: {
        domain: body.domain,
        registrar: "Mock Registrar",
        expiryDate: "2026-01-01",
        status: "Active"
      }
    });
  }),

  // Mock get single domain details
  http.get("/api/domains/:id", ({ params }) => {
    const domainId = params.id as string;

    // Find domain by ID or use first domain as fallback
    const domain = fakeDomains.find(d => d.domain === domainId) || fakeDomains[0];

    return HttpResponse.json({
      domain: {
        id: domainId,
        domain: domain.domain,
        registrar: domain.registrar,
        expiry_date: domain.expiryDate,
        ssl_expiry: "2025-06-15",
        ssl_status: "valid",
        status: domain.status,
        autoRenew: true,
        lastCheck: "Just now",
        lastWhoisCheck: new Date().toISOString(),
        lastSslCheck: new Date().toISOString()
      },
      sslCertificates: [
        {
          id: "ssl-1",
          serialNumber: "12:34:56:78:90:AB:CD:EF",
          issuer: "Let's Encrypt Authority X3",
          validFrom: "2024-01-01T00:00:00Z",
          expiresAt: "2025-06-15T23:59:59Z",
          commonName: domain.domain,
          alternativeNames: [`www.${domain.domain}`],
          isValid: true
        }
      ],
      dnsRecords: [
        {
          id: "dns-1",
          name: "@",
          type: "A",
          value: "192.168.1.100",
          ttl: 3600,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "dns-2",
          name: "www",
          type: "CNAME",
          value: domain.domain,
          ttl: 3600,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      services: {
        hosting: {
          detected: true,
          provider: "Mock Hosting Provider",
          ipAddress: "192.168.1.100"
        },
        email: {
          detected: true,
          provider: "Gmail",
          mxRecords: ["mail.example.com"]
        },
        nameservers: {
          detected: true,
          servers: ["ns1.example.com", "ns2.example.com"]
        }
      },
      monitoringLogs: [
        {
          id: "log-1",
          domainId: domainId,
          type: "whois",
          status: "success",
          message: "WHOIS data updated successfully",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        }
      ]
    });
  }),

  // Mock domain monitoring
  http.post("/api/domains/:id/monitor", ({ params }) => {
    return HttpResponse.json({
      success: true,
      message: "Domain monitoring completed successfully"
    });
  }),

  // Mock DNS record creation
  http.post("/api/domains/:id/dns", async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      success: true,
      record: {
        id: Date.now().toString(),
        name: body.name,
        type: body.type,
        value: body.value,
        ttl: body.ttl,
        priority: body.priority,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });
  }),

  // Mock dashboard data
  http.get("/api/dashboard", () => {
    return HttpResponse.json({
      success: true,
      data: {
        totalDomains: fakeDomains.length,
        activeDomains: fakeDomains.length,
        expiringSoon: 0,
        recentActivity: []
      }
    });
  }),

  // Mock domain search
  http.get("/api/domains/search", ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');

    if (!query) {
      return HttpResponse.json({ error: "Query parameter required" }, { status: 400 });
    }

    // Mock domain availability check
    const isAvailable = Math.random() > 0.3; // 70% chance of being available

    // More comprehensive TLD alternatives with realistic availability
    const tldAlternatives = [
      { extension: ".com", available: Math.random() > 0.4, price: "$12.99" },
      { extension: ".net", available: Math.random() > 0.3, price: "$14.99" },
      { extension: ".org", available: Math.random() > 0.2, price: "$13.99" },
      { extension: ".io", available: Math.random() > 0.6, price: "$39.99" },
      { extension: ".co", available: Math.random() > 0.3, price: "$24.99" },
      { extension: ".ai", available: Math.random() > 0.7, price: "$89.99" },
      { extension: ".app", available: Math.random() > 0.4, price: "$19.99" },
      { extension: ".dev", available: Math.random() > 0.5, price: "$15.99" },
      { extension: ".me", available: Math.random() > 0.3, price: "$19.99" },
      { extension: ".info", available: Math.random() > 0.2, price: "$11.99" },
      { extension: ".biz", available: Math.random() > 0.3, price: "$15.99" },
      { extension: ".tech", available: Math.random() > 0.4, price: "$29.99" },
      { extension: ".xyz", available: Math.random() > 0.2, price: "$9.99" },
      { extension: ".online", available: Math.random() > 0.3, price: "$19.99" },
      { extension: ".store", available: Math.random() > 0.4, price: "$34.99" }
    ].map(tld => ({
      ...tld,
      price: tld.available ? tld.price : null
    }));

    return HttpResponse.json({
      success: true,
      domain: query.toLowerCase(),
      available: isAvailable,
      price: "$12.99",
      alternatives: tldAlternatives
    });
  }),

  // Mock domain availability check for specific TLD
  http.get("/api/domains/check/:domain", ({ params }) => {
    const domain = params.domain as string;
    const isAvailable = Math.random() > 0.4; // 60% chance of being available

    return HttpResponse.json({
      success: true,
      domain: domain,
      available: isAvailable,
      price: isAvailable ? "$12.99" : null,
      registrar: isAvailable ? null : "GoDaddy"
    });
  })
];
