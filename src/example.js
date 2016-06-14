import Joi from 'joi'
import { selectQuery, graph } from 'helpers/sparql'
import util from 'util'

export default [
  {
    method: 'GET',
    path: '/construct',
    handler: {
      'sparql': {
        type: 'construct',
        query: 'CONSTRUCT {$s $p $o} WHERE {?s ?p ?o}'
      }
    },
    config: {
      validate: {
        query: {
          'o': Joi.string()
        }
      }
    }
  },

  {
    method: 'GET',
    path: '/custom',
    handler: {async: async (request, reply) => {
      let result
      result = await selectQuery(`SELECT * FROM <${graph}> WHERE {?s ?p ?o}`)
      const jsonResult = JSON.parse(result.body)
      request.server.log('info', 'reply: ' +
        util.inspect(jsonResult, {colors: true, depth: null}))
      return reply({
        data: jsonResult
      })
    }}
  }
]
