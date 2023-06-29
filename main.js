const books = [];
const STORAGE_KEY = 'BOOK_APPS';
const SAVED_EVENT = 'saved-books';
const RENDER_EVENT = 'render-books';
const INCOMPLETE_BOOKSHELF = 'inCompleteBookshelfList';
const COMPLETE_BOOKSHELF = 'completeBookshelfList';
const BOOK_ID = 'itemId';

document.addEventListener(RENDER_EVENT, function () {
    const uncompletedBookList = document.getElementById('inCompleteBookshelfList');
    uncompletedBookList.innerHTML = '';

    const completedBookList = document.getElementById('completeBookshelfList');
    completedBookList.innerHTML = '';

    for (const itemBook of books) {
        const elementBook = makeBook(itemBook.title, itemBook.author, itemBook.year, itemBook.isCompleted);
        elementBook[BOOK_ID] = itemBook.id;

        if (!itemBook.isCompleted) {
            uncompletedBookList.append(elementBook);
        } else {
            completedBookList.append(elementBook);
        }
    }
});

function addBook() {
    const inCompleteBookshelfList = document.getElementById(INCOMPLETE_BOOKSHELF);
    const completeBookshelfList = document.getElementById(COMPLETE_BOOKSHELF);
    const inputTitleBook = document.getElementById('inputBookTitle').value;
    const inputAuthorBook = document.getElementById('inputBookAuthor').value;
    const inputYearBook = document.getElementById('inputBookYear').value;
    const inputBookIsComplete = document.getElementById('inputBookIsComplete').checked;

    const book = makeBook(inputTitleBook, inputAuthorBook, inputYearBook, inputBookIsComplete);
    const generateID = generateId();
    const bookObject = generateBookObject(generateID, inputTitleBook, inputAuthorBook, inputYearBook, inputBookIsComplete);
    book[BOOK_ID] = bookObject.id;
    books.push(bookObject);

    if (inputBookIsComplete == true) {
        completeBookshelfList.append(book);
    } else {
        inCompleteBookshelfList.append(book);
    }

    saveData();
}

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
    return {
        id,
        title,
        author,
        year,
        isCompleted
    }
}

function makeBook(inputTitleBook, inputAuthorBook, inputYearBook, inputBookIsComplete) {
    const bookTitle = document.createElement('h3');
    bookTitle.innerText = inputTitleBook;
    bookTitle.classList.add('move');

    const bookAuthor = document.createElement('p');
    bookAuthor.innerText = inputAuthorBook;

    const bookYear = document.createElement('p');
    bookYear.classList.add('year');
    bookYear.innerText = inputYearBook;

    const bookIsComplete = createCompleteButton();

    const bookRemove = createRemoveButton();
    bookRemove.innerText = 'Delete';

    const bookAction = document.createElement('div');
    bookAction.classList.add('action');
    if (inputBookIsComplete == true) {
        bookIsComplete.innerText = 'Uncompleted';
    } else {
        bookIsComplete.innerText = 'Completed';
    }

    bookAction.append(bookIsComplete,bookRemove);
    const bookItem = document.createElement('article');
    bookItem.classList.add('book_item');
    bookItem.append(bookTitle, bookAuthor, bookYear, bookAction);

    return bookItem;
}

function createButton (buttonTypeClass, eventListener) {
    const button = document.createElement('button');
    button.classList.add(buttonTypeClass);
    button.addEventListener('click', function(event) {
        eventListener(event);
    });
    return button;
}

function createCompleteButton() {
    return createButton('green', function(event) {
        const parent = event.target.parentElement;
        addBookCompleted(parent.parentElement);
    });
}

function createRemoveButton() {
    return createButton('red', function(event) {
        const parent = event.target.parentElement;
        removeBook(parent.parentElement);
    });
}

function addBookCompleted(bookElement) {
    const titleBook = bookElement.querySelector('.book_item > h3').innerText;
    const authorBook = bookElement.querySelector('.book_item > p').innerText;
    const yearBook = bookElement.querySelector('.year').innerText;
    const bookIsComplete = bookElement.querySelector('.green').innerText;

    if (bookIsComplete == 'Completed') {
        const newBook = makeBook(titleBook, authorBook, yearBook, true);

        const book = findBook(bookElement[BOOK_ID]);
        book.isCompleted = true;
        newBook[BOOK_ID] = book.id;

        const completeBookshelfList = document.getElementById(COMPLETE_BOOKSHELF);
        completeBookshelfList.append(newBook);
    } else {
        const newBook = makeBook(titleBook, authorBook, yearBook, false);

        const book = findBook(bookElement[BOOK_ID]);
        book.isCompleted = false;
        newBook[BOOK_ID] = book.id;

        const inCompleteBookshelfList = document.getElementById(INCOMPLETE_BOOKSHELF);
        inCompleteBookshelfList.append(newBook);
    }
    bookElement.remove();

    saveData();
}

function removeBook(bookElement) {
    const bookTarget = findBookIndex(bookElement[BOOK_ID]);
    books.splice(bookTarget, 1);
    bookElement.remove();
    saveData();
}



function searchBook() {
    const inputSearch = document.getElementById('searchBookTitle').value;
    const moveBook = document.querySelectorAll('.move');
    for(move of moveBook) {
        if(inputSearch !== move.innerText) {
            console.log(move.innerText);
            move.parentElement.remove();
        }
    }
}

function findBook(bookId) {
    for (book of books) {
        if(book.id === bookId) {
            return book;
        }
    }
    return null;
}

function findBookIndex(bookId) {
    let index = 0;
    for(book of books) {
        if(book.id === bookId) {
            return index;
        }
        index++;
    }
    return -1;
}

document.addEventListener('DOMContentLoaded', function () {
    const submitBook = document.getElementById('inputBook');
    submitBook.addEventListener('submit', function(event) {
        event.preventDefault();
        addBook();
    });

    const bookSearch = document.getElementById('searchBook');
    bookSearch.addEventListener('submit', function(event) {
        event.preventDefault();
        searchBook();
    });

    if(isStorageExist()) {
        loadDataFromStorage();
    }
});



function changeText() {
    const checkbox = document.getElementById('inputBookIsComplete');
    const textSubmit = document.getElementById('textSubmit');

    if(checkbox.checked == true) {
        textSubmit.innerText = 'Sudah selesai dibaca';
    } else {
        textSubmit.innerText = 'Belum selesai dibaca';
    }
}

function isStorageExist() {
    if (typeof(Storage) === undefined) {
        alert('Browser Anda tidak mendukung local storage');
        return false;
    }
    
    return true;
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
    
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if(data !== null) {
        for(const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}