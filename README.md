<div align="center">
  ![](./[public/images/logo.png)
</div>

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

<hr>

An Express.js app (MySQL, Vanilla JS, Express.js) to keep track of personal libraries, reading progress, and reccomendations.


# Table of Contents

- [Project Title](#bibliophile)
- [Usage](#usage)
- [Screenshots](#screenshots)
- [Installation](#installation)
- [Development](#development)
  - [Codebase](#codebase)
    - [Technologies](#technologies)
    - [Folder Structure](#folderstructure)
- [License](#license)

# Usage

![Heroku](http://heroku-badge.herokuapp.com/?app=bibliophile-library&style=flat&svg=1&root=index.html)

# Screenshots

![mobile-dashboard](/examples/mobile-dashboard.png "mb-dashboard")

# Installation

Clone this repository and navigate inside the project folder and install the dependencies by running:

```sh
npm install
```

After installing the dependencies, run the project by executing:

```sh
npm start
```

Run the tests

```sh
npm test
```

# Development
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

# License

MIT, see the [LICENSE](./LICENSE) file.
