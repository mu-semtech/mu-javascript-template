import app from './server';
import sparql from './sparql';

const mu = {
  app: app,
  sparql: sparql,
  SPARQL: sparql.sparql,
  query: sparql.query,
  update: sparql.update,
}

const SPARQL = mu.SPARQL, query = mu.query, update = mu.update;

export { app , sparql, SPARQL, query, update };
export default mu;
