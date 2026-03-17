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
  ];

  // Détection de la page active
  const currentPath = window.location.pathname.toLowerCase();

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
  </div>
</header>
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
})();
