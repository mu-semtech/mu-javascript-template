#!/bin/sh

# create a copy of app, so we can modify as necessary
cp -a /app /usr/src/output

# add some required files from the template
cp -a /usr/src/app/.babelrc.js /usr/src/app/helpers /usr/src/output/
# merge package.json files, prefering whatever is specified in the app
jq -s '.[0] * .[1]' /usr/src/app/package.json  /app/package.json > /usr/src/output/package.json

# do things
cd /usr/src/output
npm install
exec npm test
