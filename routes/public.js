const express = require("express");
const router = express.Router();

// Home page
router.get("/", (req, res) => {
  req.oidc.isAuthenticated() ? console.log('Logged in') : console.log('Logged out');
  console.log(req.oidc.user);
  req.oidc.isAuthenticated() ? res.render("dashboard", { profile: req.oidc.user }) : res.render("splash");
});

module.exports = router;
