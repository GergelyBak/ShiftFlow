export const setTheme = (mode: 'dark' | 'light') => {
  if (mode === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  localStorage.setItem('theme', mode);
};

export const initTheme = () => {
  const saved = localStorage.getItem('theme') || 'dark';
  setTheme(saved as 'dark' | 'light');
};
