import { navigate } from 'astro:transitions/client';
import { $page, $clicks, $clicksTotal, setPage, setClicks, setClicksTotal, initSync } from '@slidastro/client';
import { checkVisibility, getMaxClick } from '../utils/clicks';

let initialized = false;
let currentClick = 0;
let totalClicks = 0;
export let totalPages = 0;

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

export function goToSlide(no: number) {
  if (no < 1 || no > totalPages) return;
  currentClick = 0;
  setPage(no);
  setClicks(0);
  navigate(`/${no}`);
}

export function next() {
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

export function prev() {
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

    // Handle s-link and other links with data-to
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[data-to]') as HTMLElement;
      if (link) {
        const to = link.getAttribute('data-to');
        if (to === 'next') {
          e.preventDefault();
          next();
        } else if (to === 'prev') {
          e.preventDefault();
          prev();
        } else if (to && !isNaN(Number(to))) {
          e.preventDefault();
          goToSlide(Number(to));
        }
      }
    });
  }

  // Always update clicks for the current page
  updateClicks();
}
