import { http, HttpResponse } from "msw";

// Error scenario handlers for testing failure cases
export const errorHandlers = {
  // Registrar import failure
  registrarImportError: http.post("/api/registrar/import", () => {
    return HttpResponse.json(
      { 
        success: false, 
        error: "Registrar API down",
        details: "Unable to connect to registrar API. Please try again later."
      },
      { status: 500 }
    );
  }),

  // Domain fetch failure
  domainsFetchError: http.get("/api/domains", () => {
    return HttpResponse.json(
      { 
        success: false, 
        error: "Database connection failed" 
      },
      { status: 500 }
    );
  }),

  // Domain addition failure
  addDomainError: http.post("/api/domains", () => {
    return HttpResponse.json(
      { 
        success: false, 
        error: "Domain already exists or invalid format" 
      },
      { status: 400 }
    );
  }),

  // Network timeout simulation
  networkTimeout: http.post("/api/registrar/import", () => {
    return HttpResponse.json(
      { 
        success: false, 
        error: "Request timeout" 
      },
      { status: 408 }
    );
  }),

  // Unauthorized access
  unauthorizedError: http.get("/api/domains", () => {
    return HttpResponse.json(
      { 
        success: false, 
        error: "Unauthorized access" 
      },
      { status: 401 }
    );
  }),

  // Rate limit exceeded
  rateLimitError: http.post("/api/registrar/import", () => {
    return HttpResponse.json(
      { 
        success: false, 
        error: "Rate limit exceeded. Please try again later." 
      },
      { status: 429 }
    );
  })
};

// Success scenario handlers (default)
export const successHandlers = {
  registrarImportSuccess: http.post("/api/registrar/import", () => {
    return HttpResponse.json({ 
      success: true, 
      domains: [
        {
          domain: "imported-domain.com",
          registrar: "GoDaddy",
          expiryDate: "2025-12-31",
          status: "Active"
        }
      ],
      message: "Successfully imported 1 domain from registrar"
    });
  })
};
