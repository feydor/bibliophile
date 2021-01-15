const mysql = require("mysql2");

// connect to mysql server
var dbcon = mysql.createConnection({
  host: "localhost",
  user: "dev",
  password: "321",
  database: "library",
});

dbcon.connect(function (err) {
  if (err) throw err;
  console.log("Connected to MySQL db!");
});

module.exports = dbcon;
