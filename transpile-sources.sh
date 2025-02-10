#!/bin/bash
source ./helpers.sh

####
#### BUILDS SOURCES
####
#### Expects sources to be in /usr/src/app/ with the app in
#### /usr/src/app/app/ and stores the resulting build in /usr/src/build

# Clean starting state
rm -Rf /usr/src/processing /usr/src/build

# Copy template (/usr/src/app/) and app (/usr/src/app/app/) sources
# without package.json, which we want to skip as it would conflict
# building sources.

cp -R /usr/src/app /usr/src/processing
rm -f /usr/src/processing/app/package.json


## CoffeeScript
##
## Coffeescript is transpiled ready for nodejs.  This is then moved into
## app so we have the javascript available which other preprocessors may
## expect to exist.
##
## In order to generate the sourcemaps correctly, it seems we have to be
## next to the folder where we want the sources to land, but in order to
## transpile correctly we also need the node_modules for babel and the
## babelrc file.  We temporarily move those around.

cd /usr/src/

# prepare the build folders
mkdir /usr/src/build
cp -R /usr/src/processing/app/* /usr/src/build/
cp /usr/src/processing/babel.config.json /usr/src/build/
cp -R /usr/src/processing/node_modules/ /usr/src/build/

# make the build and move to coffeescript-transpilation `-m` for external sourcemaps `-M` for inlined maps.  Hence -m -M
# will generate both.
cd /usr/src/build
/usr/src/app/node_modules/.bin/coffee -M --compile -t .
cd /usr/src

# clean up
rm -Rf /usr/src/build/node_modules
rm /usr/src/build/babel.config.json

## TypeScript and ES6
##
## Transpiles TypeScript and ES6 to something nodejs wants to run.
cd /usr/src/build

# We don't need the --config-file option but this helps discovery
#
# --source-maps both would give both separate sourcemaps and inline sourcemaps but makes Chromium unhappy.  Set to
# inline to only get inline sourcemaps and make Chromium happy.  Set to true to get external sourcemaps.
/usr/src/app/node_modules/.bin/babel \
  ./ \
  --out-dir ./ \
  --source-maps inline \
  --config-file "/usr/src/app/babel.config.json" \
  --extensions ".ts,.js"

##############
# Node modules
##############
cd /usr/src/processing/

## merged template and app modules with mu module
docker-rsync /usr/src/app/app/node_modules /usr/src/build/
docker-rsync /usr/src/app/app/package.json /usr/src/build/package.json

cd /usr/src/
