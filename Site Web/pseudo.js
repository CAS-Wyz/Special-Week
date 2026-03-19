(function () {
  const PSEUDO_REGEX = /^[a-zA-Z0-9_-]{2,20}$/;
  const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8080'
    : '';

  // ── Base path (pour le CSS) ──────────────────────────────
  const scriptSrc = document.currentScript ? document.currentScript.src : '';
  const base = scriptSrc ? scriptSrc.replace(/pseudo\.js$/, '') : '../';

  // ── Injection du CSS ─────────────────────────────────────
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = base + 'pseudo-modal.css';
  document.head.appendChild(link);

  // ── Modal ────────────────────────────────────────────────
  function showModal() {
    const overlay = document.createElement('div');
    overlay.id = 'pseudo-overlay';
    overlay.innerHTML = `
      <div id="pseudo-modal">
        <h2>Bienvenue !</h2>
        <p>Choisis ton pseudo pour jouer et apparaître dans le classement.</p>
        <input type="text" id="pseudo-input" maxlength="20" placeholder="ex: CurieuX_42" autocomplete="off">
        <p id="pseudo-error"></p>
        <button id="pseudo-confirm">Commencer</button>
      </div>
    `;
    document.body.appendChild(overlay);

    const input = document.getElementById('pseudo-input');
    const confirmBtn = document.getElementById('pseudo-confirm');

    input.focus();

    confirmBtn.addEventListener('click', () => validateAndSave(input));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') validateAndSave(input);
    });
  }

  function validateAndSave(input) {
    const pseudo = input.value.trim();
    const errorEl = document.getElementById('pseudo-error');

    if (!PSEUDO_REGEX.test(pseudo)) {
      errorEl.textContent = '2 à 20 caractères : lettres, chiffres, _ ou - uniquement.';
      input.focus();
      return;
    }

    errorEl.textContent = '';
    sessionStorage.setItem('pseudo', pseudo);

    const overlay = document.getElementById('pseudo-overlay');
    if (overlay) overlay.remove();

    window.scrollTo({ top: 0, behavior: 'instant' });
    startHeartbeat();
  }

  // ── Heartbeat ────────────────────────────────────────────
  function ping() {
    const pseudo = sessionStorage.getItem('pseudo');
    if (!pseudo) return;
    fetch(API_BASE + '/api/presence/ping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pseudo })
    }).catch(() => {});
  }

  function startHeartbeat() {
    ping();
    setInterval(ping, 30000);
  }

  // ── Départ : retire la présence immédiatement ─────────────
  window.addEventListener('beforeunload', () => {
    const pseudo = sessionStorage.getItem('pseudo');
    if (!pseudo) return;
    navigator.sendBeacon(
      API_BASE + '/api/presence/leave',
      new Blob([JSON.stringify({ pseudo })], { type: 'application/json' })
    );
  });

  // ── Init ─────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    if (!sessionStorage.getItem('pseudo')) {
      showModal();
    } else {
      startHeartbeat();
    }
  });
})();
