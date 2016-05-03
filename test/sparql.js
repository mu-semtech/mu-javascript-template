import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import nock from 'nock'
import {
  endpoint, constructQuery, selectQuery, updateQuery
} from '../src/sparql'
import parallel from 'mocha.parallel'

chai.use(chaiAsPromised)
const expect = chai.expect

parallel('sparql helper module', () => {
  after(nock.cleanAll)

  it('makes promise for CONSTRUCT query', () => {
    const scope = nock(endpoint.endpointUrl)
      .get('?query=CONSTRUCT1')
      .reply()
      .get('?query=CONSTRUCT2')
      .reply()

    return Promise.all([
      expect(constructQuery('CONSTRUCT1'))
        .to.eventually.be.fulfilled,
      expect(constructQuery('CONSTRUCT2', {accept: 'something'}))
        .to.eventually.be.fulfilled
        .to.eventually.have.deep.property('req.headers.accept', 'something')
    ]).then(() => expect(scope.isDone()).to.be.ok)
  })

  it('makes promise for SELECT query', () => {
    const scope = nock(endpoint.endpointUrl)
      .get('?query=SELECT1')
      .reply()
      .get('?query=SELECT2')
      .reply()

    return Promise.all([
      expect(selectQuery('SELECT1'))
        .to.eventually.be.fulfilled,
      expect(selectQuery('SELECT2', {accept: 'something'}))
        .to.eventually.be.fulfilled
        .to.eventually.have.deep.property('req.headers.accept', 'something')
    ]).then(() => expect(scope.isDone()).to.be.ok)
  })

  it('makes promise for UPDATE query', () => {
    const scope = nock(endpoint.endpointUrl)
      .post('')
      .reply()
      .post('')
      .reply()

    return Promise.all([
      expect(updateQuery('UPDATE1'))
        .to.eventually.be.fulfilled
        .to.eventually.have.deep.property('request.body', 'query=UPDATE1'),
      expect(updateQuery('UPDATE2', {accept: 'something'}))
        .to.eventually.be.fulfilled
        .to.eventually.have.deep.property('req.headers.accept', 'something')
    ]).then(() => expect(scope.isDone()).to.be.ok)
  })
})
