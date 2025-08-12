import { app, getExitHandler } from 'mu';
import './app.js'; // load the user's app

var port = process.env.PORT || '80';
var hostname = process.env.HOST || '0.0.0.0';

// start server
const server = app.listen(port, hostname, function () {
  console.log(`Starting server on ${hostname}:${port} in ${app.get('env')} mode`);
});

// faster stopping
process.on('SIGTERM', () => {
  getExitHandler()(server)
});
process.on('SIGINT', () => {
  getExitHandler()(server);
});
