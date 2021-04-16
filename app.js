const createError = require("http-errors");
const express = require("express");
const path = require("path");
const logger = require("morgan");
const session = require("express-session");
const { auth, requiresAuth } = require('express-openid-connect');

// import other custom modules
const auth0 = require("./auth");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// import routes
let publicRouter = require("./routes/public");
let dashboardRouter = require("./routes/dashboard");
let usersRouter = require("./routes/users");
let profileRouter = require("./routes/profile");
let reccs = require("./routes/reccs");
let books = require("./routes/books");

let app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// middlewares
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: false,
  })
);

// enable routes
app.use(auth(auth0.config));

app.use("/", publicRouter);
app.use("/profile", requiresAuth, profileRouter);
app.use("/dashboard", requiresAuth, dashboardRouter);
app.use("/users", requiresAuth, usersRouter);
app.use("/books", requiresAuth, books.router);
app.use("/reccs", requiresAuth, reccs.router);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  console.log(err);

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
