import { navigate } from 'astro:transitions/client';
import { $page, setPage, setClicks, initSync } from '@slidastro/client';

let initialized = false;
let totalPages = 0;

// Initialize sync bridge once
if (typeof window !== 'undefined') {
  initSync();
}

function getCurrentSlide() {
  const match = window.location.pathname.match(/\/(\d+)/);
  return match ? parseInt(match[1], 10) : 1;
}

function goToSlide(no: number) {
  if (no < 1 || no > totalPages) return;
  setPage(no);
  setClicks(0);
  navigate(`/presenter/${no}`);
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

    window.addEventListener('keydown', (e) => {
      if ((e.target as HTMLElement).closest('input, textarea, [contenteditable]')) return;

      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        const current = getCurrentSlide();
        goToSlide(current + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        const current = getCurrentSlide();
        goToSlide(current - 1);
      } else if (e.key === 'Home') {
        goToSlide(1);
      } else if (e.key === 'End') {
        goToSlide(totalPages);
      }
    });

    // Handle button clicks via custom event delegation
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.id === 'prev-btn') {
        const current = getCurrentSlide();
        goToSlide(current - 1);
      } else if (target.id === 'next-btn') {
        const current = getCurrentSlide();
        goToSlide(current + 1);
      }
    });
  }
}
