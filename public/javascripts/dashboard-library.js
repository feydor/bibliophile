"use strict";

const GETBOOKS = "http://localhost:3000/books";
const GETSAVED = "http://localhost:3000/saved";
const POSTBOOK = "http://localhost:3000/books";
const DOMAIN = "http://localhost:3000/";
const BOOKLIST_CONTAINER = document.getElementById("booklist-container");
const FORMNODE = document.getElementById("add-book-form");
const ADDBUTTON = document.getElementById("add-book-button");
const MAX_URL_LENGTH = 45;
// enumeration of all possible view states (for booklist)
const VIEW = {
  gallery: "gallery",
  list: "list",
};
Object.freeze(VIEW);

// State variables
let CURRENT_VIEW = VIEW.list;
let BookList = [];


/**
 * GETs the user's booklist from backend
 *
 * @return {Aray} BookList An array containing the user's books
 */
async function getBookList() {
  const response = await fetch(GETBOOKS, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.json();
}
/* Main entrypoint */
window.addEventListener("load", () => {
  // first check for browser/os variables
  // Check for dark mode preference at the OS level
  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
  if (prefersDarkScheme) {
    //document.body.classList.toggle("dark-mode");
  }

  // get booklist from server
  getBookList().then((data) => {
    // if data.books is empty, render the add books form
    // amd hide the view selectors
    if (data.books.length === 0) {
       renderAddBookForm();
       document.querySelector(".view-selectors").style.display = "none";
       console.log(document.querySelector(".view-selectors").style.display);
    } else {
       document.querySelector(".view-selectors").style.display = "";
    }
    
    BookList = data.books;
    renderBookList();
  });
});


/**
 * Renders the BookList using the current view
 */
function renderBookList() {
  // first if the booklist has already been rendered, delete it
  if (BOOKLIST_CONTAINER.hasChildNodes()) {
    BOOKLIST_CONTAINER.innerHTML = "";
  }

  // based on current list view (detailed view vs gallery view)
  // create a list of books using the received data
  if (CURRENT_VIEW === VIEW.list) {
    let listNode = createListNode(BookList);
    BOOKLIST_CONTAINER.appendChild(listNode);

    // add button-primary css class to list-view button, remove from the other
    document.getElementById("list-view").classList.add("button-primary");
    document.getElementById("gallery-view").classList.remove("button-primary");
  } else {
    let galleryNode = createGalleryNode(BookList);
    BOOKLIST_CONTAINER.appendChild(galleryNode);

    document.getElementById("gallery-view").classList.add("button-primary");
    document.getElementById("list-view").classList.remove("button-primary");
  }
}


/**
 * Returns an html table containing the booklist
 *
 * @param {Array} booklist The books to display on the table.
 * @return {HTMLElement} root The finished html table.
 */
// format:
// <table>
//   <thead>
//     <tr>1</tr>
//     ...
//   </thead>
//   <tbody>
//     <tr>a</tr>
//     ...
//   </tbody>
// </table>
function createListNode(bookList) {
  let root = document.createElement("table");
  root.classList.add("u-full-width");
  root.id = "booklist-table";
  root.style.marginBottom = "25px";
  root.alphanum = true; // toggle boolean for alphanum and reverse sorting

  // iterate over each book in the list
  // adding to the table headings when a unique 'key' is encountered
  let tableHeadings = []; // unique
  bookList.forEach((book) => {
    Object.entries(book).forEach(([key, value]) => {
      let keyCapitalized = key.charAt(0).toUpperCase() + key.slice(1);
      tableHeadings.find((elem) => elem === keyCapitalized) !== undefined
        ? ""
        : tableHeadings.push(keyCapitalized);
    });
  });

  // add table headings to table
  let thead = document.createElement("thead");
  let tr = document.createElement("tr");
  tableHeadings.forEach((header, idx) => {
    let th = document.createElement("th");
    th.textContent = header;
    th.id = idx; // is used to select column to sort
    th.addEventListener("click", () => {
      sortTable(root.id, idx);
    });
    tr.appendChild(th);
  });
  thead.appendChild(tr);
  root.appendChild(thead);

  // add table datum to table
  // 1 row per book (bookList.length)
  let tbody = document.createElement("tbody");
  // create a tr, populate it, then append it to tbody
  bookList.forEach((book) => {
    let tr = document.createElement("tr");
    Object.entries(book).forEach(([key, value]) => {
      let td = document.createElement("td");
      td.textContent = value;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  root.appendChild(tbody);
  return root;
}


/**
 * Returns an html div containing bookcover images
 *
 * @param {Array} booklist The books to display bookcovers of.
 * @return {HTMLElement} root The final div, with id gallery.
 */
// format
// <div id="booklist-gallery">
//    <img src="http://covers.openlibrary.org/b/isbn/9780385533225-S.jpg">
//    ...
// </div>
function createGalleryNode(booklist) {
  let root = document.createElement("div");
  root.id = "gallery";
  booklist.forEach((book) => {
    // TODO: In server.js, upon getting an addbook request,
    // update the data using openlibrary api OR eventually
    // update the data on serverside BEFORE the user submits
    //
    // GET request to openlibrary api (https://openlibrary.org/dev/docs/api/books)
    // ex: https://openlibrary.org/api/books?bibkeys=ISBN:0451526538
    // then get thumbnail_url from response
    let cover = document.createElement("img");
    // OLD method
    // cover.src = `http://covers.openlibrary.org/b/isbn/${book.isbn10}-M.jpg`;
    cover.src = book.coverurl;
    root.appendChild(cover);
  });

  return root;
}


/**
 * Sorts a table by column heading (title, author, etc)
 *
 * @param {string} tableid The id of the table to be sorted.
 * @param {number} column The column heading to sort by, starting from 0 or the leftmost column.
 * @return {number} 1 for success, 0 for failure.
 */
function sortTable(tableid = "booklist-id", column = 0) {
  let table = document.getElementById(tableid);

  if (table === undefined || table === null) {
    return 0;
  }

  // Get rows from the table into an Array
  let tbody = table.getElementsByTagName("tbody")[0];
  let rows = Array.from(tbody.getElementsByTagName("tr"));

  // Sort rows, toggle between alphanum and reverse
  table.alphanum = !table.alphanum;
  let sortedRows = [];
  sortedRows = rows.sort((a, b) => {
    let colA = a.getElementsByTagName("td")[column];
    let colB = b.getElementsByTagName("td")[column];
    return table.alphanum
      ? colA.textContent > colB.textContent
      : colA.textContent < colB.textContent;
  });

  // Append sortedRows to table's tbody
  tbody.innerHTML = "";
  sortedRows.forEach((row) => {
    tbody.appendChild(row);
  });
  return 1;
}


document.getElementById("list-view").addEventListener("click", () => {
  CURRENT_VIEW = VIEW.list;
  renderBookList();
});

document.getElementById("gallery-view").addEventListener("click", () => {
  CURRENT_VIEW = VIEW.gallery;
  renderBookList();
});


/**
 * Populates and renders the add-book form
 *
 */
function renderAddBookForm() {
  // first hide the add book button and redisplay the formNode
  ADDBUTTON.style.display = "none";
  FORMNODE.style.display = "";

  // if FORMNODE has class of "rendered", then do nothing
  if (FORMNODE.classList.contains("rendered")) {
    return;
  }

  // otherwise add form elements to the formNode
  let rootNode = document.createElement("div");
  rootNode.classList.add("row");

  // form header
  let headerDiv = document.createElement("div");
  headerDiv.classList.add("u-full-width");
  let header = document.createElement("h5");
  header.textContent = "Add a book:";
  headerDiv.appendChild(header);
  rootNode.appendChild(headerDiv);

  // text inputs (author, title, etc)
  // TODO: For missing categories, fill in by searching through public book apis

  // book title input
  // EX: <label for="exampleEmailInput">Your email</label>
  //     <input class="u-full-width" type="email" placeholder="test@mailbox.com" id="exampleEmailInput">
  let titleLabel = document.createElement("label");
  titleLabel.textContent = "Title:";
  titleLabel.setAttribute("for", "titleInput");
  let titleInput = document.createElement("input");
  titleInput.classList.add("u-full-width");
  titleInput.setAttribute("type", "text");
  titleInput.setAttribute("placeholder", "Lorem Ipsum");
  titleInput.setAttribute("id", "titleInput");
  titleInput.setAttribute("name", "titleInput");
  rootNode.appendChild(titleLabel);
  rootNode.appendChild(titleInput);

  // book author input
  let authorLabel = document.createElement("label");
  authorLabel.textContent = "Author:";
  authorLabel.setAttribute("for", "authorInput");
  let authorInput = document.createElement("input");
  authorInput.classList.add("u-full-width");
  authorInput.setAttribute("type", "text");
  authorInput.setAttribute("placeholder", "Lorem Ipsum");
  authorInput.setAttribute("id", "authorInput");
  authorInput.setAttribute("name", "authorInput");
  rootNode.appendChild(authorLabel);
  rootNode.appendChild(authorInput);

  // book isbn input
  let isbnLabel = document.createElement("label");
  isbnLabel.textContent = "ISBN (10 or 13 digits):";
  isbnLabel.setAttribute("for", "isbnInput");
  let isbnInput = document.createElement("input");
  isbnInput.classList.add("u-full-width");
  isbnInput.setAttribute("type", "number");
  isbnInput.setAttribute("placeholder", "1234567891234");
  isbnInput.setAttribute("id", "isbnInput");
  isbnInput.setAttribute("name", "isbnInput");
  isbnInput.required = true;
  rootNode.appendChild(isbnLabel);
  rootNode.appendChild(isbnInput);

  // submit and cancel buttons
  let submitButton = document.createElement("button");
  submitButton.id = "submitButton";
  submitButton.textContent = "Submit";
  rootNode.appendChild(submitButton);

  let cancelButton = document.createElement("button");
  cancelButton.id = "cancelButton";
  cancelButton.textContent = "Cancel";
  cancelButton.addEventListener("click", () => {
    // hide the formNode and redisplay the add books form
    FORMNODE.style.display = "none";
    ADDBUTTON.style.display = "";
  });
  rootNode.appendChild(cancelButton);

  FORMNODE.appendChild(rootNode);
  FORMNODE.classList.add("rendered");
}


// Populates a form to add a book to the library
ADDBUTTON.addEventListener("click", () => {
  renderAddBookForm();
});

/**
 * Handles pressing the submit button in the add books form
 *
 * @return {number} 1 for success, 0 for failure.
 */
/*document.addEventListener("submit", (event) => {
  // Prevent form from submitting to the server
  event.preventDefault();

  // first, hide the form node and redisplay the add book button
  FORMNODE.style.display = "none";
  ADDBUTTON.style.display = "";

  // extract data from inputs
  let data = {
    title: document.getElementById("titleInput").value,
    author: document.getElementById("authorInput").value,
    isbn: document.getElementById("isbnInput").value,
  };

  // POST json data using a new XMLHttpRequest object
  let xhr = new XMLHttpRequest();
  xhr.open("POST", POSTBOOK);
  xhr.setRequestHeader("Content-type", "application/json; charset=utf-8");
  xhr.send(JSON.stringify(data));
  xhr.onload = function () {
    if (xhr.status != 200) {
      // analyze HTTP status of the response
      alert(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found
    } else {
      // show the result
      alert(`Done, got ${xhr.response.length} bytes`); // response is the server response
      console.log(xhr.response);
    }
  };
});
*/
console.log("app.js loaded!");
