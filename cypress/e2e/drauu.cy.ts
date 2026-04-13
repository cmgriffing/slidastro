describe('Drauu Drawing', () => {
  it('loads drauu layer and responds to toggle', () => {
    cy.visit('/1')
    
    // Check if drauu layer exists
    cy.get('#drauu-layer').should('exist')
    cy.get('#drauu-layer').should('have.css', 'pointer-events', 'none')
    
    // Toggle drauu with 'd' key
    cy.get('body').type('d')
    cy.get('body').should('have.class', 'drauu-active')
    cy.get('#drauu-layer').should('have.css', 'pointer-events', 'auto')
    
    cy.get('body').type('d')
    cy.get('body').should('not.have.class', 'drauu-active')
    cy.get('#drauu-layer').should('have.css', 'pointer-events', 'none')
  })
})
