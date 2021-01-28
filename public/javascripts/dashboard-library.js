/* dashboard-library.js ~ CRUD requests, form creation, table button functionality */
"use strict";

// constants
const GETBOOKS = "http://localhost:3000/books";
const GETSAVED = "http://localhost:3000/saved";
const POSTBOOK = "http://localhost:3000/books";
const DOMAIN = "http://localhost:3000/";
const BOOKLIST_CONTAINER = document.getElementById("booklist-container");
const FORMNODE = document.getElementById("add-book-form");
const ADDBUTTON = document.getElementById("add-book-button");
const MAX_URL_LENGTH = 45;
const BREAKPOINT = 768;

// enumeration of all possible view states (for booklist)
const VIEW = {
  gallery: "gallery",
  list: "list",
};
Object.freeze(VIEW);

// State variables
let CURRENT_VIEW = VIEW.list;

// local cache array
let BookList = [];
let Table;

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

  if (BookList.length > 0) {
    // BookList is already loaded, render BookList
    document.getElementById("bookListCard").style.display = "";
    document.querySelector(".view-selectors").style.display = "";
    renderBookList();
  } else {
    // get BookList from server
    getBookList().then(data => {
      // if data.books is empty, render the add books form
      // and hide the view selectors and #bookListCard
      if (data.books.length === 0) {
        renderAddBookForm();
        document.getElementById("bookListCard").style.display = "none";
        document.querySelector(".view-selectors").style.display = "none";
      } else {
        document.getElementById("bookListCard").style.display = "";
        document.querySelector(".view-selectors").style.display = "";
      }

      BookList = data.books;
      renderBookList();
    });
  }
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

    // Render DataTable
    try {
      Table = $('#dataTable').DataTable();
    } catch(error) {
      // supress errors
      //console.error(error);
    }
    
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
//     <tr id="book1">a</tr>
//     ...
//   </tbody>
// </table>
function createListNode(bookList) {
  let root = document.createElement("table");
  root.classList.add("u-full-width");
  root.id = "dataTable";
  root.style.marginBottom = "25px";
  root.alphanum = true; // toggle boolean for alphanum and reverse sorting

  // if window.innerWidth < 768px, then show less columns
  // else show normal columns
  let tableHeadings = [];
  let keysToRender = []; // get exact spelling from GET /books
  if (window.innerWidth < BREAKPOINT) {
    tableHeadings = ["Title", "Author", "Subject"];
    keysToRender = ["title", "author", "subject"];
  } else {
    tableHeadings = ["Title", "Author", "Publisher", "Published Date", "Subject"];
    keysToRender = ["title", "author", "publisher", "publishdate", "subject"];
  }
  tableHeadings.push(""); // extra heading for edit button column

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
  // dynamic data based on window.innerWidth
  // create a tr, populate it, then append it to tbody
  bookList.forEach(book => {
    let tr = document.createElement("tr");
    tr.id = "book" + book.id; 
    Object.entries(book).forEach(([key, value], idx) => {
      if (keysToRender.includes(key)) {
        let td = document.createElement("td");
        td.textContent = value;
        tr.appendChild(td);
      }
    });

    // after all data is added, add edit button
    let td = document.createElement("td");
    let editButton = document.createElement("button");
    editButton.id = "edit" + tr.id;
    editButton.classList.add("btn", "btn-sm", "btn-success");
    editButton.addEventListener("click", (event) => {
      let editButtonRow = tr.lastChild;
      let newRow = Table.row(tr);
      
      if ( newRow.child.isShown() ) {
        // This row is already open - close it
        newRow.child.hide();
        editButtonRow.classList.toggle("shown");
        editButtonRow.classList.remove("shown");
        // show plus icon
        editButton.innerHTML = "";
        let plusicon = document.createElement("i");
        plusicon.classList.add("fa", "fa-plus");
        editButton.appendChild(plusicon);
        editButton.classList.remove("btn-danger");
        editButton.classList.add("btn-success");
      }
      else {
        // Open this row
        newRow.child( format(book) ).show();
        editButtonRow.classList.add("shown");
        // show minus icon
        editButton.innerHTML = "";
        let minusicon = document.createElement("i");
        minusicon.classList.add("fa", "fa-minus");
        editButton.appendChild(minusicon);
        editButton.classList.remove("btn-success");
        editButton.classList.add("btn-danger");
      }
    });
    let plusicon = document.createElement("i");
    plusicon.classList.add("fa", "fa-plus");
    editButton.appendChild(plusicon);
    td.appendChild(editButton);
    tr.appendChild(td);

    tbody.appendChild(tr);
  });

  root.appendChild(tbody);
  return root;
}

