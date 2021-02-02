var okta = require("@okta/okta-sdk-nodejs");
var ExpressOIDC = require("@okta/oidc-middleware").ExpressOIDC;
const db = require("./db"); // async function, returns Promise

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

var oktaClient = new okta.Client({
  orgUrl: process.env.OKTA_CLIENT_ORGURL,
  token: process.env.OKTA_CLIENT_TOKEN,
});

// OpenID Connect client
const oidc = new ExpressOIDC({
  issuer: "https://dev-1158936.okta.com/oauth2/default",
  client_id: process.env.OKTA_CLIENT_ID,
  client_secret: process.env.OKTA_CLIENT_SECRET,
  appBaseUrl: "http://localhost:3000",
  redirect_uri: "http://localhost:3000/users/callback",
  scope: "openid profile",
  routes: {
    login: {
      path: "/users/login",
    },
    loginCallback: {
      path: "/users/callback",
      // afterCallback, redirect to middleware route to add user to db, if needed
      afterCallback: "/users/verify-user",
    },
  },
});

// middlewares
// creates req.user and req.locals.user for later use
let addUser = (req, res, next) => {
  if (!req.userContext) {
    return next();
  }
  //const tokenSet = req.userContext.tokens; // Not needed
  const userinfo = req.userContext.userinfo;

  oktaClient
    .getUser(userinfo.sub)
    .then((user) => {
      req.user = user;
      req.userid = "UNDEFINED"; // to be filled in by users.js
      res.locals.user = user;
      next();
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
};

// must come after addUser middleware
// adds userid field to req.user
let updateUserId = async (req, res, next) => {
  if (!req.user) {
    throw console.error("addUser middleware not running.");
  }

  const [
    rows,
  ] = await db.execute("SELECT id FROM users WHERE users.username = ?", [
    req.user.profile.login,
  ]);

  if (rows && rows.length > 0) {
    req.userid = rows[0].id;
  }

  next();
};

// pass as middleware to routes that require user login
let loginRequired = (req, res, next) => {
  if (!req.user) {
    return res.status(401).render("unauthenticated");
  }

  next();
};

module.exports = { oidc, oktaClient, addUser, updateUserId, loginRequired };
