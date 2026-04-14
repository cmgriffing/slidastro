import { navigate } from 'astro:transitions/client';
import { $page, $clicks, $clicksTotal, setPage, setClicks, setClicksTotal, initSync } from '@slidastro/client';
import { checkVisibility, getMaxClick } from '../utils/clicks';

let initialized = false;
let currentClick = 0;
let totalClicks = 0;
let totalPages = 0;

// Initialize sync bridge once
if (typeof window !== 'undefined') {
  initSync();
}

function getCurrentSlide() {
  const match = window.location.pathname.match(/\/(\d+)/);
  return match ? parseInt(match[1], 10) : 1;
}

function applyClicks(broadcast = true) {
  const clickElements = document.querySelectorAll('.slidastro-click');
  clickElements.forEach(el => {
    const range = el.getAttribute('data-step-click') || '0';
    if (checkVisibility(range, currentClick)) {
      el.classList.remove('slidastro-click-hidden');
    } else {
      el.classList.add('slidastro-click-hidden');
    }
  });

  if (broadcast) {
    setClicks(currentClick);
  }
}

function goToSlide(no: number) {
  if (no < 1 || no > totalPages) return;
  currentClick = 0;
  setPage(no);
  setClicks(0);
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
    goToSlide(current - 1);
  }
}

function updateClicks() {
  const clickElements = Array.from(document.querySelectorAll('.slidastro-click'));
  totalClicks = 0;
  clickElements.forEach(el => {
    const range = el.getAttribute('data-step-click') || '0';
    const max = getMaxClick(range);
    if (max > totalClicks) totalClicks = max;
  });
  setClicksTotal(totalClicks);
  
  const url = new URL(window.location.href);
  currentClick = parseInt(url.searchParams.get('clicks') || '0', 10);
  setClicks(currentClick);
  applyClicks();
}

export function initNavigation(total: number) {
  totalPages = total;
  
  // Sync local state with stores
  setPage(getCurrentSlide());
  
  if (!initialized) {
    initialized = true;

    // Listen for external store changes
    $page.listen((page) => {
      if (page !== getCurrentSlide()) {
        navigate(`/${page}`);
      }
    });

    $clicks.listen((clicks) => {
      if (clicks !== currentClick) {
        currentClick = clicks;
        applyClicks(false); // don't broadcast back
      }
    });

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
  }

  // Always update clicks for the current page
  updateClicks();
}
