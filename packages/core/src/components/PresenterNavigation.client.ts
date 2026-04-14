import { navigate } from 'astro:transitions/client';
import { $page, $clicks, setPage, setClicks, setClicksTotal, initSync } from '@slidastro/client';
import { checkVisibility, getMaxClick } from '../utils/clicks';

let initialized = false;
let currentClick = 0;
let totalClicksOnSlide = 0;
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
  // Find current slide preview (it's the one in the larger section)
  const preview = document.querySelector('section.relative.flex .slide-preview-content');
  if (!preview) return;
  
  const clickElements = preview.querySelectorAll('.slidastro-click');
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
  navigate(`/presenter/${no}`);
}

function next() {
  if (currentClick < totalClicksOnSlide) {
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
  const preview = document.querySelector('section.relative.flex .slide-preview-content');
  if (!preview) return;

  const clickElements = Array.from(preview.querySelectorAll('.slidastro-click'));
  totalClicksOnSlide = 0;
  clickElements.forEach(el => {
    const range = el.getAttribute('data-step-click') || '0';
    const max = getMaxClick(range);
    if (max > totalClicksOnSlide) totalClicksOnSlide = max;
  });
  setClicksTotal(totalClicksOnSlide);
  
  // Sync with current store state (might have come from Main window)
  currentClick = $clicks.get();
  applyClicks(false);
}

export function initPresenterNavigation(total: number) {
  totalPages = total;
  const current = getCurrentSlide();
  setPage(current);
  
  if (!initialized) {
    initialized = true;

    // Listen for external store changes
    $page.listen((page) => {
      if (page !== getCurrentSlide()) {
        navigate(`/presenter/${page}`);
      }
    });

    $clicks.listen((clicks) => {
      if (clicks !== currentClick) {
        currentClick = clicks;
        applyClicks(false);
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
      }
    });

    // Handle button clicks via custom event delegation
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.id === 'prev-btn' || target.closest('#prev-btn')) {
        prev();
      } else if (target.id === 'next-btn' || target.closest('#next-btn')) {
        next();
      }
    });
  }

  // Use MutationObserver to wait for SlidePreview content to be injected if needed
  // or just a simple timeout for Astro transitions
  setTimeout(updateClicks, 100);
}
