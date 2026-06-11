/**
 * RDF Term types for use in SPARQL template literal interpolation.
 *
 * This software incorporates code derived from node-sparql-client
 * (https://github.com/eddieantonio/node-sparql-client), MIT License.
 *
 * Adapted from the original: merged into a single ESM file to eliminate
 * circular module dependencies, and modernised to ES2015 class syntax.
 */

// ── Term (abstract base) ─────────────────────────────────────────────────────

class Term {
  format() {
    throw new Error("term MUST implement a #format method!");
  }
}

// ── IRI ──────────────────────────────────────────────────────────────────────

class IRI extends Term {
  /**
   * Creates an IRI from a string or a single-key object {prefix: localname}.
   */
  static create(value) {
    if (typeof value === "string") return new IRIReference(value);
    if (typeof value === "object" && value !== null) return IRI.createFromObject(value);
    throw new TypeError("Invalid IRI: expected string or object, got " + typeof value);
  }

  static createFromObject(object) {
    const keys = Object.keys(object);
    if (keys.length !== 1) throw new Error("Invalid prefixed IRI: object must have exactly one key.");
    const namespace = keys[0];
    const local = object[namespace];
    if (typeof local !== "string") throw new TypeError("Invalid prefixed IRI: local name must be a string.");
    if (!/^[^\s;.,<|$]+$/.test(local)) throw new Error("Invalid IRI identifier: " + local);
    return new PrefixedNameIRI(namespace, local);
  }
}

class PrefixedNameIRI extends IRI {
  constructor(namespace, id) {
    super();
    this.namespace = namespace;
    this.id = id;
  }

  format() {
    return this.namespace + ":" + this.id;
  }
}

class IRIReference extends IRI {
  constructor(iri) {
    super();
    /* Reject characters forbidden in IRIREF per SPARQL 1.1 spec:
     * < > " { } | ^ backtick backslash and codepoints 0x00-0x20 */
    if (/[<>"{}|^`\\]/.test(iri) || [...iri].some(ch => ch.codePointAt(0) <= 0x20)) {
      throw new Error("Invalid IRI: " + iri);
    }
    this.iri = iri;
  }

  format() {
    return "<" + this.iri + ">";
  }
}

// ── Literal ──────────────────────────────────────────────────────────────────

const SPARQL_LITERAL_PATTERNS = {
  boolean: /^true$|^false$/,
  integer: /^[-+]?[0-9]+$/,
  double: /^[-+]?(?:[0-9]+\.[0-9]*|\.[0-9]+|[0-9]+)[eE][+-]?[0-9]+$/,
  decimal: /^[-+]?[0-9]*\.[0-9]+$/,
};

class Literal extends Term {
  constructor(value, datatype) {
    super();
    this.value = "" + value;
    if (datatype !== undefined) {
      this.datatype = IRI.create(datatype);
    }
  }

  static create(value) {
    return new StringLiteral(value);
  }

  static createWithLanguageTag(value, languageTag) {
    if (typeof languageTag !== "string") {
      throw new TypeError("Language tag must be a string.");
    }
    return new StringLiteral(value, languageTag);
  }

  /** @deprecated Use createWithLanguageTag (fixes typo in original API name). */
  static createWithLangaugeTag(value, languageTag) {
    return Literal.createWithLanguageTag(value, languageTag);
  }

  static createWithDataType(value, datatype) {
    if (datatype === undefined) throw new TypeError("Undefined datatype provided.");
    return new Literal(value, datatype);
  }

  format() {
    if (isKnownXsdDatatype(this.datatype)) {
      const term = tryFormatXsdType(this.value, this.datatype.id);
      if (term !== undefined) {
        return term.wrapAsString
          ? formatStringWithDataType(term.literal, this.datatype)
          : term.literal;
      }
    }
    return formatStringWithDataType(this.value, this.datatype);
  }
}

class StringLiteral extends Literal {
  constructor(value, languageTag) {
    super(value);
    if (languageTag !== undefined) {
      if (!/^[a-zA-Z]+(?:-[a-zA-Z0-9]+)*$/.test(languageTag)) {
        throw new Error("Invalid language tag: " + languageTag);
      }
      this.languageTag = languageTag;
    }
  }

