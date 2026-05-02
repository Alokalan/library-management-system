let currentIssueTab = 'active';
let returningIssueId = null;

function switchIssueTab(tab, el) {
  currentIssueTab = tab;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  renderIssues();
}

function renderIssues() {
  updateIssueStatuses();
  const isAdmin = currentUser.role === 'admin';
  let issues = db.issues.filter(i => i.status === currentIssueTab);
  if (!isAdmin) issues = issues.filter(i => i.memberId === currentUser.id);
  document.getElementById('issues-table').innerHTML = buildIssueTable(issues, true);
}

function renderMyBooks() {
  updateIssueStatuses();
  const myIssues = db.issues.filter(i => i.memberId === currentUser.id);
  document.getElementById('mybooks-table').innerHTML = buildIssueTable(myIssues, false);
}

function buildIssueTable(issues, showActions) {
  if (!issues.length) return '<div class="empty"><div class="icon">📋</div><p>No records found</p></div>';

  const isAdmin = currentUser.role === 'admin';
  const statusBadge = { active: 'badge-available', overdue: 'badge-overdue', returned: 'badge-issued' };

  const rows = issues.map(i => {
    const book   = db.books.find(b => b.id === i.bookId) || { title: 'Unknown' };
    const member = db.users.find(u => u.id === i.memberId) || { name: 'Unknown' };
    const fine   = calcFine(i);
    const badge  = `<span class="badge ${statusBadge[i.status]}">${i.status}</span>`;
    const fineCell = fine > 0
      ? `<span class="fine-amt">₹${fine}</span>`
      : `<span style="color:var(--muted)">—</span>`;
    const action = (showActions && i.status !== 'returned' && isAdmin)
      ? `<button class="btn btn-warn btn-sm" onclick="openReturn('${i.id}')">Return</button>`
      : '—';

    return `<tr>
      <td><strong>${book.title}</strong></td>
      ${isAdmin ? `<td>${member.name}</td>` : ''}
      <td>${i.issueDate}</td>
      <td>${i.dueDate}</td>
      <td>${i.returnDate || '—'}</td>
      <td>${badge}</td>
      <td>${fineCell}</td>
      ${showActions ? `<td>${action}</td>` : ''}
    </tr>`;
  }).join('');

  return `
    <table>
      <thead><tr>
        <th>Book</th>
        ${isAdmin ? '<th>Member</th>' : ''}
        <th>Issued</th><th>Due Date</th><th>Returned</th><th>Status</th><th>Fine</th>
        ${showActions ? '<th>Action</th>' : ''}
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function openIssueModal() {
  const memberSel = document.getElementById('i-member');
  memberSel.innerHTML = db.users
    .filter(u => u.role === 'student')
    .map(u => `<option value="${u.id}">${u.name}</option>`)
    .join('');

  const bookSel = document.getElementById('i-book');
  bookSel.innerHTML = db.books
    .filter(b => b.available > 0)
    .map(b => `<option value="${b.id}">${b.title} (${b.available} avail.)</option>`)
    .join('');

  if (!bookSel.options.length) return toast('No books available to issue', 'error');

  const due = new Date();
  due.setDate(due.getDate() + 14);
  document.getElementById('i-due').value = due.toISOString().split('T')[0];
  document.getElementById('modal-issue').classList.add('show');
}

function issueBook() {
  const memberId = document.getElementById('i-member').value;
  const bookId   = document.getElementById('i-book').value;
  const dueDate  = document.getElementById('i-due').value;

  if (!dueDate) return toast('Select a due date', 'error');

  const book = db.books.find(b => b.id === bookId);
  if (!book || book.available < 1) return toast('Book not available', 'error');

  if (db.issues.find(i => i.bookId === bookId && i.memberId === memberId && i.status !== 'returned'))
    return toast('Member already has this book', 'error');

  book.available--;
  db.issues.push({
    id: 'i' + Date.now(), bookId, memberId,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate, returnDate: null, fine: 0, status: 'active'
  });

  saveDB();
  closeModal('modal-issue');
  renderIssues();
  toast('Book issued successfully!');
}

function openReturn(issueId) {
  returningIssueId = issueId;
  const issue  = db.issues.find(i => i.id === issueId);
  const book   = db.books.find(b => b.id === issue.bookId) || { title: 'Unknown' };
  const member = db.users.find(u => u.id === issue.memberId) || { name: 'Unknown' };
  const fine   = calcFine(issue);

  document.getElementById('return-info').textContent = `"${book.title}" borrowed by ${member.name}`;

  const fineDiv = document.getElementById('fine-display');
  if (fine > 0) {
    const days = Math.floor((new Date() - new Date(issue.dueDate)) / (1000 * 60 * 60 * 24));
    fineDiv.style.display = 'block';
    fineDiv.innerHTML = `⚠️ <strong>Fine applicable:</strong> Overdue by ${days} day(s).<br/>
      <strong class="fine-amt">Total Fine: ₹${fine}</strong> @ ₹${FINE_PER_DAY}/day`;
  } else {
    fineDiv.style.display = 'none';
  }

  document.getElementById('modal-return').classList.add('show');
}

function confirmReturn() {
  const issue = db.issues.find(i => i.id === returningIssueId);
  const book  = db.books.find(b => b.id === issue.bookId);
  const fine  = calcFine(issue);

  issue.status     = 'returned';
  issue.returnDate = new Date().toISOString().split('T')[0];
  issue.fine       = fine;
  if (book) book.available++;

  saveDB();
  closeModal('modal-return');
  renderIssues();
  toast(fine > 0 ? `Book returned. Fine: ₹${fine}` : 'Book returned successfully!', fine > 0 ? 'warn' : '');
}
