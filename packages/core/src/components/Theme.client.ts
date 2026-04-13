export function initTheme() {
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const storageTheme = localStorage.getItem('slidastro-theme');
  
  const applyTheme = (dark: boolean) => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  if (storageTheme === 'dark') {
    applyTheme(true);
  } else if (storageTheme === 'light') {
    applyTheme(false);
  } else {
    applyTheme(isDark);
  }

  // Listen for system changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('slidastro-theme')) {
      applyTheme(e.matches);
    }
  });
}

export function toggleTheme() {
  const isDark = document.documentElement.classList.contains('dark');
  const nextDark = !isDark;
  
  if (nextDark) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('slidastro-theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('slidastro-theme', 'light');
  }
  
  return nextDark;
}
