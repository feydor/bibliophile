const mysql = require("mysql2/promise");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

/**
 * clears db's rows
 */
const clear = async () => {
  // first delete all rows from all tables
  let query = `DELETE books, users, library FROM books
               INNER JOIN users
               INNER JOIN library`;

  const [rows] = await pool.execute(query);
  if (!rows) throw new Error();
};

/**
 * resets MYSQL db to default values, change parameters below
 */
const reset = async () => {
  const username = "atrab@energyce.cyou";
  const first_name = "Mary";
  const last_name = "Sue";
  const email = "atrab@energyce.cyou";

  await clearDb();

  // insert the example user
  query = `INSERT INTO users (id, username, first_name, last_name, email)
    VALUE ('1000', ${username}, ${first_name}, ${last_name}, ${email})`;

  let [rows] = await pool.execute(query);
  if (!rows) throw new Error();

  // insert the example books
  query = `INSERT INTO books (id, title, author, publisher, publish_date, olid, isbn, subject, coverurl) 
           VALUES ('1001', 'Republic', 'Plato', 'Knickerbocker Classics', '2019', 'OL27340218M', '9780785837015', 'Philosophy', 'https://covers.openlibrary.org/b/id/8804312-M.jpg'),
('1002', 'A Connecticut Yankee in King Arthur''s Court', 'Mark Twain', 'Dover Publications', '2001', 'OL6795491M', '0486415910', 'Time Travel', 'https://covers.openlibrary.org/b/id/313169-M.jpg');`;

  [rows] = await pool.execute(query);
  if (!rows) throw new Error();

  // finally "give" the example user the two books
  // set a connection between userid and bookid
  query = `INSERT INTO library.library (userid, bookid)
VALUES ('1000', '1001'),
       ('1000', '1002');`;

  [rows] = await pool.execute(query);
  if (!rows) throw new Error();
};

module.exports = { pool, clear, reset };
