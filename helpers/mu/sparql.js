import httpContext from 'express-http-context';
import SC2 from 'sparql-client-2';
import env from 'env-var';
import { createNamespace } from 'cls-hooked';

const { SparqlClient, SPARQL } = SC2;

const LOG_SPARQL_QUERIES = process.env.LOG_SPARQL_QUERIES != undefined ? env.get('LOG_SPARQL_QUERIES').asBool() : env.get('LOG_SPARQL_ALL').asBool();
const LOG_SPARQL_UPDATES = process.env.LOG_SPARQL_UPDATES != undefined ? env.get('LOG_SPARQL_UPDATES').asBool() : env.get('LOG_SPARQL_ALL').asBool();
const LOG_SPARQL_RESULTS = env.get('LOG_SPARQL_RESULTS').asBool();
const DEBUG_AUTH_HEADERS = env.get('DEBUG_AUTH_HEADERS').asBool();
const DEFAULT_MU_AUTH_SCOPE = process.env.DEFAULT_MU_AUTH_SCOPE;

const CONTEXTUAL_QUERY = createNamespace('contextualQuery');
const DEFAULT_NAMESPACE_KEY = 'contextualQueryDefaultNamespaceKey';
const ALLOWED_GROUPS_PREFIX = 'allowedGroups_';
const SCOPE_PREFIX = 'scope_';

function scopeName(name) { return `${SCOPE_PREFIX}${name}`; }
function allowedGroupsName(name) { return `${ALLOWED_GROUPS_PREFIX}${name}`; }

function setAllowedGroups(allowedGroups, name = DEFAULT_NAMESPACE_KEY) {
  setAllowedGroupsHeader(JSON.stringify(allowedGroups), name);
}

function setCurrentAllowedGroups(name = DEFAULT_NAMESPACE_KEY) {
  setAllowedGroupsHeader(httpContext.get('request')?.get('mu-auth-allowed-groups'), name);
}

function setAllowedGroupsHeader(allowedGroups, name = DEFAULT_NAMESPACE_KEY) {
  CONTEXTUAL_QUERY.set(allowedGroupsName(name), allowedGroups);
}

function getAllowedGroupsHeader(name = DEFAULT_NAMESPACE_KEY) {
  return CONTEXTUAL_QUERY.get(allowedGroupsName(name));
}

function getAllowedGroups(name = DEFAULT_NAMESPACE_KEY) {
  return JSON.parse(getAllowedGroupsHeader(name));
}

function setScope(scope, name = DEFAULT_NAMESPACE_KEY) {
  CONTEXTUAL_QUERY.set(scopeName(name), scope);
}

function getScope(name = DEFAULT_NAMESPACE_KEY) {
  return CONTEXTUAL_QUERY.get(scopeName(name));
}

//==-- Usage (contextual query) --==//
// First import `CONTEXTUAL_QUERY`. Call `CONTEXTUAL_QUERY.run(() => contextedFunction())`
// with the function that should be run inside one context.
// use `CONTEXTUAL_QUERY.runAndReturn(() => contextedFunction())` to return the value returned by `contextedFunction()`.
// Inside this context, use `setAllowedGroupsHeader(allowedGroupsAsJsonString)` to set the allowed groups.
//                      use `setScopeHeader(scopeAsString)` to set the scope.
// Use the provided `update` and `query` functions that will query with these allowed groups.
//
// If you want to do queries with different allowed groups/scopes in the same context, use `setAllowedGroupsHeader(allowedGroupsString, name)`
// and `update(query, name)` and `query(query, name)`. With `name` a defined constant.
//
// Can also be used for enhanced regular query/update function.
// Can pass an options object to set the following values (overrides values set in context of namespace).
// - name: namespace key to use (instead of the default)
// - sudo: should it be a query sudo (send header for sudo query)
// - allowedGroups: allowed groups (as array) to set in the header
// - allowedGroupsHeader: allowed groups, already serialized to directly set as the header
// - scope: scope to set as header

