const express = require("express");
const router = express.Router();

// Home page
router.get("/", (req, res) => {
  req.oidc.isAuthenticated() ? console.log('Logged in') : console.log('Logged out');
  req.oidc.isAuthenticated() ? res.render("dashboard") : res.render("splash");
});

module.exports = router;
