const mysql = require('mysql2/promise');

var promisePool;

const pool = mysql.createPool({
  host: 'localhost',
  user: 'dev',
  password: '321',
  database: 'library',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// const connection = async () => {
//   const promisePool = await pool.promise();  
// };

// const connection = () => {
//   return new Promise((resolve, reject) => {
//     pool.getConnection((err, connection) => {
//       if (err) reject(err);
//       console.log("MySQL pool connected: threadId " + connection.threadId);
//       const query = (sql, binding) => {
//         return new Promise((resolve, reject) => {
//           connection.query(sql, binding, (err, result) => {
//             if (err) reject(err);
//             resolve(result);
//           });
//         });
//       };
//       const release = () => {
//         return new Promise((resolve, reject) => {
//           if (err) reject(err);
//           console.log("MySQL pool released: threadId " + connection.threadId);
//           resolve(connection.release());
//         });
//       };
//       resolve({ query, release });
//     });
//   });
// };


// const getConnection = async () => {
//   try {
//     promisePool = pool.promise();
//   } catch (error) {
//     console.log(error);
//   }
//   console.log("Connected to MySQL db!");
//   return promisePool;
// };

// const getConnection = async () => {
//   var dbcon;
//   try {
//     dbcon = await mysql.createConnection({
//       host: "localhost",
//       user: "dev",
//       password: "321",
//       database: "library",
//     });
//   } catch (error) {
//     console.error(error);
//   }
  
//   dbcon.connect();
//   console.log("Connected to MySQL db!");
//   return dbcon;
// };

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
module.exports = pool;

