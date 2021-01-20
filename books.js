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
// Assumes ./auth.js/addUser middleware is ran before this endpoint (done in ./app.js)
// returns an array of all book objects for the current user
router.get("/", (req, res) => {
  if (!req.user) {
    throw console.error("addUser middleware not running");
  }
  
  let books = [];
  let query = `SELECT * FROM books INNER JOIN library ON books.id = library.bookid
              INNER JOIN users ON users.id = library.userid WHERE users.username = ?;`;
  dbcon.execute(query, [req.user.profile.login],
  function(err, results, fields) {
    if (err) throw console.error(err);
    // results contains rows returned by server
    //console.log(results);
    // fields contains extra meta data about results, if available
    //console.log(fields);
    
    // TODO: populate books array with book objects with variable properties
    // For now, only return title, author, subject, publisher, date
    books = results.map((row) => {
      return {
        title: row.title,
        author: row.author,
        subject: row.subject,
        coverurl: row.coverurl
      };
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
  if (!req.user) {
    throw console.error("addUser middleware not running");
  }
  
  //console.log(req.body);

  // Parse req.body
  let book = {
    title: req.body.titleInput,
    author: req.body.authorInput,
    isbn: req.body.isbnInput,
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
        //console.log(Object.entries(books).length);

        // fill in the remaining book fields using openlibrary api call
        if (Object.entries(books).length !== 0) {
          // Add coverurl from OpenLibrary API call
          if (books[`ISBN:${book.isbn}`]["cover"]) {
            book.coverurl = books[`ISBN:${book.isbn}`]["cover"]["medium"];
          }
          //console.log(book.coverurl ? book.coverurl : "no cover found");

          // Add subject, publisher, etc
          // (subjects and publishers are arrays in api data, use first one)
          if (books[`ISBN:${book.isbn}`]["subjects"]) {
            book.subject = books[`ISBN:${book.isbn}`]["subjects"][0]["name"];
          }
          book.publisher = books[`ISBN:${book.isbn}`]["publishers"][0]["name"];
          book.publish_date = books[`ISBN:${book.isbn}`]["publish_date"];

          // if new book,
          //   store it in library.books,
          //   get the new book's id,
          //   add the bookid and user id to a row in library.library
          // else if pre-exisitng book,
          //   get the book's id,
          //   then store userid and bookid relation in library.library 
          console.log("req.userid=");
          console.log(req.userid);
          //var bookid = undefined;

          // insert new book, assumes book already exists
          // TODO: change to async
          dbcon.execute(
            `INSERT INTO books(title, author, isbn, publisher, publish_date,
     subject, coverurl) VALUES(?, ?, ?, ?, ?, ?, ?)`,
            [
              book.title,
              book.author,
              book.isbn,
              book.publisher,
              book.publish_date,
              book.subject,
              book.coverurl,
            ], 
            function(err, results) {
              if (err) return console.error(err);

              // get bookid
              console.log(results);
              let bookid = results.insertId;
              
              // add to library
              dbcon.execute(
                `INSERT INTO library (userid, bookid) VALUE(?, ?)`,
                [ req.userid, bookid ],
                function(err, results) {
                  if (err) return console.error(err);
                  // results contains rows returned by server
                  console.log(results);
                  // fields contains extra meta data about results, if available
                }
              );
            }
          );

          /*
           if (!bookExists(book.isbn)) {
            insertBook(book);
            
            // TODO: Use await/async as syntatic sugar
            const [rows, fields] = await dbcon.execute(`SELECT id FROM books 
            WHERE books.isbn =`, [ book.isbn ]);
            bookid = rows[0].id;
            console.log("bookid:");
            console.log(bookid);
            
            updateLibrary(req.userid, bookid)   
          } else {
            bookid = getBookId(book.title);
            updateLibrary(req.userid, bookid);
          }
          */

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

    res.send({ status: 400, statusTxt: "Not a valid isbn." });
  }
});


// Query functions
// searches library.books for matching isbn
// returns TRUE if found
let bookExists = (isbn) => {
  dbcon.execute(`SELECT id FROM books WHERE books.isbn = ?`,
    [ isbn ],
    function(err, results) {
      if (err) return console.error(err);
      
      return results.length > 0 ? true : false;
    });            
};

// returns the bookid for the book in library.book that matches the isbn param
// if the book doesn't exist, it returns 0
let getBookId = (title) => {
  dbcon.execute(`SELECT id FROM books WHERE books.title = ?`,
    [ title ],
    function(err, results) {
      if (err) return console.error(err);

      if (results.length > 0) {
        return results[0].id;
      } else {
        return 0;
      }
    }
  );
};

// inserts the book into library.books
let insertBook = (book) => {
  dbcon.execute(
    `INSERT INTO books(title, author, isbn, publisher, publish_date,
     subject, coverurl) VALUES(?, ?, ?, ?, ?, ?, ?)`,
    [
      book.title,
      book.author,
      book.isbn,
      book.publisher,
      book.publish_date,
      book.subject,
      book.coverurl,
    ],
    function(err, results) {
      if (err) return console.error(err);
      // results contains rows returned by server
      console.log(results);
      // fields contains extra meta data about results, if available
    }
  );
};

// inserts an entry into library.library containing a userid paired with a bookid
let updateLibrary = (userid, bookid) => {
  dbcon.execute(
    `INSERT INTO library (userid, bookid)
     VALUE(?, ?)`,
    [ userid, bookid ],
    function(err, results) {
      if (err) return console.error(err);
      // results contains rows returned by server
      console.log(results);
      // fields contains extra meta data about results, if available
    }
  );
};

module.exports = router;
