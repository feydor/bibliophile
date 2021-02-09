"use strict";

var Books = [{
  id: "1000",
  title: "A Fake Title",
  author: "A Fake Author",
  subject: "Nonexistence",
  publisher: "MLL",
  publish_date: "1991",
  isbn: "9577251137",
  description: "Ranma ½ is a Japanese manga series written and illustrated by Rumiko Takahashi. It was serialized in Weekly Shōnen Sunday from September 1987 to March 1996, with the chapters collected into 38 tankōbon volumes by Shogakukan. The story revolves around a teenage boy named Ranma Saotome who has trained in martial arts since early childhood.",
  coverurl: "https://covers.openlibrary.org/b/id/8246200-M.jpg"
}];

/**
 * Renders a single row of the BookList
 */
var BookListRow = function BookListRow(props) {
  var title = props.title,
      author = props.author,
      subject = props.subject,
      publisher = props.publisher,
      publish_date = props.publish_date,
      isbn = props.isbn,
      description = props.description,
      coverurl = props.coverurl;


  return React.createElement(
    "tr",
    null,
    React.createElement(
      "td",
      null,
      React.createElement("img", { src: coverurl })
    ),
    React.createElement(
      "td",
      null,
      title
    ),
    React.createElement(
      "td",
      null,
      author
    ),
    React.createElement(
      "td",
      null,
      subject
    ),
    React.createElement(
      "td",
      null,
      publisher
    ),
    React.createElement(
      "td",
      null,
      publish_date
    ),
    React.createElement(
      "td",
      null,
      isbn
    ),
    React.createElement(
      "td",
      null,
      description
    )
  );
};

var BookListHeader = function BookListHeader(props) {
  var text = props.text;

  return React.createElement(
    "th",
    null,
    text
  );
};

var BookList = function BookList(props) {
  var books = props.books;

  var headings = [];
  var isMobile = window.innerWidth < 768 ? true : false;

  var rows = books.map(function (book) {
    if (isMobile) {
      React.createElement(BookListRow, {
        key: book.id,
        title: book.title,
        author: book.author,
        subject: book.subject,
        publisher: book.publisher,
        coverurl: book.coverurl
      });
    } else {
      React.createElement(BookListRow, {
        key: book.id,
        title: book.title,
        author: book.author,
        subject: book.subject,
        publisher: book.publisher,
        publish_date: book.publish_date,
        isbn: book.isbn,
        description: book.description,
        coverurl: book.coverurl
      });
    }
  });

  if (isMobile) {
    headings = ["Title", "Author", "Subject", "Publisher"];
  } else {
    headings = ["Title", "Author", "Subject", "Publisher", "Published Date", "ISBN", "Description"];
  }

  return React.createElement(
    "table",
    null,
    React.createElement(
      "thead",
      null,
      React.createElement(
        "tr",
        null,
        React.createElement(BookListHeader, { text: "fuckyou" }),
        headings.forEach(function (heading) {
          React.createElement(
            "tr",
            null,
            " ",
            React.createElement(BookListHeader, { text: heading }),
            " "
          );
        })
      )
    ),
    React.createElement(
      "tbody",
      null,
      rows
    )
  );
};

var TopBookList = function TopBookList() {
  return React.createElement(
    "div",
    null,
    React.createElement(
      "h1",
      null,
      "Books"
    ),
    React.createElement(BookList, { books: Books })
  );
};

ReactDOM.render(React.createElement(TopBookList, null), document.querySelector('#booklist-container'));
