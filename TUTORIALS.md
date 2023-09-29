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
