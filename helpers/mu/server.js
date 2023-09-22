import httpContext from 'express-http-context';
import express from 'express';
import bodyParser from 'body-parser';

var app = express();

var port = process.env.PORT || '80';
var hostname = process.env.HOST || '0.0.0.0';
var bodySizeLimit = process.env.MAX_BODY_SIZE || '100kb';

// parse JSONAPI content type
app.use(bodyParser.json({
  type: function(req) { return /^application\/vnd\.api\+json/.test(req.get('content-type')); },
  limit: bodySizeLimit
}));
app.use(bodyParser.urlencoded({ extended: false }));

// set JSONAPI content type
app.use('/', function(req, res, next) {
  res.type('application/vnd.api+json');
  next();
});

app.use(httpContext.middleware);

app.use(function(req, res, next) {
  httpContext.set('request', req);
  httpContext.set('response', res);
  next();
});

const errorHandler = function(err, req, res, next) {
  res.status(err.status || 400);
  res.json({
    errors: [ {title: err.message} ]
  });
};

// start server
const server = app.listen( port, hostname, function() {
  console.log(`Starting server on ${hostname}:${port} in ${app.get('env')} mode`);
});

// faster stopping
let exitHandler = function(server) {
  console.debug("Preparing to shut down");
  server.close( () => {
    console.debug("Shut down complete");
  });
};

/**
 * Sets a new handler for shutting down the server.
 *
 * @arg functor Function taking one argument (the result of app.listen
 * when starting the server) which should gracefully stop the server.
 */
function setExitHandler(functor) {
  exitHandler = functor;
}

process.on('SIGTERM', () => exitHandler(server) );
process.on('SIGINT', () => exitHandler(server) );

export default app;

export {
  app,
  errorHandler,
  setExitHandler
}
