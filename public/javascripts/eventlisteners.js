/**
 * a modules file for importing event listener functions
 * example usage: import * as els from './eventlisteners.js'
 */
"use strict"

/**
 * sends a DELETE request to the url
 * @param {string} olid
 * @param {string} url
 * @throws Will throw an error if the server responds without status code 200
 * reloads the current page
 */
export const deleteRow = async (olid, url) => {
  console.assert(typeof olid === "string", "argument 'olid' must be a string");
  console.assert(typeof url === "string", "argument 'url' must be a string");

  let response = await fetch(url + "/" + olid, { method: "Delete" });
  let responseJson = await response.json();

  if (responseJson.status !== 200) {
    throw new Error(responseJson.statusTxt);
  }

  location.reload();
};

/**
 * posts book data to url
 * @param {Event} event - submit event
 * @param {function} hideBookForm
 * @param {object} data - { title, author, isbn }
 * @param {string} url
 * @throws Will throw an error if toggleAddBookForm is not a function
 * reloads the current page
 */
export const submitBook = (event, hideBookForm, data, url) => {
  console.assert(typeof hideBookForm === "function", "param 'hideBookForm' must be a function");

  // Prevent form from submitting to the server
  event.preventDefault();

  // hide the form and display the add book button
  hideBookForm();

  // POST json data using a new XMLHttpRequest object
  const xhr = new XMLHttpRequest();
  xhr.open("POST", url);
  xhr.setRequestHeader("Content-type", "application/json; charset=utf-8");
  xhr.send(JSON.stringify(data));
  xhr.onload = function () {
    // console.log(xhr.response);
    location.reload();
  };
};

/**
 * posts reccs query data (olid) to url
 * @param {Event} event - a submit event
 * @param {string} url - contains the olid data
 * @param {string} redirect - the page to redirect to
 * @throws Will throw an error if toggleAddBookForm is not a function
 */
export const submitReccs = async (event, url, redirect) => {
  event.preventDefault();

  let postResponse = await fetch(url, {
    method: "POST",
  });

  let responseJson = await postResponse.json();

  // console.log(responseJson);
  if (responseJson.status !== 200) {
    throw new Error(responseJson.status);
  }

  window.location.href = redirect;
};

/**
 * checks input for valid isbn
 * @param {function} timeout - pass in as null
 * throttles by 500ms
 */
export const checkInput = (timeout) => {
  // Clear the timeout if it has already been set.
  // This will prevent the previous task from executing
  // if it has been less than <MILLISECONDS>
  clearTimeout(timeout);

  // Make a new timeout set to go off in 500ms
  timeout = setTimeout(function () {
    let regex = /^([0-9]{10,13})$/g;
    let isbn = document.getElementById("isbnInput");

    if (regex.test(isbnInput.value)) {
      // console.log("Valid isbn:", isbn.value);

      isbn.classList.remove(".invalid-input");
      document.getElementById("submitButton").disabled = "";
      return;
    } else {
      // console.log("Invalid isbn:", isbn.value);
      isbn.classList.toggle(".invalid-input");

      // make submitButton unclickable
      document.getElementById("submitButton").disabled = "true";
      return;
    }
  }, 500);
};

/**
 * Sorts a table by column heading (title, author, etc)
 *
 * @param {string} tableid - The id of the table to be sorted.
 * @param {number} column - The column heading to sort by, starting from 0 or the leftmost column.
 * @return {number} 1 for success, 0 for failure (table may be null or undefined).
 */
export function sortTable(tableid = "booklist-id", column = 0) {
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
 * removes all child nodes,
 * if there are none, nothing happens
 * @param {HTMLElement} parent 
 */
function removeAllChildNodes(parent) {                                       
  while (parent.firstChild) {                                               
    parent.removeChild(parent.firstChild);
  }                                                                       
}                                                                           

