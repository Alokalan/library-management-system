// ── CONSTANTS ──────────────────────────
const FINE_PER_DAY = 2; // ₹2 per day overdue

// ── SEED DATA ──────────────────────────
const defaultDB = {
  users: [
    { id:'u1', username:'admin',    password:'admin123', role:'admin',   name:'Administrator', email:'admin@library.com',  dept:'Administration' },
    { id:'u2', username:'student1', password:'pass123',  role:'student', name:'Rahul Sharma',  email:'rahul@college.edu',  dept:'Computer Science' },
    { id:'u3', username:'student2', password:'pass123',  role:'student', name:'Priya Patel',   email:'priya@college.edu',  dept:'Electronics' },
  ],
  books: [
    { id:'b1', title:'The C Programming Language',    author:'Kernighan & Ritchie', isbn:'978-0131103627', genre:'Technology',   copies:3, available:2, year:1988 },
    { id:'b2', title:'Introduction to Algorithms',    author:'Cormen et al.',       isbn:'978-0262046305', genre:'Technology',   copies:2, available:1, year:2009 },
    { id:'b3', title:'Clean Code',                    author:'Robert C. Martin',    isbn:'978-0132350884', genre:'Technology',   copies:2, available:2, year:2008 },
    { id:'b4', title:'The Great Gatsby',              author:'F. Scott Fitzgerald', isbn:'978-0743273565', genre:'Fiction',      copies:4, available:4, year:1925 },
    { id:'b5', title:'Sapiens',                       author:'Yuval Noah Harari',   isbn:'978-0062316097', genre:'History',      copies:3, available:2, year:2011 },
    { id:'b6', title:'Mathematics for Engineers',     author:'K.A. Stroud',         isbn:'978-0831134709', genre:'Mathematics',  copies:2, available:2, year:2013 },
  ],
  issues: [
    { id:'i1', bookId:'b1', memberId:'u2', issueDate:'2025-04-10', dueDate:'2025-04-24', returnDate:null, fine:0, status:'active' },
    { id:'i2', bookId:'b5', memberId:'u3', issueDate:'2025-04-01', dueDate:'2025-04-15', returnDate:null, fine:0, status:'overdue' },
    { id:'i3', bookId:'b2', memberId:'u2', issueDate:'2025-03-20', dueDate:'2025-04-03', returnDate:'2025-04-03', fine:0, status:'returned' },
  ]
};

// ── LOAD / SAVE ─────────────────────────
let db = JSON.parse(localStorage.getItem('lms_db') || 'null') || defaultDB;

function saveDB() {
  localStorage.setItem('lms_db', JSON.stringify(db));
}

// ── HELPERS ─────────────────────────────
function calcFine(issue) {
  if (issue.status === 'returned') return issue.fine || 0;
  const today = new Date(); today.setHours(0,0,0,0);
  const due   = new Date(issue.dueDate); due.setHours(0,0,0,0);
  if (today <= due) return 0;
  const days = Math.floor((today - due) / (1000 * 60 * 60 * 24));
  return days * FINE_PER_DAY;
}

function updateIssueStatuses() {
  const today = new Date(); today.setHours(0,0,0,0);
  db.issues.forEach(i => {
    if (i.status === 'returned') return;
    const due = new Date(i.dueDate); due.setHours(0,0,0,0);
    i.status = due < today ? 'overdue' : 'active';
  });
  saveDB();
}

// ── TOAST ───────────────────────────────
let toastTimer;
function toast(msg, type = '') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'show' + (type ? ' ' + type : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.className = '', 2800);
}

// ── MODAL ───────────────────────────────
function closeModal(id) {
  document.getElementById(id).classList.remove('show');
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.overlay').forEach(o =>
    o.addEventListener('click', e => { if (e.target === o) o.classList.remove('show'); })
  );
});
