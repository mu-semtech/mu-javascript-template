import { app, errorHandler } from './server';
import sparql from './sparql';
import { v1 as uuidV1 } from 'uuid';

// generates a uuid
const uuid = uuidV1;

const mu = {
  app: app,
  sparql: sparql,
  SPARQL: sparql.sparql,
  query: sparql.query,
  update: sparql.update,
  sparqlEscape: sparql.sparqlEscape,
  sparqlEscapeString: sparql.sparqlEscapeString,
  sparqlEscapeUri: sparql.sparqlEscapeUri,
  sparqlEscapeDecimal: sparql.sparqlEscapeDecimal,
  sparqlEscapeInt: sparql.sparqlEscapeInt,
  sparqlEscapeFloat: sparql.sparqlEscapeFloat,
  sparqlEscapeDate: sparql.sparqlEscapeDate,
  sparqlEscapeDateTime: sparql.sparqlEscapeDateTime,
  sparqlEscapeBool: sparql.sparqlEscapeBool,
  uuid,
  errorHandler
};

const SPARQL = mu.SPARQL,
      query = mu.query,
      update = mu.update,
      sparqlEscape = mu.sparqlEscape,
      sparqlEscapeString = mu.sparqlEscapeString,
      sparqlEscapeUri = mu.sparqlEscapeUri,
      sparqlEscapeInt = mu.sparqlEscapeInt,
      sparqlEscapeDecimal = mu.sparqlEscapeDecimal,
      sparqlEscapeFloat = mu.sparqlEscapeFloat,
      sparqlEscapeDate = mu.sparqlEscapeDate,
      sparqlEscapeDateTime = mu.sparqlEscapeDateTime,
      sparqlEscapeBool = mu.sparqlEscapeBool;

export {
  app,
  sparql,
  SPARQL,
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
  uuid,
  errorHandler
};

export default mu;
