import SC2 from 'sparql-client-2';

SC2.SparqlClient = class SparqlClientDep extends SC2.SparqlClient {
  constructor(...args) {
    if ( args[0] === "MAGIC_STRING_ALLOW_SPARQL_CLIENT" ) {
      super(...args.slice(1));
    } else {
      super(...arguments);
      if ( ["true", "yes", "on"].includes( (process.env["ALLOW_SPARQL_CLIENT_2"] || "").toLowerCase()) ) {
        console.warn("Using sparql-client-2, please upgrade.");
      } else {
        console.error("Rejecting use of sparql-client-2.  This dependency is deprecated and is not part of the public interface of this template.  You most likely need the newer constructs this template offers.  If you do need it, add it to your package.json and set the ALLOW_SPARQL_CLIENT_2 environment variable to \"true\".  Another deprecation warning will keep showing on each use.");
        throw "Cannot start, set ALLOW_SPARQL_CLIENT_2 environment variable to true to override"
      }
    }
  }
}
