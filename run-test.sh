#!/bin/sh

# create a copy of app, so we can modify as necessary
cp -a /app /usr/src/out

# add some required files from the template
cp -a /usr/src/app/.babelrc.js /usr/src/app/helpers /usr/src/out/
# merge package.json files, prefering whatever is specified in the app
jq -s '.[0] * .[1]' /usr/src/app/package.json  /app/package.json > /usr/src/out/package.json

# do things
cd /usr/src/out
npm install
npm test
