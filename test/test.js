import {expect} from 'chai'
import Hapi from 'hapi'
import parallel from 'mocha.parallel'
import routes from '../src/routes'

/*
 * NOTE: you should use parallel here and not describe, otherwise the
 * injections will not work properly.
 *
 * See https://github.com/hapijs/hapi/issues/1299
 *
 */

parallel('mu-semtech-template', () => {
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

  it('enables creating custom handler', (done) => {
    const customRequest = (method, url, headers, content, callback) => {
      callback(null, {
        headers: {
          'content-type': 'application/json'
        },
        body: '{"status": "ok"}',
        statusCode: 200
      })
    }
    const server = new Hapi.Server()
    server.connection({})
    server.register({
      ...plugin,
      options: {
        ...plugin.options,
        request: customRequest
      }
    }, (err) => {
      expect(err).to.be.not.ok
      server.route(routes)
      server.inject('/custom', (res) => {
        expect(res.statusCode).to.be.equal(200)
        expect(res.result.status).to.be.ok
        done()
      })
    })
  })
})
