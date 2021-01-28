const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

// import custom db module
const db = require("./db");   

// Ideas for possible middlewares
// 1. Check for OpenLibrary API book and pass it down as Book

// GET endpoints
/////////////////////

// GET /books
// Assumes ./auth.js/addUser middleware is ran before this endpoint (done in ./app.js)
// returns an array of all book objects for the current user
router.get("/", async (req, res) => {
  if (!req.user) {
    throw console.error("addUser middleware not running");
  }
  
  let books = [];
  books = await getUserBooks(req.user.profile.login);
  console.log('GET /books: ', books);
  
  // pass hasBooks bool to html rendering engine (pugjs)
  //res.locals.hasBooks = books.length > 0 ? true : false;

  return res.send({
    books: books,
    status: 200,
    statusTxt: "OK",
  });
});

// Returns an array of book objects from library.books matching the given username
const getUserBooks = async (username) => {
  let query = `SELECT * FROM books INNER JOIN library ON books.id = library.bookid
              INNER JOIN users ON users.id = library.userid WHERE users.username = ?;`;
  const [ rows ] = await db.execute(query, [ username ]);
  return rows.map((row) => {
    return {
      id: row.bookid,
      title: row.title,
      author: row.author,
      publisher: row.publisher,
      publishdate: row.publish_date,
      isbn: row.isbn,
      subject: row.subject,
      coverurl: row.coverurl
    };
  });
};


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
router.post("/", async function (req, res) {
  if (!req.user) {
    throw console.error("addUser middleware not running");
  }

  console.log(req.body);

  // Parse req.body
  let book = {
    title: req.body.title,
    author: req.body.author,
    isbn: req.body.isbn,
    subject: null,
    publisher: null,
    publish_date: null,
    coverurl: null,
  };

  // OpenLibrary API using isbn OR title/author
  // EX: https://openlibrary.org/api/books?bibkeys=ISBN:9780140047486&jsmd=data&format=json
  // isbn should be a string
  let isValidIsbn = (isbn) => {
    if (parseInt(isbn)) {
      if (isbn.length === 10 || isbn.length === 13) {
        return true;
      }  
    }

    return false;
  };

  if (!isValidIsbn(book.isbn)) {
    // TODO: not valid isbn, use author/title instead?
    console.error(`ISBN not valid, ISBN:${book.isbn}`);
    console.log(isValidIsbn(book.isbn));
    return res.send({ status: 400, statusTxt: "Not a valid isbn." });
  }

  const fetchOLApi = async () => {
    const response = await fetch(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${book.isbn}&jscmd=data&format=json`
    );

    if (!response.ok) {
      const message = `An error has occured: ${response.status}`; 
      throw new Error(message);
    }

    const apibooks = await response.json();
    return apibooks;
  };

  var apibooks;
  try {
    apibooks = await fetchOLApi();
  } catch(error) {
    console.error(error);
  }

  // first check if apiBooks is not empty
  // then using the apiBook from OpenLibrary, fill in the null book fields
  if (Object.entries(apibooks).length === 0) {
    // TODO: not in OpenLibrary API, return error?
    console.error(`Book NOT found, ISBN:${book.isbn}`);
    return res.send({ status: 400, statusTxt: "Book does not exist." });
  }

  // if title and/author were not provided in body, use OL api 
  if (book.title.length === 0 || book.author.length === 0) {
    if (apibooks[`ISBN:${book.isbn}`]["title"]) {
      book.title = apibooks[`ISBN:${book.isbn}`]["title"];
    }
    
    if (apibooks[`ISBN:${book.isbn}`]["authors"]) {
      book.author = apibooks[`ISBN:${book.isbn}`]["authors"][0]["name"];
    }
  }

  // If it exists, add coverurl from api call
  if (apibooks[`ISBN:${book.isbn}`]["cover"]) {
    book.coverurl = apibooks[`ISBN:${book.isbn}`]["cover"]["medium"];
  }
  // If it exists, add subject, publisher, etc
  // (subjects and publishers are arrays in api data, use the first one)
  if (apibooks[`ISBN:${book.isbn}`]["subjects"]) {
    book.subject = apibooks[`ISBN:${book.isbn}`]["subjects"][0]["name"];
  }
  if (apibooks[`ISBN:${book.isbn}`]["publishers"]) {
    book.publisher = apibooks[`ISBN:${book.isbn}`]["publishers"][0]["name"];
  }
  if (apibooks[`ISBN:${book.isbn}`]["publish_date"]) {
    book.publish_date = apibooks[`ISBN:${book.isbn}`]["publish_date"];
  }

  // Storing the book:
  // if new book,
  //   store it in library.books,
  //   get the new book's id,
  //   add the bookid and user id to a row in library.library
  // else if pre-exisitng book,
  //   get the book's id,
  //   then store userid and bookid relation in library.library 
  console.log("req.userid=", req.userid);
  var bookid;
  let bookDoesExist = await bookExists(book.isbn);
  if (!bookDoesExist) {
    let insertedBook = await insertBook(book);
    if (!insertedBook) {
      console.error('Failed to insert book.');
    }
    
    bookid = await getBookId(book.isbn);
    console.log("bookid: ", bookid);

    let updatedLibrary = await updateLibrary(req.userid, bookid)   
    if (!updatedLibrary) {
      console.error('Failed to update library.');
    }
  } else {
    bookid = await getBookId(book.title);
    console.log("bookid: ", bookid);
    
    let updatedLibrary = await updateLibrary(req.userid, bookid)   
    if (!updatedLibrary) {
      console.error('Failed to update library.');
    }
  }
  
  return res.send({
    status: 200,
    statusTxt: "OK",
    book: book,
  });

});


// Query functions
// searches library.books for matching isbn
// returns TRUE if found
const bookExists = async (isbn) => {
  const [ rows ] = await db.execute(`SELECT title FROM books WHERE books.isbn = ?`,
    [ isbn ],);
  
  return rows && rows.length > 0 ? true : false;
};

// returns the bookid for the book in library.book that matches the isbn param
// if the book doesn't exist, it returns 0
const getBookId = async (isbn) => {
  const [ rows ] = await db.execute(`SELECT id FROM books WHERE books.isbn = ?`,
    [ isbn ],);

  return rows && rows.length > 0 ? rows[0].id : 0;
};

// inserts the book into library.books
const insertBook = async (book) => {
  const [ rows ] = await db.execute(
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
    ]);
    
  return rows && rows.affectedRows > 0 ? true : false;
};

// inserts an entry into library.library containing a userid paired with a bookid
const updateLibrary = async (userid, bookid) => {
  const [ rows ] = await db.execute(
    `INSERT INTO library (userid, bookid)
     VALUE(?, ?)`,
    [ userid, bookid ]);

  return rows && rows.affectedRows > 0 ? true : false;
};

module.exports = router;
