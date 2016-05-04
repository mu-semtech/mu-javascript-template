import Joi from 'joi'
import { selectQuery } from '../sparql'
import util from 'util'
import Boom from 'boom'

const graph = process.env.MU_APPLICATION_GRAPH !== undefined
  ? process.env.MU_APPLICATION_GRAPH
  : 'http://mu.semte.ch/application'

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
    handler: async (request, reply) => {
      let result
      try {
        result = await selectQuery(
          `SELECT * FROM <${graph}> WHERE {?s ?p ?o}`)
      } catch (e) {
        return reply(Boom.badImplementation(
          `Received ${e.result.statusCode} ${e.result.statusMessage}: ` +
          e.result.body))
      }
      const jsonResult = JSON.parse(result.body)
      request.server.log('info', 'reply: ' +
        util.inspect(jsonResult, {colors: true, depth: null}))
      return reply({
        data: jsonResult
      })
    }
  }
]
