import { navigate } from 'astro:transitions/client';

let initialized = false;
let currentClick = 0;
let totalClicks = 0;

export function initNavigation(totalPages: number) {
  if (initialized) {
    updateClicks();
    return;
  }
  initialized = true;

  function updateClicks() {
    const clickElements = document.querySelectorAll('[data-click]');
    totalClicks = 0;
    clickElements.forEach(el => {
      const idx = parseInt(el.getAttribute('data-click') || '0', 10);
      if (idx > totalClicks) totalClicks = idx;
    });
    
    // Check URL for click state (optional, for direct linking)
    const url = new URL(window.location.href);
    currentClick = parseInt(url.searchParams.get('clicks') || '0', 10);
    applyClicks();
  }

  function applyClicks() {
    const clickElements = document.querySelectorAll('[data-click]');
    clickElements.forEach(el => {
      const idx = parseInt(el.getAttribute('data-click') || '0', 10);
      if (idx > currentClick) {
        el.classList.add('slidev-vclick-hidden');
      } else {
        el.classList.remove('slidev-vclick-hidden');
      }
    });
    
    // Update URL with click state if needed (optional)
    // const url = new URL(window.location.href);
    // url.searchParams.set('clicks', currentClick.toString());
    // history.replaceState(null, '', url.href);
  }

  function goToSlide(no: number) {
    if (no < 1 || no > totalPages) return;
    currentClick = 0;
    navigate(`/${no}`);
  }

  function next() {
    if (currentClick < totalClicks) {
      currentClick++;
      applyClicks();
      return;
    }
    const current = getCurrentSlide();
    if (current < totalPages) {
      goToSlide(current + 1);
    }
  }

  function prev() {
    if (currentClick > 0) {
      currentClick--;
      applyClicks();
      return;
    }
    const current = getCurrentSlide();
    if (current > 1) {
      // When going back, we should probably start at the LAST click of previous slide?
      // Slidev does this. But for now, let's just go back to start.
      goToSlide(current - 1);
    }
  }

  function getCurrentSlide() {
    const match = window.location.pathname.match(/\/(\d+)/);
    return match ? parseInt(match[1], 10) : 1;
  }

  window.addEventListener('keydown', (e) => {
    if ((e.target as HTMLElement).closest('input, textarea, [contenteditable]')) return;

    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
      next();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      prev();
    } else if (e.key === 'Home') {
      goToSlide(1);
    } else if (e.key === 'End') {
      goToSlide(totalPages);
    } else if (e.key === 'o' || e.key === 'O') {
      navigate('/overview');
    }
  });

  window.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a, button, input, textarea')) return;
    
    const x = e.clientX;
    const width = window.innerWidth;
    if (x > width * 0.75) {
      next();
    } else if (x < width * 0.25) {
      prev();
    }
  });
  
  // Initial click scan
  updateClicks();
}


