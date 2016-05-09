import request from 'request'
import SparqlHttp from 'sparql-http-client'
import {
  escapeString as _escapeString, escapeDate as _escapeDate,
  escapeBoolean as _escapeBoolean
} from 'hapi-sparql/dist/escaping'

export const escapeString = _escapeString
export const escapeDate = _escapeDate
export const escapeBoolean = _escapeBoolean

// grammar from:
// https://www.w3.org/TR/2013/REC-sparql11-query-20130321/#sparqlGrammar
const ECHAR = '\\\\[tbnrf\\\\"\']'
const STRING_LITERAL1 = `'([^'\\\\\\n\\r]|${ECHAR})*'`
const STRING_LITERAL2 = `"([^"\\\\\\n\\r]|${ECHAR})*"`
const STRING_LITERAL_LONG1 = `'''(('|'')?([^'\\\\]|${ECHAR}))*'''`
const STRING_LITERAL_LONG2 = `"""(("|"")?([^"\\\\]|${ECHAR}))*"""`
// NOTE: the following grammar is incomplete
const HEX = '[a-fA-F0-9]'
const PERCENT = `%${HEX}${HEX}`
const PN_LOCAL_ESC = '\\\\[_~.\\-!$&\'()*\\+,;=/?#@%]'
const PLX = `${PERCENT}|${PN_LOCAL_ESC}`
const PN_CHARS_BASE = '[a-zA-Z]'
const PN_CHARS_U = `${PN_CHARS_BASE}|_`
const PN_CHARS = `${PN_CHARS_U}|-|[0-9]`
const PN_PREFIX = `(${PN_CHARS_BASE})((${PN_CHARS}|\\\.)*(${PN_CHARS}))?`
const PN_LOCAL = `(${PN_CHARS_U}|:|[0-9]|${PLX})((${PN_CHARS}|\\\.|:)*(${PN_CHARS}|:|${PLX}))?`
const PNAME_NS = `(${PN_PREFIX})?:`
const PNAME_LN = `(${PNAME_NS})${PN_LOCAL}`
const VARNAME = `(${PN_CHARS_U}|[0-9])+`
const VAR1 = `\\?${VARNAME}`
const VAR2 = `\\$${VARNAME}`
const IRIREF = '<([^<>{}|^\\\\\\x00-\\x20])*>'
const String = `${STRING_LITERAL1}|${STRING_LITERAL2}|${STRING_LITERAL_LONG1}|${STRING_LITERAL_LONG2}`
const Var = `${VAR1}|${VAR2}`
const PrefixedName = `${PNAME_LN}|${PNAME_NS}`
const iri = `${IRIREF}|${PNAME_NS}`

const endpointUrl = process.env.MU_SPARQL_ENDPOINT !== undefined
    ? process.env.MU_SPARQL_ENDPOINT
    : 'http://database:8890/sparql'

export const endpoint = new SparqlHttp({
  request: SparqlHttp.requestModuleRequest(request),
  endpointUrl: endpointUrl,
  updateUrl: endpointUrl
})

function promisifyQuery (queryFunc, query, options) {
  return new Promise((resolve, reject) => {
    queryFunc.call(this, query, (err, res) => {
      if (err) {
        reject(err)
      } else if (res.statusCode >= 300) {
        const err = new Error(`${res.statusCode} ${res.statusMessage}`)
        err.result = res
        reject(err)
      } else {
        resolve(res)
      }
    }, options)
  })
}

export const constructQuery =
  promisifyQuery.bind(endpoint, endpoint.constructQuery)
export const selectQuery =
  promisifyQuery.bind(endpoint, endpoint.selectQuery)
export const updateQuery =
  promisifyQuery.bind(endpoint, endpoint.updateQuery)

export function isStringEscaped (value) {
  return !!value.match(new RegExp(`^(${String})$`))
}

export function isVariable (value) {
  return !!value.match(new RegExp(`^(${Var})$`))
}

export function isPrefixedName (value) {
  return !!value.match(new RegExp(`^(${PrefixedName})$`))
}

export function isIRI (value) {
  return !!value.match(new RegExp(`^(${iri})$`))
}
