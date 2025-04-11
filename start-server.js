import { app } from "mu";
import "./app.js";
var port = process.env.PORT || "80";
var hostname = process.env.HOST || "0.0.0.0";
// start server
app.listen(port, hostname, function () {
  console.log(
    `Starting server on ${hostname}:${port} in ${app.get("env")} mode`
  );
});
