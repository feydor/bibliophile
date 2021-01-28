const express = require("express");
const router = express.Router();
const db = require("../db");

// Log a user out locally
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

// psuedo-endpoint to check sql db for pre-existing user, or to add one
// redirect to '/dashboard' afterwards
router.get("/verify-user", (req, res) => {
  if (!req.user) {
    throw console.error("addUser middleware not running");
  }

  // query db for matching user
  // apply matching user id to req.userid
  // redirect to /dashboard
  if (isExistingUser(req.user.profile.login)) {
    res.redirect("/dashboard");
  } else {
    let newUserId = insertNewUser(req.user.profile);
    req.userid = newUserId;
    res.redirect("/dashboard");
  }
});

// Query functions
// returns true if the provided username matches a row's username field in library.users
// else returns false
const isExistingUser = async (username) => {
  const [
    rows,
  ] = await db.execute(`SELECT id FROM users WHERE users.username = ? `, [
    username,
  ]);
  return rows.id ? true : false;
};

// if succesful, returns the affected row's id (the userid)
// else returns an error
const insertNewUser = async (profile) => {
  const [
    rows,
  ] = await db.execute(
    `INSERT INTO users (username, first_name, last_name, email) VALUE (?, ?, ?, ?);`,
    [profile.login, profile.firstName, profile.lastName, profile.email]
  );

  return rows && rows.length > 0
    ? rows[0].id
    : console.error("insertNewUser failed.");
};

module.exports = router;
