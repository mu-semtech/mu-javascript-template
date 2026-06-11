import httpContext from 'express-http-context';
import env from 'env-var';
import SPARQL from './sparql-tag.js';

const LOG_SPARQL_QUERIES = process.env.LOG_SPARQL_QUERIES != undefined ? env.get('LOG_SPARQL_QUERIES').asBool() : env.get('LOG_SPARQL_ALL').asBool();
const LOG_SPARQL_UPDATES = process.env.LOG_SPARQL_UPDATES != undefined ? env.get('LOG_SPARQL_UPDATES').asBool() : env.get('LOG_SPARQL_ALL').asBool();
const DEBUG_AUTH_HEADERS = env.get('DEBUG_AUTH_HEADERS').asBool();
const MU_SPARQL_ENDPOINT = process.env.MU_SPARQL_ENDPOINT || 'http://database:8890/sparql';

//==-- logic --==//

/**
 * Execute a sparql QUERY.  Intended for use with SELECT and ASK.
 *
 * See environment variables for logging: `LOG_SPARQL_ALL`, `LOG_SPARQL_QUERIES`, `DEBUG_AUTH_HEADERS`
 *
 * @param { string } queryString SPARQL query as a string.
 * @param { QueryOptions? } options Operational changes to the SPARQL query.
 * @return { Promise<object?> } The response is returned as a parsed JSON object, or null if the response could not be parsed as JSON.
 */
function query(queryString, options = {}) {
  if (LOG_SPARQL_QUERIES) {
    console.log(queryString);
  }
  return executeQuery(queryString, options);
}

/**
 * Execute a sparql UPDATE.
 * Intended for use with `DELETE {} INSERT {} WHERE {}`, `INSERT DATA` and `DELETE DATA`.
 *
 * See environment variables for logging: `LOG_SPARQL_ALL`, `LOG_SPARQL_UPDATES`, `DEBUG_AUTH_HEADERS`
 *
 * @param { string } queryString SPARQL query as a string.
 * @param { QueryOptions? } options Operational changes to the SPARQL query.
 * @return { Promise<object?> } The response is returned as a parsed JSON object, or null if the response could not be parsed as JSON.
 */
function update(queryString, options = {}) {
  if (LOG_SPARQL_UPDATES) {
    console.log(queryString);
  }
  return executeQuery(queryString, options);
}

/**
 * Build the default headers for a SPARQL request from the current HTTP
 * context, forwarding mu-auth headers so mu-authorization can apply the
 * correct access rules.
 */
function defaultHeaders() {
  const headers = new Headers();
  headers.set('content-type', 'application/x-www-form-urlencoded');
  headers.set('Accept', 'application/sparql-results+json');

  const req = httpContext.get('request');
  if (req) {
    const muSessionId = req.get('mu-session-id');
    if (muSessionId) headers.set('mu-session-id', muSessionId);

    const muCallId = req.get('mu-call-id');
    if (muCallId) headers.set('mu-call-id', muCallId);

    // Forward allowed-groups from the incoming request so mu-authorization
    // does not have to recompute them on every SPARQL call.
    const allowedGroups = req.get('mu-auth-allowed-groups');
    if (allowedGroups) headers.set('mu-auth-allowed-groups', allowedGroups);
  }

  const res = httpContext.get('response');
  if (res) {
    // If a previous SPARQL query within this request already resolved the
    // allowed groups, forward them to avoid redundant lookups.
    const allowedGroups = res.get('mu-auth-allowed-groups');
    if (allowedGroups) headers.set('mu-auth-allowed-groups', allowedGroups);
  }

  return headers;
}

/**
 * @typedef {Object} QueryOptions
 * @property {boolean?} sudo Execute the query with mu-auth-sudo privileges.
 * @property {string?}  scope URI of the scope to use.  Falls back to the DEFAULT_MU_AUTH_SCOPE environment variable.
 * @property {object?}  extraHeaders Additional headers to include in the request.
 */

