import httpContext from 'express-http-context';
import SC2 from 'sparql-client-2';
const { SparqlClient, SPARQL } = SC2;

//==-- logic --==//

// builds a new sparqlClient
function newSparqlClient() {
  let options = { requestDefaults: { headers: { } } };

  if (httpContext.get('request')) {
    options.requestDefaults.headers['mu-session-id'] = httpContext.get('request').get('mu-session-id');
    options.requestDefaults.headers['mu-call-id'] = httpContext.get('request').get('mu-call-id');
    options.requestDefaults.headers['mu-auth-allowed-groups'] = httpContext.get('request').get('mu-auth-allowed-groups'); // groups of incoming request
  }

  if (httpContext.get('response')) {
    const allowedGroups = httpContext.get('response').get('mu-auth-allowed-groups'); // groups returned by a previous SPARQL query
    if (allowedGroups)
      options.requestDefaults.headers['mu-auth-allowed-groups'] = allowedGroups;
  }

  console.log(`Headers set on SPARQL client: ${JSON.stringify(options)}`);

  return new SparqlClient(process.env.MU_SPARQL_ENDPOINT, options).register({
    mu: 'http://mu.semte.ch/vocabularies/',
    muCore: 'http://mu.semte.ch/vocabularies/core/',
    muExt: 'http://mu.semte.ch/vocabularies/ext/'
  });
}

// executes a query (you can use the template syntax)
function query( queryString ) {
  console.log(queryString);
  return newSparqlClient().query(queryString).executeRaw().then(response => {
    const temp = httpContext;
    if (httpContext.get('response') && !httpContext.get('response').headersSent) {
      // set mu-auth-allowed-groups on outgoing response
      const allowedGroups = response.headers['mu-auth-allowed-groups'];
      if (allowedGroups) {
        httpContext.get('response').setHeader('mu-auth-allowed-groups', allowedGroups);
        console.log(`Update mu-auth-allowed-groups to ${allowedGroups}`);
      } else {
        httpContext.get('response').removeHeader('mu-auth-allowed-groups');
        console.log('Remove mu-auth-allowed-groups');
      }

      // set mu-auth-used-groups on outgoing response
      const usedGroups = response.headers['mu-auth-used-groups'];
      if (usedGroups) {
        httpContext.get('response').setHeader('mu-auth-used-groups', usedGroups);
        console.log(`Update mu-auth-used-groups to ${usedGroups}`);
      } else {
        httpContext.get('response').removeHeader('mu-auth-used-groups');
        console.log('Remove mu-auth-used-groups');
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

    return maybeParseJSON(response.body);
  });
};

// executes an update query
const update = query;

function sparqlEscapeString( value ){
  return '"' + value.replace(/[\\"']/g, function(match) { return '\\' + match; }) + '"';
};

function sparqlEscapeUri( value ){
  return '<' + value.replace(/[\\"']/g, function(match) { return '\\' + match; }) + '>';
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
  newSparqlClient,
  SPARQL as SPARQL,
  SPARQL as sparql,
  query,
  update,
  sparqlEscape,
  sparqlEscapeString,
  sparqlEscapeUri,
  sparqlEscapeInt,
  sparqlEscapeFloat,
  sparqlEscapeDate,
  sparqlEscapeDateTime,
  sparqlEscapeBool
};

