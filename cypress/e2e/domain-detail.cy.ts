describe("Domain Detail Page", () => {
  beforeEach(() => {
    // Enable MSW for testing
    cy.window().then((win) => {
      (win as any).CYPRESS = true;
    });
  });

  it("should load domain details successfully", () => {
    // Visit a domain detail page using example.com from our mock data
    cy.visit("/internal/domains/example.com");

    // Wait for page to load
    cy.contains("example.com").should("be.visible");
    
    // Check domain header information
    cy.contains("Namecheap").should("be.visible"); // Registrar
    cy.contains("Connected").should("be.visible"); // Connection status
    cy.contains("2026").should("be.visible"); // Expiry year
    
    // Check services section
    cy.contains("Services").should("be.visible");
    cy.contains("Nameservers").should("be.visible");
    cy.contains("Email handled by").should("be.visible");
    cy.contains("Hosting").should("be.visible");
    
    // Check SSL certificates section
    cy.contains("SSL Certificates").should("be.visible");
    
    // Check DNS records section (should show loading first, then records)
    cy.contains("DNS Records").should("be.visible");
    cy.contains("Getting DNS records...").should("be.visible");
    
    // Wait for DNS records to load
    cy.wait(3000);
    cy.contains("Getting DNS records...").should("not.exist");
    cy.contains("192.168.1.100").should("be.visible"); // A record
  });

  it("should handle domain not found", () => {
    // Switch to error scenario first
    cy.visit("/internal/domains");
    cy.window().then((win) => {
      (win as any).switchToErrorScenario?.('domainDetailNotFound');
    });

    // Try to visit a non-existent domain
    cy.visit("/internal/domains/nonexistent.com");
    
    // Should show error and redirect back to domains list
    cy.contains("Domain not found").should("be.visible");
    cy.url().should("include", "/internal/domains");
  });

  it("should create DNS records", () => {
    cy.visit("/internal/domains/example.com");
    
    // Wait for page to load
    cy.contains("example.com").should("be.visible");
    
    // Fill in DNS record form
    cy.get('input[placeholder="Enter @ or hostname"]').type("test");
    cy.get('input[placeholder="Enter value or content IP"]').type("192.168.1.200");
    
    // Submit form
    cy.contains("CREATE RECORD").click();
    
    // Should show success message
    cy.contains("DNS record created successfully").should("be.visible");
  });

  it("should handle DNS record creation errors", () => {
    // Switch to DNS error scenario
    cy.window().then((win) => {
      (win as any).switchToErrorScenario?.('dnsRecordError');
    });

    cy.visit("/internal/domains/example.com");
    
    // Fill in DNS record form
    cy.get('input[placeholder="Enter @ or hostname"]').type("invalid");
    cy.get('input[placeholder="Enter value or content IP"]').type("invalid-ip");
    
    // Submit form
    cy.contains("CREATE RECORD").click();
    
    // Should show error message
    cy.contains("Failed to create DNS record").should("be.visible");
  });

  it("should trigger domain monitoring", () => {
    cy.visit("/internal/domains/example.com");
    
    // Wait for page to load
    cy.contains("example.com").should("be.visible");
    
    // Click on a service check button
    cy.get('button').contains('Check').first().click();
    
    // Should show success message
    cy.contains("check completed").should("be.visible");
  });

  it("should handle monitoring errors", () => {
    // Switch to monitoring error scenario
    cy.window().then((win) => {
      (win as any).switchToErrorScenario?.('domainMonitoringError');
    });

    cy.visit("/internal/domains/example.com");
    
    // Click on a service check button
    cy.get('button').contains('Check').first().click();
    
    // Should show error message
    cy.contains("Monitoring service temporarily unavailable").should("be.visible");
  });

  it("should navigate back to domains list", () => {
    cy.visit("/internal/domains/example.com");
    
    // Click back button
    cy.contains("Back").click();
    
    // Should be back at domains list
    cy.url().should("include", "/internal/domains");
    cy.url().should("not.include", "/example.com");
  });
});
