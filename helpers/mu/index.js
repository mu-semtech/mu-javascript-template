import { app, errorHandler, beforeExit, exitHandler, setExitHandler } from './server.js';
import sparql from './sparql.js';
import { SPARQL, query, update, sparqlEscape, sparqlEscapeString, sparqlEscapeUri, sparqlEscapeDecimal, sparqlEscapeInt, sparqlEscapeFloat, sparqlEscapeDate, sparqlEscapeDateTime, sparqlEscapeBool } from './sparql.js';
import { v1 as uuidV1 } from 'uuid';

// generates a uuid
const uuid = uuidV1;

const mu = {
  app,
  sparql,

  uuid,
  errorHandler,
  beforeExit,
  exitHandler,
  setExitHandler,

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
  sparqlEscapeBool
};

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
  errorHandler,
  beforeExit,
  exitHandler,
  setExitHandler
};

export default mu;
