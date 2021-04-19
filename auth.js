/* auth.js - authorization functions using Auth0 */
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');
const db = require("./db"); // async function, returns Promise

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const strategy = new Auth0Strategy(
  {
    domain: process.env.AUTH0_DOMAIN,
    clientID: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    callbackURL:
      process.env.AUTH0_CALLBACK_URL || 'http://localhost:3000/callback'
  },
  function (accessToken, refreshToken, extraParams, profile, done) {
    // accessToken is the token to call Auth0 API (not needed in the most cases)
    // extraParams.id_token has the JSON Web Token
    // profile has all the information from the user
    return done(null, profile);
  }
);

passport.use(strategy);

const config = {
  authRequired: false, // activate on route-by-route basis
  auth0Logout: true,
  secret: process.env.SECRET,
  baseURL: process.env.BASEURL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_DOMAIN,
};

const requiresAuth = (req, res, next) => {
  if (req.user) { return next(); }
  req.session.returnTo = req.originalUrl;
  res.redirect('/login');
};

/*
var oktaClient = new okta.Client({
  orgUrl: process.env.OKTA_CLIENT_ORGURL,
  token: process.env.OKTA_CLIENT_TOKEN,
});

// OpenID Connect client
const oidc = new ExpressOIDC({
  issuer: process.env.OIDC_ISSUER,
  client_id: process.env.OKTA_CLIENT_ID,
  client_secret: process.env.OKTA_CLIENT_SECRET,
  appBaseUrl: process.env.DOMAIN.slice(0, process.env.DOMAIN.length - 1),
  redirect_uri: process.env.DOMAIN + "users/callback",
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
    next();
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
    return next(new Error("addUser middleware not running."));
  }

  const [
    rows,
  ] = await db.pool.execute("SELECT id FROM users WHERE users.username = ?", [
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
*/

module.exports = { config, passport, requiresAuth };
