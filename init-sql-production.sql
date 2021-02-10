CREATE TABLE heroku_4dbbc9054865647.books (
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

INSERT INTO heroku_4dbbc9054865647.books (id, title, author, publisher, publish_date, olid, isbn, subject, coverurl)
VALUES ('1000', 'Republic', 'Plato', 'Knickerbocker Classics', '2019', 'OL27340218M', '9780785837015', 'Philosophy', 'https://covers.openlibrary.org/b/id/8804312-M.jpg'),
('1001', 'A Connecticut Yankee in King Arthur''s Court', 'Mark Twain', 'Dover Publications', '2001', 'OL6795491M', '0486415910', 'Time Travel', 'https://covers.openlibrary.org/b/id/313169-M.jpg');


CREATE TABLE heroku_4dbbc9054865647.users (
    id INT AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email varchar(255) NOT NULL,
    PRIMARY KEY(id)
);

INSERT INTO heroku_4dbbc9054865647.users (id, username, first_name, last_name, email)
VALUE ('1000', 'atrab@energyce.cyou', 'Faker', 'Fakerman', 'atrab@energyce.cyou');

CREATE TABLE heroku_4dbbc9054865647.library (
    id INT AUTO_INCREMENT,
    userid INT,
    bookid INT,
    PRIMARY KEY(id)
);

INSERT INTO heroku_4dbbc9054865647.library (userid, bookid)
VALUES ('1000', '1000'),
       ('1000', '1001');
