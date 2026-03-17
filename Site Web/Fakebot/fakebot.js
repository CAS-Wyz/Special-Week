const form = document.getElementById('chat-form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');
const statusEl = document.getElementById('status');

function addMessage(text, role='bot') {
  const div = document.createElement('div');
  div.className = `msg ${role === 'user' ? 'user' : 'bot'}`;
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function setStatus(text) {
  statusEl.textContent = text || '';
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const content = input.value.trim();
  if (!content) return;
  addMessage(content, 'user');
  input.value = '';
  setStatus('Le bot réfléchit…');

  try {
    const res = await fetch('http://127.0.0.1:8000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: content })
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Erreur ${res.status}: ${txt}`);
    }

    const data = await res.json();
    addMessage(data.reply || '(réponse vide)');
  } catch (err) {
    console.error(err);
    addMessage("Désolé, une erreur est survenue. Vérifie le backend.", 'bot');
  } finally {
    setStatus('');
  }
});