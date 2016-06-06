import example from './example'

function register (server, options, next) {
  server.route(example)
  next()
}

register.attributes = {
  name: 'example'
}

export default register