/**
 * Send a SPARQL query to the configured endpoint and return the parsed JSON
 * response.
 *
 * @param { string } queryString SPARQL query as a string.
 * @param { QueryOptions? } options Operational changes to the SPARQL query.
 * @return { Promise<object?> } The response is returned as a parsed JSON object, or null if the response could not be parsed as JSON.
 */
async function executeQuery(queryString, options = {}) {
  const headers = defaultHeaders();

  const extraHeaders = options.extraHeaders ?? {};
  for (const key of Object.keys(extraHeaders)) {
    headers.append(key, extraHeaders[key]);
  }

  if (options.sudo === true) {
    if (env.get('ALLOW_MU_AUTH_SUDO').asBool()) {
      headers.set('mu-auth-sudo', 'true');
    } else {
      throw new Error('sudo query requested but ALLOW_MU_AUTH_SUDO is not set');
    }
  }

  if (options.scope) {
    headers.set('mu-auth-scope', options.scope);
  } else if (process.env.DEFAULT_MU_AUTH_SCOPE) {
    headers.set('mu-auth-scope', process.env.DEFAULT_MU_AUTH_SCOPE);
  }

  if (DEBUG_AUTH_HEADERS) {
    const muHeaders = Array.from(headers.entries())
      .filter(([key]) => key.startsWith('mu-'))
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
    console.log(`SPARQL request mu-headers: ${muHeaders}`);
  }

  const formData = new URLSearchParams();
  formData.set('query', queryString);

  try {
    const response = await fetch(MU_SPARQL_ENDPOINT, {
      method: 'POST',
      body: formData.toString(),
      headers,
    });

    updateResponseHeaders(response);

    if (!response.ok) {
      throw new Error(`SPARQL endpoint returned HTTP ${response.status} ${response.statusText}`);
    }

    return await maybeJSON(response);
  } catch (ex) {
    console.log(`Failed Query:
${queryString}`);
    throw ex;
  }
}

/**
 * Copy mu-auth group headers from the SPARQL response back onto the outgoing
 * HTTP response so the client receives up-to-date group information.
 */
function updateResponseHeaders(response) {
  const res = httpContext.get('response');
  if (!res || res.headersSent) return;

  const allowedGroups = response.headers.get('mu-auth-allowed-groups');
  if (allowedGroups) {
    res.setHeader('mu-auth-allowed-groups', allowedGroups);
    if (DEBUG_AUTH_HEADERS) console.log(`Forwarded mu-auth-allowed-groups: ${allowedGroups}`);
  } else {
    res.removeHeader('mu-auth-allowed-groups');
    if (DEBUG_AUTH_HEADERS) console.log('Removed mu-auth-allowed-groups from response');
  }

  const usedGroups = response.headers.get('mu-auth-used-groups');
  if (usedGroups) {
    res.setHeader('mu-auth-used-groups', usedGroups);
    if (DEBUG_AUTH_HEADERS) console.log(`Forwarded mu-auth-used-groups: ${usedGroups}`);
  } else {
    res.removeHeader('mu-auth-used-groups');
    if (DEBUG_AUTH_HEADERS) console.log('Removed mu-auth-used-groups from response');
  }
}

async function maybeJSON(response) {
  try {
    return await response.json();
  } catch (_) {
    return null;
  }
}

/**
 * Escapes a string for use in SPARQL.
 *
 * Wraps the string in quotes and escapes necessary characters.
 *
 * @param {string} value String to be escaped.
 * @return {string} Escaped string for use in SPARQL.
 */