  format() {
    const str = formatRDFString(this.value);
    return this.languageTag !== undefined ? str + "@" + this.languageTag : str;
  }
}

function isKnownXsdDatatype(iri) {
  return iri != null && iri.namespace === "xsd" && iri.id in SPARQL_LITERAL_PATTERNS;
}

function tryFormatXsdType(value, type) {
  const stringified = "" + value;
  if (type === "double") {
    if (Math.abs(+value) === Infinity) {
      return { literal: (value < 0 ? "-" : "") + "INF", wrapAsString: true };
    }
    if (SPARQL_LITERAL_PATTERNS.double.test(stringified)) return { literal: stringified };
    const withExponent = stringified + "e0";
    if (SPARQL_LITERAL_PATTERNS.double.test(withExponent)) return { literal: withExponent };
    return undefined;
  }
  if (SPARQL_LITERAL_PATTERNS[type].test(stringified)) return { literal: stringified };
}

/**
 * Formats a string value as a SPARQL RDF literal.
 * Uses triple double-quotes to support newlines and most special characters;
 * only backslash and embedded triple-quote sequences need escaping.
 */
function formatRDFString(value) {
  const str = "" + value;
  const escaped = str
    .replace(/\\/g, "\\\\")
    .replace(/"""/g, '""\\"');
  return '"""' + escaped + '"""';
}

function formatStringWithDataType(value, datatype) {
  const str = formatRDFString(value);
  return datatype !== undefined ? str + "^^" + datatype.format() : str;
}

// ── Term.create ───────────────────────────────────────────────────────────────

const KNOWN_XSD_DATATYPES = { boolean: 1, decimal: 1, double: 1, integer: 1 };

Term.create = function create(value, options) {
  if (options) return createTerm(Object.assign({}, options, { value }));
  return createTerm(value);
};

function createTerm(value) {
  const rawValue = value == null ? value : value.valueOf();
  if (rawValue === null || rawValue === undefined) {
    throw new TypeError("Cannot bind null or undefined value");
  }
  const type = typeof rawValue;
  switch (type) {
    case "string":  return Literal.create(rawValue);
    case "number":  return Literal.createWithDataType(rawValue, { xsd: "double" });
    case "boolean": return Literal.createWithDataType(rawValue, { xsd: "boolean" });
    case "object":  return createTermFromObject(rawValue);
  }
  throw new TypeError("Cannot bind " + type + " value: " + value);
}

function createTermFromObject(object) {
  if (Object.keys(object).length === 1) return IRI.createFromObject(object);

  const { value } = object;
  if (value === undefined) {
    throw new Error(
      "Binding must contain a `value` property. " +
      "To bind a URI, write { value: 'http://...', type: 'uri' }."
    );
  }

  resolveDataTypeShortcuts(object);

  if (object.type === "uri")             return IRI.create(value);
  if (object.lang !== undefined)         return Literal.createWithLanguageTag(value, object.lang);
  if (object["xml:lang"] !== undefined)  return Literal.createWithLanguageTag(value, object["xml:lang"]);
  if (object.datatype !== undefined)     return Literal.createWithDataType(value, object.datatype);

  throw new Error("Could not bind object: " + JSON.stringify(object));
}

function resolveDataTypeShortcuts(object) {
  const TERM_TYPES = { bnode: 1, literal: 1, uri: 1 };
  const { type } = object;
  if (type === undefined || type in TERM_TYPES) return;
  object.datatype = type in KNOWN_XSD_DATATYPES ? { xsd: type } : type;
  object.type = "literal";
}

export default Term;
