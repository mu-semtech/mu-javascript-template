import { app, errorHandler, beforeExit, exitHandler, setExitHandler } from './server.js';
import sparql from './sparql.js';
import { SPARQL, query, update, sparqlEscape, sparqlEscapeString, sparqlEscapeUri, sparqlEscapeDecimal, sparqlEscapeInt, sparqlEscapeFloat, sparqlEscapeDate, sparqlEscapeDateTime, sparqlEscapeBool } from './sparql.js';
import { createCounter, createGauge, createHistogram, createSummary, registerMetric, getMetrics, metricsHandler, serializeJsonLD } from './metrics.js';
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
  sparqlEscapeBool,

  createCounter,
  createGauge,
  createHistogram,
  createSummary,
  registerMetric,
  getMetrics,
  metricsHandler,
  serializeJsonLD
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
  setExitHandler,
  createCounter,
  createGauge,
  createHistogram,
  createSummary,
  registerMetric,
  getMetrics,
  metricsHandler,
  serializeJsonLD
};

export default mu;
