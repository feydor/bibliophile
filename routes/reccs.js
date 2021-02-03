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
  console.log("GET /books: ", books);

  let subjects = books.map((book) => {
    return book.subject;
  });
  console.log(subjects);

  // example API call: https://openlibrary.org/subjects/love.json
  var apiResponse;
  let subjectChosen = subjects[0]; // TODO: for simplicity, the subject of the first book is used
  let url = `https://openlibrary.org/subjects/${subjectChosen}.json`;
  try {
    apiResponse = await fetchApi(url);
  } catch (error) {
    throw console.error(error);
  }

  // For each new book (up to MAXNUM)
  // parse received objects into a new book
  // add to an array
  // and return
  if (apiResponse.work_count <= 0) {
    return res.send({ status: 400, statusTxt: "Not a valid subject." });
  }

  const MAXNUM = 5;
  let reccsList = [];
  for (let i = 0; i < MAXNUM; ++i) {
    let work = apiResponse.works[i];
    let recc = parseApiWork(work);
    reccsList.push(recc);
  }

  return res.send({ reccs: reccsList, status: 200, statusTxt: "OK" });
});

// Helper functions
/////////////////////////////

/**
 * fetches json data from the url asynchronously
 * @param {String} url - the api's url
 * @return {Object} apiResponse - an object with the response
 */
const fetchApi = async (url) => {
  const response = await fetch(url);

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
 * @returns {Object} book - a new book object
 */
const parseApiWork = (work) => {
  // let book = Object.filter(work, work => );
};

module.exports = router;
