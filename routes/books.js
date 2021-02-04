/**
 * express.js endpoints for /books
 */
const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

// import custom db module
const db = require("../db");

// Ideas for possible middlewares
// 1. Check for OpenLibrary API book and pass it down as Book

// GET endpoints
/////////////////////

/**
 * GET /books endpoint
 * @return {Array} an array of all book objects for the current user
 * Assumes auth/addUser middleware is running
 */
router.get("/", async (req, res) => {
  if (!req.user) {
    throw console.error("addUser middleware not running.");
  }

  let books = [];
  books = await getUserBooks(req.user.profile.login);
  //console.log("GET /books: ", books);

  return res.send({
    books: books,
    status: 200,
    statusTxt: "OK",
  });
});

/**
 * Querys the db for matching book rows
 * @param {String} username - the user's login, ie req.user.profile.login (see auth/addUser)
 * @return {Array} an array of book objects
 */
const getUserBooks = async (username) => {
  let query = `SELECT * FROM books INNER JOIN library ON books.id = library.bookid
              INNER JOIN users ON users.id = library.userid WHERE users.username = ?;`;
  const [rows] = await db.execute(query, [username]);
  return rows.map((row) => {
    return {
      id: row.bookid,
      title: row.title,
      author: row.author,
      publisher: row.publisher,
      publishdate: row.publish_date,
      isbn: row.isbn,
      subject: row.subject,
      coverurl: row.coverurl,
    };
  });
};

// POST endpoints
//////////////////////

/**
 * POST /books endpoint
 * @param {Object} a book object of the form:
 *   book {
 *     title: required
 *     author: required
 *     isbn: optional (can be 10 or 13 digit)
 *     subject: optional
 *   }
 *
 *   Then using the OpenLibrary API (see https://openlibrary.org/dev/docs/api/books)
 *   it adds and/or corrects the following items:
 *   book {
 *     ...
 *     olid: required
 *     coverurl: required
 *     publisher: required
 *     subject: required
 *     publish_date: required
 *   }
 *
 *   Finally an SQL entry is made
 */
router.post("/", async function (req, res) {
  if (!req.user) {
    throw console.error("addUser middleware not running");
  }

  console.log("req.body: ", req.body);

  // Parse req.body
  let book = {
    title: req.body.title,
    author: req.body.author,
    isbn: req.body.isbn,
    olid: null,
    subject: null,
    publisher: null,
    publish_date: null,
    coverurl: null,
  };

  // OpenLibrary API using isbn OR title/author
  // EX: https://openlibrary.org/api/books?bibkeys=ISBN:9780140047486&jsmd=data&format=json
  // isbn should be a string
  if (!isValidIsbn(book.isbn)) {
    // TODO: not valid isbn, use author/title instead?
    console.error(`ISBN not valid, ISBN: ${book.isbn}`);
    return res.send({ status: 400, statusTxt: "Not a valid isbn." });
  }

  var apibooks;
  const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${book.isbn}&jscmd=data&format=json`;
  try {
    apibooks = await fetchApi(url);
  } catch (error) {
    console.error(error);
  }

  // first check if apiBooks is not empty
  // then using the apiBook from OpenLibrary, fill in the null book fields
  if (Object.entries(apibooks).length === 0) {
    // TODO: not in OpenLibrary API, return error?
    console.error(`Book NOT found, ISBN:${book.isbn}`);
    return res.send({ status: 400, statusTxt: "Book does not exist." });
  }

  // add the mising fields from the api call
  parseApiBookIsbn(book, apibooks);

  // Storing the book:
  // if new book,
  //   store it in library.books,
  //   get the new book's id,
  //   add the bookid and user id to a row in library.library
  // else if pre-exisitng book,
  //   get the book's id,
  //   then store userid and bookid relation in library.library
  console.log("req.userid=", req.userid);
  //storeBook(book, req.userid);

  var bookid;
  let bookDoesExist = await bookExists(book.isbn);
  if (!bookDoesExist) {
    let insertedBook = await insertBook(book);
    if (!insertedBook) {
      console.error("Failed to insert book.");
    }

    bookid = await getBookId(book.isbn);
    console.log("bookid: ", bookid);

    let updatedLibrary = await updateLibrary(req.userid, bookid);
    if (!updatedLibrary) {
      console.error("Failed to update library.");
    }
  } else {
    bookid = await getBookId(book.title);
    console.log("bookid: ", bookid);

    let updatedLibrary = await updateLibrary(req.userid, bookid);
    if (!updatedLibrary) {
      console.error("Failed to update library.");
    }
  }

  return res.send({
    status: 200,
    statusTxt: "OK",
    book: book,
  });
});

/**
 * POST /books/OLID:OLID
 * @example /books/OL151515W
 */
router.post("/:olid", async (req, res) => {
  const olid = req.params.olid;

  // get OL api book
  var apiResponse;
  const url = `https://openlibrary.org/api/books?bibkeys=OLID:${olid}&jscmd=data&format=json`;
  try {
    apiResponse = await fetchApi(url);
  } catch (error) {
    console.error(error);
  }

  // console.log(apiResponse);

  // Check for validity
  if (Object.entries(apiResponse).length === 0) {
    console.error(`Book NOT found, OLID:${olid}`);
    return res.send({ status: 400, statusTxt: "Book does not exist." });
  }

  // parse it into a book
  let book = {};
  parseApiBookOlid(book, apiResponse, olid);
  console.log(book);

  // store in db
  await storeBook(book, req.userid);

  return res.send({ status: 200, statusTxt: "OK", olid: olid });
});

