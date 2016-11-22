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

// start server
app.listen( 80, function() {
  console.log('Starting server on port 80');
});

export default app;
