// fakebot.js — Quiz Vrai/Faux sans répétition + anti-alternance stricte

// --- Sélecteurs DOM ---
const form = document.getElementById('chat-form');
const input = document.getElementById('input');
// Permet d'envoyer le message avec "Entrée" sans cliquer sur le bouton
input.addEventListener('keydown', (e) => {
  // ENTER sans Shift = envoyer
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();     // empêche le retour à la ligne
    form.dispatchEvent(new Event('submit')); // déclenche l'envoi
  }
});

const messages = document.getElementById('messages');
const statusEl = document.getElementById('status');

// --- État ---
let affirmations = [];  // données chargées depuis affirmations.json
let deck = [];          // paquet mélangé (sans répétition)
let cursor = 0;         // index de progression dans le paquet
let current = null;     // affirmation en cours
let awaitingAnswer = false;
let score = 0;
let total = 0;

// --- UI helpers ---
function addMessage(text, role = 'bot', { showLabel = (role !== 'user') } = {}) {
  const div = document.createElement('div');
  div.className = `msg ${role === 'user' ? 'user' : 'bot'}`;
  div.setAttribute('role', 'article');
  div.setAttribute('aria-label', role === 'user' ? "Message de l’utilisateur" : "Message du bot");

  if (showLabel && role !== 'user') {
    const label = document.createElement('span');
    label.className = 'label';
    label.textContent = '// FAKEBOT';
    div.appendChild(label);
  }

  div.appendChild(document.createTextNode(text)); // textContent => évite XSS
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
  return div;
}

function setStatus(text) {
  const pos = deck.length ? `Question ${Math.min(cursor + (awaitingAnswer ? 0 : 1), deck.length)}/${deck.length}` : '';
  const scoreText = `Score : ${score}/${total}`;
  statusEl.innerHTML = `
    <div class="card">
      ⚡ <strong>${scoreText}</strong>${pos ? ` — <span>${pos}</span>` : ''}${text ? ` — <span>${text}</span>` : ''}
    </div>
  `;
}

// --- Chargement JSON ---
async function loadAffirmations() {
  const url = './affirmations.json'; // adapte le chemin si besoin
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data || !Array.isArray(data.affirmations)) {
      throw new Error('Format invalide : attendu { "affirmations": [...] }');
    }
    affirmations = data.affirmations.slice(); // copie défensive
  } catch (e) {
    console.error('Erreur de chargement affirmations.json :', e);
    addMessage("⚠️ Impossible de charger les affirmations. Vérifie le fichier 'affirmations.json'.", 'bot');
  }
}

// --- Mélange (Fisher–Yates) + garde-fou anti-alternance stricte ---
function shuffle(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function isStrictAlternatingBools(bools) {
  if (bools.length <= 2) return false;
  // Vrai/Faux/Vrai/Faux… sur toute la séquence
  for (let i = 1; i < bools.length; i++) {
    if (bools[i] === bools[i - 1]) return false;
  }
  return true;
}

function buildDeck() {
  if (affirmations.length === 0) {
    deck = [];
    cursor = 0;
    return;
  }
  // mélange initial
  let temp = shuffle(affirmations);
  // si, par (malheureux) hasard, on tombe sur une alternance parfaite, on re-mélange
  let attempts = 0;
  while (attempts < 6 && isStrictAlternatingBools(temp.map(a => !!a.estVrai))) {
    temp = shuffle(affirmations);
    attempts++;
  }
  deck = temp;
  cursor = 0;
}

// --- Logique Quiz ---
function hasNext() {
  return cursor < deck.length;
}

function askNext() {
  if (!hasNext()) {
    awaitingAnswer = false;
    setStatus('Fin du paquet');
    addMessage("🎉 Tu as répondu à toutes les affirmations. Tape « /restart » pour rejouer avec un nouveau mélange.", 'bot');
    return;
  }

  current = deck[cursor++];
  awaitingAnswer = true;

  addMessage(`Affirmation : ${current.texte}\n\nRéponds par « Vrai » ou « Faux ».`, 'bot');
  setStatus('À toi de jouer !');
}

function normalizeYesNo(str) {
  const s = str
    .trim()
    .toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, ''); // supprime accents

  if (['v', 'vr', 'vrai', 'true', 'oui', 'o', 'yes', 'y'].includes(s)) return true;
  if (['f', 'fa', 'faux', 'false', 'non', 'n', 'no'].includes(s)) return false;
  return null;
}

function evaluateUserAnswer(userText) {
  const bool = normalizeYesNo(userText);
  if (bool === null) {
    addMessage(`Je n'ai pas compris. Réponds simplement « Vrai » ou « Faux ».`, 'bot');
    setStatus('Réponse non reconnue');
    return; // on attend une réponse valide
  }

  total++;
  const correct = (bool === !!current.estVrai);
  if (correct) {
    score++;
    addMessage(`✅ Bravo ! C’était **${current.estVrai ? 'Vrai' : 'Faux'}**.\n${current.explication}`, 'bot');
  } else {
    addMessage(`❌ Dommage. La bonne réponse était **${current.estVrai ? 'Vrai' : 'Faux'}**.\n${current.explication}`, 'bot');
  }

  awaitingAnswer = false;
  setStatus('Nouvelle affirmation…');

  setTimeout(() => {
    askNext();
  }, 900);
}

// --- Commandes utilitaires ---
function handleCommand(cmd) {
  switch (cmd) {
    case '/restart':
      score = 0;
      total = 0;
      buildDeck();
      setStatus('Nouveau paquet mélangé');
      askNext();
      return true;
    case '/score':
      addMessage(`📊 Score actuel : ${score}/${total}.`, 'bot');
      return true;
    default:
      return false;
  }
}

// --- Formulaire ---
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const content = input.value.trim();
  if (!content) return;

  addMessage(content, 'user');
  input.value = '';

  // Commandes
  if (content.startsWith('/')) {
    if (handleCommand(content.toLowerCase())) return;
  }

  // Pas d’affirmation en cours → poser la suivante
  if (!current || !awaitingAnswer) {
    askNext();
  } else {
    evaluateUserAnswer(content);
  }
});

// --- Démarrage ---
window.addEventListener('DOMContentLoaded', async () => {
  setStatus('Chargement des affirmations…');
  await loadAffirmations();

  if (affirmations.length < 1) {
    setStatus('Erreur de chargement');
    return;
  }

  addMessage("Bienvenue dans le quiz Vrai/Faux ! 🎯", 'bot');
  addMessage("Je te propose des affirmations tirées au hasard (sans répétition). Réponds « Vrai » ou « Faux ». Tape « /restart » pour rejouer, « /score » pour voir ton score.", 'bot');

  buildDeck();
  askNext();
});