import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import Hapi from 'hapi'
import nock from 'nock'
import parallel from 'mocha.parallel'
import routes from '../src/routes'
import {endpoint} from '../src/sparql'

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
  after(nock.cleanAll)

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
  const plugin = {
    register: require('hapi-sparql'),
    options: {
      request,
      endpointUrl
    }
  }

  it('selects', (done) => {
    const server = new Hapi.Server()
    server.connection({})
    server.register(plugin, (err) => {
      expect(err).to.be.not.ok
      server.route(routes)
      server.inject('/select', (res) => {
        expect(res.statusCode).to.be.equal(200)
        expect(res.result.method).to.be.equal('GET')
        done()
      })
    })
  })

  it('constructs', (done) => {
    const server = new Hapi.Server()
    server.connection({})
    server.register(plugin, (err) => {
      expect(err).to.be.not.ok
      server.route(routes)
      server.inject('/select', (res) => {
        expect(res.statusCode).to.be.equal(200)
        expect(res.result.method).to.be.equal('GET')
        done()
      })
    })
  })

  it('enables creating custom handler', () => {
    const scope = nock(endpoint.endpointUrl)
      .get(/\?query=/)
      .reply(200, ['some', 'data'])
    const server = new Hapi.Server()
    server.connection({})
    server.route(routes[2])
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
    const server = new Hapi.Server({debug: {request: []}})
    server.connection({})
    server.route(routes[2])
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
