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


//==-- exports --==//
const exports = {
  newSparqlClient: newSparqlClient,
  SPARQL: SPARQL,
  sparql: SPARQL,
  query: query,
  update: update
}
export default exports;

export { query, update, SPARQL as SPARQL, SPARQL as sparql, newSparqlClient };

