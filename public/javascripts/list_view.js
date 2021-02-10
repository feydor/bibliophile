"use strict";

const Books = [
  {
    id: "1000",
    title: "A Fake Title",
    author: "A Fake Author",
    subject: "Nonexistence",
    publisher: "MLL",
    publish_date: "1991",
    isbn: "9577251137",
    description:
      "Ranma ½ is a Japanese manga series written and illustrated by Rumiko Takahashi. It was serialized in Weekly Shōnen Sunday from September 1987 to March 1996, with the chapters collected into 38 tankōbon volumes by Shogakukan. The story revolves around a teenage boy named Ranma Saotome who has trained in martial arts since early childhood.",
    coverurl: "https://covers.openlibrary.org/b/id/8246200-M.jpg",
  },
];

const BookListHeader = (props) => {
  const { text } = props;
  return <th>{text}</th>;
};

/**
 * Renders a single row of the BookList
 */
const BookListRow = (props) => {
  const {
    title,
    author,
    subject,
    publisher,
    publish_date,
    isbn,
    description,
    coverurl,
  } = props;

  return (
    <tr>
      <td>
        <img src={coverurl}></img>
      </td>
      <td>{title}</td>
      <td>{author}</td>
      <td>{subject}</td>
      <td>{publisher}</td>
      <td>{publish_date}</td>
      <td>{isbn}</td>
      <td>{description}</td>
    </tr>
  );
};

const BookList = (props) => {
  const { books } = props;
  let headings = [];
  const isMobile = window.innerWidth < 768 ? true : false;

  const rows = books.map((book) => {
    if (isMobile) {
      <BookListRow
        key={book.id}
        title={book.title}
        author={book.author}
        subject={book.subject}
        publisher={book.publisher}
        coverurl={book.coverurl}
      />;
    } else {
      <BookListRow
        key={book.id}
        title={book.title}
        author={book.author}
        subject={book.subject}
        publisher={book.publisher}
        publish_date={book.publish_date}
        isbn={book.isbn}
        description={book.description}
        coverurl={book.coverurl}
      />;
    }
  });

  if (isMobile) {
    headings = ["Title", "Author", "Subject", "Publisher"];
  } else {
    headings = [
      "Title",
      "Author",
      "Subject",
      "Publisher",
      "Published Date",
      "ISBN",
      "Description",
    ];
  }

  return (
    <table>
      <thead>
        <tr>
          <BookListHeader text="fuckyou" />
          {headings.forEach((heading) => {
            <tr>
              {" "}
              <BookListHeader text={heading} />{" "}
            </tr>;
          })}
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
};

const TopBookList = () => {
  return (
    <div>
      <h1>Books</h1>
      <BookList books={Books} />
    </div>
  );
};

ReactDOM.render(<TopBookList />, document.querySelector("#booklist-container"));
