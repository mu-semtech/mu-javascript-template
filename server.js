// NOTE: this will register the app directory to the module path. It will
// allows writing imports like:
//
//   import sparql from 'helpers/sparql'
//
import 'app-module-path/register'

import Hapi from 'hapi'
import request from 'request'
import src from './src'
import SparqlHttp from 'sparql-http-client'

if (process.env.MU_SPARQL_ENDPOINT === undefined) {
  throw new Error('missing environment variable MU_SPARQL_ENDPOINT')
}

const server = new Hapi.Server()
server.connection({ port: process.env.PORT || 3000 })

server.register([
  {
    register: require('good'),
    options: {
      reporters: [{
        reporter: require('good-console'),
        events: {
          response: '*',
          log: process.env.NODE_ENV === 'production' ? 'info' : '*'
        }
      }]
    }
  },
  {
    register: require('hapi-sparql'),
    options: {
      request: SparqlHttp.requestModuleRequest(request),
      endpointUrl: process.env.MU_SPARQL_ENDPOINT
    }
  },
  src
], (err) => {
  if (err) {
    throw err
  }

  server.start((err) => {
    if (err) {
      throw err
    }
    server.log('info', 'Server running at: ' + server.info.uri)
  })
})
