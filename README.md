# Mu Javascript template

Template for writing mu.semte.ch services in JavaScript using [Express 4](https://expressjs.com/)

## Tutorial: Building a microservice with Express
Since microservices are one of the core components of the mu.semte.ch architecture, we pay a lot of attention to making the development of a microservice as easy and productive as possible. A template is an easy starting point to build a microservice. It provides a preconfigured framework to start with (e.g. Sinatra in the [mu-ruby-template](https://github.com/mu-semtech/mu-ruby-template)) and a lot of boilerplate code and helper methods to speed up the development.

### Hello world
The mu-javascript-template is based on [Express 4](https://expressjs.com/) – a minimalist web framework for Node.js as they describe themselves. Hence, everything you’re able to do in the Express framework, you also can do in the microservice. To get started we will first implement a simple ‘Hello World’ API endpoint.

Open a new file ‘app.js’ and add the following lines of code:
```js
import { app } from 'mu';

app.get('/', function( req, res ) {
  res.send('Hello world!');
} );
```

We’ve now defined a simple API endpoint on the path ‘/hello’. Next, we will wrap these lines of code in the mu-javascript-template.

Create a Dockerfile next to the web.rb file with the following content:
```Dockerfile
FROM semtech/mu-javascript-template:1.1.0
```

Congratulations! You’ve build your first javascript microservice in mu.semte.ch. If you now build this Docker image and include it in your [mu-project](https://github.com/mu-semtech/mu-project), you will have a `/hello` endpoint available in your platform. Don’t forget to add a rule to your dispatcher to make this endpoint available to the frontend application.

### Developing the microservice
Building the Docker image each time you’ve changed some code is rather cumbersome during development. The template therefore supports development with live-reload. Start a container based on the mu-javascript-template image and mount your code in the `/app` folder:
```bash
docker run --volume /path/to/your/code:/app
            -e NODE\_ENV=development
            -d semtech/mu-javascript-template:1.1.0
```

Each time you change some code, the microservice will be automatically updated.

### What’s more?
We don’t want developer to write the same boilerplate code every time they implement a microservice in javascript. To speed up development, the template offers a lot of helper functions. You can import them in your app through the ‘mu’ module. Just add the import statement on top of your app.js file…
```js
import { app, query } from 'mu';
```
… and start using them in the request handling:
```js
import { app, query } from 'mu';

app.get('/users', function(req, res) {
 const query = `
   PREFIX foaf: <http://xmlns.com/foaf/0.1/>
   SELECT DISTINCT ?s WHERE { ?s a foaf:Agent }
 `;

  query(query).then( function(response) {
    // do something with the query results here
    // and send a response using res.json()
  });
});
```

‘app’ is a reference to the Express app while ‘query’ is a helper function to send a SPARQL query to the triplestore. There are functions available to generate a UUID, to escape characters in a SPARQL query, etc. A complete list can be found in [the template’s README](#imports).

### Using additional libraries
The mu-javascript-template uses the [sparql-client-2](https://www.npmjs.com/package/sparql-client-2) library to interact with the triplestore. If you need additional libraries, just list them in a package.json file next to your app.js. It works as you would expect: just define the packages in the dependencies section of the package.json. They will be installed automatically at build time. While developing in a container as described above, you will have to restart the container for the new included packages to be installed.

### Example
There are already [some microservices available](https://github.com/search?q=topic%3Amu-service+org%3Amu-semtech&type=Repositories) that use the `mu-javascript-template`. Have a look at them to see how simple it is to build a microservice based on this template. There is for example the [export service](https://github.com/mu-semtech/export-service) to export data using custom defined SPARQL queries or [Bravoer’s advanced search service](https://github.com/bravoer/advanced-search-service) to execute advanced search queries on resources that cannot be expressed in mu-cl-resources.

*This tutorial has been adapted from Erika Pauwels' mu.semte.ch article. You can view it [here](https://mu.semte.ch/2017/06/29/building-a-microservice-with-express/)*

## How-To
### Adding mu-javascript-template to your Dockerfile
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


### Developing with the template
Livereload is enabled automatically when running in development mode.  You can embed the template easily in a running mu.semte.ch stack by launching it in the `docker-compose.yml` with the correct links.  If desired, the chrome inspector can be attached during development, giving advanced javascript debugging features.

#### Live reload
When developing, you can use the template image, mount the volume with your sources in `/app` and add a link to the database. Set the `NODE_ENV` environment variable to `development`. The service will live-reload on changes. You'll need to restart the container when you define additional dependencies in your `package.json`.

```
docker run --link virtuoso:database \
       -v `pwd`:/app \
       -p 8888:80 \
       -e NODE_ENV=development \
       --name my-js-test \
       semtech/mu-javascript-template
```

#### Develop in mu.semte.ch stack
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

#### Attach the Chrome debugger
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


## Reference
### Requirements

  - **database link**: You need a link to the `database` which exposes a SPARQL endpoint on `http://database:8890/sparql`.  In line with other microservices.

### Imports

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
### Transpiled languages
The template has second-class support for transpiling TypeScript and CoffeeScript.  These are considered second-class and support may be removed in a minor release but not in a patch release.

Overwriting files through the config folder may require you to stick to the original format.  There are currently no guarantees on this.

#### Coffeescript
Any file extending to .coffee will be transpiled from coffeescript to javascript file.  Sourcemaps are included for debugging.

#### TypeScript
Any file extending in .ts will be transpiled to a javascript file.  Sources are currently not typechecked though this is subject to change.  Sourcemaps are included for debugging.

### Dependencies

You can install additional dependencies by including a `package.json` file next to your `app.js`. It works as you would expect: just define the packages in the `dependencies` section of the `package.json`. They will be installed automatically at build time.

### Configuration
#### Environment variables
The following environment variables can be configured:

  - `NODE_ENV` (default: `production`): either `"development"` or `"production"`. The environment to start the application in. The application live reloads on changes in `"development"` mode.
  - `MAX_BODY_SIZE` (default: `100kb`): max size of the request body. See [ExpressJS documentation](https://expressjs.com/en/resources/middleware/body-parser.html#limit).

#### Mounting `/config`
You may let users extend the microservice with code.

When you import content from `./config/some-file`, the sources can be provided by the end user in `/config/some-file`.

You may provide default values for each of these files. The sources provided by the app are merged with the sources provided by the microservice, with the app's configuration taking precedence.

### Logging

The verbosity of logging can be configured through following environment variables:

- `LOG_SPARQL_ALL`: Logging of all executed SPARQL queries, read as well as update (default `true`)
- `LOG_SPARQL_QUERIES`: Logging of executed SPARQL read queries (default: `undefined`). Overrules `LOG_SPARQL_ALL`.
- `LOG_SPARQL_UPDATES`: Logging of executed SPARQL update queries (default `undefined`). Overrules `LOG_SPARQL_ALL`.
- `DEBUG_AUTH_HEADERS`: Debugging of [mu-authorization](https://github.com/mu-semtech/mu-authorization) access-control related headers (default `true`)

Following values are considered true: [`"true"`, `"TRUE"`, `"1"`].
