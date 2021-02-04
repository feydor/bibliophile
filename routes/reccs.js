/**
 * express.js endpoints for /reccs
 */
const express = require("express");
const router = express.Router();

// import custom db module
const db = require("../db");
const booksRouter = require("./books");

// GET endpoints
////////////////////////

/**
 * GET /reccs endpoint
 * @return {Array} an array of book objects
 * Assumes auth/addUser middleware is running
 *
 * Determines reccs by seeking new books with matching subjects
 */
router.get("/", async (req, res) => {
  if (!req.user) {
    throw console.error("addUser middleware not running.");
  }

  let books = [];
  books = await booksRouter.getUserBooks(req.user.profile.login);
  // console.log("GET /books: ", books);

  let subjects = books.map((book) => {
    return book.subject;
  });

  // example API call: https://openlibrary.org/subjects/love.json
  var apiResponse;
  const limit = 10; // api limit
  // TODO: for simplicity, the first !null subject is used
  let subjectChosen = subjects.find((subject) => subject !== null);
  // lowercase the string
  subjectChosen = subjectChosen[0].toLowerCase() + subjectChosen.slice(1);
  let url = `https://openlibrary.org/subjects/${subjectChosen}.json?limit=${limit}`;
  try {
    apiResponse = await fetchApi(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    throw console.error(error);
  }

  // For each new book (up to MAXNUM)
  // parse received objects into a new book
  // add to an array
  // and return
  if (apiResponse["work_count"] <= 0) {
    return res.send({ status: 400, statusTxt: "Not a valid subject." });
  }

  const MAXNUM = 5;
  let reccsList = [];
  for (let i = 0; i < MAXNUM; ++i) {
    let work = apiResponse["works"][i];
    let recc = parseApiWork(work);
    reccsList.push(recc);
  }

  // console.log(reccsList);

  return res.send({ reccs: reccsList, status: 200, statusTxt: "OK" });
});

// Helper functions
/////////////////////////////

/**
 * fetches json data from the url asynchronously
 * @param {String} url - the api's url
 * @param {Object} options - fetch api options
 * @return {Object} apiResponse - an object with the response
 */
const fetchApi = async (url, options) => {
  const response = await fetch(url, options);

  if (!response.ok) {
    const message = `An error has occured: ${response.status}`;
    throw new Error(message);
  }

  const apiResponse = await response.json();
  return apiResponse;
};

/**
 * an Array.prototype.filter analogue for Object
 * @param {Object} obj
 * @param {Function} predicate - the inclusion condition
 * @return {Array} res
 */
Object.filter = (obj, predicate) =>
  Object.keys(obj)
    .filter((key) => predicate(obj[key]))
    .reduce((res, key) => ((res[key] = obj[key]), res), {});

/**
 * parses an OpenLibrary work as defined by https://openlibrary.org/dev/docs/api/subjects
 * @param {Object} work - an api work
 * @returns {Object} book - a new object of the form:
 *   book {
 *     works_key: "/works/OL15100036W",
 *     key: "OL1428682M"
 *     title: "The Dialogues of Plato",
 *     author: {
 *       key: "/authors/OL189658A",
 *       name: "Plato"
 *     },
 *     subject: [
 *       "Philosophy",
 *       "Poetry",
 *       ...
 *     ],
 *     coverurl: "https://covers.openlibrary.org/b/id/8236248-L.jpg"
 *   }
 *
 */
const parseApiWork = (work) => {
  let book = {};
  let keys = [
    "key",
    "cover_edition_key",
    "authors",
    "title",
    "subject",
    "cover_id",
  ];

  keys.forEach((key) => {
    book[key] = work[key];
  });

  // Simplify the results
  book["works_key"] = book["key"];
  book["key"] = book["cover_edition_key"];
  book["author"] = book["authors"][0];
  book["authors"] = {};
  book[
    "coverurl"
  ] = `https://covers.openlibrary.org/b/id/${book["cover_id"]}-L.jpg`;

  return book;
};

module.exports = router;
