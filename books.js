const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

// import custom db module
const dbcon = require("./db");   

// Ideas for possible middlewares
// 1. Check for OpenLibrary API book and pass it down as Book

// GET endpoints
/////////////////////

// GET /books
// returns an array of all book objects
router.get("/", (req, res) => {
  let books = [];
  dbcon.query("SELECT * FROM books", (err, rows) => {
    if (err) throw err;

    //console.log("Data received from Db:");
    //console.log(rows);
    //console.log(rows.map(row => `${row.author} wrote ${row.title}.`));
    books = rows.map((row) => {
      // populate book object based on row's key and value
      let book = {};
      Object.entries(row).forEach(([key, value]) => {
        book[key] = value;
      });
      return book;
    });

    console.log(books);

    res.send({
      books: books,
      status: 200,
      statusTxt: "OK",
    });
  });
});


// POST endpoints
//////////////////////

// POST /books
// Accepts a book object of the form:
// book {
//     title: required
//     author: required
//     isbn: optional (can be 10 or 13 digit)
//     subject: optional
// }
//
// Then using the OpenLibrary API (see https://openlibrary.org/dev/docs/api/books)
// it adds and/or corrects the following items:
// book {
//      ...
//      coverurl: required
//      publisher: required
//      subject: required
//      publish_date: required
// }
//
// Finally an SQL entry is made
router.post("/", function (req, res) {
  // Parse req.body, instantiate var 'globals'
  let book = {
    title: req.body.title,
    author: req.body.author,
    isbn: req.body.isbn,
    subject: null,
    publisher: null,
    publish_date: null,
    coverurl: null,
  };

  // Validate required title and author
  if (!book.title || !book.author) {
    res.send({ status: 400, statusTxt: "Bad request." });
  }

  // OpenLibrary API using isbn OR title/author
  // EX: https://openlibrary.org/api/books?bibkeys=ISBN:9780140047486&jsmd=data&format=json
  let isValidIsbn = (isbn) => {
    let digits = Math.floor(Math.log10(isbn)) + 1;
    if (digits === 10 || digits === 13) {
      return true;
    }
    return false;
  };

  if (isValidIsbn(book.isbn)) {
    fetch(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${book.isbn}&jscmd=data&format=json`
    )
      .then((res) => res.json())
      .then((books) => {
        console.log(books);
        console.log(Object.entries(books).length);
        if (Object.entries(books).length !== 0) {
          // Add coverurl from OpenLibrary API call
          if (books[`ISBN:${book.isbn}`]["cover"]) {
            book.coverurl = books[`ISBN:${book.isbn}`]["cover"]["medium"];
          }
          console.log(book.coverurl ? book.coverurl : "no cover found");

          // Add subject, publisher, etc
          // (subjects and publishers are arrays in api data, use first one)
          if (books[`ISBN:${book.isbn}`]["subjects"]) {
            book.subject = books[`ISBN:${book.isbn}`]["subjects"][0]["name"];
          }
          book.publisher = books[`ISBN:${book.isbn}`]["publishers"][0]["name"];
          book.publish_date = books[`ISBN:${book.isbn}`]["publish_date"];

          // Store book as an SQL entry
          let insertBook = (book) => {
            dbcon.execute(
              "INSERT INTO books(title, author, isbn, publisher, publish_date, subject, coverurl) " /
                "VALUES(?, ?, ?, ?, ?, ?, ?)",
              [
                book.title,
                book.author,
                book.isbn,
                book.publisher,
                book.publish_date,
                book.subject,
                book.coverurl,
              ],
              function (err, results, fields) {
                if (err) return console.error(err);
                // results contains rows returned by server
                console.log(results);
                // fields contains extra meta data about results, if available
                console.log(fields);
              }
            );
          };

          insertBook(book);

          // Return status code 200
          res.send({
            status: 200,
            statusTxt: "OK",
            book: book,
          });
        } else {
          console.error(`Book NOT found, ISBN:${book.isbn}`);
        }
      });
  } else {
    // TODO: using author/title
    console.error(`Not valid isbn, ISBN:${book.isbn}`);
    console.log(isValidIsbn(book.isbn));
  }
});

module.exports = router;
