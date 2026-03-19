(function () {
  const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8080'
    : '';

  const SESSION_KEY = 'adminKey';
  let adminKey = sessionStorage.getItem(SESSION_KEY) || '';

  // Chart instances (for destroy/recreate on refresh)
  let scoresChartInstance     = null;
  let progressionChartInstance = null;
  const distChartInstances    = {};
  const errorChartInstances   = {};

  // Chart.js global defaults
  Chart.defaults.color = '#8b7a9f';
  Chart.defaults.font.family = "'Segoe UI', Arial, sans-serif";

  // ── Connexion ─────────────────────────────────────────────────────────────

  const loginScreen = document.getElementById('login-screen');
  const dashboard   = document.getElementById('dashboard');
  const loginBtn    = document.getElementById('login-btn');
  const keyInput    = document.getElementById('admin-key-input');
  const loginError  = document.getElementById('login-error');

  loginBtn.addEventListener('click', () => tryLogin(keyInput.value.trim()));
  keyInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') tryLogin(keyInput.value.trim());
  });

  async function tryLogin(key) {
    loginBtn.disabled = true;
    loginBtn.textContent = '…';
    loginError.textContent = '';

    try {
      const res = await fetch(API_BASE + '/api/admin/stats', {
        headers: { 'Authorization': 'Bearer ' + key }
      });
      if (res.status === 403) {
        loginError.textContent = 'Clé incorrecte.';
        loginBtn.disabled = false;
        loginBtn.textContent = 'Accéder';
        return;
      }
      const data = await res.json();
      adminKey = key;
      sessionStorage.setItem(SESSION_KEY, key);
      showDashboard(data);
    } catch {
      loginError.textContent = 'Impossible de contacter le serveur.';
      loginBtn.disabled = false;
      loginBtn.textContent = 'Accéder';
    }
  }

  if (adminKey) tryLogin(adminKey);

  // ── Affichage ─────────────────────────────────────────────────────────────

  function showDashboard(data) {
    loginScreen.style.display = 'none';
    dashboard.style.display = 'block';
    renderStats(data);
    setInterval(refreshStats, 30000);
  }

  async function refreshStats() {
    try {
      const res = await fetch(API_BASE + '/api/admin/stats', {
        headers: { 'Authorization': 'Bearer ' + adminKey }
      });
      if (!res.ok) return;
      renderStats(await res.json());
    } catch { /* silencieux */ }
  }

  // ── Render complet ────────────────────────────────────────────────────────

  function renderStats(data) {
    renderKpis(data);
    renderOnlinePlayers(data.onlinePlayers || []);
    renderScoresChart(data.modules || []);
    renderDistCharts(data.modules || []);
    renderErrorCharts(data.topErrors || {}, data.modules || []);
    renderProgression(data.progressionDist || {});
    document.getElementById('last-refresh').textContent =
      new Date().toLocaleTimeString('fr-FR');
  }

  // ── KPIs ──────────────────────────────────────────────────────────────────

  function renderKpis(data) {
    document.getElementById('kpi-online').textContent = data.onlineNow ?? '—';
    document.getElementById('kpi-today').textContent  = data.todayVisitors ?? '—';
    document.getElementById('kpi-total').textContent  = data.totalUniquePlayers ?? '—';
  }

  // ── Joueurs en ligne ──────────────────────────────────────────────────────

  function renderOnlinePlayers(players) {
    const chips = document.getElementById('online-chips');
    chips.innerHTML = '';
    if (players.length === 0) {
      chips.innerHTML = '<span class="dash-empty">Aucun joueur en ligne.</span>';
      return;
    }
    players.forEach(p => {
      const chip = document.createElement('span');
      chip.className = 'player-chip';
      chip.textContent = p;
      chips.appendChild(chip);
    });
  }

  // ── Score des quizz ───────────────────────────────────────────────────────

  function renderScoresChart(modules) {
    const labels  = modules.map(m => m.label);
    const avgs    = modules.map(m => m.avgPercent);

    // Bar chart
    if (scoresChartInstance) scoresChartInstance.destroy();
    const ctx = document.getElementById('scores-chart').getContext('2d');
    scoresChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Score moyen (%)',
          data: avgs,
          backgroundColor: ['rgba(176,38,255,0.7)', 'rgba(107,0,196,0.7)', 'rgba(209,112,255,0.7)'],
          borderColor:      ['#b026ff', '#6b00c4', '#d170ff'],
          borderWidth: 2,
          borderRadius: 8,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            min: 0, max: 100,
            ticks: { callback: v => v + '%' },
            grid: { color: 'rgba(90,46,122,0.3)' }
          },
          x: { grid: { display: false } }
        }
      }
    });

    // Table récap
    const table = document.getElementById('scores-table');
    table.innerHTML = modules.map(m => `
      <div class="score-row">
        <span class="score-row-label">${escHtml(m.label)}</span>
        <div class="score-row-right">
          <span class="score-row-players">${m.totalPlayers} joueur${m.totalPlayers > 1 ? 's' : ''}</span>
          <span class="score-row-pct">${m.avgPercent}%</span>
          <div class="score-mini-bar">
            <div class="score-mini-fill" style="width:${m.avgPercent}%"></div>
          </div>
        </div>
      </div>
    `).join('');
  }

  // ── Indices visualisés — distribution ────────────────────────────────────

  function renderDistCharts(modules) {
    const grid = document.getElementById('dist-grid');
    grid.innerHTML = '';

    modules.forEach(m => {
      const card = document.createElement('div');
      card.className = 'dist-card';

      const canvasId = 'dist-' + m.id;
      card.innerHTML = `
        <p class="dist-card-title">${escHtml(m.label)}</p>
        <div class="dist-canvas-wrap">
          <canvas id="${canvasId}"></canvas>
        </div>
        <div class="dist-chart-legend" id="dist-legend-${m.id}"></div>
      `;
      grid.appendChild(card);

      if (distChartInstances[m.id]) distChartInstances[m.id].destroy();

      const dist   = m.distribution || {};
      const values = [dist['0-25'] || 0, dist['25-50'] || 0, dist['50-75'] || 0, dist['75-100'] || 0];
      const labels = ['0–25 %', '25–50 %', '50–75 %', '75–100 %'];
      const colors = ['#ff4d7a', '#ff9944', '#b026ff', '#00c864'];

      const ctx = document.getElementById(canvasId).getContext('2d');
      distChartInstances[m.id] = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{ data: values, backgroundColor: colors, borderWidth: 0, hoverOffset: 6 }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '65%',
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: ctx => ` ${ctx.label} : ${ctx.raw} joueur(s)` } }
          }
        }
      });

      // Légende manuelle
      const legend = document.getElementById('dist-legend-' + m.id);
      legend.innerHTML = labels.map((l, i) => `
        <div class="dist-legend-item">
          <span class="dist-legend-dot" style="background:${colors[i]}"></span>
          <span>${l}</span>
          <span class="dist-legend-count">${values[i]}</span>
        </div>
      `).join('');
    });
  }

  // ── Types d'erreurs courantes ─────────────────────────────────────────────

  function renderErrorCharts(topErrors, modules) {
    const grid = document.getElementById('errors-grid');
    grid.innerHTML = '';

    modules.forEach(m => {
      const errors = topErrors[m.id] || [];
      const card = document.createElement('div');
      card.className = 'error-card';

      const canvasId = 'err-' + m.id;
      card.innerHTML = `
        <p class="error-card-title">${escHtml(m.label)}</p>
        ${errors.length === 0
          ? '<p class="dash-empty" style="font-size:0.82rem;padding:12px 0">Aucune erreur enregistrée.</p>'
          : `<div class="error-canvas-wrap"><canvas id="${canvasId}"></canvas></div>`
        }
      `;
      grid.appendChild(card);

      if (errors.length === 0) return;

      if (errorChartInstances[m.id]) errorChartInstances[m.id].destroy();

      const labels = errors.map(e => truncate(e.label, 35));
      const counts = errors.map(e => e.count);

      const ctx = document.getElementById(canvasId).getContext('2d');
      errorChartInstances[m.id] = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Erreurs',
            data: counts,
            backgroundColor: 'rgba(255,77,122,0.7)',
            borderColor: '#ff4d7a',
            borderWidth: 1,
            borderRadius: 6,
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: {
              ticks: { stepSize: 1 },
              grid: { color: 'rgba(90,46,122,0.3)' }
            },
            y: { grid: { display: false } }
          }
        }
      });
    });
  }

  // ── Progression ───────────────────────────────────────────────────────────

  function renderProgression(dist) {
    const labels = Object.keys(dist);
    const values = Object.values(dist);
    const colors = ['#6b00c4', '#b026ff', '#00c864'];

    if (progressionChartInstance) progressionChartInstance.destroy();
    const ctx = document.getElementById('progression-chart').getContext('2d');
    progressionChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{ data: values, backgroundColor: colors, borderWidth: 0, hoverOffset: 6 }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ` ${ctx.label} : ${ctx.raw} joueur(s)` } }
        }
      }
    });

    const legend = document.getElementById('progression-legend');
    legend.innerHTML = labels.map((l, i) => `
      <div class="prog-legend-item">
        <span class="prog-legend-dot" style="background:${colors[i]}"></span>
        <div>
          <div class="prog-legend-label">${l}</div>
          <div class="prog-legend-count">${values[i]} joueur${values[i] > 1 ? 's' : ''}</div>
        </div>
      </div>
    `).join('');
  }

  // ── Utilitaires ───────────────────────────────────────────────────────────

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function truncate(str, max) {
    return str.length > max ? str.substring(0, max) + '…' : str;
  }
})();
