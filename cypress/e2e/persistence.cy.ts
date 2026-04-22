describe('Drag Persistence', () => {
  const fixturePath = 'tests/fixtures/drag-test.md';

  it('persists position changes back to Markdown', () => {
    cy.visit('/1', {
      onBeforeLoad(win) {
        cy.spy(win.console, 'log').as('consoleLog');
      },
    });

    // Verify initialization
    cy.get('@consoleLog', { timeout: 10000 }).should('be.calledWithMatch', /Found 1 draggable elements/);

    // Check initial position
    cy.get('.slidastro-drag').should('have.attr', 'data-x', '100');
    
    // Manually trigger persistence via custom event relay
    cy.window().then((win) => {
      const el = win.document.querySelector('.slidastro-drag') as HTMLElement;
      const slideWrapper = el.closest('.content-wrapper') as HTMLElement;
      
      win.dispatchEvent(new CustomEvent('slidastro:manual-pos', {
        detail: {
          filepath: slideWrapper.dataset.filepath,
          slideIndex: 0,
          dragId: 0,
          x: 250,
          y: 350
        }
      }));
    });
    
    // Wait for file system sync and Vite HMR
    cy.wait(5000);
    
    // Reload and verify element is at new position
    cy.reload();
    cy.get('.slidastro-drag', { timeout: 10000 }).should('have.attr', 'data-x', '250');
    cy.get('.slidastro-drag').should('have.attr', 'data-y', '350');
  });
});
