let editingBookId = null;

function renderBooks(search = '') {
  const q = search.toLowerCase();
  const filtered = db.books.filter(b =>
    b.title.toLowerCase().includes(q) ||
    b.author.toLowerCase().includes(q) ||
    b.genre.toLowerCase().includes(q)
  );

  if (!filtered.length) {
    document.getElementById('books-table').innerHTML = '<div class="empty"><div class="icon">📚</div><p>No books found</p></div>';
    return;
  }

  const isAdmin = currentUser.role === 'admin';
  const rows = filtered.map(b => {
    const badge = b.available === 0
      ? `<span class="badge badge-overdue">All Issued</span>`
      : `<span class="badge badge-available">${b.available} available</span>`;

    const actions = isAdmin
      ? `<div class="td-actions">
           <button class="btn btn-ghost btn-sm" onclick="openEditBook('${b.id}')">Edit</button>
           <button class="btn btn-danger btn-sm" onclick="deleteBook('${b.id}')">Delete</button>
         </div>`
      : `<span style="font-size:12px;color:var(--muted)">${b.available > 0 ? 'Available' : 'Not available'}</span>`;

    return `<tr>
      <td><strong>${b.title}</strong></td>
      <td>${b.author}</td>
      <td>${b.genre}</td>
      <td>${b.isbn}</td>
      <td>${b.year}</td>
      <td>${badge}<br/><span style="font-size:11px;color:var(--muted)">${b.copies} total</span></td>
      <td>${actions}</td>
    </tr>`;
  }).join('');

  document.getElementById('books-table').innerHTML = `
    <table>
      <thead><tr><th>Title</th><th>Author</th><th>Genre</th><th>ISBN</th><th>Year</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function openAddBook() {
  editingBookId = null;
  document.getElementById('modal-book-title').textContent = 'Add New Book';
  ['b-title','b-author','b-isbn','b-year'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('b-copies').value = 1;
  document.getElementById('modal-book').classList.add('show');
}

function openEditBook(id) {
  editingBookId = id;
  const b = db.books.find(x => x.id === id);
  document.getElementById('modal-book-title').textContent = 'Edit Book';
  document.getElementById('b-title').value  = b.title;
  document.getElementById('b-author').value = b.author;
  document.getElementById('b-isbn').value   = b.isbn;
  document.getElementById('b-genre').value  = b.genre;
  document.getElementById('b-copies').value = b.copies;
  document.getElementById('b-year').value   = b.year;
  document.getElementById('modal-book').classList.add('show');
}

function saveBook() {
  const title  = document.getElementById('b-title').value.trim();
  const author = document.getElementById('b-author').value.trim();
  const isbn   = document.getElementById('b-isbn').value.trim();
  const genre  = document.getElementById('b-genre').value;
  const copies = parseInt(document.getElementById('b-copies').value) || 1;
  const year   = parseInt(document.getElementById('b-year').value) || new Date().getFullYear();

  if (!title || !author) return toast('Title and author are required', 'error');

  if (editingBookId) {
    const b = db.books.find(x => x.id === editingBookId);
    const diff = copies - b.copies;
    Object.assign(b, { title, author, isbn, genre, copies, year });
    b.available = Math.max(0, b.available + diff);
  } else {
    db.books.push({ id: 'b' + Date.now(), title, author, isbn, genre, copies, available: copies, year });
  }

  saveDB();
  closeModal('modal-book');
  renderBooks();
  toast(editingBookId ? 'Book updated!' : 'Book added!');
}

function deleteBook(id) {
  if (db.issues.find(i => i.bookId === id && i.status !== 'returned'))
    return toast('Cannot delete — book is currently issued', 'error');
  if (!confirm('Delete this book?')) return;
  db.books = db.books.filter(b => b.id !== id);
  saveDB();
  renderBooks();
  toast('Book deleted');
}
