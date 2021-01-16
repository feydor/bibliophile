var okta = require('@okta/okta-sdk-nodejs');
var ExpressOIDC = require('@okta/oidc-middleware').ExpressOIDC;
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

var oktaClient = new okta.Client({
    orgUrl: process.env.OKTA_CLIENT_ORGURL,
    token: process.env.OKTA_CLIENT_TOKEN
});

// OpenID Connect client
const oidc = new ExpressOIDC({
  issuer: 'https://dev-1158936.okta.com/oauth2/default',
  client_id: process.env.OKTA_CLIENT_ID, 
  client_secret: process.env.OKTA_CLIENT_SECRET,
  appBaseUrl: 'http://localhost:3000',
  redirect_uri: 'http://localhost:3000/users/callback',
  scope: 'openid profile',
  routes: {
    login: {
      path: '/users/login'
    },
    loginCallback: {
      path: '/users/callback',
      // afterCallback, redirect to middleware route to add user to db, if needed
      afterCallback: '/users/verify-user'
    }
  }
});

// middlewares
// creates req.user and req.locals.user for later use
let addUser = (req, res, next) => {
  if (!req.userContext) {
    return next();
  }
  //const tokenSet = req.userContext.tokens; // Not needed
  const userinfo = req.userContext.userinfo;

  oktaClient.getUser(userinfo.sub)
    .then(user => {
      req.user = user;
      res.locals.user = user;
      next();
    }).catch(err => {
      next(err);
    });
};

// pass as middleware to routes that require user login
let loginRequired = (req, res, next) => {
  if (!req.user) {
    return res.status(401).render('unauthenticated');
  }
  
  next();
}


module.exports = { oidc, oktaClient, addUser, loginRequired };
