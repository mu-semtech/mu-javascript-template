import request from 'request'
import SparqlHttp from 'sparql-http-client'

const endpointUrl = process.env.MU_SPARQL_ENDPOINT !== undefined
    ? process.env.MU_SPARQL_ENDPOINT
    : 'http://database:8890/sparql'

export const endpoint = new SparqlHttp({
  request: SparqlHttp.requestModuleRequest(request),
  endpointUrl: endpointUrl,
  updateUrl: endpointUrl
})

function requestCallback (resolve, reject) {
  return (err, res) => {
    if (err) {
      reject(err)
    } else if (res.statusCode >= 300) {
      const err = new Error(`${res.statusCode} ${res.statusMessage}`)
      err.result = res
      reject(err)
    } else {
      resolve(res)
    }
  }
}

export function constructQuery (query, options) {
  return new Promise((resolve, reject) => {
    endpoint.constructQuery(query, requestCallback(resolve, reject), options)
  })
}

export function selectQuery (query, options) {
  return new Promise((resolve, reject) => {
    endpoint.selectQuery(query, requestCallback(resolve, reject), options)
  })
}

export function updateQuery (query, options) {
  return new Promise((resolve, reject) => {
    endpoint.updateQuery(query, requestCallback(resolve, reject), options)
  })
}
