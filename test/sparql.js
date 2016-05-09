import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import nock from 'nock'
import {
  endpoint, constructQuery, selectQuery, updateQuery, isStringEscaped,
  isVariable, isPrefixedName, isIRI, escapeString, escapeDate, escapeBoolean
} from '../src/sparql'
import parallel from 'mocha.parallel'
import request from 'request'

chai.use(chaiAsPromised)
const expect = chai.expect

parallel('sparql helper module', () => {
  before(() => {
    endpoint.request = (method, url, headers, body, callback) => {
      return request({method, url, headers, body, timeout: 100}, callback)
    }
  })

  after(nock.cleanAll)

  it('makes promise for CONSTRUCT query', () => {
    const scope = nock(endpoint.endpointUrl)
      .get('?query=CONSTRUCT')
      .times(2)
      .reply()

    return Promise.all([
      expect(constructQuery('CONSTRUCT'))
        .to.eventually.be.fulfilled,
      expect(constructQuery('CONSTRUCT', {accept: 'something'}))
        .to.eventually.be.fulfilled
        .to.eventually.have.deep.property('req.headers.accept', 'something')
    ]).then(() => expect(scope.isDone()).to.be.ok)
  })

  it('makes promise for SELECT query', () => {
    const scope = nock(endpoint.endpointUrl)
      .get('?query=SELECT')
      .times(2)
      .reply()

    return Promise.all([
      expect(selectQuery('SELECT'))
        .to.eventually.be.fulfilled,
      expect(selectQuery('SELECT', {accept: 'something'}))
        .to.eventually.be.fulfilled
        .to.eventually.have.deep.property('req.headers.accept', 'something')
    ]).then(() => expect(scope.isDone()).to.be.ok)
  })

  it('makes promise for UPDATE query', () => {
    const scope = nock(endpoint.endpointUrl)
      .post('')
      .times(2)
      .reply()

    return Promise.all([
      expect(updateQuery('UPDATE'))
        .to.eventually.be.fulfilled
        .to.eventually.have.deep.property('request.body', 'query=UPDATE'),
      expect(updateQuery('UPDATE', {accept: 'something'}))
        .to.eventually.be.fulfilled
        .to.eventually.have.deep.property('req.headers.accept', 'something')
    ]).then(() => expect(scope.isDone()).to.be.ok)
  })

  it('fails sometime with a timeout', () => {
    const scope = nock(endpoint.endpointUrl)
      .get(/\/sparql/)
      .socketDelay(1000)
      .reply()

    return expect(selectQuery('SELECT'))
      .to.eventually.be.rejected
      .to.eventually.have.deep.property('code', 'ESOCKETTIMEDOUT')
      .then(() => expect(scope.isDone()).to.be.ok)
  })

  it('validates if SPARQL strings are correctly escaped', () => {
    expect(isStringEscaped('"well escaped"')).to.be.ok
    expect(isStringEscaped('\'well escaped\'')).to.be.ok
    expect(isStringEscaped('"""well escaped"""')).to.be.ok
    expect(isStringEscaped('\'\'\'well escaped\'\'\'')).to.be.ok
    expect(isStringEscaped('"harmful"string"')).to.be.not.ok
    expect(isStringEscaped('\'harmful\'string\'')).to.be.not.ok
    expect(isStringEscaped('"""harmful"""string"""')).to.be.not.ok
    expect(isStringEscaped('\'\'\'harmful\'\'\'string\'\'\'')).to.be.not.ok
    expect(isStringEscaped('"harmful\nstring"')).to.be.not.ok
    expect(isStringEscaped('\'harmful\\string\'')).to.be.not.ok
    expect(isStringEscaped('"""well\nescaped"""')).to.be.ok
    expect(isStringEscaped('"""harmful\\string"""')).to.be.not.ok
  })

  it('validates SPARQL variables', () => {
    expect(isVariable('?good_variable')).to.be.ok
    expect(isVariable('$good_variable')).to.be.ok
    expect(isVariable('?1')).to.be.ok
    expect(isVariable('?bad-variable')).to.be.not.ok
  })

  it('validates SPARQL prefixed names', () => {
    expect(isPrefixedName(':')).to.be.ok
    expect(isPrefixedName('valid-pn:')).to.be.ok
    expect(isPrefixedName('valid_pn:')).to.be.ok
    expect(isPrefixedName('-invalid-pn:')).to.be.not.ok
    expect(isPrefixedName('valid.pn:')).to.be.ok
    expect(isPrefixedName('invalid-pn.:')).to.be.not.ok
    expect(isPrefixedName(':valid-pn')).to.be.ok
    expect(isPrefixedName(':-invalid-pn')).to.be.not.ok
    expect(isPrefixedName(':valid:pn')).to.be.ok
    expect(isPrefixedName(':valid.pn')).to.be.ok
    expect(isPrefixedName(':valid_pn')).to.be.ok
    expect(isPrefixedName(':invalid.pn.')).to.be.not.ok
    expect(isPrefixedName(':valid.pn:')).to.be.ok
    expect(isPrefixedName(':valid.pn%ff')).to.be.ok
    expect(isPrefixedName(':invalid.pn%gg')).to.be.not.ok
    expect(isPrefixedName(':valid.pn\\$')).to.be.ok
    expect(isPrefixedName(':valid.pn\\.')).to.be.ok
  })

  it('validates SPARQL IRI', () => {
    expect(isIRI('<http://example.org>')).to.be.ok
    expect(isIRI('valid-iri:')).to.be.ok
    expect(isIRI('-invalid-iri:')).to.be.not.ok
    expect(isIRI('<http://bad.example.org>>')).to.be.not.ok
    expect(isIRI('<http://bad.example.org{>')).to.be.not.ok
    expect(isIRI('<http://good.example.org/[]>')).to.be.ok
    expect(isIRI('<http://bad.example.org/\\>')).to.be.not.ok
    expect(isIRI('<http://bad.example.org/ >')).to.be.not.ok
  })

  it('can escapes strings', () => {
    expect(escapeString('foo')).to.be.equal('"foo"')
  })

  it('can escapes dates', () => {
    const now = new Date(Date('now'))
    expect(escapeDate(now)).to.be.equal(`"${now.toISOString()}"^^xsd:dateTime`)
  })

  it('can escapes booleans', () => {
    expect(escapeBoolean(false)).to.be.equal('false')
    expect(escapeBoolean(true)).to.be.equal('true')
  })
})
