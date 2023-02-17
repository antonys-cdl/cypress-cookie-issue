const hosts = require("../../hosts")

describe("Cookie issue", () => {
  it("keeps main site cookie when navigating", () => {
    cy.visit(`http://${hosts.main}:9300/`);
    cy.get("#nocookiesame").click();
    cy.get("#finish").click();
    cy.get("#cookieValue").should("contain", "MAINSITE");
  });

  // Simplest case that fails, just navigating to site and back
  it("keeps main site cookie when navigating", () => {
    cy.visit(`http://${hosts.main}:9300/`)
    cy.get("#nocookie").click();

    cy.origin(`http://${hosts.secondary}:9300`, () => {
      cy.get("#finish").click();
    });

    cy.get("#cookieValue").should("contain", "MAINSITE");
  });

  // This is our actual flow, we set the same session cookie for the 2nd origin
  it("keeps main site cookie when setting another cookie", () => {
    cy.visit(`http://${hosts.main}:9300/`);
    cy.get("#setcookie").click();

    cy.origin(`http://${hosts.secondary}:9300`, () => {
      cy.get("#finish").click();
    });

    cy.get("#cookieValue").should("contain", "MAINSITE");
  });
});