//==-- logic --==//

function newSparqlClient(userOptions = {}) {
  const {
    name = DEFAULT_NAMESPACE_KEY,
    sudo,
    allowedGroups,
    allowedGroupsHeader,
    scope
  } = userOptions;

  let options = { requestDefaults: { headers: { } } };

  if (sudo === true) {
    if (env.get('ALLOW_MU_AUTH_SUDO').asBool()) {
      options.requestDefaults.headers['mu-auth-sudo'] = 'true';
    } else {
      throw 'Error, sudo request but service lacks ALLOW_MU_AUTH_SUDO header';
    }
  } else {
    options.requestDefaults.headers['mu-auth-sudo'] = 'false';
  }

  if (httpContext.get('request')) {
    options.requestDefaults.headers['mu-session-id'] = httpContext.get('request').get('mu-session-id');
    options.requestDefaults.headers['mu-call-id'] = httpContext.get('request').get('mu-call-id');
  } 

  const resolvedAllowedGroupsHeader =
    allowedGroupsHeader ||
    (allowedGroups && JSON.stringify(allowedGroups)) ||
    getAllowedGroupsHeader(name) ||
    httpContext.get('request')?.get('mu-auth-allowed-groups');

  if (resolvedAllowedGroupsHeader) {
    options.requestDefaults.headers['mu-auth-allowed-groups'] = resolvedAllowedGroupsHeader;
  }

  const namespaceScope = getScope(name);
  const scopeHeader = scope || namespaceScope || DEFAULT_MU_AUTH_SCOPE;
  if (scopeHeader) {
    options.requestDefaults.headers['mu-auth-scope'] = scopeHeader;
  }

  if (DEBUG_AUTH_HEADERS) {
    console.log(`Namespace used for contextual query: ${name}`);
    console.log(`Headers set on SPARQL client: ${JSON.stringify(options)}`);
  }

  return new SparqlClient(process.env.MU_SPARQL_ENDPOINT, options);
}

/**
 * @typedef {Object} QueryOptions
 * @property {boolean?} sudo Execute the query as sudo
 * @property {string?} scope URI of the scope with whith the query is executed.  Use the environment variable `DEFAULT_MU_AUTH_SCOPE` if possible.
 */

/**
 * Execute a sparql QUERY.  Intended for use with QUERY and ASK.
 *
 * See environment variables for logging: `LOG_SPARQL_ALL`, `LOG_SPARQL_QUERIES`, `DEBUG_AUTH_HEADERS`
 *
 * @param { string } queryString SPARQL query as a string.
 * @param { QueryOptions? } options Operational changes to the SPARQL query.
 * @return { Promise<object?> } The response is returned as a parsed JSON object, or null if the response could not be parsed as JSON.
 */
function query( queryString, options ) {
  if (LOG_SPARQL_QUERIES) {
    console.log(queryString);
  }
  return executeQuery(queryString, options);
};

/**
 * Execute a sparql QUERY.
 * Intended for use with `DELETE {} INSERT {} WHERE {}`, `INSERT DATA` and `DELETE DATA`.
 *
 * See environment variables for logging: `LOG_SPARQL_ALL`, `LOG_SPARQL_UPDATES`, `DEBUG_AUTH_HEADERS`
 *
 * @param { string } queryString SPARQL query as a string.
 * @param { QueryOptions? } options Operational changes to the SPARQL query.
 * @return { Promise<object?> } The response is returned as a parsed JSON object, or null if the response could not be parsed as JSON.
 */
function update( queryString, options ) {
  if (LOG_SPARQL_UPDATES) {
    console.log(queryString);
  }
  return executeQuery(queryString, options);
};

