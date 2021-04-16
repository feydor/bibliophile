const express = require("express");
const router = express.Router();
// const { requiresAuth } = require('express-openid-connect');

// Display the profile page
router.get("/", (req, res) => {
  res.send(JSON.stringify(req.oidc.user));
  // res.render("profile");
});

module.exports = router;
