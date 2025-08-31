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
  })
];
