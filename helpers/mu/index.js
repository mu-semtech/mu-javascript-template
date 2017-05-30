import app from './server';
import sparql from './sparql';
import uuidV1 from 'uuid/v1';

// generates a uuid
const uuid = uuidV1;

const mu = {
  app: app,
  sparql: sparql,
  SPARQL: sparql.sparql,
  query: sparql.query,
  update: sparql.update,
  sparqlEscapeString: sparql.sparqlEscapeString,
  sparqlEscapeUri: sparql.sparqlEscapeUri,
  sparqlEscapeInt: sparql.sparqlEscapeInt,
  sparqlEscapeFloat: sparql.sparqlEscapeFloat,
  sparqlEscapeDate: sparql.sparqlEscapeDate,
  sparqlEscapeDateTime: sparql.sparqlEscapeDateTime,
  sparqlEscapeBool: sparql.sparqlEscapeBool,
  uuid: uuid
}

const SPARQL = mu.SPARQL,
      query = mu.query,
      update = mu.update,
      sparqlEscapeString = mu.sparqlEscapeString,
      sparqlEscapeUri = mu.sparqlEscapeUri,
      sparqlEscapeInt = mu.sparqlEscapeInt,
      sparqlEscapeFloat = mu.sparqlEscapeFloat,
      sparqlEscapeDate = mu.sparqlEscapeDate,
      sparqlEscapeDateTime = mu.sparqlEscapeDateTime,
      sparqlEscapeBool = mu.sparqlEscapeBool

export {
  app,
  sparql,
  SPARQL,
  query,
  update,
  sparqlEscapeString,
  sparqlEscapeUri,
  sparqlEscapeInt,
  sparqlEscapeFloat,
  sparqlEscapeDate,
  sparqlEscapeDateTime,
  sparqlEscapeBool,
  uuid
};

export default mu;