function executeQuery( queryString, options ) {
  return newSparqlClient(options || {}).query(queryString).executeRaw().then(response => {
    const temp = httpContext;

    if (httpContext.get('response') && !httpContext.get('response').headersSent) {
      // set mu-auth-allowed-groups on outgoing response
      const allowedGroups = response.headers['mu-auth-allowed-groups'];
      if (allowedGroups) {
        httpContext.get('response').setHeader('mu-auth-allowed-groups', allowedGroups);
        if (DEBUG_AUTH_HEADERS) {
          console.log(`Update mu-auth-allowed-groups to ${allowedGroups}`);
        }
      } else {
        httpContext.get('response').removeHeader('mu-auth-allowed-groups');
        if (DEBUG_AUTH_HEADERS) {
          console.log('Remove mu-auth-allowed-groups');
        }
      }

      // set mu-auth-used-groups on outgoing response
      const usedGroups = response.headers['mu-auth-used-groups'];
      if (usedGroups) {
        httpContext.get('response').setHeader('mu-auth-used-groups', usedGroups);
        if (DEBUG_AUTH_HEADERS) {
          console.log(`Update mu-auth-used-groups to ${usedGroups}`);
        }
      } else {
        httpContext.get('response').removeHeader('mu-auth-used-groups');
        if (DEBUG_AUTH_HEADERS) {
          console.log('Remove mu-auth-used-groups');
        }
      }
    }

    function maybeParseJSON(body) {
      // Catch invalid JSON
      try {
        return JSON.parse(body);
      } catch (ex) {
        return null;
      }
    }

    if (LOG_SPARQL_RESULTS) {
      console.log(`Query results: ${response.body}`);
    }

    return maybeParseJSON(response.body);
  });
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
 * Escapes a date string or date object into an xsd:dateTime for use in a SPARQL.
 *
 * @param { Date | string | number } value Date representation (understood by `new Date`) to convert.
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

/**
 * Escapes a value based on the supplide type rather than the separately published functions.  Prefer to use the
 * functions.
 *
 * @param { "string"|"uri"|"bool"|"decimal"|"int"|"float"|"date"|"dateTime"} type The value to be escaped.
 * @param {*} value The value to be escaped.
 * @return { string } Boolean representation for SPARQL query.
 */
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
  newSparqlClient: newSparqlClient,
  SPARQL: SPARQL,
  sparql: SPARQL,
  query: query,
  update: update,
  CONTEXTUAL_QUERY: CONTEXTUAL_QUERY,
  setAllowedGroups: setAllowedGroups,
  setCurrentAllowedGroups: setCurrentAllowedGroups,
  setAllowedGroupsHeader: setAllowedGroupsHeader,
  getAllowedGroupsHeader: getAllowedGroupsHeader,
  getAllowedGroups: getAllowedGroups,
  setScope: setScope,
  getScope: getScope,
  sparqlEscape: sparqlEscape,
  sparqlEscapeString: sparqlEscapeString,
  sparqlEscapeUri: sparqlEscapeUri,
  sparqlEscapeDecimal: sparqlEscapeDecimal,
  sparqlEscapeInt: sparqlEscapeInt,
  sparqlEscapeFloat: sparqlEscapeFloat,
  sparqlEscapeDate: sparqlEscapeDate,
  sparqlEscapeDateTime: sparqlEscapeDateTime,
  sparqlEscapeBool: sparqlEscapeBool
}
export default exports;

export {
  newSparqlClient,
  SPARQL as SPARQL,
  SPARQL as sparql,
  query,
  update,
  CONTEXTUAL_QUERY,
  setAllowedGroups,
  setCurrentAllowedGroups,
  setAllowedGroupsHeader,
  getAllowedGroupsHeader,
  getAllowedGroups,
  setScope,
  getScope,
  sparqlEscape,
  sparqlEscapeString,
  sparqlEscapeUri,
  sparqlEscapeDecimal,
  sparqlEscapeInt,
  sparqlEscapeFloat,
  sparqlEscapeDate,
  sparqlEscapeDateTime,
  sparqlEscapeBool
};
