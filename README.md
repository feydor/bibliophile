![](./[public/images/logo.png)

<p align="center">
  <a href="" target="_blank">
    <img alt="Github Issues" src="https://img.shields.io/github/issues/feydor/bibliophile" />
  </a>
  <a href="" target="_blank">
    <img alt="Github Stars" src="https://img.shields.io/github/stars/feydor/bibliophile" />
  </a>
  <a href="https://github.com/feydor/bibliophile/master/LICENSE" target="_blank">
    <img alt="LICENSE" src="https://img.shields.io/github/license/feydor/bibliophile" />
  </a>
</p>

An Express.js app (MySQL, Vanilla JS, Express.js) to keep track of personal libraries, reading progress, and reccomendations.

# Table of Contents

- [Live Version](#liveversion)
- [Screenshots](#screenshots)
- [Installation](#installation)
- [Development](#development)
  - [Codebase](#codebase)
    - [Technologies](#technologies)
    - [Folder Structure](#folder-structure)
  - [Design Considerations](#design-considerations)
- [License](#license)

# Live Version
[(Back to top)](#table-of-contents)

![Heroku](http://heroku-badge.herokuapp.com/?app=bibliophile-library&style=flat&svg=1&root=index.html)
[Go to live version.](https://bibliophile-library.herokuapp.com/)

# Screenshots
[(Back to top)](#table-of-contents)

![mobile-dashboard](/examples/mobile-dashboard.png "mb-dashboard")

# Installation
[(Back to top)](#table-of-contents)

Clone this repository and navigate inside the project folder and install the dependencies by running:

```sh
git clone https://github.com/feydor/bibliophile.git
cd bibliophile
npm install
```

After installing the dependencies, run the project by executing:

```sh
npm start
```
By default a development server will start at ``http://localhost:3000``. 
To develop, set the appropriate environment variables in .env:

```sh
DOMAIN='http://localhost:3000/'
PORT='3000'
SECRET=21kh321kj3h21kj3h1k3
OKTA_CLIENT_ORGURL=https://dev-1158936.okta.com
OKTA_CLIENT_TOKEN=''
OKTA_CLIENT_ID=0oa3syfa2lxkyM2QJ5d6
OKTA_CLIENT_SECRET=''
OIDC_ISSUER=https://dev-1158936.okta.com/oauth2/default
MYSQL_HOST=''
MYSQL_USER=''
MYSQL_PASSWORD=''
MYSQL_DB=''
```
Run the tests

```sh
npm test
```

# Development
[(Back to top)](#table-of-contents)
## Codebase
### Technologies
Technologies used in this mono repo include:

- Full-stack JavaScript: Backend uses Node.js, frontend is in plain JS.
- ExpressJS: RESTful api
- MySQL: a relational database
- OpenID Connect: an authentication layer on top of OAuth 2.0
- Pug: a view engine
- Sass: a CSS framework
- Bootstrap: a CSS and HTML framework
- Prettier: a JS code style formatter
- Jest: a testing framework

### Folder structure

```sh
bibliophile/
├── bin        # Node.js start scripts
├── examples   # Screenshots and assorted images
├── public     # Front facing files
│   ├── images              # Images, logos, favicons
│   ├── javascripts         # JavaScript code
│   ├── stylesheets         # Sass and CSS sources
│   └── vendor              # Bootstrap, Bootstrap-icons, AOS
├── routes     # Express.js endpoints
├── sql        # SQL init scripts
├── tests      # Jest tests
├── views      # Pug files
└── app.js     # Backend entrypoint
```

## Design Considerations

### Relational Modeling
A library is modelled around a many-to-many relationship between users and books. Books and users exist in their own tables. When a user wants to register a book, an entry is made in the library table connecting a user and a book. Doing so allows many users to 'own' a single book, cutting down on superflous entries. 

The following query accesses the titles of every book registered to a particular user:
```sh
USE library;
SELECT title
FROM books 
INNER JOIN library ON books.id = library.bookid
INNER JOIN users ON users.id = library.userid
where users.username = 'atrab@energyce.cyou';
```

# License
[(Back to top)](#table-of-contents)

MIT, see the [LICENSE](./LICENSE) file.