// Helper functions
///////////////////////////

/**
 * querys an api
 * @param {String} url - the api's url
 * @return {Array}
 */
const fetchApi = async (url, options = {}) => {
  const response = await fetch(url, options);

  if (!response.ok) {
    const message = `An error has occured: ${response.status}`;
    throw new Error(message);
  }

  const apiJson = await response.json();
  return apiJson;
};

/**
 * Returns true if isbn is a valid isbn (10 or 13 digits)
 * @param {String} isbn - a possible isbn
 * @return {boolean}
 */
const isValidIsbn = (isbn) => {
  if (parseInt(isbn)) {
    if (isbn.length === 10 || isbn.length === 13) {
      return true;
    }
  }

  return false;
};

/**
 * fills the missing fields of a book with an api call, uses isbn
 * @param {Object} book - a pre-initialized book with missing fields
 * @param {Object} apibook - an OpenLibrary book object described by https://openlibrary.org/dev/docs/api/books
 */
const parseApiBookIsbn = (book, apibook) => {
  // if title and/author were not provided in body, use OL apiBook
  if (
    book.title === undefined ||
    book.title.length === 0 ||
    book.author === undefined ||
    book.author.length === 0
  ) {
    if (apibook[`ISBN:${book.isbn}`]["title"]) {
      book.title = apibook[`ISBN:${book.isbn}`]["title"];
    }

    if (apibook[`ISBN:${book.isbn}`]["authors"]) {
      book.author = apibook[`ISBN:${book.isbn}`]["authors"][0]["name"];
    }
  }

  // If it exists, add coverurl from OL api
  if (apibook[`ISBN:${book.isbn}`]["cover"]) {
    book.coverurl = apibook[`ISBN:${book.isbn}`]["cover"]["medium"];
  }

  // If it exists, add subject, publisher, etc
  // (subjects and publishers are arrays in api data, use the first one)
  if (apibook[`ISBN:${book.isbn}`]["subjects"]) {
    book.subject = apibook[`ISBN:${book.isbn}`]["subjects"][0]["name"];
  }
  if (apibook[`ISBN:${book.isbn}`]["publishers"]) {
    book.publisher = apibook[`ISBN:${book.isbn}`]["publishers"][0]["name"];
  }
  if (apibook[`ISBN:${book.isbn}`]["publish_date"]) {
    book.publish_date = apibook[`ISBN:${book.isbn}`]["publish_date"];
  }

  // If it exists, add olid from OL api
  if (apibook[`ISBN:${book.isbn}`]["identifiers"]["openlibrary"]) {
    book.olid = apibook[`ISBN:${book.isbn}`]["identifiers"]["openlibrary"];
  }
};

/**
 * fills the missing fields of a book with an api call, uses OLID
 * @param {Object} book - a pre-initialized book with missing fields
 * @param {Object} apibook - an OpenLibrary book object described by https://openlibrary.org/dev/docs/api/books
 */
