describe("Dominent SaaS – Registrar & Domain Tests (Mocked)", () => {
  beforeEach(() => {
    // Enable MSW mocking for this test
    cy.window().then((win) => {
      (win as any).VITE_ENABLE_MOCKING = 'true';
    });

    cy.visit("/internal/domains");
  });

  it("should show domains from mock API", () => {
    // Wait for the page to load
    cy.contains("SEARCH").should("be.visible");
    
    // Check that domains are loaded from the mock API
    cy.get("[data-testid='domain-row']").should("have.length.at.least", 1);

    // Verify mock domain data is displayed
    cy.contains("example.com").should("be.visible");
    cy.contains("demo.net").should("be.visible");
    cy.contains("test.org").should("be.visible");
  });

  it("should open import domains dialog when clicking import button", () => {
    // Click the import button (desktop version)
    cy.contains("IMPORT FROM REGISTRAR").click();
    
    // Verify the dialog opens
    cy.contains("Import Domains from Registrar").should("be.visible");
    cy.contains("Select a registrar to import all your domains").should("be.visible");
    
    // Check that the action button is present
    cy.contains("Import Domains").should("be.visible");
  });

  it("should handle registrar import flow", () => {
    // Open import dialog
    cy.contains("IMPORT FROM REGISTRAR").click();

    // Select a registrar (assuming mock registrars are available)
    cy.get("[data-testid='registrar-select']").click();
    cy.contains("Namecheap").click();

    // Click import
    cy.contains("Import Domains").click();

    // Should show success message (mocked)
    cy.contains("Successfully imported domains from registrar").should("be.visible");
  });

  it("should handle registrar import error scenarios", () => {
    // Switch to error scenario
    cy.window().then((win) => {
      (win as any).switchToErrorScenario?.('registrarImportError');
    });

    // Open import dialog
    cy.contains("IMPORT FROM REGISTRAR").click();

    // Select a registrar
    cy.get("[data-testid='registrar-select']").click();
    cy.contains("Namecheap").click();

    // Click import
    cy.contains("Import Domains").click();

    // Should show error message
    cy.contains("Registrar API down").should("be.visible");
    cy.contains("Failed to import domains").should("be.visible");
  });

  it("should handle network timeout during import", () => {
    // Switch to timeout scenario
    cy.window().then((win) => {
      (win as any).switchToErrorScenario?.('networkTimeout');
    });

    // Open import dialog and attempt import
    cy.contains("IMPORT FROM REGISTRAR").click();
    cy.get("[data-testid='registrar-select']").click();
    cy.contains("GoDaddy").click();
    cy.contains("Import Domains").click();

    // Should show timeout error
    cy.contains("Request timeout").should("be.visible");
  });

  it("should filter domains by search term", () => {
    // Wait for domains to load
    cy.get("[data-testid='domain-row']").should("have.length.at.least", 1);
    
    // Search for specific domain
    cy.get("input[placeholder*='Search domains']").type("example.com");
    cy.contains("SEARCH").click();
    
    // Should show filtered results
    cy.contains("example.com").should("be.visible");
    cy.contains("demo.net").should("not.exist");
  });

  it("should display domain details correctly", () => {
    // Check domain row structure
    cy.get("[data-testid='domain-row']").first().within(() => {
      // Should have domain name
      cy.get("[data-testid='domain-name']").should("contain", "example.com");
      
      // Should have registrar info
      cy.get("[data-testid='domain-registrar']").should("contain", "Namecheap");
      
      // Should have expiry date
      cy.get("[data-testid='domain-expiry']").should("contain", "2026");
      
      // Should have status
      cy.get("[data-testid='domain-status']").should("contain", "Active");
    });
  });

  it("should handle domain addition through mock API", () => {
    // Click add domain button or tab
    cy.contains("Add Domain").click();
    
    // Enter domain name
    cy.get("input[placeholder*='domain']").type("newdomain.com");
    
    // Submit
    cy.contains("Add Domain").click();
    
    // Should show success message from mock
    cy.contains("Domain newdomain.com added successfully").should("be.visible");
  });
});
