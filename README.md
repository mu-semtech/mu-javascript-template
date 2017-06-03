# Mu Javascript template

Template for writing mu.semte.ch services in JavaScript using [Express 4](https://expressjs.com/)

## Getting started

Create a new folder.  Add the following Dockerfile:

    FROM semtech/mu-javascript-template
    MAINTAINER Aad Versteden <madnificent@gmail.com>

Create your microservice in `app.js`:

    import { app, query } from 'mu';
    
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

Check [Express' Getting Started guide](https://expressjs.com/en/starter/basic-routing.html) to learn how to build a REST API in Express.
    
## Requirements

  - **database link**: You need a link to the `database` which exposes a SPARQL endpoint on `http://database:8890/sparql`.  In line with other microservices.

## Imports

The following importable variables are available:

  - `app`: The [Express application](https://expressjs.com/en/guide/routing.html) on which routes can be added
  - `query(query) => Promise`: Function for sending queries to the triplestore
  - `update(query) => Promise`: Function for sending updates to the triplestore
  - `uuid()` => string: Generates a random UUID
  - `sparql`: [Template tag](https://www.npmjs.com/package/sparql-client-2#using-the-sparql-template-tag) to create queries with interpolated values
  - `sparqlEscapeString(value) => string`: Function to escape a string in SPARQL
  - `sparqlEscapeUri(value) => string`: Function to escape a URI in SPARQL
  - `sparqlEscapeInt(value) => string`: Function to escape an integer in SPARQL
  - `sparqlEscapeFloat(value) => string`: Function to escape a float in SPARQL
  - `sparqlEscapeDate(value) => string`: Function to escape a date in SPARQL
  - `sparqlEscapeDateTime(value) => string`: Function to escape a datetime in SPARQL
  - `sparqlEscapeBool(value) => string`: Function to escape a boolean in SPARQL
  - `sparqlEscape(value, type) => string`: Function to escape a value in SPARQL according to the given type. Type must be one of `'string'`, `'uri'`, `'int'`, `'float'`, `'date'`, `'dateTime'`, `'bool'`.  

You can either import specific attributes from the mu library, or import the whole mu object.

An example of importing specific variables:

    import { app, query } from 'mu';
    
    app.get('/', function( req, res ) {
      res.send('Hello mu-javascript-template');
    } );

An example of importing the whole library:

    import mu from 'mu';
    
    mu.app.get('/', function( req, res ) {
      res.send('Hello using full import');
    } );

## Dependencies

You can install additional dependencies by including a `package.json` file next to your `app.js`. It works as you would expect: just define the packages in the `dependencies` section of the `package.json`. They will be installed automatically at build time. 

## Developing with the template

When developing, you can use the template image, mount the volume with your sources in `/app` and add a link to the database. Set the `NODE_ENV` environment variable to `development`. The service will live-reload on changes. You'll need to restart the container when you define additional dependencies in your `package.json`.

    docker run --link virtuoso:database \
           -v `pwd`:/app \
           -p 8888:80 \
           -e NODE_ENV=development \
           --name my-js-test \
           semtech/mu-javascript-template


