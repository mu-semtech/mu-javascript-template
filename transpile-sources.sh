#!/bin/bash
source ./helpers.sh

####
#### BUILDS SOURCES
####
#### Expects sources to be in /usr/src/app/ with the app in
#### /usr/src/app/app/ and stores the resulting build in /usr/src/dist

cd /usr/src/

# Clean starting state
rm -Rf /usr/src/dist

# Prepare the build folder
mkdir /usr/src/dist
cd /usr/src/dist

# Copy template (/usr/src/app/) and app (/usr/src/app/app/) sources
# without package.json, which we want to skip as it would conflict
# building sources.
cp -R /usr/src/app/app/* /usr/src/dist/
rm -f /usr/src/dist/package.json

## CoffeeScript
##
## Coffeescript is transpiled ready for nodejs.  This is then moved into
## app so we have the javascript available which other preprocessors may
## expect to exist.
##
## In order to transpile correctly we need the node_modules for babel and the
## babelrc file.  We temporarily move those around.
cp /usr/src/app/babel.config.json /usr/src/dist/
cp -R /usr/src/app/node_modules/ /usr/src/dist/

# make the build and move to coffeescript-transpilation `-m` for external sourcemaps `-M` for inlined maps.  Hence -m -M
# will generate both.
/usr/src/app/node_modules/.bin/coffee -M --compile -t .

# clean up
rm -Rf /usr/src/dist/node_modules
rm /usr/src/dist/babel.config.json

## TypeScript and ES6
##
## Transpiles TypeScript and ES6 to something nodejs wants to run.
#
# --source-maps both would give both separate sourcemaps and inline sourcemaps but makes Chromium unhappy.  Set to
# inline to only get inline sourcemaps and make Chromium happy.  Set to true to get external sourcemaps.
/usr/src/app/node_modules/.bin/babel \
  . \
  --out-dir . \
  --source-maps inline \
  --config-file "/usr/src/app/babel.config.json" \
  --extensions ".ts,.js"

##############
# Node modules
##############

## merged template and app modules with mu module
docker-rsync /usr/src/app/app/node_modules /usr/src/dist/
docker-rsync /usr/src/app/app/package.json /usr/src/dist/package.json

cd /usr/src/
