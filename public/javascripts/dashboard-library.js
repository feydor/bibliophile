/* dashboard-library.js ~ CRUD requests, form creation, table button functionality */
(function() {
  "use strict";

  // constants
  const GETBOOKS = "http://localhost:3000/books";
  const POSTBOOK = "http://localhost:3000/books";
  const DOMAIN = "http://localhost:3000/";
  const BOOKLIST_CONTAINER = document.getElementById("booklist-container");
  const RECCS_CONTAINER = document.getElementById("reccs-container");
  const FORMNODE = document.getElementById("add-book-form");
  const ADDBUTTON = document.getElementById("add-book-button");
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

  /* Main entrypoint
   * Assigns a click listener for each #libraryTabNav tab
   * to run fetchSelectedResource(id) as the handler
   */
  window.addEventListener("load", () => {
    // first check for browser/os variables
    // Check for dark mode preference at the OS level
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
    if (prefersDarkScheme) {
      // document.body.classList.toggle("dark-mode");
    }

    // get the id of the currently active tab
    const currentTabId = document.querySelector("#libraryTabNav .active").id;
    console.log(currentTabId);
    fetchSelectedResource(currentTabId);

    // assign a click listener to each tab, to run fetchSelectedResource
    [].slice
      .call(document.querySelectorAll("#libraryTabNav .nav-link"))
      .forEach((tablink) => {
        const tabid = tablink.id;
        tablink.addEventListener("click", () => {
          fetchSelectedResource(tabid);
        });
      });
  });

  /**
   * a click event handler for the #libraryTabNav tabs
   * Depending on the tabid, 1 of 3 things is done:
   *   1. Fetch the booklist and render it,
   *   2. Fetch user statistics and render them in a chart,
   *   3. Fetch the user's reccomended book list
   *
   *   @param {String} tabid - the HTML id of the clicked tab
   */
  function fetchSelectedResource(tabid) {
    console.assert(
      typeof tabid === "string",
      "argument 'tabid' must be a string"
    );

    switch (tabid) {
      case "libraryTabs1":
        // if cached, skip fetch
        // else fetch
        if (BookList.length > 0) {
          // BookList is already loaded, render BookList
          document.getElementById("bookListCard").style.display = "";
          document.querySelector(".view-selectors").style.display = "";
          renderBookList();
        } else {
          getBookList().then((data) => {
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

        break;

      case "libraryTabs2":
        console.log("libraryTabs2 not implemented in js");
        break;

      case "libraryTabs3":
        const fetchReccs = async () => {
          const response = await fetch(`http://localhost:3000/reccs`);
          return response.json();
        };

        fetchReccs().then((reccs) => {
          console.log(reccs);
          const reccsTable = createReccsTable(reccs);
          removeAllChildNodes(RECCS_CONTAINER);
          RECCS_CONTAINER.appendChild(reccsTable);
        });
        break;

      default:
        console.log("wrong tab id");
        break;
    }
  }

  /**
   * Renders the BookList using the current view
   */
  function renderBookList() {
    // first if the booklist has already been rendered, delete it
    if (BOOKLIST_CONTAINER.hasChildNodes()) {
      removeAllChildNodes(BOOKLIST_CONTAINER)
    }

    // based on current list view (detailed view vs gallery view)
    // create a list of books using the received data
    if (CURRENT_VIEW === VIEW.list) {
      const listNode = createListNode(BookList);
      BOOKLIST_CONTAINER.appendChild(listNode);

      // Render DataTable
      try {
        Table = $("#dataTable").DataTable({
          paging: false,
          ordering: false,
          info: false,
          searching: false,
          scrollCollapse: true,
          scrollx: false,
        });
      } catch (error) {
        // supress errors
        //console.error(error);
      }

      // add button-primary css class to list-view button, remove from the other
      document.getElementById("list-view").classList.add("button-primary");
      document
        .getElementById("gallery-view")
        .classList.remove("button-primary");
    } else {
      const galleryNode = createGalleryNode(BookList);
      BOOKLIST_CONTAINER.appendChild(galleryNode);

      document.getElementById("gallery-view").classList.add("button-primary");
      document.getElementById("list-view").classList.remove("button-primary");
    }
  }

  /**
   * Renders the given reccs list
   * @param {Object} reccs - an object containing one 'reccs' filed which is an array
   * @return {HTMLElement} root - an html table
   * @example
   *   ul.list-group
   *     li.list-group-item
   *       div.d-flex
   *         img.reccs-cover
   *         detailsDiv.flex-column
   *           title
   *           author
   *           subjects
   *         buttonDiv.flex-column
   *           infoButton
   *           AddButton
   */
  function createReccsTable(reccs) {
    console.assert(Array.isArray(reccs["reccs"]) === true,
      "argument 'reccs' must be an array");

    let root = document.createElement("ul");
    root.classList.add("list-group");

    reccs["reccs"].forEach((recc) => {
      let li = document.createElement("li");
      li.classList.add("list-group-item");

      let div = document.createElement("div");
      div.classList.add("d-flex", "justify-content-around");

      let cover = document.createElement("img");
      cover.classList.add("reccs-cover");
      cover.setAttribute("src", recc.coverurl);
      cover.setAttribute("width", "100%");
      div.appendChild(cover);

      let detailsDiv = document.createElement("div");
      detailsDiv.classList.add("d-flex", "flex-column");

      let title = document.createElement("h3");
      title.classList.add("mb-1");
      let titleLink = document.createElement("a");
      titleLink.setAttribute("href", `http://openlibrary.org${recc.key}`);
      titleLink.textContent = recc.title;
      title.appendChild(titleLink);
      detailsDiv.appendChild(title);

      let author = document.createElement("h4");
      author.classList.add("mb-1");
      let authorLink = document.createElement("a");
      authorLink.setAttribute(
        "href",
        `http://openlibrary.org${recc.author.key}`
      );
      authorLink.textContent = recc.author.name;
      author.appendChild(authorLink);
      detailsDiv.appendChild(author);

      let subjectsList = document.createElement("ul");
      const maxSubjects = 3;
      for (let i = 0; i < maxSubjects; ++i) {
        let subject = recc.subject[i];
        if (subject === null || subject === undefined) break;
        let li = document.createElement("li");
        let link = document.createElement("a");
        link.setAttribute(
          "href",
          `https://openlibrary.org/subjects/${subject}`
        );
        link.textContent = subject;
        li.appendChild(link);
        subjectsList.appendChild(li);
      }
      detailsDiv.appendChild(subjectsList);
      div.appendChild(detailsDiv);

      let btnDiv = document.createElement("div");
      btnDiv.classList.add("d-flex", "flex-column");

      let infoBtn = document.createElement("a");
      infoBtn.classList.add("btn", "btn-primary", "mb-1");
      infoBtn.setAttribute("role", "button");
      infoBtn.setAttribute("href", `https://openlibrary.org${recc.works_key}`);
      infoBtn.textContent = "Info/Buy";
      btnDiv.appendChild(infoBtn);

      let form = document.createElement("form");

      let addBtn = document.createElement("a");
      addBtn.classList.add("btn", "btn-light");
      addBtn.setAttribute("role", "button");
      addBtn.setAttribute("href", "#");
      addBtn.textContent = "Add To List";
      addBtn.addEventListener("click", async (event) => {
        event.preventDefault();

        console.log("form submit");

        let postResponse = await fetch(`${DOMAIN}books/${recc.key}`, {
          method: "POST",
        });

        let responseJson = await postResponse.json();

        console.log(responseJson);
        if (responseJson.status !== 200) {
          console.error(responseJson.status);
        }

        window.location.href = DOMAIN + "dashboard";
      });
      form.appendChild(addBtn);
      btnDiv.appendChild(form);
      div.appendChild(btnDiv);

      li.appendChild(div);
      root.appendChild(li);
    });

    return root;
  }

  /**
   * Returns an html table containing the booklist
   *
   * @param {Array} booklist - The books to display on the table.
   * @return {HTMLElement} root - The finished html table.
   * format:
   * <table>
   *   <thead>
   *     <tr>1</tr>
   *     ...
   *   </thead>
   *   <tbody>
   *     <tr id="book1">a</tr>
   *     ...
   *   </tbody>
   * </table>
   */
  function createListNode(bookList) {
    console.assert(
      Array.isArray(bookList),
      "argument 'bookList' should be an array"
    );

    let root = document.createElement("table");
    root.classList.add("u-full-width", "table-hover");
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
      tableHeadings = [
        "Title",
        "Author",
        "Publisher",
        "Published Date",
        "Subject",
      ];
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
    bookList.forEach((book) => {
      let tr = document.createElement("tr");
      tr.id = "book" + book.id;
      Object.entries(book).forEach(([key, value]) => {
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
      editButton.classList.add("btn", "btn-sm", "btn-success", "extra-info-btn");
      editButton.style.fontSize = "1.5rem"
      editButton.addEventListener("click", () => {
        let editButtonRow = tr.lastChild;
        let newRow = Table.row(tr);

        if (newRow.child.isShown()) {
          // This row is already open - close it
          newRow.child.hide();
          editButtonRow.classList.toggle("shown");
          editButtonRow.classList.remove("shown");
          // show plus icon
          editButton.innerHTML = "";
          let plusicon = document.createElement("i");
          plusicon.classList.add("bi", "bi-arrow-bar-down");
          editButton.appendChild(plusicon);
          editButton.classList.remove("btn-danger");
          editButton.classList.add("btn-success");
        } else {
          // Open this row
          newRow.child(format(book)).show(); // add extra info here
          editButtonRow.classList.add("shown");
          // show minus icon
          editButton.innerHTML = "";
          let minusicon = document.createElement("i");
          minusicon.classList.add("bi", "bi-arrow-bar-up");
          editButton.appendChild(minusicon);
          editButton.classList.remove("btn-success");
          editButton.classList.add("btn-danger");
        }
      });
      let plusicon = document.createElement("i");
      plusicon.classList.add("bi", "bi-arrow-bar-down");
      editButton.appendChild(plusicon);
      td.appendChild(editButton);
      tr.appendChild(td);

      tbody.appendChild(tr);
    });

    root.appendChild(tbody);
    return root;
  }

  /* Formatting function for row details section
   * @param {Object} d - an object that must contain a 'coverurl' field and may have
   * the following optional fields (title, author, subject, publisher, publishdate, isbn)
   */
  function format(d) {
    console.assert(
      typeof d.coverurl === "string",
      "argument 'd.coverurl' should be a string"
    );

    return `<div class="container extra-info-row"> 
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
          </div>`;
  }

  /**
   * Returns an html div containing bookcover images
   *
   * @param {Array} booklist The books to display bookcovers of.
   * @return {HTMLElement} root The final div, with id gallery.
   * format:
   * <div id="booklist-gallery">
   *   <img src="http://covers.openlibrary.org/b/isbn/9780385533225-S.jpg">
   *   ...
   * </div>
   */
  function createGalleryNode(booklist) {
    console.assert(
      Array.isArray(booklist),
      "argument 'bookList' should be an array"
    );

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
   * @return {number} 1 for success, 0 for failure (table may be null or undefined).
   */
  function sortTable(tableid = "booklist-id", column = 0) {
    const table = document.getElementById(tableid);

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
    removeAllChildNodes(tbody);
    tbody.innerHTML = "";
    sortedRows.forEach((row) => {
      tbody.appendChild(row);
    });
    return 1;
  }

  /**
   * click event listener to render Library list-view
   */
  document.getElementById("list-view").addEventListener("click", () => {
    CURRENT_VIEW = VIEW.list;
    renderBookList();
  });

  /**
   * click event listener to render Library gallery-view
   */
  document.getElementById("gallery-view").addEventListener("click", () => {
    CURRENT_VIEW = VIEW.gallery;
    renderBookList();
  });

  /**
   * removes all child nodes,
   * if there are none, nothing happens
   * @param {HTMLElement} parent 
   */
  function removeAllChildNodes(parent) {
    while (parent.firstChild) {
          parent.removeChild(parent.firstChild);
      }
  }

  /**
   * Populates and renders the add-book form
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
    isbnInput.setAttribute("pattern", "[0-9]*");
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
    rootNode.appendChild(isbnGroup);

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
    window.scrollBy(0, 336);
  });

  /**
   * Handles pressing the submit button in the add books form
   */
  FORMNODE.addEventListener("submit", (event) => {
    // Prevent form from submitting to the server
    event.preventDefault();

    // first, hide the form node and redisplay the add book button
    FORMNODE.style.display = "none";
    ADDBUTTON.style.display = "";

    // extract data from inputs
    const data = {
      title: document.getElementById("titleInput").value,
      author: document.getElementById("authorInput").value,
      isbn: document.getElementById("isbnInput").value,
    };

    // POST json data using a new XMLHttpRequest object
    const xhr = new XMLHttpRequest();
    xhr.open("POST", POSTBOOK);
    xhr.setRequestHeader("Content-type", "application/json; charset=utf-8");
    xhr.send(JSON.stringify(data));
    xhr.onload = function () {
      // show the result
      console.log(`Done, got ${xhr.response.length} bytes`); // response is the server response
      console.log(xhr.response);
      window.location.href = DOMAIN + "dashboard";
    };
  });

  /**
   * @description triggers tab changing between tabs in ul with id #libraryTabNav
   *
   */
  window.addEventListener("load", () => {
    var triggerTabList = [].slice.call(
      document.querySelectorAll("#libraryTabNav a")
    );
    triggerTabList.forEach(function (triggerEl) {
      const tabTrigger = new bootstrap.Tab(triggerEl);

      triggerEl.addEventListener("click", function (event) {
        event.preventDefault();
        tabTrigger.show();
      });
    });
  });

  console.log("app.js loaded!");
})();
