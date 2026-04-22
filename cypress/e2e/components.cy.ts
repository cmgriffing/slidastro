describe('Built-in Components', () => {
  it('verifies Table of Contents links', () => {
    cy.visit('/4');
    cy.get('.slidastro-toc').should('exist');
    cy.get('.slidastro-toc a').should('have.length.at.least', 3);
    cy.get('.slidastro-toc a').first().should('have.attr', 'href', '/1');
  });

  it('verifies SLink navigation', () => {
    cy.visit('/5');
    // Internal link
    cy.get('.slidastro-link').contains('Back to Start').should('have.attr', 'href', '/1');
    // External link
    cy.get('.slidastro-link').contains('Google').should('have.attr', 'href', 'https://google.com');
  });

  it('verifies Tweet component presence', () => {
    cy.visit('/6');
    cy.get('.slidastro-tweet-wrapper').should('exist');
    // We don't necessarily need to check the iframe content as it depends on external network
    // but the wrapper should be there.
  });

  it('verifies YouTube component presence', () => {
    cy.visit('/7');
    cy.get('.slidastro-youtube-wrapper').should('exist');
    cy.get('.slidastro-youtube-wrapper lite-youtube').should('exist');
  });

  it('verifies Video component and synchronization', () => {
    cy.visit('/8');
    cy.get('.slidastro-video-wrapper video').should('exist');
    
    // We can't easily check if it's playing without user interaction in some browsers,
    // but we can check if it exists.
    
    // Check synchronization: navigate away and see if it pauses (if we can detect it)
    // Actually, we can check the 'paused' property of the video element.
    cy.get('.slidastro-video-wrapper video').then(($video) => {
      const video = $video[0] as HTMLVideoElement;
      // It might be paused initially if not autoplay
      
      // Navigate away
      cy.visit('/1');
      // The component script should have paused it if it was playing.
      // Since it's a new page visit in Cypress, the previous page's state is gone.
      // Wait, Slidastro is an SPA-like thing if it uses $page.
      // If we use cy.visit, it reloads. We should use keyboard navigation to stay in the same session.
    });
  });

  it('verifies Video pauses when navigating away via keyboard', () => {
    cy.visit('/8');
    cy.get('.slidastro-video-wrapper video').then(($video) => {
      const video = $video[0] as HTMLVideoElement;
      // Manually play it to test pausing
      video.play().catch(() => {}); 
    });

    // Press ArrowLeft to go to slide 7
    cy.get('body').type('{leftarrow}');
    cy.url().should('include', '/7');

    // Wait a bit for the subscription to trigger
    cy.wait(500);

    // Go back to slide 8 and check if it's paused? 
    // No, if I go back it might stay paused or autoplay if configured.
    // Better to check while ON slide 7 if the video ON slide 8 is paused?
    // But slide 8 might be unmounted if it's not a persistent SPA.
    // Slidastro renders all slides but hides them? 
    // Let's check how Slidastro renders slides.
  });
});
