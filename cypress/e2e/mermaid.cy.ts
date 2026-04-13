describe('Mermaid Rendering', () => {
  it('renders mermaid diagrams and responds to theme changes', () => {
    cy.visit('/1') // Slide 1 has a mermaid diagram
    
    // Check if mermaid div exists
    cy.get('.mermaid').should('exist')
    // Wait for mermaid to render SVG
    cy.get('.mermaid svg', { timeout: 10000 }).should('exist')
    
    // Toggle theme and wait for re-render
    cy.get('html').invoke('addClass', 'dark')
    // Check if it still exists (it should have been re-rendered by initMermaid)
    cy.get('.mermaid').should('exist')
    
    cy.get('html').invoke('removeClass', 'dark')
    cy.get('.mermaid').should('exist')
  })
})
