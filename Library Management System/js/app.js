// ── NAVIGATION ──────────────────────────
function navigate(name) {
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const links = document.querySelectorAll('.nav-link');
  const map = { dashboard: 0, books: 1, members: 2, issues: 3, mybooks: 4 };
  if (links[map[name]]) links[map[name]].classList.add('active');

  showPage(name);

  if (name === 'dashboard') renderDashboard();
  if (name === 'books')     renderBooks();
  if (name === 'members')   renderMembers();
  if (name === 'issues')    renderIssues();
  if (name === 'mybooks')   renderMyBooks();
}

function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(name + '-page').classList.add('active');
}

// ── KEYBOARD SHORTCUTS ───────────────────
document.getElementById('login-pass').addEventListener('keydown', e => { if (e.key === 'Enter') login(); });
document.getElementById('login-user').addEventListener('keydown', e => { if (e.key === 'Enter') login(); });

// ── INIT ────────────────────────────────
if (currentUser) afterLogin();
else showPage('login');
