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

When developing, you can use the template image, mount the volume with your sources on `/app` and add a link to the database. The service will live-reload on changes. You'll need to restart the container when you define additional dependencies in your `package.json`.

    docker run --link virtuoso:database \
           -v `pwd`:/app \
           -p 8888:80 \
           --name my-js-test \
           semtech/mu-javascript-template


