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

const visitDisplay = document.querySelector('[data-profile-visits]');
const visitCount = document.querySelector('[data-visit-count]');

async function loadVisitCount() {
  if (!visitDisplay || !visitCount) return;
  let countedThisSession = false;
  try { countedThisSession = sessionStorage.getItem('portfolio-visit-counted') === '1'; } catch {}

  try {
    const response = await fetch('/api/visits', {
      method: countedThisSession ? 'GET' : 'POST',
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) return;
    const data = await response.json();
    if (!Number.isFinite(data.count)) return;
    visitCount.textContent = new Intl.NumberFormat().format(data.count);
    visitDisplay.hidden = false;
    if (!countedThisSession) {
      try { sessionStorage.setItem('portfolio-visit-counted', '1'); } catch {}
    }
  } catch {}
}

loadVisitCount();

const menuButton = document.querySelector('[data-menu]');
const collapseButton = document.querySelector('[data-collapse]');
const themeButton = document.querySelector('[data-theme-toggle]');
const themeLabel = document.querySelector('[data-theme-label]');
const themeColor = document.querySelector('meta[name="theme-color"]');

function applyTheme(theme, persist = true) {
  const isLight = theme === 'light';
  document.documentElement.dataset.theme = isLight ? 'light' : 'dark';
  themeButton?.setAttribute('aria-pressed', String(isLight));
  themeButton?.setAttribute('aria-label', `Switch to ${isLight ? 'dark' : 'light'} mode`);
  if (themeLabel) themeLabel.textContent = `${isLight ? 'Dark' : 'Light'} mode`;
  themeColor?.setAttribute('content', isLight ? '#edf2e9' : '#172621');
  if (persist) {
    try { localStorage.setItem('portfolio-theme', isLight ? 'light' : 'dark'); } catch {}
  }
  requestAnimationFrame(() => drawFractalBackground?.(performance.now()));
}

applyTheme(document.documentElement.dataset.theme, false);
themeButton?.addEventListener('click', async () => {
  if (themeButton.disabled) return;
  const nextTheme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!document.startViewTransition || reduceMotion) {
    applyTheme(nextTheme);
    return;
  }

  const bounds = themeButton.getBoundingClientRect();
  const originX = bounds.left + bounds.width / 2;
  const originY = bounds.top + bounds.height / 2;
  const radius = Math.hypot(
    Math.max(originX, innerWidth - originX),
    Math.max(originY, innerHeight - originY)
  );

  document.documentElement.style.setProperty('--theme-origin-x', `${originX}px`);
  document.documentElement.style.setProperty('--theme-origin-y', `${originY}px`);
  document.documentElement.style.setProperty('--theme-reveal-radius', `${radius}px`);
  document.documentElement.classList.add('theme-revealing');
  themeButton.disabled = true;

  const transition = document.startViewTransition(() => applyTheme(nextTheme));
  try { await transition.finished; } finally {
    document.documentElement.classList.remove('theme-revealing');
    themeButton.disabled = false;
  }
});

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
  requestAnimationFrame(resizeFractalBackground);
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
const slideNames = ['book-tracker', 'Ma, Anong Ulam'];
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

const projectCards = [...document.querySelectorAll('[data-project-card]')];
const projectFilters = [...document.querySelectorAll('[data-project-filter]')];
const projectSearch = document.querySelector('[data-project-search]');
const projectEmpty = document.querySelector('[data-project-empty]');
const projectStatus = document.querySelector('[data-project-status]');
const toolCards = [...document.querySelectorAll('.tool-grid li')];
let activeProjectFilter = 'all';

document.querySelectorAll('[data-project-count]').forEach((value) => {
  value.textContent = String(projectCards.length);
});
document.querySelectorAll('[data-tool-count]').forEach((value) => {
  value.textContent = String(toolCards.length);
});

function updateProjectResults() {
  const query = projectSearch?.value.trim().toLowerCase() || '';
  let visibleCount = 0;

  projectCards.forEach((card) => {
    const matchesFilter = activeProjectFilter === 'all' || card.dataset.category === activeProjectFilter;
    const matchesSearch = !query || card.dataset.search.includes(query);
    const visible = matchesFilter && matchesSearch;
    card.hidden = !visible;
    if (visible) visibleCount += 1;
  });

  if (projectEmpty) projectEmpty.hidden = visibleCount > 0;
  if (projectStatus) projectStatus.textContent = `${visibleCount} project${visibleCount === 1 ? '' : 's'} shown`;
}

