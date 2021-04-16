const express = require("express");
const router = express.Router();

// Display the profile page
router.get("/", (req, res) => {
  res.render("profile", { profile: req.oidc.user });
});

module.exports = router;
