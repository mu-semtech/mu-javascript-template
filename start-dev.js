//this is so relative file paths work for things like fs
//this has no effect on import/require statements because js is "fun"
process.chdir("./app");
require("./app/app.js");