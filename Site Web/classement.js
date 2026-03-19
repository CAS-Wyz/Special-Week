const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:8080'
  : '';

// ── Joueurs en ligne ─────────────────────────────────────────────────────────

async function loadOnlinePlayers() {
  try {
    const res = await fetch(API_BASE + '/api/presence/online');
    const players = await res.json();

    const list = document.getElementById('online-list');
    const count = document.getElementById('online-count');
    list.innerHTML = '';

    count.textContent = players.length > 0 ? `(${players.length})` : '';

    if (players.length === 0) {
      const empty = document.createElement('span');
      empty.className = 'online-empty';
      empty.textContent = 'Aucun joueur en ligne pour le moment.';
      list.appendChild(empty);
      return;
    }

    players.forEach(pseudo => {
      const chip = document.createElement('span');
      chip.className = 'player-chip';
      chip.textContent = pseudo; // XSS-safe : textContent uniquement
      list.appendChild(chip);
    });
  } catch {
    const list = document.getElementById('online-list');
    list.innerHTML = '';
    const empty = document.createElement('span');
    empty.className = 'online-empty';
    empty.textContent = 'Impossible de charger les joueurs en ligne.';
    list.appendChild(empty);
  }
}

// ── Classement ───────────────────────────────────────────────────────────────

async function loadLeaderboard(quizId) {
  const content = document.getElementById('leaderboard-content');
  content.innerHTML = '<span class="lb-loading">Chargement...</span>';

  try {
    const res = await fetch(API_BASE + '/api/scores/top/' + quizId);
    const scores = await res.json();
    content.innerHTML = '';

    if (scores.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'lb-empty';
      empty.textContent = 'Aucun score enregistré pour ce quiz.';
      content.appendChild(empty);
      return;
    }

    scores.forEach((s, i) => {
      const row = document.createElement('div');
      row.className = 'leaderboard-row';

      const rank = document.createElement('span');
      rank.className = 'rank rank-' + (i + 1);
      rank.textContent = '#' + (i + 1);

      const pseudo = document.createElement('span');
      pseudo.className = 'lb-pseudo';
      pseudo.textContent = s.pseudo; // XSS-safe

      const score = document.createElement('span');
      score.className = 'lb-score';
      score.textContent = s.score + ' / ' + s.totalQuestions;

      const date = document.createElement('span');
      date.className = 'lb-date';
      if (s.date) {
        const d = new Date(s.date);
        date.textContent = d.toLocaleDateString('fr-FR');
      }

      row.appendChild(rank);
      row.appendChild(pseudo);
      row.appendChild(score);
      row.appendChild(date);
      content.appendChild(row);
    });
  } catch {
    content.innerHTML = '';
    const empty = document.createElement('p');
    empty.className = 'lb-empty';
    empty.textContent = 'Impossible de charger le classement.';
    content.appendChild(empty);
  }
}

// ── Onglets ──────────────────────────────────────────────────────────────────

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadLeaderboard(btn.dataset.quiz);
  });
});

// ── Init ─────────────────────────────────────────────────────────────────────

loadOnlinePlayers();
loadLeaderboard('general');
setInterval(loadOnlinePlayers, 30000);