function sparqlEscapeString( value ){
  return '"""' + value.replace(/[\\"]/g, function(match) { return '\\' + match; }) + '"""';
};

/**
 * Escapes a URI for use in SPARQL.
 *
 * Wraps the URI in < and > and escapes necessary characters.
 *
 * @param {string} value URI string to be escaped.
 * @return {string} Escaped URI string for use in SPARQL.
 */
function sparqlEscapeUri( value ){
  return '<' + value.replace(/[\\"<>]/g, function(match) { return '\\' + match; }) + '>';
};

/**
 * Escapes a float for use in SPARQL as xsd:decimal.
 *
 * @param {string|number} value Number string or value to be escaped.
 * @return {string} Escaped number for use in SPARQL.
 */
function sparqlEscapeDecimal( value ){
  return '"' + Number.parseFloat(value) + '"^^xsd:decimal';
};

/**
 * Escapes an integer for use in SPARQL as xsd:integer.
 *
 * @param {string|number} value Number string or value to be escaped.
 * @return {string} Escaped number for use in SPARQL.
 */
function sparqlEscapeInt( value ){
  return '"' + Number.parseInt(value) + '"^^xsd:integer';
};

/**
 * Escapes a number for use in SPARQL as xsd:float.
 *
 * @param {string|number} value Number string or value to be escaped.
 * @return {string} Escaped number for use in SPARQL.
 */
function sparqlEscapeFloat( value ){
  return '"' + Number.parseFloat(value) + '"^^xsd:float';
};

/**
 * Escapes a date string or date object into an xsd:date for use in SPARQL.
 *
 * @param {string|Date|number} value Number string or value to be escaped.
 * @return {string} Escaped number for use in SPARQL.
 */
function sparqlEscapeDate( value ){
  return '"' + new Date(value).toISOString().substring(0, 10) + '"^^xsd:date'; // only keep 'YYYY-MM-DD' portion of the string
};

/**
 * Escape date string or date object into an xsd:dateTime for use in a SPARQL string.
 *
 * @param { Date | string | number } value Date representation
 * (understood by `new Date`) to convert.
 * @return { string } Date representation for SPARQL query.
 */
function sparqlEscapeDateTime( value ){
  return '"' + new Date(value).toISOString() + '"^^xsd:dateTime';
};

/**
 * Escape boolean-like value into xsd:boolean for use in a SPARQL string.
 *
 * @param { any } value Boolean-like value, anything javascript finds truethy is true.
 * @return { string } Boolean representation for SPARQL query.
 */
function sparqlEscapeBool( value ){
  return value ? '"true"^^xsd:boolean' : '"false"^^xsd:boolean';
};

function sparqlEscape( value, type ){
  switch(type) {
  case 'string':
    return sparqlEscapeString(value);
  case 'uri':
    return sparqlEscapeUri(value);
  case 'bool':
    return sparqlEscapeBool(value);
  case 'decimal':
    return sparqlEscapeDecimal(value);
  case 'int':
    return sparqlEscapeInt(value);
  case 'float':
    return sparqlEscapeFloat(value);
  case 'date':
    return sparqlEscapeDate(value);
  case 'dateTime':
    return sparqlEscapeDateTime(value);
  default:
    console.error(`WARN: Unknown escape type '${type}'. Escaping as string`);
    return sparqlEscapeString(value);
  }
}

//==-- exports --==//
const exports = {
  SPARQL,
  sparql: SPARQL,
  query,
  update,
  sparqlEscape,
  sparqlEscapeString,
  sparqlEscapeUri,
  sparqlEscapeDecimal,
  sparqlEscapeInt,
  sparqlEscapeFloat,
  sparqlEscapeDate,
  sparqlEscapeDateTime,
  sparqlEscapeBool,
};
export default exports;

export {
  SPARQL as SPARQL,
  SPARQL as sparql,
  query,
  update,
  sparqlEscape,
  sparqlEscapeString,
  sparqlEscapeUri,
  sparqlEscapeDecimal,
  sparqlEscapeInt,
  sparqlEscapeFloat,
  sparqlEscapeDate,
  sparqlEscapeDateTime,
  sparqlEscapeBool,
};
