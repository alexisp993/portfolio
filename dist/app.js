const routes = ['home', 'projects', 'skills', 'about', 'contact'];
const titles = {
  home: 'Alex Pagtakhan — Data Analyst',
  projects: 'Projects — Alex Pagtakhan',
  skills: 'Skills — Alex Pagtakhan',
  about: 'About — Alex Pagtakhan',
  contact: 'Contact — Alex Pagtakhan'
};

const loader = document.querySelector('[data-loader]');
let introSeen = false;
try {
  introSeen = sessionStorage.getItem('portfolio-loader-seen') === '1';
  if (!introSeen) sessionStorage.setItem('portfolio-loader-seen', '1');
} catch {}

if (introSeen || matchMedia('(prefers-reduced-motion: reduce)').matches) {
  loader?.remove();
} else {
  setTimeout(() => loader?.classList.add('is-done'), 650);
  setTimeout(() => loader?.remove(), 1150);
}

const menuButton = document.querySelector('[data-menu]');
const collapseButton = document.querySelector('[data-collapse]');

function closeMenu() {
  document.body.classList.remove('menu-open');
  menuButton?.setAttribute('aria-expanded', 'false');
  menuButton?.setAttribute('aria-label', 'Open navigation');
}

function showRoute({ focus = true } = {}) {
  const requested = location.hash.slice(1).toLowerCase();
  const route = routes.includes(requested) ? requested : 'home';

  document.querySelectorAll('[data-view]').forEach((view) => {
    view.classList.toggle('is-active', view.dataset.view === route);
  });
  document.querySelectorAll('[data-route]').forEach((link) => {
    if (link.dataset.route === route) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });

  document.title = titles[route];
  closeMenu();
  scrollTo({ top: 0, behavior: 'instant' });

  if (focus) {
    const heading = document.querySelector(`[data-view="${route}"] h1`);
    heading?.setAttribute('tabindex', '-1');
    heading?.focus({ preventScroll: true });
  }
}

addEventListener('hashchange', () => showRoute());
showRoute({ focus: false });

menuButton?.addEventListener('click', () => {
  const open = document.body.classList.toggle('menu-open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});

collapseButton?.addEventListener('click', () => {
  const collapsed = document.body.classList.toggle('sidebar-collapsed');
  collapseButton.setAttribute('aria-expanded', String(!collapsed));
  collapseButton.setAttribute('aria-label', collapsed ? 'Expand sidebar' : 'Collapse sidebar');
  collapseButton.querySelector('span').textContent = collapsed ? 'Expand' : 'Collapse';
  try { localStorage.setItem('sidebar-collapsed', String(collapsed)); } catch {}
});

try {
  if (localStorage.getItem('sidebar-collapsed') === 'true') collapseButton?.click();
} catch {}

document.querySelector('.skip-link')?.addEventListener('click', (event) => {
  event.preventDefault();
  document.querySelector('#main')?.focus();
});

const slider = document.querySelector('.hero-slider');
const slides = [...document.querySelectorAll('[data-project-slide]')];
const slideButtons = [...document.querySelectorAll('[data-slide]')];
const slideStatus = document.querySelector('[data-slide-status]');
const slideNames = ['Financial Overview', 'BookMory — Reading Tracker', 'Ma, Anong Ulam'];
let currentSlide = 0;
let slideTimer;

function showSlide(index, automatic = false) {
  currentSlide = (index + slides.length) % slides.length;
  slides.forEach((slide, position) => slide.classList.toggle('is-active', position === currentSlide));
  slideButtons.forEach((button, position) => {
    if (position === currentSlide) button.setAttribute('aria-current', 'true');
    else button.removeAttribute('aria-current');
  });
  if (slideStatus) slideStatus.textContent = `Showing ${slideNames[currentSlide]}`;
  if (!automatic) restartSlider();
}

function pauseSlider() { clearInterval(slideTimer); }
function restartSlider() {
  pauseSlider();
  if (!document.hidden && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    slideTimer = setInterval(() => showSlide(currentSlide + 1, true), 6000);
  }
}

slideButtons.forEach((button) => button.addEventListener('click', () => showSlide(Number(button.dataset.slide))));
slider?.addEventListener('mouseenter', pauseSlider);
slider?.addEventListener('mouseleave', restartSlider);
slider?.addEventListener('focusin', pauseSlider);
slider?.addEventListener('focusout', restartSlider);
slider?.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowRight') { event.preventDefault(); showSlide(currentSlide + 1); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); showSlide(currentSlide - 1); }
});
document.addEventListener('visibilitychange', restartSlider);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && document.body.classList.contains('menu-open')) {
    closeMenu();
    menuButton?.focus();
  }
});
restartSlider();
