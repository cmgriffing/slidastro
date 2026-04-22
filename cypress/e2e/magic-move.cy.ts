describe('Shiki Magic Move', () => {
  beforeEach(() => {
    cy.visit('/1', {
      onBeforeLoad(win) {
        cy.spy(win.console, 'log').as('consoleLog');
        cy.spy(win.console, 'error').as('consoleError');
      },
    });
  });

  it('renders the magic move container', () => {
    cy.get('@consoleLog').should('be.calledWith', 'initMagicMove called');
    cy.get('.shiki-magic-move-container').should('exist');
  });

  it('animates transitions on click', () => {
    // Advance to step 1 (where magic move starts)
    cy.get('body').type('{rightarrow}');
    
    // Initial state: const a = 1;
    cy.get('.shiki-magic-move-container', { timeout: 10000 }).should('be.visible');
    
    cy.get('.shiki-magic-move-container').then($el => {
      const text = $el.text();
      if (!text.includes('const a = 1;')) {
        throw new Error(`Text not found. Text: "${text}"`);
      }
    });

    // First click: advance to step 2
    cy.get('body').type('{rightarrow}');
    cy.wait(1000); // Wait for animation
    cy.get('.shiki-magic-move-container').invoke('text').should('contain', 'const b = 2;');
    
    // Second click: advance to step 3
    cy.get('body').type('{rightarrow}');
    cy.wait(1000); // Wait for animation
    cy.get('.shiki-magic-move-container').invoke('text').should('contain', 'function add(a, b)');
  });

  it('handles reverse transitions', () => {
    // Go to last step (3 right arrows: to step 1, to step 2, to step 3)
    cy.get('body').type('{rightarrow}{rightarrow}{rightarrow}');
    cy.wait(1000);
    cy.get('.shiki-magic-move-container').invoke('text').should('contain', 'function add(a, b)');

    // Go back
    cy.get('body').type('{leftarrow}');
    cy.wait(1000);
    cy.get('.shiki-magic-move-container').invoke('text').should('contain', 'const b = 2;');
    cy.get('.shiki-magic-move-container').invoke('text').should('not.contain', 'function add(a, b)');
  });
});
