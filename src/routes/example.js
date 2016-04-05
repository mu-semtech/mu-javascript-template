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

export default [selectExample, constructExample]
