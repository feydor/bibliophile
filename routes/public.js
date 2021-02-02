const express = require("express");
const router = express.Router();

// Home page
router.get("/", (req, res) => {
  if (req.user) {
    res.render("dashboard");
  } else {
    res.render("splash");
  }
});

module.exports = router;
