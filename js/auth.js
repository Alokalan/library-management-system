// ── STATE ───────────────────────────────
let currentUser = JSON.parse(sessionStorage.getItem('lms_user') || 'null');

// ── LOGIN / LOGOUT ──────────────────────
function login() {
  const u = document.getElementById('login-user').value.trim();
  const p = document.getElementById('login-pass').value.trim();
  const user = db.users.find(x => x.username === u && x.password === p);
  if (!user) { document.getElementById('login-err').style.display = 'block'; return; }
  currentUser = user;
  sessionStorage.setItem('lms_user', JSON.stringify(user));
  document.getElementById('login-err').style.display = 'none';
  afterLogin();
}

function logout() {
  currentUser = null;
  sessionStorage.removeItem('lms_user');
  document.getElementById('nav-links').style.display = 'none';
  document.getElementById('logout-btn').style.display = 'none';
  document.getElementById('role-badge').style.display = 'none';
  showPage('login');
}

function afterLogin() {
  document.getElementById('nav-links').style.display = 'flex';
  document.getElementById('logout-btn').style.display = 'inline';

  const rb = document.getElementById('role-badge');
  rb.style.display = 'inline';
  rb.textContent = currentUser.role === 'admin' ? 'Admin' : 'Student';
  rb.className = 'role-badge' + (currentUser.role === 'admin' ? ' admin' : '');

  const isAdmin = currentUser.role === 'admin';
  document.getElementById('nl-members').style.display  = isAdmin ? 'inline' : 'none';
  document.getElementById('nl-issues').style.display   = isAdmin ? 'inline' : 'none';
  document.getElementById('add-book-btn').style.display = isAdmin ? 'inline' : 'none';
  document.getElementById('issue-btn').style.display   = isAdmin ? 'inline' : 'none';
  document.getElementById('nl-mybooks').style.display  = isAdmin ? 'none' : 'inline';

  navigate('dashboard');
}
