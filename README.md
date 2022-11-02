# Mu Javascript template

Template for writing mu.semte.ch services in JavaScript using [Express 4](https://expressjs.com/)

## Getting started

Create a new folder.  Add the following Dockerfile:

```docker
FROM semtech/mu-javascript-template
LABEL maintainer="madnificent@gmail.com"
```

Create your microservice in `app.js`:

```js
import { app, query, errorHandler } from 'mu';

app.get('/', function( req, res ) {
  res.send('Hello mu-javascript-template');
} );


app.get('/query', function( req, res ) {
  var myQuery = `
    SELECT *
    WHERE {
      GRAPH <http://mu.semte.ch/application> {
        ?s ?p ?o.
      }
    }`;

  query( myQuery )
    .then( function(response) {
      res.send( JSON.stringify( response ) );
    })
    .catch( function(err) {
      res.send( "Oops something went wrong: " + JSON.stringify( err ) );
    });
} );

app.use(errorHandler);
```

Check [Express' Getting Started guide](https://expressjs.com/en/starter/basic-routing.html) to learn how to build a REST API in Express.

## Requirements

  - **database link**: You need a link to the `database` which exposes a SPARQL endpoint on `http://database:8890/sparql`.  In line with other microservices.

## Imports

The following importable variables are available:

  - `app`: The [Express application](https://expressjs.com/en/guide/routing.html) on which routes can be added
  - `query(query) => Promise`: Function for sending queries to the triplestore
  - `update(query) => Promise`: Function for sending updates to the triplestore
  - `uuid()` => string: Generates a random UUID
  - `errorHandler(err, req, res, next)`: [Error handling middleware function for Express](https://expressjs.com/en/guide/error-handling.html). It needs to be loaded at the end.
  - `sparql`: [Template tag](https://www.npmjs.com/package/sparql-client-2#using-the-sparql-template-tag) to create queries with interpolated values
  - `sparqlEscapeString(value) => string`: Function to escape a string in SPARQL
  - `sparqlEscapeUri(value) => string`: Function to escape a URI in SPARQL
  - `sparqlEscapeDecimal(value) => string`: Function to escape an integer or float as an `xsd:decimal` in SPARQL
  - `sparqlEscapeInt(value) => string`: Function to escape an integer in SPARQL
  - `sparqlEscapeFloat(value) => string`: Function to escape a float in SPARQL
  - `sparqlEscapeDate(value) => string`: Function to escape a date in SPARQL. The given value is passed to the `Date` constructor.
  - `sparqlEscapeDateTime(value) => string`: Function to escape a datetime in SPARQL
  - `sparqlEscapeBool(value) => string`: Function to escape a boolean in SPARQL. The given value is evaluated to a boolean value in javascript. E.g. the string value `'0'` evaluates to `false` in javascript.
  - `sparqlEscape(value, type) => string`: Function to escape a value in SPARQL according to the given type. Type must be one of `'string'`, `'uri'`, `'int'`, `'float'`, `'date'`, `'dateTime'`, `'bool'`.

You can either import specific attributes from the mu library, or import the whole mu object.

An example of importing specific variables:

```js
import { app, query } from 'mu';

app.get('/', function( req, res ) {
  res.send('Hello mu-javascript-template');
} );
```

An example of importing the whole library:

```js
import mu from 'mu';

mu.app.get('/', function( req, res ) {
  res.send('Hello using full import');
} );
```
## Transpiled languages
The template has second-class support for transpiling TypeScript and CoffeeScript.  These are considered second-class and support may be removed in a minor release but not in a patch release.

Overwriting files through the config folder may require you to stick to the original format.  There are currently no guarantees on this.

### Coffeescript
Any file extending to .coffee will be transpiled from coffeescript to javascript file.  Sourcemaps are included for debugging.

### TypeScript
Any file extending in .ts will be transpiled to a javascript file.  Sources are currently not typechecked though this is subject to change.  Sourcemaps are included for debugging.

## Dependencies

You can install additional dependencies by including a `package.json` file next to your `app.js`. It works as you would expect: just define the packages in the `dependencies` section of the `package.json`. They will be installed automatically at build time.

## Configuration
### Environment variables
The following environment variables can be configured:

  - `NODE_ENV` (default: `production`): either `"development"` or `"production"`. The environment to start the application in. The application live reloads on changes in `"development"` mode.
  - `MAX_BODY_SIZE` (default: `100kb`): max size of the request body. See [ExpressJS documentation](https://expressjs.com/en/resources/middleware/body-parser.html#limit).

### Mounting `/config`
You may let users extend the microservice with code.

When you import content from `./config/some-file`, the sources can be provided by the end user in `/config/some-file`.

You may provide default values for each of these files. The sources provided by the app are merged with the sources provided by the microservice, with the app's configuration taking precedence.

## Logging

The verbosity of logging can be configured through following environment variables:

- `LOG_SPARQL_ALL`: Logging of all executed SPARQL queries, read as well as update (default `true`)
- `LOG_SPARQL_QUERIES`: Logging of executed SPARQL read queries (default: `undefined`). Overrules `LOG_SPARQL_ALL`.
- `LOG_SPARQL_UPDATES`: Logging of executed SPARQL update queries (default `undefined`). Overrules `LOG_SPARQL_ALL`.
- `DEBUG_AUTH_HEADERS`: Debugging of [mu-authorization](https://github.com/mu-semtech/mu-authorization) access-control related headers (default `true`)

Following values are considered true: [`"true"`, `"TRUE"`, `"1"`].

## Developing with the template

Livereload is enabled automatically when running in development mode.  You can embed the template easily in a running mu.semte.ch stack by launching it in the `docker-compose.yml` with the correct links.  If desired, the chrome inspector can be attached during development, giving advanced javascript debugging features.

### Live reload
When developing, you can use the template image, mount the volume with your sources in `/app` and add a link to the database. Set the `NODE_ENV` environment variable to `development`. The service will live-reload on changes. You'll need to restart the container when you define additional dependencies in your `package.json`.

```
docker run --link virtuoso:database \
       -v `pwd`:/app \
       -p 8888:80 \
       -e NODE_ENV=development \
       --name my-js-test \
       semtech/mu-javascript-template
```

### Develop in mu.semte.ch stack
When developing inside an existing mu.semte.ch stack, it is easiest to set the development mode and mount the sources directly.  This makes it easy to setup links to the database and the dispatcher.

Optionally, you can publish the microservice on a different port, so you can access it directly without the dispatcher.  In the example below, port 8888 is used to access the service directly.  We set the path to our sources directly, ensuring we can develop the microservice in its original place.

```yml
    yourMicroserviceName:
      image: semtech/mu-javascript-template
      ports:
        - 8888:80
      environment:
        NODE_ENV: "development"
      links:
        - db:database
      volumes:
        - /absolute/path/to/your/sources/:/app/
```

### Attach the Chrome debugger
When running in development mode, you can attach the chrome debugger to your microservice and add breakpoints as you're used to.  The chrome debugger requires port 9229 to be forwarded, and your service to run in development mode.  After launching your service, open Google Chrome or Chromium, and visit [chrome://inspect/](chrome://inspect/).

Running through docker run, you could access the service as follows:

```
docker run --link virtuoso:database \
       -v `pwd`:/app \
       -p 8888:80 \
       -p 9229:9229 \
       -e NODE_ENV=development \
       --name my-js-test \
       semtech/mu-javascript-template
```

Now open Chromium, and visit [chrome://inspect/](chrome://inspect/).  Once the service is launched, a remote target on localhost should pop up.

When running inside a mu.semte.ch stack, you could mount your sources and connect to known microservices as follows:

```yml
    yourMicroserviceName:
      image: semtech/mu-javascript-template
      ports:
        - 8888:80
        - 9229:9229
      environment:
        NODE_ENV: "development"
      links:
        - db:database
      volumes:
        - /absolute/path/to/your/sources/:/app/
```
Now open Chromium, and visit [chrome://inspect/](chrome://inspect/).  Once the service is launched, a remote target on localhost should pop up.
