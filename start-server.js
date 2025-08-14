import { app, exitHandler } from 'mu';
import './app.js'; // load the user's app

var port = process.env.PORT || '80';
var hostname = process.env.HOST || '0.0.0.0';

// start server
console.log('yes, it changed');
const server = app.listen(port, hostname, function () {
  console.log(`Starting server on ${hostname}:${port} in ${app.get('env')} mode`);
});

// faster stopping
process.on('SIGTERM', async () => {
  console.log('SIGTERM received');
  await exitHandler(server);
  process.exit(0);
});
process.on('SIGINT', async () => {
  console.log('SIGINT received');
  await exitHandler(server);
  process.exit(0);
});
