const storageKey = 'wfd-daily-note-v1';
const day = 24 * 60 * 60 * 1000;
const noteLimit = 500;
const signatureLimit = 80;
const escape = text => String(text).replace(/[&<>"']/g, char => ({
 '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);

let note = null;
let draft = null;
let message = '';
let expirationTimer;

function readNote() {
 try {
  const saved = JSON.parse(localStorage.getItem(storageKey));
  if (!saved || typeof saved.text !== 'string' || typeof saved.signature !== 'string' || !Number.isFinite(saved.expiresAt)) return null;
  if (saved.expiresAt > Date.now()) return saved;
  localStorage.removeItem(storageKey);
 } catch {}
 return null;
}

function scheduleExpiration() {
 clearTimeout(expirationTimer);
 if (note) expirationTimer = setTimeout(syncNote, note.expiresAt - Date.now());
}

function syncNote() {
 const previousDeadline = note?.expiresAt;
 note = readNote();
 if (draft?.expiresAt && draft.expiresAt !== note?.expiresAt) draft = null;
 if (previousDeadline && !note) message = '';
 scheduleExpiration();
 if (!draft) repaint();
}

function noteContent() {
 if (draft) return `<form id="daily-note-form" class="daily-note-form">
  <label for="daily-note-text">Reminder</label>
  <textarea id="daily-note-text" name="reminder" rows="3" maxlength="${noteLimit}" required>${escape(draft.text)}</textarea>
  <label for="daily-note-signature">Sign with your name or initials</label>
  <input id="daily-note-signature" name="signature" type="text" maxlength="${signatureLimit}" value="${escape(draft.signature)}" required>
  <div class="daily-note-actions"><button type="submit" class="button primary">Save note</button><button type="button" class="button" data-daily-note="cancel">Cancel</button></div>
 </form>`;
 if (!note) return '<button type="button" class="button" data-daily-note="add">Add note</button>';
 const expires = new Date(note.expiresAt);
 const expiration = expires.toLocaleString([], {month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'});
 return `<p class="daily-note-text">${escape(note.text)}</p>
  <p class="daily-note-meta">Signed ${escape(note.signature)} · Expires <time datetime="${expires.toISOString()}">${escape(expiration)}</time></p>
  <div class="daily-note-actions"><button type="button" class="button" data-daily-note="edit">Edit note</button><button type="button" class="button" data-daily-note="delete">Delete note</button></div>`;
}

export function dailyNote() {
 return `<section class="panel daily-note" aria-labelledby="daily-note-title">
  <h2 id="daily-note-title">Daily Note</h2>
  <p class="daily-note-help">Personal reminder · Saved in this browser for 24 hours.</p>
  <div id="daily-note-content">${noteContent()}</div>
  <p id="daily-note-status" class="daily-note-status" role="status">${escape(message)}</p>
 </section>`;
}

function repaint(focus) {
 const content = document.getElementById('daily-note-content');
 if (!content) return;
 content.innerHTML = noteContent();
 document.getElementById('daily-note-status').textContent = message;
 if (focus) content.querySelector(focus)?.focus({preventScroll: true});
}

function setMessage(text) {
 message = text;
 document.getElementById('daily-note-status').textContent = message;
}

export function bindDailyNote() {
 syncNote();
 window.addEventListener('storage', event => {
  if (event.key === storageKey || event.key === null) syncNote();
 });
 document.addEventListener('visibilitychange', () => {
  if (!document.hidden && note?.expiresAt <= Date.now()) syncNote();
 });

 document.addEventListener('click', event => {
  const action = event.target.closest('[data-daily-note]')?.dataset.dailyNote;
  if (!action) return;
  message = '';
  if (action === 'add' || action === 'edit') {
   note = readNote();
   draft = note ? {...note} : {text: '', signature: ''};
   repaint('#daily-note-text');
  } else if (action === 'cancel') {
   draft = null;
   repaint('[data-daily-note]');
  } else if (action === 'delete') {
   try {
    localStorage.removeItem(storageKey);
   } catch {
    setMessage('Could not delete the note in this browser.');
    return;
   }
   note = null;
   scheduleExpiration();
   message = 'Note deleted.';
   repaint('[data-daily-note="add"]');
  }
 });

 document.addEventListener('input', event => {
  if (!draft) return;
  if (event.target.id === 'daily-note-text') draft.text = event.target.value;
  if (event.target.id === 'daily-note-signature') draft.signature = event.target.value;
 });

 document.addEventListener('submit', event => {
  if (event.target.id !== 'daily-note-form') return;
  event.preventDefault();
  const fields = new FormData(event.target);
  const text = fields.get('reminder').trim();
  const signature = fields.get('signature').trim();
  if (!text || text.length > noteLimit || !signature || signature.length > signatureLimit) {
   setMessage('Enter a reminder and sign with your name or initials.');
   return;
  }
  const current = readNote();
  if (draft.expiresAt !== current?.expiresAt) {
   draft = null;
   syncNote();
   setMessage('The saved note changed or expired. Review the current note before saving.');
   return;
  }
  const saved = {text, signature, expiresAt: current?.expiresAt ?? Date.now() + day};
  try {
   localStorage.setItem(storageKey, JSON.stringify(saved));
  } catch {
   setMessage('Could not save the note in this browser.');
   return;
  }
  note = saved;
  draft = null;
  message = 'Note saved.';
  scheduleExpiration();
  repaint('[data-daily-note="edit"]');
 });
}