projectFilters.forEach((button) => {
  button.addEventListener('click', () => {
    activeProjectFilter = button.dataset.projectFilter;
    projectFilters.forEach((filter) => {
      const selected = filter === button;
      filter.classList.toggle('is-active', selected);
      filter.setAttribute('aria-pressed', String(selected));
    });
    updateProjectResults();
  });
});

projectSearch?.addEventListener('input', updateProjectResults);
updateProjectResults();

const fractalCanvas = document.querySelector('[data-fractal-background]');
const fractalContext = fractalCanvas?.getContext('2d');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const fractalMouse = { x: innerWidth * .58, y: innerHeight * .42, active: false };
let fractalFrame = 0;
let fractalLastDraw = 0;

function resizeFractalBackground() {
  if (!fractalCanvas || !fractalContext) return;
  const bounds = fractalCanvas.getBoundingClientRect();
  const pixelRatio = Math.min(devicePixelRatio || 1, 1.5);
  fractalCanvas.width = Math.max(1, Math.round(bounds.width * pixelRatio));
  fractalCanvas.height = Math.max(1, Math.round(bounds.height * pixelRatio));
  fractalContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  drawFractalBackground(performance.now());
}

function drawFractalBackground(time) {
  if (!fractalCanvas || !fractalContext) return;
  const width = fractalCanvas.clientWidth;
  const height = fractalCanvas.clientHeight;
  const spacing = innerWidth < 700 ? 38 : 30;
  const radius = 190;
  const localMouseX = fractalMouse.x - fractalCanvas.getBoundingClientRect().left;
  const localMouseY = fractalMouse.y;

  fractalContext.clearRect(0, 0, width, height);
  for (let x = spacing / 2; x < width; x += spacing) {
    for (let y = spacing / 2; y < height; y += spacing) {
      const dx = x - localMouseX;
      const dy = y - localMouseY;
      const distance = Math.hypot(dx, dy);
      const strength = fractalMouse.active && distance < radius ? Math.pow(1 - distance / radius, 2) : 0;
      const angle = Math.atan2(dy, dx);
      const wave = reducedMotion.matches ? 0 : Math.sin(distance * .05 - time * .004) * 12 * strength;
      const dotX = x + Math.cos(angle) * wave;
      const dotY = y + Math.sin(angle) * wave;
      const dotRadius = 1.05 + strength * 1.15;
      fractalContext.beginPath();
      fractalContext.arc(dotX, dotY, dotRadius, 0, Math.PI * 2);
      fractalContext.fillStyle = strength > .02
        ? `rgba(121, 221, 176, ${.2 + strength * .52})`
        : 'rgba(115, 174, 126, .2)';
      fractalContext.fill();
    }
  }
}

function animateFractalBackground(time) {
  if (time - fractalLastDraw >= 32) {
    drawFractalBackground(time);
    fractalLastDraw = time;
  }
  fractalFrame = requestAnimationFrame(animateFractalBackground);
}

function setFractalMotion() {
  cancelAnimationFrame(fractalFrame);
  if (reducedMotion.matches || document.hidden) {
    fractalMouse.active = false;
    drawFractalBackground(performance.now());
  } else {
    fractalFrame = requestAnimationFrame(animateFractalBackground);
  }
}

if (fractalCanvas && fractalContext) {
  resizeFractalBackground();
  addEventListener('resize', resizeFractalBackground, { passive: true });
  addEventListener('pointermove', (event) => {
    if (!finePointer.matches || reducedMotion.matches) return;
    fractalMouse.x = event.clientX;
    fractalMouse.y = event.clientY;
    fractalMouse.active = true;
  }, { passive: true });
  document.addEventListener('pointerleave', () => { fractalMouse.active = false; });
  document.addEventListener('visibilitychange', setFractalMotion);
  reducedMotion.addEventListener('change', setFractalMotion);
  setFractalMotion();
}
