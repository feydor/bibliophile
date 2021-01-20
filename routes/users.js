const express = require('express');
const router = express.Router();
const dbcon = require('../db');

// Log a user out locally
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

// middleware to check sql db for pre-existing user, or to add one
// redirect to '/dashboard' afterwards
router.get('/verify-user', (req, res, next) => {
  if (!req.user) { 
    throw console.error("addUser middleware not running");
  } 

  dbcon.execute('SELECT id FROM users WHERE users.username = ?',
    [req.user.profile.login],
    function(err, results) {
      if (err) throw console.error(err);
      
      // user found, redirect to '/dashboard'
      if (results && results.length > 0) {
        res.redirect('/dashboard');
      // no user found, add one
      } else {
        dbcon.execute(
        `INSERT INTO users (username, first_name, last_name, email)
         VALUE (?, ?, ?, ?);`,
        [req.user.profile.login, req.user.profile.firstName, req.user.profile.lastName,
        req.user.profile.email],
        function(err, results) {
          if (err) throw console.error(err);
          if (results) {
            console.log(results);
            
            // user inserted, redirect
            req.userid = results[0].id;
            res.redirect('/dashboard');
          }
        });
      }
  }); 
});

module.exports = router;
