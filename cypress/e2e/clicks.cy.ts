describe('Click Synchronization', () => {
  beforeEach(() => {
    cy.visit('/1');
  });

  it('reveals content on click', () => {
    // Check initial state
    cy.get('.slidastro-click').first().should('be.hidden');
    
    // Click right side to go next
    cy.get('body').click('right');
    
    // Should be visible
    cy.get('.slidastro-click').first().should('be.visible');
  });

  it('synchronizes click state via URL', () => {
    cy.visit('/1?clicks=1');
    cy.get('.slidastro-click').first().should('be.visible');
  });

  it('handles s-clicks sequential reveal', () => {
    // Assuming slide 2 has s-clicks
    cy.visit('/2');
    
    // Initial state: both hidden
    cy.get('.slidastro-click').should('be.hidden');
    
    // First click
    cy.get('body').click('right');
    cy.get('.slidastro-click').eq(0).should('be.visible');
    cy.get('.slidastro-click').eq(1).should('be.hidden');
    
    // Second click
    cy.get('body').click('right');
    cy.get('.slidastro-click').eq(0).should('be.visible');
    cy.get('.slidastro-click').eq(1).should('be.visible');
  });
});
