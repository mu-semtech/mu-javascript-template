import Term from './term.js';

/**
 * ECMAScript 2015 tagged template function for building safe SPARQL queries.
 *
 * Interpolated values are converted to their SPARQL representation using
 * Term.create so they are properly escaped and typed.
 *
 * @example
 * const name = "O'Brien";
 * const query = SPARQL`SELECT * WHERE { ?s foaf:name ${name} }`;
 * // name becomes """O'Brien"""
 */
export default function SPARQL(template, ...substitutions) {
  let result = template[0];
  substitutions.forEach((value, i) => {
    result += Term.create(value).format() + template[i + 1];
  });
  return result;
}
