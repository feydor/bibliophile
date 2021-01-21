const mysql = require("mysql2/promise");

const getConnection = async () => {
  var dbcon;
  try {
    dbcon = await mysql.createConnection({
      host: "localhost",
      user: "dev",
      password: "321",
      database: "library",
    });
  } catch (error) {
    console.error(error);
  }
  
  dbcon.connect();
  console.log("Connected to MySQL db!");
  return dbcon;
};

/*
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
*/
module.exports = getConnection;

