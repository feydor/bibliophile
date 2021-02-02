const createError = require("http-errors");
const express = require("express");
const path = require("path");
//var cookieParser = require('cookie-parser');
const logger = require("morgan");
const session = require("express-session");

// import other custom modules
const auth = require("./auth");

// TODO: switch between production and debug
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// import routes
var publicRouter = require("./routes/public");
var dashboardRouter = require("./routes/dashboard");
var usersRouter = require("./routes/users");
var booksRouter = require("./books");

var app = express();

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

app.use(auth.oidc.router);

// enable routes
app.use("/", auth.addUser, publicRouter);
app.use("/dashboard", auth.addUser, auth.loginRequired, dashboardRouter);
app.use("/users", auth.addUser, usersRouter);
app.use("/books", auth.addUser, auth.updateUserId, booksRouter);

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
