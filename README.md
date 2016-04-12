Mu Hapi Template
================

Template for running Hapi microservices.

Synopsis
--------

Route examples are provided in `src/routes/example.js`

```javascript
import util from 'util'

if (process.env.MU_APPLICATION_GRAPH === undefined) {
  throw new Error('missing environment variable MU_APPLICATION_GRAPH')
}

const graph_iri = process.env.MU_APPLICATION_GRAPH

const selectExample = {
  method: 'GET',
  path: '/select',
  handler: {
    'sparql': {
      type: 'select',
      query: `SELECT * FROM <${graph_iri}> WHERE {?s ?p ?o}`,
      placeholders: [
        's', 'p', 'o'
      ]
    }
  }
}

const constructExample = {
  method: 'GET',
  path: '/construct',
  handler: {
    'sparql': {
      type: 'construct',
      query: 'CONSTRUCT {?s ?p ?o} WHERE {?s ?p ?o}',
      placeholders: [
        's', 'p', 'o'
      ]
    }
  }
}

const customHandlerExample = {
  method: 'GET',
  path: '/custom',
  handler: (request, reply) => {
    const endpoint = request.server.plugins['hapi-sparql'].endpoint
    endpoint.selectQuery(
      `SELECT * FROM <${graph_iri}> WHERE {?s ?p ?o}`, (err, result) => {
        if (err) {
          throw err
        }
        const jsonResult = JSON.parse(result.body)
        request.server.log('info', 'reply: ' +
          util.inspect(jsonResult, {colors: true, depth: null}))
        reply(jsonResult)
      })
  }
}

export default [selectExample, constructExample, customHandlerExample]
```
