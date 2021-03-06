const express = require("express");
// const router = express.Router();
const db = require("../db");

/**
 * middle ware to check sql db for a user
 */
const checkForUserInDb = async (req, res, next) => {
  if (!req.oidc.user) {
    throw console.error("User not logged in to Auth0.");
  }

  let dbid = await isExistingUser(req.oidc.user.email);

  if (dbid !== 0) {
    res.locals.dbid = dbid;
    console.log("PRE-EXISTING USER: ", res.locals);
    next();
  } else {
    // insert new user_metadata
    let newUserId = await insertNewUser(req.oidc.user);
    res.locals.dbid = newUserId;
    console.log("INSERTINGNEWUSER: ", res.locals);
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

  // console.log(rows);
  // console.log(rows.length);

  if (rows && rows.length) {
    if (rows.id == undefined) {
      return rows[0].id;
    }
    return rows.id;
  } else {
    console.log("returning: ", 0);
    return 0;
  }
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
    `INSERT INTO users (username, nickname, picture, email) VALUE (?, ?, ?, ?);`,
    [profile.name, profile.nickname, profile.picture, profile.email]
  );
  
  console.log(rows);
  console.log(rows.insertId);

  return rows
    ? rows.insertId
    : console.error("insertNewUser failed.");
};

module.exports = { checkForUserInDb };