const parseApiBookOlid = (book, apibook, olid) => {
  book.olid = olid;

  // if title and/author were not provided in body, use OL apiBook
  if (
    book.title === undefined ||
    book.title.length === 0 ||
    book.author === undefined ||
    book.author.length === 0
  ) {
    if (apibook[`OLID:${olid}`]["title"]) {
      book.title = apibook[`OLID:${olid}`]["title"];
    }

    if (apibook[`OLID:${olid}`]["authors"]) {
      book.author = apibook[`OLID:${olid}`]["authors"][0]["name"];
    }
  }

  // If it exists, add coverurl from OL api
  if (apibook[`OLID:${olid}`]["cover"]) {
    book.coverurl = apibook[`OLID:${olid}`]["cover"]["medium"];
  }

  // If it exists, add subject, publisher, etc
  // (subjects and publishers are arrays in api data, use the first one)
  if (apibook[`OLID:${olid}`]["subjects"]) {
    book.subject = apibook[`OLID:${olid}`]["subjects"][0]["name"];
  }
  if (apibook[`OLID:${olid}`]["publishers"]) {
    book.publisher = apibook[`OLID:${olid}`]["publishers"][0]["name"];
  }
  if (apibook[`OLID:${olid}`]["publish_date"]) {
    book.publish_date = apibook[`OLID:${olid}`]["publish_date"];
  }

  // check for isbn_10 and isbn_13, isbn_13 takes precedence
  if (apibook[`OLID:${olid}`]["identifiers"]["isbn_10"]) {
    book.isbn = apibook[`OLID:${olid}`]["identifiers"]["isbn_10"];
  }
  if (apibook[`OLID:${olid}`]["identifiers"]["isbn_13"]) {
    book.isbn = apibook[`OLID:${olid}`]["identifiers"]["isbn_13"];
  }

  // remove multiple isbns
  if (Array.isArray(book.isbn)) {
    book.isbn = book.isbn[0];
  }
};

/**
 * stores a book in db, modifying library.books and library.library
 * @param {Object} book
 * @param {String} userid
 */
const storeBook = async (book, userid) => {
  // Psuedo-code:
  //   Storing the book:
  //   if new book,
  //     store it in library.books,
  //     get the new book's id,
  //     add the bookid and userid to a row in library.library
  //   else if pre-exisitng book,
  //     get the book's id,
  //     then store bookid and userid relation in library.library
  var bookid;
  let bookDoesExist = await bookExists(book.olid);
  if (!bookDoesExist) {
    let insertedBook = await insertBook(book);
    if (!insertedBook) {
      console.error("Failed to insert book.");
    }

    bookid = await getBookId(book.olid);
    console.log("bookid: ", bookid);

    let updatedLibrary = await updateLibrary(userid, bookid);
    if (!updatedLibrary) {
      console.error("Failed to update library.");
    }
  } else {
    bookid = await getBookId(book.title);
    console.log("bookid: ", bookid);

    let updatedLibrary = await updateLibrary(userid, bookid);
    if (!updatedLibrary) {
      console.error("Failed to update library.");
    }
  }
};

// Query Functions
///////////////////////////

/**
 * searches library.books for matching OLID
 * @param {String} olid
 * @return {boolean} returns true if found
 */
const bookExists = async (olid) => {
  const [
    rows,
  ] = await db.execute(`SELECT title FROM books WHERE books.olid = ?`, [olid]);

  return rows && rows.length > 0 ? true : false;
};

/**
 * searches library.books for matching isbn and returns the matching book's id
 * @param {String} olid
 * @return {String} bookid - the id for the matching library.book
 * @return {bool} if the book doesn't exist it returns 0
 */
const getBookId = async (olid) => {
  const [rows] = await db.execute(`SELECT id FROM books WHERE books.olid = ?`, [
    olid,
  ]);

  return rows && rows.length > 0 ? rows[0].id : 0;
};

// inserts the book into library.books
const insertBook = async (book) => {
  const [rows] = await db.execute(
    `INSERT INTO books(title, author, olid, isbn, publisher, publish_date,
     subject, coverurl) VALUES(?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      book.title,
      book.author,
      book.olid,
      book.isbn,
      book.publisher,
      book.publish_date,
      book.subject,
      book.coverurl,
    ]
  );

  return rows && rows.affectedRows > 0 ? true : false;
};

// inserts an entry into library.library containing a userid paired with a bookid
const updateLibrary = async (userid, bookid) => {
  const [rows] = await db.execute(
    `INSERT INTO library (userid, bookid)
     VALUE(?, ?)`,
    [userid, bookid]
  );

  return rows && rows.affectedRows > 0 ? true : false;
};

module.exports = { router, getUserBooks };
