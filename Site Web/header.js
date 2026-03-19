/**
 * header.js — injecte le header commun sur toutes les pages.
 * Inclure depuis les sous-dossiers : <script src="../header.js"></script>
 * La page active est détectée automatiquement via l'URL.
 */
(function () {
  // Résoudre la racine (Site Web/) depuis n'importe quel sous-dossier
  const scriptSrc = document.currentScript
    ? document.currentScript.src
    : '';
  const base = scriptSrc
    ? scriptSrc.replace(/header\.js$/, '')
    : '../';

  // Liens de navigation
  const navLinks = [
    { label: 'Accueil',           href: base + 'Accueil/accueil.html' },
    { label: 'Documentation',     href: base + 'Documentation/documentation.html' },
    { label: 'Jeux interactifs',  href: base + 'Apprentissage/apprentissage.html' },
    { label: 'IA',                href: base + 'Fakebot/fakebot.html' },
    { label: 'Classement',        href: base + 'classement.html' },
  ];

  function isActive(href) {
    try {
      const url = new URL(href, window.location.href);
      return window.location.pathname.toLowerCase() === url.pathname.toLowerCase();
    } catch {
      return false;
    }
  }

  // Construire le HTML du header
  const navHTML = navLinks
    .map(link => {
      const active = isActive(link.href) ? ' class="active"' : '';
      return `<a href="${link.href}"${active}>${link.label}</a>`;
    })
    .join('\n        ');

  const siteUrl = window.location.origin;
  const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&bgcolor=1a0a24&color=ffffff&data=' + encodeURIComponent(siteUrl);

  const headerHTML = `
<link rel="stylesheet" href="${base}header.css">
<header id="site-header">
  <div class="header-inner">
    <a class="header-logo" href="${base}Accueil/accueil.html">
      <img class="header-logo-img" src="${base}src/Logo Special Week.png" alt="Logo Clairvo'lAnce">
      <span class="header-logo-text">Clairvo'lAnce</span>
    </a>

    <button class="header-hamburger" aria-label="Menu" aria-expanded="false">
      <span></span>
      <span></span>
      <span></span>
    </button>

    <nav class="header-nav">
        ${navHTML}
    </nav>

    <button class="header-qr-btn" aria-label="QR Code">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="3" height="3"/><rect x="19" y="17" width="2" height="4"/><rect x="14" y="19" width="5" height="2"/>
      </svg>
      <span>Partager</span>
    </button>
  </div>
</header>

<div id="qr-overlay" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.75);align-items:center;justify-content:center;z-index:9999;">
  <div class="qr-modal">
    <button class="qr-close" aria-label="Fermer">✕</button>
    <p class="qr-title">Rejoindre le site</p>
    <img src="${qrUrl}" alt="QR Code" class="qr-img">
    <p class="qr-url">${siteUrl}</p>
  </div>
</div>
`;

  // Injecter au début du <body>
  document.body.insertAdjacentHTML('afterbegin', headerHTML);

  // Burger menu toggle
  const btn = document.querySelector('.header-hamburger');
  const nav = document.querySelector('.header-nav');

  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
  });

  // Fermer le menu en cliquant sur un lien (mobile)
  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      nav.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', false);
    });
  });

  // QR Code modal
  const qrBtn = document.querySelector('.header-qr-btn');
  const qrOverlay = document.getElementById('qr-overlay');
  const qrClose = document.querySelector('.qr-close');

  const showQr = () => { qrOverlay.style.display = 'flex'; };
  const hideQr = () => { qrOverlay.style.display = 'none'; };

  qrBtn.addEventListener('click', () => {
    qrOverlay.style.display === 'flex' ? hideQr() : showQr();
  });
  qrClose.addEventListener('click', hideQr);
  qrOverlay.addEventListener('click', (e) => {
    if (e.target === qrOverlay) hideQr();
  });

  // Fermer le menu en cliquant en dehors
  document.addEventListener('click', (e) => {
    if (nav.classList.contains('open') && !e.target.closest('#site-header')) {
      nav.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', false);
    }
  });
})();
