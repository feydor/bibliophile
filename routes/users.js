const express = require("express");
// const router = express.Router();
const db = require("../db");

// psuedo-endpoint to check sql db for pre-existing user, or to add one
// redirect to '/dashboard' afterwards
const checkForUserInDb = (req, res, next) => {
  if (!req.oidc.user) {
    throw console.error("User not logged in to Auth0.");
  }
  
  if (isExistingUser(req.oidc.user.email)) {
    next();
  } else {
    // insert new user_metadata
    let newUserId = insertNewUser(req.oidc.user);
    req.oidc.user.user_metadata.dbid = newUserId;
    next();
  }
};

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

module.exports = { checkForUserInDb };
