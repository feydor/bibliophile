CREATE DATABASE library;

CREATE TABLE library.books (
    id INT AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    publisher VARCHAR(255),
    publish_date VARCHAR(255),
    olid VARCHAR(13) NOT NULL,
    isbn VARCHAR(13) NOT NULL,
    subject VARCHAR(255),
    coverurl VARCHAR(2083) NOT NULL,
    PRIMARY KEY(id)
);

INSERT INTO library.books (title, author, publisher, publish_date, olid, isbn, subject, coverurl)
VALUES ('Republic', 'Plato', 'Knickerbocker Classics', '2019', 'OL27340218M', '9780785837015', 'Philosophy', 'https://covers.openlibrary.org/b/id/8804312-M.jpg'),
('A Connecticut Yankee in King Arthur''s Court', 'Mark Twain', 'Dover Publications', '2001', 'OL6795491M', '0486415910', 'Time Travel', 'https://covers.openlibrary.org/b/id/313169-M.jpg');


CREATE TABLE library.users (
    id INT AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email varchar(255) NOT NULL,
    PRIMARY KEY(id)
);

INSERT INTO library.users (username, first_name, last_name, email)
VALUE ('atrab@energyce.cyou', 'Faker 2', 'BOTTOM_TEXT', 'atrab@energyce.cyou');

// sets up relationship between many users and many books
CREATE TABLE library.library (
    id INT AUTO_INCREMENT,
    userid INT,
    bookid INT,
    PRIMARY KEY(id)
);

INSERT INTO library.library (userid, bookid)
VALUES ('1', '1'),
       ('1', '2');

// delete SQL tables
DROP TABLE library.books;
DROP TABLE library.users;
DROP TABLE library.library;


// get book titles belonging to a user, by username
SELECT title
FROM books 
INNER JOIN library ON books.id = library.bookid
INNER JOIN users ON users.id = library.userid
where users.username = 'atrab@energyce.cyou';

// create users
CREATE USER 'dev'@'localhost' IDENTIFIED WITH mysql_native_password BY '321';
GRANT CREATE, ALTER, DROP, INSERT, UPDATE, DELETE, SELECT, REFERENCES, RELOAD on *.* TO 'dev'@'localhost' WITH GRANT OPTION;
