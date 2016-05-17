[![Build Status](https://travis-ci.org/mu-semtech/mu-javascript-template.svg?branch=master)](https://travis-ci.org/mu-semtech/mu-javascript-template)
[![Code Climate](https://codeclimate.com/github/mu-semtech/mu-javascript-template/badges/gpa.svg)](https://codeclimate.com/github/mu-semtech/mu-javascript-template)
[![Test Coverage](https://codeclimate.com/github/mu-semtech/mu-javascript-template/badges/coverage.svg)](https://codeclimate.com/github/mu-semtech/mu-javascript-template/coverage)
[![Issue Count](https://codeclimate.com/github/mu-semtech/mu-javascript-template/badges/issue_count.svg)](https://codeclimate.com/github/mu-semtech/mu-javascript-template)


Mu JavaScript Template
======================

Template for running JavaScript microservices using [hapi](http://hapijs.com/).

Getting Started
---------------

First you need to make your own project:

```
mkdir my_own_project
cd my_own_project
git init .
```

All the routes you're going to write must be exported by the module
`src/routes`:

```
mkdir -p src/routes
echo "export default []" > src/routes/index.js
```

Then you have to make a Dockerfile that use the Mu JavaScript Template image.

```
FROM semtech/mu-javascript-template:latest
MAINTAINER you <you@example.org>
```

You also need to include the three docker-compose files of this repository.

```
docker-compose.yml              # common docker-compose file
docker-compose.override.yml     # development environment override
docker-compose.prod.yml         # production environment override
```

To start the development environment, you will need to start:

```
docker-compose -f docker-compose.yml -f docker-compose.override.yml up
```

To run the test, the development server or the linter, you will first need to
install the development dependencies in your running container:

```
docker exec -it myownproject_template_1 npm install
```

Then execute one of the following command:

```
# to run the test once
docker exec -it myownproject_template_1 npm run test

# to start the test watcher
docker exec -it myownproject_template_1 npm run test:watch

# to start the tests and generate the coverage
docker exec -it myownproject_template_1 npm run test:cov

# to start the linter
docker exec -it myownproject_template_1 npm run lint -s
```

Route Examples
--------------

Route examples are provided in `src/routes/example.js` in this repository.
