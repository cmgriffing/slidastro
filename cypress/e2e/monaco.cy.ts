describe('Monaco Editor', () => {
  it('loads monaco container', () => {
    cy.visit('/2') // Slide 2 has a monaco editor
    
    // Check if monaco container exists
    cy.get('.monaco-container').should('exist')
  })
})
