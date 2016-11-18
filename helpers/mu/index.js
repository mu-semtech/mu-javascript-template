import express from 'express';

var app = express();

app.listen( 80, function() {
  console.log('Starting server on port 80');
});

export default app;
