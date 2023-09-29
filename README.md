# Mu Javascript template

Template for writing semantic.works services in JavaScript using [Express 4](https://expressjs.com/)

## Tutorials
### Develop your first microservice
Requires: a semantic.works stack, like mu-project.

Create a new folder for your microservice.

In the folder, create your microservice in `app.js`:

```js
import { app } from 'mu';

app.get('/hello', function( req, res ) {
  res.send('Hello mu-javascript-template');
} );
```

This service will respond with 'Hello mu-javascript-template' when receiving a GET request on '/hello'.

Add the mu-javascript-template to your `docker-compose.yml` with the sources mounted directly.

```yml
version: '3.4'
services:
    your-microservice-name:
      image: semtech/mu-javascript-template
      environment:
        NODE_ENV: "development"
      ports:
        - 8888:80
      volumes:
        - /absolute/path/to/your/sources/:/app/
```

Next, create the service by running
```
docker-compose up -d your-microservice-name
```

A `curl` call to the microservice will show you to message

```bash
curl http://localhost:8888/hello
# Hello mu-javascript-template
```

## How-to
### Develop in a mu.semte.ch stack
Requires:
- a semantic.works stack, like mu-project
- 'Develop your first microservice'

When developing inside an existing mu.semte.ch stack, it is easiest to set the development mode by setting the `NODE_ENV` environment variable to `development` and mount the sources directly.  This makes it easy to setup links to the database and the dispatcher. Livereload is enabled automatically when running in development mode.

```yml
version: ...
services:
  ...
  your-microservice-name:
    image: semtech/mu-javascript-template
    environment:
      NODE_ENV: "development"
    volumes:
      - /absolute/path/to/your/sources/:/app/
```

### Build a microservice based on mu-javascript-template
Requires:
- a semantic.works stack, like mu-project
- 'Develop your first microservice'

Add a Dockerfile with the following contents:

```docker
FROM semtech/mu-javascript-template
LABEL maintainer="madnificent@gmail.com"
```

There are various ways to build a Docker image. For a production service we advise to setup automatic builds, but here we will build it locally. You can choose any name, but we will call ours 'say-hello-service'.

From the root of your microservice folder execute the following command:
```bash
docker build -t say-hello-service .
```

Add the newly built service to your application stack in `docker-compose.yml`
```yml
version: ...
services:
  ...
  say-hello:
    image: say-hello-service
```

Launch the new container in your app
```bash
docker-compose up -d say-hello
```

### Attach the Chrome debugger
Requires: 'Develop in a mu.semte.ch stack'.

When running in development mode, you can attach the Chrome debugger to your microservice and add breakpoints as you're used to.  The chrome debugger requires port 9229 to be forwarded, and your service to run in development mode.  After launching your service, open Google Chrome or Chromium, and visit [chrome://inspect/](chrome://inspect/). Once the service is launched, a remote target on localhost should pop up.

Update your service definition in `docker-compose.yml` as follows:

```yml
version: ...
services:
  your-microservice-name:
    ...
    ports:
      - 9229:9229
```

Next, recreate the container by executing
```bash
docker-compose up -d your-microservice-name
```

### Accessing your microservice directly
Requires: 'Build a microservice based on mu-javascript-template' or 'Develop in a mu.semte.ch stack'

If you doubt your requests are arriving at your microservice correctly, you can publish it port to access it directly. In the example below, port 8888 is used to access the service directly.

Note this means you will not have the headers set by the identifier and dispatcher.

Update your service definition in `docker-compose.yml` as follows:

```yml
    your-microservice-name:
      ...
      ports:
        - 8888:80
```

Next, recreate the container by executing
```bash
docker-compose up -d your-microservice-name
```

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
  - `HOST` (default: `0.0.0.0`): The hostname you want the service to bind to.
  - `PORT` (default: `80`): The port you want the service to bind to


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

### Handling Delta's
If you are building a reactive service that should execute certain logic based on changes in the database, you want to hook it up to the [delta-notifier](https://github.com/mu-semtech/delta-notifier/). Some extra steps need to be taken to properly handle delta's, specifically the route handling delta's will need to use a specific bodyParser. 

The default bodyParser provided by the template will only accept `application/vnd.api+json` and the delta-notifier is sending `application/json` content. Aside from that the body of a delta message may be very large, often several megabytes. By specifying the bodyParser on the route accepting delta messages you can easily modify it when required.

An example
```js 
// app.js
import bodyParser from 'body-parser';
// ...

app.post("/delta-updates", bodyParser.json({limit: '50mb'}), async function(req, res) {
//...
}
```

