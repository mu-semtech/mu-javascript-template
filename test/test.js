import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import Hapi from 'hapi'
import nock from 'nock'
import parallel from 'mocha.parallel'
import src from '../src'
import {endpoint} from 'helpers/sparql'

chai.use(chaiAsPromised)
const expect = chai.expect

/*
 * NOTE: you should use parallel here and not describe, otherwise the
 * injections will not work properly.
 *
 * See https://github.com/hapijs/hapi/issues/1299
 *
 */

parallel('mu-semtech-template', () => {
  let server
  const endpointUrl = 'http://mu.semte.ch/application'
  const request = (method, url, headers, content, callback) => {
    callback(null, {
      headers: {
        'content-type': 'application/json'
      },
      body: {method, url, headers, content},
      statusCode: 200
    })
  }
  const plugins = [
    {
      register: require('hapi-sparql'),
      options: {
        request,
        endpointUrl
      }
    },
    src
  ]

  before(async () => {
    server = new Hapi.Server({debug: {request: []}})
    server.connection({})
    await server.register(plugins)
      .then((err) => {
        expect(err).to.be.not.ok
      })
  })

  after(nock.cleanAll)

  it('constructs', () => {
    return expect(server.inject('/construct?o=ok'))
      .to.eventually.be.fulfilled
      .to.eventually.have.deep.property('result.url')
      .to.eventually.be.equal(
        'http://mu.semte.ch/application?query=' +
        encodeURIComponent('CONSTRUCT {$s $p $o} WHERE {?s ?p "ok"}'))
  })

  it('enables creating custom handler', () => {
    const scope = nock(endpoint.endpointUrl)
      .get(/\?query=/)
      .reply(200, ['some', 'data'])
    return expect(server.inject('/custom'))
      .to.eventually.be.fulfilled
      .to.eventually.have.deep.property('result.data')
      .to.eventually.be.equal(['some', 'data'])
      .then(() => expect(scope.isDone()).to.be.ok)
  })

  it('enables custom handler to fail sometimes', () => {
    const scope = nock(endpoint.endpointUrl)
      .get(/\?query=/)
      .reply(400, 'private bad request message')
    return expect(server.inject('/custom'))
      .to.eventually.be.fulfilled
      .to.eventually.have.deep.property('result')
      .to.eventually.be.equal({
        error: 'Internal Server Error',
        message: 'An internal server error occurred',
        statusCode: 500
      })
      .then(() => expect(scope.isDone()).to.be.ok)
  })
})
