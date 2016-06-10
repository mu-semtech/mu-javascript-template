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
$ mkdir my_own_project
$ cd my_own_project
$ git init .
```

What you are going to write is actually a HAPI plugin in `src/`:

```
$ mkdir src
$ cat - >src/index/js <<EOF
function register (server, options, next) {
  server.route(routes...)

  next()
}

register.attributes = {
  name: 'my_own_hapi_plugin'
}

export default register
EOF
```

Then you have to make a `Dockerfile` that uses the Mu JavaScript Template
image.

```
FROM semtech/mu-javascript-template:latest
MAINTAINER you <you@example.org>
```

You also need to include the three docker-compose files of this repository. And
the `package.json` file.

```
docker-compose.yml              # common docker-compose file
docker-compose.override.yml     # development environment override
docker-compose.prod.yml         # production environment override
pagkage.json
```

You need to customize all these files to match your requirements. First, update
the image name in `docker-compose.yml`. Then update the `package.json` to
rename the project and add your dependencies but don't remove any original
dependency of the template.

To start the development environment, all you need to do is use the Compose
CLI:

```
$ docker-compose up
```

**Note:** by default, Compose will use `docker-compose.yml` and
`docker-compose.override.yml` together. In production, you should specify
manually which files you need to load (`docker-compose.yml` with
`docker-compose.prod.yml`)

To run the tests, the development server or the linter, execute one of these
commands, it will start the command directly in the running container:

```
# to run the test once
$ docker exec -it myownproject_service_1 npm run test

# to start the test watcher
$ docker exec -it myownproject_service_1 npm run test:watch

# to start the tests and generate the coverage
$ docker exec -it myownproject_service_1 npm run test:cov

# to start the linter
$ docker exec -it myownproject_service_1 npm run lint -s
```

**Note:** if for some reason you suspect your directory `node_modules` is not
clean enough and break your code, use `docker-compose down` to force the
removal of the container then restart the services with `docker-compose up`.

Hapi Plugin Example
-------------------

A Hapi plugin example is included in this repository in `src/index.js` and its
routes in `src/example.js`.
