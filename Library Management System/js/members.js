function renderMembers(search = '') {
  const q = search.toLowerCase();
  const members = db.users.filter(u =>
    u.role === 'student' && (
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.dept.toLowerCase().includes(q)
    )
  );

  if (!members.length) {
    document.getElementById('members-table').innerHTML = '<div class="empty"><div class="icon">👤</div><p>No members found</p></div>';
    return;
  }

  const rows = members.map(m => {
    const active  = db.issues.filter(i => i.memberId === m.id && i.status !== 'returned').length;
    const overdue = db.issues.filter(i => i.memberId === m.id && i.status === 'overdue').length;
    return `<tr>
      <td><strong>${m.name}</strong><br/><span style="font-size:12px;color:var(--muted)">${m.username}</span></td>
      <td>${m.email}</td>
      <td>${m.dept}</td>
      <td>${active} active ${overdue > 0 ? `<span class="badge badge-overdue">${overdue} overdue</span>` : ''}</td>
      <td><button class="btn btn-danger btn-sm" onclick="deleteMember('${m.id}')">Remove</button></td>
    </tr>`;
  }).join('');

  document.getElementById('members-table').innerHTML = `
    <table>
      <thead><tr><th>Name</th><th>Email</th><th>Department</th><th>Books</th><th>Action</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function openAddMember() {
  document.getElementById('modal-member').classList.add('show');
}

function saveMember() {
  const name     = document.getElementById('m-name').value.trim();
  const username = document.getElementById('m-username').value.trim();
  const pass     = document.getElementById('m-pass').value.trim();
  const email    = document.getElementById('m-email').value.trim();
  const dept     = document.getElementById('m-dept').value.trim();

  if (!name || !username || !pass) return toast('Name, username and password are required', 'error');
  if (db.users.find(u => u.username === username)) return toast('Username already exists', 'error');

  db.users.push({ id: 'u' + Date.now(), username, password: pass, role: 'student', name, email, dept });
  saveDB();
  closeModal('modal-member');
  renderMembers();
  toast('Member added!');
  ['m-name','m-username','m-pass','m-email','m-dept'].forEach(id => document.getElementById(id).value = '');
}

function deleteMember(id) {
  if (db.issues.find(i => i.memberId === id && i.status !== 'returned'))
    return toast('Member has active issues — cannot remove', 'error');
  if (!confirm('Remove this member?')) return;
  db.users = db.users.filter(u => u.id !== id);
  saveDB();
  renderMembers();
  toast('Member removed');
}
