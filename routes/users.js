const express = require("express");
const router = express.Router();
const db = require("../db");

// Log a user out locally
/*
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});
*/

// psuedo-endpoint to check sql db for pre-existing user, or to add one
// redirect to '/dashboard' afterwards
router.get("/verify-user", (req, res) => {
  if (!req.oidc.user) {
    throw console.error("User not logged in to Auth0.");
  }

  // query db for matching user
  // apply matching user id to req.oidc.user.user_metadata.uid
  // redirect to /dashboard
  if (isExistingUser(req.oidc.user.email)) {
    res.redirect("/dashboard");
  } else {
    let newUserId = insertNewUser(req.oidc.user);
    req.oidc.user.user_metadata.dbid = newUserId;
    res.redirect("/dashboard");
  }
});

// query functions
const isExistingUser = async (email) => {
  const [
    rows,
  ] = await db.pool.execute(`SELECT id FROM users WHERE users.email = ? `, [
    email,
  ]);
  return rows.id ? true : false;
};

/*
 * Inserts a new user into the db
 * @param {req.oidc.profile} the user object from req.oidc provided by auth0
 * @return if succesful, returns the affected row's id, else returns an error
 */
const insertNewUser = async (profile) => {
  const [
    rows,
  ] = await db.pool.execute(
    `INSERT INTO users (username, first_name, last_name, email) VALUE (?, ?, ?, ?);`,
    [profile.name, profile.given_name, profile.full_name, profile.email]
  );

  return rows && rows.length > 0
    ? rows[0].id
    : console.error("insertNewUser failed.");
};

module.exports = router;