/* Formatting function for row details section */
function format ( d ) {
  console.log(d);
  return `<div class="container-fluid extra-info-row"> 
            <img src=${d.coverurl} />
            <table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px">
              <tr>
                <td>Title:</td>
                <td>${d.title ? d.title : ""}</td>
              </tr>
              <tr>
                <td>Author:</td>
                <td>${d.author ? d.author : ""}</td>
              </tr>
              <tr>
                <td>Subject:</td>
                <td>${d.subject ? d.subject : ""}</td>
              </tr>
              <tr>
                <td>Publisher:</td>
                <td>${d.publisher ? d.publisher : ""}</td>
              </tr>
              <tr>
                <td>Published Date:</td>
                <td>${d.publishdate ? d.publishdate : ""}</td>
              </tr>
              <tr>
                <td>ISBN:</td>
                <td>${d.isbn ? d.isbn : ""}</td>
              </tr>
            </table>
        </div>`
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
    let card = document.createElement("div");
    card.classList.add("card", "shadow");

    let cover = document.createElement("img");
    cover.src = book.coverurl;
    
    card.appendChild(cover);
    root.appendChild(card);
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

  // form header
  let headerGroup = document.createElement("div");
  headerGroup.classList.add("form-group");
  let header = document.createElement("h5");
  header.textContent = "Add a book:";
  headerGroup.appendChild(header);
  rootNode.appendChild(headerGroup);

  /* Text inputs (author, title, etc)
   */
  // book title input
  // EX: <div class="form-group">
  //       <label for="exampleEmailInput">Your email</label>
  //       <input class="u-full-width" type="email" placeholder="test@mailbox.com" id="exampleEmailInput">
  //     </div>
  let titleGroup = document.createElement("div");
  titleGroup.classList.add("form-group");
  let titleLabel = document.createElement("label");
  titleLabel.textContent = "Title (optional):";
  titleLabel.setAttribute("for", "titleInput");
  let titleInput = document.createElement("input");
  titleInput.classList.add("form-control");
  titleInput.setAttribute("type", "text");
  titleInput.setAttribute("placeholder", "Enter title");
  titleInput.setAttribute("id", "titleInput");
  titleInput.setAttribute("name", "titleInput");
  titleGroup.appendChild(titleLabel);
  titleGroup.appendChild(titleInput);
  rootNode.appendChild(titleGroup);

  // book author input
  let authorGroup = document.createElement("div");
  authorGroup.classList.add("form-group");
  let authorLabel = document.createElement("label");
  authorLabel.textContent = "Author (optional):";
  authorLabel.setAttribute("for", "authorInput");
  let authorInput = document.createElement("input");
  authorInput.classList.add("form-control");
  authorInput.setAttribute("type", "text");
  authorInput.setAttribute("placeholder", "Enter author");
  authorInput.setAttribute("id", "authorInput");
  authorInput.setAttribute("name", "authorInput");
  authorGroup.appendChild(authorLabel);
  authorGroup.appendChild(authorInput);
  rootNode.appendChild(authorGroup);

  // book isbn input
  let isbnGroup = document.createElement("div");
  isbnGroup.classList.add("form-group");
  let isbnLabel = document.createElement("label");
  isbnLabel.textContent = "ISBN (10 or 13 digits):";
  isbnLabel.setAttribute("for", "isbnInput");
  let isbnInput = document.createElement("input");
  isbnInput.classList.add("form-control");
  isbnInput.setAttribute("type", "tel");
  isbnInput.setAttribute("pattern", "[0-9]*")
  isbnInput.setAttribute("placeholder", "Enter ISBN");
  isbnInput.setAttribute("id", "isbnInput");
  isbnInput.setAttribute("name", "isbnInput");
  isbnInput.required = true;
  // validate input as the user types (10 or 13 digit isbn)
  let timeout = null;
  isbnInput.addEventListener("input", () => {
    // throttle input checking for 1 second 
    // Clear the timeout if it has already been set.
    // This will prevent the previous task from executing
    // if it has been less than <MILLISECONDS>
    clearTimeout(timeout);

    // Make a new timeout set to go off in 1000ms (1 second)
    timeout = setTimeout(function () {
      let regex = /^([0-9]{10,13})$/g;
      let isbn = document.getElementById("isbnInput");

      if (regex.test(isbnInput.value)) {
        console.log("Valid isbn:", isbn.value);
        
        isbn.classList.remove(".invalid-input"); 
        document.getElementById("submitButton").disabled = "";
        return;
      } else {
        console.log("Invalid isbn:", isbn.value);
        isbn.classList.toggle(".invalid-input"); 
        
        // make submitButton unclickable
        document.getElementById("submitButton").disabled = "true";
        // show tooltip to ask user to input valid isbn 
        return;
      }
    }, 500);

    
  });
  isbnGroup.appendChild(isbnLabel);
  isbnGroup.appendChild(isbnInput);
  rootNode.appendChild(isbnGroup)

  // submit and cancel buttons
  let submitButton = document.createElement("button");
  submitButton.id = "submitButton";
  submitButton.classList.add("btn", "btn-primary");
  submitButton.setAttribute("type", "submit");
  submitButton.textContent = "Submit";
  rootNode.appendChild(submitButton);

  let cancelButton = document.createElement("button");
  cancelButton.id = "cancelButton";
  cancelButton.classList.add("btn", "btn-danger");
  cancelButton.setAttribute("type", "cancel");
  cancelButton.textContent = "Cancel";
  cancelButton.addEventListener("click", () => {
    // hide the formNode and redisplay the add books form
    FORMNODE.style.display = "none";
    ADDBUTTON.style.display = "";
  });
  rootNode.appendChild(cancelButton);
  
  // render invisible toolTip, to be shown by onchange even handlers
  let toolTip = document.createElement("div");
  toolTip.id = "toolTip";
  toolTip.display = "none";
  rootNode.appendChild(toolTip);

  FORMNODE.appendChild(rootNode);
  FORMNODE.classList.add("rendered");
}


// Populates a form to add a book to the library
ADDBUTTON.addEventListener("click", () => {
  renderAddBookForm();
  // scroll to form
  window.scrollBy(0,336);
});

/**
 * Handles pressing the submit button in the add books form
 *
 * @return {number} 1 for success, 0 for failure.
 */ 
FORMNODE.addEventListener("submit", (event) => {
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
    // show the result
    console.log(`Done, got ${xhr.response.length} bytes`); // response is the server response
    console.log(xhr.response);
    window.location.href = DOMAIN + 'dashboard';
  };
});

console.log("app.js loaded!");
