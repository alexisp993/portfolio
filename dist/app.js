const routes = ['home', 'projects', 'skills', 'about', 'contact'];
const titles = {
  home: 'Alex Pagtakhan — Data Analyst',
  projects: 'Projects — Alex Pagtakhan',
  skills: 'Skills — Alex Pagtakhan',
  about: 'About — Alex Pagtakhan',
  contact: 'Contact — Alex Pagtakhan'
};

const safeStorage = {
  get(storageName, key) {
    try { return window[storageName].getItem(key); } catch { return null; }
  },
  set(storageName, key, value) {
    try { window[storageName].setItem(key, value); } catch { /* Storage can be blocked in private contexts. */ }
  }
};

const loader = document.querySelector('[data-loader]');
if (safeStorage.get('sessionStorage', 'portfolio-intro-seen')) {
  loader.remove();
} else {
  safeStorage.set('sessionStorage', 'portfolio-intro-seen', 'true');
  window.setTimeout(() => loader.classList.add('is-done'), 720);
  window.setTimeout(() => loader.remove(), 1250);
}

const menuButton = document.querySelector('[data-menu]');
const collapseButton = document.querySelector('[data-collapse]');

function closeMenu() {
  document.body.classList.remove('menu-open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.querySelector('.sr-only').textContent = 'Open navigation';
}

function showRoute({ focus = true } = {}) {
  const requested = location.hash.slice(1).toLowerCase();
  const route = routes.includes(requested) ? requested : 'home';
  document.querySelectorAll('[data-view]').forEach(view => {
    view.classList.toggle('is-active', view.dataset.view === route);
  });
  document.querySelectorAll('[data-route]').forEach(link => {
    if (link.dataset.route === route) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  document.title = titles[route];
  closeMenu();
  window.scrollTo({ top: 0, behavior: 'instant' });
  if (focus) {
    const heading = document.querySelector(`[data-view="${route}"] h1`);
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
  }
}

window.addEventListener('hashchange', () => showRoute());
showRoute({ focus: false });

menuButton.addEventListener('click', () => {
  const open = document.body.classList.toggle('menu-open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.querySelector('.sr-only').textContent = open ? 'Close navigation' : 'Open navigation';
});

collapseButton.addEventListener('click', () => {
  const collapsed = document.body.classList.toggle('sidebar-collapsed');
  collapseButton.setAttribute('aria-expanded', String(!collapsed));
  collapseButton.setAttribute('aria-label', collapsed ? 'Expand sidebar' : 'Collapse sidebar');
  collapseButton.querySelector('span').textContent = collapsed ? 'Expand' : 'Collapse';
  safeStorage.set('localStorage', 'portfolio-sidebar-collapsed', String(collapsed));
});

if (safeStorage.get('localStorage', 'portfolio-sidebar-collapsed') === 'true') {
  document.body.classList.add('sidebar-collapsed');
  collapseButton.setAttribute('aria-expanded', 'false');
  collapseButton.setAttribute('aria-label', 'Expand sidebar');
  collapseButton.querySelector('span').textContent = 'Expand';
}

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && document.body.classList.contains('menu-open')) {
    closeMenu();
    menuButton.focus();
  }
});

document.querySelector('.skip-link').addEventListener('click', event => {
  event.preventDefault();
  document.querySelector('#main-content').focus();
});

const marquee = document.querySelector('[data-marquee]');
const marqueeControl = document.querySelector('[data-marquee-control]');
marqueeControl.addEventListener('click', () => {
  const paused = marquee.classList.toggle('is-paused');
  marqueeControl.setAttribute('aria-pressed', String(paused));
  marqueeControl.setAttribute('aria-label', paused ? 'Play tools animation' : 'Pause tools animation');
});

document.querySelectorAll('.detail-toggle').forEach(button => {
  button.addEventListener('click', () => {
    const row = button.closest('.project-row');
    const open = row.classList.toggle('is-open');
    button.setAttribute('aria-expanded', String(open));
    button.firstChild.textContent = open ? 'Hide details ' : 'View details ';
  });
});

const copyButton = document.querySelector('[data-copy-email]');
const copyStatus = document.querySelector('[data-copy-status]');
copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText('alexis.pagtakhan@gmail.com');
    copyButton.textContent = 'Copied';
    copyStatus.textContent = 'Email address copied to clipboard.';
  } catch {
    copyStatus.textContent = 'Could not access the clipboard. Select the email address in the card to copy it.';
  }
  window.setTimeout(() => { copyButton.textContent = 'Copy email'; copyStatus.textContent = ''; }, 3000);
});
