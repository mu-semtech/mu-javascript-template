import httpContext from 'express-http-context';
import env from 'env-var';
import SPARQL from './sparql-tag';
import DigestFetch from "digest-fetch";

const LOG_SPARQL_QUERIES = process.env.LOG_SPARQL_QUERIES != undefined ? env.get('LOG_SPARQL_QUERIES').asBool() : env.get('LOG_SPARQL_ALL').asBool();
const LOG_SPARQL_UPDATES = process.env.LOG_SPARQL_UPDATES != undefined ? env.get('LOG_SPARQL_UPDATES').asBool() : env.get('LOG_SPARQL_ALL').asBool();
const DEBUG_AUTH_HEADERS = env.get('DEBUG_AUTH_HEADERS').asBool();
const MU_SPARQL_ENDPOINT = env.get('MU_SPARQL_ENDPOINT').default('http://database:8890/sparql').asString();
const RETRY = env.get('MU_QUERY_RETRY').default('false').asBool();
const RETRY_MAX_ATTEMPTS = env.get('MU_QUERY_RETRY_MAX_ATTEMPTS').default('5').asInt();
const RETRY_FOR_HTTP_STATUS_CODES = env.get('MU_QUERY_RETRY_FOR_HTTP_STATUS_CODES').default('').asArray();
const RETRY_FOR_CONNECTION_ERRORS = env.get('MU_QUERY_RETRY_FOR_CONNECTION_ERRORS').default('ECONNRESET,ETIMEDOUT,EAI_AGAIN').asArray();
const RETRY_TIMEOUT_INCREMENT_FACTOR = env.get('MU_QUERY_RETRY_TIMEOUT_INCREMENT_FACTOR').default('0.1').asFloat();

//==-- logic --==//

// executes a query (you can use the template syntax)
function query( queryString, extraHeaders = {}, connectionOptions = {} ) {
  if (LOG_SPARQL_QUERIES) {
    console.log(queryString);
  }
  return executeQuery(queryString, extraHeaders, connectionOptions);
};

// executes an update query
function update(queryString, extraHeaders = {}, connectionOptions = {}) {
  if (LOG_SPARQL_UPDATES) {
    console.log(queryString);
  }
  return executeQuery(queryString);
};


function defaultHeaders() {
  const headers = new Headers();
  headers.set("content-type", "application/x-www-form-urlencoded");
  headers.set("Accept", "application/sparql-results+json");
  if (httpContext.get("request")) {
    headers.set(
      "mu-session-id",
      httpContext.get("request").get("mu-session-id")
    );
    headers.set("mu-call-id", httpContext.get("request").get("mu-call-id"));
  }
  return headers;
}

async function executeQuery(queryString, extraHeaders = {}, connectionOptions = {}, attempt = 0)
{
  const sparqlEndpoint = connectionOptions.sparqlEndpoint ?? MU_SPARQL_ENDPOINT;
  const headers = defaultHeaders();
  for (const key of Object.keys(extraHeaders)) {
    headers.append(key, extraHeaders[key]);
  }
  if (DEBUG_AUTH_HEADERS) {
    const stringifiedHeaders = Array.from(headers.entries())
      .filter(([key]) => key.startsWith("mu-"))
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");
    console.log(`Headers set on SPARQL client: ${stringifiedHeaders}`);
  }

  try {
    // note that URLSearchParams is used because it correctly encodes for form-urlencoded
    const formData = new URLSearchParams();
    formData.set("query", queryString);
    headers.append("Content-Length", formData.toString().length.toString());

    let response;
    if (connectionOptions.authUser && connectionOptions.authPassword) {
      const client = new DigestFetch(
        connectionOptions.authUser,
        connectionOptions.authPassword,
        { basic: connectionOptions.authType === "basic" }
      );
      response = await client.fetch(sparqlEndpoint, {
        method: "POST",
        body: formData.toString(),
        headers,
      });
    } else {
      response = await fetch(sparqlEndpoint, {
        method: "POST",
        body: formData.toString(),
        headers,
      });
    }
    if (response.ok) {
      return await maybeJSON(response);
    } else {
      throw new Error(`HTTP Error Response: ${response.status} ${response.statusText}`);
    }
  } catch (ex) {
    if (mayRetry(ex, attempt, connectionOptions)) {
      attempt += 1;

      const sleepTime = nextAttemptTimeout(attempt);
      console.log(`Sleeping ${sleepTime} ms before next attempt`);
      await new Promise((r) => setTimeout(r, sleepTime));

      return await executeRawQuery(
        queryString,
        extraHeaders,
        connectionOptions,
        attempt
      );
    } else {
      console.log(`Failed Query:
                  ${queryString}`);
      throw ex;
    }
  }
}

async function maybeJSON(response) {
  try {
    return await response.json();
  } catch (e) {
    return null;
  }
}

function mayRetry(
  error,
  attempt,
  connectionOptions = {}
) {
  console.log(
    `Checking retry allowed for error: ${error} and attempt: ${attempt}`
  );

  let mayRetry = false;

  if (!(RETRY || connectionOptions.mayRetry)) {
    mayRetry = false;
  } else if (attempt < RETRY_MAX_ATTEMPTS) {
    if (error.code && RETRY_FOR_CONNECTION_ERRORS.includes(error.code)) {
      mayRetry = true;
    } else if ( error.httpStatus && RETRY_FOR_HTTP_STATUS_CODES.includes(`${error.httpStatus}`) ) {
      mayRetry = true;
    }
  }

  console.log(`Retry allowed? ${mayRetry}`);

  return mayRetry;
}

function nextAttemptTimeout(attempt) {
  // expected to be milliseconds
  return Math.round(RETRY_TIMEOUT_INCREMENT_FACTOR * Math.exp(attempt + 10));
}

function sparqlEscapeString( value ){
  return '"""' + value.replace(/[\\"]/g, function(match) { return '\\' + match; }) + '"""';
};

function sparqlEscapeUri( value ){
  return '<' + value.replace(/[\\"<>]/g, function(match) { return '\\' + match; }) + '>';
};

function sparqlEscapeDecimal( value ){
  return '"' + Number.parseFloat(value) + '"^^xsd:decimal';
};

function sparqlEscapeInt( value ){
  return '"' + Number.parseInt(value) + '"^^xsd:integer';
};

function sparqlEscapeFloat( value ){
  return '"' + Number.parseFloat(value) + '"^^xsd:float';
};

function sparqlEscapeDate( value ){
  return '"' + new Date(value).toISOString().substring(0, 10) + '"^^xsd:date'; // only keep 'YYYY-MM-DD' portion of the string
};

function sparqlEscapeDateTime( value ){
  return '"' + new Date(value).toISOString() + '"^^xsd:dateTime';
};

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
  SPARQL: SPARQL,
  sparql: SPARQL,
  query: query,
  update: update,
  sparqlEscape: sparqlEscape,
  sparqlEscapeString: sparqlEscapeString,
  sparqlEscapeUri: sparqlEscapeUri,
  sparqlEscapeInt: sparqlEscapeInt,
  sparqlEscapeFloat: sparqlEscapeFloat,
  sparqlEscapeDate: sparqlEscapeDate,
  sparqlEscapeDateTime: sparqlEscapeDateTime,
  sparqlEscapeBool: sparqlEscapeBool
}
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
  sparqlEscapeBool
};

