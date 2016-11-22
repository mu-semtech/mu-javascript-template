import express from 'express';
import bodyParser from 'body-parser';

var app = express();

// parse JSONAPI content type
app.use(bodyParser.json( { type: function(req) { return /^application\/vnd\.api\+json/.test(req.get('content-type')); } } ));
app.use(bodyParser.urlencoded({ extended: false }));

// set JSONAPI content type
app.use('/', function(req, res, next) {
  res.type('application/vnd.api+json');
  next();
});

// development error handler - printing stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 400);
    res.json({
      errors: [ {title: err.message} ]
    });
  });
}

// production error handler - no stacktrace
app.use(function(err, req, res, next) {
  res.status(err.status || 400);
  res.json({
    errors: [ {title: err.message} ]
  });
});

// start server
app.listen( 80, function() {
  console.log('Starting server on port 80');
});

export default app;
