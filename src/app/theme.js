import { animate } from '../shared/utils/dom.js';

const savedTheme = localStorage.getItem('sayiad_theme') || 'light';

function syncThemeColor() {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) return;
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--body-bg').trim();
  if (bg) meta.setAttribute('content', bg);
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('sayiad_theme', theme);
  syncThemeColor();
  const toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.textContent = "";
    const thIcon = document.createElement("i");
    thIcon.className = theme === "dark" ? "fas fa-sun" : "fas fa-moon";
    thIcon.setAttribute("aria-hidden", "true");
    toggle.appendChild(thIcon);
    toggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    toggle.setAttribute(
      'aria-label',
      theme === 'dark' ? 'Switch to light mode' : 'Toggle dark mode',
    );
  }
}

applyTheme(savedTheme);

document.getElementById('themeToggle')?.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';

  document.documentElement.classList.add('theme-transitioning');
  applyTheme(next);

  animate(document.getElementById('themeToggle'), 'rotateIn', { duration: '0.4s' });

  setTimeout(
    () => document.documentElement.classList.remove('theme-transitioning'),
    450,
  );
});
