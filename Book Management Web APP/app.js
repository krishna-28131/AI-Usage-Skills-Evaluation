const booksContainer = document.getElementById('booksContainer');
const addBookForm = document.getElementById('addBookForm');

function renderBook(doc) {
  const data = doc.data();
  const card = document.createElement('div');
  card.classList.add('book-card');

  card.innerHTML = `
    <img src="${data.coverImageURL}" alt="${data.title}">
    <h3>${data.title}</h3>
    <p>Author: ${data.author}</p>
    <p>Price: $${data.price}</p>
    <button class="update-btn">Update Author</button>
    <button class="delete-btn">Delete</button>
  `;

  // Update Author
  card.querySelector('.update-btn').addEventListener('click', () => {
    const newAuthor = prompt('Enter new author name:', data.author);
    if (newAuthor) {
      db.collection('books').doc(doc.id).update({ author: newAuthor });
    }
  });

  // Delete Book
  card.querySelector('.delete-btn').addEventListener('click', () => {
    db.collection('books').doc(doc.id).delete();
  });

  booksContainer.appendChild(card);
}

// Realtime listener
db.collection('books').onSnapshot(snapshot => {
  booksContainer.innerHTML = '';
  snapshot.forEach(doc => renderBook(doc));
});

// Add Book
addBookForm.addEventListener('submit', e => {
  e.preventDefault();
  const title = addBookForm.title.value;
  const author = addBookForm.author.value;
  const price = parseFloat(addBookForm.price.value);
  const coverImageURL = addBookForm.coverImageURL.value;

  db.collection('books').add({ title, author, price, coverImageURL });
  addBookForm.reset();
});
