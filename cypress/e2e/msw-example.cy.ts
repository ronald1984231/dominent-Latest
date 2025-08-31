describe("MSW Dynamic Handler Example", () => {
  it("should demonstrate dynamic handler switching with MSW v2", () => {
    cy.visit("/internal/domains");

    // Test default success scenario first
    cy.contains("IMPORT FROM REGISTRAR").click();
    cy.contains("Import Domains from Registrar").should("be.visible");
    cy.contains("Cancel").click();

    // Now switch to error scenario using MSW v2 syntax
    cy.window().then((win) => {
      // MSW v2 equivalent of: 
      // server.use(rest.post("/api/registrar/import", (req, res, ctx) => {
      //   return res(ctx.status(500), ctx.json({ success: false, error: "Registrar API down" }));
      // }));
      
      (win as any).switchToErrorScenario?.('registrarImportError');
    });

    // Test that error scenario is now active
    cy.contains("IMPORT FROM REGISTRAR").click();
    cy.get("[data-testid='registrar-select']").click();
    cy.contains("Namecheap").click();
    cy.contains("Import Domains").click();
    
    // Should show the error message from our dynamic handler
    cy.contains("Registrar API down").should("be.visible");
  });

  it("should switch between multiple error scenarios", () => {
    cy.visit("/internal/domains");

    // Test timeout scenario
    cy.window().then((win) => {
      (win as any).switchToErrorScenario?.('networkTimeout');
    });

    cy.contains("IMPORT FROM REGISTRAR").click();
    cy.get("[data-testid='registrar-select']").click();
    cy.contains("GoDaddy").click();
    cy.contains("Import Domains").click();
    
    cy.contains("Request timeout").should("be.visible");
    cy.contains("Cancel").click();

    // Switch to rate limit scenario
    cy.window().then((win) => {
      (win as any).switchToErrorScenario?.('rateLimitError');
    });

    cy.contains("IMPORT FROM REGISTRAR").click();
    cy.get("[data-testid='registrar-select']").click();
    cy.contains("Porkbun").click();
    cy.contains("Import Domains").click();
    
    cy.contains("Rate limit exceeded").should("be.visible");
  });

  it("should reset to default handlers", () => {
    cy.visit("/internal/domains");

    // First set an error scenario
    cy.window().then((win) => {
      (win as any).switchToErrorScenario?.('registrarImportError');
    });

    // Then reset to default
    cy.window().then((win) => {
      (win as any).resetToDefaultHandlers?.();
    });

    // Should work normally again
    cy.contains("IMPORT FROM REGISTRAR").click();
    cy.get("[data-testid='registrar-select']").click();
    cy.contains("Namecheap").click();
    cy.contains("Import Domains").click();
    
    // Should show success message
    cy.contains("Successfully imported domains from registrar").should("be.visible");
  });
});
