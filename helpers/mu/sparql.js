import SC2 from 'sparql-client-2';
const { SparqlClient, SPARQL } = SC2;

//==-- logic --==//

// builds a new sparqlClient
function newSparqlClient() {
  return new SparqlClient( process.env.MU_SPARQL_ENDPOINT ).register({
    mu: 'http://mu.semte.ch/vocabularies/',
    muCore: 'http://mu.semte.ch/vocabularies/core/',
    muExt: 'http://mu.semte.ch/vocabularies/ext/'
  });
}

// executes a query (you can use the template syntax)
function query( queryString ){
  return newSparqlClient().query( queryString ).execute();
};

// executes an update query
const update = query;

function sparqlEscapeString( value ){
  return '"' + value.replace(/[\\"']/, function(match) { return '\\' + match }) + '"';
};

function sparqlEscapeUri( value ){
  return '<' + value.replace(/[\\"']/, function(match) { return '\\' + match }) + '>';
};

function sparqlEscapeInt( value ){
  return '"' + Number.parseInt(value) + '"^^xsd:integer';
};

function sparqlEscapeFloat( value ){
  return '"' + Number.parseFloat(value) + '"^^xsd:float';
};

function sparqlEscapeDate( value ){
  return '"' + new Date(value).toISOString() + '"^^xsd:date';
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

