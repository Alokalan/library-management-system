function renderDashboard() {
  updateIssueStatuses();

  const isAdmin = currentUser.role === 'admin';
  document.getElementById('dash-title').textContent = isAdmin ? 'Admin Dashboard' : 'My Dashboard';
  document.getElementById('dash-sub').textContent = `Welcome back, ${currentUser.name}`;

  renderStats(isAdmin);
  renderRecentActivity(isAdmin);
}

function renderStats(isAdmin) {
  const totalAvail   = db.books.reduce((s, b) => s + b.available, 0);
  const activeIssues = db.issues.filter(i => i.status === 'active');
  const overdueCount = db.issues.filter(i => i.status === 'overdue').length;

  let html = '';

  if (isAdmin) {
    html = `
      <div class="stat-card"><div class="label">Total Books</div><div class="value">${db.books.length}</div><div class="sub">${db.books.reduce((s,b)=>s+b.copies,0)} total copies</div></div>
      <div class="stat-card"><div class="label">Available</div><div class="value">${totalAvail}</div><div class="sub">copies ready to issue</div></div>
      <div class="stat-card"><div class="label">Active Issues</div><div class="value">${activeIssues.length}</div><div class="sub">currently borrowed</div></div>
      <div class="stat-card"><div class="label">Overdue</div><div class="value" style="color:var(--accent2)">${overdueCount}</div><div class="sub">books past due date</div></div>
      <div class="stat-card"><div class="label">Members</div><div class="value">${db.users.filter(u=>u.role==='student').length}</div><div class="sub">registered students</div></div>
    `;
  } else {
    const myIssues  = db.issues.filter(i => i.memberId === currentUser.id && i.status !== 'returned').length;
    const myOverdue = db.issues.filter(i => i.memberId === currentUser.id && i.status === 'overdue').length;
    const returned  = db.issues.filter(i => i.memberId === currentUser.id && i.status === 'returned').length;
    html = `
      <div class="stat-card"><div class="label">Books Borrowed</div><div class="value">${myIssues}</div><div class="sub">currently with you</div></div>
      <div class="stat-card"><div class="label">Overdue</div><div class="value" style="color:var(--accent2)">${myOverdue}</div><div class="sub">return immediately</div></div>
      <div class="stat-card"><div class="label">Returned</div><div class="value">${returned}</div><div class="sub">books returned</div></div>
      <div class="stat-card"><div class="label">Available</div><div class="value">${totalAvail}</div><div class="sub">in library now</div></div>
    `;
  }

  document.getElementById('stats-grid').innerHTML = html;
}

function renderRecentActivity(isAdmin) {
  const recent = isAdmin
    ? [...db.issues].sort((a,b) => new Date(b.issueDate) - new Date(a.issueDate)).slice(0, 8)
    : db.issues.filter(i => i.memberId === currentUser.id).sort((a,b) => new Date(b.issueDate) - new Date(a.issueDate)).slice(0, 8);

  document.getElementById('recent-label').textContent = isAdmin ? 'Recent Borrowing Activity' : 'My Recent Activity';
  document.getElementById('recent-table').innerHTML = recent.length
    ? buildIssueTable(recent, false)
    : '<div class="empty"><div class="icon">📖</div><p>No activity yet</p></div>';
}
